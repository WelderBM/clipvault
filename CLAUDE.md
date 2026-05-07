# ClipVault — Contexto do Projeto

## O que é este app

ClipVault é um app pessoal de estudos para concurso público (ALE-RR 2026 — Técnico Legislativo Especializado / Programador, banca FCC, prova em 28/06/2026). O app começou como um gerenciador de cards de texto (copy e paste rápido), mas está sendo transformado num dashboard pessoal central de estudos.

**Usuário único:** Welder Barroso, desenvolvedor fullstack, ~20 anos, Boa Vista/RR.

---

## Stack atual

- React 18 + TypeScript + Vite
- Tailwind CSS (mobile first)
- Firebase (Auth Google + Firestore)
- vite-plugin-pwa (PWA instalável)
- Yarn

## Estrutura Firestore atual

```
users/{userId}/cards/{cardId}
  title: string | null
  text: string
  color: string
  emoji: string
  category: string
  status: 'active' | 'used' | 'archived'
  createdAt: Timestamp
  usedAt: Timestamp | null
```

---

## Roadmap de features — o que será implementado

### FASE 1 — Melhorias no feed de Cards (tab existente)

- [ ] **Edição inline** — clicar no card abre modo de edição direto (título, texto, cor, emoji, categoria, matéria, importância)
- [ ] **Deleção individual** com confirmação (swipe ou long press no mobile)
- [ ] **Seleção múltipla** — long press entra em modo seleção → deletar/arquivar/exportar em lote
- [ ] **Inserção em lote via JSON** — campo para colar JSON no formato do app e importar vários cards de uma vez
- [ ] **Filtros rápidos** — chips horizontais por matéria, importância, status
- [ ] **Busca full-text** — filtra em tempo real por título e texto, destaca o trecho encontrado
- [ ] **Ordenação** — Recente / Urgente (score por importância + tempo desde última revisão)
- [ ] **Paginação com cursor Firestore** — `startAfter()`, 20 cards por página, scroll infinito

### FASE 2 — Novos campos no card (migração Firestore)

Adicionar aos cards existentes:

```typescript
discipline: "portugues" |
  "constitucional" |
  "administrativo" |
  "afo" |
  "legislacao" |
  "historia" |
  "geografia" |
  "ti";
importance: 1 | 2 | 3; // 1=normal, 2=importante, 3=hot topic FCC
lastReviewed: Timestamp | null;
reviewCount: number;
```

### FASE 3 — Navegação horizontal (nova estrutura de tabs)

O app muda de navegação vertical para **tabs horizontais iguais** — sem centralidade em nenhuma função:

```
Tab 1: 📋 Cards    (feed atual melhorado)
Tab 2: 📊 Dashboard
Tab 3: 🎯 Estratégia FCC
Tab 4: 📜 Textos Oficiais
```

### FASE 4 — Dashboard (Tab 2)

Componentes:

- **Radar chart** — 5 eixos: Português, Dir. Constitucional, Dir. Administrativo, AFO, Legislação+RR. Mostra volume de cards por matéria vs peso FCC.
- **Heatmap de atividade** — estilo GitHub contributions, dias com cards salvos/revisados
- **Lista do edital** — todos os tópicos com % FCC, badge "visto/não visto", data última revisão, contador de revisões
- **Hot topics** — os 8 tópicos com presença garantida em toda prova FCC, com status visual
- **Banner de offline** — faixa discreta quando em cache: "🔄 Offline — cache de Xh atrás"

### FASE 5 — Estratégia FCC (Tab 3)

Dados estáticos gerados externamente (não editáveis pelo usuário):

- Distribuição % de questões por matéria
- Ranking de subtemas por peso FCC
- Top 3 armadilhas por matéria
- Os 8 tópicos com presença garantida em toda prova
- Mapa de fontes (cursinho / Gran / NotebookLM)

### FASE 6 — Textos Oficiais / Leitor (Tab 4)

Leitor estilo Kindle para os documentos do edital:

**UX do leitor:**

- Tipografia serif (Lora ou Georgia), tamanho ajustável
- Três temas: branco / sépia / escuro — persistido no perfil
- Margens generosas, line-height 1.8
- Topo minimalista (só título + voltar)
- Índice lateral (swipe da direita) com artigos e marcadores

