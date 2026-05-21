import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

export type SessionType =
  | 'seen'          // Viu o conteúdo — leitura/aula
  | 'socratic'      // Sessão socrática — construção ativa
  | 'questions'     // Questões com acerto ≥ 60%
  | 'questions_ok'  // Questões com acerto ≥ 80%
  | 'confident'     // Marcou como dominado manualmente

export interface TopicProgress {
  topicId: string
  lastSessionType: SessionType
  lastStudiedAt: Timestamp
  sessionCount: number
  updatedAt: unknown
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  seen:         'Vi o conteúdo',
  socratic:     'Sessão socrática',
  questions:    'Questões (≥60%)',
  questions_ok: 'Questões (≥80%)',
  confident:    'Dominei',
}

export const SESSION_TYPE_SHORT: Record<SessionType, string> = {
  seen:         'Visto',
  socratic:     'Socrática',
  questions:    'Questões',
  questions_ok: 'Questões ✓',
  confident:    'Dominado',
}

// Meia-vida em dias por tipo de sessão
export const HALF_LIFE_DAYS: Record<SessionType, number> = {
  seen:         2,
  socratic:     5,
  questions:    10,
  questions_ok: 18,
  confident:    30,
}

export function calcRetentionScore(
  lastSessionType: SessionType,
  lastStudiedAt: Date,
  now: Date = new Date()
): number {
  const daysSince = (now.getTime() - lastStudiedAt.getTime()) / 86_400_000
  const halfLife = HALF_LIFE_DAYS[lastSessionType]
  return Math.pow(0.5, daysSince / halfLife)
}

export function getRetentionLabel(score: number): {
  label: string
  color: string
  dot: string
  needsReview: boolean
} {
  if (score >= 0.80) return { label: 'Fresco',     color: 'text-teal',     dot: 'bg-teal',                        needsReview: false }
  if (score >= 0.55) return { label: 'Bom',        color: 'text-sky-400',  dot: 'bg-sky-400',                     needsReview: false }
  if (score >= 0.30) return { label: 'Esquecendo', color: 'text-amber',    dot: 'bg-amber animate-pulse',         needsReview: true  }
  return                     { label: 'Esquecido',  color: 'text-rose-400', dot: 'bg-rose-400 animate-pulse',      needsReview: true  }
}

// Maps legacy TopicState strings → SessionType
export function legacyStateToSessionType(state: string): SessionType {
  const map: Record<string, SessionType> = {
    unseen:    'seen',
    seen:      'seen',
    practiced: 'questions',
    confident: 'confident',
  }
  return map[state] ?? 'seen'
}

// Normalizes a Firestore doc to TopicProgress, handling legacy format
function normalizeDoc(id: string, data: Record<string, unknown>): TopicProgress {
  if (data.lastSessionType) return data as unknown as TopicProgress
  // Legacy: { state: TopicState, updatedAt }
  const legacyState = (data.state as string) ?? 'seen'
  return {
    topicId: id,
    lastSessionType: legacyStateToSessionType(legacyState),
    lastStudiedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
    sessionCount: 1,
    updatedAt: data.updatedAt,
  }
}

export function subscribeTopicProgress(
  uid: string,
  onData: (progress: Record<string, TopicProgress>) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'topicProgress')
  return onSnapshot(ref, (snap) => {
    const result: Record<string, TopicProgress> = {}
    snap.docs.forEach((d) => {
      result[d.id] = normalizeDoc(d.id, d.data() as Record<string, unknown>)
    })
    onData(result)
  })
}

export async function setTopicProgress(
  uid: string,
  topicId: string,
  sessionType: SessionType,
  lastStudiedAt?: Date
): Promise<void> {
  const ref = doc(db, 'users', uid, 'topicProgress', topicId)
  const snap = await getDoc(ref)
  const current = snap.exists() ? (snap.data() as { sessionCount?: number }) : null
  await setDoc(ref, {
    topicId,
    lastSessionType: sessionType,
    lastStudiedAt: lastStudiedAt ? Timestamp.fromDate(lastStudiedAt) : Timestamp.now(),
    sessionCount: (current?.sessionCount ?? 0) + 1,
    updatedAt: serverTimestamp(),
  })
}

export interface ProgressUpdateEntry {
  sessionType: SessionType
  lastStudiedAt?: Date
}

export async function batchSetTopicProgress(
  uid: string,
  updates: Record<string, ProgressUpdateEntry>
): Promise<{ applied: number; skipped: number }> {
  await Promise.all(
    Object.entries(updates).map(([topicId, entry]) =>
      setTopicProgress(uid, topicId, entry.sessionType, entry.lastStudiedAt)
    )
  )
  return { applied: Object.keys(updates).length, skipped: 0 }
}
