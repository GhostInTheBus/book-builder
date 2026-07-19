import { PlacedPhoto, Clump, LibraryImage } from '../store/types'

const ROW_HEIGHT = 200 // px — photos within this vertical range are in the same "row"

function spatialSort(photos: PlacedPhoto[]): PlacedPhoto[] {
  // Sort left-to-right, top-to-bottom in row bands
  return [...photos].sort((a, b) => {
    const rowA = Math.floor(a.y / ROW_HEIGHT)
    const rowB = Math.floor(b.y / ROW_HEIGHT)
    if (rowA !== rowB) return rowA - rowB
    return a.x - b.x
  })
}

export function exportSequenceAsText(
  photos: PlacedPhoto[],
  clumps: Clump[],
  libraryImages: LibraryImage[]
): string {
  const imageMap = new Map(libraryImages.map((img) => [img.id, img.filename]))

  // Group by clumpId
  const clumpedGroups = new Map<string, PlacedPhoto[]>()
  const unclumped: PlacedPhoto[] = []

  for (const photo of photos) {
    if (photo.clumpId) {
      const group = clumpedGroups.get(photo.clumpId) ?? []
      group.push(photo)
      clumpedGroups.set(photo.clumpId, group)
    } else {
      unclumped.push(photo)
    }
  }

  const lines: string[] = []

  // Render clumped groups in order they appear in the clumps array
  for (const clump of clumps) {
    const group = clumpedGroups.get(clump.id)
    if (!group || group.length === 0) continue
    lines.push(`## ${clump.name}`)
    spatialSort(group).forEach((p, i) => {
      const filename = imageMap.get(p.libraryImageId) ?? p.libraryImageId
      lines.push(`  ${i + 1}. ${filename}`)
    })
    lines.push('')
  }

  // Render unclumped photos
  if (unclumped.length > 0) {
    lines.push('## Unclumped')
    spatialSort(unclumped).forEach((p, i) => {
      const filename = imageMap.get(p.libraryImageId) ?? p.libraryImageId
      lines.push(`  ${i + 1}. ${filename}`)
    })
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
