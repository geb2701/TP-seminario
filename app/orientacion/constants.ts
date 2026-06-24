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

// Devuelve la keyword que produjo el puntaje de afinidad (la de mayor score
// que aparece como substring), o null si ninguna matchea. Sirve para explicar
// por qué una carrera tiene la afinidad que tiene (ver buildReasons()).
function getBestKeyword(careerScores: Record<string, number>, careerName: string): string | null {
  const normalized = normalizeForMatch(careerName)
  let best = -1
  let bestKw: string | null = null
  for (const [keyword, score] of Object.entries(careerScores)) {
    if (normalized.includes(keyword) && score > best) {
      best = score
      bestKw = keyword
    }
  }
  return bestKw
}

// ─── Agrupación de carreras por nombre ────────────────────────────────────────
// Los títulos reales del SIU repiten la misma carrera en decenas de
// universidades ("Abogado" aparece ~73 veces). Esta clave agrupa esos
// duplicados verdaderos y además pliega "ruido" administrativo (planes,
// modalidad, ciclos de complementación) SIN fusionar variantes con significado
// propio: "Administración Pública" / "…de Empresas" / "…Hotelera" siguen
// separadas. Verificado contra data/siu-careers.json.
export function careerGroupKey(name: string): string {
  let k = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
  k = k.replace(/\([^)]*\)/g, " ") // (Plan 2017), (MD)
  k = k.replace(/\s*-\s*(md|ccc|ciclo de complementacion curricular).*$/i, " ") // sufijos administrativos
  k = k.replace(/\/[ao]s?\b/g, "") // Abogado/a, Licenciado/as
  k = k.replace(/[/]/g, " ")
  k = k.replace(/\s+/g, " ").trim()
  return k
}

// ─── Razones de afinidad ──────────────────────────────────────────────────────
// Frase corta por keyword de fase 2 (ver AREA_CAREER_QUESTIONS en
// VocationalTest.tsx). Explica el interés concreto que disparó el puntaje.
export const CAREER_REASON_TEMPLATES: Record<string, string> = {
  sistemas: "Te interesa el desarrollo de software y sistemas informáticos",
  informatica: "Te atrae la informática y la tecnología",
  computacion: "Te interesa la computación y la programación",
  civil: "Te motiva diseñar y construir infraestructura",
  agronom: "Te interesa el sector agropecuario y el medioambiente",
  electronic: "Te fascina la electrónica y la automatización",
  industrial: "Te gusta optimizar procesos productivos e industriales",
  arquitect: "Te apasiona diseñar edificios y espacios habitables",
  medic: "Querés atender pacientes y trabajar en salud",
  odontolog: "Te interesa la salud bucal y la odontología",
  veterinari: "Te apasionan los animales y su bienestar",
  contador: "Te interesan la contabilidad, los impuestos y las finanzas",
  economia: "Te atraen los mercados y el análisis económico",
  turismo: "Te gusta el turismo, la hotelería y los eventos",
  administracion: "Te motiva liderar y gestionar organizaciones",
  aboga: "Te interesa la justicia y la defensa de derechos",
  derecho: "Te interesa el derecho y el sistema judicial",
  comunicacion: "Te atraen la comunicación y los medios",
  periodis: "Te gusta el periodismo y contar historias",
  audiovisual: "Te interesa la producción audiovisual y el contenido",
  psicolog: "Querés comprender la mente y acompañar a las personas",
  biologia: "Te fascina la investigación sobre los seres vivos",
}

const MODALITY_REASON_LABEL: Record<string, string> = {
  PRESENCIAL: "presencial",
  HIBRIDO: "híbrida",
  ONLINE: "online",
}

interface ReasonUniversity {
  province: string
  type: "PUBLIC" | "PRIVATE"
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
}

// Construye hasta 3 razones combinando: (1) el interés de fase 2 que disparó la
// afinidad, (2) el área de fase 1, y (3) una preferencia práctica de fase 3 que
// la mejor universidad de la carrera satisface. Todo derivado de datos ya
// presentes; no modifica el scoring.
export function buildReasons(args: {
  careerName: string
  careerScores: Record<string, number>
  area: string
  areaScore: number
  bestUniversity: ReasonUniversity | null
  phase3Answers: Record<string, string>
}): string[] {
  const { careerName, careerScores, area, areaScore, bestUniversity, phase3Answers } = args
  const reasons: string[] = []

  const kw = getBestKeyword(careerScores, careerName)
  if (kw && CAREER_REASON_TEMPLATES[kw]) reasons.push(CAREER_REASON_TEMPLATES[kw])

  if (area) reasons.push(`Coincide con tu interés en ${area} (${areaScore}%)`)

  if (bestUniversity) {
    const locationPref = phase3Answers["location"]
    const typePref = phase3Answers["type"]
    const modalityPref = phase3Answers["modality"]
    if (locationPref && locationPref !== "ANY" && bestUniversity.province === locationPref) {
      reasons.push(`Se cursa en ${bestUniversity.province}`)
    } else if (typePref && typePref !== "ANY" && bestUniversity.type === typePref) {
      reasons.push(`Hay opción ${typePref === "PUBLIC" ? "pública" : "privada"}`)
    } else if (modalityPref && modalityPref !== "ANY" && bestUniversity.modality === modalityPref) {
      reasons.push(`Disponible en modalidad ${MODALITY_REASON_LABEL[bestUniversity.modality]}`)
    }
  }

  return reasons.slice(0, 3)
}
