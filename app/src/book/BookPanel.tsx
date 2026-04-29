import { useState } from 'react'
import { useStore } from '../store/store'
import { BookSlot as BookSlotType, PageLayout } from '../store/types'
import { BOOK_SIZES, PAGE_LAYOUTS, ZINE_LAYOUTS, SPREAD_LAYOUTS, getSize } from '../templates'
import { buildExportJSON, downloadBookJSON } from '../lib/bookExport'
import { exportBookToPDF, PDFProgress } from '../lib/pdfExport'

function LayoutThumbnail({ layout, active, isSpread }: { layout: PageLayout; active: boolean; isSpread?: boolean }) {
  // For spread thumbnails, render a wider view
  const vw = isSpread ? 200 : 100
  return (
    <svg viewBox={`0 0 ${vw} 100`} className="w-full h-full">
      {isSpread && (
        // Show two page halves with a spine line
        <>
          <rect x="0" y="0" width="98" height="100" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" rx="1" />
          <rect x="102" y="0" width="98" height="100" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" rx="1" />
          <line x1="100" y1="0" x2="100" y2="100" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
        </>
      )}
      {!isSpread && (
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" rx="1" />
      )}
      {layout.slots.map((slot) => {
        // For spread layouts, map 0-1 slot x across the full 200-unit viewBox
        const sx = isSpread ? slot.x * 200 + 1 : slot.x * 100 + 1
        const sy = slot.y * 100 + 1
        const sw = isSpread ? slot.width * 200 - 2 : slot.width * 100 - 2
        const sh = slot.height * 100 - 2
        return (
          <rect
            key={slot.id}
            x={sx} y={sy} width={sw} height={sh}
            fill={
              active
                ? slot.type === 'image' ? 'rgba(249,115,22,0.3)' : 'rgba(99,140,255,0.3)'
                : slot.type === 'image' ? 'rgba(255,255,255,0.08)' : 'rgba(99,140,255,0.12)'
            }
            stroke={
              active
                ? slot.type === 'image' ? 'rgba(249,115,22,0.7)' : 'rgba(99,140,255,0.7)'
                : slot.type === 'image' ? 'rgba(255,255,255,0.15)' : 'rgba(99,140,255,0.3)'
            }
            strokeWidth="1.5"
            rx="0.5"
          />
        )
      })}
      {(layout.id === 'custom' || layout.id === 'spread-custom') && (
        <text x={vw / 2} y="54" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.15)" fontFamily="monospace">+</text>
      )}
    </svg>
  )
}

