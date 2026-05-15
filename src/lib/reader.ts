import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Timestamp } from 'firebase/firestore'

export type HighlightColor = 'yellow' | 'orange' | 'red'

export interface Highlight {
  id: string
  articleId: string // e.g., "art-45"
  text: string
  color: HighlightColor
  createdAt: Timestamp
}

export interface ReadMarker {
  articleId: string
  updatedAt: Timestamp
}

export interface ReaderProgress {
  marker: ReadMarker | null
  highlights: Record<string, Highlight[]> // grouped by articleId
}

const readerRef = (uid: string, documentId: string) => 
  doc(db, 'users', uid, 'reader_progress', documentId)

export async function getReaderProgress(
  uid: string,
  documentId: string
): Promise<ReaderProgress | null> {
  const snap = await getDoc(readerRef(uid, documentId))
  return snap.exists() ? (snap.data() as ReaderProgress) : null
}

export async function setReadMarker(uid: string, documentId: string, articleId: string) {
  const ref = readerRef(uid, documentId)
  await setDoc(ref, {
    marker: {
      articleId,
      updatedAt: Timestamp.now()
    }
  }, { merge: true })
}

export async function addHighlight(
  uid: string, 
  documentId: string, 
  articleId: string, 
  highlight: Omit<Highlight, 'createdAt' | 'id' | 'articleId'>
) {
  const ref = readerRef(uid, documentId)
  const snap = await getDoc(ref)
  const current = snap.exists() ? (snap.data() as ReaderProgress) : { marker: null, highlights: {} }
  
  const articleHighlights = current.highlights?.[articleId] || []
  const newHighlight: Highlight = {
    ...highlight,
    articleId,
    id: crypto.randomUUID(),
    createdAt: Timestamp.now()
  }

  await setDoc(ref, {
    highlights: {
      ...current.highlights,
      [articleId]: [...articleHighlights, newHighlight]
    }
  }, { merge: true })
}

export async function removeHighlight(
  uid: string, 
  documentId: string, 
  articleId: string, 
  highlightId: string
) {
  const ref = readerRef(uid, documentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  
  const current = snap.data() as ReaderProgress
  if (!current.highlights?.[articleId]) return

  const updatedHighlights = current.highlights[articleId].filter(h => h.id !== highlightId)

  await setDoc(ref, {
    highlights: {
      ...current.highlights,
      [articleId]: updatedHighlights
    }
  }, { merge: true })
}
