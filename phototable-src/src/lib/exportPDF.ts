import { PlacedPhoto, LibraryImage } from '../store/types'

const PHOTO_W_PX = 240

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

export async function exportLayoutAsPDF(
  photos: PlacedPhoto[],
  libraryImages: LibraryImage[],
  showFilenames: boolean
): Promise<void> {
  if (photos.length === 0) return

  const imageMap = new Map(libraryImages.map((img) => [img.id, img]))

  // Load all thumbnail images concurrently
  const loadedImages = new Map<string, HTMLImageElement>()
  await Promise.all(
    photos.map(async (photo) => {
      const lib = imageMap.get(photo.libraryImageId)
      if (!lib?.thumbnailUrl) return
      try {
        loadedImages.set(photo.id, await loadImage(lib.thumbnailUrl))
      } catch {
        // skip photos we can't load
      }
    })
  )

  // Compute bounding box with actual image aspect ratios and rotation
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const photo of photos) {
    const img = loadedImages.get(photo.id)
    const w = PHOTO_W_PX * photo.scale
    const h = img ? (img.naturalHeight / img.naturalWidth) * w : w * 0.67
    const rads = photo.rotation * Math.PI / 180
    const cos = Math.cos(rads)
    const sin = Math.sin(rads)
    const cx = photo.x + w / 2
    const cy = photo.y + h / 2
    const corners = [
      [-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2],
    ]
    for (const [dx, dy] of corners) {
      minX = Math.min(minX, cx + dx * cos - dy * sin)
      minY = Math.min(minY, cy + dx * sin + dy * cos)
      maxX = Math.max(maxX, cx + dx * cos - dy * sin)
      maxY = Math.max(maxY, cy + dx * sin + dy * cos)
    }
    if (showFilenames) maxY = Math.max(maxY, photo.y + h + 18)
  }

  const MARGIN = 48
  const contentW = maxX - minX + 2 * MARGIN
  const contentH = maxY - minY + 2 * MARGIN
  const RENDER_SCALE = 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(contentW * RENDER_SCALE)
  canvas.height = Math.round(contentH * RENDER_SCALE)
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw in z-index order
  const sorted = [...photos].sort((a, b) => a.zIndex - b.zIndex)

  for (const photo of sorted) {
    const img = loadedImages.get(photo.id)
    if (!img) continue
    const lib = imageMap.get(photo.libraryImageId)
    const w = PHOTO_W_PX * photo.scale
    const h = (img.naturalHeight / img.naturalWidth) * w
    const rads = photo.rotation * Math.PI / 180
    // Center of photo in content-space coords, then scaled
    const cx = (photo.x - minX + MARGIN + w / 2) * RENDER_SCALE
    const cy = (photo.y - minY + MARGIN + h / 2) * RENDER_SCALE

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rads)
    ctx.drawImage(img, -w * RENDER_SCALE / 2, -h * RENDER_SCALE / 2, w * RENDER_SCALE, h * RENDER_SCALE)
    if (showFilenames && lib) {
      ctx.fillStyle = '#aaaaaa'
      ctx.font = `${11 * RENDER_SCALE}px monospace`
      ctx.textAlign = 'center'
      const label = lib.filename
      const maxW = w * RENDER_SCALE
      ctx.fillText(label, 0, h * RENDER_SCALE / 2 + 14 * RENDER_SCALE, maxW)
    }
    ctx.restore()
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: contentW > contentH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [contentW, contentH],
    hotfixes: ['px_scaling'],
  })
  pdf.addImage(imgData, 'JPEG', 0, 0, contentW, contentH)
  pdf.save(`phototable-${new Date().toISOString().slice(0, 10)}.pdf`)
}
