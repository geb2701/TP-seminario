"use client"

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  GraduationCap,
  Trophy,
  Save,
  CheckCircle,
} from "lucide-react"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { useCompareCareers, MAX_COMPARE } from "@/hooks/use-compare-careers"
import { AREA_COLORS, AREA_EMOJIS, getCareerAffinity, careerGroupKey, buildReasons } from "./constants"
import { CareerResultCard, orderUniversities, type CareerResult, type GroupedCareer } from "./CareerResultCard"
import { ComparisonPanel, type CompareCareer } from "./ComparisonPanel"
import { ExportPDFButton } from "@/components/exportar"
import { CareerDetailPanel, type CareerDetailFull } from "./CareerDetailPanel"
import { EmptyState } from "@/components/empty-state"
import { Search } from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Area {
  id: string
  name: string
}

// CareerResult vive en ./CareerResultCard (compartido con el card de resultados).

// ─── Áreas ───────────────────────────────────────────────────────────────────

// Alineadas 1:1 con Area.name en la DB (las 6 "ramas" del SIU — ver
// scripts/lib/siu-mappings.ts RAMA_TO_AREA). "Sin Rama" no recibe peso en
// ninguna pregunta de fase 1 a propósito: es la bolsa de carreras no
// clasificadas del SIU y no debería poder salir como área top.
const AREAS = [
  "Ciencias Aplicadas",
  "Ciencias Básicas",
  "Ciencias de la Salud",
  "Ciencias Humanas",
  "Ciencias Sociales",
  "Sin Rama",
]

// AREA_COLORS y AREA_EMOJIS viven en ./constants (compartidos con el banner de perfil).

// ─── Fase 1: preguntas generales con pesos cruzados ──────────────────────────

interface Phase1Question {
  text: string
  weights: Partial<Record<string, number>>
}

// Pesos remapeados de las 8 áreas originales a las 6 ramas reales del SIU.
// Cuando dos áreas viejas colapsan en una nueva (p. ej. Ingeniería y
// Arquitectura -> Ciencias Aplicadas) los pesos se suman y se topean a 1.0.
const PHASE1_QUESTIONS: Phase1Question[] = [
  {
    text: "Me resulta fácil entender cómo funcionan los aparatos o sistemas tecnológicos.",
    weights: { "Ciencias Aplicadas": 1.0, "Ciencias Básicas": 0.6 },
  },
  {
    text: "Disfruto ayudando a personas que atraviesan dificultades físicas o emocionales.",
    weights: { "Ciencias de la Salud": 1.0, "Ciencias Sociales": 0.5, "Ciencias Humanas": 0.5 },
  },
  {
    text: "Me gusta analizar números, estadísticas o tendencias para tomar decisiones.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Básicas": 0.7, "Ciencias Aplicadas": 0.4 },
  },
  {
    text: "Soy hábil para expresar mis ideas y convencer a otros con argumentos sólidos.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Humanas": 0.4 },
  },
  {
    text: "Me apasiona crear: diseñar objetos, espacios o experiencias visuales.",
    weights: { "Ciencias Aplicadas": 1.0, "Ciencias Humanas": 0.7 },
  },
  {
    text: "Me interesa conocer el funcionamiento interno del cuerpo humano o de los seres vivos.",
    weights: { "Ciencias de la Salud": 1.0, "Ciencias Básicas": 0.9 },
  },
  {
    text: "Disfruto resolver problemas matemáticos o lógicos que requieren razonamiento abstracto.",
    weights: { "Ciencias Básicas": 1.0, "Ciencias Aplicadas": 0.8, "Ciencias Sociales": 0.4 },
  },
  {
    text: "Me gusta planificar, coordinar equipos y optimizar el uso de los recursos disponibles.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Aplicadas": 0.5 },
  },
  {
    text: "Me interesa la historia, la filosofía o las expresiones culturales de distintas sociedades.",
    weights: { "Ciencias Humanas": 1.0, "Ciencias Sociales": 0.9 },
  },
  {
    text: "Puedo visualizar mentalmente cómo quedaría un espacio o estructura antes de construirla.",
    weights: { "Ciencias Aplicadas": 1.0, "Ciencias Básicas": 0.3 },
  },
  {
    text: "Me preocupa profundamente la justicia, la igualdad y los derechos de las personas.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Humanas": 0.5 },
  },
  {
    text: "Disfruto contar historias, escribir o crear contenido que llegue a mucha gente.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Humanas": 0.8, "Ciencias Aplicadas": 0.3 },
  },
  {
    text: "Me gusta experimentar con fenómenos naturales, químicos o físicos en la práctica.",
    weights: { "Ciencias Básicas": 1.0, "Ciencias de la Salud": 0.6, "Ciencias Aplicadas": 0.3 },
  },
  {
    text: "Me motiva identificar oportunidades de negocio y llevar ideas innovadoras al mercado.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Aplicadas": 0.5 },
  },
  {
    text: "Disfruto hablar en público, debatir ideas o entrevistar a otras personas.",
    weights: { "Ciencias Sociales": 1.0, "Ciencias Humanas": 0.4 },
  },
  {
    text: "Me atrae combinar ciencia y tecnología para mejorar la salud de las personas.",
    weights: { "Ciencias de la Salud": 1.0, "Ciencias Aplicadas": 0.7, "Ciencias Básicas": 0.6 },
  },
  {
    text: "Tengo sensibilidad estética: la belleza, el diseño y las formas visuales me importan.",
    weights: { "Ciencias Aplicadas": 1.0, "Ciencias Humanas": 0.8, "Ciencias Sociales": 0.3 },
  },
  {
    text: "Me interesa entender cómo los sistemas económicos afectan a las personas y los países.",
    weights: { "Ciencias Sociales": 1.0 },
  },
  {
    text: "Me gusta la programación, la inteligencia artificial o la robótica.",
    weights: { "Ciencias Aplicadas": 1.0, "Ciencias Básicas": 0.6, "Ciencias Sociales": 0.3 },
  },
  {
    text: "Disfruto comprender las motivaciones y emociones de las personas que me rodean.",
    weights: {
      "Ciencias Humanas": 1.0,
      "Ciencias Sociales": 1.0,
      "Ciencias de la Salud": 0.5,
    },
  },
]

const PHASE1_PER_PAGE = 5
const TOTAL_PHASE1_PAGES = Math.ceil(PHASE1_QUESTIONS.length / PHASE1_PER_PAGE)

// ─── Fase 2: preguntas específicas por área → pesos a carreras ────────────────

interface Phase2Question {
  text: string
  careerWeights: Record<string, number>
}

// Conserva el nombre original (solo NFC+trim) para usar como clave de
// visualización donde haga falta.
function normalizeCareerName(name: string): string {
  return name.normalize("NFC").trim()
}

