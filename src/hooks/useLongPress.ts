import { useCallback, useRef } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'

interface Options {
  onLongPress: () => void
  onClick?: () => void
  delay?: number
  movementThreshold?: number
}

/**
 * Pointer/touch handlers that distinguish a tap from a long press.
 *
 * - Long press fires once after `delay` ms if the pointer hasn't moved more
 *   than `movementThreshold` px.
 * - If the pointer is released before `delay`, `onClick` fires.
 * - If long press fires, the subsequent release does NOT fire `onClick`.
 *
 * Spread the returned object onto the element you want to track.
 */
export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
  movementThreshold = 10,
}: Options) {
  const timerRef = useRef<number | null>(null)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const triggeredRef = useRef(false)

  const start = useCallback(
    (x: number, y: number) => {
      triggeredRef.current = false
      startPosRef.current = { x, y }
      timerRef.current = window.setTimeout(() => {
        triggeredRef.current = true
        timerRef.current = null
        onLongPress()
      }, delay)
    },
    [onLongPress, delay]
  )

  const move = useCallback(
    (x: number, y: number) => {
      if (!startPosRef.current || timerRef.current === null) return
      const dx = x - startPosRef.current.x
      const dy = y - startPosRef.current.y
      if (Math.sqrt(dx * dx + dy * dy) > movementThreshold) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    },
    [movementThreshold]
  )

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const end = useCallback(() => {
    const wasTriggered = triggeredRef.current
    cancel()
    if (!wasTriggered && onClick) onClick()
  }, [cancel, onClick])

  return {
    onTouchStart: (e: ReactTouchEvent) => {
      const t = e.touches[0]
      start(t.clientX, t.clientY)
    },
    onTouchMove: (e: ReactTouchEvent) => {
      const t = e.touches[0]
      move(t.clientX, t.clientY)
    },
    onTouchEnd: end,
    onTouchCancel: cancel,
    onMouseDown: (e: ReactMouseEvent) => {
      // Only the primary mouse button
      if (e.button !== 0) return
      start(e.clientX, e.clientY)
    },
    onMouseMove: (e: ReactMouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: end,
    onMouseLeave: cancel,
  }
}
