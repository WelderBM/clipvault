import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowLeft, BookOpen } from 'lucide-react'

const TEXTS = [
  {
    id: 'ce',
    title: 'Constituição Estadual de Roraima',
    articles: [
      { num: 'Art. 1º', text: 'O Estado de Roraima, integrante da República Federativa do Brasil, rege-se por esta Constituição...' },
      { num: 'Art. 2º', text: 'São Poderes do Estado, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.' }
    ]
  },
  {
    id: 'ri',
    title: 'Regimento Interno da ALERR',
    articles: [
      { num: 'Art. 1º', text: 'A Assembleia Legislativa do Estado de Roraima, órgão supremo do Poder Legislativo...' },
      { num: 'Art. 2º', text: 'A Assembleia Legislativa reunir-se-á, anualmente, na Capital do Estado...' }
    ]
  },
  {
    id: 'lc',
    title: 'Lei Complementar 053/2001',
    articles: [
      { num: 'Art. 1º', text: 'Esta Lei Complementar institui o Regime Jurídico dos Servidores Públicos Civis...' },
      { num: 'Art. 2º', text: 'Para os efeitos desta Lei, servidor é a pessoa legalmente investida em cargo público.' }
    ]
  }
]

export default function ReaderPage() {
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const activeText = TEXTS.find(t => t.id === selectedText)

  return (
    <div className="px-4 pt-4 pb-24 h-full">
      <AnimatePresence mode="wait">
        {!selectedText ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <header className="mb-6">
              <h1 className="font-display text-2xl tracking-wider text-teal">LEITOR</h1>
              <p className="font-body text-white/40 text-sm mt-1">Textos Oficiais</p>
            </header>

            <div className="flex flex-col gap-3">
              {TEXTS.map((text) => (
                <button
                  key={text.id}
                  onClick={() => setSelectedText(text.id)}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between text-left hover:border-teal/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-teal" />
                    <span className="font-body text-white">{text.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-[calc(100vh-8rem)]" // Subtract roughly header + bottom nav
          >
            <header className="flex items-center gap-3 mb-6 shrink-0">
              <button 
                onClick={() => setSelectedText(null)}
                className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display text-lg truncate text-white">
                {activeText?.title}
              </h1>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-2">
              {activeText?.articles.map((art, idx) => (
                <div key={idx} className="font-body">
                  <span className="text-teal font-bold mr-2">{art.num}</span>
                  <span className="text-white/80 leading-relaxed">{art.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
