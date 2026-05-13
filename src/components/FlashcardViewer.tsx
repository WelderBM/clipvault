import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Flashcard } from '../lib/review'

export default function FlashcardViewer({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore] = useState({ right: 0, wrong: 0 })
  const [done, setDone] = useState(false)

  if (cards.length === 0) return (
    <p className="text-white/30 text-sm font-body text-center py-8">Sem flashcards.</p>
  )

  if (done) {
    const total = score.right + score.wrong
    return (
      <div className="flex flex-col items-center gap-5 py-12">
        <p className="font-display text-5xl text-teal">{score.right}/{total}</p>
        <p className="font-body text-white/50 text-sm">acertos nessa sessão</p>
        <button
          onClick={() => { setIndex(0); setFlipped(false); setScore({ right: 0, wrong: 0 }); setDone(false) }}
          className="px-6 py-3 rounded-2xl bg-surface border border-border font-body text-sm text-white/70 active:scale-95 transition-transform"
        >
          Recomeçar
        </button>
      </div>
    )
  }

  const card = cards[index]
  const advance = (right: boolean) => {
    setScore(s => ({ ...s, [right ? 'right' : 'wrong']: s[right ? 'right' : 'wrong'] + 1 }))
    setFlipped(false)
    setTimeout(() => {
      if (index + 1 >= cards.length) setDone(true)
      else setIndex(i => i + 1)
    }, 150)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[11px] text-white/40">{index + 1} / {cards.length}</span>
        <span className="font-mono text-[11px] text-teal">{score.right} ✓ · {score.wrong} ✗</span>
      </div>

      {/* Card with flip — taller on desktop */}
      <div style={{ perspective: 1200 }} className="relative h-56 lg:h-72 cursor-pointer select-none" onClick={() => setFlipped(f => !f)}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center p-6 lg:p-8 gap-3"
          >
            <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Pergunta</span>
            <p className="font-body text-white/90 text-base lg:text-lg text-center leading-relaxed">{card.question}</p>
            <span className="font-mono text-[9px] text-white/20 mt-2">toque para virar</span>
          </div>
          {/* Back */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 bg-surface border border-teal/20 rounded-2xl flex flex-col items-center justify-center p-6 lg:p-8 gap-3"
          >
            <span className="font-mono text-[9px] text-teal/60 uppercase tracking-widest">Resposta</span>
            <p className="font-body text-white/90 text-base lg:text-lg text-center leading-relaxed">{card.answer}</p>
          </div>
        </motion.div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => advance(false)}
            className="flex-1 py-3 lg:py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 font-body text-sm lg:text-base text-rose-400 active:scale-95 transition-transform"
          >
            ✗ Errei
          </button>
          <button
            onClick={() => advance(true)}
            className="flex-1 py-3 lg:py-4 rounded-2xl bg-teal/10 border border-teal/20 font-body text-sm lg:text-base text-teal active:scale-95 transition-transform"
          >
            ✓ Sabia
          </button>
        </div>
      )}
    </div>
  )
}
