import { useCallback, useMemo, useState } from 'react'

/**
 * Set-based multi-selection state.
 *
 * - `selectionMode` is derived from `count > 0`.
 * - `toggle(id)` adds/removes a single id.
 * - `exit()` clears the entire selection (and therefore exits selection mode).
 * - `ids` is a stable array view of the current selection, useful for bulk ops.
 */
export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const select = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const exit = useCallback(() => {
    setSelected(new Set())
  }, [])

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  const ids = useMemo(() => Array.from(selected), [selected])

  return {
    selected,
    selectionMode: selected.size > 0,
    count: selected.size,
    ids,
    toggle,
    select,
    exit,
    isSelected,
  }
}
