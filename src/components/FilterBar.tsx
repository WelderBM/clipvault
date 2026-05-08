import type { Discipline, Importance } from '../types'
import { DISCIPLINES, DISCIPLINE_LABELS, IMPORTANCE_LEVELS } from '../types'

interface Props {
  filters: {
    search: string
    disciplines: Set<Discipline>
    importance: Set<Importance>
    hotOnly: boolean
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string
    disciplines: Set<Discipline>
    importance: Set<Importance>
    hotOnly: boolean
  }>>
}

export default function FilterBar({ filters, setFilters }: Props) {
  const toggleDiscipline = (d: Discipline) => {
    setFilters(prev => {
      const next = new Set(prev.disciplines)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return { ...prev, disciplines: next }
    })
  }

  const toggleImportance = (i: Importance) => {
    setFilters(prev => {
      const next = new Set(prev.importance)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return { ...prev, importance: next }
    })
  }

  const toggleHotOnly = () => {
    setFilters(prev => ({ ...prev, hotOnly: !prev.hotOnly }))
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar nos cards..."
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-body text-white/80 placeholder-white/20 focus:outline-none focus:border-teal/40 transition-colors"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={toggleHotOnly}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all flex items-center gap-1 ${
            filters.hotOnly
              ? 'bg-amber/20 text-amber border border-amber/40'
              : 'bg-surface border border-border text-white/40 hover:border-white/20'
          }`}
        >
          <span>🔥</span> Hot FCC
        </button>

        {DISCIPLINES.map(d => (
          <button
            key={d}
            onClick={() => toggleDiscipline(d)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all ${
              filters.disciplines.has(d)
                ? 'bg-teal/20 text-teal border border-teal/40'
                : 'bg-surface border border-border text-white/40 hover:border-white/20'
            }`}
          >
            {DISCIPLINE_LABELS[d]}
          </button>
        ))}

        {IMPORTANCE_LEVELS.filter(lvl => lvl.value !== 3).map(lvl => (
          <button
            key={lvl.value}
            onClick={() => toggleImportance(lvl.value)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all flex items-center gap-1 ${
              filters.importance.has(lvl.value)
                ? 'bg-white/10 text-white/80 border border-white/20'
                : 'bg-surface border border-border text-white/40 hover:border-white/20'
            }`}
          >
            <span>{lvl.emoji}</span> {lvl.label}
          </button>
        ))}
      </div>
    </div>
  )
}
