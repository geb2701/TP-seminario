import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const AREAS_VOCACIONALES = [
  "Ingeniería y Tecnología",
  "Ciencias de la Salud",
  "Ciencias Económicas",
  "Derecho y Ciencias Sociales",
  "Humanidades y Artes",
  "Ciencias Exactas y Naturales",
  "Arquitectura y Diseño",
  "Comunicación y Periodismo",
]

export function createMcpServer() {
  const server = new McpServer({ name: "uniflow-mcp", version: "1.0.0" })

  server.registerTool(
    "listar_universidades",
    {
      description: "Lista todas las universidades. Podés filtrar por tipo (PUBLIC/PRIVATE) o provincia.",
      inputSchema: {
        tipo: z.enum(["PUBLIC", "PRIVATE"]).optional().describe("Tipo de institución"),
        provincia: z.string().optional().describe("Filtrar por provincia"),
      },
    },
    async ({ tipo, provincia }) => {
      const universidades = await prisma.university.findMany({
        where: {
          ...(tipo && { type: tipo }),
          ...(provincia && { province: { contains: provincia } }),
        },
        select: {
          id: true,
          name: true,
          shortCode: true,
          city: true,
          province: true,
          type: true,
          foundedYear: true,
          website: true,
          _count: { select: { careers: true, reviews: true } },
        },
        orderBy: { name: "asc" },
      })

      return {
        content: [{
          type: "text",
          text: JSON.stringify(
            universidades.map((u) => ({
              id: u.id,
              nombre: u.name,
              codigo: u.shortCode,
              ciudad: u.city,
              provincia: u.province,
              tipo: u.type === "PUBLIC" ? "Pública" : "Privada",
              fundada: u.foundedYear,
              sitio_web: u.website,
              cantidad_carreras: u._count.careers,
              cantidad_reseñas: u._count.reviews,
            })),
            null, 2
          ),
        }],
      }
    }
  )

  server.registerTool(
    "detalle_universidad",
    {
      description: "Devuelve el detalle completo de una universidad, incluyendo sus carreras y reseñas.",
      inputSchema: {
        id: z.string().describe("ID de la universidad"),
      },
    },
    async ({ id }) => {
      const universidad = await prisma.university.findUnique({
        where: { id },
        include: {
          careers: { include: { area: true }, orderBy: { name: "asc" } },
          reviews: { orderBy: { createdAt: "desc" } },
        },
      })

      if (!universidad) {
        return { content: [{ type: "text", text: "Universidad no encontrada." }] }
      }

      const promedioReseñas =
        universidad.reviews.length > 0
          ? universidad.reviews.reduce((sum, r) => sum + r.rating, 0) / universidad.reviews.length
          : null

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            id: universidad.id,
            nombre: universidad.name,
            ciudad: universidad.city,
            provincia: universidad.province,
            tipo: universidad.type === "PUBLIC" ? "Pública" : "Privada",
            fundada: universidad.foundedYear,
            descripcion: universidad.description,
            sitio_web: universidad.website,
            calificacion_promedio: promedioReseñas ? promedioReseñas.toFixed(1) : null,
            carreras: universidad.careers.map((c) => ({
              id: c.id,
              nombre: c.name,
              area: c.area.name,
              duracion: `${c.durationYears} años`,
              modalidad: c.modality,
              titulo: c.degreeTitle,
            })),
            reseñas: universidad.reviews.map((r) => ({
              autor: r.authorName ?? "Anónimo",
              calificacion: r.rating,
              comentario: r.content,
              fecha: r.createdAt.toLocaleDateString("es-AR"),
            })),
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "listar_carreras",
    {
      description: "Lista carreras con filtros opcionales por área, modalidad o universidad.",
      inputSchema: {
        area: z.string().optional().describe("Nombre del área (ej: Ingeniería, Salud)"),
        modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "ONLINE"]).optional(),
        universidad: z.string().optional().describe("Nombre parcial de la universidad"),
      },
    },
    async ({ area, modalidad, universidad }) => {
      const carreras = await prisma.career.findMany({
        where: {
          ...(modalidad && { modality: modalidad }),
          ...(area && { area: { name: { contains: area } } }),
          ...(universidad && { university: { name: { contains: universidad } } }),
        },
        include: {
          university: { select: { name: true, city: true, province: true } },
          area: { select: { name: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { name: "asc" },
      })

      return {
        content: [{
          type: "text",
          text: JSON.stringify(
            carreras.map((c) => {
              const promedio =
                c.reviews.length > 0
                  ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)
                  : null
              return {
                id: c.id,
                nombre: c.name,
                universidad: c.university.name,
                ciudad: `${c.university.city}, ${c.university.province}`,
                area: c.area.name,
                duracion: `${c.durationYears} años`,
                modalidad: c.modality,
                titulo: c.degreeTitle,
                estudiantes: c.studentCount,
                calificacion: promedio,
                reseñas: c.reviews.length,
              }
            }),
            null, 2
          ),
        }],
      }
    }
  )

  server.registerTool(
    "detalle_carrera",
    {
      description: "Devuelve el detalle completo de una carrera, incluyendo plan de estudios y reseñas.",
      inputSchema: {
        id: z.string().describe("ID de la carrera"),
      },
    },
    async ({ id }) => {
      const carrera = await prisma.career.findUnique({
        where: { id },
        include: {
          university: true,
          area: true,
          studyPlans: {
            include: { subjects: { orderBy: [{ semester: "asc" }, { name: "asc" }] } },
            orderBy: { year: "asc" },
          },
          reviews: { orderBy: { createdAt: "desc" } },
        },
      })

      if (!carrera) {
        return { content: [{ type: "text", text: "Carrera no encontrada." }] }
      }

      const promedio =
        carrera.reviews.length > 0
          ? (carrera.reviews.reduce((s, r) => s + r.rating, 0) / carrera.reviews.length).toFixed(1)
          : null

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            id: carrera.id,
            nombre: carrera.name,
            universidad: {
              nombre: carrera.university.name,
              ciudad: carrera.university.city,
              provincia: carrera.university.province,
              tipo: carrera.university.type,
            },
            area: carrera.area.name,
            titulo_otorgado: carrera.degreeTitle,
            duracion: `${carrera.durationYears} años`,
            modalidad: carrera.modality,
            descripcion: carrera.description,
            estudiantes_inscritos: carrera.studentCount,
            calificacion_promedio: promedio,
            plan_de_estudios: carrera.studyPlans.map((p) => ({
              año: p.year,
              materias: p.subjects.map((s) => ({
                nombre: s.name,
                cuatrimestre: s.semester,
              })),
            })),
            reseñas: carrera.reviews.map((r) => ({
              autor: r.authorName ?? "Anónimo",
              calificacion: r.rating,
              comentario: r.content,
              fecha: r.createdAt.toLocaleDateString("es-AR"),
            })),
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "buscar",
    {
      description: "Busca universidades y carreras por texto libre.",
      inputSchema: {
        query: z.string().describe("Texto a buscar"),
      },
    },
    async ({ query }) => {
      const [universidades, carreras] = await Promise.all([
        prisma.university.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { city: { contains: query } },
              { province: { contains: query } },
            ],
          },
          select: { id: true, name: true, city: true, province: true, type: true },
          take: 5,
        }),
        prisma.career.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { degreeTitle: { contains: query } },
              { university: { name: { contains: query } } },
            ],
          },
          include: {
            university: { select: { name: true } },
            area: { select: { name: true } },
          },
          take: 10,
        }),
      ])

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            universidades: universidades.map((u) => ({
              id: u.id,
              nombre: u.name,
              ubicacion: `${u.city}, ${u.province}`,
              tipo: u.type === "PUBLIC" ? "Pública" : "Privada",
            })),
            carreras: carreras.map((c) => ({
              id: c.id,
              nombre: c.name,
              universidad: c.university.name,
              area: c.area.name,
            })),
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "listar_areas",
    {
      description: "Lista todas las áreas de conocimiento disponibles.",
      inputSchema: {},
    },
    async () => {
      const areas = await prisma.area.findMany({
        include: { _count: { select: { careers: true } } },
        orderBy: { name: "asc" },
      })

      return {
        content: [{
          type: "text",
          text: JSON.stringify(
            areas.map((a) => ({ id: a.id, nombre: a.name, carreras: a._count.careers })),
            null, 2
          ),
        }],
      }
    }
  )

  server.registerTool(
    "estadisticas_orientacion_vocacional",
    {
      description: "Devuelve estadísticas agregadas del test de orientación vocacional: total de respuestas, ranking de áreas más elegidas como perfil dominante, puntaje promedio por área y distribución mensual.",
      inputSchema: {},
    },
    async () => {
      const resultados = await prisma.vocationalResult.findMany({
        orderBy: { createdAt: "asc" },
      })

      const total = resultados.length

      if (total === 0) {
        return {
          content: [{
            type: "text",
            text: `No hay respuestas registradas aún.\n\nÁreas evaluadas por el test: ${AREAS_VOCACIONALES.join(", ")}.`,
          }],
        }
      }

      const conteoTopArea: Record<string, number> = {}
      const sumScores: Record<string, number> = {}
      const countScores: Record<string, number> = {}
      const porMes: Record<string, number> = {}

      for (const r of resultados) {
        conteoTopArea[r.topArea] = (conteoTopArea[r.topArea] ?? 0) + 1

        const scores = JSON.parse(r.scores) as Record<string, number>
        for (const [area, score] of Object.entries(scores)) {
          sumScores[area] = (sumScores[area] ?? 0) + score
          countScores[area] = (countScores[area] ?? 0) + 1
        }

        const mes = r.createdAt.toISOString().slice(0, 7)
        porMes[mes] = (porMes[mes] ?? 0) + 1
      }

      const rankingAreas = Object.entries(conteoTopArea)
        .sort(([, a], [, b]) => b - a)
        .map(([area, cantidad], i) => ({
          posicion: i + 1,
          area,
          cantidad,
          porcentaje: `${((cantidad / total) * 100).toFixed(1)}%`,
        }))

      const promediosPorArea = Object.fromEntries(
        Object.entries(sumScores).map(([area, sum]) => [
          area,
          parseFloat((sum / countScores[area]).toFixed(1)),
        ])
      )

      return {
        content: [
          {
            type: "text",
            text: `Estadísticas basadas en ${total} respuesta${total !== 1 ? "s" : ""} del test de orientación vocacional.\nÁreas evaluadas: ${AREAS_VOCACIONALES.join(", ")}.`,
          },
          {
            type: "text",
            text: JSON.stringify({
              total_respuestas: total,
              ranking_areas_mas_elegidas: rankingAreas,
              puntaje_promedio_por_area: promediosPorArea,
              respuestas_por_mes: porMes,
            }, null, 2),
          },
        ],
      }
    }
  )

  server.registerTool(
    "listar_resultados_vocacionales",
    {
      description: "Lista resultados individuales del test de orientación vocacional. Podés filtrar por área dominante y limitar la cantidad de resultados.",
      inputSchema: {
        topArea: z.string().optional().describe("Filtrar por área dominante (ej: 'Ingeniería y Tecnología', 'Ciencias de la Salud')"),
        limite: z.number().int().min(1).max(100).optional().describe("Cantidad máxima de resultados a devolver (por defecto 20)"),
      },
    },
    async ({ topArea, limite }) => {
      const resultados = await prisma.vocationalResult.findMany({
        where: {
          ...(topArea && { topArea: { contains: topArea } }),
        },
        orderBy: { createdAt: "desc" },
        take: limite ?? 20,
      })

      const resumen = topArea
        ? `Se encontraron ${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} para el área "${topArea}".`
        : `Se muestran ${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} (ordenados del más reciente al más antiguo).`

      return {
        content: [
          {
            type: "text",
            text: `${resumen}\nÁreas disponibles para filtrar: ${AREAS_VOCACIONALES.join(", ")}.`,
          },
          {
            type: "text",
            text: JSON.stringify(
              resultados.map((r) => ({
                id: r.id,
                persona: r.personName ?? "Anónimo",
                area_dominante: r.topArea,
                puntajes: JSON.parse(r.scores) as Record<string, number>,
                fecha: r.createdAt.toLocaleDateString("es-AR"),
              })),
              null, 2
            ),
          },
        ],
      }
    }
  )

  return server
}
