# HANDOFF — ClipVault + Preparação ALE-RR 2026

> Arquivo de continuidade para novas threads de conversa com o Claude.
> Atualizado em: 2026-05-25

---

## 1. Identidade e Contexto

```
Candidato:    Welder Barroso, ~20 anos, Boa Vista/RR
Concurso:     ALE-RR 2026 — Técnico Legislativo Especializado / Programador (Código 31)
Banca:        FCC
Prova:        28/06/2026 (80 questões — 40 Gerais + 40 Específicos TI)
Eliminatório: 50 pts padronizados por bloco, 100 combinados
Remuneração:  R$ 7.464,35
Stack dev:    React, Next.js, TypeScript, Tailwind, Firebase, React Native
Fuso:         America/Boa_Vista (UTC-4)
Email:        welderb40@gmail.com
```

---

## 2. Protocolo de Sessão de Estudo

Quando Welder iniciar uma conversa de estudo, o Claude deve:

1. Verificar horário e dia atual com `user_time_v0`
2. Comparar com última sessão registrada
3. Situar o candidato: dias restantes, onde estamos no plano semanal, o que ficou pendente
4. Welder fornece: energia (alta/média/baixa) + tempo disponível
5. Claude decide o tópico com base em: sprint atual, peso FCC, score de retenção, lacunas do diagnóstico
6. Formato por energia:
   - Alta + 40min → conteúdo novo com questões
   - Média + 30min → socrática em tópico com lacuna
   - Baixa + 20min → flashcard verbal ou contexto causal sem cobrança
7. Diagnóstico de retenção: aplicar a cada 7 dias no início da sessão

---

## 3. Perfil Cognitivo

- Aprende por lógica causal — não por decoreba
- Contexto antes de questão — sempre
- Memória fraca para dados soltos — precisa da lógica por trás
- Não converte erro em correção sem estrutura externa
- Flow por construção ativa — não por leitura passiva
- Afetado farmacologicamente na memória de trabalho
- Diagnóstico: transtorno esquizoafetivo
- Medicação: valproico + fluoxetina (manhã), lítio + olanzapina (noite 20h)

---

## 4. Rotina Diária

```
12h–14h     Preparação + deslocamento para o ITEAM
14h–17h30   ITEAM Full Stack (seg–sex)
17h–19h     Sessão ALE-RR com Claude — pré-cursinho (ter/qui)
19h–22h     Cursinho (seg/ter/qua/qui)
20h         Remédio noturno (inegociável)
```

Cursinho cobre: Português (Prof. Felipe Lins), Legislação + Administrativo + AFO + Constitucional (Prof. Marcus Duarte), Geografia (Profa Fabíola).

---

## 5. Plano de 5 Semanas (a partir de 25/05/2026)

```
Semana 1 (24–30/05): AFO do zero
  Seg 25/05 17h: afo-principios + afo-ciclo (PPA/LDO/LOA)
  Ter 27/05 17h: afo-receitas (originárias/derivadas, correntes/capital)
  Qui 29/05 17h: afo-despesas + afo-creditos (F-E-L-P + créditos adicionais)
  Sáb 30/05:    Questões AFO + revisão
  Meta: AFO completo em practiced até 30/05

Semana 2 (31/05–06/06): TI Bloco 1
  Seg 01/06: ti-banco-dados (SQL, normalização, ACID)
  Ter 03/06: ti-redes (OSI/TCP-IP, protocolos)
  Qui 05/06: ti-seguranca (CIA, OWASP, criptografia)
  Dom 07/06: Revisão TI Bloco 1 + questões
  Meta: 3 tópicos TI em practiced

Semana 3 (07–13/06): TI Bloco 2 + Constitucional lacunas
  Seg 08/06: ti-algoritmos + ti-poo
  Ter 10/06: ti-engenharia-sw (Scrum, UML)
  Qui 12/06: cf-organizacao-estado + cf-poder-judiciario
  Meta: TI 7/12 practiced, Constitucional sem unseen

Semana 4 (14–20/06): TI Bloco 3 + Administrativo lacunas
  Seg 15/06: ti-arquitetura + ti-devops
  Ter 17/06: ti-so + ti-cloud
  Qui 19/06: adm-improbidade + adm-responsabilidade
  Sáb 20/06: Simulado completo 40 Gerais
  Meta: TI 10/12 practiced, Administrativo completo

Semana 5 (21–27/06): REVISÃO TOTAL — zero conteúdo novo
  Seg 22/06: Revisão AFO + Legislação
  Ter 24/06: Revisão Constitucional + Administrativo
  Qui 26/06: Revisão TI (pontos fracos)
  Sex 27/06: Simulado final 80 questões (4h)
  Sáb 28/06: PROVA
```

---

## 6. Progresso Atual — 24/05/2026

Estado baseado em sessionType + retenção espaçada (Ebbinghaus).

### PRACTICED (questions / questions_ok)

