import type { ReviewTable } from '../lib/review'

export default function TableViewer({ table }: { table: ReviewTable }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left font-body">
        <thead>
          <tr className="bg-surface">
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 font-mono text-[10px] lg:text-[11px] uppercase tracking-wider text-white/50 whitespace-nowrap border-b border-border"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-white/[0.02]'}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3 text-sm lg:text-[15px] text-white/75 leading-snug border-b border-border/50 last:border-b-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
