import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
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
  importadoEm?: unknown
  updatedAt?: unknown
}

export function subscribeTextos(
  uid: string,
  cb: (textos: TextoOficial[]) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'texts')
  const q = query(ref, orderBy('disciplina'), orderBy('ordem'))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => d.data() as TextoOficial))
  })
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
