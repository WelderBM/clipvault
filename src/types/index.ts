import { Timestamp } from 'firebase/firestore'

export type CardStatus = 'active' | 'used' | 'archived'

/**
 * Disciplina (matéria do edital ALE-RR 2026 — Programador, banca FCC).
 * Cards podem não ter discipline atribuída (cards genéricos, snippets, etc.).
 */
export type Discipline =
  | 'portugues'
  | 'constitucional'
  | 'administrativo'
  | 'afo'
  | 'legislacao'
  | 'historia'
  | 'geografia'
  | 'ti'

/**
 * Importância:
 *  1 = normal
 *  2 = importante
 *  3 = hot topic FCC (presença garantida em prova)
 */
export type Importance = 1 | 2 | 3

export interface Card {
  id: string
  title: string | null
  text: string
  color: string
  emoji: string
  category: string
  status: CardStatus
  createdAt: Timestamp
  usedAt: Timestamp | null

  // ----- Phase 2 fields (todos opcionais p/ retrocompat com cards antigos) -----
  /** Matéria do edital. null = card teve matéria limpada explicitamente. */
  discipline?: Discipline | null
  /** 1=normal, 2=importante, 3=hot. Default 1 quando ausente. */
  importance?: Importance
  /** Última vez que o usuário marcou revisão. */
  lastReviewed?: Timestamp | null
  /** Quantas vezes este card foi revisado. Default 0 quando ausente. */
  reviewCount?: number
}

export type CardInput = Omit<Card, 'id' | 'createdAt' | 'usedAt' | 'lastReviewed' | 'reviewCount'>

export const CARD_COLORS = [
  { label: 'Teal',    value: '#1BE4C8' },
  { label: 'Amber',   value: '#D4A853' },
  { label: 'Rose',    value: '#F43F5E' },
  { label: 'Violet',  value: '#8B5CF6' },
  { label: 'Sky',     value: '#38BDF8' },
  { label: 'Lime',    value: '#84CC16' },
  { label: 'Orange',  value: '#FB923C' },
  { label: 'Slate',   value: '#94A3B8' },
]

export const CARD_CATEGORIES = [
  'NotebookLM',
  'ALE-RR',
  'Código',
  'Projeto',
  'Geral',
]

export const DISCIPLINES: Discipline[] = [
  'portugues',
  'constitucional',
  'administrativo',
  'afo',
  'legislacao',
  'historia',
  'geografia',
  'ti',
]

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  portugues: 'Português',
  constitucional: 'Constitucional',
  administrativo: 'Administrativo',
  afo: 'AFO',
  legislacao: 'Legislação',
  historia: 'História RR',
  geografia: 'Geografia RR',
  ti: 'TI',
}

export const IMPORTANCE_LEVELS: { value: Importance; label: string; emoji: string }[] = [
  { value: 1, label: 'Normal',     emoji: '·' },
  { value: 2, label: 'Importante', emoji: '★' },
  { value: 3, label: 'Hot FCC',    emoji: '🔥' },
]