| Matéria | Tópicos |
|---|---|
| Português | pt-interpretacao, pt-morfologia, pt-concordancia, pt-crase, pt-sintaxe, pt-regencia |
| Constitucional | cf-direitos-fundamentais, cf-poder-legislativo, cf-processo-legislativo, cf-administracao-publica |
| Administrativo | adm-principios, adm-atos, adm-poderes, adm-direta-indireta, adm-agentes-publicos, adm-lc053 |
| Legislação | leg-regimento, leg-const-rr-legislativo |
| História | hist-formacao, hist-politica |
| Geografia | geo-localizacao, geo-fisico |
| TI | ti-lgpd, ti-dev-web |

### SEEN (visto mas sem questões)

| Matéria | Tópicos |
|---|---|
| Português | pt-pontuacao, pt-coesao, pt-tipologia |
| Constitucional | cf-principios, cf-constitucional-estadual, cf-organizacao-estado |
| Administrativo | adm-licitacao, adm-processo |
| **AFO** | **afo-principios, afo-ciclo, afo-receitas, afo-despesas, afo-creditos (TODOS seen — risco alto)** |
| Legislação | leg-codigo-etica, leg-const-rr-servidores, leg-lc373 |
| História | hist-municipios |
| Geografia | geo-recursos |
| TI | ti-banco-dados, ti-redes, ti-seguranca, ti-algoritmos, ti-poo, ti-engenharia-sw, ti-arquitetura, ti-devops, ti-so |

### UNSEEN (não visto formalmente)

pt-ortografia, pt-redacao-oficial, cf-poder-judiciario, cf-controle-constitucional, adm-responsabilidade, adm-improbidade, afo-lei-4320, afo-lrf, afo-controle, ti-cloud

---

## 7. Lacunas Recorrentes — Erram Sempre

Itens que aparecem como erro em todo diagnóstico:

1. **Reunião pública** → PRÉVIO AVISO (não autorização) — inc. XVI art. 5º CF/88
2. **Naturalização país de língua portuguesa** → 1 ANO (não 15)
3. **MS coletivo** → partido precisa ter REPRESENTAÇÃO NO CONGRESSO NACIONAL
4. **Sanção tácita** → silêncio do Governador no prazo = sanção (exceção: quem cala não consente)
5. **Prazo do Governador** → 15 dias ÚTEIS (não corridos) para sancionar/vetar
6. **Superintendências ALERR** → são 10; Superintendência-GERAL coordena todas
7. **Improbidade** → gera SUSPENSÃO (não perda) de direitos políticos
8. **AFO em geral** → tudo seen, zero practiced — bloqueio cognitivo documentado

---

## 8. Erros do Simulado — 20/05/2026

Prova de Constitucional — 18 questões — 8 acertos (44,4%):

| Questão | Tema | Erro |
|---|---|---|
| Q04 | Eficácia das normas | Eficácia limitada (não contida) |
| Q06 | MS coletivo | Partido precisa de representação no Congresso |
| Q07 | Liberdade de reunião | Prévio aviso (não autorização) |
| Q08 | Gerações de direitos | Direitos sociais = 2ª geração |
| Q11 | Naturalização | Língua portuguesa = 1 ano (não 15) |
| Q12/Q13 | Nacionalidade | Critérios funcional vs residencial |
| Q14 | Senado | Idade mínima = 35 anos |
| Q17 | Militares candidatos | +10 anos: afastado; se eleito → inatividade na diplomação |
| Q18 | Improbidade | Suspensão (não perda) de direitos políticos |

---

## 9. Contexto Atual

- Cirurgia de implante dentário realizada em 22/05/2026 (sexta-feira)
- Repouso físico de 2–3 meses para recuperação óssea
- Mobilidade física reduzida — estudos pelo celular no fim de semana
- Segunda 25/05 retorna à rotina normal
- ClipVault app em produção: revisão espaçada implementada, leitor com textos oficiais importados
- Textos oficiais disponíveis no app: Lei 9.784, Lei 8.429, Lei 4.320, LC 101, LGPD, Lei 14.133, LC 373, Res. 015, CF/88 arts. 5–17, Constituição Estadual, Regimento ALERR, Código de Ética, LC 053

---

## 10. Dois Riscos Críticos de Eliminação

1. **TI (40 questões Específicos)** — 2/12 practiced. Risco real de não atingir os 50 pts mínimos do bloco específico.
2. **AFO (15% Gerais)** — 0/7 practiced. Tudo seen, bloqueio cognitivo documentado. Se não virar practiced na Semana 1, compromete o bloco de Gerais.

---

## 11. Regras do Plano

- Português não tem sessão dedicada — treina embutido nas questões de outras matérias
- Cursinho reforça, não define — conteúdo do dia trazido para sessão com Claude no dia seguinte
- Diagnóstico toda segunda-feira — 5 perguntas rápidas antes de avançar
- Se atrasar: cortar ti-arquitetura, ti-devops, ti-so (menor peso histórico FCC técnico)
- História e Geografia: não precisam de mais estudo — suficientes para 2 questões

---

## 12. App ClipVault — Estado Técnico

```
Repositório: github.com/WelderBM/clipvault
Branch ativo: claude/extract-chat-context-Gf76V
Stack: React 18 + TypeScript + Vite + Tailwind + Firebase + PWA (vite-plugin-pwa)
```

