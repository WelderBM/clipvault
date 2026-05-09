import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { ActivityDay } from '../hooks/useDashboardStats'

interface Props {
  data: ActivityDay[]
}

export default function Heatmap({ data }: Props) {
  if (data.length === 0) return null

  // Format data for Recharts
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    count: d.count
  }))

  return (
    <div className="w-full h-[120px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
              backgroundColor: '#1c1c1e', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#14b8a6' }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
          />
          <Bar 
            dataKey="count" 
            fill="#14b8a6" 
            radius={[2, 2, 0, 0]} 
            maxBarSize={4}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

