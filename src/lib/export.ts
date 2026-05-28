import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function exportAllUserData(uid: string): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}

  // 1. Topic progress
  const progressSnap = await getDocs(collection(db, 'users', uid, 'topicProgress'))
  result.topicProgress = Object.fromEntries(progressSnap.docs.map(d => [d.id, d.data()]))

  // 2. Sessions (collection may not exist)
  try {
    const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'))
    result.sessions = sessionsSnap.docs.map(d => d.data())
  } catch {
    result.sessions = []
  }

  // 3. Weekly logs
  try {
    const weeklySnap = await getDocs(collection(db, 'users', uid, 'weeklyLogs'))
    result.weeklyLogs = Object.fromEntries(weeklySnap.docs.map(d => [d.id, d.data()]))
  } catch {
    result.weeklyLogs = {}
  }

  // 4. Cards — metadata only (no text content)
  const cardsSnap = await getDocs(collection(db, 'users', uid, 'cards'))
  const porMateria: Record<string, number> = {}
  cardsSnap.docs.forEach(d => {
    const mat = (d.data().discipline as string) ?? 'outros'
    porMateria[mat] = (porMateria[mat] ?? 0) + 1
  })
  result.cards = { total: cardsSnap.size, porMateria }

  // 5. Imported texts — IDs and titles only
  try {
    const textsSnap = await getDocs(collection(db, 'users', uid, 'texts'))
    result.textos = textsSnap.docs.map(d => ({
      id: d.id,
      titulo: d.data().titulo,
      disciplina: d.data().disciplina,
      totalArtigos: (d.data().artigos as unknown[])?.length ?? 0,
    }))
  } catch {
    result.textos = []
  }

  // 6. Export metadata
  result.meta = {
    exportedAt: new Date().toISOString(),
    uid,
    versao: '1.0',
  }

  return result
}
