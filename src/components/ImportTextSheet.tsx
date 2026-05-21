import { useMemo, useState } from 'react'
import { bulkImportTextos, TEXT_CATEGORY_LABELS, type TextoOficial, type TextCategory } from '../lib/texts'
import { DISCIPLINES, DISCIPLINE_LABELS } from '../types'

interface Props {
  uid: string
  onClose: () => void
}

const VALID_DISCIPLINES = new Set<string>(DISCIPLINES)
const VALID_CATEGORIES = new Set<string>([
  'constituicao', 'lei-complementar', 'lei-ordinaria',
  'regimento', 'resolucao', 'codigo', 'decreto', 'instrucao',
])

interface ParseResult {
  textos: Omit<TextoOficial, 'importadoEm' | 'updatedAt'>[] | null
  errors: string[]
}

function parse(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { textos: null, errors: [] }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (e) {
    return { textos: null, errors: [e instanceof Error ? e.message : 'JSON inválido'] }
  }

  // Accept both a single object and an array
  const arr: unknown[] = Array.isArray(json) ? json : [json]
  const errors: string[] = []
  const textos: Omit<TextoOficial, 'importadoEm' | 'updatedAt'>[] = []

  arr.forEach((item, i) => {
    const prefix = arr.length > 1 ? `[${i}] ` : ''
    if (typeof item !== 'object' || item === null) {
      errors.push(`${prefix}Esperado objeto, recebeu ${typeof item}`); return
    }
    const obj = item as Record<string, unknown>

    if (typeof obj.id !== 'string' || !obj.id)
      { errors.push(`${prefix}"id" obrigatório`); return }
    if (typeof obj.titulo !== 'string' || !obj.titulo)
      { errors.push(`${prefix}"titulo" obrigatório`); return }
    if (typeof obj.fonte !== 'string' || !obj.fonte)
      { errors.push(`${prefix}"fonte" obrigatório`); return }
    if (typeof obj.atualizadoEm !== 'string' || !obj.atualizadoEm)
      { errors.push(`${prefix}"atualizadoEm" obrigatório`); return }
    if (typeof obj.disciplina !== 'string' || !VALID_DISCIPLINES.has(obj.disciplina))
      { errors.push(`${prefix}"disciplina" inválida: "${obj.disciplina}"`); return }
    if (typeof obj.categoria !== 'string' || !VALID_CATEGORIES.has(obj.categoria))
      { errors.push(`${prefix}"categoria" inválida: "${obj.categoria}"`); return }
    if (typeof obj.ordem !== 'number')
      { errors.push(`${prefix}"ordem" deve ser um número`); return }
    if (!Array.isArray(obj.artigos) || obj.artigos.length === 0)
      { errors.push(`${prefix}"artigos" deve ser array não-vazio`); return }

    const artigoErrors: string[] = []
    for (const [j, art] of (obj.artigos as unknown[]).entries()) {
      if (typeof art !== 'object' || art === null) { artigoErrors.push(`artigo[${j}]: objeto esperado`); continue }
      const a = art as Record<string, unknown>
      if (typeof a.numero !== 'string' || !a.numero) artigoErrors.push(`artigo[${j}]: "numero" obrigatório`)
      if (typeof a.caput !== 'string' || !a.caput) artigoErrors.push(`artigo[${j}]: "caput" obrigatório`)
    }
    if (artigoErrors.length > 0) {
      errors.push(`${prefix}${artigoErrors[0]}${artigoErrors.length > 1 ? ` (+${artigoErrors.length - 1})` : ''}`)
      return
    }

    textos.push(obj as unknown as Omit<TextoOficial, 'importadoEm' | 'updatedAt'>)
  })

  return { textos: textos.length > 0 ? textos : null, errors }
}

const PLACEHOLDER = `{
  "id": "cf88-direitos-fundamentais",
  "titulo": "CF/88 — Direitos Fundamentais (Art. 5º)",
  "fonte": "Constituição Federal de 1988",
  "atualizadoEm": "1988-10-05",
  "disciplina": "constitucional",
  "categoria": "constituicao",
  "ordem": 1,
  "artigos": [
    {
      "numero": "Art. 5º",
      "caput": "Todos são iguais perante a lei...",
      "hotFCC": true,
      "notaFCC": "Artigo mais cobrado da CF/88."
    }
  ]
}`

export default function ImportTextSheet({ uid, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  const parsed = useMemo(() => parse(raw), [raw])
  const hasInput = raw.trim().length > 0
  const canApply = parsed.textos !== null && !applying

  // Group preview by discipline
  const previewByDiscipline = useMemo(() => {
    if (!parsed.textos) return {}
    return parsed.textos.reduce<Partial<Record<string, number>>>((acc, t) => {
      acc[t.disciplina] = (acc[t.disciplina] ?? 0) + 1
      return acc
    }, {})
  }, [parsed.textos])

  const handleApply = async () => {
    if (!canApply || !parsed.textos) return
    setApplying(true)
    setApplyError(null)
    setResult(null)
    try {
      const n = await bulkImportTextos(uid, parsed.textos)
      setResult(n)
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : 'Falha ao importar.')
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
          <h2 className="font-display text-xl text-white tracking-wide">IMPORTAR TEXTOS</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs font-body text-white/50 leading-relaxed">
          Cole o JSON do texto oficial. Aceita um objeto único ou array de textos.
          Campos obrigatórios: <code className="font-mono text-teal/80">id</code>,{' '}
          <code className="font-mono text-teal/80">titulo</code>,{' '}
          <code className="font-mono text-teal/80">disciplina</code>,{' '}
          <code className="font-mono text-teal/80">categoria</code>,{' '}
          <code className="font-mono text-teal/80">ordem</code>,{' '}
          <code className="font-mono text-teal/80">artigos</code>.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">JSON</label>
          <textarea
            value={raw}
            onChange={e => { setRaw(e.target.value); setResult(null) }}
            placeholder={PLACEHOLDER}
            rows={10}
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
            {parsed.textos && (
              <div className="text-white/50 space-y-0.5">
                <p className="font-semibold text-white/70">
                  {parsed.textos.length} texto{parsed.textos.length !== 1 ? 's' : ''} reconhecido{parsed.textos.length !== 1 ? 's' : ''}
                </p>
                {Object.entries(previewByDiscipline).map(([disc, count]) => (
                  <p key={disc} className="pl-3 text-white/40">
                    · {DISCIPLINE_LABELS[disc as keyof typeof DISCIPLINE_LABELS] ?? disc} ({count})
                  </p>
                ))}
                <details className="mt-1">
                  <summary className="text-white/40 cursor-pointer hover:text-white/60 py-1 select-none">
                    Ver detalhes
                  </summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                    {parsed.textos.map(t => (
                      <div key={t.id} className="flex items-center gap-2">
                        <span className="truncate flex-1 text-white/50">{t.titulo}</span>
                        <span className="text-white/25 flex-shrink-0 text-[10px]">
                          {TEXT_CATEGORY_LABELS[t.categoria as TextCategory]}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {result !== null && (
          <div className="text-xs font-body text-teal">
            ✓ {result} texto{result !== 1 ? 's' : ''} importado{result !== 1 ? 's' : ''} com sucesso
          </div>
        )}

        {applyError && (
          <div className="text-xs font-body text-rose-400">{applyError}</div>
        )}

        <button
          onClick={handleApply}
          disabled={!canApply}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-1 bg-teal text-void hover:bg-teal-dim"
        >
          {applying ? 'Importando…' : 'Importar'}
        </button>
      </div>
    </div>
  )
}
