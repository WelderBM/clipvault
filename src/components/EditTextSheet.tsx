import { useState } from 'react'
import { updateTextoMetadata, deleteTexto, TEXT_CATEGORY_LABELS, type TextoOficial, type TextCategory } from '../lib/texts'
import { DISCIPLINES, DISCIPLINE_LABELS } from '../types'

interface Props {
  uid: string
  texto: TextoOficial
  onClose: () => void
  onDeleted: () => void
}

export default function EditTextSheet({ uid, texto, onClose, onDeleted }: Props) {
  const [titulo, setTitulo] = useState(texto.titulo)
  const [fonte, setFonte] = useState(texto.fonte)
  const [atualizadoEm, setAtualizadoEm] = useState(texto.atualizadoEm)
  const [disciplina, setDisciplina] = useState(texto.disciplina)
  const [categoria, setCategoria] = useState<TextCategory>(texto.categoria)
  const [ordem, setOrdem] = useState(String(texto.ordem))
  const [grupoId, setGrupoId] = useState(texto.grupoId ?? '')
  const [grupoParte, setGrupoParte] = useState(texto.grupoParte !== undefined ? String(texto.grupoParte) : '')
  const [grupoTotal, setGrupoTotal] = useState(texto.grupoTotal !== undefined ? String(texto.grupoTotal) : '')
  const [grupoTitulo, setGrupoTitulo] = useState(texto.grupoTitulo ?? '')

  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      const updates: Parameters<typeof updateTextoMetadata>[2] = {
        titulo: titulo.trim(),
        fonte: fonte.trim(),
        atualizadoEm: atualizadoEm.trim(),
        disciplina,
        categoria,
        ordem: Number(ordem) || 0,
      }
      if (grupoId.trim()) {
        updates.grupoId = grupoId.trim()
        if (grupoParte) updates.grupoParte = Number(grupoParte)
        if (grupoTotal) updates.grupoTotal = Number(grupoTotal)
        if (grupoTitulo.trim()) updates.grupoTitulo = grupoTitulo.trim()
      } else {
        // Clear group fields if grupoId is empty
        updates.grupoId = undefined
        updates.grupoParte = undefined
        updates.grupoTotal = undefined
        updates.grupoTitulo = undefined
      }
      await updateTextoMetadata(uid, texto.id, updates)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTexto(uid, texto.id)
      onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  const inputCls = "w-full bg-void border border-border rounded-xl px-3 py-2 font-body text-sm text-white/85 placeholder-white/20 focus:outline-none focus:border-teal/40 transition-colors"
  const selectCls = inputCls + " appearance-none"
  const labelCls = "font-mono text-[11px] text-white/40 uppercase tracking-wider"

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface border-t border-border rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-white tracking-wide">EDITAR TEXTO</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="font-mono text-[10px] text-white/25 -mt-2">{texto.id}</p>

        {/* Basic fields */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Título</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Fonte</label>
            <input value={fonte} onChange={e => setFonte(e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Atualizado em</label>
              <input value={atualizadoEm} onChange={e => setAtualizadoEm(e.target.value)} placeholder="YYYY-MM-DD" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Ordem</label>
              <input type="number" value={ordem} onChange={e => setOrdem(e.target.value)} min={1} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Matéria</label>
              <select value={disciplina} onChange={e => setDisciplina(e.target.value as typeof disciplina)} className={selectCls}>
                {DISCIPLINES.map(d => (
                  <option key={d} value={d}>{DISCIPLINE_LABELS[d]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value as TextCategory)} className={selectCls}>
                {(Object.keys(TEXT_CATEGORY_LABELS) as TextCategory[]).map(c => (
                  <option key={c} value={c}>{TEXT_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Group fields (collapsible) */}
        <details className="group">
          <summary className="font-mono text-[11px] text-white/40 uppercase tracking-wider cursor-pointer select-none list-none flex items-center gap-2">
            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Agrupamento de partes
          </summary>

          <div className="mt-3 space-y-3 pl-5 border-l border-border/40">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>grupoId <span className="normal-case text-white/25">(slug da lei pai)</span></label>
              <input value={grupoId} onChange={e => setGrupoId(e.target.value)} placeholder="lei-9784-1999" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>grupoTitulo</label>
              <input value={grupoTitulo} onChange={e => setGrupoTitulo(e.target.value)} placeholder="Lei 9.784/1999 — Processo Administrativo" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>grupoParte</label>
                <input type="number" value={grupoParte} onChange={e => setGrupoParte(e.target.value)} placeholder="1" min={1} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>grupoTotal</label>
                <input type="number" value={grupoTotal} onChange={e => setGrupoTotal(e.target.value)} placeholder="5" min={1} className={inputCls} />
              </div>
            </div>
          </div>
        </details>

        {/* Actions */}
        <button
          onClick={handleSave}
          disabled={!titulo.trim() || saving}
          className="w-full py-4 rounded-2xl font-body font-semibold text-sm bg-teal text-void disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-2xl font-body text-sm text-rose-400/70 hover:text-rose-400 transition-colors"
          >
            Excluir texto
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-3 rounded-2xl font-body text-sm border border-border text-white/50 hover:text-white/70 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 rounded-2xl font-body text-sm bg-rose-500/15 border border-rose-500/30 text-rose-400 disabled:opacity-40 active:scale-95 transition-all"
            >
              {deleting ? 'Excluindo…' : 'Confirmar exclusão'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
