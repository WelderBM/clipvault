import { useState } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import RadarChart from '../components/RadarChart'
import Heatmap from '../components/Heatmap'
import ProgressImportSheet from '../components/ProgressImportSheet'
import { FCC_WEIGHTS, HOT_TOPICS } from '../data/strategy'
import { EDITAL_TOPICS, TOPIC_STATE_DOT, type TopicState } from '../data/edital_topics'
import { setTopicProgress } from '../lib/progress'
import { useAuth } from '../hooks/useAuth'
import { DISCIPLINE_LABELS, type Discipline } from '../types'

const STATE_CYCLE: TopicState[] = ['unseen', 'seen', 'practiced', 'confident']
const STATE_LABEL: Record<TopicState, string> = {
  unseen: '·',
  seen: 'V',
  practiced: 'P',
  confident: '★',
}
const STATE_RING: Record<TopicState, string> = {
  unseen: 'ring-white/10',
  seen: 'ring-sky-400/60',
  practiced: 'ring-amber-400/60',
  confident: 'ring-teal/60',
}

const RADAR_DISCIPLINES: Discipline[] = ['portugues', 'constitucional', 'administrativo', 'afo', 'legislacao']

export default function DashboardPage() {
  const { user } = useAuth()
  const stats = useDashboardStats()
  const [expandedDiscipline, setExpandedDiscipline] = useState<Discipline | null>(null)
  const [showImport, setShowImport] = useState(false)

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    )
  }

  const radarData = RADAR_DISCIPLINES.map(d => {
    const coverage = stats.disciplineCoverage.find(c => c.discipline === d)
    const fccNorm = (FCC_WEIGHTS[d] ?? 0) / 0.95
    return {
      label: DISCIPLINE_LABELS[d].substring(0, 5).toUpperCase(),
      value: Math.min(1, (coverage?.pct ?? 0)),
      benchmark: Math.min(1, fccNorm),
    }
  })

  const handleTopicClick = async (topicId: string, currentState: TopicState | undefined) => {
    if (!user) return
    const idx = STATE_CYCLE.indexOf(currentState ?? 'unseen')
    const next = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length]
    await setTopicProgress(user.uid, topicId, next)
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wider text-teal">DASHBOARD</h1>
          <p className="font-body text-white/40 text-[11px] uppercase tracking-wider mt-1">Cobertura do edital</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="mt-1 p-2 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Importar progresso"
          title="Importar progresso do chat de estudo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
      </header>

      {/* Top Numbers */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Total de Cards</p>
          <p className="font-display text-2xl text-white">{stats.totalCards}</p>
          <p className="font-body text-[10px] text-teal mt-1">{stats.activeCards} ativos</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Tópicos Vistos</p>
          <p className="font-display text-2xl text-white">
            {stats.disciplineCoverage.reduce((acc, c) => acc + c.seen, 0)}
          </p>
          <p className="font-body text-[10px] text-amber mt-1">
            de {EDITAL_TOPICS.length} no edital
          </p>
        </div>
      </section>

      {/* Radar Chart */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Cobertura vs Peso FCC</span>
          <span className="flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-teal/40 rounded-sm" /> Cobertura</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0 border-t border-amber border-dashed" /> Peso FCC</span>
          </span>
        </h2>
        <RadarChart data={radarData} />
      </section>

      {/* Topic Progress by Discipline */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1">
          Progresso por Tópico
        </h2>
        <div className="space-y-2">
          {RADAR_DISCIPLINES.map(d => {
            const topics = EDITAL_TOPICS.filter(t => t.discipline === d)
            const coverage = stats.disciplineCoverage.find(c => c.discipline === d)
            const confidentPct = coverage && coverage.total > 0
              ? Math.round((coverage.confident / coverage.total) * 100)
              : 0
            const isExpanded = expandedDiscipline === d

            return (
              <div key={d} className="bg-surface border border-border rounded-2xl overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between"
                  onClick={() => setExpandedDiscipline(isExpanded ? null : d)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-body text-sm text-white/90">{DISCIPLINE_LABELS[d]}</p>
                      <p className="font-mono text-[10px] text-amber mt-0.5">
                        {Math.round((FCC_WEIGHTS[d] ?? 0) * 100)}% da prova
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm text-teal">{confidentPct}%</p>
                      <p className="font-mono text-[10px] text-white/40">dominado</p>
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
                  <div className="border-t border-border px-4 py-3 space-y-2">
                    <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">
                      Toque para avançar: · → V → P → ★ → ·
                    </p>
                    {topics.map(topic => {
                      const state: TopicState = stats.topicProgress[topic.id] ?? 'unseen'
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic.id, state)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl ring-1 transition-all text-left ${STATE_RING[state]} bg-white/2`}
                        >
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ring-1 ${STATE_RING[state]} ${TOPIC_STATE_DOT[state]}`}>
                            <span className="text-void">{STATE_LABEL[state]}</span>
                          </div>
                          <div className="min-w-0">
                            <p className={`font-body text-xs leading-snug ${state === 'unseen' ? 'text-white/40' : 'text-white/80'}`}>
                              {topic.label}
                              {topic.hotFCC && (
                                <span className="ml-1.5 text-[9px] text-red-400 font-mono uppercase tracking-wider">hot</span>
                              )}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
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
    </div>
  )
}
