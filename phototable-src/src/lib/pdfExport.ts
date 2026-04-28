import jsPDF from 'jspdf'
import { BookAssignment, BookSize, BookSlot, PageLayout } from '../store/types'
import { getLayout, SPREAD_PAGE_OFFSET } from '../templates'

// ─── Image drawing (replicates CSS object-fit:cover + object-position + transform:scale) ──

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}

async function drawImageSlot(
  ctx: CanvasRenderingContext2D,
  src: string,
  slotX: number, slotY: number, slotW: number, slotH: number,
  cropX: number, cropY: number, zoom: number
): Promise<void> {
  let img: HTMLImageElement
  try {
    img = await loadImage(src)
  } catch {
    return
  }

  // 1. object-fit: cover  →  scale so image fills the slot
  const coverScale = Math.max(slotW / img.naturalWidth, slotH / img.naturalHeight)
  const scaledW = img.naturalWidth * coverScale
  const scaledH = img.naturalHeight * coverScale

  // 2. object-position: cropX% cropY%
  const imgX = slotX + (slotW - scaledW) * cropX
  const imgY = slotY + (slotH - scaledH) * cropY

  // 3. transform: scale(zoom) at transform-origin: cropX% cropY%
  const originX = slotX + slotW * cropX
  const originY = slotY + slotH * cropY
  const finalX = originX + (imgX - originX) * zoom
  const finalY = originY + (imgY - originY) * zoom
  const finalW = scaledW * zoom
  const finalH = scaledH * zoom

  ctx.save()
  ctx.beginPath()
  ctx.rect(slotX, slotY, slotW, slotH)
  ctx.clip()
  ctx.drawImage(img, finalX, finalY, finalW, finalH)
  ctx.restore()
}

function drawTextSlot(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number, w: number, h: number
): void {
  ctx.save()
  ctx.fillStyle = 'rgba(242, 240, 238, 0.95)'
  ctx.fillRect(x, y, w, h)

  const padding = Math.max(6, w * 0.03)
  const fontSize = Math.max(8, Math.min(11, h * 0.04))
  const lineHeight = fontSize * 1.5

  ctx.fillStyle = '#374151'
  ctx.font = `${fontSize}px Georgia, "Times New Roman", serif`

  const maxWidth = w - padding * 2
  const words = text.split(/\s+/)
  let line = ''
  let lineY = y + padding + fontSize

  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      if (lineY + lineHeight <= y + h - padding) {
        ctx.fillText(line, x + padding, lineY)
        line = word
        lineY += lineHeight
      } else {
        break
      }
    } else {
      line = test
    }
  }
  if (line && lineY <= y + h - padding) {
    ctx.fillText(line, x + padding, lineY)
  }
  ctx.restore()
}

function drawEmptySlot(
  ctx: CanvasRenderingContext2D,
  type: 'image' | 'text',
  x: number, y: number, w: number, h: number
): void {
  ctx.save()
  ctx.strokeStyle = type === 'image' ? 'rgba(0,0,0,0.07)' : 'rgba(99,140,255,0.18)'
  ctx.setLineDash([3, 4])
  ctx.lineWidth = 0.5
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
  ctx.restore()
}

// ─── Page renderer ──────────────────────────────────────────────────────────

async function renderPageToCanvas(
  layout: PageLayout,
  pageIndex: number,
  assignments: Record<string, BookAssignment>,
  pixelWidth: number,
  pixelHeight: number,
  isSpread: boolean,
  isRightPage: boolean
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  const ctx = canvas.getContext('2d')!

  // Paper background
  ctx.fillStyle = '#fdfbf9'
  ctx.fillRect(0, 0, pixelWidth, pixelHeight)

  // In spread mode slots span the full two-page width; each half of the spread
  // is rendered by offsetting the right page by -pixelWidth
  const spreadWidth = isSpread ? pixelWidth * 2 : pixelWidth

  for (const slotDef of layout.slots) {
    const slotX = slotDef.x * spreadWidth - (isSpread && isRightPage ? pixelWidth : 0)
    const slotY = slotDef.y * pixelHeight
    const slotW = slotDef.width * spreadWidth
    const slotH = slotDef.height * pixelHeight

    const key = `${pageIndex}-${slotDef.id}`
    const assignment = assignments[key] ?? null

    if (assignment?.type === 'image' && assignment.thumbnailUrl) {
      await drawImageSlot(ctx, assignment.thumbnailUrl,
        slotX, slotY, slotW, slotH,
        assignment.cropX ?? 0.5, assignment.cropY ?? 0.5, assignment.cropZoom ?? 1)
    } else if (assignment?.type === 'text' && assignment.textContent) {
      drawTextSlot(ctx, assignment.textContent, slotX, slotY, slotW, slotH)
    } else {
      drawEmptySlot(ctx, slotDef.type, slotX, slotY, slotW, slotH)
    }
  }

  // Page number (not on spread pages — matches BookPage.tsx behaviour)
  if (!isSpread && layout.slots.length > 0) {
    ctx.save()
    ctx.fillStyle = 'rgba(156,163,175,0.5)'
    ctx.font = `${Math.max(7, pixelWidth * 0.016)}px monospace`
    const numStr = String(pageIndex + 1)
    const numW = ctx.measureText(numStr).width
    const margin = pixelWidth * 0.018
    ctx.fillText(numStr, isRightPage ? pixelWidth - margin - numW : margin, pixelHeight - margin)
    ctx.restore()
  }

  return canvas
}

