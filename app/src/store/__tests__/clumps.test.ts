import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store'
import { CLUMP_COLORS } from '../types'

describe('clump store actions', () => {
  beforeEach(() => {
    // Reset store to clean state
    useStore.setState({
      canvas: { photos: [], clumps: [], clumpCounter: 0, viewport: { x: 0, y: 0, zoom: 1 } },
      projects: { projects: [], activeProjectId: 'test-project' },
    })
  })

  it('createClump assigns color and name, sets clumpId on photos', () => {
    // Add two photos
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 100, y: 0, rotation: 0, scale: 1, zIndex: 2, clumpId: null })

    useStore.getState().createClump(['p1', 'p2'])

    const { clumps, photos } = useStore.getState().canvas
    expect(clumps).toHaveLength(1)
    expect(clumps[0].color).toBe(CLUMP_COLORS[0])
    expect(clumps[0].name).toBe('Clump 1')
    expect(photos.find((p) => p.id === 'p1')?.clumpId).toBe(clumps[0].id)
    expect(photos.find((p) => p.id === 'p2')?.clumpId).toBe(clumps[0].id)
  })

  it('createClump uses round-robin colors', () => {
    for (let i = 0; i < 9; i++) {
      useStore.getState().addPhoto({ id: `p${i}`, libraryImageId: `img${i}`, x: 0, y: 0, rotation: 0, scale: 1, zIndex: i, clumpId: null })
    }
    // Create 9 clumps (will wrap around the 8-color palette)
    for (let i = 0; i < 9; i++) {
      useStore.getState().createClump([`p${i}`])
    }
    const { clumps } = useStore.getState().canvas
    expect(clumps[8].color).toBe(CLUMP_COLORS[0]) // wraps back to first
  })

  it('removeClump removes clump and clears clumpId on its photos', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().createClump(['p1'])
    const clumpId = useStore.getState().canvas.clumps[0].id

    useStore.getState().removeClump(clumpId)

    const { clumps, photos } = useStore.getState().canvas
    expect(clumps).toHaveLength(0)
    expect(photos.find((p) => p.id === 'p1')?.clumpId).toBeNull()
  })

  it('unclumpPhotos removes clumpId from specified photos, removes empty clumps', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 100, y: 0, rotation: 0, scale: 1, zIndex: 2, clumpId: null })
    useStore.getState().createClump(['p1', 'p2'])

    useStore.getState().unclumpPhotos(['p1', 'p2'])

    const { clumps, photos } = useStore.getState().canvas
    expect(clumps).toHaveLength(0) // clump is empty, removed
    expect(photos.find((p) => p.id === 'p1')?.clumpId).toBeNull()
    expect(photos.find((p) => p.id === 'p2')?.clumpId).toBeNull()
  })

  it('unclumpPhotos keeps clump if it still has members', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 100, y: 0, rotation: 0, scale: 1, zIndex: 2, clumpId: null })
    useStore.getState().createClump(['p1', 'p2'])

    useStore.getState().unclumpPhotos(['p1']) // only remove one

    const { clumps, photos } = useStore.getState().canvas
    expect(clumps).toHaveLength(1) // still has p2
    expect(photos.find((p) => p.id === 'p1')?.clumpId).toBeNull()
    expect(photos.find((p) => p.id === 'p2')?.clumpId).toBe(clumps[0].id)
  })

  it('clearTable removes all photos and clumps', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().createClump(['p1'])

    useStore.getState().clearTable()

    const { clumps, photos } = useStore.getState().canvas
    expect(photos).toHaveLength(0)
    expect(clumps).toHaveLength(0)
  })

  it('setClumps bulk-restores clumps array', () => {
    const restored = [{ id: 'clump-abc', name: 'Clump 1', color: CLUMP_COLORS[0] }]
    useStore.getState().setClumps(restored)
    expect(useStore.getState().canvas.clumps).toEqual(restored)
  })
})
