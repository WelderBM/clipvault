import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowLeft, BookOpen, Settings2, ZoomIn, ZoomOut, EyeOff, Eye, Bookmark, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTextos } from '../hooks/useTextos'
import { DISCIPLINE_LABELS } from '../types'
import { TEXT_CATEGORY_LABELS, type TextoOficial } from '../lib/texts'
import { getReaderProgress, setReadMarker, addHighlight, removeHighlight, type ReaderProgress, type HighlightColor } from '../lib/reader'
import ImportTextSheet from '../components/ImportTextSheet'

type Theme = 'dark' | 'light' | 'sepia'

type DisciplineItem =
  | { type: 'single'; texto: TextoOficial }
  | { type: 'group'; grupoId: string; titulo: string; partes: TextoOficial[] }

function buildDisciplineItems(texts: TextoOficial[]): DisciplineItem[] {
  const seenGroups = new Set<string>()
  const items: DisciplineItem[] = []
  for (const texto of texts) {
    if (!texto.grupoId) {
      items.push({ type: 'single', texto })
    } else if (!seenGroups.has(texto.grupoId)) {
      seenGroups.add(texto.grupoId)
      const partes = texts
        .filter(t => t.grupoId === texto.grupoId)
        .sort((a, b) => (a.grupoParte ?? 0) - (b.grupoParte ?? 0))
      items.push({ type: 'group', grupoId: texto.grupoId, titulo: texto.grupoTitulo ?? texto.grupoId, partes })
    }
  }
  return items
}

