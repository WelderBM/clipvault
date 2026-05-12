import { useRef, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import type { MindMapNode } from '../lib/review'
import type { RenderCustomNodeElementFn } from 'react-d3-tree'

const renderNode: RenderCustomNodeElementFn = ({ nodeDatum, toggleNode }) => {
  const label = nodeDatum.name
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0
  const isCollapsed = nodeDatum.__rd3t?.collapsed ?? false
  const charWidth = 7
  const padding = 20
  const width = Math.max(80, label.length * charWidth + padding * 2)
  const height = 32

  return (
    <g onClick={hasChildren ? toggleNode : undefined} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        fill="#0d1821"
        stroke={isCollapsed ? '#14b8a6' : '#1e3a4a'}
        strokeWidth={isCollapsed ? 1.5 : 1}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 11, fill: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', userSelect: 'none' }}
      >
        {label}
      </text>
      {hasChildren && (
        <text
          x={width / 2 - 8}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 9, fill: '#14b8a6', userSelect: 'none' }}
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
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: 80, y: height / 2 })
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: 380, background: 'transparent' }} className="overflow-hidden rounded-xl border border-border">
      <Tree
        data={data}
        orientation="horizontal"
        pathFunc="step"
        translate={translate}
        zoom={0.85}
        zoomable
        draggable
        renderCustomNodeElement={renderNode}
        pathClassFunc={() => 'rd3t-link-dark'}
        separation={{ siblings: 1.2, nonSiblings: 1.6 }}
        nodeSize={{ x: 180, y: 50 }}
      />
      <style>{`
        .rd3t-link-dark { stroke: #1e3a4a !important; stroke-width: 1.5 !important; fill: none !important; }
        .rd3t-tree-container svg { background: #03080F !important; }
      `}</style>
    </div>
  )
}
