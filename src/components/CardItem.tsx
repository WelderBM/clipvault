import { useState } from 'react'
import type { Card } from '../types'
import { markAsUsed, archiveCard, reactivateCard } from '../lib/cards'
import { useAuth } from '../hooks/useAuth'

interface Props {
  card: Card
  archived?: boolean
}

export default function CardItem({ card, archived = false }: Props) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

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

  return (
    <div
      className="relative bg-surface rounded-2xl border overflow-hidden transition-all duration-200 active:scale-[0.99]"
      style={{ borderColor: `${card.color}30` }}
    >
      {/* Color accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: card.color }} />

      <div className="pl-4 pr-4 pt-3 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{card.emoji}</span>
            {card.title && (
              <span className="font-body font-semibold text-sm text-white/80 truncate max-w-[160px]">
                {card.title}
              </span>
            )}
            {card.category && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                style={{ color: card.color, borderColor: `${card.color}40`, backgroundColor: `${card.color}10` }}
              >
                {card.category}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowActions(v => !v)}
            className="text-white/30 hover:text-white/60 transition-colors p-1 -mr-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>

        {/* Text preview */}
        <p className="font-body text-sm text-white/60 leading-relaxed line-clamp-3 mb-3">
          {card.text}
        </p>

        {/* Actions row */}
        <div className="flex items-center gap-2">
          {/* Copy button — primary action */}
          <button
            onClick={copy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-medium transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: copied ? `${card.color}20` : `${card.color}15`,
              color: card.color,
              border: `1px solid ${card.color}30`
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copiar
              </>
            )}
          </button>

          {/* Status action */}
          {!archived ? (
            <button
              onClick={handleUsed}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Usado
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium bg-white/5 text-white/40 border border-white/10 hover:border-teal/30 hover:text-teal transition-all active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Reativar
            </button>
          )}
        </div>

        {/* Dropdown actions */}
        {showActions && (
          <div className="mt-2 pt-2 border-t border-border flex gap-2">
            {!archived && (
              <button
                onClick={handleArchive}
                className="text-xs font-body text-white/30 hover:text-amber transition-colors"
              >
                Arquivar
              </button>
            )}
            <button
              onClick={() => setShowActions(false)}
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
