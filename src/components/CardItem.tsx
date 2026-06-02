import { useEffect, useState } from 'react'
import type { Card, Discipline, Importance } from '../types'
import {
  CARD_COLORS,
  CARD_CATEGORIES,
  DISCIPLINES,
  DISCIPLINE_LABELS,
  IMPORTANCE_LEVELS,
} from '../types'
import {
  archiveCard,
  reactivateCard,
  updateCard,
  deleteCard,
  markAsReviewed,
} from '../lib/cards'
import { useAuth } from '../hooks/useAuth'
import { useLongPress } from '../hooks/useLongPress'

const EMOJIS = ['📋', '📌', '🔥', '⚡', '🎯', '📚', '💡', '🔑', '⚙️', '🧠', '📝', '🚀']

interface Props {
  card: Card
  archived?: boolean
  /** When the parent is in multi-selection mode. */
  selectionMode?: boolean
  /** Whether this card is part of the current selection. */
  isSelected?: boolean
  /** Toggle this card in/out of the selection. Long-press also calls this. */
  onToggleSelect?: () => void
  /** Text to highlight in the title and text fields */
  highlight?: string | null
}

function HighlightedText({ text, highlight }: { text: string; highlight?: string | null }) {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  
  try {
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          i % 2 === 1 ? (
            <mark key={i} className="bg-teal/40 text-white rounded-sm px-[2px] bg-opacity-60">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

export default function CardItem({
  card,
  archived = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  highlight,
}: Props) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  // Edit form state — populated each time we enter edit mode
  const [editTitle, setEditTitle] = useState(card.title || '')
  const [editText, setEditText] = useState(card.text)
  const [editColor, setEditColor] = useState(card.color)
  const [editEmoji, setEditEmoji] = useState(card.emoji)
  const [editCategory, setEditCategory] = useState(card.category)
  const [editDiscipline, setEditDiscipline] = useState<Discipline | undefined>(
    card.discipline ?? undefined
  )
  const [editImportance, setEditImportance] = useState<Importance>(card.importance ?? 1)
  const [savingEdit, setSavingEdit] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  // When selection mode turns on, force-close anything that doesn't make sense
  useEffect(() => {
    if (selectionMode) {
      setEditing(false)
      setShowActions(false)
      setConfirmDelete(false)
    }
  }, [selectionMode])

  // ----- Read-mode handlers -----
  const copy = async () => {
    await navigator.clipboard.writeText(card.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleArchive = async () => {
    if (!user) return
    await archiveCard(user.uid, card.id)
  }

  const handleReactivate = async () => {
    if (!user) return
    await reactivateCard(user.uid, card.id)
  }

  const handleDelete = async () => {
    if (!user) return
    setDeleting(true)
    setDeleteError(false)
    try {
      await deleteCard(user.uid, card.id)
    } catch {
      setDeleting(false)
      setDeleteError(true)
    }
  }

  const handleReview = async () => {
    if (!user || reviewing) return
    setReviewing(true)
    try {
      await markAsReviewed(user.uid, card.id)
      setShowActions(false)
    } finally {
      setReviewing(false)
    }
  }

  const closeActions = () => {
    setShowActions(false)
    setConfirmDelete(false)
  }

  const startEdit = () => {
    setEditTitle(card.title || '')
    setEditText(card.text)
    setEditColor(card.color)
    setEditEmoji(card.emoji)
    setEditCategory(card.category)
    setEditDiscipline(card.discipline ?? undefined)
    setEditImportance(card.importance ?? 1)
    setShowActions(false)
    setConfirmDelete(false)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const canSaveEdit = editText.trim().length > 0
  const currentImportance = card.importance ?? 1
  const currentDiscipline = card.discipline ?? undefined
  const hasChanges =
    (editTitle.trim() || null) !== card.title ||
    editText.trim() !== card.text ||
    editColor !== card.color ||
    editEmoji !== card.emoji ||
    editCategory !== card.category ||
    editDiscipline !== currentDiscipline ||
    editImportance !== currentImportance

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
        // Coerce undefined -> null para limpar a matéria explicitamente no Firestore
        // (Firestore não aceita undefined em writes).
        discipline: editDiscipline ?? null,
        importance: editImportance,
      })
      setEditing(false)
    } finally {
      setSavingEdit(false)
    }
  }

  // ----- Tap region: long-press always toggles selection;
  //       a regular tap edits unless we are in selection mode -----
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (onToggleSelect) onToggleSelect()
    },
    onClick: () => {
      if (selectionMode) {
        if (onToggleSelect) onToggleSelect()
      } else {
        startEdit()
      }
    },
  })

  // Stop pointer events from bubbling into the long-press handlers
  // for any inner control that has its own click semantics.
  const stopPointer = {
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
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

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Título</label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Opcional"
              className="bg-void border border-border rounded-xl px-3 py-2 text-sm font-body text-white/80 placeholder-white/20 focus:outline-none focus:border-teal/40 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Texto *</label>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              placeholder="Texto do card"
              rows={4}
              autoFocus
              className="bg-void border border-border rounded-xl px-3 py-2 text-sm font-body text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Emoji</label>
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

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Cor</label>
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

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Categoria</label>
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

          {/* Discipline (matéria do edital) */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Matéria</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setEditDiscipline(undefined)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all ${
                  editDiscipline === undefined
                    ? 'bg-white/10 text-white/80 border border-white/20'
                    : 'bg-void border border-border text-white/40 hover:border-white/20'
                }`}
              >
                Sem matéria
              </button>
              {DISCIPLINES.map(d => (
                <button
                  key={d}
                  onClick={() => setEditDiscipline(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-medium transition-all ${
                    editDiscipline === d
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
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Importância</label>
            <div className="flex gap-1.5">
              {IMPORTANCE_LEVELS.map(lvl => (
                <button
                  key={lvl.value}
                  onClick={() => setEditImportance(lvl.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all flex items-center justify-center gap-1 ${
                    editImportance === lvl.value
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
  const accentColor = card.color
  const borderAlpha = isSelected ? 'CC' : '30'

  return (
    <div
      className="relative bg-surface rounded-2xl border overflow-hidden transition-all duration-200 active:scale-[0.99]"
      style={{ borderColor: `${accentColor}${borderAlpha}` }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative pl-4 pr-4 pt-3 pb-3">
        {/* Top-right: ⋮ menu (read mode) OR check indicator (selection mode) */}
        {selectionMode ? (
          <div
            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all pointer-events-none"
            style={{
              backgroundColor: isSelected ? accentColor : 'transparent',
              border: `1.5px solid ${isSelected ? accentColor : '#FFFFFF40'}`,
            }}
          >
            {isSelected && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#03080F" strokeWidth="3.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </div>
        ) : (
          <button
            {...stopPointer}
            onClick={e => {
              e.stopPropagation()
              setShowActions(v => !v)
              setConfirmDelete(false)
            }}
            className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors p-1"
            aria-label="Mais ações"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        )}

        {/* Tap region — long press toggles selection, click edits/toggles */}
        <div
          role="button"
          tabIndex={0}
          {...longPressHandlers}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (selectionMode) {
                if (onToggleSelect) onToggleSelect()
              } else {
                startEdit()
              }
            }
          }}
          aria-label={selectionMode ? 'Selecionar card' : 'Editar card'}
          className="pr-8 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal/40 rounded-lg select-none"
        >
          {/* Header */}
          <div className="flex items-center gap-2 min-w-0 mb-2 flex-wrap">
            <span className="text-lg leading-none">{card.emoji}</span>
            {(card.importance ?? 1) >= 2 && (
              <span
                className="text-xs leading-none"
                title={
                  card.importance === 3 ? 'Hot topic FCC' : 'Importante'
                }
              >
                {card.importance === 3 ? '🔥' : '★'}
              </span>
            )}
            {card.title && (
              <span className="font-body font-semibold text-sm text-white/80 truncate max-w-[160px]">
                <HighlightedText text={card.title} highlight={highlight} />
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
            {card.discipline && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50 whitespace-nowrap">
                {DISCIPLINE_LABELS[card.discipline]}
              </span>
            )}
          </div>

          {/* Text preview */}
          <p className="font-body text-sm text-white/60 leading-relaxed line-clamp-3">
            <HighlightedText text={card.text} highlight={highlight} />
          </p>
        </div>

        {/* Action row + dropdown — hidden in selection mode */}
        {!selectionMode && (
          <>
            <div className="flex items-center gap-2 mt-3">
              {!archived ? (
                <button
                  {...stopPointer}
                  onClick={e => {
                    e.stopPropagation()
                    handleArchive()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-medium transition-all duration-150 active:scale-95 text-white/50 bg-white/5 border border-white/10 hover:border-teal/30 hover:text-teal hover:bg-teal/10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  Concluir
                </button>
              ) : (
                <button
                  {...stopPointer}
                  onClick={e => {
                    e.stopPropagation()
                    handleReactivate()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-medium transition-all duration-150 active:scale-95 text-white/50 bg-white/5 border border-white/10 hover:border-teal/30 hover:text-teal hover:bg-teal/10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="1,4 1,10 7,10" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                  Reativar
                </button>
              )}
            </div>

            {showActions && (
              <div
                className="mt-2 pt-2 border-t border-border flex gap-3 items-center"
                {...stopPointer}
                onClick={e => e.stopPropagation()}
              >
                {!confirmDelete ? (
                  <>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        copy()
                      }}
                      className="text-xs font-body text-white/30 hover:text-teal transition-colors"
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        startEdit()
                      }}
                      className="text-xs font-body text-white/30 hover:text-teal transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        handleReview()
                      }}
                      disabled={reviewing}
                      className="text-xs font-body text-white/30 hover:text-teal transition-colors disabled:opacity-50"
                      title={
                        card.lastReviewed
                          ? `Revisado ${card.reviewCount ?? 0}x`
                          : 'Marcar revisão'
                      }
                    >
                      {reviewing ? '…' : 'Revisei'}
                    </button>
                    {!archived && (
                      <button
                        {...stopPointer}
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
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        setConfirmDelete(true)
                      }}
                      className="text-xs font-body text-white/30 hover:text-rose-400 transition-colors"
                    >
                      Deletar
                    </button>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        closeActions()
                      }}
                      className="text-xs font-body text-white/20 ml-auto"
                    >
                      Fechar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-body text-white/60">
                      {deleteError ? 'Falha ao apagar. Tente novamente.' : 'Apagar este card?'}
                    </span>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        handleDelete()
                      }}
                      disabled={deleting}
                      className="text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors ml-auto disabled:opacity-50"
                    >
                      {deleting ? 'Apagando...' : 'Confirmar'}
                    </button>
                    <button
                      {...stopPointer}
                      onClick={e => {
                        e.stopPropagation()
                        setConfirmDelete(false)
                      }}
                      disabled={deleting}
                      className="text-xs font-body text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
