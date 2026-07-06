// Seed del ranking de prestigio (QS World University Rankings). Lee la lista
// curada en data/qs-ranking-ar.json — las universidades argentinas presentes en
// el ranking global QS — y crea/actualiza una fila UniversityRanking por cada
// una. La presencia de esa fila es lo que marca a la universidad como
// "prestigiosa" en la UI (chip dorado), reemplazando el viejo umbral por rating
// de reseñas.
//
// El match contra la DB se hace por `name` normalizado (mismo normalize que usa
// la API), porque el dataset real (SIU) no tiene shortCode. Si algún nombre del
// JSON no matchea, el script falla ruidosamente (exit 1) para no dejar caer un
// chip silenciosamente.
//
// Safety rail: igual que scripts/import-siu-data.ts / seed-reviews.ts — apunta a
// SQLite local por default; requiere --confirm-prod explícito para escribir en
// el Turso compartido.
//
// Uso: tsx scripts/seed-rankings.ts [--confirm-prod]
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalize } from "../lib/normalize";
import "dotenv/config";

const LOCAL_DB_URL = "file:./prisma/dev.db";

const confirmProd = process.argv.includes("--confirm-prod");
const targetUrl = confirmProd ? process.env.TURSO_DATABASE_URL! : LOCAL_DB_URL;

if (confirmProd) {
  console.log(`--confirm-prod passed: targeting ${targetUrl}`);
} else {
  console.log(`Safety default: targeting local SQLite (${LOCAL_DB_URL}). Pass --confirm-prod to write to the shared Turso DB instead.`);
}

const adapter = new PrismaLibSql({
  url: targetUrl,
  authToken: confirmProd ? process.env.TURSO_AUTH_TOKEN : undefined,
});
const prisma = new PrismaClient({ adapter });

type RankingEntry = {
  name: string;
  rank: number;
  rankLabel: string;
  aka?: string;
};

type RankingFile = {
  source: string;
  year: number;
  universities: RankingEntry[];
};

async function main() {
  const file: RankingFile = JSON.parse(
    readFileSync(join(process.cwd(), "data", "qs-ranking-ar.json"), "utf8"),
  );
  const { source, year, universities: entries } = file;
  console.log(`\nRanking: ${source} (${year}) — ${entries.length} universidades en el JSON.`);

  // Índice de universidades de la DB por nombre normalizado.
  const allUniversities = await prisma.university.findMany({ select: { id: true, name: true } });
  const uniByNormName = new Map(allUniversities.map((u) => [normalize(u.name), u]));

  const unmatched: string[] = [];
  let created = 0;
  let updated = 0;

  for (const entry of entries) {
    // Match por `name` y, como fallback, por `aka` (nombre alternativo del QS).
    const uni =
      uniByNormName.get(normalize(entry.name)) ??
      (entry.aka ? uniByNormName.get(normalize(entry.aka)) : undefined);

    if (!uni) {
      unmatched.push(entry.name);
      continue;
    }

    // Idempotente gracias a @@unique([universityId, source, year]) + universityId @unique.
    const existing = await prisma.universityRanking.findUnique({
      where: { universityId: uni.id },
    });

    await prisma.universityRanking.upsert({
      where: { universityId: uni.id },
      create: {
        universityId: uni.id,
        source,
        year,
        rank: entry.rank,
        rankLabel: entry.rankLabel,
      },
      update: {
        source,
        year,
        rank: entry.rank,
        rankLabel: entry.rankLabel,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`\n✓ ${created} creadas, ${updated} actualizadas, ${unmatched.length} sin match.`);

  if (unmatched.length > 0) {
    console.error("\n✗ Universidades del ranking que no matchearon ninguna universidad en la DB:");
    for (const name of unmatched) console.error(`  - ${name}`);
    console.error(
      "\nRevisá el nombre exacto en data/siu-careers.json o agregá un 'aka' en data/qs-ranking-ar.json.",
    );
    throw new Error(`${unmatched.length} universidad(es) del ranking sin match`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
