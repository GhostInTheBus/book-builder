// src/store/types.ts

export interface LibraryImage {
  id: string
  filename: string
  folderPath: string
  fileHandle: FileSystemFileHandle | null
  thumbnailUrl: string
}

export interface Folder {
  id: string
  name: string
  handle: FileSystemDirectoryHandle | null
  images: LibraryImage[]
  loaded: boolean
}

export interface PlacedPhoto {
  id: string
  libraryImageId: string
  x: number
  y: number
  rotation: number
  scale: number
  zIndex: number
  clumpId: string | null
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export const CLUMP_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E91E63', '#FF9800'
]

export interface Clump {
  id: string
  name: string
  color: string
}

export interface Project {
  id: string
  name: string
  createdAt: number
}

// --- Book Layout Types ---

export interface BookSlot {
  id: string
  type: 'image' | 'text'
  x: number      // 0–1 normalized (or 0–1 of full spread if isSpread layout)
  y: number
  width: number
  height: number
}

export interface BookAssignment {
  type: 'image' | 'text'
  libraryImageId?: string
  filename?: string
  folderPath?: string
  thumbnailUrl?: string
  textContent?: string
  // Photo adjustment within slot
  cropX?: number    // focal point X, 0–1, default 0.5 (center)
  cropY?: number    // focal point Y, 0–1, default 0.5 (center)
  cropZoom?: number // additional zoom, ≥1, default 1
}

export interface BookSize {
  id: string
  name: string
  width: number
  height: number
  unit: 'in'
  category: 'square' | 'portrait' | 'landscape' | 'zine'
}

export interface PageLayout {
  id: string
  name: string
  isSpread?: boolean  // if true, slots span the full 2-page spread (x: 0=left edge, x: 1=right edge)
  slots: BookSlot[]
}

export interface BookState {
  sizeId: string
  customWidth: number   // used when sizeId === 'custom'
  customHeight: number
  bookStyle: 'book' | 'zine'
  defaultLayoutId: string
  numPages: number
  currentSpreadIndex: number
  pageLayouts: Record<number, string>
  customSlots: Record<number, BookSlot[]>
  spreadLayouts: Record<number, string>
  customSpreadSlots: Record<number, BookSlot[]>
  assignments: Record<string, BookAssignment>
}
