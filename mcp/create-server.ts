import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

async function getAreaNames(): Promise<string[]> {
  const areas = await prisma.area.findMany({ select: { name: true }, orderBy: { name: "asc" } })
  return areas.map((a) => a.name)
}

export function createMcpServer() {
  const server = new McpServer({ name: "uniflow-mcp", version: "1.0.0" })

  server.registerTool(
    "listar_universidades",
    {
      description: "Lista universidades. Filtrá por tipo, provincia o ciudad. Soporta paginación.",
      inputSchema: {
        tipo: z.enum(["PUBLIC", "PRIVATE"]).optional().describe("Tipo de institución"),
        provincia: z.string().optional().describe("Filtrar por provincia"),
        ciudad: z.string().optional().describe("Filtrar por ciudad"),
        pagina: z.number().int().min(1).optional().describe("Número de página (por defecto 1)"),
        por_pagina: z.number().int().min(1).max(100).optional().describe("Resultados por página (por defecto 50)"),
      },
    },
    async ({ tipo, provincia, ciudad, pagina = 1, por_pagina = 50 }) => {
      const where = {
        ...(tipo && { type: tipo }),
        ...(provincia && { province: { contains: provincia } }),
        ...(ciudad && { city: { contains: ciudad } }),
      }

      const [universidades, total] = await Promise.all([
        prisma.university.findMany({
          where,
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
            reviews: { select: { rating: true } },
          },
          orderBy: { name: "asc" },
          skip: (pagina - 1) * por_pagina,
          take: por_pagina,
        }),
        prisma.university.count({ where }),
      ])

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total,
            pagina,
            por_pagina,
            paginas_totales: Math.ceil(total / por_pagina),
            universidades: universidades.map((u) => {
              const rating =
                u.reviews.length > 0
                  ? parseFloat((u.reviews.reduce((s, r) => s + r.rating, 0) / u.reviews.length).toFixed(1))
                  : null
              return {
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
                calificacion_promedio: rating,
              }
            }),
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "detalle_universidad",
    {
      description: "Detalle completo de una universidad: descripción, carreras y reseñas. Usá limite_carreras si la universidad tiene muchas carreras.",
      inputSchema: {
        id: z.string().describe("ID de la universidad"),
        limite_carreras: z.number().int().min(1).max(200).optional().describe("Máximo de carreras a incluir (por defecto 50)"),
      },
    },
    async ({ id, limite_carreras = 50 }) => {
      const universidad = await prisma.university.findUnique({
        where: { id },
        include: {
          careers: {
            include: { area: true },
            orderBy: { name: "asc" },
            take: limite_carreras,
          },
          reviews: { orderBy: { createdAt: "desc" } },
          _count: { select: { careers: true } },
        },
      })

      if (!universidad) {
        return { content: [{ type: "text", text: "Universidad no encontrada." }] }
      }

      const promedioReseñas =
        universidad.reviews.length > 0
          ? parseFloat((universidad.reviews.reduce((sum, r) => sum + r.rating, 0) / universidad.reviews.length).toFixed(1))
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
            calificacion_promedio: promedioReseñas,
            total_carreras: universidad._count.careers,
            carreras_mostradas: universidad.careers.length,
            carreras: universidad.careers.map((c) => ({
              id: c.id,
              nombre: c.name,
              area: c.area.name,
              duracion: `${c.durationYears} años`,
              modalidad: MODALITY_LABEL[c.modality] ?? c.modality,
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
      description: "Lista carreras con filtros opcionales. Soporta paginación para manejar el dataset completo.",
      inputSchema: {
        area: z.string().optional().describe("Nombre del área (ej: Ciencias Aplicadas, Ciencias de la Salud)"),
        modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "ONLINE"]).optional(),
        universidad: z.string().optional().describe("Nombre parcial de la universidad"),
        provincia: z.string().optional().describe("Filtrar por provincia de la universidad"),
        tipo_universidad: z.enum(["PUBLIC", "PRIVATE"]).optional().describe("Tipo de universidad"),
        duracion_max: z.number().int().min(1).max(10).optional().describe("Duración máxima en años"),
        pagina: z.number().int().min(1).optional().describe("Número de página (por defecto 1)"),
        por_pagina: z.number().int().min(1).max(100).optional().describe("Resultados por página (por defecto 50)"),
      },
    },
    async ({ area, modalidad, universidad, provincia, tipo_universidad, duracion_max, pagina = 1, por_pagina = 50 }) => {
      const where = {
        ...(modalidad && { modality: modalidad }),
        ...(area && { area: { name: { contains: area } } }),
        ...(duracion_max && { durationYears: { lte: duracion_max } }),
        ...((universidad || provincia || tipo_universidad) && {
          university: {
            ...(universidad && { name: { contains: universidad } }),
            ...(provincia && { province: { contains: provincia } }),
            ...(tipo_universidad && { type: tipo_universidad }),
          },
        }),
      }

      const [carreras, total] = await Promise.all([
        prisma.career.findMany({
          where,
          include: {
            university: { select: { name: true, city: true, province: true, type: true, reviews: { select: { rating: true } } } },
            area: { select: { name: true } },
            reviews: { select: { rating: true } },
          },
          orderBy: { name: "asc" },
          skip: (pagina - 1) * por_pagina,
          take: por_pagina,
        }),
        prisma.career.count({ where }),
      ])

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total,
            pagina,
            por_pagina,
            paginas_totales: Math.ceil(total / por_pagina),
            carreras: carreras.map((c) => {
              const ratingCarrera =
                c.reviews.length > 0
                  ? parseFloat((c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1))
                  : null
              const ratingUniversidad =
                c.university.reviews.length > 0
                  ? parseFloat((c.university.reviews.reduce((s, r) => s + r.rating, 0) / c.university.reviews.length).toFixed(1))
                  : null
              return {
                id: c.id,
                nombre: c.name,
                universidad: c.university.name,
                tipo_universidad: c.university.type === "PUBLIC" ? "Pública" : "Privada",
                ubicacion: `${c.university.city}, ${c.university.province}`,
                area: c.area.name,
                duracion: `${c.durationYears} años`,
                modalidad: MODALITY_LABEL[c.modality] ?? c.modality,
                titulo: c.degreeTitle,
                calificacion_carrera: ratingCarrera,
                calificacion_universidad: ratingUniversidad,
                cantidad_reseñas: c.reviews.length,
              }
            }),
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "detalle_carrera",
    {
      description: "Detalle completo de una carrera: plan de estudios, reseñas e información de la universidad.",
      inputSchema: {
        id: z.string().describe("ID de la carrera"),
      },
    },
    async ({ id }) => {
      const carrera = await prisma.career.findUnique({
        where: { id },
        include: {
          university: { include: { reviews: { select: { rating: true } } } },
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

      const ratingCarrera =
        carrera.reviews.length > 0
          ? parseFloat((carrera.reviews.reduce((s, r) => s + r.rating, 0) / carrera.reviews.length).toFixed(1))
          : null

      const ratingUniversidad =
        carrera.university.reviews.length > 0
          ? parseFloat((carrera.university.reviews.reduce((s, r) => s + r.rating, 0) / carrera.university.reviews.length).toFixed(1))
          : null

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            id: carrera.id,
            nombre: carrera.name,
            universidad: {
              id: carrera.university.id,
              nombre: carrera.university.name,
              ciudad: carrera.university.city,
              provincia: carrera.university.province,
              tipo: carrera.university.type === "PUBLIC" ? "Pública" : "Privada",
              calificacion_promedio: ratingUniversidad,
            },
            area: carrera.area.name,
            titulo_otorgado: carrera.degreeTitle,
            duracion: `${carrera.durationYears} años`,
            modalidad: MODALITY_LABEL[carrera.modality] ?? carrera.modality,
            descripcion: carrera.description,
            estudiantes_inscritos: carrera.studentCount,
            calificacion_promedio: ratingCarrera,
            cantidad_reseñas: carrera.reviews.length,
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
    "comparar_carreras",
    {
      description: "Compara entre 2 y 4 carreras lado a lado. Útil para ayudar a elegir entre opciones similares.",
      inputSchema: {
        ids: z.array(z.string()).min(2).max(4).describe("Lista de IDs de carreras a comparar"),
      },
    },
    async ({ ids }) => {
      const carreras = await prisma.career.findMany({
        where: { id: { in: ids } },
        include: {
          university: { include: { reviews: { select: { rating: true } } } },
          area: true,
          studyPlans: {
            include: { subjects: true },
            orderBy: { year: "asc" },
          },
          reviews: { select: { rating: true } },
        },
      })

      if (carreras.length === 0) {
        return { content: [{ type: "text", text: "No se encontró ninguna de las carreras indicadas." }] }
      }

      const ordenadas = ids.map((id) => carreras.find((c) => c.id === id)).filter(Boolean) as typeof carreras

      const comparacion = ordenadas.map((c) => {
        const ratingCarrera =
          c.reviews.length > 0
            ? parseFloat((c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1))
            : null
        const ratingUniversidad =
          c.university.reviews.length > 0
            ? parseFloat((c.university.reviews.reduce((s, r) => s + r.rating, 0) / c.university.reviews.length).toFixed(1))
            : null
        const totalMaterias = c.studyPlans.reduce((s, p) => s + p.subjects.length, 0)

        return {
          id: c.id,
          nombre: c.name,
          universidad: c.university.name,
          tipo_universidad: c.university.type === "PUBLIC" ? "Pública" : "Privada",
          ubicacion: `${c.university.city}, ${c.university.province}`,
          area: c.area.name,
          titulo_otorgado: c.degreeTitle,
          duracion: `${c.durationYears} años`,
          modalidad: MODALITY_LABEL[c.modality] ?? c.modality,
          calificacion_carrera: ratingCarrera,
          calificacion_universidad: ratingUniversidad,
          reseñas_carrera: c.reviews.length,
          total_materias: totalMaterias,
          plan_de_estudios: c.studyPlans.map((p) => ({
            año: p.year,
            materias: p.subjects.map((s) => s.name),
          })),
        }
      })

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ comparacion }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    "buscar",
    {
      description: "Búsqueda libre sobre universidades y carreras por nombre, descripción o ubicación.",
      inputSchema: {
        query: z.string().describe("Texto a buscar"),
        limite: z.number().int().min(1).max(50).optional().describe("Máximo de resultados por entidad (por defecto 15)"),
      },
    },
    async ({ query, limite = 15 }) => {
      const [universidades, carreras] = await Promise.all([
        prisma.university.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { city: { contains: query } },
              { province: { contains: query } },
              { description: { contains: query } },
            ],
          },
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
            type: true,
            reviews: { select: { rating: true } },
          },
          take: limite,
          orderBy: { name: "asc" },
        }),
        prisma.career.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { degreeTitle: { contains: query } },
              { description: { contains: query } },
              { university: { name: { contains: query } } },
            ],
          },
          include: {
            university: { select: { name: true, province: true } },
            area: { select: { name: true } },
          },
          take: limite,
          orderBy: { name: "asc" },
        }),
      ])

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            universidades: universidades.map((u) => {
              const rating =
                u.reviews.length > 0
                  ? parseFloat((u.reviews.reduce((s, r) => s + r.rating, 0) / u.reviews.length).toFixed(1))
                  : null
              return {
                id: u.id,
                nombre: u.name,
                ubicacion: `${u.city}, ${u.province}`,
                tipo: u.type === "PUBLIC" ? "Pública" : "Privada",
                calificacion_promedio: rating,
              }
            }),
            carreras: carreras.map((c) => ({
              id: c.id,
              nombre: c.name,
              universidad: c.university.name,
              provincia: c.university.province,
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
      description: "Lista todas las áreas de conocimiento disponibles con la cantidad de carreras por área.",
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
      description: "Estadísticas agregadas del test vocacional: ranking de áreas más elegidas, puntaje promedio por área y distribución mensual.",
      inputSchema: {},
    },
    async () => {
      const [resultados, areasDB] = await Promise.all([
        prisma.vocationalResult.findMany({ orderBy: { createdAt: "asc" } }),
        getAreaNames(),
      ])

      const total = resultados.length

      if (total === 0) {
        return {
          content: [{
            type: "text",
            text: `No hay respuestas registradas aún.\n\nÁreas evaluadas por el test: ${areasDB.join(", ")}.`,
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
            text: `Estadísticas basadas en ${total} respuesta${total !== 1 ? "s" : ""} del test.\nÁreas evaluadas: ${areasDB.join(", ")}.`,
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
      description: "Lista resultados individuales del test vocacional. Filtrá por área dominante y limitá la cantidad.",
      inputSchema: {
        topArea: z.string().optional().describe("Filtrar por área dominante (ej: 'Ciencias Aplicadas', 'Ciencias de la Salud')"),
        limite: z.number().int().min(1).max(100).optional().describe("Cantidad máxima de resultados (por defecto 20)"),
      },
    },
    async ({ topArea, limite }) => {
      const [resultados, areasDB] = await Promise.all([
        prisma.vocationalResult.findMany({
          where: {
            ...(topArea && { topArea: { contains: topArea } }),
          },
          orderBy: { createdAt: "desc" },
          take: limite ?? 20,
        }),
        getAreaNames(),
      ])

      const resumen = topArea
        ? `Se encontraron ${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} para el área "${topArea}".`
        : `Se muestran ${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} (del más reciente al más antiguo).`

      return {
        content: [
          {
            type: "text",
            text: `${resumen}\nÁreas disponibles para filtrar: ${areasDB.join(", ")}.`,
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
