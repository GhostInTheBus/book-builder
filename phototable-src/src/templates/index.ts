import { BookSize, PageLayout } from '../store/types'

// Virtual page index used for spread assignments (avoids collision with real page indices)
export const SPREAD_PAGE_OFFSET = 10000

export const BOOK_SIZES: BookSize[] = [
  { id: 'custom',      name: 'Custom...',           width: 10,   height: 10,   unit: 'in', category: 'square' },
  { id: 'sq-8',        name: '8 × 8 in',          width: 8,    height: 8,    unit: 'in', category: 'square' },
  { id: 'sq-10',       name: '10 × 10 in',         width: 10,   height: 10,   unit: 'in', category: 'square' },
  { id: 'sq-12',       name: '12 × 12 in',         width: 12,   height: 12,   unit: 'in', category: 'square' },
  { id: 'sq-5',        name: '5 × 5 in',           width: 5,    height: 5,    unit: 'in', category: 'square' },
  { id: 'port-8x10',   name: '8 × 10 in',          width: 8,    height: 10,   unit: 'in', category: 'portrait' },
  { id: 'port-85x11',  name: '8.5 × 11 in',        width: 8.5,  height: 11,   unit: 'in', category: 'portrait' },
  { id: 'port-55x85',  name: '5.5 × 8.5 in',       width: 5.5,  height: 8.5,  unit: 'in', category: 'portrait' },
  { id: 'land-11x85',  name: '11 × 8.5 in',        width: 11,   height: 8.5,  unit: 'in', category: 'landscape' },
  { id: 'land-13x10',  name: '13 × 10 in',         width: 13,   height: 10,   unit: 'in', category: 'landscape' },
  { id: 'land-14x11',  name: '14 × 11 in',         width: 14,   height: 11,   unit: 'in', category: 'landscape' },
]

// ─── Single-page layouts ────────────────────────────────────────────────────

export const PAGE_LAYOUTS: PageLayout[] = [
  {
    id: 'blank',
    name: 'Blank',
    slots: [],
  },
  {
    id: 'full-bleed',
    name: 'Full Bleed',
    slots: [{ id: 's0', type: 'image', x: 0, y: 0, width: 1, height: 1 }],
  },
  {
    id: 'single',
    name: 'Single',
    slots: [{ id: 's0', type: 'image', x: 0.1, y: 0.1, width: 0.8, height: 0.8 }],
  },
  {
    id: 'two-side',
    name: 'Two — Columns',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.08, width: 0.44, height: 0.84 },
      { id: 's1', type: 'image', x: 0.53, y: 0.08, width: 0.44, height: 0.84 },
    ],
  },
  {
    id: 'two-stack',
    name: 'Two — Rows',
    slots: [
      { id: 's0', type: 'image', x: 0.08, y: 0.03, width: 0.84, height: 0.44 },
      { id: 's1', type: 'image', x: 0.08, y: 0.53, width: 0.84, height: 0.44 },
    ],
  },
  {
    id: 'three-strip',
    name: 'Three — Strip',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.08, width: 0.28, height: 0.84 },
      { id: 's1', type: 'image', x: 0.36, y: 0.08, width: 0.28, height: 0.84 },
      { id: 's2', type: 'image', x: 0.69, y: 0.08, width: 0.28, height: 0.84 },
    ],
  },
  {
    id: 'feature-two',
    name: 'Feature + Two',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.03, width: 0.60, height: 0.94 },
      { id: 's1', type: 'image', x: 0.67, y: 0.03, width: 0.30, height: 0.45 },
      { id: 's2', type: 'image', x: 0.67, y: 0.52, width: 0.30, height: 0.45 },
    ],
  },
  // Image + caption variants
  {
    id: 'image-caption-bottom',
    name: 'Image + Caption',
    slots: [
      { id: 's0', type: 'image', x: 0.08, y: 0.06, width: 0.84, height: 0.65 },
      { id: 't0', type: 'text',  x: 0.08, y: 0.74, width: 0.84, height: 0.20 },
    ],
  },
  {
    id: 'image-caption-side',
    name: 'Image + Side Text',
    slots: [
      { id: 's0', type: 'image', x: 0.04, y: 0.08, width: 0.58, height: 0.84 },
      { id: 't0', type: 'text',  x: 0.66, y: 0.08, width: 0.30, height: 0.84 },
    ],
  },
  {
    id: 'caption-image-top',
    name: 'Caption + Image',
    slots: [
      { id: 't0', type: 'text',  x: 0.08, y: 0.06, width: 0.84, height: 0.18 },
      { id: 's0', type: 'image', x: 0.08, y: 0.27, width: 0.84, height: 0.67 },
    ],
  },
  {
    id: 'two-caption',
    name: 'Two + Caption',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.06, width: 0.44, height: 0.60 },
      { id: 's1', type: 'image', x: 0.53, y: 0.06, width: 0.44, height: 0.60 },
      { id: 't0', type: 'text',  x: 0.08, y: 0.70, width: 0.84, height: 0.24 },
    ],
  },
  // Text-forward layouts
  {
    id: 'text-page',
    name: 'Text',
    slots: [{ id: 't0', type: 'text', x: 0.12, y: 0.12, width: 0.76, height: 0.76 }],
  },
  {
    id: 'title-page',
    name: 'Title Page',
    slots: [{ id: 't0', type: 'text', x: 0.15, y: 0.35, width: 0.70, height: 0.30 }],
  },
  {
    id: 'chapter-opener',
    name: 'Chapter Opener',
    slots: [
      { id: 's0', type: 'image', x: 0.0,  y: 0.0,  width: 1.0,  height: 0.55 },
      { id: 't0', type: 'text',  x: 0.12, y: 0.62, width: 0.76, height: 0.30 },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    slots: [],
  },
]

