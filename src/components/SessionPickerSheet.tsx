import { SESSION_TYPE_LABELS, HALF_LIFE_DAYS, type SessionType } from '../lib/progress'
import { EDITAL_TOPICS } from '../data/edital_topics'

const SESSION_TYPES: SessionType[] = ['seen', 'socratic', 'questions', 'questions_ok', 'confident']

const SESSION_ICONS: Record<SessionType, string> = {
  seen:         '👁',
  socratic:     '🧠',
  questions:    '📝',
  questions_ok: '✅',
  confident:    '🎯',
}

const SESSION_HALF_LIFE_LABEL: Record<SessionType, string> = {
  seen:         'Decai em 2 dias',
  socratic:     'Decai em 5 dias',
  questions:    'Decai em 10 dias',
  questions_ok: 'Decai em 18 dias',
  confident:    'Decai em 30 dias',
}

interface Props {
  topicId: string
  onSelect: (sessionType: SessionType) => void
  onClose: () => void
}

export default function SessionPickerSheet({ topicId, onSelect, onClose }: Props) {
  const topic = EDITAL_TOPICS.find(t => t.id === topicId)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-10 flex flex-col gap-4">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div>
          <h2 className="font-display text-lg text-white tracking-wide">COMO FOI A SESSÃO?</h2>
          {topic && (
            <p className="font-body text-sm text-white/50 mt-1 truncate">{topic.label}</p>
          )}
        </div>

        <div className="space-y-2">
          {SESSION_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-void border border-border hover:border-teal/30 active:scale-[0.98] transition-all text-left"
            >
              <span className="text-xl w-8 text-center flex-shrink-0">{SESSION_ICONS[type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-white/85">{SESSION_TYPE_LABELS[type]}</p>
                <p className="font-mono text-[10px] text-white/30 mt-0.5">{SESSION_HALF_LIFE_LABEL[type]}</p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className="h-1.5 rounded-full bg-teal/40"
                  style={{ width: `${(HALF_LIFE_DAYS[type] / 30) * 60}px` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
