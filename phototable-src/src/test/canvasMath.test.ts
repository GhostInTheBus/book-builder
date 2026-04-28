import { describe, it, expect } from 'vitest'
import {
  screenToCanvas,
  canvasToScreen,
  isPhotoInRect,
  applyZoomAtPoint,
} from '../lib/canvasMath'

describe('screenToCanvas', () => {
  it('converts screen coords to canvas coords given viewport', () => {
    const vp = { x: -100, y: -50, zoom: 2 }
    // canvas coord = (screen - translate) / zoom
    expect(screenToCanvas(300, 250, vp)).toEqual({ x: 200, y: 150 })
  })

  it('handles zoom = 1 with no translation', () => {
    expect(screenToCanvas(100, 200, { x: 0, y: 0, zoom: 1 })).toEqual({ x: 100, y: 200 })
  })
})

describe('canvasToScreen', () => {
  it('converts canvas coords to screen coords', () => {
    const vp = { x: -100, y: -50, zoom: 2 }
    expect(canvasToScreen(200, 150, vp)).toEqual({ x: 300, y: 250 })
  })
})

describe('isPhotoInRect', () => {
  it('returns true when photo center is inside rect', () => {
    // photo at x=0,y=0, scale=1 → center at (120, ~79) — inside 300x300 rect
    const photo = { x: 0, y: 0, scale: 1 }
    const rect = { x: 0, y: 0, width: 300, height: 300 }
    expect(isPhotoInRect(photo, rect)).toBe(true)
  })

  it('returns false when photo center is outside rect', () => {
    // photo at x=1000,y=1000 → center at (1120, ~1079) — outside 200x200 rect at origin
    const photo = { x: 1000, y: 1000, scale: 1 }
    const rect = { x: 0, y: 0, width: 200, height: 200 }
    expect(isPhotoInRect(photo, rect)).toBe(false)
  })

  it('returns false when photo top-left is in rect but center is not', () => {
    // photo at x=50,y=50 → center at (170, ~129) — outside 100x100 rect at origin
    const photo = { x: 50, y: 50, scale: 1 }
    const rect = { x: 0, y: 0, width: 100, height: 100 }
    expect(isPhotoInRect(photo, rect)).toBe(false)
  })
})

describe('applyZoomAtPoint', () => {
  it('zooms in centered on cursor, updating translate', () => {
    const vp = { x: 0, y: 0, zoom: 1 }
    const result = applyZoomAtPoint(vp, 1.1, 500, 400)
    expect(result.zoom).toBeCloseTo(1.1)
    // translate shifts so cursor point stays fixed
    expect(result.x).toBeCloseTo(-50)
    expect(result.y).toBeCloseTo(-40)
  })
})
