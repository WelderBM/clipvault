import { useRef, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import type { MindMapNode } from '../lib/review'
import type { RenderCustomNodeElementFn } from 'react-d3-tree'

const FONT_SIZE = 13
const CHAR_W = 7.5
const PAD = 20
const NODE_H = 38

const renderNode: RenderCustomNodeElementFn = ({ nodeDatum, toggleNode }) => {
  const label = nodeDatum.name
  const hasChildren = (nodeDatum.children?.length ?? 0) > 0
  const isCollapsed = nodeDatum.__rd3t?.collapsed ?? false
  const width = Math.max(90, label.length * CHAR_W + PAD * 2)

  return (
    <g onClick={hasChildren ? toggleNode : undefined} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
      <rect
        x={-width / 2}
        y={-NODE_H / 2}
        width={width}
        height={NODE_H}
        rx={9}
        fill="#0d1821"
        stroke={isCollapsed ? '#14b8a6' : '#1e3a4a'}
        strokeWidth={isCollapsed ? 2 : 1}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: FONT_SIZE,
          fill: 'rgba(255,255,255,0.88)',
          fontFamily: 'Inter, system-ui, sans-serif',
          userSelect: 'none',
        }}
      >
        {label}
      </text>
      {hasChildren && (
        <text
          x={width / 2 - 10}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 10, fill: '#14b8a6', userSelect: 'none' }}
        >
          {isCollapsed ? '+' : '−'}
        </text>
      )}
    </g>
  )
}

export default function MindMapViewer({ data }: { data: MindMapNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translate, setTranslate] = useState({ x: 80, y: 190 })

  useEffect(() => {
    if (!containerRef.current) return
    const { height } = containerRef.current.getBoundingClientRect()
    setTranslate({ x: 90, y: height / 2 })
  }, [])

  return (
    <div
      ref={containerRef}
      // touch-action: none tells the browser not to intercept touch events
      // for scrolling, allowing D3 zoom to capture pan/pinch gestures
      style={{ height: 380, touchAction: 'none', userSelect: 'none' }}
      className="overflow-hidden rounded-xl border border-border"
    >
      <Tree
        data={data}
        orientation="horizontal"
        pathFunc="step"
        translate={translate}
        zoom={1.0}
        zoomable
        draggable
        renderCustomNodeElement={renderNode}
        pathClassFunc={() => 'rd3t-link-dark'}
        separation={{ siblings: 1.3, nonSiblings: 1.8 }}
        nodeSize={{ x: 210, y: 58 }}
      />
      <style>{`
        .rd3t-link-dark { stroke: #1e3a4a !important; stroke-width: 1.5 !important; fill: none !important; }
        .rd3t-tree-container { touch-action: none !important; }
        .rd3t-tree-container svg { background: #03080F !important; touch-action: none !important; }
        .rd3t-tree-container * { touch-action: none !important; }
      `}</style>
    </div>
  )
}
