import { Timestamp } from 'firebase/firestore'

export type CardStatus = 'active' | 'used' | 'archived'

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
}

export type CardInput = Omit<Card, 'id' | 'createdAt' | 'usedAt'>

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
