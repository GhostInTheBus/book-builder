// src/store/store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  BookSlot,
  BookState,
  Clump,
  CLUMP_COLORS,
  Folder,
  LibraryImage,
  PlacedPhoto,
  Project,
  Viewport,
} from './types'

interface LibrarySlice {
  folders: Folder[]
  activeFolderId: string | null
}

interface CanvasSlice {
  photos: PlacedPhoto[]
  clumps: Clump[]
  clumpCounter: number
  viewport: Viewport
}

interface UISlice {
  selectedIds: string[]
  draggingIds: string[]
  showFilenames: boolean
  saveStatus: 'saved' | 'saving'
}

interface ProjectsSlice {
  projects: Project[]
  activeProjectId: string
}

interface StoreActions {
  addFolder: (folder: Folder) => void
  setFolderImages: (folderId: string, images: LibraryImage[]) => void
  removeFolder: (id: string) => void
  setActiveFolderId: (id: string | null) => void
  addPhoto: (photo: PlacedPhoto) => void
  movePhoto: (id: string, x: number, y: number) => void
  movePhotos: (ids: string[], dx: number, dy: number) => void
  removePhoto: (id: string) => void
  setPhotoRotation: (id: string, rotation: number) => void
  setPhotoScale: (id: string, scale: number) => void
  bringToFront: (id: string) => void
  bringGroupToFront: (ids: string[]) => void
  setViewport: (viewport: Viewport) => void
  setSelectedIds: (ids: string[]) => void
  setDraggingIds: (ids: string[]) => void
  toggleFilenames: () => void
  setSaveStatus: (status: 'saved' | 'saving') => void
  createClump: (photoIds: string[]) => void
  removeClump: (clumpId: string) => void
  unclumpPhotos: (photoIds: string[]) => void
  clearTable: () => void
  setClumps: (clumps: Clump[]) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  setActiveProjectId: (id: string) => void
  updateProjectName: (id: string, name: string) => void
  removeProject: (id: string) => void
  restoreCanvas: (canvas: { photos: PlacedPhoto[]; clumps: Clump[]; clumpCounter: number; viewport: Viewport }) => void

  // Book Actions
  setBookSizeId: (id: string) => void
  setCustomSize: (width: number, height: number) => void
  setBookStyle: (style: 'book' | 'zine') => void
  setDefaultLayoutId: (id: string) => void
  setBookNumPages: (num: number) => void
  setSpreadIndex: (index: number) => void
  setPageLayout: (pageIndex: number, layoutId: string | null) => void
  setCustomSlots: (pageIndex: number, slots: BookSlot[]) => void
  setSpreadLayout: (spreadIndex: number, layoutId: string | null) => void
  setCustomSpreadSlots: (spreadIndex: number, slots: BookSlot[]) => void
  assignImageToBook: (pageIndex: number, slotId: string, image: LibraryImage | null) => void
  assignTextToBook: (pageIndex: number, slotId: string, text: string | null) => void
  adjustImageCrop: (pageIndex: number, slotId: string, cropX: number, cropY: number, cropZoom: number) => void
  clearAllAssignments: () => void
}

type StoreState = {
  library: LibrarySlice
  canvas: CanvasSlice
  ui: UISlice
  projects: ProjectsSlice
  book: BookState
} & StoreActions

