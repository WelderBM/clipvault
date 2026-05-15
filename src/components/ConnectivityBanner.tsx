import { useState, useEffect } from 'react'
import { WifiOff, Database } from 'lucide-react'

// Module-level ref avoids localStorage (throws in incognito / strict privacy)
const lastOnlineRef = { value: Date.now() }

export default function ConnectivityBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnline, setLastOnline] = useState<number | null>(() => lastOnlineRef.value)

  useEffect(() => {
    if (isOnline) {
      const now = Date.now()
      lastOnlineRef.value = now
      setLastOnline(now)
    }
  }, [isOnline])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update time interval periodically while offline
    let interval: number
    if (!isOnline) {
      interval = window.setInterval(() => {
        // Force re-render to update the "X min/hours ago"
        setLastOnline(prev => prev)
      }, 60000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (interval) clearInterval(interval)
    }
  }, [isOnline])

  if (isOnline) return null

  let timeAgoStr = ''
  if (lastOnline) {
    const diffMs = Date.now() - lastOnline
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) timeAgoStr = 'agora mesmo'
    else if (diffMins < 60) timeAgoStr = `${diffMins}m atrás`
    else timeAgoStr = `${diffHours}h atrás`
  }

  return (
    <div className="bg-amber/90 text-void px-4 py-2 flex items-center justify-center space-x-2 text-sm font-medium sticky top-0 z-50">
      <WifiOff className="w-4 h-4" />
      <span>Offline · cache de {timeAgoStr || 'desconhecido'}</span>
      <Database className="w-4 h-4 ml-2" />
    </div>
  )
}
