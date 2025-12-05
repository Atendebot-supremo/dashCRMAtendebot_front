# Referência Rápida - dashCRMAtendebot API

## URLs

### Desenvolvimento
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Swagger**: http://localhost:3000/api/docs

### Produção
- **Backend**: https://dashcrm-api.railway.app (configurar)
- **Frontend**: https://dashcrm.railway.app (configurar)

---

## Tabela de Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login do cliente | ❌ |
| GET | `/api/crm/panels` | Lista painéis | ✅ |
| GET | `/api/crm/panels/:id` | Detalhes de painel | ✅ |
| GET | `/api/crm/cards` | Lista cards | ✅ |
| GET | `/api/crm/cards/:id` | Detalhes de card | ✅ |
| GET | `/api/crm/users` | Lista usuários | ✅ |
| GET | `/api/crm/channels` | Lista canais | ✅ |
| GET | `/api/metrics/funnel` | Métricas do funil | ✅ |
| GET | `/api/metrics/revenue` | Métricas de receita | ✅ |
| GET | `/api/metrics/conversion` | Métricas de conversão | ✅ |
| GET | `/api/metrics/loss` | Análise de perdas | ✅ |
| GET | `/api/metrics/temporal` | Comparações temporais | ✅ |
| GET | `/api/metrics/seller-performance` | Performance vendedor | ✅ |
| GET | `/api/metrics/products` | Análise de produtos | ✅ |
| GET | `/api/metrics/dashboard` | Dashboard completo | ✅ |
| GET | `/health` | Health check | ❌ |

---

## Exemplos de Requisições

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contato@maxchip.com",
    "password": "senha-segura"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "client": {
      "id": "maxchip",
      "name": "MaxChip Telecom",
      "email": "contato@maxchip.com"
    }
  }
}
```

### 2. Listar Painéis

```bash
curl http://localhost:3000/api/crm/panels \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Listar Cards

```bash
curl "http://localhost:3000/api/crm/cards?panelId=panel-123&startDate=2024-01-01" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 4. Métricas do Funil

```bash
curl "http://localhost:3000/api/metrics/funnel?panelId=panel-123" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 5. Dashboard Completo

```bash
curl "http://localhost:3000/api/metrics/dashboard?panelId=panel-123&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Query Parameters Comuns

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `panelId` | string | ✅ | ID do painel | `panel-uuid-123` |
| `startDate` | string (ISO) | ❌ | Data inicial | `2024-01-01` |
| `endDate` | string (ISO) | ❌ | Data final | `2024-01-31` |
| `userId` | string | ❌ | ID do vendedor | `user-uuid-1` |
| `channelId` | string | ❌ | ID do canal | `whatsapp` |
| `page` | number | ❌ | Número da página | `1` |
| `pageSize` | number | ❌ | Itens por página | `100` |

---

## Estrutura de Response Padrão

### Sucesso

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

### Paginação

```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 100,
    "totalPages": 10,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `INVALID_INPUT` | 400 | Dados de entrada inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `INTERNAL_SERVER_ERROR` | 500 | Erro interno do servidor |

---

## Estrutura de Dados

### Panel

```typescript
{
  id: string
  name: string
  description?: string
  steps?: Array<{
    id: string
    title: string
    phase: string
    position: number
  }>
  createdAt: string
  updatedAt: string
}
```

### Card

```typescript
{
  id: string
  title: string
  key: string
  number: number
  panelId: string
  panelTitle?: string
  stepId: string
  stepTitle?: string
  stepPhase?: string
  description?: string
  monetaryAmount?: number
  isOverdue: boolean
  dueDate?: string
  archived: boolean
  createdAt: string
  updatedAt: string
  responsibleUserId?: string
  responsibleUser?: {
    id: string
    name: string
    email: string
  }
  contactIds: string[]
  contacts?: Array<{
    id: string
    name: string
    phone?: string
    email?: string
  }>
}
```

### Funnel Metrics

```typescript
{
  stages: Array<{
    stage: string
    stageId: string
    leads: number
    value: number
    conversionRate: number
    averageTime: number
  }>
  totalLeads: number
  totalValue: number
  overallConversionRate: number
  forecast: number
}
```

### Revenue Metrics

```typescript
{
  totalRevenue: number
  averageTicket: number
  closedDeals: number
  revenueBySeller: Array<{
    sellerId: string
    sellerName: string
    revenue: number
    deals: number
    averageTicket: number
  }>
  revenueByChannel: Array<{
    channelId: string
    channelName: string
    revenue: number
    deals: number
  }>
}
```

