"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, FileDown, Sparkles } from "lucide-react"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { PDFExportTemplate, exportElementToPdf, buildReportFilename, type CareerDetail } from "@/components/exportar"

const PAID_KEY = "uniflow_report_paid"
const PRICE = "ARS 15.000,00"

type Phase = "idle" | "processing" | "ready" | "paid"

export function PaywallReport({
  careers,
  loading = false,
}: {
  careers?: CareerDetail[]
  loading?: boolean
}) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { profile } = useVocationalProfile()
  const savedAt = profile?.savedAt

  const [phase, setPhase] = useState<Phase>("idle")

  // El pago queda atado al savedAt del perfil: un test nuevo (o un localStorage
  // vacío) genera otro savedAt y vuelve a pedir el pago. Sin tocar reset().
  useEffect(() => {
    if (typeof window === "undefined") return
    const paidFor = localStorage.getItem(PAID_KEY)
    setPhase(savedAt && paidFor === savedAt ? "paid" : "idle")
  }, [savedAt])

  // Limpia timers pendientes al desmontar.
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const hasData = !loading && !!careers && careers.length > 0

  async function downloadPdf() {
    if (!pdfRef.current) return
    await exportElementToPdf(pdfRef.current, buildReportFilename())
  }

  function startMockPayment() {
    if (!hasData) return
    setPhase("processing")
    timers.current.push(
      setTimeout(() => {
        setPhase("ready")
        timers.current.push(
          setTimeout(async () => {
            await downloadPdf()
            if (savedAt) localStorage.setItem(PAID_KEY, savedAt)
            setPhase("paid")
          }, 1000)
        )
      }, 2000)
    )
  }

  const isReady = phase === "ready"
  const isProcessing = phase === "processing"

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-6 transition-colors duration-500 ${
        isReady || phase === "paid"
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
      }`}
      aria-busy={isProcessing}
    >
      {/* Contenido principal: se difumina mientras "procesa el pago". */}
      <div className={`transition-[filter,opacity] duration-300 ${isProcessing ? "blur-sm opacity-60 pointer-events-none select-none" : ""}`}>
        {phase === "paid" ? (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-7 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Ya pagaste tu reporte</p>
                <p className="text-sm text-muted-foreground">Volvé a descargarlo cuando quieras.</p>
              </div>
            </div>
            <Button onClick={downloadPdf} className="gap-2 shrink-0">
              <FileDown className="size-4" />
              Descargar de nuevo
            </Button>
          </div>
        ) : isReady ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <CheckCircle2 className="size-9 text-emerald-600 dark:text-emerald-400" />
            <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Tu reporte está listo</p>
            <p className="text-sm text-muted-foreground">Descargando…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">¿Querés un análisis más completo?</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Accedé a un reporte detallado de tus resultados con la comparación a fondo de las
              mejores universidades para tu carrera más compatible, en PDF.
            </p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Precio único</span>
                <p className="text-3xl font-extrabold text-primary sm:text-4xl">{PRICE}</p>
              </div>
              <Button size="lg" onClick={startMockPayment} disabled={!hasData} className="gap-2">
                <FileDown className="size-4" />
                Recibir mi reporte
              </Button>
            </div>
            {!hasData && (
              <p className="text-xs text-muted-foreground">
                {loading ? "Preparando los datos de tu reporte…" : "El reporte no está disponible para esta selección."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Overlay con spinner mientras "procesa el pago". */}
      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Procesando tu pago…</p>
        </div>
      )}

      {/* Template oculto del PDF: clip 0×0 para que no se vea pero html-to-image
          lo capture a tamaño completo (mismo patrón que ExportPDFButton). */}
      {hasData && (
        <div
          style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
          aria-hidden
        >
          <div ref={pdfRef} style={{ width: "1100px" }}>
            <PDFExportTemplate careers={careers!} />
          </div>
        </div>
      )}
    </section>
  )
}
