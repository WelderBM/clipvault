import type { ActivityDay } from '../hooks/useDashboardStats'

interface Props {
  data: ActivityDay[]
}

export default function Heatmap({ data }: Props) {
  const getMax = () => Math.max(1, ...data.map(d => d.count))
  const maxCount = getMax()

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5'
    const intensity = count / maxCount
    if (intensity <= 0.25) return 'bg-teal/30'
    if (intensity <= 0.5) return 'bg-teal/50'
    if (intensity <= 0.75) return 'bg-teal/70'
    return 'bg-teal'
  }

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {data.map((day, i) => (
        <div
          key={i}
          title={`${day.date}: ${day.count} interações`}
          className={`w-3.5 h-3.5 rounded-sm transition-colors ${getColor(day.count)}`}
        />
      ))}
    </div>
  )
}
