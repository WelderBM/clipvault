import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis } from 'recharts'

export interface RadarData {
  label: string
  value: number // 0 to 1
  benchmark?: number // 0 to 1
}

interface Props {
  data: RadarData[]
}

export default function RadarChart({ data }: Props) {
  if (data.length === 0) return null

  const chartData = data.map(d => ({
    label: d.label,
    Cobertura: d.value,
    Peso: d.benchmark ?? 0,
  }))

  return (
    <div className="flex justify-center">
      <RechartsRadarChart
        width={280}
        height={250}
        cx="50%"
        cy="50%"
        outerRadius="70%"
        data={chartData}
      >
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'monospace' }}
        />
        <Radar
          name="Peso FCC"
          dataKey="Peso"
          stroke="rgba(251, 191, 36, 0.5)"
          fill="none"
          strokeDasharray="3 3"
        />
        <Radar
          name="Cobertura"
          dataKey="Cobertura"
          stroke="#14b8a6"
          fill="rgba(20, 184, 166, 0.2)"
          fillOpacity={1}
        />
      </RechartsRadarChart>
    </div>
  )
}
