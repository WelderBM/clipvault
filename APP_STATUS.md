# CLIPVAULT — ESTADO ATUAL

> Gerado em: 2026-05-24 | Branch: `claude/extract-chat-context-Gf76V`
> Concurso-alvo: ALE-RR 2026 — Técnico Legislativo Especializado / Programador (FCC, 28/06/2026)

---

## IMPLEMENTADO ✅

### Dashboard (`src/pages/DashboardPage.tsx`)
- **Radar chart** — 8 eixos de disciplina, via `recharts` (`src/components/RadarChart.tsx`)
- **Heatmap de atividade** — via `recharts` (`src/components/Heatmap.tsx`)
- **SprintSection** — hot topics FCC ordenados por urgência (score × peso FCC) (`src/components/SprintSection.tsx`)
- **ReviewTodaySection** — tópicos com RetentionScore < 0.55, abre `SessionPickerSheet` (`src/components/ReviewTodaySection.tsx`)
- **ProgressImportSheet** — importação JSON de `topicProgress` + `reviewContent` + `weeklyLog` (`src/components/ProgressImportSheet.tsx`)
- **Filter chips** — filtra tópicos por bracket de retenção (Fresco / Bom / Esquecendo / Crítico)
- **SessionPickerSheet** — registrar sessão de estudo por tópico (`src/components/SessionPickerSheet.tsx`)

### Cards (`src/pages/HomePage.tsx`)
- **Criação** via `CreateCardSheet`, **edição inline** e **deleção** com confirmação
- **Seleção múltipla** via long press (`useLongPress`, `useSelection`, `SelectionToolbar`)
- **Importação em lote** via JSON — `ImportCardsSheet`
- **Filtros** por matéria, importância, status — `FilterBar`
- **Busca full-text** com highlight em tempo real — `useFilteredCards`
- **Ordenação** Recente / Urgente
- **Paginação cursor Firestore** — `startAfter()`, 20 por página, scroll infinito (`useCards`)
- **Campos novos**: `discipline`, `importance`, `lastReviewed`, `reviewCount`

### Leitor (`src/pages/ReaderPage.tsx`)
- **Fonte dos textos**: Firestore (`users/{uid}/texts/{id}`) — migrado de JSON estático
- **Navegação 2 níveis**: matéria → lista de textos/grupos → artigos
- **Agrupamento de partes**: `grupoId` / `grupoParte` / `grupoTotal` / `grupoTitulo` — navegação prev/next entre partes
- **Highlights em 3 cores**: amarelo / laranja / vermelho — salvos no Firestore via `src/lib/reader.ts`
- **Marcador de leitura** — posição registrada por texto
- **Modo Prova** — oculta números dos artigos (toggle com ícone EyeOff)
- **3 temas visuais**: dark / light / sépia — seletor de bolinhas coloridas no painel de config
- **Tamanho de fonte ajustável** — slider `0.85rem → 1.25rem` via `style={{ fontSize }}`
- **Toggle hotFCC por artigo** — ícone 🔥, persiste no Firestore via `updateArtigos`
- **ImportTextSheet** — valida e importa JSON com campos `disciplina`, `categoria`, `ordem` (`src/components/ImportTextSheet.tsx`)
- **EditTextSheet** — editar metadados + seção collapsível de grupo + deleção com confirmação (`src/components/EditTextSheet.tsx`)
- **4 documentos JSONs pré-processados**:
  - `regimento_interno_alerr.json`
  - `codigo_etica_parlamentar_alerr.json`
  - `constituicao_estadual_rr.json`
  - `lc_053_2001_roraima.json`

### Revisão (`src/pages/ReviewPage.tsx`)
- **ReviewSheet** — sheet full-screen com tabs dinâmicas (só mostra tabs dos formatos presentes)
- **Flashcards** — flip animado via `framer-motion`, placar sessão "Sabia / Errei" (`FlashcardViewer`)
- **Mapa Mental** — árvore colapsável por nível, HTML nativo (`MindMapViewer`)
- **Checklist** — checkboxes com barra de progresso `X de N` (`ChecklistViewer`)
- **Cloze** — inputs inline por lacuna, "Verificar" destaca verde/vermelho, "Revelar tudo" (`ClozeViewer`)
- **Tabela** — `overflow-x-auto`, linhas alternadas, cabeçalho destacado (`TableViewer`)
- **Texto** — seções com título, parágrafo e bullets (inline em `ReviewSheet`)
- **Filter chips** por disciplina
- **RetentionScore** exibido como dot colorido por tópico

