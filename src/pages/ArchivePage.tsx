import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import { useSelection } from '../hooks/useSelection'
import { bulkDeleteCards, bulkReactivateCards } from '../lib/cards'
import CardItem from '../components/CardItem'
import SelectionToolbar from '../components/SelectionToolbar'
import { Link } from 'react-router-dom'

export default function ArchivePage() {
  const { user } = useAuth()
  const { cards: usedCards, loading: loadingUsed } = useCards(user?.uid, 'used')
  const { cards: archivedCards, loading: loadingArchived } = useCards(user?.uid, 'archived')
  const selection = useSelection()

  const loading = loadingUsed || loadingArchived
  const allCards = [...usedCards, ...archivedCards]

  const handleBulkDelete = async () => {
    if (!user) return
    await bulkDeleteCards(user.uid, selection.ids)
    selection.exit()
  }

  const handleBulkReactivate = async () => {
    if (!user) return
    await bulkReactivateCards(user.uid, selection.ids)
    selection.exit()
  }

  const handleBulkExport = () => {
    const data = allCards
      .filter(c => selection.isSelected(c.id))
      .map(c => ({
        title: c.title,
        text: c.text,
        color: c.color,
        emoji: c.emoji,
        category: c.category,
      }))
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  return (
    <div className="min-h-screen bg-void text-white">
      <header className="sticky top-0 z-30 bg-void/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-white/40 hover:text-white/70 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </Link>
        <h1 className="font-display text-2xl tracking-wider text-white">ARQUIVO</h1>
      </header>

      <main className={`px-4 pt-4 ${selection.selectionMode ? 'pb-32' : 'pb-12'}`}>
        {loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-surface rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : usedCards.length === 0 && archivedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-8">
            <span className="text-5xl">🗂️</span>
            <p className="font-body text-white/30 text-sm leading-relaxed">
              Nenhum card arquivado ainda.<br />
              Cards marcados como usados aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {usedCards.length > 0 && (
              <section>
                <p className="font-mono text-[11px] text-white/25 uppercase tracking-wider mb-3">
                  Usados · {usedCards.length}
                </p>
                <div className="flex flex-col gap-3">
                  {usedCards.map(card => (
                    <CardItem
                      key={card.id}
                      card={card}
                      archived
                      selectionMode={selection.selectionMode}
                      isSelected={selection.isSelected(card.id)}
                      onToggleSelect={() => selection.toggle(card.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {archivedCards.length > 0 && (
              <section>
                <p className="font-mono text-[11px] text-white/25 uppercase tracking-wider mb-3">
                  Arquivados · {archivedCards.length}
                </p>
                <div className="flex flex-col gap-3">
                  {archivedCards.map(card => (
                    <CardItem
                      key={card.id}
                      card={card}
                      archived
                      selectionMode={selection.selectionMode}
                      isSelected={selection.isSelected(card.id)}
                      onToggleSelect={() => selection.toggle(card.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {selection.selectionMode && (
        <SelectionToolbar
          count={selection.count}
          onCancel={selection.exit}
          onDelete={handleBulkDelete}
          onReactivate={handleBulkReactivate}
          onExport={handleBulkExport}
        />
      )}
    </div>
  )
}
