import { useMemo } from 'react'
import type { Card, Discipline, Importance } from '../types'

export interface Filters {
  search: string
  disciplines: Set<Discipline>
  importance: Set<Importance>
  hotOnly: boolean
}

export function useFilteredCards(cards: Card[], filters: Filters) {
  return useMemo(() => {
    return cards.filter(c => {
      if (filters.disciplines.size > 0 && (!c.discipline || !filters.disciplines.has(c.discipline))) return false
      if (filters.importance.size > 0 && !filters.importance.has(c.importance ?? 1)) return false
      if (filters.hotOnly && c.importance !== 3) return false
      if (filters.search) {
        const q = filters.search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const title = (c.title ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const text = c.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const haystack = `${title} ${text}`
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [cards, filters])
}
