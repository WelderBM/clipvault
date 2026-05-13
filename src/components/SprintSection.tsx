import { useState } from 'react'
import { SPRINT_PHASES, getDaysToExam, getCurrentPhase, getPhaseProgress } from '../data/sprint'
import { EDITAL_TOPICS, TOPIC_STATE_LABELS, TOPIC_STATE_DOT, type TopicState } from '../data/edital_topics'
import { FCC_WEIGHTS } from '../data/strategy'
import type { Discipline } from '../types'

interface Props {
  topicProgress: Record<string, TopicState>
  onTopicClick: (id: string, state: TopicState | undefined) => void
}

export default function SprintSection({ topicProgress, onTopicClick }: Props) {
  const [expanded, setExpanded] = useState(true)
  const daysToExam = getDaysToExam()
  const currentPhase = getCurrentPhase()
  const currentPhaseIndex = currentPhase ? SPRINT_PHASES.indexOf(currentPhase) : -1

  const criticalTopics = EDITAL_TOPICS
    .filter(t => t.hotFCC)
    .filter(t => {
      const s = topicProgress[t.id] ?? 'unseen'
      return s === 'unseen' || s === 'seen'
    })
    .sort((a, b) => (FCC_WEIGHTS[b.discipline as Discipline] ?? 0) - (FCC_WEIGHTS[a.discipline as Discipline] ?? 0))

  const formatDate = (str: string) => {
    const [, m, d] = str.split('-').map(Number)
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
    return `${d}/${months[m - 1]}`
  }

  return (
    <section className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-teal text-base tracking-wider">
            {daysToExam > 0 ? `${daysToExam} DIAS` : 'PROVA HOJE'}
          </span>
          {currentPhase && (
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Fase {currentPhaseIndex + 1} — {currentPhase.name}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 pt-4 pb-5 space-y-5">

          {/* Phase timeline */}
          <div className="space-y-3">
            {SPRINT_PHASES.map((phase, i) => {
              const isCurrent = i === currentPhaseIndex
              const isPast = i < currentPhaseIndex
              const progress = isCurrent ? getPhaseProgress(phase) : null

              return (
                <div key={i} className={`space-y-1.5 ${isPast ? 'opacity-40' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />}
                      <span className={`font-mono text-[11px] uppercase tracking-wider ${isCurrent ? 'text-teal' : 'text-white/50'}`}>
                        Fase {i + 1} — {phase.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">
                      {formatDate(phase.start)}–{formatDate(phase.end)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-white/40 pl-3.5">{phase.description}</p>
                  {isCurrent && progress && (
                    <div className="flex items-center gap-2 pl-3.5">
                      <div className="flex-1 h-1 rounded-full bg-white/5">
                        <div
                          className="h-1 rounded-full bg-teal/60 transition-all"
                          style={{ width: `${(progress.elapsed / progress.total) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-white/30">
                        {progress.elapsed}/{progress.total} dias
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Critical topics */}
          {criticalTopics.length > 0 && (
            <div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                Tópicos críticos pendentes
              </p>
              <div className="space-y-1.5">
                {criticalTopics.slice(0, 6).map(topic => {
                  const state: TopicState = topicProgress[topic.id] ?? 'unseen'
                  return (
                    <button
                      key={topic.id}
                      onClick={() => onTopicClick(topic.id, state)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TOPIC_STATE_DOT[state]}`} />
                      <p className="flex-1 font-body text-xs text-white/70 truncate">{topic.label}</p>
                      <span className="font-mono text-[10px] text-white/30 flex-shrink-0">
                        {TOPIC_STATE_LABELS[state]}
                      </span>
                    </button>
                  )
                })}
                {criticalTopics.length > 6 && (
                  <p className="font-mono text-[10px] text-white/25 text-center pt-1">
                    +{criticalTopics.length - 6} outros
                  </p>
                )}
              </div>
            </div>
          )}

          {criticalTopics.length === 0 && (
            <p className="font-body text-xs text-teal/60 text-center py-1">
              Todos os hot topics estão praticados ou dominados ✓
            </p>
          )}
        </div>
      )}
    </section>
  )
}