### Implementado (completo)

- Sistema de revisão espaçada — Ebbinghaus (SessionType, HALF_LIFE_DAYS, calcRetentionScore)
- Leitor com textos no Firestore — 2 níveis de navegação, groupId, highlights 3 cores, modo prova, marcador de leitura
- Dashboard — RadarChart, Heatmap, ReviewTodaySection, SprintSection
- SessionPickerSheet — registrar sessão de estudo por tópico
- ProgressImportSheet — importa topicProgress + reviewContent + weeklyLog via JSON do Claude externo
- Tab Revisão — 6 formatos: Mapa Mental, Texto, Flashcards, Checklist, Tabela, Cloze
- Tab Semana — WeeklyPage + WeeklyEntrySheet
- Cards com paginação cursor, filtros, busca, multi-seleção, import JSON
- PWA offline: persistentLocalCache + persistentMultipleTabManager

### Parcial / bugs pendentes

- MindMapViewer: árvore HTML colapsável (sem pan/zoom — react-d3-tree não instalado)
- Tema/fonte do leitor não persistem entre sessões
- Firestore rules (firestore.rules) corretas mas não deployadas em produção — requer `npx firebase-tools deploy --only firestore:rules`
- LC 373/2026 JSON não gerado (tópico leg-lc373 existe mas sem documento importável)

### Não implementado

- ErroTracker (rastreamento de questões erradas por tópico)
- Seletor de tema no leitor (branco/sépia/escuro)
- Tipografia serif (Lora/Georgia) no leitor

Para detalhes completos: `APP_STATUS.md` na raiz do projeto.

---

## 13. Matérias e Pesos FCC — Referência Rápida

### Conhecimentos Gerais (40 questões)

| Matéria | % | ~Questões |
|---|---|---|
| Língua Portuguesa | 30% | ~12 |
| Dir. Constitucional | 20% | ~8 |
| Dir. Administrativo | 20% | ~8 |
| AFO | 15% | ~6 |
| Legislação Institucional | 10% | ~4 |
| História RR | 3% | ~1 |
| Geografia RR | 2% | ~1 |

### Os 8 Hot Topics (presença garantida em toda prova FCC)

1. Interpretação de texto (Português)
2. HAVER/FAZER impessoais sempre singular (Português)
3. Impeachment — Câmara autoriza, Senado julga (Constitucional)
4. Anulação x Revogação — Judiciário não revoga (Administrativo)
5. Estágio probatório = 3 anos LC 053/2001 (Administrativo)
6. F-E-L-P — estágios da despesa (AFO)
7. Quórum progressivo ALERR — 1/3 discute, maioria absoluta vota (Legislação)
8. LGPD — controlador decide, operador executa (TI)

---

## 14. TopicIds Válidos (referência para importar JSON)

```
pt-interpretacao, pt-tipologia, pt-coesao, pt-morfologia, pt-concordancia,
pt-regencia, pt-crase, pt-pontuacao, pt-sintaxe, pt-ortografia, pt-redacao-oficial,
cf-principios, cf-direitos-fundamentais, cf-organizacao-estado, cf-poder-legislativo,
cf-processo-legislativo, cf-administracao-publica, cf-constitucional-estadual,
adm-principios, adm-atos, adm-poderes, adm-direta-indireta, adm-licitacao,
adm-agentes-publicos, adm-responsabilidade, adm-processo, adm-improbidade, adm-lc053,
afo-principios, afo-ciclo, afo-lei-4320, afo-receitas, afo-despesas, afo-creditos,
afo-lrf, afo-controle, leg-regimento, leg-codigo-etica, leg-const-rr-legislativo,
leg-const-rr-servidores, leg-lc373, hist-formacao, hist-municipios, hist-politica,
geo-localizacao, geo-fisico, geo-recursos, ti-algoritmos, ti-poo, ti-banco-dados,
ti-dev-web, ti-redes, ti-seguranca, ti-lgpd, ti-engenharia-sw, ti-arquitetura,
ti-cloud, ti-devops, ti-so
```

---

## 15. Protocolo JSON para Importar Revisão

Quando solicitar ao Claude externo para "exportar revisão de <tópico>", ele deve produzir:

```json
{
  "topicProgress": {
    "<topicId>": {
      "sessionType": "seen | socratic | questions | questions_ok | confident",
      "lastStudiedAt": "2026-05-25T17:00:00-04:00"
    }
  },
  "reviewContent": {
    "<topicId>": {
      "title": "string obrigatória",
      "mindMap": { "name": "raiz", "children": [] },
      "text": { "sections": [{ "title": "...", "body": "...", "items": ["..."] }] },
      "flashcards": [{ "id": "f1", "question": "...", "answer": "..." }],
      "checklist": ["ponto 1", "ponto 2"],
      "table": { "headers": ["Col1"], "rows": [["val"]] },
      "cloze": [{ "text": "texto com ___ lacuna", "answers": ["resposta"] }]
    }
  }
}
```

Meia-vida por sessionType: seen=2d, socratic=5d, questions=10d, questions_ok=18d, confident=30d.
Todos os formatos de reviewContent são opcionais exceto `title`.
