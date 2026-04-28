import { describe, it, expect } from 'vitest'
import { exportSequenceAsText } from '../lib/export'
import { PlacedPhoto, Clump, LibraryImage } from '../store/types'

const makePhoto = (overrides: Partial<PlacedPhoto> & { id: string }): PlacedPhoto => ({
  libraryImageId: overrides.id,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  zIndex: 1,
  clumpId: null,
  ...overrides,
})

const makeImage = (id: string, filename: string): LibraryImage => ({
  id,
  filename,
  folderPath: 'test',
  fileHandle: null as unknown as FileSystemFileHandle,
  thumbnailUrl: '',
})

describe('exportSequenceAsText', () => {
  it('groups photos by clump with correct headers', () => {
    const clump: Clump = { id: 'c1', name: 'Clump 1', color: '#E74C3C' }
    const photos = [
      makePhoto({ id: 'p1', libraryImageId: 'img1', clumpId: 'c1', x: 0, y: 0 }),
      makePhoto({ id: 'p2', libraryImageId: 'img2', clumpId: 'c1', x: 100, y: 0 }),
    ]
    const images = [makeImage('img1', 'IMG_001.jpg'), makeImage('img2', 'IMG_002.jpg')]

    const result = exportSequenceAsText(photos, [clump], images)

    expect(result).toContain('## Clump 1')
    expect(result).toContain('1. IMG_001.jpg')
    expect(result).toContain('2. IMG_002.jpg')
  })

  it('sorts photos left-to-right within a clump', () => {
    const clump: Clump = { id: 'c1', name: 'Clump 1', color: '#E74C3C' }
    const photos = [
      makePhoto({ id: 'p2', libraryImageId: 'img2', clumpId: 'c1', x: 200, y: 0 }),
      makePhoto({ id: 'p1', libraryImageId: 'img1', clumpId: 'c1', x: 0, y: 0 }),
    ]
    const images = [makeImage('img1', 'A.jpg'), makeImage('img2', 'B.jpg')]

    const result = exportSequenceAsText(photos, [clump], images)
    const lines = result.split('\n').filter((l) => l.trim().match(/^\d+\./))
    expect(lines[0]).toContain('A.jpg')
    expect(lines[1]).toContain('B.jpg')
  })

  it('places unclumped photos under ## Unclumped', () => {
    const photos = [makePhoto({ id: 'p1', libraryImageId: 'img1', clumpId: null })]
    const images = [makeImage('img1', 'SOLO.jpg')]

    const result = exportSequenceAsText(photos, [], images)

    expect(result).toContain('## Unclumped')
    expect(result).toContain('1. SOLO.jpg')
  })

  it('omits empty clumps from output', () => {
    const clump: Clump = { id: 'c1', name: 'Clump 1', color: '#E74C3C' }
    // No photos reference this clump
    const result = exportSequenceAsText([], [clump], [])
    expect(result).not.toContain('## Clump 1')
  })

  it('returns empty string when no photos', () => {
    const result = exportSequenceAsText([], [], [])
    expect(result).toBe('')
  })
})
