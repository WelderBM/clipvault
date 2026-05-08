import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCards, type CardSort } from '../hooks/useCards'
import { useSelection } from '../hooks/useSelection'
import { useFilteredCards, type Filters } from '../hooks/useFilteredCards'
import type { Discipline, Importance } from '../types'
import { bulkArchiveCards, bulkDeleteCards } from '../lib/cards'
import CardItem from '../components/CardItem'
import CreateCardSheet from '../components/CreateCardSheet'
import ImportCardsSheet from '../components/ImportCardsSheet'
import SelectionToolbar from '../components/SelectionToolbar'
import FilterBar from '../components/FilterBar'
import { Link } from 'react-router-dom'

const PAGE_SIZE = 20

export default function HomePage() {
  const { user, logout } = useAuth()
  const [sort, setSort] = useState<CardSort>('recent')
  const { cards, loading, hasMore, isLoadingMore, loadMore } = useCards(
    user?.uid,
    'active',
    { pageSize: PAGE_SIZE, sort }
  )
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const selection = useSelection()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<Filters>({
    search: '',
    disciplines: new Set<Discipline>(),
    importance: new Set<Importance>(),
    hotOnly: false,
  })

  const filteredCards = useFilteredCards(cards, filters)

  // Infinite scroll: when the sentinel scrolls into view, fetch the next page.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: '300px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadMore, cards.length])

  const handleBulkDelete = async () => {
    if (!user) return
    await bulkDeleteCards(user.uid, selection.ids)
    selection.exit()
  }

  const handleBulkArchive = async () => {
    if (!user) return
    await bulkArchiveCards(user.uid, selection.ids)
    selection.exit()
  }

  const handleBulkExport = () => {
    const data = filteredCards
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
      {/* Header */}
      <header className="sticky top-0 z-30 bg-void/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wider text-white">CLIPVAULT</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Importar
          </button>
          <Link
            to="/archive"
            className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Arquivo
          </Link>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full overflow-hidden border border-border hover:border-white/30 transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center text-xs text-white/40">
                {user?.displayName?.[0]}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={`px-4 pt-4 ${selection.selectionMode ? 'pb-32' : 'pb-28'}`}>
        {!selection.selectionMode && (
          <FilterBar filters={filters} setFilters={setFilters} />
        )}

        {loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-surface rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-8">
            <span className="text-5xl">📋</span>
            <p className="font-body text-white/30 text-sm leading-relaxed">
              {cards.length === 0 ? (
                <>Nenhum card ativo ainda.<br />Toca no <strong className="text-white/50">+</strong> para adicionar o primeiro.</>
              ) : (
                <>Nenhum card encontrado com esses filtros.</>
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Count + sort toggle */}
            <div className="flex items-center justify-between mb-1 gap-3">
              <p className="font-mono text-[11px] text-white/25 uppercase tracking-wider">
                {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
                {selection.selectionMode && (
                  <>  ·  <span className="text-teal/80">segure pra adicionar à seleção</span></>
                )}
              </p>
              {!selection.selectionMode && (
                <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
                  <button
                    onClick={() => setSort('recent')}
                    aria-pressed={sort === 'recent'}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all ${
                      sort === 'recent'
                        ? 'bg-teal/20 text-teal'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    Recente
                  </button>
                  <button
                    onClick={() => setSort('urgent')}
                    aria-pressed={sort === 'urgent'}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all ${
                      sort === 'urgent'
                        ? 'bg-amber/20 text-amber'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    Urgente
                  </button>
                </div>
              )}
            </div>

            {filteredCards.map(card => (
              <CardItem
                key={card.id}
                card={card}
                selectionMode={selection.selectionMode}
                isSelected={selection.isSelected(card.id)}
                onToggleSelect={() => selection.toggle(card.id)}
                highlight={filters.search}
              />
            ))}

            {/* Infinite-scroll sentinel + status */}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-4 font-mono text-[11px] text-white/30 uppercase tracking-wider"
              >
                {isLoadingMore ? 'Carregando...' : ' '}
              </div>
            ) : cards.length >= PAGE_SIZE ? (
              <div className="flex items-center justify-center py-4 font-mono text-[11px] text-white/20 uppercase tracking-wider">
                · fim ·
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* FAB — hidden in selection mode */}
      {!selection.selectionMode && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-4 w-14 h-14 bg-teal text-void rounded-2xl flex items-center justify-center shadow-lg shadow-teal/20 hover:bg-teal-dim transition-all active:scale-95 z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      {/* Bulk actions toolbar */}
      {selection.selectionMode && (
        <SelectionToolbar
          count={selection.count}
          onCancel={selection.exit}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          onExport={handleBulkExport}
        />
      )}

      {showCreate && <CreateCardSheet onClose={() => setShowCreate(false)} />}
      {showImport && <ImportCardsSheet onClose={() => setShowImport(false)} />}
    </div>
  )
}
