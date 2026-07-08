import { normalize } from "./normalize";

// Grandes áreas temáticas del QS World University Rankings by Subject (5).
export type QsBroadSubject =
  | "ARTS_HUMANITIES"
  | "ENGINEERING_TECHNOLOGY"
  | "LIFE_SCIENCES_MEDICINE"
  | "NATURAL_SCIENCES"
  | "SOCIAL_SCIENCES_MANAGEMENT";

// Etiqueta legible (para tooltips/UI) de cada gran área.
export const QS_SUBJECT_LABEL: Record<QsBroadSubject, string> = {
  ARTS_HUMANITIES: "Artes y Humanidades",
  ENGINEERING_TECHNOLOGY: "Ingeniería y Tecnología",
  LIFE_SCIENCES_MEDICINE: "Ciencias de la Vida y Medicina",
  NATURAL_SCIENCES: "Ciencias Naturales",
  SOCIAL_SCIENCES_MANAGEMENT: "Ciencias Sociales y Administración",
};

// Mapa directo Área (SIU) → gran área QS, para las 4 áreas que mapean 1:1.
// "Ciencias Aplicadas" no está: se resuelve por keywords del nombre de la carrera
// (mezcla ingeniería/sistemas/arquitectura con agronomía/farmacia/bioquímica).
const AREA_TO_SUBJECT: Record<string, QsBroadSubject | null> = {
  "Ciencias Humanas": "ARTS_HUMANITIES",
  "Ciencias de la Salud": "LIFE_SCIENCES_MEDICINE",
  "Ciencias Básicas": "NATURAL_SCIENCES",
  "Ciencias Sociales": "SOCIAL_SCIENCES_MANAGEMENT",
  "Ciencias Aplicadas": null,
  "Sin Rama": null,
};

// Devuelve la gran área QS de una carrera. Las keywords del nombre corren primero
// (resuelven "Ciencias Aplicadas" y corrigen fugas entre áreas, p. ej. "Ingeniero
// de Sonido" catalogado en Humanas); si no matchean, cae al mapa por área.
export function deriveQsSubject(
  areaName: string,
  careerName: string
): QsBroadSubject | null {
  const n = normalize(careerName);
  if (
    /ingenier|arquitect|sistemas|informat|comput|software|program|dato|ciberseg|electron|mecatron|telecomunic/.test(n)
  ) {
    return "ENGINEERING_TECHNOLOGY";
  }
  // QS agrupa Agricultura/Veterinaria/Farmacia/Bioquímica/Biotecnología en
  // Ciencias de la Vida y Medicina.
  if (/agronom|agropecuar|forestal|veterinar|farmac|bioquim|biotecnolog/.test(n)) {
    return "LIFE_SCIENCES_MEDICINE";
  }
  return AREA_TO_SUBJECT[areaName] ?? null;
}
