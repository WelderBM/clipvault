export default function ReaderPage() {
  return (
    <div className="px-4 pt-4">
      <header className="mb-6">
        <h1 className="font-display text-2xl tracking-wider text-teal">TEXTOS OFICIAIS</h1>
        <p className="font-body text-white/40 text-sm mt-1">Leitor focado para leis</p>
      </header>
      <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center px-8 border border-border border-dashed rounded-2xl py-12">
        <span className="text-4xl">📜</span>
        <p className="font-body text-white/40 text-sm">
          Em breve: Regimento Interno, Constituição Estadual e Leis Complementares.
        </p>
      </div>
    </div>
  )
}
