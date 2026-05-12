import { useMemo, useState } from 'react'
import { EDITAL_TOPICS } from '../data/edital_topics'
import { batchSetTopicProgress } from '../lib/progress'
import type { TopicState } from '../data/edital_topics'

interface Props {
  uid: string
  currentProgress: Record<string, TopicState>
  onClose: () => void
}

const VALID_TOPIC_IDS = new Set(EDITAL_TOPICS.map(t => t.id))
const VALID_STATES = new Set<string>(['unseen', 'seen', 'practiced', 'confident'])

interface ParseResult {
  updates: Record<string, TopicState> | null
  errors: string[]
}

function parse(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { updates: null, errors: [] }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (e) {
    return { updates: null, errors: [e instanceof Error ? e.message : 'JSON inválido'] }
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return { updates: null, errors: ['O JSON precisa ser um objeto com a chave "topicProgress".'] }
  }

  const obj = json as Record<string, unknown>
  if (!('topicProgress' in obj) || typeof obj.topicProgress !== 'object' || obj.topicProgress === null) {
    return { updates: null, errors: ['Chave "topicProgress" não encontrada ou inválida.'] }
  }

  const raw_tp = obj.topicProgress as Record<string, unknown>
  const updates: Record<string, TopicState> = {}
  const errors: string[] = []

  for (const [id, state] of Object.entries(raw_tp)) {
    if (!VALID_TOPIC_IDS.has(id)) {
      errors.push(`"${id}" não é um topicId reconhecido`)
      continue
    }
    if (!VALID_STATES.has(state as string)) {
      errors.push(`"${id}": estado "${state}" inválido (use unseen/seen/practiced/confident)`)
      continue
    }
    updates[id] = state as TopicState
  }

  return { updates: Object.keys(updates).length > 0 ? updates : null, errors }
}

const PLACEHOLDER = `{
  "topicProgress": {
    "pt-interpretacao": "seen",
    "pt-crase": "practiced",
    "adm-principios": "confident"
  }
}`

export default function ProgressImportSheet({ uid, currentProgress, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<{ applied: number; skipped: number } | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  const parsed = useMemo(() => parse(raw), [raw])
  const hasInput = raw.trim().length > 0
  const canApply = parsed.updates !== null && !applying

  const handleApply = async () => {
    if (!canApply || !parsed.updates) return
    setApplying(true)
    setApplyError(null)
    setResult(null)
    try {
      const r = await batchSetTopicProgress(uid, parsed.updates, mode, currentProgress)
      setResult(r)
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
          Cole o JSON exportado pelo chat de estudo. Chave{' '}
          <code className="font-mono text-teal/80">topicProgress</code> com{' '}
          <code className="font-mono text-white/60">topicId → estado</code>.
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
            {parsed.updates && (
              <span className="text-white/50">
                {Object.keys(parsed.updates).length} tópico{Object.keys(parsed.updates).length !== 1 ? 's' : ''} reconhecido{Object.keys(parsed.updates).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Apply result */}
        {result && (
          <div className="flex flex-col gap-0.5 text-xs font-body">
            {result.applied > 0 && (
              <span className="text-teal">✓ {result.applied} tópico{result.applied !== 1 ? 's' : ''} avançado{result.applied !== 1 ? 's' : ''}</span>
            )}
            {result.skipped > 0 && (
              <span className="text-white/40">– {result.skipped} ignorado{result.skipped !== 1 ? 's' : ''} (já no nível ou superior)</span>
            )}
            {result.applied === 0 && result.skipped === 0 && (
              <span className="text-white/40">Nenhuma alteração.</span>
            )}
          </div>
        )}

        {applyError && (
          <div className="text-xs font-body text-rose-400">{applyError}</div>
        )}

        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Modo:</span>
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
            {mode === 'merge' ? 'só avança estados' : 'sobrescreve qualquer estado'}
          </span>
        </div>

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
