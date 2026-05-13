import { useState } from 'react'
import type { MindMapNode } from '../lib/review'

function MindNode({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasKids = (node.children?.length ?? 0) > 0

  return (
    <div>
      <button
        onClick={() => hasKids ? setOpen(o => !o) : undefined}
        disabled={!hasKids}
        className={`
          flex items-start gap-2 w-full text-left rounded-xl transition-colors
          ${depth === 0
            ? 'px-4 py-3 bg-teal/10 border border-teal/25 mb-4'
            : 'px-3 py-2 hover:bg-white/[0.04]'}
          ${hasKids ? 'cursor-pointer' : 'cursor-default'}
        `}
      >
        <span className={`flex-shrink-0 mt-0.5 text-xs font-mono w-3 leading-none ${
          depth === 0 ? 'text-teal/60' : 'text-white/30'
        }`}>
          {hasKids ? (open ? '▾' : '▸') : '·'}
        </span>
        <span className={`font-body leading-snug ${
          depth === 0
            ? 'text-teal font-semibold text-base lg:text-lg'
            : depth === 1
            ? 'text-white/90 text-sm lg:text-[15px] font-medium'
            : 'text-white/65 text-sm'
        }`}>
          {node.name}
        </span>
      </button>

      {hasKids && open && (
        <div className={`border-l border-border/40 ml-[14px] pl-4 pb-1 space-y-0.5 ${
          depth === 0 ? 'mb-2' : ''
        }`}>
          {node.children!.map((child, i) => (
            <MindNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MindMapViewer({ data }: { data: MindMapNode }) {
  return (
    <div className="overflow-y-auto max-h-[480px] lg:max-h-[560px]">
      <MindNode node={data} depth={0} />
    </div>
  )
}
