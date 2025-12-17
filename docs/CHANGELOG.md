# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2025-01-17

### ✨ Adicionado

#### Sidebar Colapsável
- Sidebar lateral colapsável com largura ajustável (320px expandida, 64px colapsada)
- Header da sidebar com logo e perfil do usuário
- Integração de filtros dentro da sidebar
- Controles de visibilidade de gráficos com checkboxes
- Persistência de estado (colapso e visibilidade) no localStorage
- Responsividade: drawer overlay no mobile, sidebar fixa no desktop
- Botão toggle para expandir/colapsar sidebar

#### Controles de Visibilidade
- Componente `GraphVisibilityControls` para controlar exibição de gráficos
- Checkboxes individuais para cada tipo de gráfico:
  - Métricas de Conversão
  - Métricas de Receita
  - Funil de Vendas
  - Performance por Vendedor
  - Análise de Perdas
  - Comparação Temporal
  - Análise de Produtos
- Botões "Mostrar Todos" e "Ocultar Todos"
- Estado padrão: todos os gráficos visíveis

### 🐛 Corrigido

#### Paginação de Cards
- **Problema crítico**: Frontend buscava apenas a primeira página (15 cards) de um total de 57+ cards
- **Solução**: Implementado loop automático para buscar todas as páginas
- Método `getCards()` agora busca todas as páginas automaticamente com `pageSize=100`
- Consolidação de todos os cards em um único array antes de retornar
- Logs detalhados mostrando progresso página por página

#### Cálculo do Funil
- **Problema**: Funil mostrava 0 leads em etapas que tinham cards (ex: Pré-qualificação com 17 cards)
- **Causa**: Mapeamento incorreto entre `card.stepTitle` e `step.title` do painel
- **Solução**: Mapeamento agora usa `stepId` (mais confiável que `stepTitle`)
- Função `calculateFunnelMetrics()` agora compara `card.stepId` com `step.id`
- Garantia de que todas as etapas do painel aparecem, mesmo sem cards

#### Carregamento de Etapas do Painel
- **Problema**: Endpoint `GET /api/crm/panels/:id` retornava erro 500
- **Solução**: Priorização de etapas vindas de `GET /api/crm/panels` (já inclui steps)
- Fallback para `getPanelById()` apenas se etapas não estiverem na lista
- Logs detalhados para debug do processo de carregamento

### 🔧 Melhorado

#### Logs de Debug
- Logs detalhados em todas as chamadas de API:
  - `helena-client.ts`: Logs de requisições, respostas e paginação
  - `queries.ts`: Logs de status de carregamento e dados recebidos
  - `calculations.ts`: Logs de cálculo de métricas com agrupamento por etapa
  - `DashboardPage.tsx`: Logs de carregamento de etapas e mapeamento
- Logs estruturados com emojis para fácil identificação:
  - 📋 Painéis
  - 🎴 Cards
  - 👥 Agentes
  - 📊 Métricas
  - ✅ Sucesso
  - ⚠️ Avisos
  - ❌ Erros

#### Estrutura de Layout
- `DashboardLayout` refatorado para usar sidebar em vez de header/footer
- Conteúdo principal com scroll independente da sidebar
- Sidebar fixa com `position: fixed` para não rolar com o conteúdo
- Espaçamento ajustado para acomodar sidebar

#### Tipos TypeScript
- `PaginatedData` atualizado para suportar campos no nível raiz e aninhados
- Compatibilidade com diferentes formatos de resposta da API

### 📝 Documentação

- CHANGELOG atualizado com todas as correções
- Logs de debug documentados para facilitar troubleshooting

---

## [1.1.0] - 2025-01-12

### ✨ Adicionado

