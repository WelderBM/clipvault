import { useMemo, useState } from 'react'
import { EDITAL_TOPICS } from '../data/edital_topics'
import { batchSetTopicProgress } from '../lib/progress'
import { batchSetReviewContent, type ReviewContent } from '../lib/review'
import type { TopicState } from '../data/edital_topics'

interface Props {
  uid: string
  currentProgress: Record<string, TopicState>
  onClose: () => void
}

const VALID_TOPIC_IDS = new Set(EDITAL_TOPICS.map(t => t.id))
const VALID_STATES = new Set<string>(['unseen', 'seen', 'practiced', 'confident'])
const REVIEW_FORMAT_KEYS = new Set(['mindMap', 'text', 'flashcards', 'checklist', 'table', 'cloze'])

interface ParseResult {
  updates: Record<string, TopicState> | null
  reviewUpdates: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> | null
  errors: string[]
}

function parse(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { updates: null, reviewUpdates: null, errors: [] }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (e) {
    return { updates: null, reviewUpdates: null, errors: [e instanceof Error ? e.message : 'JSON inválido'] }
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return { updates: null, reviewUpdates: null, errors: ['O JSON precisa ser um objeto.'] }
  }

  const obj = json as Record<string, unknown>
  const errors: string[] = []
  let updates: Record<string, TopicState> | null = null
  let reviewUpdates: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> | null = null

  // Parse topicProgress (optional — only validate if present)
  if ('topicProgress' in obj) {
    if (typeof obj.topicProgress !== 'object' || obj.topicProgress === null) {
      errors.push('"topicProgress" deve ser um objeto.')
    } else {
      const raw_tp = obj.topicProgress as Record<string, unknown>
      const u: Record<string, TopicState> = {}
      for (const [id, state] of Object.entries(raw_tp)) {
        if (!VALID_TOPIC_IDS.has(id)) {
          errors.push(`topicProgress: "${id}" não reconhecido`)
          continue
        }
        if (!VALID_STATES.has(state as string)) {
          errors.push(`topicProgress "${id}": estado "${state}" inválido`)
          continue
        }
        u[id] = state as TopicState
      }
      if (Object.keys(u).length > 0) updates = u
    }
  }

  // Parse reviewContent (optional)
  if ('reviewContent' in obj) {
    if (typeof obj.reviewContent !== 'object' || obj.reviewContent === null) {
      errors.push('"reviewContent" deve ser um objeto.')
    } else {
      const raw_rc = obj.reviewContent as Record<string, unknown>
      const ru: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>> = {}
      for (const [id, val] of Object.entries(raw_rc)) {
        if (!VALID_TOPIC_IDS.has(id)) {
          errors.push(`reviewContent: "${id}" não reconhecido`)
          continue
        }
        if (typeof val !== 'object' || val === null) {
          errors.push(`reviewContent "${id}": deve ser um objeto`)
          continue
        }
        const entry = val as Record<string, unknown>
        if (typeof entry.title !== 'string' || !entry.title) {
          errors.push(`reviewContent "${id}": campo "title" obrigatório`)
          continue
        }
        const hasFormat = REVIEW_FORMAT_KEYS.size > 0 &&
          [...REVIEW_FORMAT_KEYS].some(k => k in entry)
        if (!hasFormat) {
          errors.push(`reviewContent "${id}": nenhum formato encontrado (mindMap/text/flashcards/checklist/table/cloze)`)
          continue
        }
        ru[id] = entry as Omit<ReviewContent, 'topicId' | 'updatedAt'>
      }
      if (Object.keys(ru).length > 0) reviewUpdates = ru
    }
  }

  if (!updates && !reviewUpdates && errors.length === 0) {
    errors.push('JSON não contém "topicProgress" nem "reviewContent".')
  }

  return { updates, reviewUpdates, errors }
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
  }
}`

export default function ProgressImportSheet({ uid, currentProgress, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<{ applied: number; skipped: number; contents: number } | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  const parsed = useMemo(() => parse(raw), [raw])
  const hasInput = raw.trim().length > 0
  const canApply = (parsed.updates !== null || parsed.reviewUpdates !== null) && !applying

  const handleApply = async () => {
    if (!canApply) return
    setApplying(true)
    setApplyError(null)
    setResult(null)
    try {
      let applied = 0, skipped = 0, contents = 0
      if (parsed.updates) {
        const r = await batchSetTopicProgress(uid, parsed.updates, mode, currentProgress)
        applied = r.applied
        skipped = r.skipped
      }
      if (parsed.reviewUpdates) {
        contents = await batchSetReviewContent(uid, parsed.reviewUpdates)
      }
      setResult({ applied, skipped, contents })
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
          <code className="font-mono text-teal/80">topicProgress</code> e/ou{' '}
          <code className="font-mono text-teal/80">reviewContent</code>.
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

        {/* Validation feedback */}
        {hasInput && !result && (
          <div className="flex flex-col gap-1.5 text-xs font-body">
            {parsed.errors.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {parsed.errors.map((e, i) => (
                  <li key={i} className="text-rose-400">✗ {e}</li>
                ))}
              </ul>
            )}
            {(parsed.updates || parsed.reviewUpdates) && (
              <div className="text-white/50 space-y-0.5">
                {parsed.updates && (
                  <p>{Object.keys(parsed.updates).length} estado{Object.keys(parsed.updates).length !== 1 ? 's' : ''} reconhecido{Object.keys(parsed.updates).length !== 1 ? 's' : ''}</p>
                )}
                {parsed.reviewUpdates && (
                  <p>{Object.keys(parsed.reviewUpdates).length} conteúdo{Object.keys(parsed.reviewUpdates).length !== 1 ? 's' : ''} de revisão</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Apply result */}
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
            {result.applied === 0 && result.skipped === 0 && result.contents === 0 && (
              <span className="text-white/40">Nenhuma alteração.</span>
            )}
          </div>
        )}

        {applyError && (
          <div className="text-xs font-body text-rose-400">{applyError}</div>
        )}

        {/* Mode toggle — only relevant when topicProgress is present */}
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
