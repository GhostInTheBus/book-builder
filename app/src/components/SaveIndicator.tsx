import { useStore } from '../store/store'

export function SaveIndicator() {
  const status = useStore((s) => s.ui.saveStatus)
  return (
    <div className="fixed bottom-3 right-3 z-50 font-mono text-xs text-gray-400 flex items-center gap-1">
      <span className={status === 'saving' ? 'text-yellow-400' : 'text-green-500'}>●</span>
      {status === 'saving' ? 'Saving...' : 'Saved'}
    </div>
  )
}
