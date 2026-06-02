import { useState } from 'react'
import { createCard } from '../lib/cards'
import { useAuth } from '../hooks/useAuth'
import {
  CARD_COLORS,
  CARD_CATEGORIES,
  DISCIPLINES,
  DISCIPLINE_LABELS,
  IMPORTANCE_LEVELS,
} from '../types'
import type { Discipline, Importance } from '../types'

interface Props {
  onClose: () => void
}

const EMOJIS = ['📋', '📌', '🔥', '⚡', '🎯', '📚', '💡', '🔑', '⚙️', '🧠', '📝', '🚀']

export default function CreateCardSheet({ onClose }: Props) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(CARD_COLORS[0].value)
  const [emoji, setEmoji] = useState('📋')
  const [category, setCategory] = useState(CARD_CATEGORIES[0])
  const [discipline, setDiscipline] = useState<Discipline | undefined>(undefined)
  const [importance, setImportance] = useState<Importance>(1)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const canSave = text.trim().length > 0

  const save = async () => {
    if (!user || !canSave) return
    setSaving(true)
    setSaveError(false)
    try {
      await createCard(user.uid, {
        title: title.trim() || null,
        text: text.trim(),
        color,
        emoji,
        category,
        status: 'active',
        ...(discipline !== undefined && { discipline }),
        ...(importance !== 1 && { importance }),
      })
      onClose()
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white tracking-wide">NOVO CARD</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Text — primary field */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Texto *</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Cole o texto aqui..."
            rows={5}
            autoFocus
            className="bg-void border border-border rounded-xl px-4 py-3 text-sm font-body text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Título (opcional)</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nome curto para identificar"
            className="bg-void border border-border rounded-xl px-4 py-3 text-sm font-body text-white/80 placeholder-white/20 focus:outline-none focus:border-teal/40 transition-colors"
          />
        </div>

        {/* Emoji picker */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  emoji === e ? 'bg-teal/20 border border-teal/50' : 'bg-void border border-border hover:border-white/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Cor</label>
          <div className="flex gap-2">
            {CARD_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c.value ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {CARD_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                  category === cat
                    ? 'text-void font-semibold'
                    : 'bg-void border border-border text-white/40 hover:border-white/20'
                }`}
                style={category === cat ? { backgroundColor: color } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Discipline (matéria do edital) */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Matéria</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDiscipline(undefined)}
              className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                discipline === undefined
                  ? 'bg-white/10 text-white/80 border border-white/20'
                  : 'bg-void border border-border text-white/40 hover:border-white/20'
              }`}
            >
              Sem matéria
            </button>
            {DISCIPLINES.map(d => (
              <button
                key={d}
                onClick={() => setDiscipline(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                  discipline === d
                    ? 'bg-teal/20 text-teal border border-teal/40'
                    : 'bg-void border border-border text-white/40 hover:border-white/20'
                }`}
              >
                {DISCIPLINE_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Importance */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Importância</label>
          <div className="flex gap-2">
            {IMPORTANCE_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                onClick={() => setImportance(lvl.value)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all flex items-center justify-center gap-1.5 ${
                  importance === lvl.value
                    ? 'bg-amber/20 text-amber border border-amber/40'
                    : 'bg-void border border-border text-white/40 hover:border-white/20'
                }`}
              >
                <span>{lvl.emoji}</span>
                <span>{lvl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        {saveError && (
          <p className="font-mono text-xs text-rose-400 text-center">Erro ao salvar. Tente novamente.</p>
        )}
        <button
          onClick={save}
          disabled={!canSave || saving}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-2"
          style={{ backgroundColor: color, color: '#03080F' }}
        >
          {saving ? 'Salvando...' : 'Salvar card'}
        </button>
      </div>
    </div>
  )
}
