import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Card, CardInput, CardStatus } from '../types'

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
