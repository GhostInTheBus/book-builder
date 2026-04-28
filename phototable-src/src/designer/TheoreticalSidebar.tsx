import { useStore } from '../store/store'
import { getLayout } from '../templates'

// Renamed functionality: Page Navigator (was TheoreticalSidebar)
export function PageNavigator() {
  const { numPages, currentSpreadIndex, pageLayouts, defaultLayoutId } = useStore((s) => s.book)
  const { setSpreadIndex } = useStore()

  // Which spread does a given page index live on?
  function spreadForPage(pageIndex: number) {
    return pageIndex === 0 ? 0 : Math.ceil((pageIndex + 1) / 2)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 180,
        minWidth: 180,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10, 9, 8, 0.95)',
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[9px] font-bold text-white/30 tracking-[0.3em] uppercase">Pages</span>
        <span className="text-[9px] text-orange-500/40 font-mono tabular-nums">{numPages}</span>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: numPages }, (_, i) => {
          const spreadIdx = spreadForPage(i)
          const isActive =
            spreadIdx === currentSpreadIndex &&
            (currentSpreadIndex === 0 ? i === 0 : true)
          const layoutId = pageLayouts[i] ?? defaultLayoutId
          const layout = getLayout(layoutId)

          return (
            <button
              key={i}
              onClick={() => setSpreadIndex(spreadIdx)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors border-b border-white/[0.02] hover:bg-white/[0.02] ${
                isActive ? 'bg-orange-500/[0.06]' : ''
              }`}
            >
              <span
                className={`w-5 text-[9px] font-mono tabular-nums shrink-0 ${
                  isActive ? 'text-orange-400' : 'text-white/18'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 text-[8px] truncate ${
                  isActive ? 'text-white/50' : 'text-white/18'
                }`}
              >
                {layout.name}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-orange-500/60 shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
