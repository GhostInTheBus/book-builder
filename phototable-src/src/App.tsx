import { useEffect } from 'react'
import { useStore } from './store/store'
import { initAutoSave } from './store/persist'
import { BookDesigner } from './designer/BookDesigner'
import { PlacedPhoto, Clump, Project, LibraryImage } from './store/types'
import { Viewport } from './store/types'

export default function App() {
  useEffect(() => {
    const unsubAutoSave = initAutoSave()

    async function restoreSession() {
      const [
        { loadCanvasState, loadLegacyCanvasState, loadFolderHandles, loadProjects, saveProject, saveCanvasState },
        { listImageFiles, generateImageId },
        { createThumbnailUrl },
      ] = await Promise.all([
        import('./lib/db'),
        import('./lib/fileSystem'),
        import('./lib/imageLoader'),
      ])

      // --- Projects setup ---
      let projects = await loadProjects()

      if (projects.length === 0) {
        const defaultProject: Project = {
          id: `proj-${crypto.randomUUID()}`,
          name: 'Default',
          createdAt: Date.now(),
        }
        await saveProject(defaultProject)

        const legacy = await loadLegacyCanvasState()
        if (legacy) {
          await saveCanvasState(
            {
              photos: legacy.photos ?? [],
              clumps: legacy.clumps ?? [],
              clumpCounter: legacy.clumpCounter ?? 0,
              viewport: legacy.viewport ?? { x: 0, y: 0, zoom: 1 },
            },
            defaultProject.id
          )
        }
        projects = [defaultProject]
      }

      projects.sort((a, b) => a.createdAt - b.createdAt)
      useStore.getState().setProjects(projects)
      const activeId = projects[0].id
      useStore.getState().setActiveProjectId(activeId)

      const saved = await loadCanvasState(activeId)
      if (saved) {
        useStore.getState().restoreCanvas({
          photos: (saved.photos ?? []) as PlacedPhoto[],
          clumps: (saved.clumps ?? []) as Clump[],
          clumpCounter: saved.clumpCounter ?? 0,
          viewport: (saved.viewport ?? { x: 0, y: 0, zoom: 1 }) as Viewport,
        })
      }

      const handles = await loadFolderHandles()
      for (const { id, handle } of handles) {
        try {
          await handle.requestPermission({ mode: 'read' })
          useStore.getState().addFolder({ id, name: handle.name, handle, images: [], loaded: false })
          const fileHandles = await listImageFiles(handle)

          const BATCH_SIZE = 8
          const accumulated: LibraryImage[] = []
          for (let i = 0; i < fileHandles.length; i += BATCH_SIZE) {
            const batch = fileHandles.slice(i, i + BATCH_SIZE)
            const results = await Promise.all(
              batch.map(async (fh) => {
                try {
                  return {
                    id: generateImageId(handle.name, fh.name),
                    filename: fh.name,
                    folderPath: handle.name,
                    fileHandle: fh,
                    thumbnailUrl: await createThumbnailUrl(fh),
                  } as LibraryImage
                } catch {
                  return null
                }
              })
            )
            accumulated.push(...results.filter(Boolean) as LibraryImage[])
            useStore.getState().setFolderImages(id, [...accumulated])
          }
        } catch {
        }
      }
    }

    restoreSession()
    return unsubAutoSave
  }, [])

  return (
    <div className="w-full h-full relative">
      <BookDesigner />
    </div>
  )
}