export const useStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    library: { folders: [], activeFolderId: null },
    canvas: { photos: [], clumps: [], clumpCounter: 0, viewport: { x: 0, y: 0, zoom: 1 } },
    ui: {
      selectedIds: [],
      draggingIds: [],
      showFilenames: true,
      saveStatus: 'saved',
    },
    projects: { projects: [], activeProjectId: '' },
    book: {
      sizeId: 'sq-10',
      customWidth: 10,
      customHeight: 10,
      bookStyle: 'book' as const,
      defaultLayoutId: 'full-bleed',
      numPages: 20,
      currentSpreadIndex: 0,
      pageLayouts: {},
      customSlots: {},
      spreadLayouts: {},
      customSpreadSlots: {},
      assignments: {},
    },

    addFolder: (folder) =>
      set((s) => ({ library: { ...s.library, folders: [...s.library.folders, folder] } })),
    setFolderImages: (folderId, images) =>
      set((s) => ({
        library: {
          ...s.library,
          folders: s.library.folders.map((f) =>
            f.id === folderId ? { ...f, images, loaded: true } : f
          ),
        },
      })),
    removeFolder: (id) =>
      set((s) => ({
        library: { ...s.library, folders: s.library.folders.filter((f) => f.id !== id) },
      })),
    setActiveFolderId: (id) =>
      set((s) => ({ library: { ...s.library, activeFolderId: id } })),

    addPhoto: (photo) =>
      set((s) => ({ canvas: { ...s.canvas, photos: [...s.canvas.photos, photo] } })),
    movePhoto: (id, x, y) =>
      set((s) => ({
        canvas: {
          ...s.canvas,
          photos: s.canvas.photos.map((p) => (p.id === id ? { ...p, x, y } : p)),
        },
      })),
    movePhotos: (ids, dx, dy) =>
      set((s) => ({
        canvas: {
          ...s.canvas,
          photos: s.canvas.photos.map((p) =>
            ids.includes(p.id) ? { ...p, x: p.x + dx, y: p.y + dy } : p
          ),
        },
      })),
    removePhoto: (id) =>
      set((s) => ({
        canvas: { ...s.canvas, photos: s.canvas.photos.filter((p) => p.id !== id) },
      })),
    setPhotoRotation: (id, rotation) =>
      set((s) => ({
        canvas: {
          ...s.canvas,
          photos: s.canvas.photos.map((p) => (p.id === id ? { ...p, rotation } : p)),
        },
      })),
    setPhotoScale: (id, scale) =>
      set((s) => ({
        canvas: {
          ...s.canvas,
          photos: s.canvas.photos.map((p) => (p.id === id ? { ...p, scale } : p)),
        },
      })),
    bringToFront: (id) =>
      set((s) => {
        const maxZ = Math.max(0, ...s.canvas.photos.map((p) => p.zIndex))
        return {
          canvas: {
            ...s.canvas,
            photos: s.canvas.photos.map((p) => (p.id === id ? { ...p, zIndex: maxZ + 1 } : p)),
          },
        }
      }),
    bringGroupToFront: (ids) =>
      set((s) => {
        const maxZ = Math.max(0, ...s.canvas.photos.map((p) => p.zIndex))
        let groupIndex = 0
        return {
          canvas: {
            ...s.canvas,
            photos: s.canvas.photos.map((p) =>
              ids.includes(p.id) ? { ...p, zIndex: maxZ + (++groupIndex) } : p
            ),
          },
        }
      }),
    setViewport: (viewport) =>
      set((s) => ({ canvas: { ...s.canvas, viewport } })),

    setSelectedIds: (ids) => set((s) => ({ ui: { ...s.ui, selectedIds: ids } })),
    setDraggingIds: (ids) => set((s) => ({ ui: { ...s.ui, draggingIds: ids } })),
    toggleFilenames: () => set((s) => ({ ui: { ...s.ui, showFilenames: !s.ui.showFilenames } })),
    setSaveStatus: (status) => set((s) => ({ ui: { ...s.ui, saveStatus: status } })),

    createClump: (photoIds) =>
      set((s) => {
        const counter = s.canvas.clumpCounter + 1
        const color = CLUMP_COLORS[(counter - 1) % CLUMP_COLORS.length]
        const name = `Clump ${counter}`
        const id = `clump-${crypto.randomUUID()}`
        const newClump: Clump = { id, name, color }
        return {
          canvas: {
            ...s.canvas,
            clumpCounter: counter,
            clumps: [...s.canvas.clumps, newClump],
            photos: s.canvas.photos.map((p) =>
              photoIds.includes(p.id) ? { ...p, clumpId: id } : p
            ),
          },
        }
      }),
    removeClump: (clumpId) =>
      set((s) => ({
        canvas: {
          ...s.canvas,
          clumps: s.canvas.clumps.filter((c) => c.id !== clumpId),
          photos: s.canvas.photos.map((p) =>
            p.clumpId === clumpId ? { ...p, clumpId: null } : p
          ),
        },
      })),
    unclumpPhotos: (photoIds) =>
      set((s) => {
        const updated = s.canvas.photos.map((p) =>
          photoIds.includes(p.id) ? { ...p, clumpId: null } : p
        )
        const remainingClumpIds = new Set(updated.map((p) => p.clumpId).filter(Boolean))
        const clumps = s.canvas.clumps.filter((c) => remainingClumpIds.has(c.id))
        return { canvas: { ...s.canvas, photos: updated, clumps } }
      }),
    clearTable: () =>
      set((s) => ({
        canvas: { ...s.canvas, photos: [], clumps: [], clumpCounter: 0 },
      })),
    setClumps: (clumps) =>
      set((s) => ({ canvas: { ...s.canvas, clumps } })),

    setProjects: (projects) =>
      set((s) => ({ projects: { ...s.projects, projects } })),
    addProject: (project) =>
      set((s) => ({ projects: { ...s.projects, projects: [...s.projects.projects, project] } })),
    setActiveProjectId: (id) =>
      set((s) => ({ projects: { ...s.projects, activeProjectId: id } })),
    updateProjectName: (id, name) =>
      set((s) => ({
        projects: {
          ...s.projects,
          projects: s.projects.projects.map((p) => (p.id === id ? { ...p, name } : p)),
        },
      })),
    removeProject: (id) =>
      set((s) => ({
        projects: {
          ...s.projects,
          projects: s.projects.projects.filter((p) => p.id !== id),
        },
      })),
    restoreCanvas: (canvas) => set({ canvas }),

    // Book Actions
    setBookSizeId: (id) => set((s) => ({ book: { ...s.book, sizeId: id } })),
    setCustomSize: (width, height) => set((s) => ({ book: { ...s.book, customWidth: width, customHeight: height } })),
    setBookStyle: (style) => set((s) => ({ book: { ...s.book, bookStyle: style } })),
    setDefaultLayoutId: (id) => set((s) => ({ book: { ...s.book, defaultLayoutId: id } })),
    setBookNumPages: (num) => set((s) => ({ book: { ...s.book, numPages: num } })),
    setSpreadIndex: (index) => set((s) => ({ book: { ...s.book, currentSpreadIndex: index } })),

    setPageLayout: (pageIndex, layoutId) =>
      set((s) => {
        const pageLayouts = { ...s.book.pageLayouts }
        if (layoutId) pageLayouts[pageIndex] = layoutId
        else delete pageLayouts[pageIndex]
        return { book: { ...s.book, pageLayouts } }
      }),
    setCustomSlots: (pageIndex, slots) =>
      set((s) => ({
        book: { ...s.book, customSlots: { ...s.book.customSlots, [pageIndex]: slots } },
      })),

    setSpreadLayout: (spreadIndex, layoutId) =>
      set((s) => {
        const spreadLayouts = { ...s.book.spreadLayouts }
        if (layoutId) spreadLayouts[spreadIndex] = layoutId
        else delete spreadLayouts[spreadIndex]
        return { book: { ...s.book, spreadLayouts } }
      }),
    setCustomSpreadSlots: (spreadIndex, slots) =>
      set((s) => ({
        book: {
          ...s.book,
          customSpreadSlots: { ...s.book.customSpreadSlots, [spreadIndex]: slots },
        },
      })),

    assignImageToBook: (pageIndex, slotId, image) =>
      set((s) => {
        const assignments = { ...s.book.assignments }
        const key = `${pageIndex}-${slotId}`
        if (image) {
          assignments[key] = {
            type: 'image',
            libraryImageId: image.id,
            filename: image.filename,
            folderPath: image.folderPath,
            thumbnailUrl: image.thumbnailUrl,
            cropX: 0.5,
            cropY: 0.5,
            cropZoom: 1,
          }
        } else {
          delete assignments[key]
        }
        return { book: { ...s.book, assignments } }
      }),

    assignTextToBook: (pageIndex, slotId, text) =>
      set((s) => {
        const assignments = { ...s.book.assignments }
        const key = `${pageIndex}-${slotId}`
        if (text) {
          assignments[key] = { type: 'text', textContent: text }
        } else {
          delete assignments[key]
        }
        return { book: { ...s.book, assignments } }
      }),

    adjustImageCrop: (pageIndex, slotId, cropX, cropY, cropZoom) =>
      set((s) => {
        const key = `${pageIndex}-${slotId}`
        const existing = s.book.assignments[key]
        if (!existing || existing.type !== 'image') return s
        return {
          book: {
            ...s.book,
            assignments: {
              ...s.book.assignments,
              [key]: { ...existing, cropX, cropY, cropZoom },
            },
          },
        }
      }),

    clearAllAssignments: () =>
      set((s) => ({ book: { ...s.book, assignments: {} } })),
  }))
)
