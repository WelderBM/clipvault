import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Discipline } from '../types'

export type TextCategory =
  | 'constituicao'
  | 'lei-complementar'
  | 'lei-ordinaria'
  | 'regimento'
  | 'resolucao'
  | 'codigo'
  | 'decreto'
  | 'instrucao'

export const TEXT_CATEGORY_LABELS: Record<TextCategory, string> = {
  'constituicao':     'Constituição',
  'lei-complementar': 'Lei Complementar',
  'lei-ordinaria':    'Lei Ordinária',
  'regimento':        'Regimento',
  'resolucao':        'Resolução',
  'codigo':           'Código / Estatuto',
  'decreto':          'Decreto',
  'instrucao':        'Instrução Normativa',
}

export interface Artigo {
  numero: string
  titulo?: string
  caput: string
  incisos?: string[]
  paragrafos?: string[]
  tags?: string[]
  hotFCC?: boolean
  notaFCC?: string
}

export interface TextoOficial {
  id: string
  titulo: string
  fonte: string
  atualizadoEm: string
  disciplina: Discipline
  categoria: TextCategory
  ordem: number
  artigos: Artigo[]
  // Agrupamento de partes (todos opcionais — textos sem grupo funcionam normalmente)
  grupoId?: string       // slug da lei pai, ex: "lei-9784-1999"
  grupoParte?: number    // número desta parte, ex: 1
  grupoTotal?: number    // total de partes, ex: 5
  grupoTitulo?: string   // nome completo da lei, ex: "Lei 9.784/1999 — Processo Administrativo"
  importadoEm?: unknown
  updatedAt?: unknown
}

export function subscribeTextos(
  uid: string,
  cb: (textos: TextoOficial[]) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'texts')
  return onSnapshot(ref, snap => {
    cb(snap.docs.map(d => d.data() as TextoOficial))
  }, () => cb([]))
}

export async function importTexto(
  uid: string,
  texto: Omit<TextoOficial, 'importadoEm' | 'updatedAt'>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'texts', texto.id)
  await setDoc(ref, {
    ...texto,
    importadoEm: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function bulkImportTextos(
  uid: string,
  textos: Omit<TextoOficial, 'importadoEm' | 'updatedAt'>[]
): Promise<number> {
  await Promise.all(textos.map(t => importTexto(uid, t)))
  return textos.length
}

type MetadataUpdate = Partial<Omit<TextoOficial, 'id' | 'artigos' | 'importadoEm' | 'updatedAt'>>

export async function updateTextoMetadata(uid: string, id: string, updates: MetadataUpdate): Promise<void> {
  const ref = doc(db, 'users', uid, 'texts', id)
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
}

export async function updateArtigos(uid: string, id: string, artigos: Artigo[]): Promise<void> {
  const ref = doc(db, 'users', uid, 'texts', id)
  await updateDoc(ref, { artigos, updatedAt: serverTimestamp() })
}

export async function deleteTexto(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'texts', id))
}