// Las claves de careerWeights ya NO son nombres exactos de carrera (los
// títulos reales de la Guía de Carreras del SIU varían demasiado de
// universidad a universidad para un match exacto, p. ej. "Ingeniero/a Civil"
// vs "Ingeniero Civil"). Son keywords cortas, ya normalizadas (sin acentos,
// minúsculas), que se buscan como substring dentro del nombre normalizado de
// cada carrera real — ver getCareerAffinity().
const AREA_CAREER_QUESTIONS: Record<string, Phase2Question[]> = {
  "Ciencias Aplicadas": [
    {
      text: "Prefiero desarrollar software y sistemas informáticos antes que trabajar con maquinaria física.",
      careerWeights: { sistemas: 1.0, informatica: 1.0, computacion: 1.0 },
    },
    {
      text: "Me interesa diseñar y construir infraestructura: rutas, puentes o instalaciones industriales.",
      careerWeights: { civil: 1.0, industrial: 0.8, electronic: 0.4 },
    },
    {
      text: "Me atrae aplicar la ingeniería al sector agropecuario, los cultivos o el medioambiente.",
      careerWeights: { agronom: 1.0 },
    },
    {
      text: "Me fascina el mundo de la electrónica, los circuitos, las telecomunicaciones y la automatización.",
      careerWeights: { electronic: 1.0, computacion: 0.4 },
    },
    {
      text: "Me interesa gestionar procesos productivos, optimizar operaciones y mejorar la eficiencia industrial.",
      careerWeights: { industrial: 1.0, civil: 0.4 },
    },
    {
      text: "Quiero diseñar edificios y espacios habitables, gestionando todo el proceso constructivo.",
      careerWeights: { arquitect: 1.0 },
    },
    {
      text: "Me interesa el diseño urbano, la planificación territorial y los espacios públicos.",
      careerWeights: { arquitect: 1.0 },
    },
    {
      text: "Me atrae combinar arte y técnica en el diseño de interiores o la renovación de espacios.",
      careerWeights: { arquitect: 0.8 },
    },
    {
      text: "Me apasiona trabajar con planos, maquetas y herramientas de diseño asistido por computadora.",
      careerWeights: { arquitect: 1.0 },
    },
    {
      text: "Me interesa la arquitectura sustentable, el uso de materiales ecológicos y el bioclima.",
      careerWeights: { arquitect: 0.9 },
    },
  ],
  "Ciencias de la Salud": [
    {
      text: "Quiero atender pacientes humanos, hacer diagnósticos clínicos y tratamientos médicos.",
      careerWeights: { medic: 1.0 },
    },
    {
      text: "Me interesa la salud bucal, la ortodoncia y los procedimientos odontológicos.",
      careerWeights: { odontolog: 1.0, medic: 0.3 },
    },
    {
      text: "Me apasionan los animales y quiero dedicarme a su salud y bienestar.",
      careerWeights: { veterinari: 1.0 },
    },
    {
      text: "Me atrae la investigación médica y el desarrollo de nuevos tratamientos o fármacos.",
      careerWeights: { medic: 1.0, odontolog: 0.3 },
    },
    {
      text: "Me interesa la salud pública, la epidemiología y el impacto de las enfermedades en la sociedad.",
      careerWeights: { medic: 0.9, veterinari: 0.5 },
    },
  ],
  "Ciencias Sociales": [
    {
      text: "Me interesa llevar contabilidad, impuestos y las finanzas de empresas o personas.",
      careerWeights: { contador: 1.0, administracion: 0.5 },
    },
    {
      text: "Me atrae el análisis macroeconómico, los mercados financieros y las políticas económicas.",
      careerWeights: { economia: 1.0 },
    },
    {
      text: "Me gusta la industria del turismo, la hotelería y la organización de eventos o destinos.",
      careerWeights: { turismo: 1.0 },
    },
    {
      text: "Me interesa liderar organizaciones, tomar decisiones estratégicas y gestionar equipos.",
      careerWeights: { administracion: 1.0, economia: 0.7, contador: 0.4 },
    },
    {
      text: "Me motiva emprender, crear negocios y analizar oportunidades en el mercado.",
      careerWeights: { administracion: 1.0, economia: 0.9 },
    },
    {
      text: "Me interesa el derecho corporativo, los contratos mercantiles y la asesoría a empresas.",
      careerWeights: { aboga: 0.8, derecho: 0.8 },
    },
    {
      text: "Me apasionan los derechos humanos, la justicia social y la defensa de los más vulnerables.",
      careerWeights: { aboga: 1.0, derecho: 1.0 },
    },
    {
      text: "Me interesa la litigación en juicio, el derecho penal y el trabajo en el sistema judicial.",
      careerWeights: { aboga: 1.0, derecho: 1.0 },
    },
    {
      text: "Me atrae el derecho internacional, los tratados y la política exterior.",
      careerWeights: { aboga: 0.9, derecho: 0.9 },
    },
    {
      text: "Me interesa la política, el derecho constitucional y cómo se diseñan las leyes.",
      careerWeights: { aboga: 0.8, derecho: 0.8 },
    },
    {
      text: "Quiero trabajar en medios de comunicación, hacer periodismo o producir contenido informativo.",
      careerWeights: { comunicacion: 1.0, periodis: 1.0 },
    },
    {
      text: "Me interesa la comunicación institucional, el marketing o las relaciones públicas.",
      careerWeights: { comunicacion: 0.9 },
    },
    {
      text: "Me atrae la producción audiovisual, los podcasts o el contenido digital en redes.",
      careerWeights: { comunicacion: 0.9, audiovisual: 0.9 },
    },
    {
      text: "Me gusta investigar, redactar notas periodísticas y contar historias de impacto social.",
      careerWeights: { periodis: 1.0, comunicacion: 1.0 },
    },
    {
      text: "Me interesa la comunicación política, la opinión pública y el análisis de medios.",
      careerWeights: { comunicacion: 0.8 },
    },
  ],
  "Ciencias Humanas": [
    {
      text: "Quiero dedicarme a la psicología clínica, la terapia o el acompañamiento de pacientes.",
      careerWeights: { psicolog: 1.0 },
    },
    {
      text: "Me interesa la psicología educacional, organizacional o la investigación en psicología.",
      careerWeights: { psicolog: 0.9 },
    },
    {
      text: "Me gusta comprender las motivaciones, emociones y comportamientos de las personas.",
      careerWeights: { psicolog: 0.8 },
    },
    {
      text: "Me atrae trabajar en salud mental, intervenciones comunitarias y bienestar social.",
      careerWeights: { psicolog: 1.0 },
    },
    {
      text: "Me interesa la neurociencia, los procesos cognitivos y cómo funciona la mente humana.",
      careerWeights: { psicolog: 0.9 },
    },
  ],
  "Ciencias Básicas": [
    {
      text: "Me fascina el ecosistema marino, la oceanografía y la investigación biológica del mar.",
      careerWeights: { biologia: 1.0 },
    },
    {
      text: "Me interesa la investigación en laboratorio sobre organismos vivos o ecosistemas naturales.",
      careerWeights: { biologia: 0.8 },
    },
    {
      text: "Quiero dedicarme a la ciencia básica y generar conocimiento desde la academia o el CONICET.",
      careerWeights: { biologia: 0.9 },
    },
    {
      text: "Me atrae la conservación de la biodiversidad y el estudio del impacto ambiental.",
      careerWeights: { biologia: 0.9 },
    },
    {
      text: "Me interesa el trabajo de campo en la naturaleza: muestras, expediciones y relevamientos.",
      careerWeights: { biologia: 1.0 },
    },
  ],
  "Sin Rama": [],
}

