import { BookSize, PageLayout } from '../store/types'

// Virtual page index used for spread assignments (avoids collision with real page indices)
export const SPREAD_PAGE_OFFSET = 10000

// ─── Book sizes ─────────────────────────────────────────────────────────────

export const BOOK_SIZES: BookSize[] = [
  { id: 'custom',      name: 'Custom...',           width: 10,   height: 10,   unit: 'in', category: 'square' },

  // Square photo books
  { id: 'sq-8',        name: '8 × 8 in',            width: 8,    height: 8,    unit: 'in', category: 'square' },
  { id: 'sq-10',       name: '10 × 10 in',           width: 10,   height: 10,   unit: 'in', category: 'square' },
  { id: 'sq-12',       name: '12 × 12 in',           width: 12,   height: 12,   unit: 'in', category: 'square' },
  { id: 'sq-5',        name: '5 × 5 in',             width: 5,    height: 5,    unit: 'in', category: 'square' },

  // Portrait photo books
  { id: 'port-8x10',   name: '8 × 10 in',            width: 8,    height: 10,   unit: 'in', category: 'portrait' },
  { id: 'port-85x11',  name: '8.5 × 11 in',          width: 8.5,  height: 11,   unit: 'in', category: 'portrait' },
  { id: 'port-55x85',  name: '5.5 × 8.5 in',         width: 5.5,  height: 8.5,  unit: 'in', category: 'portrait' },

  // Landscape photo books
  { id: 'land-11x85',  name: '11 × 8.5 in',          width: 11,   height: 8.5,  unit: 'in', category: 'landscape' },
  { id: 'land-13x10',  name: '13 × 10 in',           width: 13,   height: 10,   unit: 'in', category: 'landscape' },
  { id: 'land-14x11',  name: '14 × 11 in',           width: 14,   height: 11,   unit: 'in', category: 'landscape' },

  // ── Zine sizes ──────────────────────────────────────────────────────────────
  // Half Letter / Digest: fold a US letter sheet once → 8 pages, the classic zine format
  { id: 'zine-half',    name: 'Half Letter  5.5 × 8.5',  width: 5.5,  height: 8.5,  unit: 'in', category: 'zine' },
  // Quarter / Mini: fold letter twice → 16 tiny pages
  { id: 'zine-quarter', name: 'Quarter  4.25 × 5.5',     width: 4.25, height: 5.5,  unit: 'in', category: 'zine' },
  // A5: European digest equivalent
  { id: 'zine-a5',      name: 'A5  5.83 × 8.27',         width: 5.83, height: 8.27, unit: 'in', category: 'zine' },
  // A6 / Mini: European quarter-fold
  { id: 'zine-a6',      name: 'A6 Mini  4.13 × 5.83',    width: 4.13, height: 5.83, unit: 'in', category: 'zine' },
  // Full letter: base sheet for a classic 8-page one-cut zine
  { id: 'zine-letter',  name: 'Letter  8.5 × 11',        width: 8.5,  height: 11,   unit: 'in', category: 'zine' },
]

// ─── Single-page book layouts ────────────────────────────────────────────────

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

// ─── Zine layouts ────────────────────────────────────────────────────────────
// Zines are asymmetric, text-forward, raw. Proportions feel handmade — not the
// clean grids of a photo book. Good for DIY publishing, fanzines, photocopied art.

