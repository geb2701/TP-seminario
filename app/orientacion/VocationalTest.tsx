"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  GraduationCap,
  Trophy,
  Save,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { AREA_COLORS, AREA_EMOJIS } from "./constants"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Area {
  id: string
  name: string
}

interface CareerResult {
  id: string
  name: string
  durationYears: number
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  rating: number | null
  university: { id: string; name: string; city: string; type: "PUBLIC" | "PRIVATE" }
  area: { id: string; name: string }
}

// ─── Áreas ───────────────────────────────────────────────────────────────────

const AREAS = [
  "Ingeniería y Tecnología",
  "Ciencias de la Salud",
  "Ciencias Económicas",
  "Derecho y Ciencias Sociales",
  "Humanidades y Artes",
  "Ciencias Exactas y Naturales",
  "Arquitectura y Diseño",
  "Comunicación y Periodismo",
]

// AREA_COLORS y AREA_EMOJIS viven en ./constants (compartidos con el banner de perfil).

// ─── Fase 1: preguntas generales con pesos cruzados ──────────────────────────

interface Phase1Question {
  text: string
  weights: Partial<Record<string, number>>
}

const PHASE1_QUESTIONS: Phase1Question[] = [
  {
    text: "Me resulta fácil entender cómo funcionan los aparatos o sistemas tecnológicos.",
    weights: { "Ingeniería y Tecnología": 1.0, "Ciencias Exactas y Naturales": 0.6 },
  },
  {
    text: "Disfruto ayudando a personas que atraviesan dificultades físicas o emocionales.",
    weights: { "Ciencias de la Salud": 1.0, "Derecho y Ciencias Sociales": 0.5, "Humanidades y Artes": 0.5 },
  },
  {
    text: "Me gusta analizar números, estadísticas o tendencias para tomar decisiones.",
    weights: { "Ciencias Económicas": 1.0, "Ciencias Exactas y Naturales": 0.7, "Ingeniería y Tecnología": 0.4 },
  },
  {
    text: "Soy hábil para expresar mis ideas y convencer a otros con argumentos sólidos.",
    weights: { "Derecho y Ciencias Sociales": 1.0, "Comunicación y Periodismo": 0.8, "Humanidades y Artes": 0.4 },
  },
  {
    text: "Me apasiona crear: diseñar objetos, espacios o experiencias visuales.",
    weights: { "Arquitectura y Diseño": 1.0, "Humanidades y Artes": 0.7, "Ingeniería y Tecnología": 0.3 },
  },
  {
    text: "Me interesa conocer el funcionamiento interno del cuerpo humano o de los seres vivos.",
    weights: { "Ciencias de la Salud": 1.0, "Ciencias Exactas y Naturales": 0.9 },
  },
  {
    text: "Disfruto resolver problemas matemáticos o lógicos que requieren razonamiento abstracto.",
    weights: { "Ciencias Exactas y Naturales": 1.0, "Ingeniería y Tecnología": 0.8, "Ciencias Económicas": 0.4 },
  },
  {
    text: "Me gusta planificar, coordinar equipos y optimizar el uso de los recursos disponibles.",
    weights: { "Ciencias Económicas": 1.0, "Ingeniería y Tecnología": 0.5, "Derecho y Ciencias Sociales": 0.4 },
  },
  {
    text: "Me interesa la historia, la filosofía o las expresiones culturales de distintas sociedades.",
    weights: { "Humanidades y Artes": 1.0, "Derecho y Ciencias Sociales": 0.6, "Comunicación y Periodismo": 0.3 },
  },
  {
    text: "Puedo visualizar mentalmente cómo quedaría un espacio o estructura antes de construirla.",
    weights: { "Arquitectura y Diseño": 1.0, "Ingeniería y Tecnología": 0.5, "Ciencias Exactas y Naturales": 0.3 },
  },
  {
    text: "Me preocupa profundamente la justicia, la igualdad y los derechos de las personas.",
    weights: { "Derecho y Ciencias Sociales": 1.0, "Humanidades y Artes": 0.5, "Comunicación y Periodismo": 0.5 },
  },
  {
    text: "Disfruto contar historias, escribir o crear contenido que llegue a mucha gente.",
    weights: { "Comunicación y Periodismo": 1.0, "Humanidades y Artes": 0.8, "Arquitectura y Diseño": 0.3 },
  },
  {
    text: "Me gusta experimentar con fenómenos naturales, químicos o físicos en la práctica.",
    weights: { "Ciencias Exactas y Naturales": 1.0, "Ciencias de la Salud": 0.6, "Ingeniería y Tecnología": 0.3 },
  },
  {
    text: "Me motiva identificar oportunidades de negocio y llevar ideas innovadoras al mercado.",
    weights: { "Ciencias Económicas": 1.0, "Ingeniería y Tecnología": 0.5, "Comunicación y Periodismo": 0.4 },
  },
  {
    text: "Disfruto hablar en público, debatir ideas o entrevistar a otras personas.",
    weights: { "Comunicación y Periodismo": 1.0, "Derecho y Ciencias Sociales": 0.8, "Humanidades y Artes": 0.4 },
  },
  {
    text: "Me atrae combinar ciencia y tecnología para mejorar la salud de las personas.",
    weights: { "Ciencias de la Salud": 1.0, "Ingeniería y Tecnología": 0.7, "Ciencias Exactas y Naturales": 0.6 },
  },
  {
    text: "Tengo sensibilidad estética: la belleza, el diseño y las formas visuales me importan.",
    weights: { "Arquitectura y Diseño": 1.0, "Humanidades y Artes": 0.8, "Comunicación y Periodismo": 0.3 },
  },
  {
    text: "Me interesa entender cómo los sistemas económicos afectan a las personas y los países.",
    weights: { "Ciencias Económicas": 1.0, "Derecho y Ciencias Sociales": 0.7, "Comunicación y Periodismo": 0.4 },
  },
  {
    text: "Me gusta la programación, la inteligencia artificial o la robótica.",
    weights: { "Ingeniería y Tecnología": 1.0, "Ciencias Exactas y Naturales": 0.6, "Ciencias Económicas": 0.3 },
  },
  {
    text: "Disfruto comprender las motivaciones y emociones de las personas que me rodean.",
    weights: {
      "Humanidades y Artes": 1.0,
      "Derecho y Ciencias Sociales": 0.6,
      "Ciencias de la Salud": 0.5,
      "Comunicación y Periodismo": 0.4,
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

// Normaliza nombres de carrera para comparar contra los que vienen de la DB.
// Unifica la forma Unicode (NFC) y recorta espacios para que diferencias de
// composición de acentos (p. ej. "í" vs "í") no rompan el matching.
function normalizeCareerName(name: string): string {
  return name.normalize("NFC").trim()
}

// TODO: migrar estas preguntas y pesos (fase 2) a la DB con un seed, en lugar de
// tenerlos hardcodeados acá. Así el matching deja de depender de strings literales.
const AREA_CAREER_QUESTIONS: Record<string, Phase2Question[]> = {
  "Ingeniería y Tecnología": [
    {
      text: "Prefiero desarrollar software y sistemas informáticos antes que trabajar con maquinaria física.",
      careerWeights: { "Ingeniería en Computación": 1.0, "Ingeniería en Sistemas": 1.0, "Ingeniería en Sistemas de Información": 1.0, "Ingeniería Informática": 1.0 },
    },
    {
      text: "Me interesa diseñar y construir infraestructura: rutas, puentes o instalaciones industriales.",
      careerWeights: { "Ingeniería Civil": 1.0, "Ingeniería Industrial": 0.8, "Ingeniería Electrónica": 0.4 },
    },
    {
      text: "Me atrae aplicar la ingeniería al sector agropecuario, los cultivos o el medioambiente.",
      careerWeights: { "Ingeniería Agronómica": 1.0 },
    },
    {
      text: "Me fascina el mundo de la electrónica, los circuitos, las telecomunicaciones y la automatización.",
      careerWeights: { "Ingeniería Electrónica": 1.0, "Ingeniería en Computación": 0.4 },
    },
    {
      text: "Me interesa gestionar procesos productivos, optimizar operaciones y mejorar la eficiencia industrial.",
      careerWeights: { "Ingeniería Industrial": 1.0, "Ingeniería Civil": 0.4 },
    },
  ],
  "Ciencias de la Salud": [
    {
      text: "Quiero atender pacientes humanos, hacer diagnósticos clínicos y tratamientos médicos.",
      careerWeights: { "Medicina": 1.0 },
    },
    {
      text: "Me interesa la salud bucal, la ortodoncia y los procedimientos odontológicos.",
      careerWeights: { "Odontología": 1.0, "Medicina": 0.3 },
    },
    {
      text: "Me apasionan los animales y quiero dedicarme a su salud y bienestar.",
      careerWeights: { "Medicina Veterinaria": 1.0 },
    },
    {
      text: "Me atrae la investigación médica y el desarrollo de nuevos tratamientos o fármacos.",
      careerWeights: { "Medicina": 1.0, "Odontología": 0.3 },
    },
    {
      text: "Me interesa la salud pública, la epidemiología y el impacto de las enfermedades en la sociedad.",
      careerWeights: { "Medicina": 0.9, "Medicina Veterinaria": 0.5 },
    },
  ],
  "Ciencias Económicas": [
    {
      text: "Me interesa llevar contabilidad, impuestos y las finanzas de empresas o personas.",
      careerWeights: { "Contador Público": 1.0, "Administración de Empresas": 0.5 },
    },
    {
      text: "Me atrae el análisis macroeconómico, los mercados financieros y las políticas económicas.",
      careerWeights: { "Economía": 1.0, "Economía Empresarial": 0.8 },
    },
    {
      text: "Me gusta la industria del turismo, la hotelería y la organización de eventos o destinos.",
      careerWeights: { "Licenciatura en Turismo": 1.0 },
    },
    {
      text: "Me interesa liderar organizaciones, tomar decisiones estratégicas y gestionar equipos.",
      careerWeights: { "Administración de Empresas": 1.0, "Economía Empresarial": 0.7, "Contador Público": 0.4 },
    },
    {
      text: "Me motiva emprender, crear negocios y analizar oportunidades en el mercado.",
      careerWeights: { "Administración de Empresas": 1.0, "Economía Empresarial": 0.9, "Economía": 0.5 },
    },
  ],
  "Derecho y Ciencias Sociales": [
    {
      text: "Me interesa el derecho corporativo, los contratos mercantiles y la asesoría a empresas.",
      careerWeights: { "Abogacía": 0.8, "Derecho": 0.8 },
    },
    {
      text: "Me apasionan los derechos humanos, la justicia social y la defensa de los más vulnerables.",
      careerWeights: { "Abogacía": 1.0, "Derecho": 1.0 },
    },
    {
      text: "Me interesa la litigación en juicio, el derecho penal y el trabajo en el sistema judicial.",
      careerWeights: { "Abogacía": 1.0, "Derecho": 1.0 },
    },
    {
      text: "Me atrae el derecho internacional, los tratados y la política exterior.",
      careerWeights: { "Abogacía": 0.9, "Derecho": 0.9 },
    },
    {
      text: "Me interesa la política, el derecho constitucional y cómo se diseñan las leyes.",
      careerWeights: { "Abogacía": 0.8, "Derecho": 0.8 },
    },
  ],
  "Humanidades y Artes": [
    {
      text: "Quiero dedicarme a la psicología clínica, la terapia o el acompañamiento de pacientes.",
      careerWeights: { "Psicología": 1.0 },
    },
    {
      text: "Me interesa la psicología educacional, organizacional o la investigación en psicología.",
      careerWeights: { "Psicología": 0.9 },
    },
    {
      text: "Me gusta comprender las motivaciones, emociones y comportamientos de las personas.",
      careerWeights: { "Psicología": 0.8 },
    },
    {
      text: "Me atrae trabajar en salud mental, intervenciones comunitarias y bienestar social.",
      careerWeights: { "Psicología": 1.0 },
    },
    {
      text: "Me interesa la neurociencia, los procesos cognitivos y cómo funciona la mente humana.",
      careerWeights: { "Psicología": 0.9 },
    },
  ],
  "Ciencias Exactas y Naturales": [
    {
      text: "Me fascina el ecosistema marino, la oceanografía y la investigación biológica del mar.",
      careerWeights: { "Biología Marina": 1.0 },
    },
    {
      text: "Me interesa la investigación en laboratorio sobre organismos vivos o ecosistemas naturales.",
      careerWeights: { "Biología Marina": 0.8 },
    },
    {
      text: "Quiero dedicarme a la ciencia básica y generar conocimiento desde la academia o el CONICET.",
      careerWeights: { "Biología Marina": 0.9 },
    },
    {
      text: "Me atrae la conservación de la biodiversidad y el estudio del impacto ambiental.",
      careerWeights: { "Biología Marina": 0.9 },
    },
    {
      text: "Me interesa el trabajo de campo en la naturaleza: muestras, expediciones y relevamientos.",
      careerWeights: { "Biología Marina": 1.0 },
    },
  ],
  "Arquitectura y Diseño": [
    {
      text: "Quiero diseñar edificios y espacios habitables, gestionando todo el proceso constructivo.",
      careerWeights: { "Arquitectura": 1.0 },
    },
    {
      text: "Me interesa el diseño urbano, la planificación territorial y los espacios públicos.",
      careerWeights: { "Arquitectura": 1.0 },
    },
    {
      text: "Me atrae combinar arte y técnica en el diseño de interiores o la renovación de espacios.",
      careerWeights: { "Arquitectura": 0.8 },
    },
    {
      text: "Me apasiona trabajar con planos, maquetas y herramientas de diseño asistido por computadora.",
      careerWeights: { "Arquitectura": 1.0 },
    },
    {
      text: "Me interesa la arquitectura sustentable, el uso de materiales ecológicos y el bioclima.",
      careerWeights: { "Arquitectura": 0.9 },
    },
  ],
  "Comunicación y Periodismo": [
    {
      text: "Quiero trabajar en medios de comunicación, hacer periodismo o producir contenido informativo.",
      careerWeights: { "Comunicación Social": 1.0 },
    },
    {
      text: "Me interesa la comunicación institucional, el marketing o las relaciones públicas.",
      careerWeights: { "Comunicación Social": 0.9 },
    },
    {
      text: "Me atrae la producción audiovisual, los podcasts o el contenido digital en redes.",
      careerWeights: { "Comunicación Social": 0.9 },
    },
    {
      text: "Me gusta investigar, redactar notas periodísticas y contar historias de impacto social.",
      careerWeights: { "Comunicación Social": 1.0 },
    },
    {
      text: "Me interesa la comunicación política, la opinión pública y el análisis de medios.",
      careerWeights: { "Comunicación Social": 0.8 },
    },
  ],
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
    id: "duration",
    text: "¿Cuántos años máximos querés dedicarle a la carrera?",
    options: [
      { value: "4", label: "Hasta 4 años", description: "Licenciaturas cortas y tecnicaturas" },
      { value: "5", label: "Hasta 5 años", description: "La mayoría de las carreras" },
      { value: "6", label: "6 años o más", description: "Medicina, arquitectura y similares" },
    ],
  },
  // TODO: "mobility" y "priority" se recolectan pero todavía no se usan en
  // ningún filtro de recomendación (ver ResultsScreen, que sólo filtra por
  // modality/type/duration). Incorporarlos al filtro o dejar de pedirlos.
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

// página 1: Q0–Q2 | página 2: Q3–Q4
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

const GLOBAL_TOTAL = PHASE1_QUESTIONS.length + 15 + PHASE3_QUESTIONS.length // 20 + 15 + 5

// ─── Componente principal ─────────────────────────────────────────────────────

export function VocationalTest({
  skipIntro = false,
  onClose,
}: {
  skipIntro?: boolean
  onClose?: () => void
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
  }, [])

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
          fetch(`/api/careers?areaId=${id}`).then((r) => r.json() as Promise<CareerResult[]>)
        )
      )
      const merged: CareerResult[] = []
      const seen = new Set<string>()
      for (const list of results) {
        for (const c of list) {
          if (!seen.has(c.id)) { seen.add(c.id); merged.push(c) }
        }
      }
      merged.sort((a, b) => (top3.indexOf(a.area.name) - top3.indexOf(b.area.name)))
      setCareers(merged.slice(0, 6))
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
          fetch(`/api/careers?areaId=${id}`).then((r) => r.json() as Promise<CareerResult[]>)
        )
      )
      const merged: CareerResult[] = []
      const seen = new Set<string>()
      for (const list of results) {
        for (const c of list) {
          if (!seen.has(c.id)) { seen.add(c.id); merged.push(c) }
        }
      }

      merged.sort((a, b) => (computed[normalizeCareerName(b.name)] ?? 0) - (computed[normalizeCareerName(a.name)] ?? 0))
      setCareers(merged.slice(0, 6))
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

  // Auto-carga resultados guardados en cuanto están disponibles los datos de áreas
  useEffect(() => {
    if (hydrated && profile && areas.length > 0 && step === 0) {
      viewSavedResults()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile, areas.length])

  // ── Cargando (esperando hidratación o áreas cuando hay perfil guardado) ──
  if (!hydrated || (profile && areas.length === 0 && step === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Intro ──
  if (step === 0) {
    if (skipIntro) { onClose?.(); return null }
    return <IntroScreen onStart={() => setStep(1)} />
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

    return (
      <QuestionScreen
        absoluteStart={PHASE1_QUESTIONS.length + areaIndex * 5}
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
    const pageQs = PHASE3_QUESTIONS.slice(start, start + PHASE3_PER_PAGE)
    const allAnswered = pageQs.every((q) => phase3Answers[q.id] !== undefined)

    return (
      <Phase3Screen
        questions={pageQs}
        answers={phase3Answers}
        allAnswered={allAnswered}
        isLast={step === PHASE3_LAST}
        absoluteStart={PHASE1_QUESTIONS.length + 15 + start}
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
            {GLOBAL_TOTAL} preguntas
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
  questions,
  answers,
  allAnswered,
  isLast,
  onAnswer,
  onNext,
  onBack,
}: {
  absoluteStart: number
  questions: string[]
  answers: Record<number, number>
  allAnswered: boolean
  isLast: boolean
  onAnswer: (qi: number, val: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const progress = (absoluteStart / GLOBAL_TOTAL) * 100

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8 gap-6">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {absoluteStart + 1}–{absoluteStart + questions.length} de {GLOBAL_TOTAL}</span>
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
  onAnswer,
  onNext,
  onBack,
}: {
  questions: Phase3Question[]
  answers: Record<string, string>
  allAnswered: boolean
  isLast: boolean
  absoluteStart: number
  onAnswer: (id: string, val: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const progress = (absoluteStart / GLOBAL_TOTAL) * 100

  return (
    <div className="flex flex-col max-w-2xl mx-auto px-4 py-8 gap-6">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {absoluteStart + 1}–{absoluteStart + questions.length} de {GLOBAL_TOTAL}</span>
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

// ─── Resultados ───────────────────────────────────────────────────────────────

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

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
  const radarData = sortedPhase1.map(([name, score]) => ({
    area: name.replace("Ciencias ", "Cs. ").replace(" y ", "\ny "),
    score,
  }))

  // Agrupar carreras por área (en orden de top3)
  const careersByArea: Record<string, CareerResult[]> = {}
  for (const c of careers) {
    if (!careersByArea[c.area.name]) careersByArea[c.area.name] = []
    careersByArea[c.area.name].push(c)
  }
  for (const area of top3Areas) {
    careersByArea[area]?.sort((a, b) => (careerScores[normalizeCareerName(b.name)] ?? 0) - (careerScores[normalizeCareerName(a.name)] ?? 0))
  }

  const medals = ["🥇", "🥈", "🥉"]

  // Preferencias seleccionadas para mostrar como chips informativos
  const modalityPref = phase3Answers["modality"]
  const typePref     = phase3Answers["type"]
  const durationPref = phase3Answers["duration"]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* ── Encabezado ── */}
      <div className="text-center space-y-2">
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
                <div className="h-2 bg-muted rounded-full overflow-hidden">
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


      {/* ── Afinidad con carreras ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Afinidad con carreras</h2>
        </div>

        {loadingCareers ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {top3Areas.map((areaName) => {
              const areaColor = AREA_COLORS[areaName] ?? "hsl(var(--primary))"
              const areaCareers = careersByArea[areaName] ?? []
              if (areaCareers.length === 0) return null

              return (
                <div key={areaName} className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {AREA_EMOJIS[areaName]} {areaName}
                  </p>
                  <div className="space-y-2">
                    {areaCareers.map((career) => {
                      const score = careerScores[normalizeCareerName(career.name)] ?? 0
                      return (
                        <Link
                          key={career.id}
                          href={`/carreras/${career.id}`}
                          className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5 hover:border-primary/40 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {career.name}
                              </span>
                              <span
                                className="text-sm font-bold tabular-nums shrink-0"
                                style={{ color: score >= 60 ? areaColor : "hsl(var(--muted-foreground))" }}
                              >
                                {score > 0 ? `${score}%` : "—"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${score}%`, backgroundColor: areaColor }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{career.university.name}</p>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
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
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar
                  name="Puntaje"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
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

      {/* ── Recomendadas según preferencias prácticas ── */}
      {(() => {
        const hasPrefs = (modalityPref && modalityPref !== "ANY") || (typePref && typePref !== "ANY") || durationPref
        if (!hasPrefs) return null

        const recommended = careers.filter((c) => {
          if (modalityPref && modalityPref !== "ANY" && c.modality !== modalityPref) return false
          if (typePref && typePref !== "ANY" && c.university.type !== typePref) return false
          if (durationPref && durationPref !== "6" && c.durationYears > parseInt(durationPref)) return false
          return true
        }).sort((a, b) => (careerScores[normalizeCareerName(b.name)] ?? 0) - (careerScores[normalizeCareerName(a.name)] ?? 0))

        return (
          <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-base font-semibold">Recomendadas según tus preferencias</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {modalityPref && modalityPref !== "ANY" && (
                  <span className="rounded-full bg-background border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {MODALITY_LABEL[modalityPref]}
                  </span>
                )}
                {typePref && typePref !== "ANY" && (
                  <span className="rounded-full bg-background border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {typePref === "PUBLIC" ? "Pública" : "Privada"}
                  </span>
                )}
                {durationPref && (
                  <span className="rounded-full bg-background border px-2.5 py-0.5 text-xs text-muted-foreground">
                    Hasta {durationPref} años
                  </span>
                )}
              </div>
            </div>

            {recommended.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ninguna de las carreras con mayor afinidad coincide exactamente con tus preferencias.
                Podés explorar el catálogo completo para encontrar opciones que se ajusten.
              </p>
            ) : (
              <div className="space-y-2">
                {recommended.map((career) => {
                  const score = careerScores[normalizeCareerName(career.name)] ?? 0
                  const color = AREA_COLORS[career.area.name] ?? "hsl(var(--primary))"
                  return (
                    <Link
                      key={career.id}
                      href={`/carreras/${career.id}`}
                      className="group flex items-center gap-3 rounded-lg border bg-background px-4 py-3 hover:border-primary/40 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {career.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground">
                              {AREA_EMOJIS[career.area.name]} {career.area.name}
                            </span>
                            <span
                              className="text-sm font-bold tabular-nums"
                              style={{ color: score >= 60 ? color : "hsl(var(--muted-foreground))" }}
                            >
                              {score > 0 ? `${score}%` : "—"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {career.university.name} · {MODALITY_LABEL[career.modality]} · {career.durationYears} años
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )
      })()}

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
    </div>
  )
}
