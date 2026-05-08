import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { bulkCreateCards } from '../lib/cards'
import { CARD_COLORS, CARD_CATEGORIES, DISCIPLINES } from '../types'
import type { CardInput, Discipline, Importance } from '../types'

interface Props {
  onClose: () => void
}

interface InvalidItem {
  index: number
  reason: string
}

interface ParseResult {
  valid: CardInput[]
  invalid: InvalidItem[]
  parseError?: string
}

const VALID_COLORS = new Set(CARD_COLORS.map(c => c.value))
const VALID_CATEGORIES = new Set<string>(CARD_CATEGORIES)
const VALID_DISCIPLINES = new Set<string>(DISCIPLINES)
const DEFAULT_COLOR = CARD_COLORS[0].value
const DEFAULT_CATEGORY = CARD_CATEGORIES[0]
const DEFAULT_EMOJI = '📋'

const PLACEHOLDER = `[
  {
    "title": "Quórum ALERR",
    "text": "1/3 discute, maioria absoluta vota — quórum progressivo",
    "color": "#1BE4C8",
    "emoji": "🔥",
    "category": "ALE-RR",
    "discipline": "legislacao",
    "importance": 3
  }
]`

function parse(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { valid: [], invalid: [] }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (e) {
    return {
      valid: [],
      invalid: [],
      parseError: e instanceof Error ? e.message : 'JSON inválido',
    }
  }

  if (!Array.isArray(json)) {
    return {
      valid: [],
      invalid: [],
      parseError: 'O JSON precisa ser um array de cards.',
    }
  }

  const valid: CardInput[] = []
  const invalid: InvalidItem[] = []

  json.forEach((item, i) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      invalid.push({ index: i, reason: 'Item não é um objeto.' })
      return
    }
    const obj = item as Record<string, unknown>

    const text = typeof obj.text === 'string' ? obj.text.trim() : ''
    if (!text) {
      invalid.push({ index: i, reason: 'Sem campo "text" (obrigatório).' })
      return
    }

    const titleRaw = typeof obj.title === 'string' ? obj.title.trim() : ''
    const title = titleRaw || null

    const color =
      typeof obj.color === 'string' && VALID_COLORS.has(obj.color)
        ? obj.color
        : DEFAULT_COLOR

    const emoji =
      typeof obj.emoji === 'string' && obj.emoji.length > 0 ? obj.emoji : DEFAULT_EMOJI

    const category =
      typeof obj.category === 'string' && VALID_CATEGORIES.has(obj.category)
        ? obj.category
        : DEFAULT_CATEGORY

    const discipline: Discipline | undefined =
      typeof obj.discipline === 'string' && VALID_DISCIPLINES.has(obj.discipline)
        ? (obj.discipline as Discipline)
        : undefined

    const importance: Importance =
      obj.importance === 1 || obj.importance === 2 || obj.importance === 3
        ? (obj.importance as Importance)
        : 1

    valid.push({
      title,
      text,
      color,
      emoji,
      category,
      status: 'active',
      ...(discipline !== undefined && { discipline }),
      ...(importance !== 1 && { importance }),
    })
  })

  return { valid, invalid }
}

export default function ImportCardsSheet({ onClose }: Props) {
  const { user } = useAuth()
  const [raw, setRaw] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const result = useMemo(() => parse(raw), [raw])
  const hasInput = raw.trim().length > 0

  const handleImport = async () => {
    if (!user || result.valid.length === 0 || importing) return
    setImporting(true)
    setError(null)
    try {
      await bulkCreateCards(user.uid, result.valid)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao importar.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white tracking-wide">IMPORTAR CARDS</h2>
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

        {/* Schema hint */}
        <div className="text-xs font-body text-white/50 leading-relaxed">
          Cole um array JSON de cards. Cada item precisa de{' '}
          <code className="font-mono text-teal/80">text</code>. Opcionais:{' '}
          <code className="font-mono text-white/60">title</code>,{' '}
          <code className="font-mono text-white/60">color</code>,{' '}
          <code className="font-mono text-white/60">emoji</code>,{' '}
          <code className="font-mono text-white/60">category</code>,{' '}
          <code className="font-mono text-white/60">discipline</code>,{' '}
          <code className="font-mono text-white/60">importance</code> (1–3).
        </div>

        {/* JSON textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">
            JSON
          </label>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            autoFocus
            spellCheck={false}
            className="bg-void border border-border rounded-xl px-3 py-2 text-xs font-mono text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors leading-relaxed"
          />
        </div>

        {/* Result summary */}
        {hasInput && (
          <div className="flex flex-col gap-2 text-xs font-body">
            {result.parseError ? (
              <div className="text-rose-400">
                JSON inválido: <span className="text-white/60">{result.parseError}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-teal">
                    ✓ {result.valid.length} válido{result.valid.length !== 1 ? 's' : ''}
                  </span>
                  {result.invalid.length > 0 && (
                    <span className="text-rose-400">
                      ✗ {result.invalid.length} inválido{result.invalid.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {result.invalid.length > 0 && (
                  <ul className="text-white/40 text-[11px] flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                    {result.invalid.slice(0, 6).map((it, i) => (
                      <li key={i}>
                        Item {it.index}: {it.reason}
                      </li>
                    ))}
                    {result.invalid.length > 6 && (
                      <li>… e mais {result.invalid.length - 6}</li>
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {/* Import error */}
        {error && (
          <div className="text-xs font-body text-rose-400">
            {error}
          </div>
        )}

        {/* Import button */}
        <button
          onClick={handleImport}
          disabled={result.valid.length === 0 || importing}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-2 bg-teal text-void hover:bg-teal-dim"
        >
          {importing
            ? 'Importando…'
            : result.valid.length > 0
              ? `Importar ${result.valid.length} card${result.valid.length !== 1 ? 's' : ''}`
              : 'Importar'}
        </button>
      </div>
    </div>
  )
}
