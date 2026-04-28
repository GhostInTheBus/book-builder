import { useStore } from '../store/store'
import { BookPanel } from '../book/BookPanel'
import { SpreadView } from './SpreadView'
import { PageNavigator } from './TheoreticalSidebar'
import { pickFolder, generateFolderId, listImageFiles, generateImageId } from '../lib/fileSystem'
import { createThumbnailUrl } from '../lib/imageLoader'
import { LibraryImage, Folder } from '../store/types'
import { saveFolderHandle } from '../lib/db'

export function BookDesigner() {
  const library = useStore((s) => s.library)
  const { addFolder, setFolderImages } = useStore()

  async function handleAddFolder() {
    const handle = await pickFolder()
    if (!handle) return
    const id = generateFolderId(handle.name)
    const folder: Folder = { id, name: handle.name, handle, images: [], loaded: false }
    addFolder(folder)
    await saveFolderHandle(id, handle)

    const fileHandles = await listImageFiles(handle)
    const accumulated: LibraryImage[] = []
    for (const fh of fileHandles) {
      try {
        const thumb = await createThumbnailUrl(fh)
        accumulated.push({
          id: generateImageId(handle.name, fh.name),
          filename: fh.name,
          folderPath: handle.name,
          fileHandle: fh,
          thumbnailUrl: thumb,
        })
        setFolderImages(id, [...accumulated])
      } catch {
        // skip unreadable files
      }
    }
  }

  const allImages = library.folders.flatMap((f) => f.images)

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0908] overflow-hidden">
      {/* Top bar */}
      <div className="h-10 border-b border-white/[0.04] flex items-center px-4 justify-between bg-black/40 shrink-0">
        <span className="text-[11px] font-black text-orange-500/70 tracking-tight uppercase">
          Book Builder
        </span>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: page navigator */}
        <PageNavigator />

        {/* Center: book spread */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-[#0d0c0b]">
          <SpreadView />
        </div>

        {/* Right: layout inspector */}
        <BookPanel />
      </div>

      {/* Bottom: Library — one row per folder (contact sheet style) */}
      <div
        className="border-t border-white/[0.04] bg-black/50 shrink-0 flex flex-col overflow-hidden"
        style={{ maxHeight: 260, minHeight: 44 }}
      >
        {/* Library header with Add Folder button */}
        <div className="px-3 py-2 border-b border-white/[0.03] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Library</span>
            {allImages.length > 0 && (
              <span className="text-[8px] text-white/12 font-mono tabular-nums">
                {allImages.length} images · {library.folders.length} {library.folders.length === 1 ? 'folder' : 'folders'}
              </span>
            )}
          </div>
          <button
            onClick={handleAddFolder}
            className="flex items-center gap-1 px-2.5 py-1 text-[8px] text-white/30 hover:text-orange-400 uppercase tracking-widest border border-white/5 hover:border-orange-500/20 rounded-sm transition-colors"
          >
            + Add Folder
          </button>
        </div>

        {/* Contact sheets — one row per folder */}
        <div className="flex-1 overflow-y-auto">
          {library.folders.length === 0 ? (
            <div className="h-14 flex items-center justify-center">
              <span className="text-[8px] text-white/12 italic">Add a folder to import images</span>
            </div>
          ) : (
            library.folders.map((folder) => (
              <div key={folder.id} className="flex items-stretch border-b border-white/[0.03]" style={{ height: 100 }}>
                {/* Roll label */}
                <div className="w-20 shrink-0 px-2 py-2 flex flex-col justify-between border-r border-white/[0.03] bg-black/20">
                  <span className="text-[8px] text-white/30 font-bold leading-snug break-all">{folder.name}</span>
                  <span className="text-[7px] text-white/15 font-mono tabular-nums">
                    {folder.loaded ? `${folder.images.length}` : '…'}
                  </span>
                </div>
                {/* Frames */}
                <div
                  className="flex-1 flex gap-1.5 px-1.5 py-1.5 overflow-x-auto overflow-y-hidden"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249,115,22,0.15) transparent' }}
                >
                  {folder.images.map((img) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('application/x-library-image-id', img.id)}
                      className="h-full aspect-square bg-white/5 shrink-0 rounded-sm overflow-hidden group relative cursor-grab active:cursor-grabbing border border-white/[0.04] hover:border-orange-500/35 transition-colors"
                    >
                      <img
                        src={img.thumbnailUrl}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                        alt=""
                        draggable={false}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[7px] text-gray-300 truncate font-mono">{img.filename}</p>
                      </div>
                    </div>
                  ))}
                  {!folder.loaded && (
                    <div className="h-full flex items-center px-2">
                      <span className="text-[8px] text-white/15 italic">Loading…</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
