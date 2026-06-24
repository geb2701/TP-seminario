// Phase B — turns data/siu-careers.raw.json (Phase A's raw scrape) into a
// clean, Prisma-shaped dataset (data/siu-careers.json) plus a report of
// anything skipped (data/siu-careers.report.json). Pure local JSON
// transformation, no network calls — safe to re-run as mapping logic is
// tweaked, without re-scraping.
import { readFileSync, writeFileSync } from "fs";
import {
  RAMA_TO_AREA,
  MODALIDAD_TO_ENUM,
  REGIMEN_TO_TYPE,
  parseDomicilio,
  parseDurationYears,
  cleanUrl,
  type RamaCode,
  type ModalidadCode,
  type RegimenCode,
} from "./lib/siu-mappings";

const RAW_PATH = "data/siu-careers.raw.json";
const OUT_PATH = "data/siu-careers.json";
const REPORT_PATH = "data/siu-careers.report.json";

interface RawRow {
  universidad: string;
  facultad: string;
  titulo: string;
  tipoTitulo: string;
  duracion: string;
  condicionesIngreso: string;
  domicilio: string;
  telefono: string;
  web: string | null;
  mail: string;
}

interface RawData {
  scrapedAt: string;
  combos: { rama: RamaCode; modalidad: ModalidadCode; regimen: RegimenCode; rows: RawRow[] }[];
}

interface UniversityOut {
  name: string;
  city: string | null;
  province: string | null;
  type: "PUBLIC" | "PRIVATE";
  website: string | null;
  careers: CareerOut[];
}

interface CareerOut {
  name: string;
  degreeTitle: string;
  durationYears: number;
  modality: "PRESENCIAL" | "ONLINE";
  description: string;
  studentCount: 0;
  areaName: string;
}

function main() {
  const raw: RawData = JSON.parse(readFileSync(RAW_PATH, "utf-8"));

  const universities = new Map<string, UniversityOut>();
  const seenCareerKeys = new Map<string, Set<string>>(); // universityName -> set of "areaName||titulo||modality"
  // Universities span multiple campuses/facultades with different addresses;
  // take the most common (city, province) pair rather than the first seen,
  // so a satellite campus listed first doesn't misrepresent the institution.
  const locationVotes = new Map<string, Map<string, number>>(); // universityName -> "city||province" -> count
  const websiteVotes = new Map<string, Map<string, number>>(); // universityName -> website -> count
  // type comes straight from the regimen the row was queried under (authoritative,
  // not a name-pattern guess), but vote anyway in case the same institution name
  // ever shows up tagged with both regimenes due to a scraping inconsistency.
  const typeVotes = new Map<string, Map<string, number>>(); // universityName -> "PUBLIC"|"PRIVATE" -> count

  const skipped: Record<string, number> = {};
  let totalRaw = 0;
  let duplicatesSkipped = 0;

  function skip(reason: string) {
    skipped[reason] = (skipped[reason] ?? 0) + 1;
  }

  for (const { rama, modalidad, regimen, rows } of raw.combos) {
    const areaName = RAMA_TO_AREA[rama];
    const modality = MODALIDAD_TO_ENUM[modalidad];
    const type = REGIMEN_TO_TYPE[regimen];

    for (const row of rows) {
      totalRaw++;

      // A handful of source rows leave "Universidad" blank and put the
      // institution name in "Facultad" instead (confirmed: every such row
      // belongs to "Instituto Universitario Escuela de Medicina del Hospital
      // Italiano - UA") — recover it rather than discarding real data.
      const universidadName = (row.universidad.trim() || row.facultad.trim());
      const facultadName = row.universidad.trim() ? row.facultad.trim() : "";
      const titulo = row.titulo.trim();

      if (!universidadName) {
        skip("MISSING_UNIVERSITY");
        continue;
      }
      if (!titulo) {
        skip("MISSING_TITLE");
        continue;
      }

      const durationYears = parseDurationYears(row.duracion);
      if (durationYears == null) {
        skip("MISSING_DURATION");
        continue;
      }

      let university = universities.get(universidadName);
      if (!university) {
        university = {
          name: universidadName,
          city: null,
          province: null,
          type,
          website: null,
          careers: [],
        };
        universities.set(universidadName, university);
        seenCareerKeys.set(universidadName, new Set());
        locationVotes.set(universidadName, new Map());
        websiteVotes.set(universidadName, new Map());
        typeVotes.set(universidadName, new Map());
      }

      const { city, province } = parseDomicilio(row.domicilio);
      if (city && province) {
        const key = `${city}||${province}`;
        const votes = locationVotes.get(universidadName)!;
        votes.set(key, (votes.get(key) ?? 0) + 1);
      }
      const url = cleanUrl(row.web);
      if (url) {
        const votes = websiteVotes.get(universidadName)!;
        votes.set(url, (votes.get(url) ?? 0) + 1);
      }
      {
        const votes = typeVotes.get(universidadName)!;
        votes.set(type, (votes.get(type) ?? 0) + 1);
      }

      // Same título can legitimately exist twice at the same university under
      // different modalidades (e.g. offered both Presencial and a Distancia) —
      // those are distinct career offerings, not duplicates, so modality is
      // part of the dedup key.
      const careerKey = `${areaName}||${titulo}||${modality}`;
      const seenKeys = seenCareerKeys.get(universidadName)!;
      if (seenKeys.has(careerKey)) {
        duplicatesSkipped++;
        continue;
      }
      seenKeys.add(careerKey);

      const descriptionParts = [facultadName, row.tipoTitulo, row.condicionesIngreso].filter(Boolean);
      university.careers.push({
        name: titulo,
        degreeTitle: titulo,
        durationYears,
        modality,
        description: descriptionParts.join(" · "),
        studentCount: 0,
        areaName,
      });
    }
  }

  function topVote(votes: Map<string, number> | undefined): string | null {
    if (!votes || votes.size === 0) return null;
    return [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  for (const university of universities.values()) {
    const locationKey = topVote(locationVotes.get(university.name));
    if (locationKey) {
      const [city, province] = locationKey.split("||");
      university.city = city;
      university.province = province;
    }
    university.website = topVote(websiteVotes.get(university.name));
    const type = topVote(typeVotes.get(university.name));
    if (type === "PUBLIC" || type === "PRIVATE") {
      university.type = type;
    }
  }

  const universityList = Array.from(universities.values());
  const totalCareers = universityList.reduce((sum, u) => sum + u.careers.length, 0);
  const areaNames = new Set(universityList.flatMap((u) => u.careers.map((c) => c.areaName)));

  writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), universities: universityList }, null, 2));

  const report = {
    sourceScrapedAt: raw.scrapedAt,
    totalRawRows: totalRaw,
    totalUniversities: universityList.length,
    totalCareers,
    totalAreas: areaNames.size,
    duplicateCareersSkipped: duplicatesSkipped,
    skippedByReason: skipped,
    universitiesMissingCityProvince: universityList.filter((u) => !u.city || !u.province).map((u) => u.name),
    universitiesMissingWebsite: universityList.filter((u) => !u.website).map((u) => u.name),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Universities: ${universityList.length}`);
  console.log(`Careers: ${totalCareers}`);
  console.log(`Areas: ${areaNames.size}`);
  console.log(`Duplicates skipped: ${duplicatesSkipped}`);
  console.log(`Skipped by reason:`, skipped);
  console.log(`Missing city/province: ${report.universitiesMissingCityProvince.length} universities`);
  console.log(`Missing website: ${report.universitiesMissingWebsite.length} universities`);
}

main();
