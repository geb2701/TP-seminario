import React from "react"

export type CareerDetail = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  studentCount: number
  description: string | null
  university: { name: string; city: string; province: string; type: string }
  area: { id?: string; name: string }
  rating: number | null
  reviewCount: number
  studyPlans: {
    id: string
    year: number
    subjects: { id: string; name: string; semester: number | null }[]
  }[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

export const PDF_COLORS = ["#4f46e5", "#7c3aed", "#0891b2", "#059669"]

function PDFSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "4px", height: "20px", backgroundColor: "#4f46e5", borderRadius: "2px", flexShrink: 0 }} />
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>{children}</h2>
    </div>
  )
}

function PDFMetricBar({
  label, value, max, color, format,
}: {
  label: string; value: number; max: number; color: string; format: (v: number) => string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{label}</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#111827", flexShrink: 0 }}>{format(value)}</span>
      </div>
      <div style={{ height: "7px", backgroundColor: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "4px" }} />
      </div>
    </div>
  )
}

function PDFCareerCard({ career, color }: { career: CareerDetail; color: string }) {
  const totalSubjects = career.studyPlans.reduce((s, p) => s + p.subjects.length, 0)
  const fields: [string, string][] = [
    ["Área", career.area.name],
    ["Institución", career.university.type === "PUBLIC" ? "Pública" : "Privada"],
    ["Ciudad", `${career.university.city}, ${career.university.province}`],
    ["Duración", `${career.durationYears} años`],
    ["Modalidad", MODALITY_LABEL[career.modality]],
    ["Título", career.degreeTitle],
    ["Estudiantes", career.studentCount.toLocaleString("es-AR")],
    ["Materias", `${totalSubjects} en total`],
    ["Calificación", career.rating !== null ? `${career.rating} / 5.0 (${career.reviewCount} reseñas)` : "Sin reseñas"],
  ]

  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: "10px", padding: "20px", backgroundColor: "#fafafa" }}>
      <div style={{ width: "36px", height: "4px", backgroundColor: color, borderRadius: "2px", marginBottom: "12px" }} />
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: "0 0 3px", lineHeight: 1.3 }}>
        {career.name}
      </h3>
      <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 16px" }}>{career.university.name}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {fields.map(([label, value]) => (
          <div key={label} style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
            <span style={{ color: "#9ca3af", minWidth: "72px", flexShrink: 0 }}>{label}</span>
            <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PDFExportTemplate({ careers }: { careers: CareerDetail[] }) {
  const date = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
  const allYears = [...new Set(careers.flatMap((c) => c.studyPlans.map((p) => p.year)))].sort((a, b) => a - b)

  const maxStudents = Math.max(...careers.map((c) => c.studentCount), 1)
  const maxDuration = Math.max(...careers.map((c) => c.durationYears), 1)
  const maxSubjects = Math.max(...careers.map((c) => c.studyPlans.reduce((s, p) => s + p.subjects.length, 0)), 1)

  const cardCols = careers.length <= 2 ? careers.length : 2

  const tableRows: [string, (c: CareerDetail) => string][] = [
    ["Universidad", (c) => c.university.name],
    ["Ciudad", (c) => `${c.university.city}, ${c.university.province}`],
    ["Tipo de institución", (c) => c.university.type === "PUBLIC" ? "Pública" : "Privada"],
    ["Área", (c) => c.area.name],
    ["Título otorgado", (c) => c.degreeTitle],
    ["Duración", (c) => `${c.durationYears} años`],
    ["Modalidad", (c) => MODALITY_LABEL[c.modality]],
    ["Estudiantes inscritos", (c) => c.studentCount.toLocaleString("es-AR")],
    ["Total de materias", (c) => `${c.studyPlans.reduce((s, p) => s + p.subjects.length, 0)}`],
    ["Calificación", (c) => c.rating !== null ? `${c.rating} / 5.0 (${c.reviewCount} reseñas)` : "Sin reseñas"],
  ]

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: "#111827", padding: "48px 56px", backgroundColor: "#ffffff", width: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#4f46e5", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
            Orientación Vocacional
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#111827", lineHeight: 1.25 }}>
            Comparación de Carreras<br />Universitarias
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "8px 0 0" }}>
            {careers.length} carrera{careers.length !== 1 ? "s" : ""} · Generado el {date}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "6px" }}>Carreras en esta comparación</div>
          {careers.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "#374151" }}>{c.name}</span>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: PDF_COLORS[i], flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Decorative bar */}
      <div style={{ height: "3px", backgroundColor: "#4f46e5", borderRadius: "2px", marginBottom: "40px", opacity: 0.8 }} />

      {/* Career profile cards */}
      <div style={{ marginBottom: "44px" }}>
        <PDFSectionTitle>Perfil de cada carrera</PDFSectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cardCols}, 1fr)`, gap: "16px" }}>
          {careers.map((career, i) => (
            <PDFCareerCard key={career.id} career={career} color={PDF_COLORS[i]} />
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ marginBottom: "44px" }}>
        <PDFSectionTitle>Comparación lado a lado</PDFSectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <th style={{ padding: "9px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600, width: "160px", fontSize: "11px" }}>
                Característica
              </th>
              {careers.map((career, i) => (
                <th key={career.id} style={{ padding: "9px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                  <div style={{ color: PDF_COLORS[i], fontWeight: 700, fontSize: "12px" }}>{career.name}</div>
                  <div style={{ color: "#6b7280", fontWeight: 400, fontSize: "10px", marginTop: "2px" }}>{career.university.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(([label, render], ri) => (
              <tr key={label} style={{ backgroundColor: ri % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                <td style={{ padding: "7px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280", fontWeight: 500 }}>{label}</td>
                {careers.map((career) => (
                  <td key={career.id} style={{ padding: "7px 12px", borderBottom: "1px solid #f3f4f6", color: "#111827" }}>
                    {render(career)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Study plans */}
      {allYears.length > 0 && (
        <div data-pdf-force-page2="true" style={{ marginBottom: "44px" }}>
          <PDFSectionTitle>Plan de estudios por año</PDFSectionTitle>
          {allYears.map((year, yi) => (
            <div key={year} data-pdf-break={yi > 0 ? "true" : undefined} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", padding: "6px 12px", backgroundColor: "#f3f4f6", borderRadius: "6px", marginBottom: "10px" }}>
                {year}° año
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${careers.length}, 1fr)`, gap: "12px" }}>
                {careers.map((career, i) => {
                  const plan = career.studyPlans.find((p) => p.year === year)
                  return (
                    <div key={career.id} style={{ borderLeft: `3px solid ${PDF_COLORS[i]}`, paddingLeft: "10px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: PDF_COLORS[i], marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {career.name}
                      </div>
                      {plan && plan.subjects.length > 0 ? (
                        plan.subjects.map((s) => (
                          <div key={s.id} style={{ fontSize: "10px", color: "#374151", padding: "2px 0", borderBottom: "1px solid #f9fafb" }}>
                            {s.name}
                            {s.semester && <span style={{ color: "#9ca3af", marginLeft: "6px" }}>{s.semester}° cuatri</span>}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>Sin materias cargadas</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div data-pdf-break="true" style={{ marginBottom: "40px" }}>
        <PDFSectionTitle>Métricas comparativas</PDFSectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "28px 40px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Estudiantes inscritos</div>
            {careers.map((c, i) => (
              <PDFMetricBar key={c.id} label={c.name} value={c.studentCount} max={maxStudents} color={PDF_COLORS[i]} format={(v) => v.toLocaleString("es-AR")} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Duración de la carrera</div>
            {careers.map((c, i) => (
              <PDFMetricBar key={c.id} label={c.name} value={c.durationYears} max={maxDuration} color={PDF_COLORS[i]} format={(v) => `${v} año${v !== 1 ? "s" : ""}`} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Total de materias</div>
            {careers.map((c, i) => {
              const total = c.studyPlans.reduce((s, p) => s + p.subjects.length, 0)
              return <PDFMetricBar key={c.id} label={c.name} value={total} max={maxSubjects} color={PDF_COLORS[i]} format={(v) => `${v} materia${v !== 1 ? "s" : ""}`} />
            })}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Calificación promedio</div>
            {careers.map((c, i) => (
              <PDFMetricBar key={c.id} label={c.name} value={c.rating ?? 0} max={5} color={PDF_COLORS[i]} format={(v) => v > 0 ? `${v} / 5.0` : "Sin datos"} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer is added programmatically by jsPDF on every page */}
    </div>
  )
}