export const ZINE_LAYOUTS: PageLayout[] = [
  // Full-page image (bleed to edges — film still, snapshot feel)
  {
    id: 'zine-full-photo',
    name: 'Full Photo',
    slots: [{ id: 's0', type: 'image', x: 0, y: 0, width: 1, height: 1 }],
  },
  // Full-page text with breathing room — manifesto, story, prose
  {
    id: 'zine-body-copy',
    name: 'Body Copy',
    slots: [{ id: 't0', type: 'text', x: 0.08, y: 0.08, width: 0.84, height: 0.84 }],
  },
  // Masthead / title — big centered text block, nothing else
  {
    id: 'zine-masthead',
    name: 'Masthead',
    slots: [{ id: 't0', type: 'text', x: 0.10, y: 0.28, width: 0.80, height: 0.44 }],
  },
  // Photo top two-thirds, caption/copy below — classic zine feature page
  {
    id: 'zine-photo-copy',
    name: 'Photo + Copy',
    slots: [
      { id: 's0', type: 'image', x: 0,    y: 0,    width: 1,    height: 0.62 },
      { id: 't0', type: 'text',  x: 0.07, y: 0.65, width: 0.86, height: 0.30 },
    ],
  },
  // Copy intro top, photo fills the rest — pulls reader in with text first
  {
    id: 'zine-copy-photo',
    name: 'Copy + Photo',
    slots: [
      { id: 't0', type: 'text',  x: 0.07, y: 0.05, width: 0.86, height: 0.26 },
      { id: 's0', type: 'image', x: 0,    y: 0.33, width: 1,    height: 0.67 },
    ],
  },
  // Left half photo, right half text — split page, common in photocopied zines
  {
    id: 'zine-split',
    name: 'Split',
    slots: [
      { id: 's0', type: 'image', x: 0,    y: 0,    width: 0.50, height: 1    },
      { id: 't0', type: 'text',  x: 0.54, y: 0.10, width: 0.42, height: 0.80 },
    ],
  },
  // Thin full-width film-strip image across the middle, text above and below
  {
    id: 'zine-film-strip',
    name: 'Film Strip',
    slots: [
      { id: 't0', type: 'text',  x: 0.06, y: 0.04, width: 0.88, height: 0.28 },
      { id: 's0', type: 'image', x: 0,    y: 0.34, width: 1,    height: 0.32 },
      { id: 't1', type: 'text',  x: 0.06, y: 0.68, width: 0.88, height: 0.27 },
    ],
  },
  // Two photos placed asymmetrically — raw collage energy, one offset per half
  {
    id: 'zine-raw-two',
    name: 'Raw Two',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.04, width: 0.74, height: 0.50 },
      { id: 's1', type: 'image', x: 0.20, y: 0.57, width: 0.77, height: 0.38 },
    ],
  },
  // Three photos in an irregular collage grid — feels handcut
  {
    id: 'zine-collage',
    name: 'Collage Three',
    slots: [
      { id: 's0', type: 'image', x: 0,    y: 0,    width: 0.60, height: 0.52 },
      { id: 's1', type: 'image', x: 0.63, y: 0.05, width: 0.37, height: 0.44 },
      { id: 's2', type: 'image', x: 0.08, y: 0.55, width: 0.87, height: 0.42 },
    ],
  },
  // Pull-quote + body — big quote above, body text below
  {
    id: 'zine-pull-quote',
    name: 'Pull Quote',
    slots: [
      { id: 't0', type: 'text', x: 0.07, y: 0.07, width: 0.86, height: 0.32 },
      { id: 't1', type: 'text', x: 0.07, y: 0.42, width: 0.86, height: 0.51 },
    ],
  },
  // Four-panel comic/photostrip grid — minicomic staple
  {
    id: 'zine-four-panel',
    name: 'Four Panel',
    slots: [
      { id: 's0', type: 'image', x: 0.03, y: 0.03, width: 0.45, height: 0.45 },
      { id: 's1', type: 'image', x: 0.52, y: 0.03, width: 0.45, height: 0.45 },
      { id: 's2', type: 'image', x: 0.03, y: 0.52, width: 0.45, height: 0.45 },
      { id: 's3', type: 'image', x: 0.52, y: 0.52, width: 0.45, height: 0.45 },
    ],
  },
  // Back cover — small centered text, publisher/contact info
  {
    id: 'zine-back-cover',
    name: 'Back Cover',
    slots: [{ id: 't0', type: 'text', x: 0.20, y: 0.72, width: 0.60, height: 0.20 }],
  },
  {
    id: 'zine-custom',
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
    ZINE_LAYOUTS.find(l => l.id === id) ??
    SPREAD_LAYOUTS.find(l => l.id === id) ??
    PAGE_LAYOUTS[1]
  )
}
