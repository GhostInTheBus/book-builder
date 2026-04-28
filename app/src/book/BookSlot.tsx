import { useState, useRef, useCallback, useEffect } from 'react'
import { BookSlot as BookSlotType, BookAssignment } from '../store/types'
import { useStore } from '../store/store'

interface BookSlotProps {
  slotDef: BookSlotType
  pageIndex: number
  pageWidth: number
  pageHeight: number
  assignment: BookAssignment | null
  // Spread mode: slots use the full spread (both pages) as 0–1 coordinate space
  isSpread?: boolean
  isRightPage?: boolean
}

export function BookSlot({
  slotDef,
  pageIndex,
  pageWidth,
  pageHeight,
  assignment,
  isSpread = false,
  isRightPage = false,
}: BookSlotProps) {
  const assignImageToBook = useStore((s) => s.assignImageToBook)
  const assignTextToBook = useStore((s) => s.assignTextToBook)
  const adjustImageCrop = useStore((s) => s.adjustImageCrop)
  const library = useStore((s) => s.library)

  const [dragOver, setDragOver] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [editingText, setEditingText] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Photo crop state (local while adjusting, committed on mouse-up/wheel-end)
  const [localCropX, setLocalCropX] = useState(0.5)
  const [localCropY, setLocalCropY] = useState(0.5)
  const [localZoom, setLocalZoom] = useState(1)

  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync local crop from assignment when entering adjust mode
  useEffect(() => {
    if (adjusting && assignment?.type === 'image') {
      setLocalCropX(assignment.cropX ?? 0.5)
      setLocalCropY(assignment.cropY ?? 0.5)
      setLocalZoom(assignment.cropZoom ?? 1)
    }
  }, [adjusting])

  // ─── Spread coordinate math ─────────────────────────────────────────────
  // In spread mode, slot x/width are fractions of the full spread.
  // Each page is half the spread, so we shift right-page positions.
  const spreadWidth = isSpread ? pageWidth * 2 : pageWidth
  const left   = slotDef.x * spreadWidth - (isSpread && isRightPage ? pageWidth : 0)
  const top    = slotDef.y * pageHeight
  const width  = slotDef.width * spreadWidth
  const height = slotDef.height * pageHeight

  // ─── Drag-and-drop (to assign images/text) ──────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    if (adjusting) return
    if (slotDef.type === 'image' && e.dataTransfer.types.includes('application/x-library-image-id')) {
      e.preventDefault()
      setDragOver(true)
    } else if (slotDef.type === 'text' && e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault()
      setDragOver(true)
    }
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (slotDef.type === 'image') {
      const imageId = e.dataTransfer.getData('application/x-library-image-id')
      if (!imageId) return
      const img = library.folders.flatMap((f) => f.images).find((i) => i.id === imageId)
      if (img) assignImageToBook(pageIndex, slotDef.id, img)
    } else if (slotDef.type === 'text') {
      const text = e.dataTransfer.getData('text/plain')
      if (text) assignTextToBook(pageIndex, slotDef.id, text)
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setAdjusting(false)
    if (slotDef.type === 'image') assignImageToBook(pageIndex, slotDef.id, null)
    else assignTextToBook(pageIndex, slotDef.id, null)
  }

  // ─── Photo adjustment (drag to pan, scroll to zoom) ─────────────────────
  function enterAdjustMode(e: React.MouseEvent) {
    if (slotDef.type !== 'image' || !assignment || assignment.type !== 'image') return
    e.stopPropagation()
    setAdjusting(true)
  }

  function exitAdjustMode() {
    if (!adjusting) return
    adjustImageCrop(pageIndex, slotDef.id, localCropX, localCropY, localZoom)
    setAdjusting(false)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!adjusting || slotDef.type !== 'image') return
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCropX: localCropX,
      startCropY: localCropY,
    }
  }, [adjusting, localCropX, localCropY])

  useEffect(() => {
    if (!adjusting) return

    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = (e.clientX - dragRef.current.startX) / rect.width
      const dy = (e.clientY - dragRef.current.startY) / rect.height
      // Dragging right → panning image left → decrease X (shows more right side)
      setLocalCropX(Math.max(0, Math.min(1, dragRef.current.startCropX - dx)))
      setLocalCropY(Math.max(0, Math.min(1, dragRef.current.startCropY - dy)))
    }

    function handleMouseUp() {
      dragRef.current = null
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') exitAdjustMode()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [adjusting, localCropX, localCropY, localZoom])

  function handleWheel(e: React.WheelEvent) {
    if (!adjusting) return
    e.preventDefault()
    setLocalZoom((z) => Math.max(1, Math.min(4, z - e.deltaY * 0.003)))
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  const effectiveCropX = adjusting ? localCropX : (assignment?.cropX ?? 0.5)
  const effectiveCropY = adjusting ? localCropY : (assignment?.cropY ?? 0.5)
  const effectiveZoom  = adjusting ? localZoom  : (assignment?.cropZoom ?? 1)

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      style={{ position: 'absolute', left, top, width, height }}
      className={`
        overflow-hidden select-none group transition-all duration-100
        ${adjusting
          ? 'ring-2 ring-blue-400/70 cursor-move'
          : dragOver
            ? 'ring-2 ring-orange-400 bg-orange-500/20'
            : assignment
              ? 'ring-1 ring-white/10'
              : slotDef.type === 'image'
                ? 'border border-dashed border-black/12 bg-black/[0.02] hover:border-orange-400/40 hover:bg-orange-500/5'
                : 'border border-dashed border-blue-400/20 bg-blue-500/[0.02] hover:border-blue-400/40'
        }
      `}
    >
      {assignment ? (
        <div className="relative w-full h-full">
          {assignment.type === 'image' ? (
            <>
              <img
                src={assignment.thumbnailUrl}
                alt={assignment.filename}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${effectiveCropX * 100}% ${effectiveCropY * 100}%`,
                  transform: `scale(${effectiveZoom})`,
                  transformOrigin: `${effectiveCropX * 100}% ${effectiveCropY * 100}%`,
                  transition: adjusting ? 'none' : 'transform 0.15s ease',
                }}
              />

              {/* Adjust button (shown on hover when not adjusting) */}
              {!adjusting && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="flex gap-1.5">
                    <button
                      className="pointer-events-auto px-2 py-1 bg-black/70 text-white text-[7px] uppercase tracking-wider rounded-sm hover:bg-blue-900/80 transition-colors"
                      onClick={enterAdjustMode}
                    >
                      Adjust
                    </button>
                    <button
                      className="pointer-events-auto w-6 h-6 bg-black/70 text-white rounded-sm flex items-center justify-center text-[10px] hover:bg-red-900/80 transition-colors"
                      onClick={handleClear}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Adjust mode overlay */}
              {adjusting && (
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1" />
                  <div className="flex items-center justify-between px-2 py-1.5 bg-black/75">
                    <span className="text-[7px] text-blue-300 uppercase tracking-widest">
                      Drag to pan · Scroll to zoom · {Math.round(effectiveZoom * 100)}%
                    </span>
                    <button
                      onClick={exitAdjustMode}
                      className="text-[7px] text-white/60 hover:text-white uppercase tracking-wider px-1.5 py-0.5 border border-white/20 rounded-sm hover:border-white/50 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="w-full h-full relative bg-white/90 cursor-text"
              onClick={() => { setEditingText(true); setTimeout(() => textareaRef.current?.focus(), 0) }}
            >
              {editingText ? (
                <textarea
                  ref={textareaRef}
                  defaultValue={assignment.textContent}
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val) assignTextToBook(pageIndex, slotDef.id, val)
                    else assignTextToBook(pageIndex, slotDef.id, null)
                    setEditingText(false)
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="absolute inset-0 w-full h-full p-3 resize-none bg-white/95 text-[10px] text-gray-700 leading-relaxed font-serif focus:outline-none"
                  style={{ border: 'none' }}
                />
              ) : (
                <p className="p-3 text-[10px] text-gray-700 leading-relaxed font-serif">
                  {assignment.textContent}
                </p>
              )}
              {!editingText && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleClear(e) }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      ) : slotDef.type === 'text' ? (
        // Empty text slot — click to type
        <div
          className="w-full h-full relative cursor-text"
          onClick={() => { setEditingText(true); setTimeout(() => textareaRef.current?.focus(), 0) }}
        >
          {editingText ? (
            <textarea
              ref={textareaRef}
              onBlur={(e) => {
                const val = e.target.value.trim()
                if (val) assignTextToBook(pageIndex, slotDef.id, val)
                setEditingText(false)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Type here..."
              className="absolute inset-0 w-full h-full p-3 resize-none bg-white/90 text-[10px] text-gray-600 leading-relaxed font-serif focus:outline-none placeholder:text-gray-300"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-20">
              <span className="text-black text-[7px] uppercase tracking-widest font-bold">text</span>
              <span className="text-black text-xs">click to type</span>
            </div>
          )}
        </div>
      ) : (
        // Empty image slot placeholder
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-25">
          <span className="text-black text-[7px] uppercase tracking-widest font-bold">image</span>
          <span className="text-black text-sm">{dragOver ? '↓' : '+'}</span>
        </div>
      )}
    </div>
  )
}