#### Design System - Tema Dark Elegante
- Dashboard completo com tema dark moderno e elegante
- Efeitos de glassmorphism (backdrop-blur) em todos os componentes
- Gradientes decorativos com cor accent verde (#c8fa00)
- Background com efeitos radiais e blur para profundidade visual
- Cards com bordas sutis e sombras elegantes
- Hover effects com glow e transições suaves
- Ícones com containers gradientes e sombras

#### Autenticação
- Sistema de login com telefone ou email
- Página de login com tema dark elegante
- Menu do usuário com dropdown estilizado
- Exibição de userName e nome da empresa no header
- Busca automática de perfil completo do usuário
- Logout funcional com redirecionamento

#### Componentes UI
- `DashboardLayout` - Layout principal com header, menu e footer estilizados
- `FiltersBar` - Barra de filtros com design dark e ícones
- `TremorMetricCard` - Cards de métricas com glassmorphism e efeitos hover
- `ChartCard` - Container para gráficos com header estilizado
- Gráficos atualizados (BarChart, LineChart, PieChart, FunnelChart) com tema dark
- Tabelas com hover effects e badges coloridos

#### Rotas da API
- Todas as rotas agora usam prefixo `/api/`
- Login: `POST /api/auth/login`
- CRM: `/api/crm/*`
- Métricas: `/api/metrics/*`
- Configuração de `API_URL` sem `/api` no final

### 🔧 Configurado

#### Estrutura de Tipos
- `AuthUser` atualizado com `userName` e `email`
- `LoginResponse` atualizado com estrutura completa do backend
- Tipos sincronizados entre `auth.ts` e `crm.ts`

#### API Client
- Método `getUserProfile()` para buscar dados completos do usuário
- Fallback para dados do localStorage se perfil não disponível
- Tratamento de erros melhorado

### 🎨 Melhorias de UI/UX

#### Dashboard
- Fundo gradiente escuro (from-gray-900 via-gray-800 to-gray-900)
- Efeitos de luz decorativos com cor accent
- Cards com bordas `border-gray-700/50` e backdrop blur
- Textos com hierarquia clara (branco para títulos, gray-400 para descrições)
- Botões com gradientes e sombras
- Loading states elegantes com animações

#### Componentes de Métricas
- Todos os componentes atualizados para tema dark
- Estados de erro com ícones e mensagens claras
- Estados vazios com mensagens amigáveis
- Badges coloridos para indicadores (verde para sucesso, vermelho para perdas)

#### Gráficos
- Grid e eixos com cores escuras
- Tooltips com fundo escuro e sombras
- Paleta de cores vibrantes com verde accent como primária
- Legendas estilizadas

### 📝 Documentação

- CHANGELOG atualizado com todas as mudanças
- Design system documentado
- Progresso do projeto documentado

---

## [1.0.0] - 2024-11

### ✨ Adicionado

#### Funcionalidades
- Dashboard completo com visualização de métricas de CRM
- Funil de vendas com visualização por etapas
- Métricas de receita (total, ticket médio, por vendedor)
- Métricas de conversão (taxa, ciclo de vendas, tempo de resposta)
- Performance por vendedor com análise individual
- Análise de perdas (cards perdidos e motivos)
- Comparações temporais entre períodos
- Análise de produtos com distribuição
- Sistema de filtros (período, vendedor, canal)
- Loading states em todos os componentes
- Error handling robusto
- Design responsivo (mobile-first)

#### Integração
- Cliente API para integração com Helena/flw.chat
- TanStack Query para gerenciamento de estado servidor
- Proxy configurado para desenvolvimento (evita CORS)
- Suporte a múltiplos painéis
- Mapeamento dinâmico de etapas do funil

#### UI/UX
- Componentes base com Radix UI
- Gráficos com Tremor e Recharts
- Design moderno e limpo
- Suporte a dark mode (Tremor)
- Ícones com Lucide React
- Animações suaves

#### Deploy
- Dockerfile multi-stage otimizado
- Configuração Nginx com gzip e cache
- Railway.json configurado
- Health check endpoint (`/health`)
- Build Arguments para variáveis de ambiente

#### Documentação
- README.md completo
- Guia de deploy no Railway
- Documentação de variáveis de ambiente
- Guia de fluxo de trabalho Git
- Documentação completa do backend (planejado)
- Guia de migração para backend próprio
- Referência rápida de endpoints
- Checklist de implementação

### 🔧 Configurado

- TypeScript strict mode
- ESLint configurado
- Path aliases (`@/` para `src/`)
- TailwindCSS com tema customizado
- Vite com proxy para desenvolvimento
- React Router DOM para roteamento
- TanStack Query com cache inteligente

### 📦 Dependências Principais

- React 18.3.1
- Vite 5.4.19
- TypeScript 5.8.3
- TailwindCSS 3.4.17
- TanStack Query 5.83.0
- Tremor 3.18.7
- Recharts 2.15.4
- Radix UI (múltiplos pacotes)
- React Router DOM 6.30.1

### 🔐 Segurança

- ⚠️ Token exposto no frontend (aguardando backend intermediário)
- Proxy configurado para desenvolvimento
- Security headers no Nginx
- Validação de entrada com TypeScript

### 📝 Notas

- Projeto funcional e em produção
- Backend intermediário planejado para melhorar segurança
- Autenticação JWT planejada
- Multi-tenancy planejado

---

## [Unreleased]

### 🚧 Planejado

- [ ] Backend intermediário (dashCRMAtendebot_back)
- [ ] Autenticação JWT completa
- [ ] Multi-tenancy
- [ ] Cache avançado no backend
- [ ] Exportação de dados (Excel, PDF)
- [ ] Notificações em tempo real
- [ ] Dashboard customizável
- [ ] Filtros salvos
- [ ] Gráficos interativos avançados
- [ ] Modo claro/escuro toggle
- [ ] Internacionalização (i18n)

### 🔄 Melhorias

- [ ] Otimização de performance
- [ ] Testes automatizados
- [ ] Storybook para componentes
- [ ] Acessibilidade melhorada (WCAG 2.1)
- [ ] PWA (Progressive Web App)

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔧 Configurado` - Configurações e setup
- `🐛 Corrigido` - Correções de bugs
- `♻️ Refatorado` - Refatorações de código
- `📝 Documentação` - Mudanças na documentação
- `⚡ Performance` - Melhorias de performance
- `🔐 Segurança` - Correções de segurança
- `🎨 UI/UX` - Melhorias de interface
- `🚧 Planejado` - Funcionalidades planejadas

---

**Última atualização:** Janeiro 2025
