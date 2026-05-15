import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  subscribeWeeklyLogs, saveWeeklyLog,
  getWeekKey, getWeekDays, formatDateStr, getDayKey, DAY_LABELS,
  type WeeklyLog, type WeeklyEntry,
} from '../lib/weekly'
import { subscribeTopicProgress } from '../lib/progress'
import { EDITAL_TOPICS, TOPIC_STATE_DOT, type TopicState } from '../data/edital_topics'
import { DISCIPLINE_LABELS } from '../types'
import WeeklyEntrySheet from '../components/WeeklyEntrySheet'

const MONTH_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatWeekRange(days: Date[]): string {
  const first = days[0]
  const last = days[6]
  const firstMonth = MONTH_SHORT[first.getUTCMonth()]
  const lastMonth = MONTH_SHORT[last.getUTCMonth()]
  if (firstMonth === lastMonth) {
    return `${first.getUTCDate()} a ${last.getUTCDate()} ${firstMonth} ${last.getUTCFullYear()}`
  }
  return `${first.getUTCDate()} ${firstMonth} a ${last.getUTCDate()} ${lastMonth} ${last.getUTCFullYear()}`
}

export default function WeeklyPage() {
  const { user } = useAuth()
  const [weekOffset, setWeekOffset] = useState(0)
  const [weeklyLogs, setWeeklyLogs] = useState<Record<string, WeeklyLog>>({})
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicState>>({})
  const [addingDate, setAddingDate] = useState<string | null>(null)

  const todayWeekKey = useMemo(() => getWeekKey(new Date()), [])

  const currentWeekKey = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return getWeekKey(d)
  }, [weekOffset])

  const weekDays = useMemo(() => getWeekDays(currentWeekKey), [currentWeekKey])
  const isCurrentWeek = currentWeekKey === todayWeekKey
  const currentLog = weeklyLogs[currentWeekKey]

  useEffect(() => {
    if (!user) return
    const u1 = subscribeWeeklyLogs(user.uid, setWeeklyLogs)
    const u2 = subscribeTopicProgress(user.uid, setTopicProgress)
    return () => { u1(); u2() }
  }, [user])

  const removeEntry = async (entry: WeeklyEntry) => {
    if (!user || !currentLog) return
    const updated = entry.id
      ? currentLog.entries.filter(e => e.id !== entry.id)
      : currentLog.entries.filter(e => !(e.date === entry.date && e.discipline === entry.discipline))
    await saveWeeklyLog(user.uid, currentWeekKey, updated)
  }

  const addingDayKey = addingDate ? getDayKey(new Date(addingDate + 'T12:00:00Z')) : null
  const currentWeekEntryCount = currentLog?.entries.length ?? 0

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <header className="mb-5">
        <h1 className="font-display text-2xl tracking-wider text-teal">SEMANA</h1>
        <p className="font-body text-white/40 text-[11px] uppercase tracking-wider mt-1">
          Registro semanal do cursinho
        </p>
        {currentWeekEntryCount > 0 && (
          <p className="font-mono text-[11px] text-teal/70 mt-0.5">
            {currentWeekEntryCount} aula{currentWeekEntryCount !== 1 ? 's' : ''} registrada{currentWeekEntryCount !== 1 ? 's' : ''} esta semana
          </p>
        )}
      </header>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="p-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center">
          <p className="font-body text-sm text-white/80">{formatWeekRange(weekDays)}</p>
          {isCurrentWeek && (
            <p className="font-mono text-[10px] text-teal mt-0.5">Esta semana</p>
          )}
        </div>

        <button
          onClick={() => setWeekOffset(o => o + 1)}
          disabled={isCurrentWeek}
          className="p-2 text-white/40 hover:text-white/70 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {weekDays.map(day => {
          const dateStr = formatDateStr(day)
          const dayKey = getDayKey(day)
          const dayLabel = DAY_LABELS[dayKey]
          const dayNum = day.getUTCDate()
          const monthStr = MONTH_SHORT[day.getUTCMonth()]
          const entries = currentLog?.entries.filter(e => e.date === dateStr) ?? []
          const isToday = dateStr === formatDateStr(new Date())

          return (
            <div
              key={dateStr}
              className={`bg-surface border rounded-2xl overflow-hidden ${isToday ? 'border-teal/30' : 'border-border'}`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`font-body text-sm ${isToday ? 'text-teal' : 'text-white/80'}`}>
                    {dayLabel}
                  </span>
                  <span className="font-mono text-[11px] text-white/35">
                    {dayNum} {monthStr}
                  </span>
                  {isToday && (
                    <span className="font-mono text-[9px] text-teal/70 border border-teal/30 rounded px-1.5 py-0.5 uppercase tracking-wider">
                      Hoje
                    </span>
                  )}
                </div>
                {isCurrentWeek && (
                  <button
                    onClick={() => setAddingDate(dateStr)}
                    className="flex items-center gap-1 font-mono text-[10px] text-white/30 hover:text-teal/70 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Aula
                  </button>
                )}
              </div>

              {/* Entries */}
              {entries.length > 0 && (
                <div className="border-t border-border/50 divide-y divide-border/30">
                  {entries.map((entry, i) => {
                    const topicLabels = entry.topicIds.map(id => {
                      const t = EDITAL_TOPICS.find(et => et.id === id)
                      return t?.label ?? id
                    })
                    return (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                              {DISCIPLINE_LABELS[entry.discipline]}
                            </span>
                            {entry.topicIds.map(id => {
                              const state: TopicState = topicProgress[id] ?? 'unseen'
                              return <div key={id} className={`w-1.5 h-1.5 rounded-full ${TOPIC_STATE_DOT[state]}`} />
                            })}
                          </div>
                          {topicLabels.length > 0 && (
                            <p className="font-body text-xs text-white/65 leading-snug">
                              {topicLabels.join(' · ')}
                            </p>
                          )}
                          {entry.note && (
                            <p className="font-body text-xs text-white/35 mt-1 italic">
                              {entry.note}
                            </p>
                          )}
                        </div>
                        {isCurrentWeek && (
                          <button
                            onClick={() => removeEntry(entry)}
                            className="text-white/20 hover:text-rose-400/60 transition-colors mt-0.5 flex-shrink-0"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {entries.length === 0 && !isCurrentWeek && (
                <div className="px-4 pb-3">
                  <p className="font-body text-xs text-white/20">Sem registro</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {addingDate && addingDayKey && user && (
        <WeeklyEntrySheet
          uid={user.uid}
          weekKey={currentWeekKey}
          date={addingDate}
          dayKey={addingDayKey}
          existingEntries={currentLog?.entries ?? []}
          currentProgress={topicProgress}
          onClose={() => setAddingDate(null)}
        />
      )}
    </div>
  )
}
