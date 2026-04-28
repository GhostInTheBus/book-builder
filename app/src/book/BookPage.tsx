import { BookSize, PageLayout, BookAssignment } from '../store/types'
import { BookSlot } from './BookSlot'

interface BookPageProps {
  size: BookSize
  layout: PageLayout
  pageIndex: number
  assignments: Record<string, BookAssignment>
  isLeft?: boolean
  // Spread mode: this page is one half of a spread layout
  isSpread?: boolean
  isRightPage?: boolean
}

export function BookPage({ size, layout, pageIndex, assignments, isLeft, isSpread, isRightPage }: BookPageProps) {
  const aspectRatio = size.height / size.width
  const PREVIEW_WIDTH = 420
  const previewHeight = Math.round(PREVIEW_WIDTH * aspectRatio)

  return (
    <div
      className="group relative select-none overflow-hidden"
      style={{
        width: PREVIEW_WIDTH,
        height: previewHeight,
        background: '#fdfbf9',
        boxShadow: isLeft
          ? 'inset -30px 0 50px rgba(0,0,0,0.06), 10px 10px 30px rgba(0,0,0,0.4)'
          : 'inset 30px 0 50px rgba(0,0,0,0.06), -10px 10px 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Subtle paper noise */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADS779WAAAAElBMVEUAAAD8/Pz09PT4+PjMzMzExMSpv6daAAAABXRSTlMABAn/v0B6iA8AAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUHBAcQCQ0pM3u7fQAAAF5JREFUKM9jYGBgYWBgYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYAYAD9QBwQpY0fIAAAAASUVORK5CYII=')]" />

      {/* Slots */}
      {layout.slots.map((slotDef) => {
        const key = `${pageIndex}-${slotDef.id}`
        return (
          <BookSlot
            key={slotDef.id}
            slotDef={slotDef}
            pageIndex={pageIndex}
            pageWidth={PREVIEW_WIDTH}
            pageHeight={previewHeight}
            assignment={assignments[key] ?? null}
            isSpread={isSpread}
            isRightPage={isRightPage}
          />
        )
      })}

      {/* Blank placeholder */}
      {layout.slots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] text-black/10 uppercase tracking-[0.4em] font-bold">Blank</span>
        </div>
      )}

      {/* Gutter edge */}
      {!isSpread && (
        <div className={`absolute inset-y-0 w-px bg-black/5 ${isLeft ? 'right-0' : 'left-0'}`} />
      )}

      {/* Page number (not shown in spread mode — would overlap awkwardly) */}
      {!isSpread && (
        <div className={`absolute bottom-4 font-mono text-[8px] text-gray-400/60 tracking-widest ${isLeft ? 'left-5' : 'right-5'}`}>
          {pageIndex + 1}
        </div>
      )}
    </div>
  )
}