// ─── Layout helpers ─────────────────────────────────────────────────────────

function resolvePageLayout(
  pageIndex: number,
  defaultLayoutId: string,
  pageLayouts: Record<number, string>,
  customSlots: Record<number, BookSlot[]>
): PageLayout {
  const layoutId = pageLayouts[pageIndex] ?? defaultLayoutId
  if (layoutId === 'custom') {
    return { id: 'custom', name: 'Custom', slots: customSlots[pageIndex] ?? [] }
  }
  return getLayout(layoutId)
}

function resolveSpreadLayout(
  spreadIndex: number,
  spreadLayouts: Record<number, string>,
  customSpreadSlots: Record<number, BookSlot[]>
): PageLayout | null {
  const layoutId = spreadLayouts[spreadIndex]
  if (!layoutId) return null
  if (layoutId === 'spread-custom') {
    return { id: 'spread-custom', name: 'Custom Spread', isSpread: true,
             slots: customSpreadSlots[spreadIndex] ?? [] }
  }
  return getLayout(layoutId)
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface PDFProgress {
  current: number
  total: number
  label: string
}

export async function exportBookToPDF(
  size: BookSize,
  numPages: number,
  assignments: Record<string, BookAssignment>,
  pageLayouts: Record<number, string>,
  customSlots: Record<number, BookSlot[]>,
  spreadLayouts: Record<number, string>,
  customSpreadSlots: Record<number, BookSlot[]>,
  defaultLayoutId: string,
  filename: string,
  onProgress?: (p: PDFProgress) => void
): Promise<void> {
  // Render at 150 DPI equivalent for the given page size
  const DPI = 150
  const pixelWidth  = Math.round(size.width  * DPI)
  const pixelHeight = Math.round(size.height * DPI)

  // Identify which pages are covered by a spread layout
  const maxSpreads = Math.ceil((numPages + 1) / 2)
  const spreadCoveredPages = new Set<number>()
  for (let si = 0; si < maxSpreads; si++) {
    if (!spreadLayouts[si]) continue
    const li = si === 0 ? -1 : si * 2 - 1
    const ri = si === 0 ? 0  : si * 2
    if (li >= 0) spreadCoveredPages.add(li)
    if (ri >= 0 && ri < numPages) spreadCoveredPages.add(ri)
  }

  // Build an ordered list of render jobs (one per PDF page)
  interface Job {
    pageIndex: number   // physical page index (0-based) — used for PDF ordering
    label: string
    render: () => Promise<HTMLCanvasElement>
  }

  const jobs: Job[] = []

  // Individual pages (not covered by a spread)
  for (let i = 0; i < numPages; i++) {
    if (spreadCoveredPages.has(i)) continue
    const layout = resolvePageLayout(i, defaultLayoutId, pageLayouts, customSlots)
    const isLeft = i % 2 === 1 // odd page indices are left pages
    jobs.push({
      pageIndex: i,
      label: `Page ${i + 1}`,
      render: () => renderPageToCanvas(layout, i, assignments, pixelWidth, pixelHeight, false, !isLeft),
    })
  }

  // Spread pages
  for (let si = 0; si < maxSpreads; si++) {
    const spreadLayout = resolveSpreadLayout(si, spreadLayouts, customSpreadSlots)
    if (!spreadLayout) continue
    const li = si === 0 ? -1 : si * 2 - 1
    const ri = si === 0 ? 0  : si * 2
    const vpi = SPREAD_PAGE_OFFSET + si

    if (li >= 0 && li < numPages) {
      jobs.push({
        pageIndex: li,
        label: `Page ${li + 1} (spread)`,
        render: () => renderPageToCanvas(spreadLayout, vpi, assignments, pixelWidth, pixelHeight, true, false),
      })
    }
    if (ri >= 0 && ri < numPages) {
      jobs.push({
        pageIndex: ri,
        label: `Page ${ri + 1} (spread)`,
        render: () => renderPageToCanvas(spreadLayout, vpi, assignments, pixelWidth, pixelHeight, true, true),
      })
    }
  }

  // Sort by physical page index
  jobs.sort((a, b) => a.pageIndex - b.pageIndex)

  // Create the PDF document
  const pdf = new jsPDF({ unit: 'in', format: [size.width, size.height] })

  for (let j = 0; j < jobs.length; j++) {
    onProgress?.({ current: j + 1, total: jobs.length, label: jobs[j].label })
    const canvas = await jobs[j].render()
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    if (j > 0) pdf.addPage([size.width, size.height])
    pdf.addImage(imgData, 'JPEG', 0, 0, size.width, size.height)
  }

  pdf.save(filename)
}
