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
  function commitCrop(cropX: number, cropY: number, zoom: number) {
    adjustImageCrop(pageIndex, slotDef.id, cropX, cropY, zoom)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (slotDef.type !== 'image' || !assignment || assignment.type !== 'image') return
    // Don't interfere with button clicks inside the slot
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    e.stopPropagation()
    const cropX = assignment.cropX ?? 0.5
    const cropY = assignment.cropY ?? 0.5
    setLocalCropX(cropX)
    setLocalCropY(cropY)
    setLocalZoom(assignment.cropZoom ?? 1)
    setAdjusting(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCropX: cropX,
      startCropY: cropY,
    }
  }, [assignment, slotDef.type])

  useEffect(() => {
    if (!adjusting) return

    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = (e.clientX - dragRef.current.startX) / rect.width
      const dy = (e.clientY - dragRef.current.startY) / rect.height
      // Dragging right → panning image left → decrease X (shows more right side)
      const newCropX = Math.max(0, Math.min(1, dragRef.current.startCropX - dx))
      const newCropY = Math.max(0, Math.min(1, dragRef.current.startCropY - dy))
      setLocalCropX(newCropX)
      setLocalCropY(newCropY)
    }

    function handleMouseUp() {
      if (dragRef.current !== null) {
        // Commit on mouse-up — no "Done" click needed
        commitCrop(localCropX, localCropY, localZoom)
      }
      dragRef.current = null
      setAdjusting(false)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Revert to stored values on Escape
        dragRef.current = null
        setAdjusting(false)
      }
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
          ? 'ring-2 ring-blue-400/70 cursor-grabbing'
          : dragOver
            ? 'ring-2 ring-orange-400 bg-orange-500/20'
            : assignment?.type === 'image'
              ? 'ring-1 ring-white/10 cursor-grab'
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

              {/* Hover overlay: clear button + pan hint */}
              {!adjusting && (
                <div className="absolute inset-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-1">
                  <button
                    className="pointer-events-auto w-6 h-6 bg-black/70 text-white rounded-sm flex items-center justify-center text-[10px] hover:bg-red-900/80 transition-colors"
                    onClick={handleClear}
                  >
                    ×
                  </button>
                </div>
              )}
              {!adjusting && (
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[6px] text-white/60 uppercase tracking-widest bg-black/50 px-1.5 py-0.5 rounded-sm">
                    drag to pan · scroll to zoom
                  </span>
                </div>
              )}

              {/* Adjusting overlay: show zoom level */}
              {adjusting && (
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1 pointer-events-none">
                  <span className="text-[6px] text-blue-300 uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded-sm">
                    {Math.round(effectiveZoom * 100)}%
                  </span>
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
