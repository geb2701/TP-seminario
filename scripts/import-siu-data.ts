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

  const areaCache = new Map<string, string>(); // areaName -> id

  let universitiesCreated = 0;
  let universitiesUpdated = 0;
  let careersCreated = 0;
  let careersSkippedExisting = 0;

  for (const uniIn of universities) {
    let university = await prisma.university.findFirst({ where: { name: uniIn.name } });

    if (!university) {
      university = await prisma.university.create({
        data: {
          name: uniIn.name,
          city: uniIn.city ?? "Desconocida",
          province: uniIn.province ?? "Desconocida",
          type: uniIn.type,
          website: uniIn.website,
        },
      });
      universitiesCreated++;
    } else {
      await prisma.university.update({
        where: { id: university.id },
        data: {
          city: uniIn.city ?? university.city,
          province: uniIn.province ?? university.province,
          type: uniIn.type,
          website: uniIn.website ?? university.website,
        },
      });
      universitiesUpdated++;
    }

    for (const careerIn of uniIn.careers) {
      let areaId = areaCache.get(careerIn.areaName);
      if (!areaId) {
        const area = await prisma.area.upsert({
          where: { name: careerIn.areaName },
          update: {},
          create: { name: careerIn.areaName },
        });
        areaId = area.id;
        areaCache.set(careerIn.areaName, areaId);
      }

      const existingCareer = await prisma.career.findFirst({
        where: { universityId: university.id, name: careerIn.name, modality: careerIn.modality },
      });
      if (existingCareer) {
        careersSkippedExisting++;
        continue;
      }

      await prisma.career.create({
        data: {
          name: careerIn.name,
          durationYears: careerIn.durationYears,
          degreeTitle: careerIn.degreeTitle,
          modality: careerIn.modality,
          description: careerIn.description,
          studentCount: careerIn.studentCount,
          universityId: university.id,
          areaId,
        },
      });
      careersCreated++;
    }
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
