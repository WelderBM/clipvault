import { useState } from 'react'
import type { ReviewContent } from '../lib/review'
import { TOPIC_STATE_DOT, type TopicState } from '../data/edital_topics'
import { DISCIPLINE_LABELS, type Discipline } from '../types'
import MindMapViewer from './MindMapViewer'
import FlashcardViewer from './FlashcardViewer'
import ChecklistViewer from './ChecklistViewer'
import TableViewer from './TableViewer'
import ClozeViewer from './ClozeViewer'

interface Tab {
  id: string
  label: string
}

function TextViewer({ sections }: { sections: NonNullable<ReviewContent['text']>['sections'] }) {
  return (
    <div className="space-y-5">
      {sections.map((s, i) => (
        <div key={i} className="space-y-2">
          {s.title && (
            <h3 className="font-body font-semibold text-sm text-white/90">{s.title}</h3>
          )}
          {s.body && (
            <p className="font-body text-sm text-white/70 leading-relaxed">{s.body}</p>
          )}
          {s.items && s.items.length > 0 && (
            <ul className="space-y-1.5">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="text-teal mt-0.5 flex-shrink-0 text-xs">›</span>
                  <span className="font-body text-sm text-white/65 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

interface Props {
  content: ReviewContent
  topicState?: TopicState
  discipline: Discipline
  onClose: () => void
}

export default function ReviewSheet({ content, topicState, discipline, onClose }: Props) {
  const tabs: Tab[] = [
    content.mindMap ? { id: 'map', label: 'Mapa' } : null,
    content.text ? { id: 'text', label: 'Texto' } : null,
    content.flashcards?.length ? { id: 'cards', label: 'Cards' } : null,
    content.checklist?.length ? { id: 'check', label: 'Check' } : null,
    content.table ? { id: 'table', label: 'Tabela' } : null,
    content.cloze?.length ? { id: 'cloze', label: 'Cloze' } : null,
  ].filter((t): t is Tab => t !== null)

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'map')
  const dot = topicState ? TOPIC_STATE_DOT[topicState] : 'bg-white/20'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg tracking-wide text-white truncate">{content.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {DISCIPLINE_LABELS[discipline]}
            </span>
            {topicState && (
              <div className={`w-2 h-2 rounded-full ${dot}`} />
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-1"
          aria-label="Fechar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tab bar */}
      {tabs.length > 1 && (
        <div className="flex overflow-x-auto border-b border-border flex-shrink-0 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-mono text-[11px] uppercase tracking-wider flex-shrink-0 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-teal border-teal'
                  : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {activeTab === 'map' && content.mindMap && <MindMapViewer data={content.mindMap} />}
        {activeTab === 'text' && content.text && <TextViewer sections={content.text.sections} />}
        {activeTab === 'cards' && content.flashcards && <FlashcardViewer cards={content.flashcards} />}
        {activeTab === 'check' && content.checklist && <ChecklistViewer items={content.checklist} />}
        {activeTab === 'table' && content.table && <TableViewer table={content.table} />}
        {activeTab === 'cloze' && content.cloze && <ClozeViewer items={content.cloze} />}
      </div>
    </div>
  )
}
