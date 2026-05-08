import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowLeft, BookOpen, Settings2, ZoomIn, ZoomOut, EyeOff, Eye } from 'lucide-react'
import { TEXTOS_OFICIAIS } from '../data/texts'

type Theme = 'dark' | 'light' | 'sepia'

export default function ReaderPage() {
  const [selectedText, setSelectedText] = useState<string | null>(null)
  
  // Leitor preferences
  const [theme, setTheme] = useState<Theme>('dark')
  const [fontSize, setFontSize] = useState<number>(1) // rem multiplier
  const [modoProva, setModoProva] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const activeText = TEXTOS_OFICIAIS.find(t => t.id === selectedText)

  const themeClasses: Record<Theme, string> = {
    dark: 'bg-void text-white/90',
    light: 'bg-[#F9FAFB] text-gray-900',
    sepia: 'bg-[#FBF0D9] text-[#5C4B37]',
  }

  const articleClasses = {
    dark: {
      hot: 'bg-orange-500/10 border-l-2 border-orange-500',
      num: 'text-teal',
      note: 'text-orange-400/80 bg-orange-500/5',
    },
    light: {
      hot: 'bg-orange-100 border-l-2 border-orange-500',
      num: 'text-teal-700',
      note: 'text-orange-700 bg-orange-50',
    },
    sepia: {
      hot: 'bg-[#F2E0C4] border-l-2 border-[#B98944]',
      num: 'text-[#8B6B42] font-bold',
      note: 'text-[#8B6B42] bg-[#E8D6B6]',
    }
  }

  return (
    <div className={`pt-4 pb-24 h-full transition-colors duration-300 ${selectedText ? themeClasses[theme] : 'px-4'}`}>
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
              <p className="font-body text-white/40 text-sm mt-1">Textos Oficiais do Edital</p>
            </header>

            <div className="flex flex-col gap-3">
              {TEXTOS_OFICIAIS.map((text) => (
                <button
                  key={text.id}
                  onClick={() => setSelectedText(text.id)}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between text-left hover:border-teal/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-teal" />
                    <div>
                      <span className="font-body text-white block">{text.titulo}</span>
                      <span className="font-body text-white/40 text-xs">{text.fonte}</span>
                    </div>
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
            className="flex flex-col h-[calc(100vh-6rem)]" 
          >
            {/* Header do Leitor */}
            <header className="flex items-center justify-between px-4 mb-4 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <button 
                  onClick={() => setSelectedText(null)}
                  className="p-2 -ml-2 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display text-lg truncate opacity-90">
                  {activeText?.titulo}
                </h1>
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg opacity-60 hover:opacity-100 transition-colors ${showSettings ? 'bg-black/10' : ''}`}
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </header>

            {/* Configurações (Collapse) */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-black/10 border border-black/5 backdrop-blur-sm mb-4">
                    {/* Temas */}
                    <div className="flex gap-2">
                      <button onClick={() => setTheme('dark')} className={`w-8 h-8 rounded-full bg-[#03080F] border-2 ${theme === 'dark' ? 'border-teal' : 'border-transparent'}`} />
                      <button onClick={() => setTheme('light')} className={`w-8 h-8 rounded-full bg-[#F9FAFB] border-2 border-gray-300 ${theme === 'light' ? '!border-teal-600' : ''}`} />
                      <button onClick={() => setTheme('sepia')} className={`w-8 h-8 rounded-full bg-[#FBF0D9] border-2 border-[#D4A853]/40 ${theme === 'sepia' ? '!border-[#D4A853]' : ''}`} />
                    </div>

                    <div className="w-px bg-black/10 mx-2" />

                    {/* Fonte */}
                    <div className="flex gap-2">
                      <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} className="p-1.5 rounded bg-black/5 opacity-70 hover:opacity-100">
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <button onClick={() => setFontSize(f => Math.min(1.5, f + 0.1))} className="p-1.5 rounded bg-black/5 opacity-70 hover:opacity-100">
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="w-px bg-black/10 mx-2" />

                    {/* Modo Prova */}
                    <button 
                      onClick={() => setModoProva(!modoProva)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-body transition-colors ${modoProva ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-black/5 opacity-70'}`}
                    >
                      {modoProva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      Modo Prova
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Área de Leitura */}
            <div className="flex-1 overflow-y-auto px-6 pb-24" style={{ fontSize: `${fontSize}rem` }}>
              <div className="max-w-2xl mx-auto space-y-8 font-serif leading-[1.8]">
                {activeText?.artigos.map((art, idx) => (
                  <div 
                    key={idx} 
                    className={`relative ${art.hotFCC ? articleClasses[theme].hot + ' -mx-4 px-4 py-3 rounded-r-lg' : ''}`}
                  >
                    {!modoProva && (
                      <span className={`font-bold mr-2 ${articleClasses[theme].num}`}>
                        {art.numero}
                      </span>
                    )}
                    <span className="opacity-90">{art.caput}</span>
                    
                    {/* Nota Estratégica (Hot Topic) */}
                    {art.hotFCC && art.notaFCC && !modoProva && (
                      <div className={`mt-3 px-3 py-2 text-sm rounded ${articleClasses[theme].note}`}>
                        <span className="font-bold block mb-1 text-xs uppercase tracking-wider">🎯 Foco FCC</span>
                        {art.notaFCC}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
