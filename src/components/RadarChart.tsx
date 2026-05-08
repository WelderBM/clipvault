import { useMemo } from 'react'

export interface RadarData {
  label: string
  value: number // 0 to 1
  benchmark?: number // 0 to 1
}

interface Props {
  data: RadarData[]
}

export default function RadarChart({ data }: Props) {
  const size = 200
  const center = size / 2
  const radius = (size / 2) - 25 // Padding for labels

  const { webPaths, axes, benchPath, dataPath, dataPoints, labels } = useMemo(() => {
    if (data.length === 0) return { webPaths: [], axes: [], benchPath: null, dataPath: '', dataPoints: [], labels: [] }
    
    const angleStep = (Math.PI * 2) / data.length
    const getPoint = (val: number, i: number) => {
      const r = radius * val
      const angle = i * angleStep - Math.PI / 2
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    }

    const levels = 4
    const webPaths = Array.from({ length: levels }).map((_, level) => {
      const val = (level + 1) / levels
      const points = data.map((_, i) => getPoint(val, i))
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    })

    const axes = data.map((_, i) => getPoint(1, i))
    
    const dataPoints = data.map((d, i) => getPoint(d.value, i))
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

    const hasBenchmark = data.some(d => d.benchmark !== undefined)
    const benchPath = hasBenchmark 
      ? data.map((d, i) => getPoint(d.benchmark ?? 0, i)).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
      : null

    const labels = data.map((d, i) => ({
      ...getPoint(1.25, i),
      text: d.label
    }))

    return { webPaths, axes, benchPath, dataPath, dataPoints, labels }
  }, [data, center, radius])

  if (data.length === 0) return null

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        {/* Web */}
        {webPaths.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {/* Axes */}
        {axes.map((end, i) => (
          <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* Benchmark Polygon */}
        {benchPath && (
          <path d={benchPath} fill="none" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="1" strokeDasharray="3 3" />
        )}

        {/* Data Polygon */}
        <path d={dataPath} fill="rgba(20, 184, 166, 0.2)" stroke="rgba(20, 184, 166, 0.8)" strokeWidth="1.5" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#14b8a6" />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fill="rgba(255,255,255,0.6)"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {l.text}
          </text>
        ))}
      </svg>
    </div>
  )
}
