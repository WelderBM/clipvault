import { useEffect, useMemo, useRef, useState } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import RadarChart from '../components/RadarChart'
import Heatmap from '../components/Heatmap'
import SprintSection from '../components/SprintSection'
import ProgressImportSheet from '../components/ProgressImportSheet'
import { FCC_WEIGHTS, HOT_TOPICS } from '../data/strategy'
import {
  EDITAL_TOPICS, TOPIC_STATE_LABELS, TOPIC_STATE_DOT, TOPIC_STATE_COLORS, type TopicState,
} from '../data/edital_topics'
import { setTopicProgress } from '../lib/progress'
import { useAuth } from '../hooks/useAuth'
import { DISCIPLINE_LABELS, type Discipline } from '../types'

const STATE_CYCLE: TopicState[] = ['unseen', 'seen', 'practiced', 'confident']
const ALL_STATES: TopicState[] = ['unseen', 'seen', 'practiced', 'confident']
const RADAR_DISCIPLINES: Discipline[] = ['portugues', 'constitucional', 'administrativo', 'afo', 'legislacao']
const UNDO_DELAY_MS = 5000

export default function DashboardPage() {
  const { user } = useAuth()
  const stats = useDashboardStats()

  const [expandedDiscipline, setExpandedDiscipline] = useState<Discipline | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [stateFilter, setStateFilter] = useState<TopicState | null>(null)

  // Undo toast: single pending change buffered before Firestore write
  const [pending, setPending] = useState<{ topicId: string; from: TopicState; to: TopicState } | null>(null)
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Batch edit mode
  const [editMode, setEditMode] = useState(false)
  const [batchEdits, setBatchEdits] = useState<Record<string, TopicState>>({})
  const [savingBatch, setSavingBatch] = useState(false)

  // Optimistic progress: pending change overlaid on Firestore state
  const effectiveProgress = useMemo<Record<string, TopicState>>(() =>
    pending
      ? { ...stats.topicProgress, [pending.topicId]: pending.to }
      : stats.topicProgress
  , [stats.topicProgress, pending])

  // Display progress: batch edits overlaid on top (edit mode only)
  const displayProgress = useMemo<Record<string, TopicState>>(() =>
    editMode ? { ...effectiveProgress, ...batchEdits } : effectiveProgress
  , [effectiveProgress, editMode, batchEdits])

  const pendingTopic = useMemo(() =>
    pending ? EDITAL_TOPICS.find(t => t.id === pending.topicId) ?? null : null
  , [pending])

  // Flush pending write immediately (entering edit mode or clicking a different topic)
  const flushPending = (p: typeof pending) => {
    if (!p || !user) return
    clearTimeout(pendingTimeoutRef.current!)
    setTopicProgress(user.uid, p.topicId, p.to)
    setPending(null)
  }

  useEffect(() => () => { clearTimeout(pendingTimeoutRef.current!) }, [])

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    )
  }

  const stateCounts = { unseen: 0, seen: 0, practiced: 0, confident: 0 } as Record<TopicState, number>
  EDITAL_TOPICS.forEach(t => { stateCounts[displayProgress[t.id] ?? 'unseen']++ })

  const radarData = RADAR_DISCIPLINES.map(d => {
    const coverage = stats.disciplineCoverage.find(c => c.discipline === d)
    const fccNorm = (FCC_WEIGHTS[d] ?? 0) / 0.95
    return {
      label: DISCIPLINE_LABELS[d].substring(0, 5).toUpperCase(),
      value: Math.min(1, coverage?.pct ?? 0),
      benchmark: Math.min(1, fccNorm),
    }
  })

  const handleTopicClick = (topicId: string) => {
    if (!user) return

    if (editMode) {
      const baseState = displayProgress[topicId] ?? 'unseen'
      const next = STATE_CYCLE[(STATE_CYCLE.indexOf(baseState) + 1) % STATE_CYCLE.length]
      setBatchEdits(prev => ({ ...prev, [topicId]: next }))
      return
    }

    // Flush any different-topic pending immediately before queuing this one
    if (pending && pending.topicId !== topicId) {
      flushPending(pending)
    }

    clearTimeout(pendingTimeoutRef.current!)

    const baseState = pending?.topicId === topicId ? pending.to : (effectiveProgress[topicId] ?? 'unseen')
    const next = STATE_CYCLE[(STATE_CYCLE.indexOf(baseState) + 1) % STATE_CYCLE.length]
    const originalFrom = pending?.topicId === topicId ? pending.from : (stats.topicProgress[topicId] ?? 'unseen')

    setPending({ topicId, from: originalFrom, to: next })

    pendingTimeoutRef.current = setTimeout(() => {
      setTopicProgress(user.uid, topicId, next)
      setPending(null)
    }, UNDO_DELAY_MS)
  }

  const handleUndo = () => {
    clearTimeout(pendingTimeoutRef.current!)
    setPending(null)
  }

  const enterEditMode = () => {
    if (pending) flushPending(pending)
    setEditMode(true)
  }

  const handleSaveBatch = async () => {
    if (!user || Object.keys(batchEdits).length === 0) return
    setSavingBatch(true)
    try {
      await Promise.all(
        Object.entries(batchEdits).map(([topicId, state]) =>
          setTopicProgress(user.uid, topicId, state)
        )
      )
      setBatchEdits({})
      setEditMode(false)
    } finally {
      setSavingBatch(false)
    }
  }

  const handleCancelBatch = () => {
    setBatchEdits({})
    setEditMode(false)
  }

  const filteredTopics = stateFilter
    ? EDITAL_TOPICS.filter(t => (displayProgress[t.id] ?? 'unseen') === stateFilter)
    : null

  const batchCount = Object.keys(batchEdits).length

  const TopicButton = ({ topic }: { topic: typeof EDITAL_TOPICS[0] }) => {
    const state: TopicState = displayProgress[topic.id] ?? 'unseen'
    const hasPendingBatch = editMode && topic.id in batchEdits
    return (
      <button
        onClick={() => handleTopicClick(topic.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform border ${
          hasPendingBatch
            ? 'bg-amber/5 border-amber/30'
            : 'bg-white/[0.02] border-white/5'
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${TOPIC_STATE_DOT[state]}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-body text-xs leading-snug ${state === 'unseen' ? 'text-white/45' : 'text-white/82'}`}>
            {topic.label}
            {topic.hotFCC && (
              <span className="ml-1.5 text-[9px] text-red-400 font-mono uppercase tracking-wider">hot</span>
            )}
          </p>
          {stateFilter && (
            <p className="font-mono text-[10px] text-white/30 mt-0.5">{DISCIPLINE_LABELS[topic.discipline]}</p>
          )}
        </div>
        <span className={`font-mono text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded border ${
          hasPendingBatch ? 'border-amber/40 text-amber' : TOPIC_STATE_COLORS[state]
        }`}>
          {TOPIC_STATE_LABELS[state]}
        </span>
      </button>
    )
  }

  return (
    <div className={`px-4 pt-4 space-y-6 ${editMode ? 'pb-36' : 'pb-8'}`}>
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wider text-teal">DASHBOARD</h1>
          <p className={`font-body text-[11px] uppercase tracking-wider mt-1 ${editMode ? 'text-amber/70' : 'text-white/40'}`}>
            {editMode ? 'Modo de correção' : 'Cobertura do edital'}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={editMode ? handleCancelBatch : enterEditMode}
            className={`p-2 transition-colors ${editMode ? 'text-amber/70 hover:text-amber' : 'text-white/30 hover:text-white/60'}`}
            aria-label={editMode ? 'Cancelar correções' : 'Corrigir progresso'}
            title={editMode ? 'Cancelar correções' : 'Corrigir progresso em lote'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {!editMode && (
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
          )}
        </div>
      </header>

      {/* Edit mode hint banner */}
      {editMode && (
        <div className="bg-amber/5 border border-amber/20 rounded-2xl px-4 py-3 text-xs font-body text-amber/80 leading-relaxed">
          Toque nos tópicos para corrigir o estado. As alterações ficam pendentes até você salvar.
          {batchCount > 0 && (
            <span className="ml-1 font-mono">
              · {batchCount} alteraç{batchCount === 1 ? 'ão' : 'ões'} pendente{batchCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Sprint */}
      <SprintSection topicProgress={displayProgress} onTopicClick={id => handleTopicClick(id)} />

      {/* State counts */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Não vistos</p>
          <p className="font-display text-2xl text-white">{stateCounts.unseen}</p>
          <p className="font-body text-[10px] text-white/35 mt-1">
            {stateCounts.seen + stateCounts.practiced} em progresso
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Dominados</p>
          <p className="font-display text-2xl text-teal">{stateCounts.confident}</p>
          <p className="font-body text-[10px] text-white/35 mt-1">
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

      {/* Topic Progress */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1">
          Progresso por Tópico
        </h2>

        {/* State filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setStateFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
              !stateFilter ? 'bg-white/10 border-white/20 text-white/80' : 'border-border text-white/35'
            }`}
          >
            Todos ({EDITAL_TOPICS.length})
          </button>
          {ALL_STATES.map(state => (
            <button
              key={state}
              onClick={() => setStateFilter(prev => prev === state ? null : state)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                stateFilter === state
                  ? TOPIC_STATE_COLORS[state]
                  : 'border-border text-white/35'
              }`}
            >
              {TOPIC_STATE_LABELS[state]} ({stateCounts[state]})
            </button>
          ))}
        </div>

        {/* Filtered flat list */}
        {stateFilter && filteredTopics && (
          <div className="space-y-1.5">
            {filteredTopics.length === 0 && (
              <p className="font-body text-sm text-white/30 text-center py-6">
                Nenhum tópico nesse estado.
              </p>
            )}
            {filteredTopics.map(topic => <TopicButton key={topic.id} topic={topic} />)}
          </div>
        )}

        {/* Accordion (unfiltered) */}
        {!stateFilter && (
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
                    <div className="text-left">
                      <p className="font-body text-sm text-white/90">{DISCIPLINE_LABELS[d]}</p>
                      <p className="font-mono text-[10px] text-amber mt-0.5">
                        {Math.round((FCC_WEIGHTS[d] ?? 0) * 100)}% da prova
                      </p>
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
                    <div className="border-t border-border px-4 py-3 space-y-1.5">
                      <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-3">
                        {editMode ? 'Toque para alterar estado' : 'Toque para avançar estado'}
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

      {/* Undo toast — floats above nav bar, clears after 5s */}
      {pending && pendingTopic && !editMode && (
        <div className="fixed bottom-[72px] left-4 right-4 lg:bottom-6 lg:left-[calc(14rem+1rem)] lg:right-6 lg:max-w-sm z-50 flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3 shadow-xl relative overflow-hidden">
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-white/70 truncate">{pendingTopic.label}</p>
            <p className="font-mono text-[10px] text-white/35 mt-0.5">
              {TOPIC_STATE_LABELS[pending.from]} → {TOPIC_STATE_LABELS[pending.to]}
            </p>
          </div>
          <button
            onClick={handleUndo}
            className="font-mono text-xs text-teal flex-shrink-0 px-3 py-1.5 rounded-xl border border-teal/30 hover:bg-teal/10 transition-colors active:scale-95"
          >
            Desfazer
          </button>
          {/* Progress bar draining over UNDO_DELAY_MS */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal/20 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-teal/60 rounded-b-2xl"
              style={{ animation: `shrink ${UNDO_DELAY_MS}ms linear forwards` }}
            />
          </div>
        </div>
      )}

      {/* Batch edit save bar — docked above nav bar (mobile) / floating bottom right (desktop) */}
      {editMode && (
        <div className="fixed bottom-[64px] left-0 right-0 lg:bottom-6 lg:left-[calc(14rem+1rem)] lg:right-6 z-50 px-4 py-2 lg:px-0 lg:py-0 bg-void/90 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none border-t border-amber/20 lg:border-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancelBatch}
              className="flex-1 py-3 rounded-2xl font-body text-sm text-white/50 border border-border hover:text-white/70 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveBatch}
              disabled={batchCount === 0 || savingBatch}
              className="flex-1 py-3 rounded-2xl font-body font-semibold text-sm bg-teal text-void disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {savingBatch ? 'Salvando…' : batchCount > 0 ? `Salvar (${batchCount})` : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