export default function ReaderPage() {
  const { user } = useAuth()
  const { textos, byDiscipline, loading: loadingTextos } = useTextos(user?.uid)

  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [expandedDiscipline, setExpandedDiscipline] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  // Leitor preferences
  const [theme, setTheme] = useState<Theme>('dark')
  const [fontSize, setFontSize] = useState<number>(1)
  const [modoProva, setModoProva] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // Leitor Progress (Firestore)
  const [progress, setProgress] = useState<ReaderProgress | null>(null)
  const [activeArticleAction, setActiveArticleAction] = useState<string | null>(null)
  const [menuAbove, setMenuAbove] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleArticleClick = useCallback((articleId: string, el: HTMLElement) => {
    if (activeArticleAction === articleId) {
      setActiveArticleAction(null)
      return
    }
    const container = scrollContainerRef.current
    if (container) {
      const containerBottom = container.getBoundingClientRect().bottom
      const elBottom = el.getBoundingClientRect().bottom
      setMenuAbove(containerBottom - elBottom < 120)
    }
    setActiveArticleAction(articleId)
  }, [activeArticleAction])

  const activeText: TextoOficial | undefined = textos.find(t => t.id === selectedText)

  // Group navigation
  const groupPartes = activeText?.grupoId
    ? textos
        .filter(t => t.grupoId === activeText.grupoId)
        .sort((a, b) => (a.grupoParte ?? 0) - (b.grupoParte ?? 0))
    : null
  const currentParteIndex = groupPartes?.findIndex(t => t.id === selectedText) ?? -1
  const prevParte = groupPartes && currentParteIndex > 0 ? groupPartes[currentParteIndex - 1] : null
  const nextParte = groupPartes && currentParteIndex < groupPartes.length - 1 ? groupPartes[currentParteIndex + 1] : null

  useEffect(() => {
    if (!user || !selectedText) {
      setProgress(null)
      return
    }
    getReaderProgress(user.uid, selectedText).then(setProgress)
  }, [user, selectedText])

  const themeClasses: Record<Theme, string> = {
    dark: 'bg-void text-white/90',
    light: 'bg-[#F9FAFB] text-gray-900',
    sepia: 'bg-[#FBF0D9] text-[#5C4B37]',
  }

  const articleClasses = {
    dark:  { hot: 'bg-orange-500/10 border-l-2 border-orange-500', num: 'text-teal',                  note: 'text-orange-400/80 bg-orange-500/5' },
    light: { hot: 'bg-orange-100 border-l-2 border-orange-500',    num: 'text-teal-700',              note: 'text-orange-700 bg-orange-50' },
    sepia: { hot: 'bg-[#F2E0C4] border-l-2 border-[#B98944]',      num: 'text-[#8B6B42] font-bold',   note: 'text-[#8B6B42] bg-[#E8D6B6]' },
  }

  const highlightColors: Record<HighlightColor, string> = {
    yellow: 'bg-yellow-400/30 border-l-4 border-yellow-400',
    orange: 'bg-orange-400/30 border-l-4 border-orange-400',
    red:    'bg-red-400/30 border-l-4 border-red-400',
  }

  const handleSetMarker = async (articleId: string) => {
    if (!user || !selectedText) return
    await setReadMarker(user.uid, selectedText, articleId)
    setActiveArticleAction(null)
  }

  const handleAddHighlight = async (articleId: string, color: HighlightColor, text: string) => {
    if (!user || !selectedText) return
    await addHighlight(user.uid, selectedText, articleId, { color, text })
    setActiveArticleAction(null)
  }

  const handleRemoveHighlight = async (articleId: string, highlightId: string) => {
    if (!user || !selectedText) return
    await removeHighlight(user.uid, selectedText, articleId, highlightId)
    setActiveArticleAction(null)
  }

  const getArticleId = (num: string) => num.replace(/\W+/g, '-').toLowerCase()

  const disciplines = Object.keys(byDiscipline) as (keyof typeof byDiscipline)[]

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
            {/* Header */}
            <header className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl tracking-wider text-teal">LEITOR</h1>
                <p className="font-body text-white/40 text-sm mt-1">Textos Oficiais do Edital</p>
              </div>
              <button
                onClick={() => setShowImport(true)}
                className="p-2 mt-1 text-white/30 hover:text-white/60 transition-colors"
                aria-label="Importar texto"
                title="Importar texto oficial (JSON)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </header>

            {loadingTextos && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
              </div>
            )}

            {!loadingTextos && textos.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white/30" />
                </div>
                <p className="font-body text-white/40 text-sm leading-relaxed max-w-[240px]">
                  Nenhum texto importado.<br />
                  Use o ícone ↑ acima para importar JSON do chat de estudo.
                </p>
              </div>
            )}

            {/* Two-level navigation: discipline → items (single or group) */}
            {!loadingTextos && disciplines.length > 0 && (
              <div className="space-y-2">
                {disciplines.map(disc => {
                  const texts = byDiscipline[disc] ?? []
                  const isExpanded = expandedDiscipline === disc
                  const hotCount = texts.reduce((n, t) => n + t.artigos.filter(a => a.hotFCC).length, 0)
                  const items = buildDisciplineItems(texts)

                  return (
                    <div key={disc} className="bg-surface border border-border rounded-2xl overflow-hidden">
                      {/* Discipline header */}
                      <button
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left"
                        onClick={() => setExpandedDiscipline(isExpanded ? null : disc)}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-teal flex-shrink-0" />
                          <div>
                            <p className="font-body text-sm text-white/90">
                              {DISCIPLINE_LABELS[disc as keyof typeof DISCIPLINE_LABELS] ?? disc}
                            </p>
                            <p className="font-mono text-[10px] text-white/35 mt-0.5">
                              {texts.length} texto{texts.length !== 1 ? 's' : ''}
                              {hotCount > 0 && ` · ${hotCount} hot`}
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Items (singles and groups) */}
                      {isExpanded && (
                        <div className="border-t border-border/50">
                          {items.map(item => {
                            if (item.type === 'single') {
                              return (
                                <button
                                  key={item.texto.id}
                                  onClick={() => setSelectedText(item.texto.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors border-b border-border/20 last:border-b-0"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-body text-sm text-white/85 leading-snug">{item.texto.titulo}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="font-mono text-[9px] text-white/30 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-wider">
                                        {TEXT_CATEGORY_LABELS[item.texto.categoria]}
                                      </span>
                                      <span className="font-body text-[10px] text-white/30">
                                        {item.texto.artigos.length} art.
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                                </button>
                              )
                            }

                            // Group item
                            const isGroupExpanded = expandedGroup === item.grupoId
                            return (
                              <div key={item.grupoId} className="border-b border-border/20 last:border-b-0">
                                {/* Group header */}
                                <button
                                  onClick={() => setExpandedGroup(isGroupExpanded ? null : item.grupoId)}
                                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                                >
                                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    <svg
                                      className={`w-3 h-3 text-white/30 transition-transform ${isGroupExpanded ? 'rotate-90' : ''}`}
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-body text-sm text-white/85 leading-snug">{item.titulo}</p>
                                    <p className="font-mono text-[10px] text-white/35 mt-0.5">
                                      {item.partes.length} partes · {item.partes.reduce((n, p) => n + p.artigos.length, 0)} art.
                                    </p>
                                  </div>
                                </button>

                                {/* Parts list */}
                                {isGroupExpanded && (
                                  <div className="bg-white/[0.015] border-t border-border/20">
                                    {item.partes.map(parte => (
                                      <button
                                        key={parte.id}
                                        onClick={() => setSelectedText(parte.id)}
                                        className="w-full px-4 pl-10 py-2.5 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors border-b border-border/10 last:border-b-0"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="font-body text-xs text-white/75 leading-snug">
                                            {parte.grupoParte !== undefined
                                              ? `Parte ${parte.grupoParte}: ${parte.titulo ?? parte.titulo ?? ''}`
                                              : parte.titulo ?? parte.titulo ?? ''}
                                          </p>
                                          <p className="font-body text-[10px] text-white/30 mt-0.5 truncate">{parte.titulo}</p>
                                          <span className="font-body text-[10px] text-white/25">{parte.artigos.length} art.</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
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
                <div className="min-w-0">
                  <h1 className="font-display text-base truncate opacity-90 leading-tight">
                    {activeText?.titulo}
                  </h1>
                  {groupPartes && (
                    <p className="font-mono text-[10px] text-teal/70 mt-0.5">
                      Parte {activeText?.grupoParte} de {activeText?.grupoTotal ?? groupPartes.length}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Part navigation */}
                {groupPartes && (
                  <>
                    <button
                      onClick={() => prevParte && setSelectedText(prevParte.id)}
                      disabled={!prevParte}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
                      aria-label="Parte anterior"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => nextParte && setSelectedText(nextParte.id)}
                      disabled={!nextParte}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
                      aria-label="Próxima parte"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg opacity-60 hover:opacity-100 transition-colors ${showSettings ? 'bg-black/10' : ''}`}
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
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
                    <div className="flex gap-2">
                      <button onClick={() => setTheme('dark')}  className={`w-8 h-8 rounded-full bg-[#03080F] border-2 ${theme === 'dark'  ? 'border-teal' : 'border-transparent'}`} />
                      <button onClick={() => setTheme('light')} className={`w-8 h-8 rounded-full bg-[#F9FAFB] border-2 border-gray-300 ${theme === 'light' ? '!border-teal-600' : ''}`} />
                      <button onClick={() => setTheme('sepia')} className={`w-8 h-8 rounded-full bg-[#FBF0D9] border-2 border-[#D4A853]/40 ${theme === 'sepia' ? '!border-[#D4A853]' : ''}`} />
                    </div>
                    <div className="w-px bg-black/10 mx-2" />
                    <div className="flex gap-2">
                      <button onClick={() => setFontSize(f => Math.max(0.8, f - 0.1))} className="p-1.5 rounded bg-black/5 opacity-70 hover:opacity-100">
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <button onClick={() => setFontSize(f => Math.min(1.5, f + 0.1))} className="p-1.5 rounded bg-black/5 opacity-70 hover:opacity-100">
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="w-px bg-black/10 mx-2" />
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
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pb-24" style={{ fontSize: `${fontSize}rem` }}>
              <div className="max-w-2xl mx-auto space-y-8 font-serif leading-[1.8]">
                {activeText?.artigos.map((art, idx) => {
                  const articleId = getArticleId(art.numero)
                  const isMarker = progress?.marker?.articleId === articleId
                  const highlights = progress?.highlights?.[articleId] || []
                  const hasUserHighlight = highlights.length > 0
                  const userHighlightClass = hasUserHighlight ? highlightColors[highlights[0].color] : ''

                  return (
                    <div key={idx} className="relative">
                      {isMarker && (
                        <div className="absolute -left-6 top-1 text-teal animate-bounce">
                          <Bookmark className="w-5 h-5 fill-current" />
                        </div>
                      )}

                      <div
                        onClick={e => handleArticleClick(articleId, e.currentTarget)}
                        className={`cursor-pointer transition-colors ${userHighlightClass ? userHighlightClass + ' -mx-4 px-4 py-3 rounded-r-lg' : art.hotFCC ? articleClasses[theme].hot + ' -mx-4 px-4 py-3 rounded-r-lg' : ''}`}
                      >
                        {!modoProva && (
                          <span className={`font-bold mr-2 ${articleClasses[theme].num}`}>
                            {art.numero}
                          </span>
                        )}
                        <span className="opacity-90">{art.caput}</span>

                        {art.hotFCC && art.notaFCC && !modoProva && (
                          <div className={`mt-3 px-3 py-2 text-sm rounded ${articleClasses[theme].note}`}>
                            <span className="font-bold block mb-1 text-xs uppercase tracking-wider">🎯 Foco FCC</span>
                            {art.notaFCC}
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {activeArticleAction === articleId && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute z-10 left-0 right-0 bg-void/95 border border-border shadow-xl rounded-xl p-2 flex items-center justify-between backdrop-blur ${menuAbove ? 'bottom-full mb-2' : '-bottom-14'}`}
                          >
                            <div className="flex gap-2">
                              <button onClick={() => handleAddHighlight(articleId, 'yellow', art.caput)} className="w-8 h-8 rounded-full bg-yellow-400 hover:scale-110 transition-transform" />
                              <button onClick={() => handleAddHighlight(articleId, 'orange', art.caput)} className="w-8 h-8 rounded-full bg-orange-400 hover:scale-110 transition-transform" />
                              <button onClick={() => handleAddHighlight(articleId, 'red', art.caput)}    className="w-8 h-8 rounded-full bg-red-400 hover:scale-110 transition-transform" />
                              {hasUserHighlight && (
                                <button onClick={() => handleRemoveHighlight(articleId, highlights[0].id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-white/10 text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="w-px h-6 bg-border mx-2" />
                            <button onClick={() => handleSetMarker(articleId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 text-teal font-body text-sm hover:bg-teal/20 transition-colors">
                              <Bookmark className="w-4 h-4" />
                              <span>Marcar</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showImport && user && (
        <ImportTextSheet uid={user.uid} onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}