// ─── Spread layouts (x: 0 = left edge, x: 1 = right edge of full spread) ───

export const SPREAD_LAYOUTS: PageLayout[] = [
  {
    id: 'spread-full-bleed',
    name: 'Full Spread',
    isSpread: true,
    slots: [{ id: 's0', type: 'image', x: 0, y: 0, width: 1, height: 1 }],
  },
  {
    id: 'spread-panoramic',
    name: 'Panoramic',
    isSpread: true,
    slots: [{ id: 's0', type: 'image', x: 0.02, y: 0.08, width: 0.96, height: 0.84 }],
  },
  {
    id: 'spread-feature-two',
    name: 'Feature + Two',
    isSpread: true,
    slots: [
      { id: 's0', type: 'image', x: 0.01, y: 0.02, width: 0.58, height: 0.96 },
      { id: 's1', type: 'image', x: 0.61, y: 0.02, width: 0.19, height: 0.46 },
      { id: 's2', type: 'image', x: 0.61, y: 0.52, width: 0.19, height: 0.46 },
    ],
  },
  {
    id: 'spread-text-image',
    name: 'Text | Image',
    isSpread: true,
    slots: [
      { id: 't0', type: 'text',  x: 0.04, y: 0.15, width: 0.42, height: 0.70 },
      { id: 's0', type: 'image', x: 0.50, y: 0.00, width: 0.50, height: 1.00 },
    ],
  },
  {
    id: 'spread-image-text',
    name: 'Image | Text',
    isSpread: true,
    slots: [
      { id: 's0', type: 'image', x: 0.00, y: 0.00, width: 0.50, height: 1.00 },
      { id: 't0', type: 'text',  x: 0.54, y: 0.15, width: 0.42, height: 0.70 },
    ],
  },
  {
    id: 'spread-three',
    name: 'Three Across',
    isSpread: true,
    slots: [
      { id: 's0', type: 'image', x: 0.01, y: 0.08, width: 0.30, height: 0.84 },
      { id: 's1', type: 'image', x: 0.34, y: 0.08, width: 0.32, height: 0.84 },
      { id: 's2', type: 'image', x: 0.69, y: 0.08, width: 0.30, height: 0.84 },
    ],
  },
  {
    id: 'spread-caption',
    name: 'Spread + Caption',
    isSpread: true,
    slots: [
      { id: 's0', type: 'image', x: 0.02, y: 0.04, width: 0.96, height: 0.72 },
      { id: 't0', type: 'text',  x: 0.15, y: 0.80, width: 0.70, height: 0.15 },
    ],
  },
  {
    id: 'spread-custom',
    name: 'Custom',
    isSpread: true,
    slots: [],
  },
]

export function getSize(id: string): BookSize {
  return BOOK_SIZES.find(s => s.id === id) ?? BOOK_SIZES[1]
}

export function getLayout(id: string): PageLayout {
  return (
    PAGE_LAYOUTS.find(l => l.id === id) ??
    SPREAD_LAYOUTS.find(l => l.id === id) ??
    PAGE_LAYOUTS[1]
  )
}
