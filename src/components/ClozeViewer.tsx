import { useState } from 'react'
import type { ClozeItem } from '../lib/review'

type Token = { type: 'text'; value: string } | { type: 'blank'; index: number }

function tokenize(text: string): Token[] {
  const parts = text.split('___')
  const tokens: Token[] = []
  parts.forEach((part, i) => {
    if (part) tokens.push({ type: 'text', value: part })
    if (i < parts.length - 1) tokens.push({ type: 'blank', index: i })
  })
  return tokens
}

function ClozeItemView({ item, revealed }: { item: ClozeItem; revealed: boolean }) {
  const tokens = tokenize(item.text)
  const blankCount = tokens.filter(t => t.type === 'blank').length
  const [answers, setAnswers] = useState<string[]>(() => Array(blankCount).fill(''))
  const [checked, setChecked] = useState(false)

  const isCorrect = (i: number) =>
    answers[i].trim().toLowerCase() === item.answers[i]?.toLowerCase()

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <p className="font-body text-sm text-white/80 leading-relaxed flex flex-wrap items-baseline gap-x-1 gap-y-2">
        {tokens.map((token, ti) => {
          if (token.type === 'text') return <span key={ti}>{token.value}</span>
          const bi = token.index
          const correct = checked && isCorrect(bi)
          const wrong = checked && !isCorrect(bi)
          return (
            <input
              key={ti}
              value={revealed ? (item.answers[bi] ?? '') : answers[bi]}
              readOnly={revealed || checked}
              onChange={e => {
                const next = [...answers]
                next[bi] = e.target.value
                setAnswers(next)
              }}
              className={`inline-block w-20 border-b text-center bg-transparent text-sm font-mono focus:outline-none transition-colors ${
                revealed ? 'border-teal/40 text-teal'
                : correct ? 'border-teal/60 text-teal'
                : wrong ? 'border-rose-500/60 text-rose-400'
                : 'border-white/30 text-white'
              }`}
            />
          )
        })}
      </p>
      {!revealed && !checked && (
        <button
          onClick={() => setChecked(true)}
          className="font-body text-xs text-white/50 border border-white/15 rounded-lg px-3 py-1.5 hover:text-white/70 transition-colors"
        >
          Verificar
        </button>
      )}
      {checked && !revealed && (
        <div className="flex gap-2 items-center text-xs font-body">
          <span className={`${answers.every((_, i) => isCorrect(i)) ? 'text-teal' : 'text-rose-400'}`}>
            {answers.filter((_, i) => isCorrect(i)).length}/{blankCount} corretos
          </span>
          <button
            onClick={() => { setChecked(false); setAnswers(Array(blankCount).fill('')) }}
            className="text-white/30 hover:text-white/50 ml-2 transition-colors"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  )
}

export default function ClozeViewer({ items }: { items: ClozeItem[] }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setRevealed(r => !r)}
          className="font-mono text-[10px] text-white/30 hover:text-white/50 uppercase tracking-wider transition-colors"
        >
          {revealed ? 'Ocultar respostas' : 'Revelar tudo'}
        </button>
      </div>
      {items.map((item, i) => (
        <ClozeItemView key={i} item={item} revealed={revealed} />
      ))}
    </div>
  )
}
