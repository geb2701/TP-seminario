import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "University" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "website" TEXT,
    "foundedYear" INTEGER,
    "description" TEXT,
    "logoUrl" TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Career" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL,
    "degreeTitle" TEXT NOT NULL,
    "modality" TEXT NOT NULL DEFAULT 'PRESENCIAL',
    "description" TEXT,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "universityId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    CONSTRAINT "Career_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Career_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "StudyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "careerId" TEXT NOT NULL,
    CONSTRAINT "StudyPlan_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER,
    "studyPlanId" TEXT NOT NULL,
    CONSTRAINT "Subject_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "CareerReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT,
    "careerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerReview_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "UniversityReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT,
    "universityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UniversityReview_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
];

async function main() {
  for (const stmt of statements) {
    await client.execute(stmt);
    const table = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
    console.log(`✓ ${table}`);
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("\nTablas en Turso:", tables.rows.map((r) => r.name).join(", "));
}

main().catch(console.error);
