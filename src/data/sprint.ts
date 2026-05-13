export interface SprintPhase {
  name: string
  description: string
  start: string
  end: string
  disciplines: string[]
}

export const EXAM_DATE = '2026-06-28'

export const SPRINT_PHASES: SprintPhase[] = [
  {
    name: 'Consolidação',
    description: 'Gerais + início dos Específicos de TI',
    start: '2026-05-12',
    end: '2026-06-08',
    disciplines: ['portugues', 'constitucional', 'administrativo', 'afo', 'legislacao', 'historia', 'geografia'],
  },
  {
    name: 'Sprint TI',
    description: '10 temas de TI em ordem de peso FCC',
    start: '2026-06-09',
    end: '2026-06-21',
    disciplines: ['ti'],
  },
  {
    name: 'Simulados',
    description: 'Apenas revisão e simulados — sem conteúdo novo',
    start: '2026-06-22',
    end: '2026-06-27',
    disciplines: [],
  },
]

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getDaysToExam(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = parseLocal(EXAM_DATE)
  return Math.ceil((exam.getTime() - today.getTime()) / 86400000)
}

export function getCurrentPhase(): SprintPhase | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return SPRINT_PHASES.find(p => {
    const start = parseLocal(p.start)
    const end = parseLocal(p.end)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  }) ?? null
}

export function getPhaseProgress(phase: SprintPhase): { elapsed: number; total: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseLocal(phase.start)
  const end = parseLocal(phase.end)
  const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
  const elapsed = Math.max(0, Math.min(total, Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1))
  return { elapsed, total }
}