---

## Frontend - Hooks React Query

### usePanels

```typescript
const { data: panels, isLoading, error } = usePanels()
```

### useCards

```typescript
const { data: cards } = useCards({
  panelId: 'panel-123',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  userId: 'user-1'
})
```

### useFunnelMetrics

```typescript
const { data: funnelMetrics } = useFunnelMetrics({
  panelId: 'panel-123',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})
```

### useDashboard (All-in-One)

```typescript
const { data: dashboard } = useDashboard({
  panelId: 'panel-123',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  userId: 'user-1',
  channelId: 'whatsapp'
})

// Usar
console.log(dashboard.summary.totalLeads)
console.log(dashboard.funnel.stages)
console.log(dashboard.revenue.totalRevenue)
```

---

## Variáveis de Ambiente

### Backend

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=seu-jwt-secret-super-seguro
HELENA_API_URL=https://api.flw.chat
HELENA_TOKENS='[{"clientId":"maxchip","token":"pn_mh3AGdH9..."}]'
CACHE_TTL=300000
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
# OU em produção:
VITE_API_URL=https://sua-api.railway.app
```

---

## Comandos Úteis

### Backend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Testes
npm test

# Lint
npm run lint
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## Fluxo de Autenticação

```
1. Frontend → POST /api/auth/login (email, password)
2. Backend → Valida credenciais
3. Backend → Gera JWT com clientId
4. Backend → Response { token, client }
5. Frontend → Salva token no localStorage
6. Frontend → Inclui token em todas as requisições
7. Backend → Valida JWT em cada requisição
8. Backend → Extrai clientId do token
9. Backend → Busca token Helena do cliente
10. Backend → Chama API Helena
11. Backend → Retorna dados transformados
```

---

## Cache Strategy

| Recurso | TTL | Tipo |
|---------|-----|------|
| Painéis | 5 min | QueryClient + Backend |
| Cards | 2 min | QueryClient + Backend |
| Usuários | 10 min | QueryClient + Backend |
| Canais | 10 min | QueryClient + Backend |
| Métricas | 1 min | QueryClient + Backend |

---

## Performance Tips

### Backend
- ✅ Implementar cache Redis para produção
- ✅ Usar índices no banco (se usar Supabase)
- ✅ Paginar resultados grandes
- ✅ Comprimir responses (gzip)

### Frontend
- ✅ Usar React Query para cache
- ✅ Implementar virtualização para listas grandes
- ✅ Lazy loading de componentes
- ✅ Debounce em filtros

---

## Segurança Checklist

- ✅ JWT com expiração curta (1h)
- ✅ Tokens Helena no backend (não no frontend)
- ✅ HTTPS em produção
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Helmet.js configurado

---

## Deploy Railway

### Backend

1. Criar novo projeto Railway
2. Conectar repositório GitHub
3. Definir variáveis de ambiente
4. Deploy automático

### Frontend

1. Criar novo projeto Railway
2. Conectar repositório GitHub
3. Definir `VITE_API_URL`
4. Configure build: `npm run build`
5. Deploy automático

---

## Monitoramento

### Endpoints de Health

```bash
# Health check simples
curl http://localhost:3000/health

# Response: { "status": "OK", "timestamp": "..." }

# Ready check
curl http://localhost:3000/ready

# Live check
curl http://localhost:3000/live
```

### Logs

- Usar Winston no backend
- Logs estruturados em JSON
- Níveis: error, warn, info, debug
- Enviar para serviço de log (Datadog, LogDNA)

---

## Troubleshooting Rápido

### Token expirado
```bash
# Frontend
localStorage.removeItem('authToken')
# Fazer login novamente
```

### CORS Error
```typescript
// Backend: cors config
app.use(cors({
  origin: ['http://localhost:5173', 'https://seu-frontend.railway.app'],
  credentials: true
}))
```

### Cache desatualizado
```typescript
// Frontend: invalidar cache
queryClient.invalidateQueries(['cards'])
```

---

## Recursos Adicionais

- 📖 **Documentação Completa**: `API_DOCUMENTATION.md`
- 🔄 **Guia de Migração**: `MIGRATION_GUIDE.md`
- 🏗️ **Arquitetura**: Seguir padrão "Barbeiro Inteligente"
- 📊 **Swagger**: http://localhost:3000/api/docs

---

**Versão:** 1.0.0  
**Última Atualização:** Novembro 2024


