const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export function generateFolderId(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return `folder-${Math.abs(hash).toString(36)}`
}

export function generateImageId(folderName: string, filename: string): string {
  return generateFolderId(`${folderName}/${filename}`)
}

export async function listImageFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<FileSystemFileHandle[]> {
  const results: FileSystemFileHandle[] = []
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== 'file') continue
    const lower = entry.name.toLowerCase()
    if (IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      results.push(entry as FileSystemFileHandle)
    }
  }
  return results
}

/** @deprecated use listImageFiles */
export const listJpegFiles = listImageFiles

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await window.showDirectoryPicker({ mode: 'read' })
  } catch {
    return null // user cancelled
  }
}

/** Firefox fallback: open a directory via <input webkitdirectory> */
export async function pickFolderFiles(): Promise<{ name: string; files: File[] } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    ;(input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true
    input.addEventListener('change', () => {
      const all = Array.from(input.files ?? [])
      const images = all.filter((f) =>
        IMAGE_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))
      )
      if (images.length === 0) { resolve(null); return }
      const folderName = images[0].webkitRelativePath?.split('/')[0] || 'Imported Folder'
      resolve({ name: folderName, files: images })
    })
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}