function SlotRow({ slot, onUpdate, onDelete }: { slot: BookSlotType; onUpdate: (s: BookSlotType) => void; onDelete: () => void }) {
  const fields = [
    { key: 'x' as const, label: 'X' },
    { key: 'y' as const, label: 'Y' },
    { key: 'width' as const, label: 'W' },
    { key: 'height' as const, label: 'H' },
  ]
  return (
    <div className="bg-black/30 border border-white/[0.05] rounded-sm p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-[8px] uppercase font-bold tracking-wider ${slot.type === 'image' ? 'text-orange-400/70' : 'text-blue-400/70'}`}>
          {slot.type}
        </span>
        <button onClick={onDelete} className="text-[10px] text-white/15 hover:text-red-500 transition-colors">×</button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] text-white/20">{label}</span>
            <input
              type="number" min={0} max={100} step={1}
              value={Math.round((slot[key] as number) * 100)}
              onChange={(e) => onUpdate({ ...slot, [key]: parseInt(e.target.value || '0') / 100 })}
              className="w-full text-[8px] bg-transparent border-b border-white/10 text-gray-400 text-center focus:outline-none focus:border-orange-500 tabular-nums"
            />
            <span className="text-[6px] text-white/10">%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BookPanel() {
  const { sizeId, customWidth, customHeight, bookStyle, defaultLayoutId, numPages, currentSpreadIndex, pageLayouts, customSlots, spreadLayouts, customSpreadSlots, assignments } = useStore((s) => s.book)
  const { setBookSizeId, setCustomSize, setBookStyle, setBookNumPages, setPageLayout, setCustomSlots, setSpreadLayout, setCustomSpreadSlots, clearAllAssignments } = useStore()
  const folders = useStore((s) => s.library.folders)

  const [layoutMode, setLayoutMode] = useState<'page' | 'spread'>('page')
  const [target, setTarget] = useState<'left' | 'right'>('right')
  const [pdfProgress, setPdfProgress] = useState<PDFProgress | null>(null)

  const size = sizeId === 'custom'
    ? { id: 'custom', name: 'Custom', width: customWidth || 10, height: customHeight || 10, unit: 'in' as const, category: 'square' as const }
    : getSize(sizeId)
  const leftPageIndex  = currentSpreadIndex === 0 ? -1 : currentSpreadIndex * 2 - 1
  const rightPageIndex = currentSpreadIndex === 0 ? 0  : currentSpreadIndex * 2

  // Current spread layout
  const activeSpreadLayoutId = spreadLayouts[currentSpreadIndex] ?? null

  // Current per-page layout (reference page for display)
  const refPageIndex = target === 'left' ? leftPageIndex : rightPageIndex
  const activePageLayoutId =
    refPageIndex >= 0 && refPageIndex < numPages
      ? (pageLayouts[refPageIndex] ?? defaultLayoutId)
      : defaultLayoutId

  // Custom slots for current target
  const editablePageSlots = customSlots[refPageIndex] ?? []
  const editableSpreadSlots = customSpreadSlots[currentSpreadIndex] ?? []

  function applyPageLayout(layoutId: string) {
    const pageIndex = target === 'left' ? leftPageIndex : rightPageIndex
    if (pageIndex >= 0 && pageIndex < numPages) {
      setPageLayout(pageIndex, layoutId)
    }
  }

  function addCustomPageSlot(type: 'image' | 'text') {
    if (refPageIndex < 0) return
    const id = `slot-${crypto.randomUUID().slice(0, 8)}`
    setCustomSlots(refPageIndex, [...editablePageSlots, { id, type, x: 0.1, y: 0.1, width: 0.8, height: 0.8 }])
  }

  function addCustomSpreadSlot(type: 'image' | 'text') {
    const id = `slot-${crypto.randomUUID().slice(0, 8)}`
    setCustomSpreadSlots(currentSpreadIndex, [...editableSpreadSlots, { id, type, x: 0.05, y: 0.05, width: 0.90, height: 0.90 }])
  }

  function handleExport() {
    const data = buildExportJSON(size, defaultLayoutId, numPages, assignments, pageLayouts, customSlots, spreadLayouts, customSpreadSlots)
    const date = new Date().toISOString().slice(0, 10)
    downloadBookJSON(data, `book-${sizeId}-${date}.json`)
  }

  async function handlePDFExport() {
    if (pdfProgress) return
    const date = new Date().toISOString().slice(0, 10)
    try {
      await exportBookToPDF(
        size, numPages, assignments, pageLayouts, customSlots,
        spreadLayouts, customSpreadSlots, defaultLayoutId,
        folders,
        `book-${sizeId}-${date}.pdf`,
        (p) => setPdfProgress(p)
      )
    } finally {
      setPdfProgress(null)
    }
  }

  const showPageCustomEditor = layoutMode === 'page' && activePageLayoutId === 'custom' && refPageIndex >= 0
  const showSpreadCustomEditor = layoutMode === 'spread' && activeSpreadLayoutId === 'spread-custom'

  return (
    <div
      className="flex flex-col h-full z-20"
      style={{ width: 272, minWidth: 272, borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,9,8,0.98)' }}
    >
      {/* Book / Zine mode */}
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex gap-1">
          {(['book', 'zine'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setBookStyle(style)}
              className={`flex-1 py-2 text-[8px] uppercase tracking-[0.25em] rounded-sm border transition-all font-bold ${
                bookStyle === style
                  ? style === 'zine'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/35'
                    : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                  : 'text-white/20 hover:text-white/40 border-white/5'
              }`}
            >
              {style === 'book' ? 'Book' : 'Zine'}
            </button>
          ))}
        </div>
        {bookStyle === 'zine' && (
          <p className="mt-2 text-[7px] text-purple-300/40 leading-relaxed">
            Half-letter, A5, quarter-fold. Asymmetric layouts, body copy, collage.
          </p>
        )}
      </div>

      {/* Book Size */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
        <label className="text-[8px] text-white/25 uppercase tracking-[0.3em] block mb-2 font-bold">Book Size</label>
        <select
          value={sizeId}
          onChange={(e) => setBookSizeId(e.target.value)}
          className="w-full text-[10px] bg-black/40 border border-white/[0.08] text-gray-300 rounded-sm px-2 py-2 focus:outline-none focus:border-orange-500/40"
        >
          {bookStyle === 'zine' && (
            <optgroup label="Zine">
              {BOOK_SIZES.filter((s) => s.category === 'zine').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          )}
          <optgroup label="Square">
            {BOOK_SIZES.filter((s) => s.category === 'square').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </optgroup>
          <optgroup label="Portrait">
            {BOOK_SIZES.filter((s) => s.category === 'portrait').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </optgroup>
          <optgroup label="Landscape">
            {BOOK_SIZES.filter((s) => s.category === 'landscape').map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </optgroup>
        </select>
        {sizeId === 'custom' ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number" min={1} max={48} step={0.5}
              value={customWidth}
              onChange={(e) => setCustomSize(parseFloat(e.target.value) || 10, customHeight)}
              className="w-16 text-xs bg-transparent border-b border-white/15 text-orange-300 py-0.5 text-right tabular-nums focus:outline-none focus:border-orange-500"
            />
            <span className="text-[9px] text-white/20">×</span>
            <input
              type="number" min={1} max={48} step={0.5}
              value={customHeight}
              onChange={(e) => setCustomSize(customWidth, parseFloat(e.target.value) || 10)}
              className="w-16 text-xs bg-transparent border-b border-white/15 text-orange-300 py-0.5 text-right tabular-nums focus:outline-none focus:border-orange-500"
            />
            <span className="text-[9px] text-white/20">in</span>
          </div>
        ) : (
          <div className="mt-1.5 text-[8px] text-white/15 font-mono">{size.width} × {size.height} {size.unit}</div>
        )}
      </div>

      {/* Page count */}
      <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[8px] text-white/25 uppercase tracking-[0.25em] font-bold">Pages</span>
        <input
          type="number" min={1} max={200} value={numPages}
          onChange={(e) => setBookNumPages(parseInt(e.target.value) || 1)}
          className="w-14 text-xs bg-transparent border-b border-white/10 text-orange-300 py-0.5 text-right tabular-nums focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Layout mode: Page vs Spread */}
      <div className="px-3 py-2 border-b border-white/[0.04]">
        <div className="flex gap-1">
          {(['page', 'spread'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayoutMode(mode)}
              className={`flex-1 py-1.5 text-[8px] uppercase tracking-wider rounded-sm border transition-all ${
                layoutMode === mode
                  ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                  : 'text-white/20 hover:text-white/40 border-white/5'
              }`}
            >
              {mode === 'page' ? 'Single Page' : 'Full Spread'}
            </button>
          ))}
        </div>
      </div>

      {/* Per-page mode */}
      {layoutMode === 'page' && (
        <>
          {/* Page selector: Left or Right independently */}
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <div className="flex gap-1">
              {(['left', 'right'] as const).map((t) => {
                const pi = t === 'left' ? leftPageIndex : rightPageIndex
                const valid = pi >= 0 && pi < numPages
                const label = valid ? `p.${pi + 1} — ${t}` : `— ${t}`
                return (
                  <button
                    key={t}
                    onClick={() => valid && setTarget(t)}
                    disabled={!valid}
                    className={`flex-1 py-1.5 text-[8px] uppercase tracking-wider rounded-sm border transition-all ${
                      target === t ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' : 'text-white/20 hover:text-white/40 border-white/5'
                    } disabled:opacity-20 disabled:cursor-default`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Layout picker — custom mode surfaces the slot editor immediately */}
          {showPageCustomEditor ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">Custom Layout</span>
                <button
                  onClick={() => applyPageLayout('full-bleed')}
                  className="text-[8px] text-white/25 hover:text-white/60 uppercase tracking-wider transition-colors"
                >
                  ← Back
                </button>
              </div>
              <p className="text-[8px] text-white/20 leading-relaxed">
                Add slots, then set their position and size as percentages of the page.
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => addCustomPageSlot('image')}
                  className="flex-1 py-2 text-[8px] uppercase tracking-wide border border-orange-500/30 text-orange-400/70 hover:bg-orange-500/15 rounded-sm transition-colors font-bold"
                >
                  + Image Slot
                </button>
                <button
                  onClick={() => addCustomPageSlot('text')}
                  className="flex-1 py-2 text-[8px] uppercase tracking-wide border border-blue-500/30 text-blue-400/70 hover:bg-blue-500/15 rounded-sm transition-colors font-bold"
                >
                  + Text Slot
                </button>
              </div>
              {editablePageSlots.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-[9px] text-white/15 italic">No slots yet — add one above.</p>
                </div>
              )}
              {editablePageSlots.map((slot, idx) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onUpdate={(s) => setCustomSlots(refPageIndex, editablePageSlots.map((x, i) => i === idx ? s : x))}
                  onDelete={() => setCustomSlots(refPageIndex, editablePageSlots.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-3 font-bold">Layout</div>
              <div className="grid grid-cols-3 gap-2">
                {(bookStyle === 'zine' ? ZINE_LAYOUTS : PAGE_LAYOUTS).map((layout) => {
                  const active = activePageLayoutId === layout.id
                  const accentActive = bookStyle === 'zine'
                    ? 'border-purple-500/40 bg-purple-500/8'
                    : 'border-orange-500/40 bg-orange-500/8'
                  const accentText = bookStyle === 'zine' ? 'text-purple-300/80' : 'text-orange-300/80'
                  return (
                    <button
                      key={layout.id}
                      onClick={() => applyPageLayout(layout.id)}
                      className={`flex flex-col items-center gap-1.5 p-1.5 rounded-sm border transition-all ${
                        active ? accentActive : 'border-white/[0.05] hover:border-white/15 bg-white/[0.02]'
                      }`}
                    >
                      <div className="w-full aspect-square">
                        <LayoutThumbnail layout={layout} active={active} />
                      </div>
                      <span className={`text-[7px] uppercase tracking-wide text-center leading-tight ${active ? accentText : 'text-white/20'}`}>
                        {layout.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Spread mode */}
      {layoutMode === 'spread' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-3 font-bold">
            Spread Layout — Spread {currentSpreadIndex + 1}
          </div>
          {activeSpreadLayoutId && (
            <button
              onClick={() => setSpreadLayout(currentSpreadIndex, null)}
              className="w-full mb-3 py-1.5 text-[8px] uppercase tracking-wide border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 rounded-sm transition-colors"
            >
              ✕ Clear Spread Layout
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {SPREAD_LAYOUTS.map((layout) => {
              const active = activeSpreadLayoutId === layout.id
              return (
                <button
                  key={layout.id}
                  onClick={() => setSpreadLayout(currentSpreadIndex, active ? null : layout.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-sm border transition-all ${
                    active ? 'border-orange-500/40 bg-orange-500/8' : 'border-white/[0.05] hover:border-white/15 bg-white/[0.02]'
                  }`}
                >
                  <div className="w-full" style={{ aspectRatio: '2/1' }}>
                    <LayoutThumbnail layout={layout} active={active} isSpread />
                  </div>
                  <span className={`text-[7px] uppercase tracking-wide text-center leading-tight ${active ? 'text-orange-300/80' : 'text-white/20'}`}>
                    {layout.name}
                  </span>
                </button>
              )
            })}
          </div>

          {showSpreadCustomEditor && (
            <div className="mt-4 space-y-2">
              <div className="h-px bg-white/5" />
              <div className="text-[8px] text-white/20 uppercase tracking-[0.25em] pt-1">Freeform Spread Slots</div>
              <div className="flex gap-1.5">
                <button onClick={() => addCustomSpreadSlot('image')} className="flex-1 py-1.5 text-[8px] uppercase tracking-wide border border-orange-500/20 text-orange-400/60 hover:bg-orange-500/10 rounded-sm transition-colors">+ Image</button>
                <button onClick={() => addCustomSpreadSlot('text')} className="flex-1 py-1.5 text-[8px] uppercase tracking-wide border border-blue-500/20 text-blue-400/60 hover:bg-blue-500/10 rounded-sm transition-colors">+ Text</button>
              </div>
              {editableSpreadSlots.length === 0 && <p className="text-[8px] text-white/15 italic text-center py-2">No slots yet.</p>}
              {editableSpreadSlots.map((slot, idx) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onUpdate={(s) => setCustomSpreadSlots(currentSpreadIndex, editableSpreadSlots.map((x, i) => i === idx ? s : x))}
                  onDelete={() => setCustomSpreadSlots(currentSpreadIndex, editableSpreadSlots.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export */}
      <div className="px-4 py-4 border-t border-white/[0.05] space-y-2 bg-black/30">
        <button
          onClick={handlePDFExport}
          disabled={!!pdfProgress}
          className="w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm border border-orange-500/35 bg-orange-500/12 text-orange-200 hover:bg-orange-500/22 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfProgress
            ? pdfProgress.current === 0
              ? 'Loading images…'
              : `Rendering ${pdfProgress.current} / ${pdfProgress.total}…`
            : 'Export PDF'}
        </button>
        <button
          onClick={handleExport}
          className="w-full py-1.5 text-[8px] text-white/20 hover:text-white/45 uppercase tracking-[0.3em] transition-colors"
        >
          Export JSON (InDesign)
        </button>
        <button
          onClick={() => { if (window.confirm('Clear all photo assignments?')) clearAllAssignments() }}
          className="w-full py-1 text-[8px] text-white/12 hover:text-red-900 uppercase tracking-[0.3em] transition-colors font-bold"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
