import { useEffect, useState } from 'react'
import { subscribeToCards } from '../lib/cards'
import type { Card, CardStatus } from '../types'

export function useCards(uid: string | undefined, status: CardStatus) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const unsub = subscribeToCards(uid, status, data => {
      setCards(data)
      setLoading(false)
    })
    return unsub
  }, [uid, status])

  return { cards, loading }
}
