import { getRetentionLabel, type TopicProgress } from '../lib/progress'
import { EDITAL_TOPICS } from '../data/edital_topics'
import { FCC_WEIGHTS } from '../data/strategy'
import type { Discipline } from '../types'

interface Props {
  retentionScores: Record<string, number>
  topicProgress: Record<string, TopicProgress>
  onTopicClick: (id: string) => void
}

export default function ReviewTodaySection({ retentionScores, topicProgress, onTopicClick }: Props) {
  // Topics that were ever studied and have score < 0.55 (Esquecendo or Esquecido)
  const urgent = EDITAL_TOPICS
    .filter(t => {
      if (!topicProgress[t.id]) return false  // never studied
      const score = retentionScores[t.id] ?? 0
      return score < 0.55
    })
    .map(t => ({
      ...t,
      score: retentionScores[t.id] ?? 0,
      urgency: (FCC_WEIGHTS[t.discipline as Discipline] ?? 0.05) * (1 - (retentionScores[t.id] ?? 0)),
    }))
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 6)

  if (urgent.length === 0) return null

  const forgotten = urgent.filter(t => t.score < 0.30).length

  return (
    <section className="bg-surface border border-rose-500/20 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="font-mono text-[11px] text-white/70 uppercase tracking-wider">
            Revisar hoje
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/35">
          {forgotten > 0 ? `${forgotten} esquecido${forgotten !== 1 ? 's' : ''}` : `${urgent.length} tópico${urgent.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {urgent.map(topic => {
          const { label, color, dot } = getRetentionLabel(topic.score)
          return (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/[0.03] transition-colors"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
              <p className="flex-1 font-body text-sm text-white/75 truncate">{topic.label}</p>
              <span className={`font-mono text-[10px] flex-shrink-0 ${color}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
