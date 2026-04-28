const THUMBNAIL_MAX_PX = 400

export async function createThumbnailUrl(
  fileHandle: FileSystemFileHandle
): Promise<string> {
  const file = await fileHandle.getFile()
  return new Promise((resolve, reject) => {
    const img = new Image()
    const originalUrl = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, THUMBNAIL_MAX_PX / Math.max(img.width, img.height))
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(originalUrl)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('toBlob failed')); return }
          resolve(URL.createObjectURL(blob))
        },
        'image/jpeg',
        0.8
      )
    }
    img.onerror = reject
    img.src = originalUrl
  })
}

export async function createFullResUrl(
  fileHandle: FileSystemFileHandle
): Promise<string> {
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}
