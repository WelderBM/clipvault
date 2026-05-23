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
      const sorted = [...data].sort((a, b) =>
        a.disciplina.localeCompare(b.disciplina) || a.ordem - b.ordem
      )
      setTextos(sorted)
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

  // grupoId → partes ordenadas por grupoParte; textos sem grupo usam id como chave
  const byGroup = textos.reduce<Record<string, TextoOficial[]>>((acc, t) => {
    const key = t.grupoId ?? t.id
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})
  Object.values(byGroup).forEach(parts =>
    parts.sort((a, b) => (a.grupoParte ?? 0) - (b.grupoParte ?? 0))
  )

  return { textos, byDiscipline, byGroup, loading }
}
