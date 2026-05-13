import { useState } from 'react'
import { EDITAL_TOPICS } from '../data/edital_topics'
import { DISCIPLINES, DISCIPLINE_LABELS, type Discipline } from '../types'
import { setTopicProgress } from '../lib/progress'
import { saveWeeklyLog, DAY_LABELS, type WeeklyEntry, type DayKey } from '../lib/weekly'
import type { TopicState } from '../data/edital_topics'

interface Props {
  uid: string
  weekKey: string
  date: string
  dayKey: DayKey
  existingEntries: WeeklyEntry[]
  currentProgress: Record<string, TopicState>
  onClose: () => void
}

export default function WeeklyEntrySheet({
  uid, weekKey, date, dayKey, existingEntries, currentProgress, onClose
}: Props) {
  const [discipline, setDiscipline] = useState<Discipline | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const disciplineTopics = discipline
    ? EDITAL_TOPICS.filter(t => t.discipline === discipline)
    : []

  const toggleTopic = (id: string) =>
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSave = async () => {
    if (!discipline) return
    setSaving(true)
    try {
      const newEntry: WeeklyEntry = {
        date, dayKey, discipline,
        topicIds: selectedTopics,
        note: note.trim() || undefined,
      }
      await saveWeeklyLog(uid, weekKey, [...existingEntries, newEntry])

      // Auto-advance unseen topics to 'seen'
      await Promise.all(
        selectedTopics
          .filter(id => (currentProgress[id] ?? 'unseen') === 'unseen')
          .map(id => setTopicProgress(uid, id, 'seen'))
      )
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const [, m, dy] = date.split('-').map(Number)
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  const dateLabel = `${DAY_LABELS[dayKey]}, ${dy} ${months[m - 1]}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-white tracking-wide">REGISTRAR AULA</h2>
            <p className="font-mono text-[11px] text-white/40 mt-0.5">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Discipline */}
        <div className="space-y-2">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">Matéria</label>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map(d => (
              <button
                key={d}
                onClick={() => { setDiscipline(d); setSelectedTopics([]) }}
                className={`px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-colors ${
                  discipline === d
                    ? 'bg-teal/15 border-teal/40 text-teal'
                    : 'border-border text-white/40 hover:text-white/60'
                }`}
              >
                {DISCIPLINE_LABELS[d].split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        {discipline && (
          <div className="space-y-2">
            <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">
              Tópicos abordados
            </label>
            <div className="flex flex-wrap gap-2">
              {disciplineTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={`px-3 py-1.5 rounded-xl font-body text-xs border transition-colors text-left ${
                    selectedTopics.includes(t.id)
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                      : 'border-border text-white/50 hover:text-white/70'
                  }`}
                >
                  {t.label}
                  {t.hotFCC && <span className="ml-1 text-[9px] text-red-400 font-mono">hot</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="space-y-1.5">
          <label className="font-mono text-[11px] text-white/40 uppercase tracking-wider">
            Nota livre (opcional)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex: Prof. Ana — foco em questões FCC..."
            rows={3}
            className="w-full bg-void border border-border rounded-xl px-3 py-2 font-body text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal/40 transition-colors"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!discipline || saving}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm bg-teal text-void disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {saving ? 'Salvando…' : 'Salvar aula'}
        </button>
      </div>
    </div>
  )
}
