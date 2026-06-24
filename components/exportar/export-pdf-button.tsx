"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { PDFExportTemplate, type CareerDetail } from "./pdf-template"
import { exportElementToPdf, buildReportFilename } from "./generate-pdf"

export function ExportPDFButton({
  careers,
  isLoading = false,
}: {
  careers?: CareerDetail[]
  isLoading?: boolean
}) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const hasData = !isLoading && careers && careers.length > 0

  async function exportToPDF() {
    if (!pdfRef.current || !careers || careers.length === 0) return
    setIsExporting(true)
    try {
      await exportElementToPdf(pdfRef.current, buildReportFilename())
    } finally {
      setIsExporting(false)
    }
  }

  if (!hasData) return null

  return (
    <>
      <Button
        variant="outline"
        onClick={exportToPDF}
        disabled={isExporting}
        className="shrink-0"
      >
        {isExporting
          ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          : <FileDown className="h-4 w-4 mr-2" />}
        {isExporting ? "Generando PDF..." : "Exportar PDF"}
      </Button>
      {/* Outer wrapper clips to 0×0 so the user sees nothing.
          Inner div has static positioning so html-to-image's SVG foreignObject
          renders it at full size (negative offsets or opacity:0 cause blank captures). */}
      <div
        style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
        aria-hidden
      >
        <div ref={pdfRef} style={{ width: "1100px" }}>
          <PDFExportTemplate careers={careers} />
        </div>
      </div>
    </>
  )
}
