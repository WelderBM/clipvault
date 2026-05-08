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
  artigos: Artigo[];
}

export const TEXTOS_OFICIAIS: DocumentoOficial[] = [
  {
    id: 'regimento_interno_alerr',
    titulo: 'Regimento Interno ALERR',
    fonte: 'Resolução 08/2023',
    atualizadoEm: '2023-01-01',
    artigos: [
      {
        numero: 'Art. 1º',
        caput: 'A Assembleia Legislativa do Estado de Roraima, órgão supremo do Poder Legislativo, tem sua sede na Capital do Estado.',
        hotFCC: false
      },
      {
        numero: 'Art. 2º',
        caput: 'A Assembleia Legislativa reunir-se-á, anualmente, na Capital do Estado, de 15 de fevereiro a 30 de junho e de 1º de agosto a 15 de dezembro.',
        hotFCC: true,
        notaFCC: 'Atenção às datas das sessões ordinárias.'
      },
      {
        numero: 'Art. 3º',
        caput: 'O número de Deputados à Assembleia Legislativa corresponderá ao triplo da representação do Estado na Câmara dos Deputados e, atingido o número de trinta e seis, será acrescido de tantos quantos forem os Deputados Federais acima de doze.',
        hotFCC: false
      }
    ]
  },
  {
    id: 'constituicao_estadual_rr',
    titulo: 'Constituição Estadual de Roraima',
    fonte: 'Assembleia Constituinte',
    atualizadoEm: '1991-12-31',
    artigos: [
      {
        numero: 'Art. 30',
        caput: 'A administração pública direta e indireta de qualquer dos Poderes do Estado e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência.',
        hotFCC: true,
        notaFCC: 'LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência)'
      },
      {
        numero: 'Art. 31',
        caput: 'Os cargos, empregos e funções públicas são acessíveis aos brasileiros que preencham os requisitos estabelecidos em lei, assim como aos estrangeiros, na forma da lei.',
        hotFCC: false
      }
    ]
  }
];