### Revisão Espaçada — Ebbinghaus (`src/lib/progress.ts`)
- `SessionType`: `seen` | `socratic` | `questions` | `questions_ok` | `confident`
- `HALF_LIFE_DAYS`: 2 / 5 / 10 / 18 / 30 dias
- `calcRetentionScore()`: `0.5^(daysSince / halfLife)` → 0.0–1.0
- `getRetentionLabel()`: Fresco / Bom / Esquecendo / Crítico
- `getTopicDotClass()`: cores semânticas por faixa de score
- **Firestore**: `users/{uid}/topicProgress/{topicId}` — `{ topicId, lastSessionType, lastStudiedAt: Timestamp, sessionCount, updatedAt }`
- **Backward compat**: `normalizeDoc()` lê formato legado `{ state: TopicState }` transparentemente

### Tab Semana (`src/pages/WeeklyPage.tsx`)
- `WeeklyEntrySheet` — entrada de sessões por dia / disciplina / tópico
- Log semanal: 7 dias, `users/{uid}/weeklyLog/{weekKey}` — `src/lib/weekly.ts`
- Auto-advance: tópicos sem `topicProgress` são sugeridos como novos na semana

### Infraestrutura
- **PWA**: `vite-plugin-pwa` com `autoUpdate`, `workbox`, `manifest` (instalável no mobile)
- **Firebase Offline**: `persistentLocalCache` + `persistentMultipleTabManager` — ativo em `src/lib/firebase.ts`
- **ConnectivityBanner** — detecta online/offline (`src/components/ConnectivityBanner.tsx`)
- **Auth Google**: `signInWithPopup(googleProvider)`
- **Firestore rules**: `users/{uid}/**` cobre todos os subcollections (`firestore.rules`)

---

## PARCIAL ⚠️

### MindMapViewer — HTML nativo, sem pan/zoom
- **Planejado**: `react-d3-tree` com orientation horizontal, pan/zoom real no mobile
- **Implementado**: Árvore colapsável em HTML/Tailwind, clique expande/colapsa por nível
- **Gap**: Sem arrastar, sem zoom, sem orientação horizontal
- **Impacto**: Funcional para estudo, mas mapas com muitos ramos ficam verticais e longos
- **Arquivo**: `src/components/MindMapViewer.tsx`

### Tema e tamanho de fonte do leitor — não persistem
- **Planejado**: "persistido no perfil"
- **Implementado**: `useState('dark')` e `useState(1)` — resetam ao fechar o app
- **Gap**: Sem `localStorage` ou Firestore para persistir preferências visuais
- **Arquivo**: `src/pages/ReaderPage.tsx` linhas 46–47

### Firestore Rules — deploy manual necessário
- **Local**: `firestore.rules` correto e completo
- **Gap**: CI só deploya hosting. Sem deploy manual as regras não chegam à nuvem
- **Fix**: `npx firebase-tools deploy --only firestore:rules` (ou Console Firebase)

### Tipografia do leitor — sans-serif, não serif
- **Planejado**: "Tipografia serif (Lora ou Georgia)"
- **Implementado**: Fonte padrão do app (sans-serif)
- **Gap**: Sem import de Google Fonts Lora e sem classe `font-serif` no corpo do artigo

---

## NÃO IMPLEMENTADO ❌

### ErroTracker
- **Especificado**: Rastrear questões erradas por tópico, padrão de recorrência, integração com Dashboard
- **Status**: Nenhum arquivo, nenhum componente, nenhuma coleção Firestore relacionada existe
- **Bloqueio**: Requer spec formal de schema (questão, tópico, data, fonte da prova)

### LC 373/2026 — JSON não processado
- **Esperado**: `src/data/lc_373_2026.json` (legislação institucional ALE-RR)
- **Status**: Arquivo ausente; tópico `leg-lc373` existe em `EDITAL_TOPICS` sem documento
- **Fix**: Gerar o JSON manualmente seguindo o schema `TextoOficial`

### Documentos de referência auxiliares (MDs de contexto)
- `MELHORIAS.md` — não existe no repositório
- `SPACED_REPETITION.md` — não existe no repositório
- `LEITOR_IMPORT.md` — não existe no repositório
- `ERRO_TRACKER.md` — não existe no repositório
- `LEITOR_GRUPO_PATCH.md` — não existe no repositório
- Apenas `CLAUDE.md`, `HANDOFF.md` e `README.md` existem na raiz

---

## ESTRUTURA DE ARQUIVOS

