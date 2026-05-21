import { useMemo, useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useCards } from './useCards'
import { subscribeTopicProgress, calcRetentionScore, type TopicProgress } from '../lib/progress'
import { EDITAL_TOPICS } from '../data/edital_topics'
import type { Discipline } from '../types'
import { DISCIPLINES } from '../types'

export interface ActivityDay {
  date: string // YYYY-MM-DD
  count: number
}

export interface DisciplineCoverage {
  discipline: Discipline
  total: number
  seen: number        // score > 0 (ever studied)
  practiced: number   // score ≥ 0.55
  confident: number   // score ≥ 0.80
  pct: number         // mean retention score for discipline
}

export interface DashboardStats {
  totalCards: number
  activeCards: number
  reviewedCards: number
  cardsByDiscipline: Record<Discipline, number>
  topicProgress: Record<string, TopicProgress>
  retentionScores: Record<string, number>
  needsReview: string[]   // topicIds with score < 0.30
  disciplineCoverage: DisciplineCoverage[]
  activityHeatmap: ActivityDay[]
  loading: boolean
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth()
  const { cards: activeCards, loading: loadingActive } = useCards(user?.uid, 'active')
  const { cards: archivedCards, loading: loadingArchived } = useCards(user?.uid, 'archived')
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({})
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

  // Memo 1: card-derived stats
  const cardStats = useMemo(() => {
    const allCards = [...activeCards, ...archivedCards]
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

    return {
      totalCards: allCards.length,
      activeCount: activeCards.length,
      reviewedCards: allCards.filter(c => (c.reviewCount ?? 0) > 0).length,
      cardsByDiscipline,
      activityHeatmap: last60Days.map(date => ({ date, count: activityMap.get(date)! })),
    }
  }, [activeCards, archivedCards])

  // Memo 2: retention scores + coverage (recalculates only when topicProgress changes)
  const { retentionScores, needsReview, disciplineCoverage } = useMemo(() => {
    const now = new Date()
    const scores: Record<string, number> = {}
    const needs: string[] = []

    for (const [id, prog] of Object.entries(topicProgress)) {
      const score = calcRetentionScore(prog.lastSessionType, prog.lastStudiedAt.toDate(), now)
      scores[id] = score
      if (score < 0.30) needs.push(id)
    }

    const coverage: DisciplineCoverage[] = DISCIPLINES
      .filter(d => d !== 'historia' && d !== 'geografia')
      .map(d => {
        const topics = EDITAL_TOPICS.filter(t => t.discipline === d)
        const total = topics.length
        let seen = 0, practiced = 0, confident = 0, scoreSum = 0
        topics.forEach(t => {
          const score = scores[t.id]
          if (score === undefined) return
          scoreSum += score
          seen++
          if (score >= 0.55) practiced++
          if (score >= 0.80) confident++
        })
        const pct = total > 0 ? scoreSum / total : 0
        return { discipline: d, total, seen, practiced, confident, pct }
      })

    return { retentionScores: scores, needsReview: needs, disciplineCoverage: coverage }
  }, [topicProgress])

  return useMemo(() => ({
    totalCards: cardStats.totalCards,
    activeCards: cardStats.activeCount,
    reviewedCards: cardStats.reviewedCards,
    cardsByDiscipline: cardStats.cardsByDiscipline,
    activityHeatmap: cardStats.activityHeatmap,
    topicProgress,
    retentionScores,
    needsReview,
    disciplineCoverage,
    loading: loadingActive || loadingArchived || loadingProgress,
  }), [cardStats, topicProgress, retentionScores, needsReview, disciplineCoverage, loadingActive, loadingArchived, loadingProgress])
}
