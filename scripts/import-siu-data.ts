// Phase C — the new `db:seed`. Reads the already-transformed local dataset
// (data/siu-careers.json, produced by transform-siu-data.ts) and upserts it
// into the DB. Fast, no network calls to the SIU site, safe to re-run
// (idempotent: existing universities/areas/careers are matched, not duplicated).
//
// Safety rail: defaults to local SQLite regardless of what TURSO_DATABASE_URL
// is set to, since this is a large bulk write and `.env` currently points at
// a live shared Turso DB with no other guard in place. Pass --confirm-prod to
// actually target that shared DB.
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readFileSync, existsSync } from "fs";
import "dotenv/config";

const DATA_PATH = "data/siu-careers.json";
const LOCAL_DB_URL = "file:./prisma/dev.db";

const confirmProd = process.argv.includes("--confirm-prod");
const reset = process.argv.includes("--reset");
const targetUrl = confirmProd ? process.env.TURSO_DATABASE_URL! : LOCAL_DB_URL;

if (confirmProd && reset) {
  console.error("--reset is not allowed together with --confirm-prod (local-only safety rail).");
  process.exit(1);
}

if (confirmProd) {
  console.log(`--confirm-prod passed: targeting ${targetUrl}`);
} else {
  console.log(`Safety default: targeting local SQLite (${LOCAL_DB_URL}). Pass --confirm-prod to write to the shared Turso DB instead.`);
}
if (reset) {
  console.log("--reset passed: wiping existing universities/careers/areas/reviews/study plans before importing.");
}

const adapter = new PrismaLibSql({
  url: targetUrl,
  authToken: confirmProd ? process.env.TURSO_AUTH_TOKEN : undefined,
});
const prisma = new PrismaClient({ adapter });

interface CareerIn {
  name: string;
  degreeTitle: string;
  durationYears: number;
  modality: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
  description: string;
  studentCount: number;
  areaName: string;
}

interface UniversityIn {
  name: string;
  city: string | null;
  province: string | null;
  type: "PUBLIC" | "PRIVATE";
  website: string | null;
  careers: CareerIn[];
}

async function main() {
  if (!existsSync(DATA_PATH)) {
    console.error(`${DATA_PATH} not found. Run "npm run scrape:siu" then "npm run scrape:siu:transform" first.`);
    process.exit(1);
  }

  const { universities }: { universities: UniversityIn[] } = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  if (reset) {
    await prisma.subject.deleteMany({});
    await prisma.studyPlan.deleteMany({});
    await prisma.careerReview.deleteMany({});
    await prisma.universityReview.deleteMany({});
    await prisma.career.deleteMany({});
    await prisma.area.deleteMany({});
    await prisma.university.deleteMany({});
    console.log("Reset complete.");
  }

  // Estrategia rápida: en vez de ~2 queries por carrera (findFirst + create),
  // que para 7k+ carreras son miles de round-trips secuenciales, precargamos las
  // comprobaciones de existencia en memoria y hacemos inserciones masivas con
  // createMany por lotes. Idempotente: se saltean las carreras ya presentes.

  const areaCache = new Map<string, string>(); // areaName -> id

  // 1. Áreas: aseguramos las distintas (un puñado) y cacheamos sus ids.
  const areaNames = [...new Set(universities.flatMap((u) => u.careers.map((c) => c.areaName)))];
  for (const name of areaNames) {
    const area = await prisma.area.upsert({ where: { name }, update: {}, create: { name } });
    areaCache.set(name, area.id);
  }

  // 2. Universidades (~130): una sola lectura previa, luego create/update. Mapa name -> id.
  const existingUnis = await prisma.university.findMany();
  const uniByName = new Map(existingUnis.map((u) => [u.name, u]));
  const uniIdByName = new Map<string, string>();
  let universitiesCreated = 0;
  let universitiesUpdated = 0;

  for (const uniIn of universities) {
    const existing = uniByName.get(uniIn.name);
    if (!existing) {
      const created = await prisma.university.create({
        data: {
          name: uniIn.name,
          city: uniIn.city ?? "Desconocida",
          province: uniIn.province ?? "Desconocida",
          type: uniIn.type,
          website: uniIn.website,
        },
      });
      uniIdByName.set(uniIn.name, created.id);
      universitiesCreated++;
    } else {
      await prisma.university.update({
        where: { id: existing.id },
        data: {
          city: uniIn.city ?? existing.city,
          province: uniIn.province ?? existing.province,
          type: uniIn.type,
          website: uniIn.website ?? existing.website,
        },
      });
      uniIdByName.set(uniIn.name, existing.id);
      universitiesUpdated++;
    }
  }

  // 3. Carreras existentes -> Set de claves (una sola lectura) para idempotencia.
  const existingCareers = await prisma.career.findMany({
    select: { universityId: true, name: true, modality: true },
  });
  const seen = new Set(existingCareers.map((c) => `${c.universityId}::${c.name}::${c.modality}`));

  // 4. Armamos las filas nuevas, salteando las ya presentes (y duplicados del propio JSON).
  type CareerRow = {
    name: string;
    durationYears: number;
    degreeTitle: string;
    modality: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
    description: string;
    studentCount: number;
    universityId: string;
    areaId: string;
  };
  const toCreate: CareerRow[] = [];
  let careersSkippedExisting = 0;

  for (const uniIn of universities) {
    const universityId = uniIdByName.get(uniIn.name)!;
    for (const c of uniIn.careers) {
      const key = `${universityId}::${c.name}::${c.modality}`;
      if (seen.has(key)) {
        careersSkippedExisting++;
        continue;
      }
      seen.add(key);
      toCreate.push({
        name: c.name,
        durationYears: c.durationYears,
        degreeTitle: c.degreeTitle,
        modality: c.modality,
        description: c.description,
        studentCount: c.studentCount,
        universityId,
        areaId: areaCache.get(c.areaName)!,
      });
    }
  }

  // 5. Inserción masiva por lotes.
  const CHUNK = 500;
  let careersCreated = 0;
  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const res = await prisma.career.createMany({ data: toCreate.slice(i, i + CHUNK) });
    careersCreated += res.count;
  }

  console.log("\n--- Import summary ---");
  console.log(`Universities created: ${universitiesCreated}`);
  console.log(`Universities updated: ${universitiesUpdated}`);
  console.log(`Areas (total distinct): ${areaCache.size}`);
  console.log(`Careers created: ${careersCreated}`);
  console.log(`Careers skipped (already existed): ${careersSkippedExisting}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
