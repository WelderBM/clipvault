import { useState } from 'react'

export default function ChecklistViewer({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false))

  const toggle = (i: number) => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))
  const doneCount = checked.filter(Boolean).length

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal/70 transition-all duration-300"
            style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-white/40 flex-shrink-0">
          {doneCount} / {items.length}
        </span>
      </div>

      {/* Two-column grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 text-left p-3 rounded-xl bg-surface border border-border active:scale-[0.98] transition-transform"
          >
            <div className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors ${
              checked[i] ? 'bg-teal/20 border-teal/40' : 'border-white/20'
            }`}>
              {checked[i] && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-teal">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={`font-body text-sm leading-snug transition-colors ${
              checked[i] ? 'text-white/30 line-through' : 'text-white/80'
            }`}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
