import { Outlet, NavLink } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-void text-white flex flex-col">
      <div className="flex-1 pb-[64px]">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-void/95 backdrop-blur border-t border-border flex items-center justify-around px-2 z-40">
        <NavLink 
          to="/" 
          end
          className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-teal' : 'text-white/40 hover:text-white/70'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span className="text-[10px] font-mono tracking-wider">CARDS</span>
        </NavLink>
        
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-teal' : 'text-white/40 hover:text-white/70'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
          <span className="text-[10px] font-mono tracking-wider">DASH</span>
        </NavLink>

        <NavLink 
          to="/strategy" 
          className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-teal' : 'text-white/40 hover:text-white/70'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <span className="text-[10px] font-mono tracking-wider">FCC</span>
        </NavLink>

        <NavLink 
          to="/reader" 
          className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-teal' : 'text-white/40 hover:text-white/70'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span className="text-[10px] font-mono tracking-wider">LEITOR</span>
        </NavLink>
      </nav>
    </div>
  )
}
