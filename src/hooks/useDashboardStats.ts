import { useMemo, useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useCards } from './useCards'
import { subscribeTopicProgress } from '../lib/progress'
import { EDITAL_TOPICS, type TopicState } from '../data/edital_topics'
import { FCC_WEIGHTS } from '../data/strategy'
import type { Discipline } from '../types'
import { DISCIPLINES } from '../types'

export interface ActivityDay {
  date: string // YYYY-MM-DD
  count: number
}

export interface DisciplineCoverage {
  discipline: Discipline
  total: number       // total topics in this discipline
  seen: number        // seen + practiced + confident
  practiced: number   // practiced + confident
  confident: number   // confident only
  pct: number         // confident / total (0-1), used for radar
}

export interface DashboardStats {
  totalCards: number
  activeCards: number
  reviewedCards: number
  cardsByDiscipline: Record<Discipline, number>
  topicProgress: Record<string, TopicState>
  disciplineCoverage: DisciplineCoverage[]
  activityHeatmap: ActivityDay[]
  loading: boolean
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth()
  const { cards: activeCards, loading: loadingActive } = useCards(user?.uid, 'active')
  const { cards: archivedCards, loading: loadingArchived } = useCards(user?.uid, 'archived')
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicState>>({})
  const [loadingProgress, setLoadingProgress] = useState(true)

  useEffect(() => {
    if (!user) {
      setTopicProgress({})
      setLoadingProgress(false)
      return
    }
    setLoadingProgress(true)
    const unsub = subscribeTopicProgress(user.uid, (data) => {
      setTopicProgress(data)
      setLoadingProgress(false)
    })
    return unsub
  }, [user])

  return useMemo(() => {
    const allCards = [...activeCards, ...archivedCards]
    const loading = loadingActive || loadingArchived || loadingProgress

    const cardsByDiscipline: Record<Discipline, number> = {} as Record<Discipline, number>
    DISCIPLINES.forEach(d => { cardsByDiscipline[d] = 0 })

    const now = Date.now()
    const last60Days = Array.from({ length: 60 }).map((_, i) => {
      const d = new Date(now - i * 86400000)
      return d.toISOString().split('T')[0]
    }).reverse()

    const activityMap = new Map<string, number>()
    last60Days.forEach(d => activityMap.set(d, 0))

    allCards.forEach(c => {
      if (c.discipline) {
        cardsByDiscipline[c.discipline] = (cardsByDiscipline[c.discipline] || 0) + 1
      }
      const createdDate = c.createdAt?.toDate?.()?.toISOString().split('T')[0]
      if (createdDate && activityMap.has(createdDate)) {
        activityMap.set(createdDate, activityMap.get(createdDate)! + 1)
      }
      const reviewedDate = c.lastReviewed?.toDate?.()?.toISOString().split('T')[0]
      if (reviewedDate && activityMap.has(reviewedDate)) {
        activityMap.set(reviewedDate, activityMap.get(reviewedDate)! + 1)
      }
    })

    // Build coverage per discipline based on topic progress
    const disciplineCoverage: DisciplineCoverage[] = DISCIPLINES.filter(
      d => d !== 'historia' && d !== 'geografia' // minor disciplines, keep in list but not radar
    ).map(d => {
      const topics = EDITAL_TOPICS.filter(t => t.discipline === d)
      const total = topics.length
      let seen = 0, practiced = 0, confident = 0
      topics.forEach(t => {
        const state = topicProgress[t.id]
        if (state === 'seen') seen++
        else if (state === 'practiced') { seen++; practiced++ }
        else if (state === 'confident') { seen++; practiced++; confident++ }
      })
      const fccWeight = FCC_WEIGHTS[d] ?? 0
      // pct: weighted score: unseen=0, seen=0.33, practiced=0.67, confident=1.0
      const rawScore = topics.reduce((acc, t) => {
        const state = topicProgress[t.id] ?? 'unseen'
        const scores = { unseen: 0, seen: 0.33, practiced: 0.67, confident: 1 }
        return acc + scores[state]
      }, 0)
      const pct = total > 0 ? rawScore / total : 0
      return { discipline: d, total, seen, practiced, confident, pct, fccWeight } as DisciplineCoverage & { fccWeight: number }
    }) as DisciplineCoverage[]

    return {
      totalCards: allCards.length,
      activeCards: activeCards.length,
      reviewedCards: allCards.filter(c => (c.reviewCount ?? 0) > 0).length,
      cardsByDiscipline,
      topicProgress,
      disciplineCoverage,
      activityHeatmap: last60Days.map(date => ({ date, count: activityMap.get(date)! })),
      loading,
    }
  }, [activeCards, archivedCards, loadingActive, loadingArchived, topicProgress, loadingProgress])
}