```
src/
├── App.tsx                          # Roteamento (6 rotas: /, /dashboard, /strategy, /reader, /review, /weekly)
├── main.tsx                         # Bootstrap PWA + React
│
├── components/
│   ├── CardItem.tsx                 # Card individual no feed (edição inline, long press)
│   ├── ChecklistViewer.tsx          # Revisão: checklist com progresso
│   ├── ClozeViewer.tsx              # Revisão: lacunas com verificação inline
│   ├── ConnectivityBanner.tsx       # Banner online/offline
│   ├── CreateCardSheet.tsx          # Criar / editar card (bottom sheet)
│   ├── EditTextSheet.tsx            # Editar metadados de texto + deleção
│   ├── FilterBar.tsx                # Chips de filtro do feed de cards
│   ├── FlashcardViewer.tsx          # Revisão: flashcards com flip framer-motion
│   ├── Heatmap.tsx                  # Dashboard: heatmap de atividade (recharts)
│   ├── ImportCardsSheet.tsx         # Import de cards via JSON
│   ├── ImportTextSheet.tsx          # Import de textos oficiais via JSON
│   ├── MainLayout.tsx               # Nav bottom bar com 6 tabs
│   ├── MindMapViewer.tsx            # Revisão: árvore colapsável HTML
│   ├── ProgressImportSheet.tsx      # Import de progresso + revisão + semana
│   ├── RadarChart.tsx               # Dashboard: radar 8 eixos (recharts)
│   ├── ReviewSheet.tsx              # Sheet full-screen revisão com tabs dinâmicas
│   ├── ReviewTodaySection.tsx       # Dashboard: tópicos para revisar hoje
│   ├── SelectionToolbar.tsx         # Toolbar de multi-seleção de cards
│   ├── SessionPickerSheet.tsx       # Registrar tipo de sessão de estudo por tópico
│   ├── SprintSection.tsx            # Dashboard: hot topics FCC por urgência
│   ├── TableViewer.tsx              # Revisão: tabela responsiva
│   └── WeeklyEntrySheet.tsx         # Semana: entrada de sessão por dia/disciplina
│
├── data/
│   ├── codigo_etica_parlamentar_alerr.json   # Res. 29/1995 — Código de Ética Parlamentar
│   ├── constituicao_estadual_rr.json          # Constituição Estadual RR (arts. 30–67, 111–116)
│   ├── edital_topics.ts                       # EDITAL_TOPICS[], FCC_WEIGHTS, topicId strings
│   ├── lc_053_2001_roraima.json               # LC 053/2001 — Estatuto dos Servidores RR
│   ├── regimento_interno_alerr.json            # Regimento Interno ALERR Res. 08/2023
│   ├── sprint.ts                               # HOT_TOPICS, SPRINT_TOPICS (dados estáticos)
│   ├── strategy.ts                             # Estratégia FCC: % matérias, armadilhas
│   └── texts.ts                                # DEPRECATED — aponta para Firestore
│
├── hooks/
│   ├── useAuth.tsx                  # Estado de autenticação Google
│   ├── useCards.ts                  # Firestore cards com paginação cursor
│   ├── useDashboardStats.ts         # RetentionScores, heatmap, radar — computed
│   ├── useFilteredCards.ts          # Busca + filtros client-side
│   ├── useLongPress.ts              # Long press para ativar seleção múltipla
│   ├── useSelection.ts              # Estado de seleção múltipla de cards
│   └── useTextos.ts                 # Firestore textos: textos, byDiscipline, byGroup
│
├── lib/
│   ├── cards.ts                     # CRUD cards Firestore
│   ├── firebase.ts                  # Init Firebase + offline persistence (persistentLocalCache)
│   ├── progress.ts                  # SessionType, TopicProgress, calcRetentionScore, normalizeDoc
│   ├── reader.ts                    # Highlights + marcadores Firestore (HighlightColor, ReaderProgress)
│   ├── review.ts                    # ReviewContent tipos + subscribeReviewContent + batchSetReviewContent
│   ├── texts.ts                     # TextoOficial tipos + subscribeTextos + importTexto + updateArtigos + deleteTexto
│   └── weekly.ts                    # WeeklyLog CRUD Firestore
│
├── pages/
│   ├── ArchivePage.tsx              # Cards arquivados (rota /archive)
│   ├── DashboardPage.tsx            # Tab 2: Dashboard
│   ├── HomePage.tsx                 # Tab 1: Feed de cards
│   ├── LoginPage.tsx                # Tela de login Google
│   ├── ReaderPage.tsx               # Tab 4: Leitor de textos oficiais
│   ├── ReviewPage.tsx               # Tab 5: Revisão com 6 formatos
│   ├── StrategyPage.tsx             # Tab 3: Estratégia FCC (dados estáticos)
│   └── WeeklyPage.tsx               # Tab 6: Planejamento semanal
│
└── types/
    └── index.ts                     # Discipline, DISCIPLINES, DISCIPLINE_LABELS, Card

firestore.rules                      # Regras Firestore (users/{uid}/** = auth obrigatória)
```

---

## BUGS CONHECIDOS

