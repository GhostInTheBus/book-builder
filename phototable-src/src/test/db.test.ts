import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock idb — jsdom doesn't have indexedDB
vi.mock('idb', () => ({
  openDB: vi.fn(),
}))

import { saveCanvasState, loadCanvasState, saveFolderHandle, loadFolderHandles } from '../lib/db'
// Note: saveCanvasState now requires a projectId as second argument
import { openDB } from 'idb'

const mockDB = {
  put: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  getAll: vi.fn(),
}

beforeEach(() => {
  vi.mocked(openDB).mockResolvedValue(mockDB as any)
  vi.clearAllMocks()
})

describe('saveCanvasState', () => {
  it('calls db.put with canvas state under the project id', async () => {
    const state = { photos: [], clumps: [], clumpCounter: 0, viewport: { x: 0, y: 0, zoom: 1 } }
    await saveCanvasState(state, 'proj-123')
    expect(mockDB.put).toHaveBeenCalledWith('canvas', state, 'proj-123')
  })
})

describe('loadCanvasState', () => {
  it('returns null when no state saved', async () => {
    mockDB.get.mockResolvedValue(undefined)
    const result = await loadCanvasState('proj-123')
    expect(result).toBeNull()
  })

  it('returns saved state', async () => {
    const state = { photos: [{ id: 'p1', x: 10, y: 20 }], clumps: [], clumpCounter: 0, viewport: { x: 0, y: 0, zoom: 1 } }
    mockDB.get.mockResolvedValue(state)
    const result = await loadCanvasState('proj-123')
    expect(result).toEqual(state)
  })
})

describe('saveFolderHandle', () => {
  it('calls db.put with folder id and handle', async () => {
    const handle = { name: 'photos' } as FileSystemDirectoryHandle
    await saveFolderHandle('f1', handle)
    expect(mockDB.put).toHaveBeenCalledWith('folders', { id: 'f1', handle }, 'f1')
  })
})

describe('loadFolderHandles', () => {
  it('returns all stored folder handles', async () => {
    mockDB.getAll.mockResolvedValue([
      { id: 'f1', handle: { name: 'photos' } },
    ])
    const result = await loadFolderHandles()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('f1')
  })
})
