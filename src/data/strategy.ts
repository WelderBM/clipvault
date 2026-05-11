import type { Discipline } from '../types'

export const FCC_WEIGHTS: Record<Discipline, number> = {
  portugues: 0.30,
  constitucional: 0.20,
  administrativo: 0.20,
  afo: 0.15,
  legislacao: 0.10,
  historia: 0.03,
  geografia: 0.02,
  ti: 1.00,
}

export const HOT_TOPICS = [
  "Interpretação de texto (Português)",
  "HAVER/FAZER impessoais sempre singular (Português)",
  "Impeachment — Câmara autoriza, Senado julga (Constitucional)",
  "Anulação x Revogação — Judiciário não revoga (Administrativo)",
  "Estágio probatório = 3 anos LC 053/2001 (Administrativo)",
  "F-E-L-P — estágios da despesa (AFO)",
  "Quórum progressivo ALERR — 1/3 discute, maioria absoluta vota (Legislação)",
  "LGPD — controlador decide, operador executa (TI)",
]

export interface DisciplineStrategy {
  discipline: Discipline
  topTopics: Array<{ topic: string; fccFreq: string }>
  traps: string[]
}

export const DISCIPLINE_STRATEGIES: DisciplineStrategy[] = [
  {
    discipline: 'portugues',
    topTopics: [
      { topic: 'Interpretação e compreensão de texto', fccFreq: '100%' },
      { topic: 'Concordância verbal — verbos impessoais', fccFreq: '90%' },
      { topic: 'Crase — obrigatória, facultativa, proibida', fccFreq: '85%' },
      { topic: 'Regência verbal (verbos de regência variável)', fccFreq: '80%' },
      { topic: 'Pronomes — colocação, emprego e referência', fccFreq: '75%' },
      { topic: 'Pontuação — vírgula obrigatória e proibida', fccFreq: '70%' },
      { topic: 'Conectivos — valor semântico e argumentativo', fccFreq: '65%' },
    ],
    traps: [
      'HAVER no sentido de "existir" e FAZER indicando tempo são SEMPRE impessoais (3ª singular)',
      'Crase proibida antes de verbo, pronome pessoal, masculino sem artigo',
      'FCC cobra "a qual / ao qual" — não confundir com crase',
      'O gabarito quase sempre explora o sentido INFERIDO, não o explícito',
      '"Não obstante", "ademais", "outrossim" — FCC ama arcaísmos formais',
    ],
  },
  {
    discipline: 'constitucional',
    topTopics: [
      { topic: 'Art. 5º — direitos individuais e remédios constitucionais', fccFreq: '95%' },
      { topic: 'Processo legislativo — EC, LC, LO, MP', fccFreq: '90%' },
      { topic: 'Administração Pública (Arts. 37-41) — LIMPE, concurso, estabilidade', fccFreq: '85%' },
      { topic: 'Poder Legislativo — atribuições, CPI, imunidades', fccFreq: '80%' },
      { topic: 'Impeachment — rito e quórum', fccFreq: '75%' },
      { topic: 'Constituição Estadual RR — Arts. 30-67 (ALERR)', fccFreq: '70%' },
    ],
    traps: [
      'Câmara AUTORIZA (2/3) o impeachment; Senado JULGA — nunca inverter',
      'Medida Provisória não pode EC, LC, direito penal, eleitoral, orçamento',
      'Iniciativa privativa do Presidente ≠ exclusividade de votação do Congresso',
      'Súmula Vinculante 13 (nepotismo) vale para cargos em comissão, não para eleitos',
      'Direitos sociais (Art. 6) e coletivos: rol exemplificativo, não taxativo',
    ],
  },
  {
    discipline: 'administrativo',
    topTopics: [
      { topic: 'Atos administrativos — requisitos, atributos, vícios', fccFreq: '95%' },
      { topic: 'Princípios LIMPE e correlatos', fccFreq: '90%' },
      { topic: 'Poderes administrativos — discricionário, vinculado, polícia', fccFreq: '85%' },
      { topic: 'Licitações — modalidades e dispensas (Lei 14.133/2021)', fccFreq: '80%' },
      { topic: 'Agentes públicos — estabilidade, estágio probatório', fccFreq: '80%' },
      { topic: 'LC 053/2001 — estatuto servidores RR', fccFreq: '75%' },
      { topic: 'Responsabilidade civil do Estado — teoria do risco', fccFreq: '70%' },
    ],
    traps: [
      'O JUDICIÁRIO não pode REVOGAR ato administrativo — só ANULAR',
      'Anulação tem efeito EX TUNC (retroage); Revogação tem efeito EX NUNC',
      'Ato discricionário ainda tem elementos vinculados (competência, forma, finalidade)',
      'Estágio probatório = 3 anos (LC 053/2001 RR), não 2 anos como no federal',
      'Improbidade: após Lei 14.230/2021, DOLO é exigido — culpa não basta mais',
    ],
  },
  {
    discipline: 'afo',
    topTopics: [
      { topic: 'Estágios da despesa — F-E-L-P', fccFreq: '100%' },
      { topic: 'Créditos adicionais — suplementar, especial, extraordinário', fccFreq: '90%' },
      { topic: 'PPA, LDO, LOA — conceitos e prazos', fccFreq: '85%' },
      { topic: 'Lei de Responsabilidade Fiscal — limites de pessoal', fccFreq: '80%' },
      { topic: 'Receita orçamentária — estágios e classificação', fccFreq: '75%' },
      { topic: 'Restos a pagar — processados e não processados', fccFreq: '70%' },
    ],
    traps: [
      'F-E-L-P: Fixação (LOA), Empenho (reserva), Liquidação (verificação), Pagamento',
      'Crédito extraordinário é o ÚNICO aberto por decreto do Executivo, sem PL',
      'LRF: limite PRUDENCIAL = 95% do máximo; MÁXIMO = teto mesmo',
      'PPA vigora por 4 anos mas inicia no 2º ano do mandato — pega concurso novo',
      'Restos a pagar PROCESSADOS = liquidados mas não pagos; passagem do exercício ok',
    ],
  },
  {
    discipline: 'legislacao',
    topTopics: [
      { topic: 'Regimento Interno ALERR — Mesa Diretora e composição', fccFreq: '100%' },
      { topic: 'Quórum: 1/3 discute, maioria absoluta vota', fccFreq: '95%' },
      { topic: 'Sessões: Ordinária, Extraordinária, Solene', fccFreq: '90%' },
      { topic: 'Código de Ética Parlamentar — deveres e penalidades', fccFreq: '75%' },
      { topic: 'LC 053/2001 — regime disciplinar e licenças', fccFreq: '70%' },
    ],
    traps: [
      'Mesa = 11 membros: 1 Presidente + 3 Vice + 4 Secretários + 3 Suplentes',
      'Mandato da Mesa = 2 anos; UMA reeleição permitida (Art. 12)',
      'Sessão Solene DISPENSA QUÓRUM — não confundir com Ordinária',
      'Convocação extraordinária: Governador, Presidente ALERR, OU maioria absoluta',
      'Sessão extraordinária = SEM pagamento de jetom extra',
    ],
  },
]
