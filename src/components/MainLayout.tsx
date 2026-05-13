import { NavLink, Outlet } from 'react-router-dom'
import ConnectivityBanner from './ConnectivityBanner'

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    label: 'Cards',
    short: 'CARDS',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    short: 'DASH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    ),
  },
  {
    to: '/strategy',
    label: 'Estratégia FCC',
    short: 'FCC',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    to: '/reader',
    label: 'Leitor',
    short: 'LEITOR',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    to: '/review',
    label: 'Revisão',
    short: 'REVISÃO',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7.5V17H9v-1.5l-.7-.5A7 7 0 0 1 5 9a7 7 0 0 1 7-7z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
        <line x1="9" y1="19" x2="15" y2="19"/>
      </svg>
    ),
  },
  {
    to: '/semana',
    label: 'Semana',
    short: 'SEMANA',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
]

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-void text-white flex">

      {/* ── Sidebar (desktop lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-56 border-r border-border bg-void z-40">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-border/50">
          <p className="font-display text-xl text-teal tracking-widest">CLIPVAULT</p>
          <p className="font-mono text-[10px] text-white/25 mt-1 tracking-wider uppercase">ALE-RR 2026</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${
                  isActive
                    ? 'bg-teal/10 text-teal'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-teal' : 'text-white/40'}>{item.icon}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer hint */}
        <div className="px-6 py-4 border-t border-border/50">
          <p className="font-mono text-[9px] text-white/15 uppercase tracking-wider">Prova 28/06/2026</p>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col lg:ml-56">
        <ConnectivityBanner />

        {/* Centered content column */}
        <div className="flex-1 pb-[64px] lg:pb-0 lg:max-w-2xl lg:w-full lg:mx-auto">
          <Outlet />
        </div>
      </div>

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-void/95 backdrop-blur border-t border-border flex items-center justify-around px-2 z-40">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-teal' : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-mono tracking-wider">{item.short}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
