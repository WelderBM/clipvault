import { useState } from 'react'
import type { Card } from '../types'
import { CARD_COLORS, CARD_CATEGORIES } from '../types'
import {
  markAsUsed,
  archiveCard,
  reactivateCard,
  updateCard,
} from '../lib/cards'
import { useAuth } from '../hooks/useAuth'

const EMOJIS = ['📋', '📌', '🔥', '⚡', '🎯', '📚', '💡', '🔑', '⚙️', '🧠', '📝', '🚀']

interface Props {
  card: Card
  archived?: boolean
}

export default function CardItem({ card, archived = false }: Props) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [editing, setEditing] = useState(false)

  // Edit form state — populated each time we enter edit mode
  const [editTitle, setEditTitle] = useState(card.title || '')
  const [editText, setEditText] = useState(card.text)
  const [editColor, setEditColor] = useState(card.color)
  const [editEmoji, setEditEmoji] = useState(card.emoji)
  const [editCategory, setEditCategory] = useState(card.category)
  const [savingEdit, setSavingEdit] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(card.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUsed = async () => {
    if (!user) return
    await markAsUsed(user.uid, card.id)
  }

  const handleArchive = async () => {
    if (!user) return
    await archiveCard(user.uid, card.id)
  }

  const handleReactivate = async () => {
    if (!user) return
    await reactivateCard(user.uid, card.id)
  }

  const startEdit = () => {
    setEditTitle(card.title || '')
    setEditText(card.text)
    setEditColor(card.color)
    setEditEmoji(card.emoji)
    setEditCategory(card.category)
    setShowActions(false)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const canSaveEdit = editText.trim().length > 0
  const hasChanges =
    (editTitle.trim() || null) !== card.title ||
    editText.trim() !== card.text ||
    editColor !== card.color ||
    editEmoji !== card.emoji ||
    editCategory !== card.category

  const saveEdit = async () => {
    if (!user || !canSaveEdit) return
    if (!hasChanges) {
      setEditing(false)
      return
    }
    setSavingEdit(true)
    try {
      await updateCard(user.uid, card.id, {
        title: editTitle.trim() || null,
        text: editText.trim(),
        color: editColor,
        emoji: editEmoji,
        category: editCategory,
      })
      setEditing(false)
    } finally {
      setSavingEdit(false)
    }
  }

  // ---------------- EDIT MODE ----------------
  if (editing) {
    return (
      <div
        className="relative bg-surface rounded-2xl border overflow-hidden"
        style={{ borderColor: `${editColor}50` }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: editColor }}
        />

        <div className="pl-4 pr-4 pt-3 pb-3 flex flex-col gap-3">
          {/* Edit header */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Editando
            </span>
            <button
              onClick={cancelEdit}
              disabled={savingEdit}
              className="text-white/30 hover:text-white/60 transition-colors p-1 -mr-1 disabled:opacity-50"
              aria-label="Fechar edição"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Título
            </label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Opcional"
              className="bg-void border border-border rounded-xl px-3 py-2 text-sm font-body text-white/80 placeholder-white/20 focus:outline-none focus:border-teal/40 transition-colors"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Texto *
            </label>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="Texto do card"
              rows={4}
              autoFocus
              className="bg-void border border-border rounded-xl px-3 py-2 text-sm font-body text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors"
            />
          </div>

          {/* Emoji */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEditEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    editEmoji === e
                      ? 'bg-teal/20 border border-teal/50'
                      : 'bg-void border border-border hover:border-white/20'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Cor
            </label>
            <div className="flex gap-2">
              {CARD_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setEditColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    editColor === c.value
                      ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-surface scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              Categoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CARD_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setEditCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all ${
                    editCategory === cat
                      ? 'text-void font-semibold'
                      : 'bg-void border border-border text-white/40 hover:border-white/20'
                  }`}
                  style={editCategory === cat ? { backgroundColor: editColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={cancelEdit}
              disabled={savingEdit}
              className="flex-1 py-2 rounded-xl text-sm font-body font-medium bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={saveEdit}
              disabled={!canSaveEdit || savingEdit}
              className="flex-1 py-2 rounded-xl text-sm font-body font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: editColor, color: '#03080F' }}
            >
              {savingEdit ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- READ MODE ----------------
  return (
    <div
      className="relative bg-surface rounded-2xl border overflow-hidden transition-all duration-200 active:scale-[0.99]"
      style={{ borderColor: `${card.color}30` }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: card.color }}
      />

      {/* Tap-to-edit body */}
      <div
        role="button"
        tabIndex={0}
        onClick={startEdit}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            startEdit()
          }
        }}
        aria-label="Editar card"
        className="pl-4 pr-4 pt-3 pb-3 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal/40 rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none">{card.emoji}</span>
            {card.title && (
              <span className="font-body font-semibold text-sm text-white/80 truncate max-w-[160px]">
                {card.title}
              </span>
            )}
            {card.category && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap"
                style={{
                  color: card.color,
                  borderColor: `${card.color}40`,
                  backgroundColor: `${card.color}10`,
                }}
              >
                {card.category}
              </span>
            )}
          </div>

          <button
            onClick={e => {
              e.stopPropagation()
              setShowActions(v => !v)
            }}
            className="text-white/30 hover:text-white/60 transition-colors p-1 -mr-1"
            aria-label="Mais ações"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>

        {/* Text preview */}
        <p className="font-body text-sm text-white/60 leading-relaxed line-clamp-3 mb-3">
          {card.text}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={e => {
              e.stopPropagation()
              copy()
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-medium transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: copied ? `${card.color}20` : `${card.color}15`,
              color: card.color,
              border: `1px solid ${card.color}30`,
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copiar
              </>
            )}
          </button>

          {/* Status action */}
          {!archived ? (
            <button
              onClick={e => {
                e.stopPropagation()
                handleUsed()
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Usado
            </button>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation()
                handleReactivate()
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium bg-white/5 text-white/40 border border-white/10 hover:border-teal/30 hover:text-teal transition-all active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Reativar
            </button>
          )}
        </div>

        {/* Dropdown actions */}
        {showActions && (
          <div
            className="mt-2 pt-2 border-t border-border flex gap-3 items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={e => {
                e.stopPropagation()
                startEdit()
              }}
              className="text-xs font-body text-white/30 hover:text-teal transition-colors"
            >
              Editar
            </button>
            {!archived && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleArchive()
                }}
                className="text-xs font-body text-white/30 hover:text-amber transition-colors"
              >
                Arquivar
              </button>
            )}
            <button
              onClick={e => {
                e.stopPropagation()
                setShowActions(false)
              }}
              className="text-xs font-body text-white/20 ml-auto"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
