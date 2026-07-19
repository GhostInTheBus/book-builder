import { BookAssignment, BookSize, BookSlot } from '../store/types'
import { getLayout, SPREAD_PAGE_OFFSET } from '../templates'

interface InDesignSlot {
  id: string
  type: 'image' | 'text'
  imagePath: string
  filename: string
  textContent: string
  // Normalized 0–1 coords relative to each page (not spread)
  x: number
  y: number
  width: number
  height: number
}

interface InDesignPage {
  pageNumber: number
  layoutName: string
  isPartOfSpread: boolean
  slots: InDesignSlot[]
}

interface InDesignExport {
  bookMetadata: {
    sizeId: string
    sizeName: string
    widthIn: number
    heightIn: number
    exportedAt: string
    totalPages: number
  }
  pages: InDesignPage[]
}

function makeSlot(slotDef: BookSlot, assignment: BookAssignment | undefined): InDesignSlot {
  return {
    id: slotDef.id,
    type: slotDef.type,
    imagePath:
      slotDef.type === 'image' && assignment?.type === 'image'
        ? `${assignment.folderPath}/${assignment.filename}`
        : '',
    filename: assignment?.filename ?? '',
    textContent:
      slotDef.type === 'text' && assignment?.type === 'text'
        ? (assignment.textContent ?? '')
        : '',
    x: slotDef.x,
    y: slotDef.y,
    width: slotDef.width,
    height: slotDef.height,
  }
}

/**
 * Converts a spread-space slot (x: 0–1 across both pages) into a
 * page-relative slot for InDesign (x: 0–1 relative to that page's left edge).
 */
function splitSpreadSlot(slotDef: BookSlot, side: 'left' | 'right'): BookSlot | null {
  // left page occupies x: 0–0.5 of the spread, right page: 0.5–1.0
  const pageStart = side === 'left' ? 0 : 0.5
  const pageEnd = side === 'left' ? 0.5 : 1.0

  const slotEnd = slotDef.x + slotDef.width

  // Does this slot overlap this page?
  if (slotEnd <= pageStart || slotDef.x >= pageEnd) return null

  // Clip to page range, then convert to page-relative 0–1 coords
  const clippedStart = Math.max(slotDef.x, pageStart)
  const clippedEnd   = Math.min(slotEnd, pageEnd)
  return {
    ...slotDef,
    x: (clippedStart - pageStart) * 2,  // scale from [0, 0.5] → [0, 1]
    width: (clippedEnd - clippedStart) * 2,
  }
}

export function buildExportJSON(
  size: BookSize,
  defaultLayoutId: string,
  numPages: number,
  assignments: Record<string, BookAssignment>,
  pageLayouts: Record<number, string>,
  customSlots: Record<number, BookSlot[]>,
  spreadLayouts: Record<number, string>,
  customSpreadSlots: Record<number, BookSlot[]>
): InDesignExport {
  const pages: InDesignPage[] = []

  // Track which page indices are covered by a spread layout so we don't double-export
  const spreadCoveredPages = new Set<number>()

  // Process spreads first
  const maxSpreads = Math.ceil((numPages + 1) / 2)
  for (let si = 0; si < maxSpreads; si++) {
    const spreadLayoutId = spreadLayouts[si]
    if (!spreadLayoutId) continue

    const leftIdx  = si === 0 ? -1 : si * 2 - 1
    const rightIdx = si === 0 ? 0  : si * 2

    let spreadSlots: BookSlot[]
    let layoutName: string
    if (spreadLayoutId === 'spread-custom') {
      spreadSlots = customSpreadSlots[si] ?? []
      layoutName = 'Custom Spread'
    } else {
      const layout = getLayout(spreadLayoutId)
      spreadSlots = layout.slots
      layoutName = layout.name
    }

    const virtualPageIndex = SPREAD_PAGE_OFFSET + si

    // Left page half
    if (leftIdx >= 0 && leftIdx < numPages) {
      const slots: InDesignSlot[] = spreadSlots
        .map(slot => splitSpreadSlot(slot, 'left'))
        .filter((s): s is BookSlot => s !== null)
        .map(slot => makeSlot(slot, assignments[`${virtualPageIndex}-${slot.id}`]))
      pages.push({ pageNumber: leftIdx + 1, layoutName, isPartOfSpread: true, slots })
      spreadCoveredPages.add(leftIdx)
    }

    // Right page half
    if (rightIdx >= 0 && rightIdx < numPages) {
      const slots: InDesignSlot[] = spreadSlots
        .map(slot => splitSpreadSlot(slot, 'right'))
        .filter((s): s is BookSlot => s !== null)
        .map(slot => makeSlot(slot, assignments[`${virtualPageIndex}-${slot.id}`]))
      pages.push({ pageNumber: rightIdx + 1, layoutName, isPartOfSpread: true, slots })
      spreadCoveredPages.add(rightIdx)
    }
  }

  // Process remaining individual pages
  for (let i = 0; i < numPages; i++) {
    if (spreadCoveredPages.has(i)) continue

    const layoutId = pageLayouts[i] ?? defaultLayoutId
    let slots: BookSlot[]
    let layoutName: string
    if (layoutId === 'custom') {
      slots = customSlots[i] ?? []
      layoutName = 'Custom'
    } else {
      const layout = getLayout(layoutId)
      slots = layout.slots
      layoutName = layout.name
    }

    const exportSlots = slots.map(slot => makeSlot(slot, assignments[`${i}-${slot.id}`]))
    pages.push({ pageNumber: i + 1, layoutName, isPartOfSpread: false, slots: exportSlots })
  }

  // Sort by page number
  pages.sort((a, b) => a.pageNumber - b.pageNumber)

  return {
    bookMetadata: {
      sizeId: size.id,
      sizeName: size.name,
      widthIn: size.width,
      heightIn: size.height,
      exportedAt: new Date().toISOString(),
      totalPages: numPages,
    },
    pages,
  }
}

export function downloadBookJSON(data: InDesignExport, filename = 'book-layout.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
