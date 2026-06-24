// Genera un PDF multipágina a partir de un elemento del DOM (el template oculto)
// y lo descarga con el nombre indicado. Extraído de ExportPDFButton para que
// tanto el botón directo (/comparar) como el paywall de resultados reusen la
// misma lógica.

// Nombre del reporte: Reporte_DD_mm_YYYY_<uuid corto>.pdf
export function buildReportFilename(): string {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, "0")
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const yyyy = now.getFullYear()
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12)
  return `Reporte_${dd}_${mm}_${yyyy}_${id}.pdf`
}

export async function exportElementToPdf(el: HTMLElement, filename: string): Promise<void> {
  // Two rAF ticks ensure the browser has finished laying out the fixed element
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  )

  const width = el.scrollWidth
  const height = el.scrollHeight

  const [{ toPng }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ])

  const dataUrl = await toPng(el, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    width,
    height,
  })

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // px → mm scale (element pixels, not device pixels)
  const scale = pageWidth / width
  const pageHeightPx = pageHeight / scale

  // Top margin on pages 2+ so sections don't start flush at the top.
  const TOP_MARGIN_MM = 14
  const topMarginPx = TOP_MARGIN_MM / scale

  // Bottom margin on every page to reserve space for the footer.
  const BOTTOM_MARGIN_MM = 15
  const bottomMarginPx = BOTTOM_MARGIN_MM / scale

  // Content capacity per page (excluding margins)
  const firstPageCapacityPx = pageHeightPx - bottomMarginPx
  const innerPageHeightPx = pageHeightPx - topMarginPx - bottomMarginPx

  // Collect preferred break points from [data-pdf-break] elements.
  const elTop = el.getBoundingClientRect().top
  const breakPointsPx = Array.from(
    el.querySelectorAll<HTMLElement>("[data-pdf-break]")
  )
    .map((node) => node.getBoundingClientRect().top - elTop)
    .filter((y) => y > 0)
    .sort((a, b) => a - b)

  // Find the forced page-2 break (study plans section).
  // If this element falls within page 1's capacity, page 1 always ends here
  // so the section always starts fresh on page 2, regardless of available space.
  const forcedPage2El = el.querySelector<HTMLElement>("[data-pdf-force-page2]")
  const forcedPage2Px = forcedPage2El
    ? forcedPage2El.getBoundingClientRect().top - elTop
    : null

  // Build page start positions dynamically.
  const pageStarts: number[] = [0]
  let cursor = 0
  const minPagePx = pageHeightPx * 0.25

  // Page 1: end at forced break if it falls within page 1's capacity,
  // otherwise fall back to natural/preferred break.
  const canForce =
    forcedPage2Px !== null &&
    forcedPage2Px > minPagePx &&
    forcedPage2Px <= firstPageCapacityPx
  if (canForce) {
    pageStarts.push(forcedPage2Px!)
    cursor = forcedPage2Px!
  } else if (firstPageCapacityPx < height) {
    const naturalBreak = firstPageCapacityPx
    const preferred = breakPointsPx
      .filter((bp) => bp > minPagePx && bp <= naturalBreak)
      .at(-1)
    pageStarts.push(preferred ?? naturalBreak)
    cursor = pageStarts.at(-1)!
  }

  // Remaining pages — fully dynamic, one page added only when needed.
  while (cursor + innerPageHeightPx < height) {
    const naturalBreak = cursor + innerPageHeightPx
    const preferred = breakPointsPx
      .filter((bp) => bp > cursor + minPagePx && bp <= naturalBreak)
      .at(-1)
    const next = preferred ?? naturalBreak
    pageStarts.push(next)
    cursor = next
  }

  // Load full image for per-page cropping (prevents content duplication
  // when a backward snap makes consecutive page ranges overlap).
  const fullImg = new Image()
  fullImg.src = dataUrl
  await new Promise<void>((resolve) => { fullImg.onload = () => resolve() })

  const pr = fullImg.naturalWidth / width  // pixel ratio (should be 2)
  const totalPages = pageStarts.length

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage()

    const startPx = pageStarts[i]
    const isFirst = i === 0
    const capacity = isFirst ? firstPageCapacityPx : innerPageHeightPx
    const endPx = Math.min(pageStarts[i + 1] ?? height, startPx + capacity)
    const contentPx = endPx - startPx

    const crop = document.createElement("canvas")
    crop.width = fullImg.naturalWidth
    crop.height = Math.round(contentPx * pr)
    crop.getContext("2d")!.drawImage(
      fullImg,
      0, Math.round(startPx * pr),
      fullImg.naturalWidth, Math.round(contentPx * pr),
      0, 0,
      fullImg.naturalWidth, Math.round(contentPx * pr)
    )

    const yMm = isFirst ? 0 : TOP_MARGIN_MM
    pdf.addImage(crop.toDataURL("image/png"), "PNG", 0, yMm, pageWidth, contentPx * scale)

    // Footer drawn on every page via jsPDF (not part of the captured image)
    pdf.setDrawColor(210, 210, 210)
    pdf.setLineWidth(0.3)
    pdf.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12)

    pdf.setFontSize(8)
    pdf.setTextColor(160, 160, 160)
    pdf.text("Generado por Uniflow", 10, pageHeight - 7)
    pdf.text(`${i + 1} / ${totalPages}`, pageWidth - 10, pageHeight - 7, { align: "right" })
  }

  pdf.save(filename)
}
