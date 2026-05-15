import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Discipline } from '../types'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Segunda', tue: 'Terça', wed: 'Quarta',
  thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo',
}

const JS_DAY_TO_KEY: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export interface WeeklyEntry {
  id?: string        // crypto.randomUUID() — ausente em entradas antigas
  date: string       // "2026-05-12"
  dayKey: DayKey
  discipline: Discipline
  topicIds: string[]
  note?: string
}

export interface WeeklyLog {
  weekKey: string
  entries: WeeklyEntry[]
}

export function getDayKey(date: Date): DayKey {
  return JS_DAY_TO_KEY[date.getUTCDay()]
}

export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const year = d.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function getWeekDays(weekKey: string): Date[] {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return d
  })
}

export function formatDateStr(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function subscribeWeeklyLogs(
  uid: string,
  onData: (logs: Record<string, WeeklyLog>) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'weeklyLog')
  return onSnapshot(ref, snap => {
    const result: Record<string, WeeklyLog> = {}
    snap.docs.forEach(d => { result[d.id] = d.data() as WeeklyLog })
    onData(result)
  })
}

export async function saveWeeklyLog(uid: string, weekKey: string, entries: WeeklyEntry[]): Promise<void> {
  const ref = doc(db, 'users', uid, 'weeklyLog', weekKey)
  await setDoc(ref, { weekKey, entries })
}

export async function importWeeklyLogs(
  uid: string,
  data: Record<string, { entries: Omit<WeeklyEntry, 'dayKey'>[] }>
): Promise<string[]> {
  const allTopicIds: string[] = []
  await Promise.all(Object.entries(data).map(async ([weekKey, log]) => {
    const entries: WeeklyEntry[] = log.entries.map(e => ({
      ...e,
      dayKey: getDayKey(new Date(e.date + 'T12:00:00Z')),
    }))
    await saveWeeklyLog(uid, weekKey, entries)
    allTopicIds.push(...entries.flatMap(e => e.topicIds))
  }))
  return [...new Set(allTopicIds)]
}
