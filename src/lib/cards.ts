import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, getDocs, getDocsFromCache,
  limit as fsLimit, startAfter,
  serverTimestamp, Timestamp, writeBatch, increment,
} from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from './firebase'
import type { Card, CardInput, CardStatus } from '../types'

export type CardCursor = QueryDocumentSnapshot<DocumentData>

const BATCH_LIMIT = 500

const cardsRef = (uid: string) =>
  collection(db, 'users', uid, 'cards')

export function subscribeToCards(
  uid: string,
  status: CardStatus,
  cb: (cards: Card[]) => void
) {
  const q = query(
    cardsRef(uid),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Card)))
  })
}

/**
 * Subscribe to the first page of cards, ordered by createdAt desc, capped to pageSize.
 * The callback also receives the QueryDocumentSnapshot of the last doc, usable as a
 * cursor for fetchCardsPage().
 */
export function subscribeToCardsPage(
  uid: string,
  status: CardStatus,
  pageSize: number,
  cb: (cards: Card[], lastDoc: CardCursor | null) => void
) {
  const q = query(
    cardsRef(uid),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    fsLimit(pageSize)
  )
  return onSnapshot(q, snap => {
    const cards = snap.docs.map(d => ({ id: d.id, ...d.data() } as Card))
    const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
    cb(cards, lastDoc)
  })
}

/**
 * One-shot fetch of the next page of cards using a cursor (last doc of the previous page).
 * Returns the cards and the new cursor (or null if the page is empty).
 */
export async function fetchCardsPage(
  uid: string,
  status: CardStatus,
  pageSize: number,
  cursor: CardCursor
): Promise<{ cards: Card[]; lastDoc: CardCursor | null }> {
  const q = query(
    cardsRef(uid),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    startAfter(cursor),
    fsLimit(pageSize)
  )
  
  let snap;
  if (!navigator.onLine) {
    try {
      snap = await getDocsFromCache(q)
    } catch (err) {
      snap = await getDocs(q)
    }
  } else {
    snap = await getDocs(q)
  }
  
  const cards = snap.docs.map(d => ({ id: d.id, ...d.data() } as Card))
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
  return { cards, lastDoc }
}

export async function createCard(uid: string, input: CardInput) {
  await addDoc(cardsRef(uid), {
    ...input,
    createdAt: serverTimestamp(),
    usedAt: null,
  })
}

export async function markAsUsed(uid: string, cardId: string) {
  await updateDoc(doc(db, 'users', uid, 'cards', cardId), {
    status: 'used',
    usedAt: Timestamp.now(),
  })
}

export async function archiveCard(uid: string, cardId: string) {
  await updateDoc(doc(db, 'users', uid, 'cards', cardId), {
    status: 'archived',
  })
}

export async function reactivateCard(uid: string, cardId: string) {
  await updateDoc(doc(db, 'users', uid, 'cards', cardId), {
    status: 'active',
    usedAt: null,
  })
}

export async function updateCard(uid: string, cardId: string, data: Partial<CardInput>) {
  await updateDoc(doc(db, 'users', uid, 'cards', cardId), data)
}

export async function deleteCard(uid: string, cardId: string) {
  await deleteDoc(doc(db, 'users', uid, 'cards', cardId))
}

/**
 * Marca uma revisão: atualiza lastReviewed para now() e incrementa reviewCount.
 * Usa increment() do Firestore p/ ser atômico mesmo com writes concorrentes.
 */
export async function markAsReviewed(uid: string, cardId: string) {
  await updateDoc(doc(db, 'users', uid, 'cards', cardId), {
    lastReviewed: Timestamp.now(),
    reviewCount: increment(1),
  })
}

/**
 * Run a write per id, chunking by Firestore's 500-op batch limit.
 */
async function runChunkedBatch(
  uid: string,
  cardIds: string[],
  apply: (batch: ReturnType<typeof writeBatch>, ref: ReturnType<typeof doc>) => void
) {
  for (let i = 0; i < cardIds.length; i += BATCH_LIMIT) {
    const chunk = cardIds.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const id of chunk) {
      apply(batch, doc(db, 'users', uid, 'cards', id))
    }
    await batch.commit()
  }
}

export async function bulkDeleteCards(uid: string, cardIds: string[]) {
  if (cardIds.length === 0) return
  await runChunkedBatch(uid, cardIds, (batch, ref) => batch.delete(ref))
}

export async function bulkArchiveCards(uid: string, cardIds: string[]) {
  if (cardIds.length === 0) return
  await runChunkedBatch(uid, cardIds, (batch, ref) =>
    batch.update(ref, { status: 'archived' })
  )
}

export async function bulkReactivateCards(uid: string, cardIds: string[]) {
  if (cardIds.length === 0) return
  await runChunkedBatch(uid, cardIds, (batch, ref) =>
    batch.update(ref, { status: 'active', usedAt: null })
  )
}

/**
 * Create many cards in one go, chunked by Firestore's 500-op batch limit.
 * Each card gets an auto-generated id, createdAt: serverTimestamp() and usedAt: null.
 */
export async function bulkCreateCards(uid: string, inputs: CardInput[]) {
  if (inputs.length === 0) return
  for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
    const chunk = inputs.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const input of chunk) {
      const ref = doc(cardsRef(uid))
      batch.set(ref, {
        ...input,
        createdAt: serverTimestamp(),
        usedAt: null,
      })
    }
    await batch.commit()
  }
}
