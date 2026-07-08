// Seed del ranking QS por gran área temática (QS World University Rankings by
// Subject). Lee la lista curada en data/qs-subject-ranking-ar.json — las
// universidades argentinas presentes en cada gran área — y crea/actualiza una
// fila UniversitySubjectRanking por (universidad, área). Una carrera se marca
// "Recomendada" (chip azul) si su universidad tiene fila para la gran área a la
// que la carrera pertenece (ver lib/qs-subjects.ts).
//
// El match contra la DB se hace por `name` normalizado (mismo normalize que la
// API), porque el dataset real (SIU) no tiene shortCode. Si algún nombre del
// JSON no matchea, el script falla ruidosamente (exit 1).
//
// Safety rail: igual que scripts/seed-rankings.ts — apunta a SQLite local por
// default; requiere --confirm-prod explícito para escribir en el Turso compartido.
//
// Uso: tsx scripts/seed-subject-rankings.ts [--confirm-prod]
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

type SubjectEntry = {
  name: string;
  rank: number;
  rankLabel: string;
  aka?: string;
};

type SubjectRankingFile = {
  source: string;
  year: number;
  subjects: Record<string, SubjectEntry[]>;
};

async function main() {
  const file: SubjectRankingFile = JSON.parse(
    readFileSync(join(process.cwd(), "data", "qs-subject-ranking-ar.json"), "utf8"),
  );
  const { source, year, subjects } = file;
  const totalEntries = Object.values(subjects).reduce((n, arr) => n + arr.length, 0);
  console.log(`\nRanking por área: ${source} (${year}) — ${totalEntries} filas en ${Object.keys(subjects).length} áreas.`);

  // Índice de universidades de la DB por nombre normalizado.
  const allUniversities = await prisma.university.findMany({ select: { id: true, name: true } });
  const uniByNormName = new Map(allUniversities.map((u) => [normalize(u.name), u]));

  const unmatched: string[] = [];
  let created = 0;
  let updated = 0;

  for (const [subject, entries] of Object.entries(subjects)) {
    for (const entry of entries) {
      // Match por `name` y, como fallback, por `aka` (nombre alternativo del QS).
      const uni =
        uniByNormName.get(normalize(entry.name)) ??
        (entry.aka ? uniByNormName.get(normalize(entry.aka)) : undefined);

      if (!uni) {
        unmatched.push(`${entry.name} (${subject})`);
        continue;
      }

      const where = {
        universityId_subject_source_year: {
          universityId: uni.id,
          subject,
          source,
          year,
        },
      };

      // Idempotente gracias a @@unique([universityId, subject, source, year]).
      const existing = await prisma.universitySubjectRanking.findUnique({ where });

      await prisma.universitySubjectRanking.upsert({
        where,
        create: { universityId: uni.id, subject, source, year, rank: entry.rank, rankLabel: entry.rankLabel },
        update: { rank: entry.rank, rankLabel: entry.rankLabel },
      });

      if (existing) updated++;
      else created++;
    }
  }

  console.log(`\n✓ ${created} creadas, ${updated} actualizadas, ${unmatched.length} sin match.`);

  if (unmatched.length > 0) {
    console.error("\n✗ Filas del ranking por área que no matchearon ninguna universidad en la DB:");
    for (const name of unmatched) console.error(`  - ${name}`);
    console.error(
      "\nRevisá el nombre exacto en data/siu-careers.json o agregá un 'aka' en data/qs-subject-ranking-ar.json.",
    );
    throw new Error(`${unmatched.length} fila(s) del ranking por área sin match`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
