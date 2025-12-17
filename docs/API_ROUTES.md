# 🔌 Rotas da API - Dashboard CRM AtendeBot

## 📋 Visão Geral

Todas as rotas da API utilizam o prefixo `/api/` e são chamadas através da URL base configurada em `VITE_API_URL`.

**Configuração:**
```typescript
// src/lib/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
// Rotas incluem /api/ automaticamente
```

---

## 🔐 Autenticação

### POST `/api/auth/login`

Login do usuário com telefone ou email.

**Request:**
```typescript
{
  phone?: string  // Ex: "34988585271"
  email?: string  // Ex: "user@example.com"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    token: string,  // JWT token
    helena: {
      accessToken: string,
      userId: string,
      tenantId: string,
      expiresIn?: string,
      refreshToken?: string,
      urlRedirect?: string
    },
    user: {
      id: string,
      name: string,        // Nome da empresa
      phone: string,
      userName?: string,   // Nome do usuário
      email?: string
    }
  },
  message: string
}
```

**Uso:**
```typescript
await apiClient.login(phone, email)
```

---

### GET `/api/auth/profile`

Busca dados completos do perfil do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    phone: string,
    userName?: string,
    email?: string
  }
}
```

**Uso:**
```typescript
await apiClient.getUserProfile()
```

---

## 📊 CRM - Painéis

### GET `/api/crm/panels`

Lista todos os painéis CRM do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: {
    items: Panel[],
    totalItems: number
  }
}
```

**Uso:**
```typescript
await apiClient.getPanels()
await helenaClient.getPanels()
```

---

### GET `/api/crm/panels/:id`

Obtém detalhes de um painel específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: Panel
}
```

**Uso:**
```typescript
await apiClient.getPanelById(panelId)
await helenaClient.getPanelById(panelId)
```

---

## 🎴 CRM - Cards

### GET `/api/crm/cards`

Lista cards com filtros opcionais.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel
- `startDate` (opcional): Data de início (YYYY-MM-DD)
- `endDate` (opcional): Data de fim (YYYY-MM-DD)
- `userId` (opcional): ID do usuário/vendedor
- `channelId` (opcional): ID do canal
- `stepId` (opcional): ID da etapa
- `page` (opcional): Número da página
- `pageSize` (opcional): Itens por página

**Response:**
```typescript
{
  success: true,
  data: {
    items: Card[],
    totalItems: number,
    page: number,
    pageSize: number,
    totalPages: number
  }
}
```

**Uso:**
```typescript
await apiClient.getCards({ panelId, startDate, endDate })
await helenaClient.getCards({ panelId, startDate, endDate, userId, channelId })
```

---

### GET `/api/crm/cards/:id`

Obtém detalhes de um card específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: Card
}
```

**Uso:**
```typescript
await apiClient.getCardById(cardId)
await helenaClient.getCardById(cardId)
```

---

## 👥 CRM - Agentes

### GET `/api/crm/agents`

Lista agentes de um painel.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel

**Response:**
```typescript
{
  success: true,
  data: {
    items: Agent[],
    totalItems: number
  }
}
```

**Uso:**
```typescript
await apiClient.getAgents()
await helenaClient.getAgents(panelId)
```

---

### GET `/api/crm/agents/:id`

Obtém detalhes de um agente específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true,
  data: Agent
}
```

**Uso:**
```typescript
await apiClient.getAgentById(agentId)
await helenaClient.getAgentById(agentId)
```

---

## 📈 Métricas

### GET `/api/metrics/funnel`

Métricas do funil de vendas.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel
- `startDate` (opcional): Data de início
- `endDate` (opcional): Data de fim
- `userId` (opcional): ID do usuário
- `channelId` (opcional): ID do canal

**Response:**
```typescript
{
  success: true,
  data: FunnelMetric[]
}
```

**Uso:**
```typescript
await apiClient.getFunnelMetrics({ panelId, startDate, endDate, userId, channelId })
```

---

### GET `/api/metrics/revenue`

Métricas de receita.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel
- `startDate` (opcional): Data de início
- `endDate` (opcional): Data de fim
- `userId` (opcional): ID do usuário
- `channelId` (opcional): ID do canal

**Response:**
```typescript
{
  success: true,
  data: RevenueMetrics
}
```

**Uso:**
```typescript
await apiClient.getRevenueMetrics({ panelId, startDate, endDate, userId, channelId })
```

---

### GET `/api/metrics/conversion`

Métricas de conversão.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel
- `startDate` (opcional): Data de início
- `endDate` (opcional): Data de fim

**Response:**
```typescript
{
  success: true,
  data: ConversionMetrics
}
```

**Uso:**
```typescript
await apiClient.getConversionMetrics({ panelId, startDate, endDate })
```

---

### GET `/api/metrics/dashboard`

Dashboard completo (all-in-one).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `panelId` (obrigatório): ID do painel
- `startDate` (opcional): Data de início
- `endDate` (opcional): Data de fim
- `userId` (opcional): ID do usuário
- `channelId` (opcional): ID do canal

**Response:**
```typescript
{
  success: true,
  data: {
    panels: Panel[],
    cards: PaginatedData<Card>,
    agents: Agent[],
    activePanelId: string,
    // ... outras métricas
  }
}
```

**Uso:**
```typescript
await apiClient.getDashboard({ panelId, startDate, endDate, userId, channelId })
```

---

## 🔧 Configuração

### Variável de Ambiente

```env
# .env
VITE_API_URL=https://dashcrmatendebotback-desenvolvimento.up.railway.app

# Local
# VITE_API_URL=http://localhost:3000
```

### Uso no Código

```typescript
// src/lib/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Exemplo de chamada
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '34988585271' })
})
```

---

## 🛡️ Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem o token JWT no header:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

O token é obtido no login e armazenado no `localStorage`:

```typescript
localStorage.setItem('auth_token', token)
```

---

## ❌ Tratamento de Erros

### 401 - Não Autorizado
- Token inválido ou expirado
- Redireciona para `/login`
- Limpa `localStorage`

### 429 - Muitas Requisições
- Rate limit excedido
- Aguardar alguns minutos

### Outros Erros
- Retorna mensagem de erro da API
- Logs detalhados no console

---

## 📚 Referências

- **API Client:** `src/lib/api/client.ts`
- **Helena Client:** `src/lib/api/helena-client.ts`
- **Queries:** `src/lib/api/queries.ts`
- **Tipos:** `src/types/crm.ts` e `src/types/auth.ts`

---

**Última atualização:** Janeiro 2025