// ─── Opciones de respuesta (Likert) ──────────────────────────────────────────

const OPTIONS = [
  { value: 0, label: "Nunca", emoji: "😶" },
  { value: 1, label: "Casi nunca", emoji: "🙁" },
  { value: 2, label: "A veces", emoji: "😐" },
  { value: 3, label: "Casi siempre", emoji: "🙂" },
  { value: 4, label: "Siempre", emoji: "😄" },
]

// ─── Cálculo de puntajes fase 1 ───────────────────────────────────────────────

function calcPhase1Scores(answers: Record<number, number>): Record<string, number> {
  const totals: Record<string, number> = {}
  const maxTotals: Record<string, number> = {}
  AREAS.forEach((a) => { totals[a] = 0; maxTotals[a] = 0 })

  PHASE1_QUESTIONS.forEach((q, qi) => {
    const answer = answers[qi] ?? 0
    Object.entries(q.weights).forEach(([area, weight]) => {
      const w = weight ?? 0
      totals[area] = (totals[area] ?? 0) + answer * w
      maxTotals[area] = (maxTotals[area] ?? 0) + 4 * w
    })
  })

  const scores: Record<string, number> = {}
  AREAS.forEach((a) => {
    scores[a] = maxTotals[a] > 0 ? Math.round((totals[a] / maxTotals[a]) * 100) : 0
  })
  return scores
}

// ─── Cálculo de puntajes de carreras (fase 2) ─────────────────────────────────

function calcCareerScores(
  answers: Record<string, number>,
  top3Areas: string[]
): Record<string, number> {
  const totals: Record<string, number> = {}
  const maxTotals: Record<string, number> = {}

  top3Areas.forEach((area, ai) => {
    const qs = AREA_CAREER_QUESTIONS[area] ?? []
    qs.forEach((q, qi) => {
      const answer = answers[`${ai}_${qi}`] ?? 0
      Object.entries(q.careerWeights).forEach(([name, weight]) => {
        const key = normalizeCareerName(name)
        totals[key] = (totals[key] ?? 0) + answer * weight
        maxTotals[key] = (maxTotals[key] ?? 0) + 4 * weight
      })
    })
  })

  const normalized: Record<string, number> = {}
  Object.keys(totals).forEach((name) => {
    normalized[name] = maxTotals[name] > 0
      ? Math.round((totals[name] / maxTotals[name]) * 100)
      : 0
  })
  return normalized
}

// ─── Score final con boost de prestigio ──────────────────────────────────────
// Combina afinidad vocacional con rating de carrera/universidad.
// Si el usuario eligió PRESTIGE como prioridad: peso 70/30 (afinidad/prestigio).
// En cualquier otro caso: los ratings actúan como tiebreaker suave (95/5).
// Carreras sin reseñas reciben un valor neutro (0.5) para no penalizarlas.

function calcFinalScore(
  affinityScore: number,
  careerRating: number | null,
  universityRating: number | null,
  prioritizePrestige: boolean
): number {
  const careerNorm = careerRating != null ? (careerRating - 1) / 4 : 0.5
  const universityNorm = universityRating != null ? (universityRating - 1) / 4 : 0.5
  const prestigeScore = careerNorm * 0.6 + universityNorm * 0.4
  return prioritizePrestige
    ? affinityScore * 0.70 + prestigeScore * 100 * 0.30
    : affinityScore * 0.95 + prestigeScore * 100 * 0.05
}

// ─── Fase 3: preferencias prácticas (selección única) ────────────────────────

interface Phase3Question {
  id: string
  text: string
  options: { value: string; label: string; description: string }[]
}

const PHASE3_QUESTIONS: Phase3Question[] = [
  {
    id: "modality",
    text: "¿Qué modalidad de cursada preferís?",
    options: [
      { value: "PRESENCIAL", label: "Presencial",        description: "Clases en el aula todos los días" },
      { value: "HIBRIDO",    label: "Híbrido",            description: "Combina presencial y virtual" },
      { value: "ONLINE",     label: "Online",             description: "100% a distancia" },
      { value: "ANY",        label: "Me es indiferente",  description: "Cualquier modalidad está bien" },
    ],
  },
  {
    id: "type",
    text: "¿Qué tipo de institución preferís?",
    options: [
      { value: "PUBLIC",  label: "Pública (gratuita)",    description: "Universidad nacional o provincial" },
      { value: "PRIVATE", label: "Privada (arancelada)",  description: "Mayor flexibilidad horaria" },
      { value: "ANY",     label: "Me es indiferente",     description: "Lo que mejor se adapte" },
    ],
  },
  {
    // Las opciones de provincia se inyectan en runtime desde
    // /api/universities/locations (ver `phase3QuestionsForRender`). Solo afecta
    // el orden de las universidades dentro de cada carrera en los resultados,
    // no el ranking de carreras.
    id: "location",
    text: "¿En qué provincia preferís estudiar?",
    options: [
      { value: "ANY", label: "Me es indiferente", description: "Cualquier provincia está bien" },
    ],
  },
  {
    id: "duration",
    text: "¿Cuántos años máximos querés dedicarle a la carrera?",
    options: [
      { value: "4", label: "Hasta 4 años", description: "Licenciaturas cortas y tecnicaturas" },
      { value: "5", label: "Hasta 5 años", description: "La mayoría de las carreras" },
      { value: "6", label: "6 años o más", description: "Medicina, arquitectura y similares" },
    ],
  },
  // "mobility" no aplica filtros. "priority=PRESTIGE" sí modifica el ranking
  // de resultados a través de calcFinalScore().
  {
    id: "mobility",
    text: "¿Estás dispuesto/a a mudarte o viajar para estudiar?",
    options: [
      { value: "RELOCATE", label: "Me mudo a otra ciudad", description: "Sin límite de distancia" },
      { value: "COMMUTE",  label: "Viajo hasta 1 hora",    description: "Distancia razonable" },
      { value: "LOCAL",    label: "Cerca de donde vivo",   description: "Dentro de mi ciudad" },
    ],
  },
  {
    id: "priority",
    text: "Al elegir una facultad, ¿qué priorizás más?",
    options: [
      { value: "PRESTIGE",   label: "Prestigio académico",   description: "Reconocimiento del título en el mercado" },
      { value: "EMPLOYMENT", label: "Salida laboral",        description: "Alta demanda de profesionales" },
      { value: "COST",       label: "Costo accesible",       description: "Que no implique gastos elevados" },
      { value: "LOCATION",   label: "Ubicación conveniente", description: "Fácil acceso desde mi casa" },
    ],
  },
]

