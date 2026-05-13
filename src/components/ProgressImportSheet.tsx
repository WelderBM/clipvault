import { useMemo, useState } from 'react'
import { EDITAL_TOPICS } from '../data/edital_topics'
import { batchSetTopicProgress, setTopicProgress } from '../lib/progress'
import { batchSetReviewContent, type ReviewContent } from '../lib/review'
import { importWeeklyLogs } from '../lib/weekly'
import type { TopicState } from '../data/edital_topics'
import { DISCIPLINES, type Discipline } from '../types'

interface Props {
  uid: string
  currentProgress: Record<string, TopicState>
  onClose: () => void
}

const VALID_TOPIC_IDS = new Set(EDITAL_TOPICS.map(t => t.id))
const VALID_STATES = new Set<string>(['unseen', 'seen', 'practiced', 'confident'])
const REVIEW_FORMAT_KEYS = new Set(['mindMap', 'text', 'flashcards', 'checklist', 'table', 'cloze'])
const VALID_DISCIPLINES = new Set<string>(DISCIPLINES)
const WEEK_KEY_RE = /^\d{4}-W\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATE_RANK: Record<string, number> = { unseen: 0, seen: 1, practiced: 2, confident: 3 }

interface ParseResult {
  updates: Record<string, TopicState> | null
  reviewUpdates: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> | null
  weeklyUpdates: Record<string, { entries: { date: string; discipline: Discipline; topicIds: string[]; note?: string }[] }> | null
  errors: string[]
}

function parse(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { updates: null, reviewUpdates: null, weeklyUpdates: null, errors: [] }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (e) {
    return { updates: null, reviewUpdates: null, weeklyUpdates: null, errors: [e instanceof Error ? e.message : 'JSON inválido'] }
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return { updates: null, reviewUpdates: null, weeklyUpdates: null, errors: ['O JSON precisa ser um objeto.'] }
  }

  const obj = json as Record<string, unknown>
  const errors: string[] = []
  let updates: Record<string, TopicState> | null = null
  let reviewUpdates: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> | null = null
  let weeklyUpdates: Record<string, { entries: { date: string; discipline: Discipline; topicIds: string[]; note?: string }[] }> | null = null

  if ('topicProgress' in obj) {
    if (typeof obj.topicProgress !== 'object' || obj.topicProgress === null) {
      errors.push('"topicProgress" deve ser um objeto.')
    } else {
      const raw_tp = obj.topicProgress as Record<string, unknown>
      const u: Record<string, TopicState> = {}
      for (const [id, state] of Object.entries(raw_tp)) {
        if (!VALID_TOPIC_IDS.has(id)) { errors.push(`topicProgress: "${id}" não reconhecido`); continue }
        if (!VALID_STATES.has(state as string)) { errors.push(`topicProgress "${id}": estado "${state}" inválido`); continue }
        u[id] = state as TopicState
      }
      if (Object.keys(u).length > 0) updates = u
    }
  }

  if ('reviewContent' in obj) {
    if (typeof obj.reviewContent !== 'object' || obj.reviewContent === null) {
      errors.push('"reviewContent" deve ser um objeto.')
    } else {
      const raw_rc = obj.reviewContent as Record<string, unknown>
      const ru: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> = {}
      for (const [id, val] of Object.entries(raw_rc)) {
        if (!VALID_TOPIC_IDS.has(id)) { errors.push(`reviewContent: "${id}" não reconhecido`); continue }
        if (typeof val !== 'object' || val === null) { errors.push(`reviewContent "${id}": deve ser um objeto`); continue }
        const entry = val as Record<string, unknown>
        if (typeof entry.title !== 'string' || !entry.title) { errors.push(`reviewContent "${id}": campo "title" obrigatório`); continue }
        const hasFormat = [...REVIEW_FORMAT_KEYS].some(k => k in entry)
        if (!hasFormat) { errors.push(`reviewContent "${id}": nenhum formato encontrado (mindMap/text/flashcards/checklist/table/cloze)`); continue }
        ru[id] = entry as Omit<ReviewContent, 'topicId' | 'updatedAt'>
      }
      if (Object.keys(ru).length > 0) reviewUpdates = ru
    }
  }

  if ('weeklyLog' in obj) {
    if (typeof obj.weeklyLog !== 'object' || obj.weeklyLog === null) {
      errors.push('"weeklyLog" deve ser um objeto.')
    } else {
      const raw_wl = obj.weeklyLog as Record<string, unknown>
      const wu: Record<string, { entries: { date: string; discipline: Discipline; topicIds: string[]; note?: string }[] }> = {}
      for (const [weekKey, weekData] of Object.entries(raw_wl)) {
        if (!WEEK_KEY_RE.test(weekKey)) { errors.push(`weeklyLog: chave "${weekKey}" inválida (esperado YYYY-Wnn)`); continue }
        if (typeof weekData !== 'object' || weekData === null) { errors.push(`weeklyLog "${weekKey}": deve ser um objeto`); continue }
        const wd = weekData as Record<string, unknown>
        if (!Array.isArray(wd.entries)) { errors.push(`weeklyLog "${weekKey}": "entries" deve ser um array`); continue }
        const entries: { date: string; discipline: Discipline; topicIds: string[]; note?: string }[] = []
        for (const e of wd.entries as unknown[]) {
          if (typeof e !== 'object' || e === null) continue
          const entry = e as Record<string, unknown>
          if (typeof entry.date !== 'string' || !DATE_RE.test(entry.date)) { errors.push(`weeklyLog "${weekKey}": data inválida "${entry.date}"`); continue }
          if (typeof entry.discipline !== 'string' || !VALID_DISCIPLINES.has(entry.discipline)) { errors.push(`weeklyLog "${weekKey}": matéria inválida "${entry.discipline}"`); continue }
          if (!Array.isArray(entry.topicIds) || !(entry.topicIds as unknown[]).every(id => typeof id === 'string')) { errors.push(`weeklyLog "${weekKey}": topicIds inválido em ${entry.date}`); continue }
          const invalidTopics = (entry.topicIds as string[]).filter(id => !VALID_TOPIC_IDS.has(id))
          if (invalidTopics.length > 0) { errors.push(`weeklyLog "${weekKey}": tópico(s) não reconhecido(s): ${invalidTopics.join(', ')}`); continue }
          entries.push({
            date: entry.date as string,
            discipline: entry.discipline as Discipline,
            topicIds: entry.topicIds as string[],
            note: typeof entry.note === 'string' ? entry.note : undefined,
          })
        }
        if (entries.length > 0) wu[weekKey] = { entries }
      }
      if (Object.keys(wu).length > 0) weeklyUpdates = wu
    }
  }

  if (!updates && !reviewUpdates && !weeklyUpdates && errors.length === 0) {
    errors.push('JSON não contém "topicProgress", "reviewContent" nem "weeklyLog".')
  }

  return { updates, reviewUpdates, weeklyUpdates, errors }
}

