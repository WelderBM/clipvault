import { useEffect, useState } from 'react'
import { subscribeTextos, type TextoOficial } from '../lib/texts'
import type { Discipline } from '../types'

export function useTextos(uid: string | undefined) {
  const [textos, setTextos] = useState<TextoOficial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setTextos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeTextos(uid, data => {
      setTextos(data)
      setLoading(false)
    })
    return unsub
  }, [uid])

  const byDiscipline = textos.reduce<Partial<Record<Discipline, TextoOficial[]>>>(
    (acc, t) => {
      if (!acc[t.disciplina]) acc[t.disciplina] = []
      acc[t.disciplina]!.push(t)
      return acc
    },
    {}
  )

  return { textos, byDiscipline, loading }
}
