// Constantes compartidas del test de orientación vocacional.
// Se usan tanto en VocationalTest como en el banner de perfil.

// Nombres de área alineados 1:1 con Area.name en la DB (las 6 "ramas" oficiales
// de la Guía de Carreras del SIU — ver scripts/lib/siu-mappings.ts RAMA_TO_AREA).
export const AREA_COLORS: Record<string, string> = {
  "Ciencias Aplicadas": "#6366f1",
  "Ciencias de la Salud": "#10b981",
  "Ciencias Sociales": "#f59e0b",
  "Ciencias Humanas": "#ec4899",
  "Ciencias Básicas": "#3b82f6",
  "Sin Rama": "#6b7280",
}

export const AREA_EMOJIS: Record<string, string> = {
  "Ciencias Aplicadas": "⚙️",
  "Ciencias de la Salud": "🏥",
  "Ciencias Sociales": "📊",
  "Ciencias Humanas": "🎨",
  "Ciencias Básicas": "🔬",
  "Sin Rama": "❓",
}

// Normaliza un string para matching: descompone acentos (NFD), los elimina y
// pasa a minúsculas. Mismo patrón que ya usan app/api/careers/route.ts y
// app/api/search/route.ts para búsqueda insensible a acentos.
function normalizeForMatch(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

// careerScores viene indexado por keyword (no por nombre de carrera, ver
// AREA_CAREER_QUESTIONS en VocationalTest.tsx) porque los títulos reales de
// la Guía de Carreras del SIU varían demasiado entre universidades para un
// match exacto. Acá se busca cuál keyword aparece como substring del nombre
// real normalizado y se toma el máximo, no la suma, para no inflar carreras
// que matchean varias keywords relacionadas a la vez.
export function getCareerAffinity(careerScores: Record<string, number>, careerName: string): number {
  const normalized = normalizeForMatch(careerName)
  let best = 0
  for (const [keyword, score] of Object.entries(careerScores)) {
    if (normalized.includes(keyword) && score > best) best = score
  }
  return best
}
