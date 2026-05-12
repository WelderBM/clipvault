import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { TopicState } from '../data/edital_topics'

const STATE_ORDER: TopicState[] = ['unseen', 'seen', 'practiced', 'confident']

export interface TopicProgress {
  topicId: string
  state: TopicState
  updatedAt: unknown // Firestore Timestamp (server)
}

export function subscribeTopicProgress(
  uid: string,
  onData: (progress: Record<string, TopicState>) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'topicProgress')
  return onSnapshot(ref, (snap) => {
    const result: Record<string, TopicState> = {}
    snap.docs.forEach((d) => {
      const data = d.data() as TopicProgress
      result[d.id] = data.state
    })
    onData(result)
  })
}

export async function setTopicProgress(
  uid: string,
  topicId: string,
  state: TopicState
): Promise<void> {
  const ref = doc(db, 'users', uid, 'topicProgress', topicId)
  await setDoc(ref, { topicId, state, updatedAt: serverTimestamp() }, { merge: true })
}

export async function batchSetTopicProgress(
  uid: string,
  updates: Record<string, TopicState>,
  mode: 'merge' | 'replace',
  current: Record<string, TopicState>
): Promise<{ applied: number; skipped: number }> {
  let applied = 0
  let skipped = 0
  await Promise.all(
    Object.entries(updates).map(async ([topicId, newState]) => {
      const currentState = current[topicId] ?? 'unseen'
      if (mode === 'merge' && STATE_ORDER.indexOf(newState) <= STATE_ORDER.indexOf(currentState)) {
        skipped++
        return
      }
      await setTopicProgress(uid, topicId, newState)
      applied++
    })
  )
  return { applied, skipped }
}
