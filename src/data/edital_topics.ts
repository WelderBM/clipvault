import type { Discipline } from '../types'

export type TopicState = 'unseen' | 'seen' | 'practiced' | 'confident'

export interface EditalTopic {
  id: string
  label: string
  discipline: Discipline
  subtopics: string[]
  hotFCC?: boolean
}

export const EDITAL_TOPICS: EditalTopic[] = [
  // ─── LÍNGUA PORTUGUESA (30%) ───────────────────────────────────────────────
  {
    id: 'pt-interpretacao',
    label: 'Interpretação e compreensão de texto',
    discipline: 'portugues',
    hotFCC: true,
    subtopics: [
      'Inferências e pressupostos',
      'Identificação da ideia central e secundária',
      'Sentido contextual de palavras e expressões',
      'Relações lógico-discursivas (causa, consequência, oposição)',
    ],
  },
  {
    id: 'pt-tipologia',
    label: 'Tipos e gêneros textuais',
    discipline: 'portugues',
    subtopics: [
      'Narração, descrição, dissertação, argumentação, exposição',
      'Gêneros: artigo, editorial, notícia, carta, ofício',
    ],
  },
  {
    id: 'pt-coesao',
    label: 'Coesão e coerência textual',
    discipline: 'portugues',
    subtopics: [
      'Mecanismos de coesão referencial e sequencial',
      'Conectivos e operadores argumentativos',
      'Paralelismo sintático e semântico',
    ],
  },
  {
    id: 'pt-morfologia',
    label: 'Morfologia — classes de palavras',
    discipline: 'portugues',
    subtopics: [
      'Substantivo, adjetivo, verbo, advérbio, preposição, conjunção, interjeição',
      'Pronomes — classificação e emprego',
      'Formação de palavras (derivação, composição)',
    ],
  },
  {
    id: 'pt-concordancia',
    label: 'Concordância nominal e verbal',
    discipline: 'portugues',
    hotFCC: true,
    subtopics: [
      'Concordância do verbo HAVER e FAZER (impessoais — sempre singular)',
      'Casos especiais de concordância verbal (sujeito composto, coletivo)',
      'Concordância do adjetivo com dois ou mais substantivos',
    ],
  },
  {
    id: 'pt-regencia',
    label: 'Regência nominal e verbal',
    discipline: 'portugues',
    subtopics: [
      'Verbos de regência variável (assistir, visar, aspirar, querer, preferir)',
      'Regência nominal de adjetivos e substantivos',
    ],
  },
  {
    id: 'pt-crase',
    label: 'Emprego da crase',
    discipline: 'portugues',
    subtopics: [
      'Crase obrigatória, facultativa e proibida',
      'Casos especiais: antes de pronomes demonstrativos, nomes próprios',
    ],
  },
  {
    id: 'pt-pontuacao',
    label: 'Pontuação',
    discipline: 'portugues',
    subtopics: [
      'Vírgula — casos obrigatórios e proibidos',
      'Ponto e vírgula, dois-pontos, travessão, parênteses',
    ],
  },
  {
    id: 'pt-sintaxe',
    label: 'Sintaxe da oração e do período',
    discipline: 'portugues',
    subtopics: [
      'Termos essenciais, integrantes e acessórios',
      'Orações coordenadas e subordinadas',
      'Vozes verbais — ativa, passiva, reflexiva',
    ],
  },
  {
    id: 'pt-ortografia',
    label: 'Ortografia e acentuação',
    discipline: 'portugues',
    subtopics: [
      'Novo Acordo Ortográfico',
      'Regras de acentuação (oxítonas, paroxítonas, proparoxítonas)',
      'Uso de maiúsculas e minúsculas',
    ],
  },
  {
    id: 'pt-redacao-oficial',
    label: 'Redação oficial',
    discipline: 'portugues',
    subtopics: [
      'Manual de Redação da Presidência da República',
      'Características: impessoalidade, clareza, precisão, concisão',
      'Ofício, memorando, ata, relatório',
    ],
  },

  // ─── DIREITO CONSTITUCIONAL (20%) ──────────────────────────────────────────
  {
    id: 'cf-principios',
    label: 'Princípios fundamentais (Arts. 1-4)',
    discipline: 'constitucional',
    subtopics: [
      'Fundamentos da República (Art. 1º)',
      'Objetivos fundamentais (Art. 3º)',
      'Princípios das relações internacionais (Art. 4º)',
    ],
  },
  {
    id: 'cf-direitos-fundamentais',
    label: 'Direitos e garantias fundamentais (Art. 5)',
    discipline: 'constitucional',
    hotFCC: true,
    subtopics: [
      'Direitos individuais e coletivos — incisos do Art. 5º',
      'Remédios constitucionais (HC, MS, MI, HD, AP)',
      'Direitos sociais (Arts. 6-11)',
      'Direitos políticos e partidos políticos',
    ],
  },
  {
    id: 'cf-organizacao-estado',
    label: 'Organização do Estado',
    discipline: 'constitucional',
    subtopics: [
      'Federação — União, Estados, DF e Municípios',
      'Competências (privativas, comuns, concorrentes)',
      'Intervenção federal e estadual',
    ],
  },
  {
    id: 'cf-poder-legislativo',
    label: 'Poder Legislativo federal',
    discipline: 'constitucional',
    subtopics: [
      'Congresso Nacional — Câmara e Senado',
      'Atribuições exclusivas de cada casa',
      'Comissões parlamentares — CPI',
      'Imunidades parlamentares',
    ],
  },
  {
    id: 'cf-processo-legislativo',
    label: 'Processo legislativo (Arts. 59-69)',
    discipline: 'constitucional',
    hotFCC: true,
    subtopics: [
      'Espécies normativas — EC, LC, LO, medida provisória, lei delegada',
      'Iniciativa, deliberação, sanção, promulgação, publicação',
      'Veto presidencial — prazo e espécies',
      'Impeachment — Câmara autoriza (2/3), Senado julga',
    ],
  },
  {
    id: 'cf-administracao-publica',
    label: 'Administração Pública (Arts. 37-43)',
    discipline: 'constitucional',
    hotFCC: true,
    subtopics: [
      'Princípios LIMPE',
      'Concurso público, estabilidade e vitaliciedade',
      'Teto remuneratório',
      'Nepotismo (Súmula Vinculante 13)',
    ],
  },
  {
    id: 'cf-constitucional-estadual',
    label: 'Constituição Estadual RR — Arts. 30-67 e 111-116',
    discipline: 'constitucional',
    subtopics: [
      'Poder Legislativo estadual — Assembleia Legislativa',
      'Processo legislativo estadual',
      'Servidores públicos estaduais (Arts. 111-116)',
    ],
  },

  // ─── DIREITO ADMINISTRATIVO (20%) ──────────────────────────────────────────
  {
    id: 'adm-principios',
    label: 'Princípios da Administração Pública',
    discipline: 'administrativo',
    hotFCC: true,
    subtopics: [
      'LIMPE — legalidade, impessoalidade, moralidade, publicidade, eficiência',
      'Supremacia do interesse público e indisponibilidade',
      'Princípios implícitos: razoabilidade, proporcionalidade, segurança jurídica',
    ],
  },
  {
    id: 'adm-atos',
    label: 'Atos administrativos',
    discipline: 'administrativo',
    hotFCC: true,
    subtopics: [
      'Elementos/requisitos (competência, finalidade, forma, motivo, objeto)',
      'Atributos: presunção de legitimidade, imperatividade, autoexecutoriedade, tipicidade',
      'Vícios de legalidade — anulação x revogação (Judiciário não revoga)',
      'Classificação e espécies de atos',
    ],
  },
  {
    id: 'adm-poderes',
    label: 'Poderes administrativos',
    discipline: 'administrativo',
    subtopics: [
      'Poder vinculado, discricionário, hierárquico, disciplinar',
      'Poder de polícia — atributos e limites',
      'Poder regulamentar e normativo',
      'Abuso de poder — excesso e desvio',
    ],
  },
  {
    id: 'adm-direta-indireta',
    label: 'Administração direta e indireta',
    discipline: 'administrativo',
    subtopics: [
      'Autarquias, fundações públicas, empresas públicas, sociedades de economia mista',
      'Regime jurídico de cada entidade',
      'Agências reguladoras e executivas',
    ],
  },
  {
    id: 'adm-licitacao',
    label: 'Licitações e contratos — Lei 14.133/2021',
    discipline: 'administrativo',
    subtopics: [
      'Modalidades: pregão, concorrência, concurso, leilão, diálogo competitivo',
      'Dispensas e inexigibilidades',
      'Tipos de licitação e critérios de julgamento',
      'Contratos administrativos — cláusulas exorbitantes',
    ],
  },
  {
    id: 'adm-agentes-publicos',
    label: 'Agentes públicos — cargos e funções',
    discipline: 'administrativo',
    hotFCC: true,
    subtopics: [
      'Cargos, empregos e funções públicas',
      'Provimento derivado e originário',
      'Estabilidade — requisitos e perda',
      'Responsabilidade do servidor (administrativa, civil, penal)',
    ],
  },
  {
    id: 'adm-responsabilidade',
    label: 'Responsabilidade civil do Estado',
    discipline: 'administrativo',
    subtopics: [
      'Teoria do risco administrativo (objetiva)',
      'Excludentes e atenuantes',
      'Ação regressiva contra o agente',
    ],
  },
  {
    id: 'adm-processo',
    label: 'Processo administrativo — Lei 9.784/1999',
    discipline: 'administrativo',
    subtopics: [
      'Princípios do processo administrativo',
      'Fases, prazos e recursos',
      'Contraditório e ampla defesa',
    ],
  },
  {
    id: 'adm-improbidade',
    label: 'Improbidade administrativa — Lei 8.429/1992',
    discipline: 'administrativo',
    subtopics: [
      'Atos que importam enriquecimento ilícito (Art. 9)',
      'Atos que causam prejuízo ao erário (Art. 10)',
      'Atos que atentam contra princípios (Art. 11)',
      'Sanções — alterações da Lei 14.230/2021 (dolo necessário)',
    ],
  },
  {
    id: 'adm-lc053',
    label: 'LC 053/2001 — Estatuto dos Servidores de RR',
    discipline: 'administrativo',
    hotFCC: true,
    subtopics: [
      'Estágio probatório = 3 anos',
      'Licenças e afastamentos',
      'Regime disciplinar e penalidades',
      'Aposentadoria e benefícios previdenciários',
    ],
  },

  // ─── AFO (15%) ─────────────────────────────────────────────────────────────
  {
    id: 'afo-principios',
    label: 'Princípios orçamentários',
    discipline: 'afo',
    subtopics: [
      'Unidade, universalidade, anualidade, exclusividade',
      'Especificação, equilíbrio, publicidade, não vinculação da receita',
    ],
  },
  {
    id: 'afo-ciclo',
    label: 'Ciclo orçamentário — PPA, LDO e LOA',
    discipline: 'afo',
    subtopics: [
      'PPA — vigência (4 anos), objetivos e metas de longo prazo',
      'LDO — prioridades, metas fiscais, FCBE',
      'LOA — estrutura e aprovação',
      'Relações entre os três instrumentos',
    ],
  },
  {
    id: 'afo-lei-4320',
    label: 'Lei 4.320/1964 — normas gerais',
    discipline: 'afo',
    hotFCC: true,
    subtopics: [
      'Receita orçamentária vs. extraorçamentária',
      'Despesa orçamentária vs. extraorçamentária',
      'Classificação da receita (corrente, capital)',
      'Classificação da despesa (corrente, capital)',
    ],
  },
  {
    id: 'afo-receitas',
    label: 'Receitas públicas — conceito e estágios',
    discipline: 'afo',
    subtopics: [
      'Previsão, lançamento, arrecadação, recolhimento',
      'Receitas originárias x derivadas',
      'Ingressos extraorçamentários',
    ],
  },
  {
    id: 'afo-despesas',
    label: 'Despesas públicas — conceito e estágios (F-E-L-P)',
    discipline: 'afo',
    hotFCC: true,
    subtopics: [
      'F-E-L-P: Fixação, Empenho, Liquidação, Pagamento',
      'Restos a pagar (processados e não processados)',
      'Despesas de exercícios anteriores (DEA)',
    ],
  },
  {
    id: 'afo-creditos',
    label: 'Créditos adicionais',
    discipline: 'afo',
    subtopics: [
      'Suplementares — reforçar dotação existente, PL',
      'Especiais — sem dotação específica, PL',
      'Extraordinários — urgência, MP ou decreto',
    ],
  },
  {
    id: 'afo-lrf',
    label: 'Lei de Responsabilidade Fiscal — LC 101/2000',
    discipline: 'afo',
    subtopics: [
      'Limites de gastos com pessoal (Prudencial e Máximo)',
      'Metas fiscais e demonstrativos exigidos',
      'Vedações em ano eleitoral',
      'Transparência fiscal — portal da transparência',
    ],
  },
  {
    id: 'afo-controle',
    label: 'Controle e fiscalização — TCU/TCE',
    discipline: 'afo',
    subtopics: [
      'Controle interno e externo',
      'Tribunal de Contas da União — competências',
      'TCE-RR — fiscalização da ALERR',
    ],
  },

  // ─── LEGISLAÇÃO INSTITUCIONAL (10%) ────────────────────────────────────────
  {
    id: 'leg-regimento',
    label: 'Regimento Interno ALERR — Res. 08/2023',
    discipline: 'legislacao',
    hotFCC: true,
    subtopics: [
      'Mesa Diretora — composição (11 membros: Presidente, 3 Vice, 4 Secretários, 3 Suplentes)',
      'Mandato da Mesa = 2 anos, permitida 1 reeleição (Art. 12)',
      'Sessões: Ordinárias (ter/qua/qui 9h-12h), Extraordinárias, Solenes',
      'Sessão Solene — dispensa quórum (Art. 21)',
      'Quórum: 1/3 para deliberar, maioria absoluta para votar (Art. 132)',
      'Pequeno Expediente 20min, Grande Expediente 60min, Ordem do Dia 60min (Art. 133)',
      'Convocação extraordinária: Governador, Presidente ALERR ou maioria absoluta (Art. 135)',
    ],
  },
  {
    id: 'leg-codigo-etica',
    label: 'Código de Ética Parlamentar — Res. 29/1995',
    discipline: 'legislacao',
    subtopics: [
      'Deveres do Deputado Estadual',
      'Condutas vedadas',
      'Processo e penalidades disciplinares',
    ],
  },
  {
    id: 'leg-const-rr-legislativo',
    label: 'Constituição Estadual RR — Poder Legislativo (Arts. 30-67)',
    discipline: 'legislacao',
    subtopics: [
      'Composição e funcionamento da ALERR',
      'Competências privativas da ALERR',
      'Processo legislativo estadual',
      'Fiscalização e controle',
    ],
  },
  {
    id: 'leg-const-rr-servidores',
    label: 'Constituição Estadual RR — Servidores (Arts. 111-116)',
    discipline: 'legislacao',
    subtopics: [
      'Regime jurídico único',
      'Estabilidade e estágio probatório',
      'Previdência social do servidor estadual',
    ],
  },
  {
    id: 'leg-lc373',
    label: 'LC 373/2026 — regime jurídico / cargos ALERR',
    discipline: 'legislacao',
    subtopics: [
      'Estrutura de cargos técnicos da ALERR',
      'Requisitos para o cargo de Programador',
      'Direitos, deveres e regime disciplinar',
    ],
  },

  // ─── HISTÓRIA DE RORAIMA (3%) ───────────────────────────────────────────────
  {
    id: 'hist-formacao',
    label: 'Formação histórica de Roraima',
    discipline: 'historia',
    subtopics: [
      'Colonização e ocupação do território',
      'Criação do Território Federal (1943)',
      'Transformação em Estado — CF/1988',
    ],
  },
  {
    id: 'hist-municipios',
    label: 'Municípios e divisão administrativa',
    discipline: 'historia',
    subtopics: [
      '15 municípios de Roraima',
      'Capital Boa Vista — história e fundação',
      'Regiões geográficas e administrativas',
    ],
  },
  {
    id: 'hist-politica',
    label: 'Aspectos políticos e econômicos',
    discipline: 'historia',
    subtopics: [
      'Primeiros governadores',
      'Economia: pecuária, mineração, agropecuária',
      'Questão indígena e Terra Indígena Yanomami',
    ],
  },

  // ─── GEOGRAFIA DE RORAIMA (2%) ──────────────────────────────────────────────
  {
    id: 'geo-localizacao',
    label: 'Localização, limites e fronteiras',
    discipline: 'geografia',
    subtopics: [
      'Limites: Venezuela (N/NO), Guiana (NE/L), Pará (SE), Amazonas (SO)',
      'Posição geográfica — único estado totalmente ao norte da linha do Equador',
    ],
  },
  {
    id: 'geo-fisico',
    label: 'Aspectos físicos — relevo, clima, hidrografia',
    discipline: 'geografia',
    subtopics: [
      'Relevo: Planalto das Guianas, Lavrado (Campos do Rio Branco), várzeas',
      'Clima equatorial e tropical',
      'Rio Branco e bacia hidrográfica do Amazonas',
    ],
  },
  {
    id: 'geo-recursos',
    label: 'Recursos naturais e biomas',
    discipline: 'geografia',
    subtopics: [
      'Biomas: Amazônia e Lavrado (Cerrado)',
      'Minerais: ouro, diamante, cassiterita',
      'Povos indígenas e terras demarcadas',
    ],
  },

  // ─── TI — CONHECIMENTOS ESPECÍFICOS (Programador) ──────────────────────────
  {
    id: 'ti-algoritmos',
    label: 'Algoritmos e estruturas de dados',
    discipline: 'ti',
    subtopics: [
      'Complexidade de algoritmos (Big O)',
      'Filas, pilhas, listas encadeadas, árvores',
      'Algoritmos de ordenação e busca',
      'Recursão e programação dinâmica',
    ],
  },
  {
    id: 'ti-poo',
    label: 'Programação orientada a objetos',
    discipline: 'ti',
    subtopics: [
      'Encapsulamento, herança, polimorfismo, abstração',
      'Padrões de projeto (Design Patterns) — GoF',
      'SOLID — princípios de design',
      'Java, Python ou C# como exemplos de implementação',
    ],
  },
  {
    id: 'ti-banco-dados',
    label: 'Banco de dados relacionais e SQL',
    discipline: 'ti',
    subtopics: [
      'Modelo relacional — normalização (1FN, 2FN, 3FN, BCNF)',
      'SQL: DDL, DML, DCL, TCL',
      'Joins, subqueries, views, procedures, triggers',
      'Transações e propriedades ACID',
      'NoSQL — MongoDB, Redis: conceitos e casos de uso',
    ],
  },
  {
    id: 'ti-dev-web',
    label: 'Desenvolvimento web',
    discipline: 'ti',
    subtopics: [
      'HTML semântico e acessibilidade (WCAG)',
      'CSS — Flexbox, Grid, responsividade',
      'JavaScript — ES6+, assíncrono (Promises, async/await)',
      'React — hooks, estado, lifecycle, Context API',
      'TypeScript — tipos, interfaces, generics',
      'REST APIs — métodos HTTP, status codes, JSON',
    ],
  },
  {
    id: 'ti-redes',
    label: 'Redes de computadores',
    discipline: 'ti',
    subtopics: [
      'Modelo OSI e TCP/IP — camadas e protocolos',
      'TCP vs UDP — características e usos',
      'HTTP/HTTPS, FTP, SMTP, DNS, DHCP',
      'Roteamento, endereçamento IP (IPv4/IPv6), sub-redes (CIDR)',
      'VPN, proxy, firewall',
    ],
  },
  {
    id: 'ti-seguranca',
    label: 'Segurança da informação',
    discipline: 'ti',
    subtopics: [
      'CID — confidencialidade, integridade, disponibilidade',
      'Criptografia simétrica e assimétrica',
      'Autenticação: OAuth 2.0, JWT, MFA',
      'OWASP Top 10 — vulnerabilidades web',
      'Backup e recuperação de desastres',
    ],
  },
  {
    id: 'ti-lgpd',
    label: 'LGPD — Lei 13.709/2018',
    discipline: 'ti',
    hotFCC: true,
    subtopics: [
      'Controlador decide finalidade e meios do tratamento',
      'Operador realiza o tratamento conforme instruções do controlador',
      'Bases legais para tratamento de dados (Art. 7)',
      'Direitos do titular dos dados',
      'DPO (Encarregado) — papel e responsabilidades',
      'ANPD — Autoridade Nacional de Proteção de Dados',
    ],
  },
  {
    id: 'ti-engenharia-sw',
    label: 'Engenharia de software e metodologias ágeis',
    discipline: 'ti',
    subtopics: [
      'Ciclo de vida do software — modelos (cascata, espiral, incremental)',
      'Scrum — papéis, cerimônias, artefatos',
      'Kanban — fluxo contínuo e WIP limits',
      'XP e TDD — desenvolvimento orientado a testes',
      'UML — diagramas de caso de uso, classe, sequência',
    ],
  },
  {
    id: 'ti-arquitetura',
    label: 'Arquitetura de sistemas',
    discipline: 'ti',
    subtopics: [
      'Microsserviços vs monolito — trade-offs',
      'API Gateway, service mesh',
      'Mensageria — Kafka, RabbitMQ conceitos',
      'Cache — Redis, CDN',
      'Padrões: MVC, MVVM, Clean Architecture',
    ],
  },
  {
    id: 'ti-cloud',
    label: 'Cloud computing',
    discipline: 'ti',
    subtopics: [
      'Modelos IaaS, PaaS, SaaS',
      'Nuvem pública, privada, híbrida',
      'AWS, Azure, GCP — serviços principais',
      'Escalabilidade horizontal e vertical',
    ],
  },
  {
    id: 'ti-devops',
    label: 'DevOps, CI/CD e containerização',
    discipline: 'ti',
    subtopics: [
      'Git — fluxo de trabalho (branching, merge, rebase)',
      'CI/CD — pipelines, GitHub Actions, Jenkins',
      'Docker — imagens, containers, Dockerfile',
      'Kubernetes — pods, deployments, services (conceitos)',
    ],
  },
  {
    id: 'ti-so',
    label: 'Sistemas operacionais',
    discipline: 'ti',
    subtopics: [
      'Processos e threads — gerenciamento e sincronização',
      'Memória — paginação, segmentação, memória virtual',
      'Sistema de arquivos — FAT, NTFS, ext4',
      'Linux — comandos básicos, permissões, scripts bash',
    ],
  },
]

export const TOPIC_STATE_LABELS: Record<TopicState, string> = {
  unseen: 'Não visto',
  seen: 'Visto',
  practiced: 'Praticado',
  confident: 'Dominado',
}

export const TOPIC_STATE_COLORS: Record<TopicState, string> = {
  unseen: 'bg-white/5 border-white/10 text-white/30',
  seen: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  practiced: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  confident: 'bg-teal-500/10 border-teal-500/30 text-teal',
}

export const TOPIC_STATE_DOT: Record<TopicState, string> = {
  unseen: 'bg-white/20',
  seen: 'bg-sky-400',
  practiced: 'bg-amber-400',
  confident: 'bg-teal',
}
