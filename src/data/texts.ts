export interface Artigo {
  numero: string;
  titulo?: string;
  caput: string;
  incisos?: string[];
  paragrafos?: string[];
  tags?: string[];
  hotFCC?: boolean;
  notaFCC?: string;
}

export interface DocumentoOficial {
  id: string;
  titulo: string;
  fonte: string;
  atualizadoEm: string;
  observacao?: string;
  artigos: Artigo[];
}

const jsonModules = import.meta.glob('./*.json')

export async function loadTextoOficial(id: string): Promise<DocumentoOficial | null> {
  const key = `./${id}.json`
  const loader = jsonModules[key]
  if (!loader) return null
  const mod = await loader() as { default: DocumentoOficial }
  return mod.default
}

export async function loadAllTextos(): Promise<DocumentoOficial[]> {
  const mods = await Promise.all(Object.values(jsonModules).map(l => l()))
  return (mods as { default: DocumentoOficial }[]).map(m => m.default)
}
