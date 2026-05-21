import { useMemo, useState } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import RadarChart from '../components/RadarChart'
import Heatmap from '../components/Heatmap'
import SprintSection from '../components/SprintSection'
import ProgressImportSheet from '../components/ProgressImportSheet'
import ReviewTodaySection from '../components/ReviewTodaySection'
import SessionPickerSheet from '../components/SessionPickerSheet'
import { FCC_WEIGHTS, HOT_TOPICS } from '../data/strategy'
import { EDITAL_TOPICS, getTopicDotClass } from '../data/edital_topics'
import { setTopicProgress, getRetentionLabel, type SessionType } from '../lib/progress'
import { useAuth } from '../hooks/useAuth'
import { DISCIPLINE_LABELS, type Discipline } from '../types'

const RADAR_DISCIPLINES: Discipline[] = ['portugues', 'constitucional', 'administrativo', 'afo', 'legislacao']

type RetentionFilter = 'needs_review' | 'fresh' | null

export default function DashboardPage() {
  const { user } = useAuth()
  const stats = useDashboardStats()

  const [expandedDiscipline, setExpandedDiscipline] = useState<Discipline | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [retentionFilter, setRetentionFilter] = useState<RetentionFilter>(null)
  const [sessionPickerTopic, setSessionPickerTopic] = useState<string | null>(null)

  const handleTopicClick = (topicId: string) => {
    if (!user) return
    setSessionPickerTopic(topicId)
  }

  const handleSessionConfirm = async (sessionType: SessionType) => {
    if (!user || !sessionPickerTopic) return
    setSessionPickerTopic(null)
    await setTopicProgress(user.uid, sessionPickerTopic, sessionType)
  }

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    )
  }

  // Retention bracket counts
  const bracketCounts = { fresh: 0, good: 0, fading: 0, forgotten: 0, unseen: 0 }
  EDITAL_TOPICS.forEach(t => {
    const score = stats.retentionScores[t.id]
    if (score === undefined) { bracketCounts.unseen++; return }
    if (score >= 0.80) bracketCounts.fresh++
    else if (score >= 0.55) bracketCounts.good++
    else if (score >= 0.30) bracketCounts.fading++
    else bracketCounts.forgotten++
  })

  const radarData = RADAR_DISCIPLINES.map(d => {
    const coverage = stats.disciplineCoverage.find(c => c.discipline === d)
    const fccNorm = (FCC_WEIGHTS[d] ?? 0) / 0.95
    return {
      label: DISCIPLINE_LABELS[d].substring(0, 5).toUpperCase(),
      value: Math.min(1, coverage?.pct ?? 0),
      benchmark: Math.min(1, fccNorm),
    }
  })

  const filteredTopics = useMemo(() => {
    if (!retentionFilter) return null
    return EDITAL_TOPICS.filter(t => {
      const score = stats.retentionScores[t.id]
      if (retentionFilter === 'needs_review') {
        return score !== undefined && score < 0.55
      }
      // fresh: score ≥ 0.80
      return score !== undefined && score >= 0.80
    })
  }, [retentionFilter, stats.retentionScores])

  const TopicButton = ({ topic }: { topic: typeof EDITAL_TOPICS[0] }) => {
    const score = stats.retentionScores[topic.id]
    const { label, color } = score !== undefined
      ? getRetentionLabel(score)
      : { label: 'Não visto', color: 'text-white/25' }

    return (
      <button
        onClick={() => handleTopicClick(topic.id)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform border bg-white/[0.02] border-white/5"
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getTopicDotClass(score)}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-body text-xs leading-snug ${score === undefined ? 'text-white/45' : 'text-white/82'}`}>
            {topic.label}
            {topic.hotFCC && (
              <span className="ml-1.5 text-[9px] text-red-400 font-mono uppercase tracking-wider">hot</span>
            )}
          </p>
          {retentionFilter && (
            <p className="font-mono text-[10px] text-white/30 mt-0.5">{DISCIPLINE_LABELS[topic.discipline]}</p>
          )}
        </div>
        <span className={`font-mono text-[10px] flex-shrink-0 ${color}`}>{label}</span>
      </button>
    )
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wider text-teal">DASHBOARD</h1>
          <p className="font-body text-[11px] uppercase tracking-wider mt-1 text-white/40">
            Cobertura do edital
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={() => setShowImport(true)}
            className="p-2 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Importar progresso"
            title="Importar JSON do chat de estudo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Review Today */}
      <ReviewTodaySection
        retentionScores={stats.retentionScores}
        topicProgress={stats.topicProgress}
        onTopicClick={handleTopicClick}
      />

      {/* Sprint */}
      <SprintSection
        retentionScores={stats.retentionScores}
        topicProgress={stats.topicProgress}
        onTopicClick={handleTopicClick}
      />

      {/* Retention bracket counts */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Não vistos</p>
          <p className="font-display text-2xl text-white">{bracketCounts.unseen}</p>
          <p className="font-body text-[10px] text-white/35 mt-1">
            {bracketCounts.fading + bracketCounts.forgotten} precisam revisão
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Frescos</p>
          <p className="font-display text-2xl text-teal">{bracketCounts.fresh}</p>
          <p className="font-body text-[10px] text-white/35 mt-1">
            de {EDITAL_TOPICS.length} no edital
          </p>
        </div>
      </section>

      {/* Radar Chart */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Retenção vs Peso FCC</span>
          <span className="flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-teal/40 rounded-sm" /> Retenção</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0 border-t border-amber border-dashed" /> Peso FCC</span>
          </span>
        </h2>
        <RadarChart data={radarData} />
      </section>

      {/* Topic Progress */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1">
          Progresso por Tópico
        </h2>

        {/* Retention filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setRetentionFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              !retentionFilter ? 'bg-white/10 border-white/20 text-white/80' : 'border-border text-white/35'
            }`}
          >
            Todos ({EDITAL_TOPICS.length})
          </button>
          <button
            onClick={() => setRetentionFilter(prev => prev === 'needs_review' ? null : 'needs_review')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              retentionFilter === 'needs_review'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'border-border text-white/35'
            }`}
          >
            Revisar ({bracketCounts.fading + bracketCounts.forgotten})
          </button>
          <button
            onClick={() => setRetentionFilter(prev => prev === 'fresh' ? null : 'fresh')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              retentionFilter === 'fresh'
                ? 'bg-teal/10 border-teal/30 text-teal'
                : 'border-border text-white/35'
            }`}
          >
            Frescos ({bracketCounts.fresh})
          </button>
        </div>

        {/* Filtered flat list */}
        {retentionFilter && filteredTopics && (
          <div className="space-y-1.5">
            {filteredTopics.length === 0 && (
              <p className="font-body text-sm text-white/30 text-center py-6">
                Nenhum tópico nessa faixa.
              </p>
            )}
            {filteredTopics.map(topic => <TopicButton key={topic.id} topic={topic} />)}
          </div>
        )}

        {/* Accordion (unfiltered) */}
        {!retentionFilter && (
          <div className="space-y-2">
            {RADAR_DISCIPLINES.map(d => {
              const topics = EDITAL_TOPICS.filter(t => t.discipline === d)
              const coverage = stats.disciplineCoverage.find(c => c.discipline === d)
              const freshPct = coverage && coverage.total > 0
                ? Math.round((coverage.confident / coverage.total) * 100)
                : 0
              const isExpanded = expandedDiscipline === d

              return (
                <div key={d} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between"
                    onClick={() => setExpandedDiscipline(isExpanded ? null : d)}
                  >
                    <div className="text-left">
                      <p className="font-body text-sm text-white/90">{DISCIPLINE_LABELS[d]}</p>
                      <p className="font-mono text-[10px] text-amber mt-0.5">
                        {Math.round((FCC_WEIGHTS[d] ?? 0) * 100)}% da prova
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm text-teal">{freshPct}%</p>
                        <p className="font-mono text-[10px] text-white/40">fresco</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 space-y-1.5">
                      <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-3">
                        Toque para registrar sessão
                      </p>
                      {topics.map(topic => <TopicButton key={topic.id} topic={topic} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Heatmap */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-4">
          Atividade (60 dias)
        </h2>
        <Heatmap data={stats.activityHeatmap} />
      </section>

      {/* Hot Topics */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1 flex items-center gap-1">
          <span>🔥</span> Hot Topics FCC
        </h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {HOT_TOPICS.map((topic, i) => (
            <div key={i} className="px-4 py-3">
              <p className="font-body text-xs text-white/80 leading-relaxed">{topic}</p>
            </div>
          ))}
        </div>
      </section>

      {showImport && user && (
        <ProgressImportSheet
          uid={user.uid}
          currentProgress={stats.topicProgress}
          onClose={() => setShowImport(false)}
        />
      )}

      {sessionPickerTopic && (
        <SessionPickerSheet
          topicId={sessionPickerTopic}
          onSelect={handleSessionConfirm}
          onClose={() => setSessionPickerTopic(null)}
        />
      )}
    </div>
  )
}
