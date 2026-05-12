import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FCC_WEIGHTS, DISCIPLINE_STRATEGIES } from '../data/strategy'
import { DISCIPLINE_LABELS, type Discipline } from '../types'

const FREQ_COLOR = (freq: string) => {
  const n = parseInt(freq)
  if (n >= 90) return 'text-red-400'
  if (n >= 70) return 'text-amber'
  return 'text-white/50'
}

const FREQ_BAR = (freq: string) => {
  const n = parseInt(freq)
  if (n >= 90) return 'bg-red-400'
  if (n >= 70) return 'bg-amber'
  if (n >= 50) return 'bg-teal/60'
  return 'bg-white/20'
}

// Disciplines that have strategy data, sorted by FCC weight descending
const STRATEGY_DISCIPLINES: Discipline[] = (
  Object.entries(FCC_WEIGHTS) as [Discipline, number][]
)
  .filter(([d]) => d !== 'ti') // TI shown separately
  .sort(([, a], [, b]) => b - a)
  .map(([d]) => d)

export default function StrategyPage() {
  const [expanded, setExpanded] = useState<Discipline | null>(null)

  const toggle = (d: Discipline) => setExpanded(prev => prev === d ? null : d)

  return (
    <div className="px-4 pt-4 pb-24">
      <header className="mb-6">
        <h1 className="font-display text-2xl tracking-wider text-teal">ESTRATÉGIA FCC</h1>
        <p className="font-body text-white/40 text-sm mt-1">Hot topics e armadilhas por matéria</p>
      </header>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 px-1">
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Freq. FCC:</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> ≥90%
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber">
          <span className="w-2 h-2 rounded-full bg-amber inline-block" /> ≥70%
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
          <span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> &lt;70%
        </span>
      </div>

      <div className="space-y-2">
        {STRATEGY_DISCIPLINES.map((d, idx) => {
          const weight = FCC_WEIGHTS[d]
          const strategy = DISCIPLINE_STRATEGIES.find(s => s.discipline === d)
          const isOpen = expanded === d
          const rank = idx + 1

          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden"
            >
              {/* Header row — always visible */}
              <button
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                onClick={() => toggle(d)}
              >
                {/* Rank */}
                <span className="font-display text-sm text-white/25 w-6 flex-shrink-0 text-center">
                  {rank}°
                </span>

                {/* Weight bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body text-sm text-white/90">{DISCIPLINE_LABELS[d]}</span>
                    <span className="font-mono text-sm text-teal ml-2 flex-shrink-0">
                      {Math.round(weight * 100)}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 w-full">
                    <div
                      className="h-1 rounded-full bg-teal/50 transition-all duration-300"
                      style={{ width: `${weight * 100 / 0.30 * 100}%`, maxWidth: '100%' }}
                    />
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {isOpen && strategy && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/60 px-4 pt-4 pb-5 space-y-5">

                      {/* Hot Topics rankeados */}
                      <div>
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                          Hot Topics — rankeados por freq. FCC
                        </p>
                        <div className="space-y-2">
                          {strategy.topTopics.map((t, i) => (
                            <div key={i} className="flex items-start gap-3">
                              {/* Rank dot */}
                              <span className="font-mono text-[10px] text-white/25 mt-0.5 w-4 flex-shrink-0 text-right">
                                {i + 1}.
                              </span>
                              {/* Freq bar + label */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`font-body text-xs leading-snug ${parseInt(t.fccFreq) >= 70 ? 'text-white/80' : 'text-white/50'}`}>
                                    {t.topic}
                                  </span>
                                  <span className={`font-mono text-[10px] flex-shrink-0 ${FREQ_COLOR(t.fccFreq)}`}>
                                    {t.fccFreq}
                                  </span>
                                </div>
                                <div className="h-0.5 rounded-full bg-white/5">
                                  <div
                                    className={`h-0.5 rounded-full transition-all ${FREQ_BAR(t.fccFreq)}`}
                                    style={{ width: t.fccFreq }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Armadilhas */}
                      <div>
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                          ⚠ Armadilhas FCC
                        </p>
                        <div className="space-y-2">
                          {strategy.traps.map((trap, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-amber mt-0.5 flex-shrink-0 text-xs">›</span>
                              <p className="font-body text-xs text-white/65 leading-relaxed">{trap}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* TI separado */}
        {(() => {
          const tiStrategy = DISCIPLINE_STRATEGIES.find(s => s.discipline === 'ti')
          const isOpen = expanded === 'ti'
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: STRATEGY_DISCIPLINES.length * 0.06 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden mt-4"
            >
              <button
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                onClick={() => toggle('ti')}
              >
                <span className="font-display text-sm text-white/25 w-6 flex-shrink-0 text-center">—</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-white/90">TI — Conhecimentos Específicos</span>
                    <span className="font-mono text-xs text-white/40 ml-2 flex-shrink-0">60 questões</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/30 mt-0.5">Programador — Código 31</p>
                </div>
                <svg
                  className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && tiStrategy && (
                  <motion.div
                    key="ti-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/60 px-4 pt-4 pb-5 space-y-5">
                      <div>
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                          Hot Topics — rankeados por freq. FCC
                        </p>
                        <div className="space-y-2">
                          {tiStrategy.topTopics.map((t, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="font-mono text-[10px] text-white/25 mt-0.5 w-4 flex-shrink-0 text-right">{i + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`font-body text-xs leading-snug ${parseInt(t.fccFreq) >= 70 ? 'text-white/80' : 'text-white/50'}`}>
                                    {t.topic}
                                  </span>
                                  <span className={`font-mono text-[10px] flex-shrink-0 ${FREQ_COLOR(t.fccFreq)}`}>{t.fccFreq}</span>
                                </div>
                                <div className="h-0.5 rounded-full bg-white/5">
                                  <div className={`h-0.5 rounded-full ${FREQ_BAR(t.fccFreq)}`} style={{ width: t.fccFreq }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">⚠ Armadilhas FCC</p>
                        <div className="space-y-2">
                          {tiStrategy.traps.map((trap, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-amber mt-0.5 flex-shrink-0 text-xs">›</span>
                              <p className="font-body text-xs text-white/65 leading-relaxed">{trap}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })()}
      </div>
    </div>
  )
}
