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

// Using Vite's import.meta.glob to load all JSON files in the directory dynamically
const jsonModules = import.meta.glob('./*.json', { eager: true });

export const TEXTOS_OFICIAIS: DocumentoOficial[] = Object.values(jsonModules).map(
  (module: any) => (module.default || module) as DocumentoOficial
);
