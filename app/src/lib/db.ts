import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface CanvasData {
  photos: unknown[]
  clumps: unknown[]
  clumpCounter: number
  viewport: unknown
}

interface SequencerDB extends DBSchema {
  canvas: { key: string; value: CanvasData }
  folders: { key: string; value: { id: string; handle: FileSystemDirectoryHandle } }
  projects: { key: string; value: { id: string; name: string; createdAt: number } }
}

let dbPromise: Promise<IDBPDatabase<SequencerDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SequencerDB>('spatial-sequencer', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('canvas')
          db.createObjectStore('folders')
        }
        if (oldVersion < 2) {
          db.createObjectStore('projects')
        }
      },
    })
  }
  return dbPromise
}

export async function saveCanvasState(state: CanvasData, projectId: string): Promise<void> {
  const db = await getDB()
  await db.put('canvas', state, projectId)
}

export async function loadCanvasState(projectId: string): Promise<CanvasData | null> {
  const db = await getDB()
  const val = await db.get('canvas', projectId)
  return val ?? null
}

/** Load the legacy 'current' key written by v1 — used once for migration */
export async function loadLegacyCanvasState(): Promise<CanvasData | null> {
  const db = await getDB()
  const val = await db.get('canvas', 'current')
  return val ?? null
}

export async function deleteCanvasState(projectId: string): Promise<void> {
  const db = await getDB()
  await db.delete('canvas', projectId)
}

export async function saveProject(project: { id: string; name: string; createdAt: number }): Promise<void> {
  const db = await getDB()
  await db.put('projects', project, project.id)
}

export async function loadProjects(): Promise<{ id: string; name: string; createdAt: number }[]> {
  const db = await getDB()
  return db.getAll('projects')
}

export async function deleteProjectRecord(projectId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['projects', 'canvas'], 'readwrite')
  await tx.objectStore('projects').delete(projectId)
  await tx.objectStore('canvas').delete(projectId)
  await tx.done
}

export async function saveFolderHandle(
  id: string,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await getDB()
  await db.put('folders', { id, handle }, id)
}

export async function loadFolderHandles(): Promise<
  { id: string; handle: FileSystemDirectoryHandle }[]
> {
  const db = await getDB()
  return db.getAll('folders')
}

export async function deleteFolderHandle(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('folders', id)
}