### 1. Regras Firestore não deployadas (produção)
- **Sintoma**: "missing or insufficient permissions" ao importar textos no app em produção
- **Causa**: CI/CD faz `firebase deploy --only hosting`, não faz deploy das regras
- **Fix**: `npx firebase-tools deploy --only firestore:rules`

### 2. Tema e tamanho de fonte não persistem entre sessões
- **Sintoma**: Leitor sempre abre no tema escuro com fonte padrão, independente do que foi configurado
- **Causa**: `useState('dark')` e `useState(1)` — sem `localStorage` ou Firestore
- **Fix rápido**: `localStorage.setItem('reader-theme', theme)` + `useEffect` para carregar

### 3. MindMapViewer sem pan/zoom
- **Sintoma**: Mapas com muitos ramos ficam com scroll vertical longo, sem arrastar
- **Causa**: Implementado em HTML puro (não usa `react-d3-tree`)
- **Workaround**: Expandir/colapsar nós manualmente

### 4. (Corrigido) React Rules of Hooks — tela preta no Dashboard
- `useMemo` estava após `if (stats.loading) return` → movido para antes do early return
- Commit já aplicado nesta branch

### 5. (Corrigido) Firestore composite index — loading infinito no Leitor
- `orderBy('disciplina'), orderBy('ordem')` causava falha silenciosa sem índice
- Removido `orderBy` da query; ordenação feita client-side em `useTextos.ts`

---

## PRÓXIMOS PASSOS SUGERIDOS

### Alta prioridade (impacto direto no estudo — 35 dias até a prova)
1. **Deploy das regras Firestore** — desbloqueia import de textos em produção imediatamente
   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```
2. **Gerar `lc_373_2026.json`** — único documento do edital ausente; usar schema `TextoOficial`
3. **Popular `reviewContent` via ProgressImportSheet** — exportar revisões do chat externo e importar para os tópicos já estudados

### Média prioridade (polish e UX)
4. **Persistir tema + tamanho de fonte do leitor** — `localStorage` é suficiente, 5 linhas de código
5. **Tipografia Lora no leitor** — `<link>` Google Fonts + `font-family: 'Lora', serif` no container de artigos
6. **`react-d3-tree` no MindMapViewer** — pan/zoom real; útil para mapas de Português e Constitucional

### Baixa prioridade (futuro / pós-prova)
7. **ErroTracker** — schema sugerido: `{ questionId, topicId, fonte, data, tentativas, resolvido }`
8. **Exportar highlights** — lista dos artigos marcados por texto + exportar para PDF/JSON
9. **Modo offline granular** — banner com "cache de Xh atrás" usando `updatedAt` do Firestore

---

## SCHEMA JSON PARA IMPORTAR TEXTOS

Para adicionar novos textos no leitor via `ImportTextSheet`:

```json
[
  {
    "id": "lc-373-2026",
    "titulo": "LC 373/2026 — ALERR",
    "fonte": "DOE-RR",
    "atualizadoEm": "2026-01-01",
    "disciplina": "legislacao",
    "categoria": "lei-complementar",
    "ordem": 5,
    "artigos": [
      {
        "numero": "Art. 1º",
        "caput": "...",
        "incisos": ["I — ...", "II — ..."],
        "paragrafos": ["§ 1º ..."],
        "hotFCC": true,
        "notaFCC": "Cai sempre em provas ALE-RR"
      }
    ]
  }
]
```

**Disciplinas válidas**: `portugues`, `constitucional`, `administrativo`, `afo`, `legislacao`, `historia`, `geografia`, `ti`

**Categorias válidas**: `constituicao`, `lei-complementar`, `lei-ordinaria`, `regimento`, `resolucao`, `codigo`, `decreto`, `instrucao`

---

## SCHEMA JSON PARA IMPORTAR PROGRESSO + REVISÃO

Para importar via `ProgressImportSheet` no Dashboard (ícone ↑):

```json
{
  "topicProgress": {
    "pt-crase": { "sessionType": "questions_ok", "lastStudiedAt": "2026-05-20" },
    "cf-principios": "seen"
  },
  "reviewContent": {
    "pt-crase": {
      "title": "Crase",
      "flashcards": [
        { "id": "f1", "question": "Quando a crase é proibida?", "answer": "Antes de verbo, pronome pessoal e masculino sem artigo." }
      ],
      "checklist": ["Crase = prep. 'a' + artigo 'a'", "Teste: trocar por 'para a'"],
      "mindMap": { "name": "Crase", "children": [{ "name": "Obrigatória" }, { "name": "Proibida" }] },
      "cloze": [{ "text": "Crase é a fusão da preposição ___ com o artigo ___.", "answers": ["a", "a"] }]
    }
  }
}
```

**SessionTypes** (por força crescente): `seen` → `socratic` → `questions` → `questions_ok` → `confident`
