import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { subscribeReviewContent, type ReviewContent } from '../lib/review'
import { subscribeTopicProgress } from '../lib/progress'
import { EDITAL_TOPICS, TOPIC_STATE_DOT, type TopicState } from '../data/edital_topics'
import { DISCIPLINE_LABELS, type Discipline } from '../types'
import ReviewSheet from '../components/ReviewSheet'

const FORMAT_BADGES: { key: keyof ReviewContent; label: string }[] = [
  { key: 'mindMap', label: 'Mapa' },
  { key: 'text', label: 'Texto' },
  { key: 'flashcards', label: 'Cards' },
  { key: 'checklist', label: 'Check' },
  { key: 'table', label: 'Tab.' },
  { key: 'cloze', label: 'Cloze' },
]

function hasContent(c: ReviewContent, key: keyof ReviewContent): boolean {
  const val = c[key]
  if (!val) return false
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'object') return true
  return false
}

export default function ReviewPage() {
  const { user } = useAuth()
  const [reviewContent, setReviewContent] = useState<Record<string, ReviewContent>>({})
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicState>>({})
  const [loading, setLoading] = useState(true)
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)
  const [openTopic, setOpenTopic] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub1 = subscribeReviewContent(user.uid, (data) => {
      setReviewContent(data)
      setLoading(false)
    })
    const unsub2 = subscribeTopicProgress(user.uid, setTopicProgress)
    return () => { unsub1(); unsub2() }
  }, [user])

  const topicIds = Object.keys(reviewContent)

  // Disciplines that have at least one topic with review content
  const disciplinesWithContent = [...new Set(
    topicIds
      .map(id => EDITAL_TOPICS.find(t => t.id === id)?.discipline)
      .filter((d): d is Discipline => !!d)
  )]

  const filtered = topicIds.filter(id => {
    if (!selectedDiscipline) return true
    return EDITAL_TOPICS.find(t => t.id === id)?.discipline === selectedDiscipline
  })

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
    </div>
  )

  const openContent = openTopic ? reviewContent[openTopic] : null
  const openTopicData = openTopic ? EDITAL_TOPICS.find(t => t.id === openTopic) : null

  return (
    <div className="px-4 pt-4 pb-24">
      <header className="mb-5">
        <h1 className="font-display text-2xl tracking-wider text-teal">REVISÃO</h1>
        <p className="font-body text-white/40 text-[11px] uppercase tracking-wider mt-1">
          Conteúdo importado do chat de estudo
        </p>
      </header>

      {topicIds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
              <path d="M12 2a9 9 0 1 0 0 18A9 9 0 0 0 12 2z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <p className="font-body text-white/40 text-sm leading-relaxed max-w-[240px]">
            Nenhum conteúdo importado.<br />
            Use o ícone ↑ no Dashboard para importar JSON do chat de estudo.
          </p>
        </div>
      ) : (
        <>
          {/* Filter chips */}
          {disciplinesWithContent.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
              <button
                onClick={() => setSelectedDiscipline(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                  !selectedDiscipline ? 'bg-teal/10 border-teal/30 text-teal' : 'border-border text-white/40'
                }`}
              >
                Todos
              </button>
              {disciplinesWithContent.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDiscipline(prev => prev === d ? null : d)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                    selectedDiscipline === d ? 'bg-teal/10 border-teal/30 text-teal' : 'border-border text-white/40'
                  }`}
                >
                  {DISCIPLINE_LABELS[d].split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Topic list */}
          <div className="space-y-2">
            {filtered.map(topicId => {
              const content = reviewContent[topicId]
              const topicData = EDITAL_TOPICS.find(t => t.id === topicId)
              const state: TopicState = topicProgress[topicId] ?? 'unseen'
              const dot = TOPIC_STATE_DOT[state]
              const formats = FORMAT_BADGES.filter(f => hasContent(content, f.key))

              return (
                <button
                  key={topicId}
                  onClick={() => setOpenTopic(topicId)}
                  className="w-full bg-surface border border-border rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-white/85 truncate">{content.title}</p>
                    {topicData && (
                      <p className="font-mono text-[10px] text-white/35 mt-0.5">
                        {DISCIPLINE_LABELS[topicData.discipline]}
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {formats.map(f => (
                        <span key={f.key} className="font-mono text-[9px] text-white/35 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-wider">
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25 flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        </>
      )}

      {openContent && openTopic && openTopicData && (
        <ReviewSheet
          content={openContent}
          topicState={topicProgress[openTopic]}
          discipline={openTopicData.discipline}
          onClose={() => setOpenTopic(null)}
        />
      )}
    </div>
  )
}
