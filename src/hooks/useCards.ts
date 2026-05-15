import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  subscribeToCards,
  subscribeToCardsPage,
  fetchCardsPage,
  type CardCursor,
} from '../lib/cards'
import type { Card, CardStatus } from '../types'

export type CardSort = 'recent' | 'urgent'

interface Options {
  /** When set, the hook paginates with cursor (firstpage onSnapshot + extra pages getDocs). */
  pageSize?: number
  /** Client-side resort over the loaded set. */
  sort?: CardSort
}

interface Result {
  cards: Card[]
  loading: boolean
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => Promise<void>
}

/**
 * Urgency score — higher = more urgent.
 *
 * Formula: importance * log1p(daysSince(lastReviewed ?? createdAt))
 *
 * - importance 1 (normal) | 2 (importante) | 3 (hot FCC) — multiplica o decay temporal.
 * - lastReviewed quando presente "zera" o relógio na revisão; senão cai pra createdAt.
 * - log1p suaviza p/ que cards muito antigos não dominem absurdamente.
 *
 * NOTE: este sort roda sobre o set *carregado*. Cards em páginas ainda não-carregadas
 * podem ter score maior; usuários podem precisar dar load-more pra ver tudo no topo.
 */
function urgencyScore(card: Card): number {
  const importance = card.importance ?? 1
  const lastTouchMs =
    card.lastReviewed?.toMillis?.() ?? card.createdAt?.toMillis?.() ?? 0
  const daysSince = Math.min(7, Math.max(0, (Date.now() - lastTouchMs) / 86_400_000))
  return importance * Math.log1p(daysSince)
}

export function useCards(
  uid: string | undefined,
  status: CardStatus,
  opts?: Options
): Result {
  const pageSize = opts?.pageSize
  const sort = opts?.sort ?? 'recent'
  const paginated = typeof pageSize === 'number'

  const [firstPage, setFirstPage] = useState<Card[]>([])
  const [extraPages, setExtraPages] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Cursors:
  //  - firstPageCursor: last doc of the live first page (moves with onSnapshot updates)
  //  - extraCursor:     last doc consumed for pagination — moves only on loadMore
  const firstPageCursor = useRef<CardCursor | null>(null)
  const extraCursor = useRef<CardCursor | null>(null)
  const hasLoadedExtra = useRef(false)

  // ---- Non-paginated mode (full subscription) ----
  useEffect(() => {
    if (paginated || !uid) return
    setLoading(true)
    const unsub = subscribeToCards(uid, status, data => {
      setFirstPage(data)
      setLoading(false)
    })
    return unsub
  }, [paginated, uid, status])

  // ---- Paginated mode: subscribe to first page ----
  useEffect(() => {
    if (!paginated || !uid || !pageSize) return
    setLoading(true)
    setFirstPage([])
    setExtraPages([])
    setHasMore(true)
    firstPageCursor.current = null
    extraCursor.current = null
    hasLoadedExtra.current = false

    const unsub = subscribeToCardsPage(uid, status, pageSize, (cards, lastDoc) => {
      setFirstPage(cards)
      firstPageCursor.current = lastDoc
      // Only snap the load-more cursor to the first page while no extra pages exist.
      // Once the user has loaded more, that cursor is owned by loadMore().
      if (!hasLoadedExtra.current) {
        extraCursor.current = lastDoc
        setHasMore(cards.length === pageSize)
      }
      setLoading(false)
    })
    return unsub
  }, [paginated, uid, status, pageSize])

  // ---- loadMore ----
  const loadMore = useCallback(async () => {
    if (
      !paginated ||
      !uid ||
      !pageSize ||
      isLoadingMore ||
      !hasMore ||
      !extraCursor.current
    ) {
      return
    }
    setIsLoadingMore(true)
    try {
      const { cards, lastDoc } = await fetchCardsPage(
        uid,
        status,
        pageSize,
        extraCursor.current
      )
      hasLoadedExtra.current = true
      setExtraPages(prev => [...prev, ...cards])
      if (lastDoc) extraCursor.current = lastDoc
      setHasMore(cards.length === pageSize)
    } finally {
      setIsLoadingMore(false)
    }
  }, [paginated, uid, status, pageSize, isLoadingMore, hasMore])

  // ---- Combine + dedup + sort ----
  const cards = useMemo(() => {
    if (!paginated) {
      // Non-paginated: just the first page (which is the full collection here).
      const base = firstPage
      return sort === 'urgent'
        ? [...base].sort((a, b) => urgencyScore(b) - urgencyScore(a))
        : base
    }
    // First-page wins on id conflicts (real-time data takes priority over cached extras).
    const seen = new Set<string>()
    const merged: Card[] = []
    for (const c of firstPage) {
      seen.add(c.id)
      merged.push(c)
    }
    for (const c of extraPages) {
      if (!seen.has(c.id)) {
        seen.add(c.id)
        merged.push(c)
      }
    }
    return sort === 'urgent'
      ? [...merged].sort((a, b) => urgencyScore(b) - urgencyScore(a))
      : merged
  }, [paginated, firstPage, extraPages, sort])

  return {
    cards,
    loading,
    hasMore: paginated ? hasMore : false,
    isLoadingMore,
    loadMore,
  }
}
