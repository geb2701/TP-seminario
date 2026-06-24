// Mapping tables for data scraped from https://guiadecarreras.siu.edu.ar
// (SPU's official "Guía de Carreras" pregrado/grado directory).

export const RAMA_CODES = ["CA", "CB", "CD", "CH", "CS", "SR"] as const;
export type RamaCode = (typeof RAMA_CODES)[number];

// Areas are named directly after SIU's own "rama" categories rather than
// forced onto an unrelated bespoke taxonomy.
export const RAMA_TO_AREA: Record<RamaCode, string> = {
  CA: "Ciencias Aplicadas",
  CB: "Ciencias Básicas",
  CD: "Ciencias de la Salud",
  CH: "Ciencias Humanas",
  CS: "Ciencias Sociales",
  SR: "Sin Rama",
};

// The search form's "Modalidad" filter (ef_form_14000042_filtroidtitulopresencial)
// has two real values; leaving it unset returns both merged and undistinguished,
// so the scraper queries each separately and tags rows with the matching one.
export const MODALIDAD_CODES = ["0", "1"] as const;
export type ModalidadCode = (typeof MODALIDAD_CODES)[number];
export const MODALIDAD_TO_ENUM: Record<ModalidadCode, "PRESENCIAL" | "ONLINE"> = {
  "0": "PRESENCIAL", // Presencial
  "1": "ONLINE", // Distancia
};

// The search form's "Estatal / Privado" filter (ef_form_14000042_filtroregimen)
// has 3 real values (PU=Estatal, PR=Privado, IN=Internacional) plus "Todas".
// Only PU/PR are queried — Internacional institutions are deliberately excluded
// (confirmed empirically: regimen=IN returns 0 rows for every rama nationwide,
// but the filter exists and is queried explicitly rather than assumed empty).
// Querying by regimen also gives an authoritative PUBLIC/PRIVATE classification
// per institution, replacing the old name-pattern heuristic that lived here.
export const REGIMEN_CODES = ["PU", "PR"] as const;
export type RegimenCode = (typeof REGIMEN_CODES)[number];
export const REGIMEN_TO_TYPE: Record<RegimenCode, "PUBLIC" | "PRIVATE"> = {
  PU: "PUBLIC",
  PR: "PRIVATE",
};

// "Domicilio" cells look like "<street, possibly with its own dashes> - <city>
// - <province>" — province is always last, city always second-to-last.
export function parseDomicilio(domicilio: string): { city: string | null; province: string | null } {
  const parts = domicilio.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return { city: null, province: null };
  const province = parts[parts.length - 1];
  const city = parts[parts.length - 2];
  return { city, province };
}

// Source data occasionally double-prefixes protocols, e.g.
// "https://http://www.kennedy.edu.ar/" — a SIU data-entry artifact, not a
// scraper bug (confirmed present verbatim in the raw page HTML).
export function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  const cleaned = url.replace(/^https?:\/\/(?=https?:\/\/)/i, "").trim();
  return cleaned || null;
}

// A cuatrimestre is a 4-month term (2 per academic year, same as a semester).
export function parseDurationYears(duracion: string): number | null {
  const match = duracion.match(/(\d+(?:[.,]\d+)?)\s*(Años|Semestres|Cuatrimestres|Meses)/i);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;
  const unit = match[2].toLowerCase();
  let years = value;
  if (unit === "semestres" || unit === "cuatrimestres") years = value / 2;
  if (unit === "meses") years = value / 12;
  return Math.max(1, Math.round(years));
}