const PLACEHOLDER = `{
  "topicProgress": {
    "pt-interpretacao": "seen",
    "pt-crase": "practiced"
  },
  "reviewContent": {
    "pt-crase": {
      "title": "Crase",
      "checklist": ["Crase = prep. 'a' + artigo 'a'", "Teste: trocar por 'para a'"]
    }
  },
  "weeklyLog": {
    "2026-W20": {
      "entries": [
        { "date": "2026-05-11", "discipline": "portugues",
          "topicIds": ["pt-interpretacao"], "note": "Prof. Ana" }
      ]
    }
  }
}`

export default function ProgressImportSheet({ uid, currentProgress, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<{ applied: number; skipped: number; contents: number; weeks: number } | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  const parsed = useMemo(() => parse(raw), [raw])
  const hasInput = raw.trim().length > 0
  const canApply = (parsed.updates !== null || parsed.reviewUpdates !== null || parsed.weeklyUpdates !== null) && !applying

  const handleApply = async () => {
    if (!canApply) return
    setApplying(true)
    setApplyError(null)
    setResult(null)
    try {
      let applied = 0, skipped = 0, contents = 0, weeks = 0

      const effectiveProgress = { ...currentProgress }

      if (parsed.updates) {
        const r = await batchSetTopicProgress(uid, parsed.updates, mode, currentProgress)
        applied = r.applied
        skipped = r.skipped
        for (const [id, state] of Object.entries(parsed.updates)) {
          const curr = currentProgress[id] ?? 'unseen'
          if (mode === 'replace' || (STATE_RANK[state] ?? 0) > (STATE_RANK[curr] ?? 0)) {
            effectiveProgress[id] = state
          }
        }
      }

      if (parsed.reviewUpdates) {
        contents = await batchSetReviewContent(uid, parsed.reviewUpdates)
      }

      if (parsed.weeklyUpdates) {
        const topicIds = await importWeeklyLogs(uid, parsed.weeklyUpdates)
        weeks = Object.keys(parsed.weeklyUpdates).length
        await Promise.all(
          topicIds
            .filter(id => (effectiveProgress[id] ?? 'unseen') === 'unseen')
            .map(id => setTopicProgress(uid, id, 'seen'))
        )
      }

      setResult({ applied, skipped, contents, weeks })
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : 'Falha ao aplicar.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-white tracking-wide">IMPORTAR PROGRESSO</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs font-body text-white/50 leading-relaxed">
          Cole o JSON do chat de estudo. Aceita{' '}
          <code className="font-mono text-teal/80">topicProgress</code>,{' '}
          <code className="font-mono text-teal/80">reviewContent</code> e/ou{' '}
          <code className="font-mono text-teal/80">weeklyLog</code>.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">JSON</label>
          <textarea
            value={raw}
            onChange={e => { setRaw(e.target.value); setResult(null) }}
            placeholder={PLACEHOLDER}
            rows={9}
            autoFocus
            spellCheck={false}
            className="bg-void border border-border rounded-xl px-3 py-2 text-xs font-mono text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors leading-relaxed"
          />
        </div>

        {hasInput && !result && (
          <div className="flex flex-col gap-1.5 text-xs font-body">
            {parsed.errors.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {parsed.errors.map((e, i) => (
                  <li key={i} className="text-rose-400">✗ {e}</li>
                ))}
              </ul>
            )}
            {(parsed.updates || parsed.reviewUpdates || parsed.weeklyUpdates) && (
              <div className="text-white/50 space-y-0.5">
                {parsed.updates && (
                  <p>{Object.keys(parsed.updates).length} estado{Object.keys(parsed.updates).length !== 1 ? 's' : ''} reconhecido{Object.keys(parsed.updates).length !== 1 ? 's' : ''}</p>
                )}
                {parsed.reviewUpdates && (
                  <p>{Object.keys(parsed.reviewUpdates).length} conteúdo{Object.keys(parsed.reviewUpdates).length !== 1 ? 's' : ''} de revisão</p>
                )}
                {parsed.weeklyUpdates && (
                  <p>{Object.keys(parsed.weeklyUpdates).length} semana{Object.keys(parsed.weeklyUpdates).length !== 1 ? 's' : ''} de registro</p>
                )}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-0.5 text-xs font-body">
            {result.applied > 0 && (
              <span className="text-teal">✓ {result.applied} estado{result.applied !== 1 ? 's' : ''} avançado{result.applied !== 1 ? 's' : ''}</span>
            )}
            {result.skipped > 0 && (
              <span className="text-white/40">– {result.skipped} ignorado{result.skipped !== 1 ? 's' : ''} (já no nível ou superior)</span>
            )}
            {result.contents > 0 && (
              <span className="text-teal">✓ {result.contents} conteúdo{result.contents !== 1 ? 's' : ''} de revisão importado{result.contents !== 1 ? 's' : ''}</span>
            )}
            {result.weeks > 0 && (
              <span className="text-teal">✓ {result.weeks} semana{result.weeks !== 1 ? 's' : ''} de aulas registrada{result.weeks !== 1 ? 's' : ''}</span>
            )}
            {result.applied === 0 && result.skipped === 0 && result.contents === 0 && result.weeks === 0 && (
              <span className="text-white/40">Nenhuma alteração.</span>
            )}
          </div>
        )}

        {applyError && (
          <div className="text-xs font-body text-rose-400">{applyError}</div>
        )}

        {parsed.updates && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Estados:</span>
            <div className="flex rounded-xl overflow-hidden border border-border text-xs font-body">
              <button
                onClick={() => setMode('merge')}
                className={`px-3 py-1.5 transition-colors ${mode === 'merge' ? 'bg-teal/20 text-teal' : 'text-white/40 hover:text-white/60'}`}
              >
                Mesclar
              </button>
              <button
                onClick={() => setMode('replace')}
                className={`px-3 py-1.5 transition-colors border-l border-border ${mode === 'replace' ? 'bg-amber/20 text-amber' : 'text-white/40 hover:text-white/60'}`}
              >
                Substituir
              </button>
            </div>
            <span className="text-[10px] font-body text-white/25">
              {mode === 'merge' ? 'só avança' : 'sobrescreve'}
            </span>
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={!canApply}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-1 bg-teal text-void hover:bg-teal-dim"
        >
          {applying ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>
    </div>
  )
}
