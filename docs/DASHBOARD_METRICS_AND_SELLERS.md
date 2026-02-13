# 📊 Dashboard: Métricas, Funil, Valores e Performance de Vendedores

Documentação técnica das melhorias implementadas no dashboard CRM: mapeamento de etapas, funil de vendas, valores atribuídos e ranking de vendedores (incluindo cálculo de receita proporcional).

---

## Índice

1. [Visão geral](#visão-geral)
2. [Mapeamento de etapas (stage mapping)](#mapeamento-de-etapas-stage-mapping)
3. [Funil de vendas](#funil-de-vendas)
4. [Valores monetários (Valor atribuído)](#valores-monetários-valor-atribuído)
5. [Performance por vendedor e Top 3](#performance-por-vendedor-e-top-3)
6. [Receita proporcional por vendedor](#receita-proporcional-por-vendedor)
7. [Arquivos envolvidos](#arquivos-envolvidos)
8. [Logs de debug](#logs-de-debug)

---

## Visão geral

O dashboard consome dados da API (painéis, cards, agentes) e aplica regras de negócio no frontend para:

- **Etapas:** Mapear por **nome da etapa** (não por ID), pois o mesmo painel é reutilizado entre clientes com nomes diferentes.
- **Funil:** Exibir todas as etapas e contagem de leads por etapa, com fallback para `cardCount` do painel quando os cards retornados forem insuficientes.
- **Valores:** Extrair "Valor atribuído" de campos personalizados ou do `monetaryAmount` da API; quando os cards não trazem valor individual, usar o valor agregado da etapa para distribuição proporcional por vendedor.
- **Vendedores:** Listar todos os agentes do painel, calcular receita por vendedor (direta ou proporcional) e exibir o **Top 3** no ranking.

---

## Mapeamento de etapas (stage mapping)

**Arquivo:** `src/lib/utils/stage-mapping.ts`

### Objetivo

- Manter um mapeamento dinâmico **stepId → nome da etapa** (e metadados: posição, `cardCount`, `monetaryAmount`, `isFinal`).
- Permitir que o funil e as métricas usem o **nome da etapa** para exibição e lógica, independente do ID (útil quando o mesmo painel é usado em vários clientes com nomes diferentes).

### Funções principais

| Função | Descrição |
|--------|-----------|
| `updateStepMapping(steps)` | Atualiza o mapeamento com as etapas do painel (chamado ao carregar painéis). |
| `getStepName(stepId)` | Retorna o nome da etapa pelo ID. |
| `getStageName(card)` | Retorna o nome da etapa do card (prioridade: `card.stepTitle` > mapeamento > ID encurtado). |
| `getFinalStepIds()` | Retorna IDs das etapas finais (ganho/concluído). |
| `isCardInFinalStage(card)` | Verifica se o card está em etapa final (por ID, `stepPhase` ou nome). |
| `getAllPanelSteps()` | Retorna todas as etapas ordenadas por posição (usado em cálculos de receita proporcional). |
| `extractUniqueResponsibles(cards)` | Extrai lista de vendedores únicos dos cards (para filtros). |
| `extractUniqueChannels(cards)` | Extrai canais únicos do campo `customFields['origem-11']`. |

### Fonte dos dados

- Etapas vêm de `GET /api/crm/panels` (cada painel já inclui `steps` com `id`, `title`, `position`, `isFinal`, `cardCount`, `monetaryAmount`).
- O frontend chama `updateStepMapping()` quando os painéis são carregados para manter o mapeamento atualizado.

---

## Funil de vendas

**Arquivos:** `src/lib/utils/calculations.ts` (`calculateFunnelMetrics`), componentes de funil.

### Comportamento

1. **Agrupamento por etapa:** Os cards são agrupados pelo **nome da etapa** (normalizado), não apenas por `stepId`, para acomodar variações de título entre clientes.
2. **Contagem de leads:** Para cada etapa, a contagem usa:
   - Quantidade de cards no payload que pertencem àquela etapa;
   - **Fallback:** Se o painel trouxer `panelStep.cardCount` e for maior que a contagem por cards, usa `cardCount` para não subestimar leads (ex.: paginação ou filtros que reduzem os cards retornados).
3. **Valor por etapa:** Usa `getCardAssignedValue(card)` por card quando disponível, ou o `monetaryAmount` agregado da etapa do painel quando aplicável.
4. **Deduplicação:** O cliente API (`helena-client.ts`) deduplica cards por ID ao concatenar páginas, evitando contar o mesmo card mais de uma vez.

### Dados utilizados

- **Cards:** `GET /api/crm/cards` (todas as páginas).
- **Painel:** `steps` com `cardCount` e `monetaryAmount` por etapa.

---

## Valores monetários (Valor atribuído)

**Arquivo:** `src/lib/utils/calculations.ts` — função `getCardAssignedValue(card)`.

### Ordem de prioridade

O valor monetário de um card é obtido na seguinte ordem:

1. **Campo personalizado "Valor atribuído"** (e aliases normalizados): `valoratribuido`, `valor`, `faturamento`, `valorvenda`, `valordavenda`.
2. **`card.monetaryAmount`** (quando a API envia no card).
3. **Campo legado `value`** (se existir no objeto card).

### Normalização

- Chaves de `customFields` são normalizadas (sem acentos, minúsculas, sem caracteres especiais) para comparação.
- Valores em string (ex.: `"R$ 1.234,56"`) são parseados pela função `parseMonetaryValue` (remove R$, pontos de milhar, troca vírgula por ponto).

### Observação

Se os cards vierem com `customFields: null` e `monetaryAmount: null`, o valor por card será 0. Nesse caso, o dashboard usa **receita proporcional** por vendedor com base no `monetaryAmount` das etapas do painel (ver seção abaixo).

---

## Performance por vendedor e Top 3

**Arquivo:** `src/components/metrics/SellerPerformance.tsx`

### Fontes de dados

- **Agentes:** `useAgents(panelId)` → `GET /api/crm/agents` (ou equivalente por painel). Garante que **todos** os vendedores do painel apareçam, mesmo sem cards no período.
- **Cards:** `useCards(filters)` com filtros de período, painel, vendedor e canal.

### Métricas por vendedor

| Métrica | Descrição |
|--------|-----------|
| **Cards totais** | Quantidade de cards atribuídos ao vendedor no período (respeitando filtros). |
| **Cards etapa final** | Cards em etapa "Ganho" / final (`isCardInFinalStage(card)`). |
| **Receita total** | Soma calculada por `calculateSellerProportionalRevenue` (detalhes abaixo). |
| **Taxa de conversão** | `(cards etapa final / cards totais) * 100`. |

### Exibição

- O componente exibe apenas o **Top 3** vendedores (constante `TOP_SELLERS_LIMIT = 3`).
- Ordenação: **receita total** (maior primeiro) → depois por cards na etapa final → depois por total de cards.
- Cada card do Top 3 mostra: posição (medalha), nome, total de cards, ganhos, conversão e **receita** em destaque.

---

## Receita proporcional por vendedor

**Arquivo:** `src/lib/utils/calculations.ts` — função `calculateSellerProportionalRevenue(cards)`.

### Objetivo

Calcular a receita de cada vendedor quando os valores **não vêm diretamente nos cards** (ex.: API retorna `customFields: null` e `monetaryAmount: null`). Nesse cenário, os valores agregados por etapa vêm no **painel** (`monetaryAmount` por step); a função distribui esse valor entre os vendedores de forma proporcional.

### Estratégia (em cascata)

**1) Valores diretos dos cards**

- Para cada card, obtém `getCardAssignedValue(card)` e soma por `responsibleUserId`.
- Se **pelo menos um** vendedor tiver soma > 0, retorna esse mapa (receita direta por vendedor) e **não** usa proporcional.

**2) Fallback: distribuição proporcional por etapa**

- Quando nenhum card tem valor individual:
  - Agrupa a quantidade de cards por **(vendedor, etapa)**.
  - Para cada etapa do painel (`getAllPanelSteps()`), usa `step.cardCount` e `step.monetaryAmount`.
  - Para cada vendedor, em cada etapa em que ele tem cards:
    - `receita_vendedor_etapa = (cards_do_vendedor_na_etapa / step.cardCount) * step.monetaryAmount`
  - Soma as parcelas de todas as etapas para obter a **receita total do vendedor**.

### Fórmula (fallback)

```
Para cada vendedor:
  total_receita = Σ (por cada etapa onde o vendedor tem cards)
    (qtde_cards_vendedor_na_etapa / cardCount_da_etapa) * monetaryAmount_da_etapa
```

### Exemplo

- Etapa "Ganho": `cardCount = 84`, `monetaryAmount = 416396`.
- Vendedor A tem 50 cards nessa etapa → receita de A em "Ganho" = (50/84) * 416396 ≈ 247855.
- O mesmo é feito para as demais etapas que têm `monetaryAmount` e depois somado.

---

## Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/utils/stage-mapping.ts` | Mapeamento de etapas, etapas finais, responsáveis e canais. |
| `src/lib/utils/calculations.ts` | `getCardAssignedValue`, `calculateSellerProportionalRevenue`, métricas de funil, receita, conversão, filtros por período/usuário/canal. |
| `src/lib/api/helena-client.ts` | Paginação e deduplicação de cards, chamadas a painéis, cards e agentes. |
| `src/lib/api/queries.ts` | `usePanels`, `useCards`, `useAgents`, `useDashboardData`. |
| `src/components/metrics/SellerPerformance.tsx` | Top 3 vendedores, uso de `calculateSellerProportionalRevenue`, exibição de receita e métricas. |
| `src/components/dashboard/FiltersBar.tsx` | Filtros (período, painel, vendedor, canal) usando `extractUniqueResponsibles` e `extractUniqueChannels`. |
| `src/pages/DashboardPage.tsx` | Orquestração de dados e filtros, exibição dos blocos de métricas. |

---

## Logs de debug

O projeto usa logs no console para facilitar diagnóstico:

| Prefixo / contexto | Significado |
|--------------------|-------------|
| `📋 [StageMapping]` | Atualização e listagem de etapas. |
| `📊 [FunnelMetrics]` | Cálculo do funil (total de cards, agrupamento). |
| `💰 [SellerRevenue]` | Escolha entre valores diretos vs. proporcional e resultado do cálculo por vendedor. |
| `📊 Performance por Vendedor` | Agentes carregados, total de vendedores, ranking (top 3) com cards totais, ganhos e receita. |

Esses logs ajudam a verificar se os valores vêm dos cards ou do fallback proporcional e se o Top 3 está sendo calculado corretamente.

---

**Última atualização:** Fevereiro 2025
