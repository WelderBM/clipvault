import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useCards } from './useCards'
import type { Discipline } from '../types'
import { DISCIPLINES } from '../types'

export interface ActivityDay {
  date: string // YYYY-MM-DD
  count: number
}

export interface DashboardStats {
  totalCards: number
  activeCards: number
  reviewedCards: number // reviewCount > 0
  cardsByDiscipline: Record<Discipline, number>
  cardsByImportance: Record<number, number>
  activityHeatmap: ActivityDay[]
  loading: boolean
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth()
  // By omitting pageSize, we get the full collection for this user and status.
  const { cards: activeCards, loading: loadingActive } = useCards(user?.uid, 'active')
  const { cards: usedCards, loading: loadingUsed } = useCards(user?.uid, 'used')

  return useMemo(() => {
    const allCards = [...activeCards, ...usedCards]
    const loading = loadingActive || loadingUsed

    const stats: DashboardStats = {
      totalCards: allCards.length,
      activeCards: activeCards.length,
      reviewedCards: allCards.filter(c => (c.reviewCount ?? 0) > 0).length,
      cardsByDiscipline: {} as Record<Discipline, number>,
      cardsByImportance: { 1: 0, 2: 0, 3: 0 },
      activityHeatmap: [],
      loading,
    }

    DISCIPLINES.forEach(d => {
      stats.cardsByDiscipline[d] = 0
    })

    const now = Date.now()
    // Generate last 60 days array
    const last60Days = Array.from({ length: 60 }).map((_, i) => {
      const d = new Date(now - i * 86400000)
      return d.toISOString().split('T')[0]
    }).reverse()

    const activityMap = new Map<string, number>()
    last60Days.forEach(d => activityMap.set(d, 0))

    allCards.forEach(c => {
      if (c.discipline) {
        stats.cardsByDiscipline[c.discipline] = (stats.cardsByDiscipline[c.discipline] || 0) + 1
      }
      const imp = c.importance ?? 1
      if (imp >= 1 && imp <= 3) {
        stats.cardsByImportance[imp]++
      }

      // Heatmap data tracking
      const createdDate = c.createdAt?.toDate?.()?.toISOString().split('T')[0]
      if (createdDate && activityMap.has(createdDate)) {
        activityMap.set(createdDate, activityMap.get(createdDate)! + 1)
      }
      const reviewedDate = c.lastReviewed?.toDate?.()?.toISOString().split('T')[0]
      if (reviewedDate && activityMap.has(reviewedDate)) {
        activityMap.set(reviewedDate, activityMap.get(reviewedDate)! + 1)
      }
    })

    stats.activityHeatmap = last60Days.map(date => ({
      date,
      count: activityMap.get(date)!
    }))

    return stats
  }, [activeCards, usedCards, loadingActive, loadingUsed])
}
