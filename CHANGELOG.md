# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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

## [1.1.0] - 2024-12

### ✨ Adicionado

#### Autenticação
- **Tela de Login** - Nova página de login com abas para telefone e email
- **AuthContext** - Contexto global de autenticação
- **ProtectedRoute** - Componente para rotas protegidas
- **JWT Authentication** - Integração com autenticação via Bearer Token

#### Filtros Avançados
- **Filtro de Painel** - Seleção dinâmica de painéis CRM
- **Filtro de Vendedor** - Lista agentes com nomes reais (não IDs)
- **Filtro de Etapa/Funil** - Filtro por etapas do funil de vendas
- **Filtro de Canal** - Filtro por canal de origem
- **Filtro de Período** - Período com opções predefinidas (hoje, semana, mês, ano)

#### API Client
- **crm-client.ts** - Novo cliente API para rotas CRM do backend intermediário
- **Logging detalhado** - Logs completos de todas as requisições para debug
- **Error handling** - Tratamento de erros 401 com redirect para login

#### Melhorias de UI/UX
- **Nome dos painéis** - Exibição do título do painel em vez de IDs
- **Nome dos vendedores** - Exibição do nome do agente em vez de IDs
- **Nome das etapas** - Mapeamento dinâmico de stepId para título
- **Ícones nos filtros** - Ícones descritivos para cada filtro

### 🔧 Alterado

- Migração de `helena-client.ts` para `crm-client.ts`
- Atualização de `queries.ts` para usar novo cliente CRM
- Interface `Panel` atualizada com campo `title` e `steps`
- Interface `DashboardFilters` com campo `stepId`
- Todos componentes de métricas atualizados com filtro de step

### 📦 Dependências

- Adicionado `sonner` para notificações toast

### 🔐 Segurança

- ✅ Token JWT armazenado no localStorage
- ✅ Redirecionamento automático em caso de 401
- ✅ Limpeza de dados sensíveis no logout

---

## [Unreleased]

### 🚧 Planejado

- [ ] Cache avançado no backend
- [ ] Exportação de dados (Excel, PDF)
- [ ] Notificações em tempo real
- [ ] Dashboard customizável
- [ ] Filtros salvos
- [ ] Gráficos interativos avançados

### 🔄 Melhorias

- [ ] Otimização de performance
- [ ] Testes automatizados
- [ ] Storybook para componentes
- [ ] Internacionalização (i18n)
- [ ] Acessibilidade melhorada (WCAG 2.1)

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔧 Configurado` - Configurações e setup
- `🐛 Corrigido` - Correções de bugs
- `♻️ Refatorado` - Refatorações de código
- `📝 Documentação` - Mudanças na documentação
- `⚡ Performance` - Melhorias de performance
- `🔐 Segurança` - Correções de segurança
- `🚧 Planejado` - Funcionalidades planejadas

---

**Última atualização:** Novembro 2024

