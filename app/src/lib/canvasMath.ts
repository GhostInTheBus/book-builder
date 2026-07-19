import { Viewport } from '../store/types'

export function screenToCanvas(
  sx: number,
  sy: number,
  vp: Viewport
): { x: number; y: number } {
  return {
    x: (sx - vp.x) / vp.zoom,
    y: (sy - vp.y) / vp.zoom,
  }
}

export function canvasToScreen(
  cx: number,
  cy: number,
  vp: Viewport
): { x: number; y: number } {
  return {
    x: cx * vp.zoom + vp.x,
    y: cy * vp.zoom + vp.y,
  }
}

const PHOTO_W = 240

export function isPhotoInRect(
  photo: { x: number; y: number; scale: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  // Test center point of photo against selection rect
  const cx = photo.x + (PHOTO_W * photo.scale) / 2
  const cy = photo.y + (PHOTO_W * 0.66 * photo.scale) / 2
  return (
    cx >= rect.x &&
    cx <= rect.x + rect.width &&
    cy >= rect.y &&
    cy <= rect.y + rect.height
  )
}

export function applyZoomAtPoint(
  vp: Viewport,
  newZoom: number,
  cursorX: number,
  cursorY: number
): Viewport {
  // Keep the canvas point under the cursor fixed as zoom changes
  const scale = newZoom / vp.zoom
  return {
    zoom: newZoom,
    x: cursorX - scale * (cursorX - vp.x),
    y: cursorY - scale * (cursorY - vp.y),
  }
}
