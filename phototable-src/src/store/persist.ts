import { useStore } from './store'
import { saveCanvasState } from '../lib/db'

let saveTimer: ReturnType<typeof setTimeout> | null = null

export function initAutoSave(): () => void {
  const unsub = useStore.subscribe(
    (state) => state.canvas,
    (canvas) => {
      const projectId = useStore.getState().projects.activeProjectId
      if (!projectId) return
      if (saveTimer) clearTimeout(saveTimer)
      useStore.getState().setSaveStatus('saving')
      saveTimer = setTimeout(async () => {
        try {
          await saveCanvasState(
            { photos: canvas.photos, clumps: canvas.clumps, clumpCounter: canvas.clumpCounter, viewport: canvas.viewport },
            projectId
          )
          useStore.getState().setSaveStatus('saved')
        } catch (err) {
          console.error('Auto-save failed:', err)
          useStore.getState().setSaveStatus('saved')
        }
      }, 500)
    }
  )
  return unsub
}

/** Flush any pending save immediately for the given project ID */
export async function flushSave(projectId: string): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  const canvas = useStore.getState().canvas
  await saveCanvasState(
    { photos: canvas.photos, clumps: canvas.clumps, clumpCounter: canvas.clumpCounter, viewport: canvas.viewport },
    projectId
  )
  useStore.getState().setSaveStatus('saved')
}
