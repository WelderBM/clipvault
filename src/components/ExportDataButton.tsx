import { useState } from 'react'
import { exportAllUserData } from '../lib/export'
import { useAuth } from '../hooks/useAuth'

export default function ExportDataButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!user) return
    setLoading(true)
    try {
      const data = await exportAllUserData(user.uid)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clipvault-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="p-2 text-white/30 hover:text-white/60 transition-colors disabled:opacity-40"
      aria-label="Exportar dados para Claude"
      title="Exportar snapshot para o Claude"
    >
      {loading ? (
        <div className="w-[18px] h-[18px] border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
    </button>
  )
}
