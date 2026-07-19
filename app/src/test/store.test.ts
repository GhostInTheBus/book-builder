// src/test/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store/store'

beforeEach(() => {
  useStore.setState({
    library: { folders: [], activeFolderId: null },
    canvas: { photos: [], clumps: [], clumpCounter: 0, viewport: { x: 0, y: 0, zoom: 1 } },
    ui: { selectedIds: [], draggingIds: [], showFilenames: true, saveStatus: 'saved' },
    projects: { projects: [], activeProjectId: 'test-project' },
  })
})

describe('canvas slice', () => {
  it('addPhoto places a photo with given position', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 100, y: 200, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    const photos = useStore.getState().canvas.photos
    expect(photos).toHaveLength(1)
    expect(photos[0]).toMatchObject({ id: 'p1', x: 100, y: 200 })
  })

  it('movePhoto updates x/y of an existing photo', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().movePhoto('p1', 300, 400)
    const photo = useStore.getState().canvas.photos.find(p => p.id === 'p1')
    expect(photo).toMatchObject({ x: 300, y: 400 })
  })

  it('removePhoto removes a photo by id', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().removePhoto('p1')
    expect(useStore.getState().canvas.photos).toHaveLength(0)
  })

  it('setViewport updates viewport values', () => {
    useStore.getState().setViewport({ x: 50, y: 75, zoom: 1.5 })
    expect(useStore.getState().canvas.viewport).toEqual({ x: 50, y: 75, zoom: 1.5 })
  })

  it('movePhotos shifts multiple photos by delta', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 100, y: 100, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 200, y: 200, rotation: 0, scale: 1, zIndex: 2, clumpId: null })
    useStore.getState().movePhotos(['p1', 'p2'], 50, -30)
    const photos = useStore.getState().canvas.photos
    expect(photos.find(p => p.id === 'p1')).toMatchObject({ x: 150, y: 70 })
    expect(photos.find(p => p.id === 'p2')).toMatchObject({ x: 250, y: 170 })
  })

  it('movePhotos only moves specified ids', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 100, y: 100, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 200, y: 200, rotation: 0, scale: 1, zIndex: 2, clumpId: null })
    useStore.getState().movePhotos(['p1'], 50, 0)
    const photos = useStore.getState().canvas.photos
    expect(photos.find(p => p.id === 'p1')).toMatchObject({ x: 150 })
    expect(photos.find(p => p.id === 'p2')).toMatchObject({ x: 200 }) // unchanged
  })

  it('setPhotoRotation updates rotation for a photo', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().setPhotoRotation('p1', 45)
    const photo = useStore.getState().canvas.photos.find(p => p.id === 'p1')
    expect(photo?.rotation).toBe(45)
  })

  it('bringToFront sets zIndex above all others', () => {
    useStore.getState().addPhoto({ id: 'p1', libraryImageId: 'img1', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 1, clumpId: null })
    useStore.getState().addPhoto({ id: 'p2', libraryImageId: 'img2', x: 0, y: 0, rotation: 0, scale: 1, zIndex: 5, clumpId: null })
    useStore.getState().bringToFront('p1')
    const photo = useStore.getState().canvas.photos.find(p => p.id === 'p1')
    expect(photo?.zIndex).toBe(6) // maxZ(5) + 1
  })
})

describe('ui slice', () => {
  it('setSelectedIds replaces selection', () => {
    useStore.getState().setSelectedIds(['p1', 'p2'])
    expect(useStore.getState().ui.selectedIds).toEqual(['p1', 'p2'])
  })

  it('toggleFilenames flips showFilenames', () => {
    expect(useStore.getState().ui.showFilenames).toBe(true)
    useStore.getState().toggleFilenames()
    expect(useStore.getState().ui.showFilenames).toBe(false)
  })

  it('setSaveStatus updates save status', () => {
    useStore.getState().setSaveStatus('saving')
    expect(useStore.getState().ui.saveStatus).toBe('saving')
    useStore.getState().setSaveStatus('saved')
    expect(useStore.getState().ui.saveStatus).toBe('saved')
  })
})

describe('library slice', () => {
  it('addFolder adds a folder', () => {
    useStore.getState().addFolder({ id: 'f1', name: 'Nepal 2024', handle: {} as FileSystemDirectoryHandle, images: [], loaded: false })
    expect(useStore.getState().library.folders).toHaveLength(1)
    expect(useStore.getState().library.folders[0].name).toBe('Nepal 2024')
  })

  it('setFolderImages updates images for a folder', () => {
    useStore.getState().addFolder({ id: 'f1', name: 'Test', handle: {} as FileSystemDirectoryHandle, images: [], loaded: false })
    useStore.getState().setFolderImages('f1', [
      { id: 'i1', filename: 'DSC001.jpg', folderPath: '/test', fileHandle: {} as FileSystemFileHandle, thumbnailUrl: 'blob:x' },
    ])
    const folder = useStore.getState().library.folders.find(f => f.id === 'f1')
    expect(folder?.images).toHaveLength(1)
    expect(folder?.loaded).toBe(true)
  })
})