**Funcionalidades:**

- Highlight em 3 cores: amarelo (geral), laranja (armadilha FCC), vermelho (hot topic)
- Highlights salvos no Firestore por usuário
- Artigos com `hotFCC: true` destacados automaticamente em laranja suave
- Modo prova — oculta números dos artigos, você tenta identificar
- Marcador de leitura — registra até onde leu e quando

**Documentos disponíveis (JSONs pré-processados):**

- Regimento Interno ALERR (Res. 08/2023) — já gerado: `regimento_interno_alerr.json`
- Código de Ética Parlamentar (Res. 29/1995) — a gerar
- Constituição Estadual RR arts. 30–67 e 111–116 — a gerar
- LC 053/2001 — a gerar
- LC 373/2026 — a gerar

**Estrutura do JSON de cada documento:**

```typescript
interface DocumentoOficial {
  id: string;
  titulo: string;
  fonte: string;
  atualizadoEm: string;
  artigos: Artigo[];
}

interface Artigo {
  numero: string; // "Art. 45"
  titulo?: string; // "Das Sessões Ordinárias"
  caput: string; // Texto principal
  incisos?: string[];
  paragrafos?: string[];
  tags?: string[]; // para busca e filtro
  hotFCC?: boolean; // destaque automático
  notaFCC?: string; // anotação estratégica ao lado
}
```

### FASE 7 — Offline e sincronização

- Firebase offline persistence (já built-in no SDK)
- Paginação client-side sobre cache quando offline
- Banner de status de conectividade (3 estados: offline recente / offline antigo / sem cache)
- No leitor: "📖 Texto em cache · versão de DD/MM/AAAA"

---

## Contexto do concurso (para a Tab Estratégia)

**Matérias e pesos FCC — Conhecimentos Gerais (40 questões):**
| Matéria | % | ~Questões |
|---|---|---|
| Língua Portuguesa | 30% | ~12 |
| Dir. Constitucional | 20% | ~8 |
| Dir. Administrativo | 20% | ~8 |
| AFO | 15% | ~6 |
| Legislação Institucional | 10% | ~4 |
| História RR | 3% | ~1 |
| Geografia RR | 2% | ~1 |

**Os 8 hot topics com presença garantida em toda prova FCC:**

1. Interpretação de texto (Português)
2. HAVER/FAZER impessoais sempre singular (Português)
3. Impeachment — Câmara autoriza, Senado julga (Constitucional)
4. Anulação x Revogação — Judiciário não revoga (Administrativo)
5. Estágio probatório = 3 anos LC 053/2001 (Administrativo)
6. F-E-L-P — estágios da despesa (AFO)
7. Quórum progressivo ALERR — 1/3 discute, maioria absoluta vota (Legislação)
8. LGPD — controlador decide, operador executa (TI)

---

## Padrões de código

- Componentes funcionais com hooks
- Tailwind para estilização — sem CSS modules
- Firebase SDK v9+ (modular)
- Sem bibliotecas de estado global por enquanto (useState/useContext suficiente)
- Mobile first — testar no Chrome DevTools 390px antes de qualquer PR

## Convenções

- Nomes de componentes: PascalCase
- Arquivos de componentes: `ComponenteName.tsx`
- Hooks customizados: `useNomeDoHook.ts` na pasta `hooks/`
- Tipos/interfaces: `types.ts` na pasta relevante
- Constantes do edital/estratégia: `src/data/` (arquivos estáticos, não Firestore)

---

## JSONs gerados externamente (disponíveis para importar)

- `regimento_interno_alerr.json` — Regimento Interno ALERR Res. 08/2023, 18 artigos estruturados, 16 marcados como hotFCC

---

## O que NÃO fazer

- Não criar CSS modules — só Tailwind
- Não usar `any` em TypeScript
- Não fazer queries Firestore sem índice definido
- Não colocar lógica de negócio dentro de componentes de UI — separar em hooks
- Não começar pela Tab Dashboard — começar pela Fase 1 (melhorias no feed)