// página 1: Q0–Q2 (modalidad/tipo/ubicación) | página 2: Q3–Q5 (duración/movilidad/prioridad)
const PHASE3_PER_PAGE = 3
const TOTAL_PHASE3_PAGES = Math.ceil(PHASE3_QUESTIONS.length / PHASE3_PER_PAGE)

// ─── Pasos ────────────────────────────────────────────────────────────────────
// 0          = intro
// 1..P1      = fase 1 (4 páginas de 5 preguntas)
// P1+1..P1+3 = fase 2 (una página por cada top área, 5 preguntas c/u)
// P1+4..P1+5 = fase 3 (2 páginas con preferencias prácticas)
// P1+6       = guardar
// P1+7       = resultados

const P1 = TOTAL_PHASE1_PAGES
const PHASE2_FIRST = P1 + 1
const PHASE2_LAST  = P1 + 3
const PHASE3_FIRST = P1 + 4
const PHASE3_LAST  = P1 + TOTAL_PHASE3_PAGES + 3
const SAVE_STEP    = PHASE3_LAST + 1
const RESULT_STEP  = PHASE3_LAST + 2

// La cantidad de preguntas de fase 2 ya no es fija (5 por área x 3 áreas):
// cada área tiene una cantidad distinta de preguntas según cuántas categorías
// viejas absorbió (ver AREA_CAREER_QUESTIONS). Se calcula según el top3 real;
// antes de conocerlo (pantalla de intro) se usa 15 como estimación, que es
// además el promedio real (10+5+15+5+5)/5 ≈ 8, pero 15 preserva el número
// que ya se mostraba históricamente en la intro.
function getGlobalTotal(top3Areas: string[]): number {
  const phase2Count = top3Areas.length > 0
    ? top3Areas.reduce((sum, a) => sum + (AREA_CAREER_QUESTIONS[a]?.length ?? 0), 0)
    : 15
  return PHASE1_QUESTIONS.length + phase2Count + PHASE3_QUESTIONS.length
}

// ─── Ranking de carreras ──────────────────────────────────────────────────────

const MIN_RESULTS = 4
const AFFINITY_THRESHOLD = 50

// ─── Generación de respuestas aleatorias (testing) ───────────────────────────

