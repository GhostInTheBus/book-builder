import { useState } from 'react'
import { useStore } from '../store/store'
import { getSize, getLayout, SPREAD_PAGE_OFFSET } from '../templates'
import { PageLayout } from '../store/types'
import { BookPage } from '../book/BookPage'

export function SpreadView() {
  const { sizeId, customWidth, customHeight, defaultLayoutId, numPages, currentSpreadIndex, pageLayouts, customSlots, spreadLayouts, customSpreadSlots, assignments } = useStore((s) => s.book)
  const { setSpreadIndex } = useStore()
  const [isTurning, setIsTurning] = useState(false)

  const size = sizeId === 'custom'
    ? { id: 'custom', name: 'Custom', width: customWidth || 10, height: customHeight || 10, unit: 'in' as const, category: 'square' as const }
    : getSize(sizeId)
  const maxSpreads = Math.ceil((numPages + 1) / 2)

  // Resolve layout for a single page (non-spread)
  function getPageEffectiveLayout(pageIndex: number): PageLayout {
    const layoutId = pageLayouts[pageIndex] ?? defaultLayoutId
    if (layoutId === 'custom') {
      return { id: 'custom', name: 'Custom', slots: customSlots[pageIndex] ?? [] }
    }
    return getLayout(layoutId)
  }

  // Resolve the spread layout for the current spread (null = no spread layout)
  const spreadLayoutId = spreadLayouts[currentSpreadIndex]
  const activeSpreadLayout: PageLayout | null = spreadLayoutId
    ? spreadLayoutId === 'spread-custom'
      ? { id: 'spread-custom', name: 'Custom', isSpread: true, slots: customSpreadSlots[currentSpreadIndex] ?? [] }
      : getLayout(spreadLayoutId)
    : null

  // Virtual page index used for spread assignment keys
  const spreadVirtualPageIndex = SPREAD_PAGE_OFFSET + currentSpreadIndex

  function handleTurn(newIndex: number) {
    if (newIndex < 0 || newIndex >= maxSpreads) return
    setIsTurning(true)
    setTimeout(() => {
      setSpreadIndex(newIndex)
      setIsTurning(false)
    }, 300)
  }

  const leftPageIndex = currentSpreadIndex === 0 ? -1 : currentSpreadIndex * 2 - 1
  const rightPageIndex = currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-10 select-none">
      <div className="flex items-center gap-12">

        {/* Prev */}
        <button
          onClick={() => handleTurn(currentSpreadIndex - 1)}
          disabled={currentSpreadIndex === 0}
          className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-gray-600 hover:text-orange-400 hover:border-orange-500/25 transition-all disabled:opacity-0"
        >
          ←
        </button>

        {/* Spread */}
        <div
          className={`flex transition-all duration-300 ${isTurning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}
        >
          {activeSpreadLayout ? (
            // ─── Spread mode: two pages rendered as one continuous canvas ───
            <>
              <div className={`transition-all duration-400 origin-right ${currentSpreadIndex === 0 ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100'}`}>
                {leftPageIndex >= 0 && leftPageIndex < numPages && (
                  <BookPage
                    size={size}
                    layout={activeSpreadLayout}
                    pageIndex={spreadVirtualPageIndex}
                    assignments={assignments}
                    isLeft
                    isSpread
                    isRightPage={false}
                  />
                )}
              </div>
              {/* No spine separator in spread mode */}
              <div className="transition-all duration-400 origin-left">
                {rightPageIndex >= 0 && rightPageIndex < numPages && (
                  <BookPage
                    size={size}
                    layout={activeSpreadLayout}
                    pageIndex={spreadVirtualPageIndex}
                    assignments={assignments}
                    isSpread
                    isRightPage
                  />
                )}
              </div>
            </>
          ) : (
            // ─── Normal mode: independent per-page layouts ───────────────
            <>
              <div className={`transition-all duration-400 origin-right ${currentSpreadIndex === 0 ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100'}`}>
                {leftPageIndex >= 0 && leftPageIndex < numPages && (
                  <div className="relative">
                    <BookPage
                      size={size}
                      layout={getPageEffectiveLayout(leftPageIndex)}
                      pageIndex={leftPageIndex}
                      assignments={assignments}
                      isLeft
                    />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Spine */}
              <div className="w-[2px] bg-black/50 self-stretch shadow-[0_0_8px_rgba(0,0,0,0.5)] z-10" />

              <div className="transition-all duration-400 origin-left">
                {rightPageIndex >= 0 && rightPageIndex < numPages && (
                  <div className="relative">
                    <BookPage
                      size={size}
                      layout={getPageEffectiveLayout(rightPageIndex)}
                      pageIndex={rightPageIndex}
                      assignments={assignments}
                    />
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => handleTurn(currentSpreadIndex + 1)}
          disabled={currentSpreadIndex >= maxSpreads - 1}
          className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-gray-600 hover:text-orange-400 hover:border-orange-500/25 transition-all disabled:opacity-0"
        >
          →
        </button>
      </div>

      {/* Spread indicator */}
      {activeSpreadLayout && (
        <div className="text-[8px] text-orange-500/40 uppercase tracking-[0.3em] font-bold -mt-4">
          ← spread layout →
        </div>
      )}

      {/* Scrubber */}
      <div className="w-80 flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] text-white/20 font-mono">
            {currentSpreadIndex === 0 ? 'Cover' : `p.${leftPageIndex + 1}`}
          </span>
          <span className="text-[9px] text-white/20 font-mono">
            Spread {currentSpreadIndex + 1} / {maxSpreads}
          </span>
          <span className="text-[9px] text-white/20 font-mono">
            {currentSpreadIndex >= maxSpreads - 1 ? 'End' : `p.${rightPageIndex + 1}`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxSpreads - 1}
          value={currentSpreadIndex}
          onChange={(e) => handleTurn(parseInt(e.target.value))}
          className="w-full accent-orange-600 h-0.5 bg-white/5 rounded-full appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
