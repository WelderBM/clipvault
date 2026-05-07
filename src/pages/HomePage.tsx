import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import CardItem from '../components/CardItem'
import CreateCardSheet from '../components/CreateCardSheet'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { user, logout } = useAuth()
  const { cards, loading } = useCards(user?.uid, 'active')
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="min-h-screen bg-void text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-void/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wider text-white">CLIPVAULT</h1>
        <div className="flex items-center gap-3">
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
      <main className="px-4 pt-4 pb-28">
        {loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-surface rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-8">
            <span className="text-5xl">📋</span>
            <p className="font-body text-white/30 text-sm leading-relaxed">
              Nenhum card ativo ainda.<br />
              Toca no <strong className="text-white/50">+</strong> para adicionar o primeiro.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] text-white/25 uppercase tracking-wider mb-1">
              {cards.length} card{cards.length !== 1 ? 's' : ''} ativo{cards.length !== 1 ? 's' : ''}
            </p>
            {cards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-4 w-14 h-14 bg-teal text-void rounded-2xl flex items-center justify-center shadow-lg shadow-teal/20 hover:bg-teal-dim transition-all active:scale-95 z-30"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {showCreate && <CreateCardSheet onClose={() => setShowCreate(false)} />}
    </div>
  )
}