// Genera un perfil completo con respuestas aleatorias, listo para guardar con
// saveProfile(). Útil para probar la pantalla de resultados sin completar el
// test manualmente (p. ej. en un build limpio sin perfil guardado).
export function generateRandomProfile(forcePriority?: "PRESTIGE" | "EMPLOYMENT" | "COST" | "LOCATION") {
  const p1: Record<number, number> = {}
  PHASE1_QUESTIONS.forEach((_, i) => { p1[i] = Math.floor(Math.random() * 5) })

  const scores = calcPhase1Scores(p1)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top3 = sorted.slice(0, 3).map(([name]) => name)

  const p2: Record<string, number> = {}
  top3.forEach((area, ai) => {
    ;(AREA_CAREER_QUESTIONS[area] ?? []).forEach((_, qi) => {
      p2[`${ai}_${qi}`] = Math.floor(Math.random() * 5)
    })
  })

  const p3: Record<string, string> = {}
  PHASE3_QUESTIONS.forEach(q => {
    p3[q.id] = q.id === "priority" && forcePriority
      ? forcePriority
      : q.options[Math.floor(Math.random() * q.options.length)].value
  })

  const topArea = sorted[0]?.[0] ?? ""

  return {
    phase1Answers: p1,
    phase2Answers: p2,
    phase3Answers: p3,
    scores,
    sorted,
    top3,
    topArea,
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function VocationalTest({
  skipIntro = false,
  forceIntro = false,
  onClose,
  onResultsView,
}: {
  skipIntro?: boolean
  forceIntro?: boolean
  onClose?: () => void
  onResultsView?: (isResults: boolean) => void
} = {}) {
  const { saveProfile, profile, hydrated } = useVocationalProfile()

  const [step, setStep] = useState(skipIntro ? 1 : 0)
  const [phase1Answers, setPhase1Answers] = useState<Record<number, number>>({})
  const [phase2Answers, setPhase2Answers] = useState<Record<string, number>>({})
  const [phase3Answers, setPhase3Answers] = useState<Record<string, string>>({})
  const [top3Areas, setTop3Areas] = useState<string[]>([])
  // puntajes cargados desde el perfil guardado (sin haber re-hecho el test)
  const [savedScores, setSavedScores] = useState<[string, number][] | null>(null)
  const [personName, setPersonName] = useState("")
  const [areas, setAreas] = useState<Area[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [careers, setCareers] = useState<CareerResult[]>([])
  const [careerScores, setCareerScores] = useState<Record<string, number>>({})
  const [loadingCareers, setLoadingCareers] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data: Area[]) => setAreas(data))
      .catch(() => {})
    fetch("/api/universities/locations")
      .then((r) => r.json())
      .then((data: string[]) => setLocations(data))
      .catch(() => {})
  }, [])

  // PHASE3_QUESTIONS con las opciones de provincia inyectadas en la pregunta
  // de ubicación. Las provincias vienen del dataset (sin repetidos).
  const phase3QuestionsForRender = useMemo<Phase3Question[]>(
    () =>
      PHASE3_QUESTIONS.map((q) =>
        q.id === "location"
          ? {
              ...q,
              options: [
                ...q.options,
                ...locations.map((p) => ({ value: p, label: p, description: "" })),
              ],
            }
          : q
      ),
    [locations]
  )

  const phase1Scores = calcPhase1Scores(phase1Answers)
  // savedScores tiene prioridad cuando se cargan resultados previos del perfil
  const sortedPhase1 = savedScores ?? Object.entries(phase1Scores).sort((a, b) => b[1] - a[1])

  async function viewSavedResults() {
    if (!profile) return
    const sorted = Object.entries(profile.scores).sort((a, b) => b[1] - a[1])
    const top3 = sorted.slice(0, 3).map(([name]) => name)
    setSavedScores(sorted)
    setTop3Areas(top3)
    setPersonName(profile.personName ?? "")
    // Restauramos las respuestas de fase 2 guardadas para recomputar la afinidad
    // con carreras; sin esto la fase 2 mostraría 0% al cargar resultados previos.
    const savedPhase2 = profile.phase2Answers ?? {}
    setPhase2Answers(savedPhase2)
    setCareerScores(calcCareerScores(savedPhase2, top3))
    if (profile.phase3Answers) setPhase3Answers(profile.phase3Answers)
    setSaved(true)
    setStep(RESULT_STEP)

    setLoadingCareers(true)
    const top3Ids = top3
      .map((name) => areas.find((a) => a.name === name)?.id)
      .filter(Boolean) as string[]
    try {
      const results = await Promise.all(
        top3Ids.map((id) =>
          fetch(`/api/careers?areaId=${id}&pageSize=10000`)
            .then((r) => r.json())
            .then((j) => j.data as CareerResult[])
        )
      )
      const merged: CareerResult[] = []
      const seen = new Set<string>()
      for (const list of results) {
        for (const c of list) {
          if (!seen.has(c.id)) { seen.add(c.id); merged.push(c) }
        }
      }
      const cs = calcCareerScores(savedPhase2, top3)
      const prestige = profile.phase3Answers?.["priority"] === "PRESTIGE"
      merged.sort((a, b) =>
        calcFinalScore(getCareerAffinity(cs, b.name), b.rating, b.university.rating, prestige) -
        calcFinalScore(getCareerAffinity(cs, a.name), a.rating, a.university.rating, prestige)
      )
      setCareers(merged)
    } catch {
      // silently ignore
    } finally {
      setLoadingCareers(false)
    }
  }

  function advanceToPhase2() {
    setTop3Areas(sortedPhase1.slice(0, 3).map(([name]) => name))
    setStep(PHASE2_FIRST)
  }

  async function handleSaveAndShowResults() {
    setSaving(true)
    const scores = phase1Scores
    const topArea = sortedPhase1[0]?.[0] ?? ""
    const computed = calcCareerScores(phase2Answers, top3Areas)
    setCareerScores(computed)

    saveProfile({ scores, topArea, personName: personName.trim() || undefined, phase2Answers, phase3Answers })
    setSaved(true)
    setSaving(false)

    setLoadingCareers(true)
    const top3Ids = top3Areas
      .map((name) => areas.find((a) => a.name === name)?.id)
      .filter(Boolean) as string[]

    try {
      const results = await Promise.all(
        top3Ids.map((id) =>
          fetch(`/api/careers?areaId=${id}&pageSize=10000`)
            .then((r) => r.json())
            .then((j) => j.data as CareerResult[])
        )
      )
      const merged: CareerResult[] = []
      const seen = new Set<string>()
      for (const list of results) {
        for (const c of list) {
          if (!seen.has(c.id)) { seen.add(c.id); merged.push(c) }
        }
      }

      const prestige = phase3Answers["priority"] === "PRESTIGE"
      merged.sort((a, b) =>
        calcFinalScore(getCareerAffinity(computed, b.name), b.rating, b.university.rating, prestige) -
        calcFinalScore(getCareerAffinity(computed, a.name), a.rating, a.university.rating, prestige)
      )
      setCareers(merged)
    } catch {
      // silently ignore
    } finally {
      setLoadingCareers(false)
    }

    setStep(RESULT_STEP)
  }

  function reset() {
    setStep(0)
    setPhase1Answers({})
    setPhase2Answers({})
    setPhase3Answers({})
    setSavedScores(null)
    setTop3Areas([])
    setPersonName("")
    setCareers([])
    setCareerScores({})
    setSaved(false)
  }

  async function fillRandomAndSave(forcePriority?: "PRESTIGE" | "EMPLOYMENT") {
    const { phase1Answers: p1, phase2Answers: p2, phase3Answers: p3, scores, sorted, top3, topArea } = generateRandomProfile(forcePriority)
    // generateRandomProfile no conoce las provincias (se cargan en runtime),
    // así que para que el botón de dev ejercite el orden por ubicación elegimos
    // una provincia real al azar acá.
    if (locations.length > 0) p3["location"] = locations[Math.floor(Math.random() * locations.length)]
    const computed = calcCareerScores(p2, top3)

    setPhase1Answers(p1)
    setPhase2Answers(p2)
    setPhase3Answers(p3)
    setTop3Areas(top3)
    setCareerScores(computed)
    setSavedScores(sorted)
    setPersonName("Dev")
    saveProfile({ scores, topArea, personName: "Dev", phase2Answers: p2, phase3Answers: p3 })
    setSaved(true)
    setStep(RESULT_STEP)

    setLoadingCareers(true)
    const top3Ids = top3.map(name => areas.find(a => a.name === name)?.id).filter(Boolean) as string[]
    try {
      const results = await Promise.all(
        top3Ids.map(id =>
          fetch(`/api/careers?areaId=${id}&pageSize=10000`)
            .then(r => r.json())
            .then(j => j.data as CareerResult[])
        )
      )
      const merged: CareerResult[] = []
      const seen = new Set<string>()
      for (const list of results) {
        for (const c of list) {
          if (!seen.has(c.id)) { seen.add(c.id); merged.push(c) }
        }
      }
      merged.sort((a, b) =>
        calcFinalScore(getCareerAffinity(computed, b.name), b.rating, b.university.rating, p3["priority"] === "PRESTIGE") -
        calcFinalScore(getCareerAffinity(computed, a.name), a.rating, a.university.rating, p3["priority"] === "PRESTIGE")
      )
      setCareers(merged)
    } catch {}
    finally { setLoadingCareers(false) }
  }

  // Auto-carga resultados guardados en cuanto están disponibles los datos de áreas
  useEffect(() => {
    if (!forceIntro && hydrated && profile && areas.length > 0 && step === 0) {
      viewSavedResults()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile, areas.length])

  // Notifica al contenedor si estamos mostrando la pantalla de resultados, para
  // que pueda ajustar el ancho disponible (resultados/comparador ocupan todo el
  // ancho, el resto del flujo queda centrado).
  useEffect(() => {
    onResultsView?.(step === RESULT_STEP)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ── Cargando (esperando hidratación o áreas cuando hay perfil guardado) ──
  if (!hydrated || (!forceIntro && profile && areas.length === 0 && step === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Intro ──
  if (step === 0) {
    if (skipIntro) { onClose?.(); return null }
    return (
      <>
        <IntroScreen onStart={() => setStep(1)} />
        {process.env.NODE_ENV === "development" && (forceIntro || !onClose) && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5">
            <button
              onClick={() => fillRandomAndSave("PRESTIGE")}
              className="cursor-pointer rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-900 shadow-lg hover:bg-amber-300 transition-colors"
            >
              ⭐ Con prestigio
            </button>
            <button
              onClick={() => fillRandomAndSave("EMPLOYMENT")}
              className="cursor-pointer rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-yellow-900 shadow-lg hover:bg-yellow-300 transition-colors"
            >
              🎲 Sin prestigio
            </button>
          </div>
        )}
      </>
    )
  }

  // ── Fase 1 ──
  if (step >= 1 && step <= P1) {
    const pageIndex = step - 1
    const start = pageIndex * PHASE1_PER_PAGE
    const pageQs = PHASE1_QUESTIONS.slice(start, start + PHASE1_PER_PAGE)
    const allAnswered = pageQs.every((_, i) => phase1Answers[start + i] !== undefined)

    return (
      <QuestionScreen
        absoluteStart={start}
        globalTotal={getGlobalTotal(top3Areas)}
        questions={pageQs.map((q) => q.text)}
        answers={Object.fromEntries(
          Object.entries(phase1Answers)
            .filter(([k]) => Number(k) >= start && Number(k) < start + PHASE1_PER_PAGE)
            .map(([k, v]) => [Number(k) - start, v])
        )}
        allAnswered={allAnswered}
        isLast={false}
        onAnswer={(qi, val) => setPhase1Answers((prev) => ({ ...prev, [start + qi]: val }))}
        onNext={() => (step < P1 ? setStep(step + 1) : advanceToPhase2())}
        onBack={() => {
          if (skipIntro && step === 1) { onClose?.() } else { setStep(step - 1) }
        }}
      />
    )
  }

  // ── Fase 2 ──
  if (step >= PHASE2_FIRST && step <= PHASE2_LAST) {
    const areaIndex = step - PHASE2_FIRST
    const areaName = top3Areas[areaIndex] ?? ""
    const qs = AREA_CAREER_QUESTIONS[areaName] ?? []
    const allAnswered = qs.every((_, qi) => phase2Answers[`${areaIndex}_${qi}`] !== undefined)
    // Cada área tiene una cantidad distinta de preguntas (ver
    // AREA_CAREER_QUESTIONS), así que el offset no puede ser areaIndex * 5.
    const precedingQuestionCount = top3Areas
      .slice(0, areaIndex)
      .reduce((sum, a) => sum + (AREA_CAREER_QUESTIONS[a]?.length ?? 0), 0)

    return (
      <QuestionScreen
        absoluteStart={PHASE1_QUESTIONS.length + precedingQuestionCount}
        globalTotal={getGlobalTotal(top3Areas)}
        questions={qs.map((q) => q.text)}
        answers={Object.fromEntries(
          Object.entries(phase2Answers)
            .filter(([k]) => k.startsWith(`${areaIndex}_`))
            .map(([k, v]) => [parseInt(k.split("_")[1]), v])
        )}
        allAnswered={allAnswered}
        isLast={false}
        onAnswer={(qi, val) =>
          setPhase2Answers((prev) => ({ ...prev, [`${areaIndex}_${qi}`]: val }))
        }
        onNext={() => (step < PHASE2_LAST ? setStep(step + 1) : setStep(PHASE3_FIRST))}
        onBack={() => setStep(step - 1)}
      />
    )
  }

  // ── Fase 3 ──
  if (step >= PHASE3_FIRST && step <= PHASE3_LAST) {
    const pageIndex = step - PHASE3_FIRST
    const start = pageIndex * PHASE3_PER_PAGE
    const pageQs = phase3QuestionsForRender.slice(start, start + PHASE3_PER_PAGE)
    const allAnswered = pageQs.every((q) => phase3Answers[q.id] !== undefined)
    const phase2QuestionCount = top3Areas.reduce((sum, a) => sum + (AREA_CAREER_QUESTIONS[a]?.length ?? 0), 0)

    return (
      <Phase3Screen
        questions={pageQs}
        answers={phase3Answers}
        allAnswered={allAnswered}
        isLast={step === PHASE3_LAST}
        absoluteStart={PHASE1_QUESTIONS.length + phase2QuestionCount + start}
        globalTotal={getGlobalTotal(top3Areas)}
        onAnswer={(id, val) => setPhase3Answers((prev) => ({ ...prev, [id]: val }))}
        onNext={() => (step < PHASE3_LAST ? setStep(step + 1) : setStep(SAVE_STEP))}
        onBack={() => setStep(step - 1)}
      />
    )
  }

  // ── Guardar ──
  if (step === SAVE_STEP) {
    return (
      <SaveScreen
        personName={personName}
        saving={saving}
        onNameChange={setPersonName}
        onConfirm={handleSaveAndShowResults}
        onBack={() => setStep(PHASE3_LAST)}
      />
    )
  }

  // ── Resultados ──
  return (
    <ResultsScreen
      sortedPhase1={sortedPhase1}
      top3Areas={top3Areas}
      careers={careers}
      careerScores={careerScores}
      phase3Answers={phase3Answers}
      loadingCareers={loadingCareers}
      saved={saved}
      personName={personName}
      onReset={reset}
    />
  )
}

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-8 max-w-2xl mx-auto text-center">
      <div className="space-y-4">
        <div className="text-6xl">🎓</div>
        <h1 className="text-3xl font-bold tracking-tight">Test de orientación vocacional</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Respondé{" "}
          <span className="font-semibold text-foreground">
            {getGlobalTotal([])} preguntas
          </span>{" "}
          sobre tus intereses y preferencias para descubrir qué carrera universitaria se adapta mejor a vos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full text-sm">
        {Object.entries(AREA_EMOJIS).map(([name, emoji]) => (
          <div key={name} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-left">
            <span className="text-xl">{emoji}</span>
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onStart} className="gap-2 px-8">
        Comenzar
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

// ─── Pantalla de preguntas (Likert) ───────────────────────────────────────────

function QuestionScreen({
  absoluteStart,
  globalTotal,
  questions,
  answers,
  allAnswered,
  isLast,
  onAnswer,
  onNext,
  onBack,
}: {
  absoluteStart: number
  globalTotal: number
  questions: string[]
  answers: Record<number, number>
  allAnswered: boolean
  isLast: boolean
  onAnswer: (qi: number, val: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const progress = (absoluteStart / globalTotal) * 100

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8 gap-6">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {absoluteStart + 1}–{absoluteStart + questions.length} de {globalTotal}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Preguntas */}
      <div className="flex flex-col gap-8">
        {questions.map((text, i) => {
          const qi = i
          const selected = answers[qi]
          return (
            <div key={absoluteStart + i} className="space-y-3">
              <p className="font-medium leading-relaxed">
                <span className="text-muted-foreground mr-2">{absoluteStart + i + 1}.</span>
                {text}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onAnswer(qi, opt.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 py-2.5 px-1 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected === opt.value
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.04]"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className={`text-lg leading-none ${selected === opt.value ? "" : "grayscale"}`}>
                      {opt.emoji}
                    </span>
                    <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navegación */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!allAnswered} className="gap-2">
          {isLast ? "Finalizar" : "Siguiente"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Pantalla de preferencias prácticas (fase 3) ─────────────────────────────

function Phase3Screen({
  questions,
  answers,
  allAnswered,
  isLast,
  absoluteStart,
  globalTotal,
  onAnswer,
  onNext,
  onBack,
}: {
  questions: Phase3Question[]
  answers: Record<string, string>
  allAnswered: boolean
  isLast: boolean
  absoluteStart: number
  globalTotal: number
  onAnswer: (id: string, val: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const progress = (absoluteStart / globalTotal) * 100

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8 gap-6">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {absoluteStart + 1}–{absoluteStart + questions.length} de {globalTotal}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Preguntas de selección única */}
      <div className="flex flex-col gap-8">
        {questions.map((q, i) => {
          const selected = answers[q.id]
          return (
            <div key={q.id} className="space-y-3">
              <p className="font-medium leading-relaxed">
                <span className="text-muted-foreground mr-2">{absoluteStart + i + 1}.</span>
                {q.text}
              </p>
              {/* La pregunta de ubicación usa un dropdown: tiene ~25 provincias y
                  una lista de radios sería demasiado larga. El resto siguen como
                  botones de selección única. */}
              {q.id === "location" ? (
                <Select value={selected} onValueChange={(v) => onAnswer(q.id, v ?? "ANY")}>
                  <SelectTrigger className="w-full px-3">
                    <span className={`flex-1 text-left text-sm truncate ${selected ? "" : "text-muted-foreground"}`}>
                      {q.options.find((o) => o.value === selected)?.label ?? "Elegí una provincia"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onAnswer(q.id, opt.value)}
                      className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected === opt.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`size-4 rounded-full border-2 shrink-0 transition-colors ${
                          selected === opt.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        }`}
                      />
                      <div>
                        <p className={`text-sm font-medium ${selected === opt.value ? "text-primary" : ""}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Navegación */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!allAnswered} className="gap-2">
          {isLast ? "Finalizar" : "Siguiente"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Guardar ──────────────────────────────────────────────────────────────────

function SaveScreen({
  personName,
  saving,
  onNameChange,
  onConfirm,
  onBack,
}: {
  personName: string
  saving: boolean
  onNameChange: (v: string) => void
  onConfirm: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-md mx-auto gap-8 text-center">
      <div className="space-y-3">
        <div className="text-5xl">💾</div>
        <h2 className="text-2xl font-bold">¡Test completado!</h2>
        <p className="text-muted-foreground leading-relaxed">
          Podés guardar tus resultados ingresando tu nombre, o continuar directamente para ver tu perfil.
        </p>
      </div>

      <div className="w-full space-y-3">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="name">Tu nombre (opcional)</Label>
          <Input
            id="name"
            placeholder="Ej: Lucía García"
            value={personName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          />
        </div>
        <Button className="w-full gap-2" onClick={onConfirm} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Guardando..." : "Guardar y ver resultados"}
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
        <ArrowLeft className="size-3" />
        Volver
      </Button>
    </div>
  )
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function ResultsCarousel({
  slide1,
  slide2,
  slide2Label,
  activeSlide,
  onSlideChange,
  navContainerClass = "",
  slide2RightAction,
}: {
  slide1: React.ReactNode
  slide2: React.ReactNode
  slide2Label: string
  activeSlide: number
  onSlideChange: (n: number) => void
  navContainerClass?: string
  slide2RightAction?: React.ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const slide2Ref = useRef<HTMLDivElement>(null)
  const [trackHeight, setTrackHeight] = useState<number>()

  function goTo(n: number) {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" })
  }

  function handleScroll() {
    const el = trackRef.current
    if (!el) return
    onSlideChange(Math.round(el.scrollLeft / el.clientWidth))
  }

  // Track height follows the active slide's content height, not the tallest of
  // the two — otherwise the inactive (off-screen) slide leaves a big empty gap
  // below the visible one. Re-measures whenever the active slide's content
  // resizes (e.g. comparator data finishes loading).
  useLayoutEffect(() => {
    const el = activeSlide === 0 ? slide1Ref.current : slide2Ref.current
    if (!el) return

    const update = () => setTrackHeight(el.scrollHeight)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeSlide])

  return (
    <div className="space-y-3">
      {/* Navigation bar — optionally constrained to match slide 1 width */}
      <div className={navContainerClass}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex justify-start">
            {activeSlide !== 0 && (
              <button
                onClick={() => goTo(0)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-sm hover:bg-muted/40 hover:border-primary/40 transition-colors"
              >
                <ArrowLeft className="size-4" />
                Resultados
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`cursor-pointer size-2 rounded-full transition-colors ${
                  activeSlide === i ? "bg-primary" : "bg-muted hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <div className="flex-1 flex justify-end">
            {activeSlide !== 1 ? (
              <button
                onClick={() => goTo(1)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
              >
                {slide2Label}
                <ArrowRight className="size-4" />
              </button>
            ) : (slide2RightAction ?? null)}
          </div>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={trackHeight !== undefined ? { height: trackHeight } : undefined}
        className="flex items-start overflow-x-scroll overflow-y-hidden snap-x snap-mandatory scroll-smooth transition-[height] duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={slide1Ref} className="min-w-full shrink-0 snap-start">{slide1}</div>
        <div ref={slide2Ref} className="min-w-full shrink-0 snap-start">{slide2}</div>
      </div>
    </div>
  )
}

// ─── Resultados ───────────────────────────────────────────────────────────────

function ResultsScreen({
  sortedPhase1,
  top3Areas,
  careers,
  careerScores,
  phase3Answers,
  loadingCareers,
  saved,
  personName,
  onReset,
}: {
  sortedPhase1: [string, number][]
  top3Areas: string[]
  careers: CareerResult[]
  careerScores: Record<string, number>
  phase3Answers: Record<string, string>
  loadingCareers: boolean
  saved: boolean
  personName: string
  onReset: () => void
}) {
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set())
  const [activeSlide, setActiveSlide] = useState(0)
  const { set: setCompareIds } = useCompareCareers()

  const prioritizePrestige = phase3Answers["priority"] === "PRESTIGE"

  const radarData = sortedPhase1.map(([name, score]) => ({
    area: name.replace("Ciencias ", "Cs. ").replace(" y ", "\ny "),
    score,
  }))

  const medals = ["🥇", "🥈", "🥉"]

  // Memoize derived arrays so their references are stable across re-renders.
  // Without this, .map().sort() creates new objects every render, which causes
  // the useEffect below to see a changed dependency on every render and loop.
  const scoredCareers = useMemo(() =>
    careers
      .map(c => {
        const affinity = getCareerAffinity(careerScores, c.name)
        return { ...c, affinity, finalScore: calcFinalScore(affinity, c.rating, c.university.rating, prioritizePrestige) }
      })
      .sort((a, b) => b.finalScore - a.finalScore),
    [careers, careerScores, prioritizePrestige]
  )

  const filteredByView = useMemo(() => {
    const base = selectedAreas.size === 0
      ? scoredCareers
      : scoredCareers.filter(c => selectedAreas.has(c.area.name))

    const highAffinity = base.filter(c => c.affinity >= AFFINITY_THRESHOLD)
    return highAffinity.length >= MIN_RESULTS ? highAffinity : base
  }, [scoredCareers, selectedAreas])

  // Agrupa las carreras por nombre (ver careerGroupKey): "Abogado" en 73
  // universidades pasa a ser UN card con sus 73 universidades adentro. El orden
  // entre grupos respeta el finalScore ya calculado (afinidad + prestigio), así
  // que el badge "Ordenadas por prestigio" sigue aplicando.
  const groupedCareers = useMemo<GroupedCareer[]>(() => {
    const groups = new Map<string, GroupedCareer>()
    for (const c of filteredByView) {
      const key = careerGroupKey(c.name)
      const existing = groups.get(key)
      if (existing) {
        existing.universities.push(c)
      } else {
        groups.set(key, {
          key,
          name: c.name,
          area: c.area,
          affinity: c.affinity,
          finalScore: c.finalScore,
          universities: [c],
        })
      }
    }
    return [...groups.values()]
  }, [filteredByView])

  // Layout: card destacado (#0) + hasta 3 secundarios (#1-3). Se muestran como
  // máximo 4 carreras: el resto se deja fuera a propósito para que la pantalla
  // quede concisa (las opciones de universidad ya viven dentro de cada card).
  const heroCareer = groupedCareers[0]
  const secondaryCareers = groupedCareers.slice(1, 4)

  // Razones de afinidad para un grupo (interés de fase 2 + área + preferencia
  // satisfecha por su mejor universidad). Solo se muestran en el card destacado.
  const reasonsFor = (g: GroupedCareer): string[] => {
    const areaScore = sortedPhase1.find(([n]) => n === g.area.name)?.[1] ?? 0
    const best = orderUniversities(g.universities, phase3Answers)[0]
    // modality es de la fila carrera-universidad; province/type, de la universidad.
    const bestUniversity = best
      ? { province: best.university.province, type: best.university.type, modality: best.modality }
      : null
    return buildReasons({
      careerName: g.name,
      careerScores,
      area: g.area.name,
      areaScore,
      bestUniversity,
      phase3Answers,
    })
  }

  // El comparador compara las mejores universidades de la carrera #1
  // (un genuino "dónde estudiar {carrera top}"), ordenadas igual que en el card.
  const comparisonIds = useMemo(() => {
    if (!heroCareer) return [] as string[]
    return orderUniversities(heroCareer.universities, phase3Answers)
      .slice(0, MAX_COMPARE)
      .map(c => c.id)
  }, [heroCareer, phase3Answers])
  const isSingle = comparisonIds.length === 1

  // Auto-sync into comparator (localStorage) whenever the IDs actually change
  useEffect(() => {
    if (comparisonIds.length > 0) setCompareIds(comparisonIds)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonIds])

  // Slide 2 data: comparison (N ≥ 2) or single career detail (N = 1)
  const { data: comparisonData, isLoading: comparisonLoading } = useQuery<CompareCareer[]>({
    queryKey: ["results-comparison", comparisonIds],
    queryFn: () => api.get(`careers/compare?ids=${comparisonIds.join(",")}`).json<CompareCareer[]>(),
    enabled: comparisonIds.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  const { data: singleData, isLoading: singleLoading } = useQuery<CareerDetailFull>({
    queryKey: ["results-single", comparisonIds[0]],
    queryFn: () => api.get(`careers/${comparisonIds[0]}`).json<CareerDetailFull>(),
    enabled: isSingle,
    staleTime: 5 * 60 * 1000,
  })

  const slide2Label = isSingle ? "Carrera" : "Comparar"

  function toggleArea(area: string) {
    setSelectedAreas(prev => {
      const next = new Set(prev)
      next.has(area) ? next.delete(area) : next.add(area)
      return next
    })
  }

  function clearAreas() {
    setSelectedAreas(new Set())
  }

  const slide2Content = comparisonIds.length === 0
    ? <EmptyState icon={Search} title="Sin carreras para comparar" description="Ajustá los filtros de área para ver resultados." />
    : isSingle
      ? <CareerDetailPanel data={singleData} isLoading={singleLoading} careerScores={careerScores} />
      : <ComparisonPanel data={comparisonData} isLoading={comparisonLoading} careerScores={careerScores} selectedIds={comparisonIds} />

  return (
    <div className="py-8 space-y-6">

      {/* ── Encabezado ── */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
        <div className="text-5xl">🎯</div>
        <h1 className="text-2xl font-bold">
          {personName ? `Resultados de ${personName}` : "Tus resultados"}
        </h1>
        {saved && (
          <div className="inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-full">
            <CheckCircle className="size-3.5" />
            Resultados guardados
          </div>
        )}
      </div>

      <ResultsCarousel
        slide2={slide2Content}
        slide2Label={slide2Label}
        activeSlide={activeSlide}
        onSlideChange={setActiveSlide}
        navContainerClass="px-6 lg:px-8"
        slide2RightAction={
          !isSingle
            ? <ExportPDFButton careers={comparisonData} isLoading={comparisonLoading} />
            : undefined
        }
        slide1={<div className="p-6 lg:p-8 space-y-10">

      {/* ── Top 3 áreas ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tus 3 áreas con mayor afinidad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3Areas.map((name, i) => {
            const score = sortedPhase1.find(([n]) => n === name)?.[1] ?? 0
            const color = AREA_COLORS[name] ?? "hsl(var(--primary))"
            return (
              <div
                key={name}
                className="relative rounded-xl border bg-card p-4 space-y-3 overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: color }}
                />
                <div className="pl-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{medals[i]}</span>
                    <span className="text-2xl font-bold tabular-nums" style={{ color }}>
                      {score}%
                    </span>
                  </div>
                  <p className="font-semibold text-sm leading-snug">
                    {AREA_EMOJIS[name]} {name}
                  </p>
                </div>
                <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Carreras más compatibles: ranked list + toggle + comparador ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Trophy className="size-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Carreras más compatibles</h2>
          {prioritizePrestige && (
            <span className="text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 font-medium">
              ⭐ Ordenadas por prestigio
            </span>
          )}
        </div>

        {/* Area filter chips */}
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={clearAreas}
            className={`cursor-pointer rounded-full px-3 py-1.5 font-medium border transition-colors ${
              selectedAreas.size === 0
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            Todas las áreas
          </button>
          {top3Areas.map(area => {
            const active = selectedAreas.has(area)
            const color = AREA_COLORS[area] ?? "hsl(var(--primary))"
            return (
              <button
                key={area}
                onClick={() => toggleArea(area)}
                className={`cursor-pointer rounded-full px-3 py-1.5 font-medium border transition-colors ${
                  active
                    ? "text-foreground"
                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
                }`}
                style={active ? { borderColor: color, backgroundColor: `${color}18` } : undefined}
              >
                {AREA_EMOJIS[area]} {area}
              </button>
            )
          })}
        </div>

        {loadingCareers ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredByView.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No hay carreras disponibles para esta selección.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Card destacado: carrera #1 */}
            {heroCareer && (
              <CareerResultCard
                career={heroCareer}
                variant="hero"
                reasons={reasonsFor(heroCareer)}
                phase3Answers={phase3Answers}
              />
            )}

            {/* Secundarias: #2-4, en grilla compacta. No se muestra nada más. */}
            {secondaryCareers.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {secondaryCareers.map((g) => (
                  <CareerResultCard key={g.key} career={g} variant="secondary" reasons={[]} phase3Answers={phase3Answers} />
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      {/* ── Perfil completo (radar) ── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-muted-foreground">Perfil completo de intereses</h2>
        <Card>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fontSize: 10, fill: "var(--foreground)" }}
                />
                <Radar
                  name="Puntaje"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value}%`, "Afinidad"]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── Acciones ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="size-4" />
          Hacer el test de nuevo
        </Button>
        <Link
          href="/carreras"
          className={buttonVariants({ variant: "default", className: "gap-2" })}
        >
          <GraduationCap className="size-4" />
          Explorar todas las carreras
        </Link>
      </div>
        </div>}
      />
    </div>
  )
}
