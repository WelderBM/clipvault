import { useState } from 'react'

interface Props {
  count: number
  onCancel: () => void
  /** Triggers a destructive bulk action — toolbar handles confirmation UI. */
  onDelete?: () => Promise<void> | void
  onArchive?: () => Promise<void> | void
  onReactivate?: () => Promise<void> | void
  /** Synchronous (e.g., copy to clipboard). */
  onExport?: () => void
}

/**
 * Sticky bottom bar shown when selection mode is active.
 * Pages decide which bulk actions to expose by passing handlers.
 */
export default function SelectionToolbar({
  count,
  onCancel,
  onDelete,
  onArchive,
  onReactivate,
  onExport,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [working, setWorking] = useState<null | 'delete' | 'archive' | 'reactivate' | 'export'>(null)
  const [exported, setExported] = useState(false)

  const wrap = (key: typeof working, fn: () => Promise<void> | void) => async () => {
    if (working) return
    setWorking(key)
    try {
      await fn()
    } finally {
      setWorking(null)
    }
  }

  const runDelete = wrap('delete', async () => {
    if (onDelete) await onDelete()
    setConfirmDelete(false)
  })
  const runArchive = onArchive ? wrap('archive', onArchive) : undefined
  const runReactivate = onReactivate ? wrap('reactivate', onReactivate) : undefined

  const runExport = () => {
    if (!onExport) return
    setWorking('export')
    try {
      onExport()
      setExported(true)
      setTimeout(() => setExported(false), 1800)
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-3 pb-3 pt-2 bg-void/95 backdrop-blur border-t border-border">
      <div className="bg-surface border border-border rounded-2xl px-3 py-2 flex flex-col gap-2">
        {/* Top row — count + cancel */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider">
            {count} selecionado{count !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onCancel}
            disabled={!!working}
            className="font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>

        {/* Action row */}
        {!confirmDelete ? (
          <div className="flex items-center gap-2">
            {onArchive && (
              <button
                onClick={runArchive}
                disabled={!!working}
                className="flex-1 py-2 rounded-xl text-xs font-body font-medium bg-amber/10 text-amber border border-amber/30 hover:bg-amber/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {working === 'archive' ? '...' : 'Arquivar'}
              </button>
            )}
            {onReactivate && (
              <button
                onClick={runReactivate}
                disabled={!!working}
                className="flex-1 py-2 rounded-xl text-xs font-body font-medium bg-teal/10 text-teal border border-teal/30 hover:bg-teal/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {working === 'reactivate' ? '...' : 'Reativar'}
              </button>
            )}
            {onExport && (
              <button
                onClick={runExport}
                disabled={!!working}
                className="flex-1 py-2 rounded-xl text-xs font-body font-medium bg-white/5 text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all active:scale-95 disabled:opacity-50"
              >
                {exported ? 'Copiado!' : 'Exportar'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={!!working}
                className="flex-1 py-2 rounded-xl text-xs font-body font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Deletar
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-white/70 flex-1">
              Apagar {count} card{count !== 1 ? 's' : ''}?
            </span>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={!!working}
              className="px-3 py-1.5 rounded-lg text-xs font-body text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={runDelete}
              disabled={!!working}
              className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {working === 'delete' ? 'Apagando...' : 'Confirmar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
