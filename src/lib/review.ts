import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

export interface MindMapNode {
  name: string
  children?: MindMapNode[]
}

export interface TextSection {
  title?: string
  body?: string
  items?: string[]
}

export interface Flashcard {
  id: string
  question: string
  answer: string
}

export interface ClozeItem {
  text: string
  answers: string[]
}

export interface ReviewTable {
  headers: string[]
  rows: string[][]
}

export interface ReviewContent {
  topicId: string
  title: string
  mindMap?: MindMapNode
  text?: { sections: TextSection[] }
  flashcards?: Flashcard[]
  checklist?: string[]
  table?: ReviewTable
  cloze?: ClozeItem[]
  updatedAt?: unknown
}

export function subscribeReviewContent(
  uid: string,
  onData: (content: Record<string, ReviewContent>) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'reviewContent')
  return onSnapshot(ref, (snap) => {
    const result: Record<string, ReviewContent> = {}
    snap.docs.forEach((d) => {
      result[d.id] = d.data() as ReviewContent
    })
    onData(result)
  })
}

export async function setReviewContent(
  uid: string,
  topicId: string,
  content: Omit<ReviewContent, 'topicId' | 'updatedAt'>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'reviewContent', topicId)
  await setDoc(ref, { ...content, topicId, updatedAt: serverTimestamp() })
}

export async function batchSetReviewContent(
  uid: string,
  updates: Record<string, Omit<ReviewContent, 'topicId' | 'updatedAt'>>
): Promise<number> {
  await Promise.all(
    Object.entries(updates).map(([topicId, content]) =>
      setReviewContent(uid, topicId, content)
    )
  )
  return Object.keys(updates).length
}
