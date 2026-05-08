import { useDashboardStats } from '../hooks/useDashboardStats'
import RadarChart from '../components/RadarChart'
import Heatmap from '../components/Heatmap'
import { FCC_WEIGHTS, HOT_TOPICS } from '../data/strategy'
import { DISCIPLINE_LABELS, type Discipline } from '../types'

export default function DashboardPage() {
  const stats = useDashboardStats()

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate percentages for the radar chart
  const geralDisciplines: Discipline[] = [
    'portugues', 'constitucional', 'administrativo', 'afo', 'legislacao'
  ]
  
  const sumGeralCards = geralDisciplines.reduce((acc, d) => acc + stats.cardsByDiscipline[d], 0) || 1
  
  const radarData = geralDisciplines.map(d => {
    const cardPct = stats.cardsByDiscipline[d] / sumGeralCards
    // Benchmark is the relative weight in conhecimentos gerais.
    // Português (30), Const (20), Adm (20), AFO (15), Legislação (10). Sum = 95.
    const benchPct = FCC_WEIGHTS[d] / 0.95
    
    // Normalize to 0-1 for radar chart. Scale to make differences visible.
    const scale = 2.0 
    
    return {
      label: d.substring(0, 5).toUpperCase(),
      value: Math.min(1, cardPct * scale),
      benchmark: Math.min(1, benchPct * scale)
    }
  })

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      <header>
        <h1 className="font-display text-2xl tracking-wider text-teal">DASHBOARD</h1>
        <p className="font-body text-white/40 text-[11px] uppercase tracking-wider mt-1">Estatísticas e progresso</p>
      </header>

      {/* Top Numbers */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Total de Cards</p>
          <p className="font-display text-2xl text-white">{stats.totalCards}</p>
          <p className="font-body text-[10px] text-teal mt-1">{stats.activeCards} ativos</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Revisões</p>
          <p className="font-display text-2xl text-white">{stats.reviewedCards}</p>
          <p className="font-body text-[10px] text-amber mt-1">
            {stats.totalCards ? Math.round((stats.reviewedCards / stats.totalCards) * 100) : 0}% engajados
          </p>
        </div>
      </section>

      {/* Radar Chart */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Volume vs Peso FCC</span>
          <span className="flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-teal/40 rounded-sm" /> Cards</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0 border-t border-amber border-dashed" /> Edital</span>
          </span>
        </h2>
        <RadarChart data={radarData} />
      </section>

      {/* Heatmap */}
      <section className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-4">
          Atividade (60 dias)
        </h2>
        <Heatmap data={stats.activityHeatmap} />
      </section>

      {/* Lista do Edital */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1">Cobertura do Edital</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {geralDisciplines.map((d, i) => (
            <div key={d} className={`px-4 py-3 flex items-center justify-between ${i !== 0 ? 'border-t border-border' : ''}`}>
              <div>
                <p className="font-body text-sm text-white/90">{DISCIPLINE_LABELS[d]}</p>
                <p className="font-mono text-[10px] text-amber mt-0.5">{Math.round(FCC_WEIGHTS[d] * 100)}% da prova</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-teal">{stats.cardsByDiscipline[d]}</p>
                <p className="font-mono text-[10px] text-white/40 mt-0.5">cards</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Topics */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] text-white/60 uppercase tracking-wider ml-1 flex items-center gap-1">
          <span>🔥</span> Hot Topics FCC
        </h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {HOT_TOPICS.map((topic, i) => (
            <div key={i} className="px-4 py-3">
              <p className="font-body text-xs text-white/80 leading-relaxed">{topic}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
