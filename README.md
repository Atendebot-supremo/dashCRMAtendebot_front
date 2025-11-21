# 📊 Dashboard CRM AtendeBot

Dashboard moderno e responsivo para visualização de métricas de CRM, integrado com a API Helena/flw.chat.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)

## 🚀 Tecnologias

### Core
- **React 18.3.1** - Biblioteca UI moderna
- **Vite 5.4.19** - Build tool ultra-rápido
- **TypeScript 5.8.3** - Tipagem estática completa
- **React Router DOM 6.30.1** - Roteamento SPA

### UI/UX
- **TailwindCSS 3.4.17** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e sem estilo
- **Tremor 3.18.7** - Componentes de métricas e gráficos modernos
- **Recharts 2.15.4** - Biblioteca de gráficos para React
- **Lucide React** - Ícones modernos

### Estado e Dados
- **TanStack Query 5.83.0** - Gerenciamento de estado servidor
- **React Hook Form 7.61.1** - Formulários performáticos
- **Zod 3.25.76** - Validação de schemas

### Utilitários
- **date-fns 3.6.0** - Manipulação de datas
- **clsx** - Utilitário para classes condicionais
- **tailwind-merge** - Merge de classes Tailwind

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/Atendebot-supremo/dashCRMAtendebot_front.git
cd dashCRMAtendebot_front

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (http://localhost:5173)

# Build
npm run build            # Build para produção
npm run build:dev        # Build em modo desenvolvimento
npm run preview          # Preview do build de produção

# Qualidade
npm run lint             # Executa ESLint

# Deploy (quando configurado)
npm run deploy           # Build e deploy no Firebase
npm run deploy:hosting   # Deploy apenas do hosting
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL base da API Helena/flw.chat
VITE_HELENA_API_URL=https://api.flw.chat

# Token de autenticação permanente
VITE_HELENA_API_TOKEN=pn_seu_token_aqui
```

**⚠️ Importante:** Em desenvolvimento, o Vite usa um proxy configurado em `vite.config.ts` para evitar problemas de CORS. Em produção, as variáveis são "baked in" durante o build.

### Proxy de Desenvolvimento

O projeto está configurado com proxy para desenvolvimento:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.flw.chat',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

Isso permite que requisições para `/api/*` sejam redirecionadas para `https://api.flw.chat/*` durante o desenvolvimento.

## 📁 Estrutura do Projeto

```
dashCRMAtendebot_front/
├── src/
│   ├── components/          # Componentes React
│   │   ├── charts/         # Componentes de gráficos (Recharts)
│   │   ├── dashboard/     # Componentes do dashboard
│   │   ├── funil/         # Visualização do funil de vendas
│   │   ├── metrics/        # Componentes de métricas
│   │   └── ui/             # Componentes base (Radix UI)
│   ├── lib/
│   │   ├── api/            # Cliente API e queries
│   │   │   ├── helena-client.ts
│   │   │   ├── helena-types.ts
│   │   │   └── queries.ts
│   │   └── utils/          # Funções utilitárias
│   │       ├── calculations.ts
│   │       ├── format.ts
│   │       ├── date.ts
│   │       └── stage-mapping.ts
│   ├── pages/              # Páginas da aplicação
│   │   ├── DashboardPage.tsx
│   │   └── TestApiPage.tsx
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── docs/                   # Documentação completa
├── Dockerfile              # Configuração Docker
├── nginx.conf              # Configuração Nginx
├── railway.json            # Configuração Railway
└── package.json
```

## 🎯 Funcionalidades

### Dashboard Principal

- **📊 Funil de Vendas** - Visualização do funil com métricas por etapa
- **💰 Métricas de Receita** - Total de receita, ticket médio, receita por vendedor
- **📈 Métricas de Conversão** - Taxa de conversão, ciclo de vendas, tempo de resposta
- **👥 Performance por Vendedor** - Análise de performance individual
- **📉 Análise de Perdas** - Cards perdidos e motivos
- **⏱️ Comparações Temporais** - Comparação entre períodos
- **📦 Análise de Produtos** - Distribuição por produtos

### Filtros

- **Período** - Filtro por data (início e fim)
- **Vendedor** - Filtrar por responsável
- **Canal** - Filtrar por canal de origem

### Recursos Técnicos

- ✅ Loading states em todos os componentes
- ✅ Error handling robusto
- ✅ Responsive design (mobile-first)
- ✅ Dark mode ready (Tremor suporta)
- ✅ TypeScript strict mode
- ✅ Caching inteligente (TanStack Query)
- ✅ Logs detalhados para debug

## 🚀 Deploy

### Railway (Recomendado)

O projeto está configurado para deploy no Railway:

1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente:
   - `VITE_HELENA_API_URL`
   - `VITE_HELENA_API_TOKEN`
3. Configure Build Arguments (importante!):
   - `VITE_HELENA_API_URL`
   - `VITE_HELENA_API_TOKEN`
4. Railway fará build e deploy automaticamente

📖 **Guia completo:** Veja `docs/DEPLOY_RAILWAY.md`

### Docker

```bash
# Build da imagem
docker build \
  --build-arg VITE_HELENA_API_URL=https://api.flw.chat \
  --build-arg VITE_HELENA_API_TOKEN=seu_token \
  -t dashboard-crm .

# Rodar container
docker run -p 8080:8080 dashboard-crm
```

## 📚 Documentação

Toda a documentação está na pasta `docs/`:

- **`docs/_START_HERE.md`** - Comece por aqui! Índice completo
- **`docs/README.md`** - Documentação detalhada (este arquivo)
- **`docs/DEPLOY_RAILWAY.md`** - Guia de deploy no Railway
- **`docs/ENV_VARS.md`** - Variáveis de ambiente
- **`docs/GIT_WORKFLOW.md`** - Fluxo de trabalho Git
- **`docs/API_DOCUMENTATION.md`** - Documentação da API backend (futuro)
- **`docs/MIGRATION_GUIDE.md`** - Guia de migração para backend próprio
- **`docs/QUICK_REFERENCE.md`** - Referência rápida

## 🔐 Segurança

### Estado Atual

⚠️ **Atenção:** Atualmente, o token da API está exposto no código JavaScript do frontend. Isso não é ideal para produção.

### Solução Recomendada

Implementar um backend intermediário (`dashCRMAtendebot_back`) que:
- Guarda o token de forma segura
- Implementa autenticação JWT
- Faz proxy das requisições para a API Helena
- Calcula métricas no servidor

📖 **Documentação do backend:** Veja `docs/API_DOCUMENTATION.md` e `docs/CURSOR_PROMPT.md`

## 🧪 Desenvolvimento

### Estrutura de Branches

- **`main`** - Produção (código estável)
- **`dev`** - Desenvolvimento (código em desenvolvimento)

📖 **Fluxo de trabalho:** Veja `docs/GIT_WORKFLOW.md`

### Padrões de Código

- TypeScript strict mode
- ESLint configurado
- Componentes funcionais (hooks)
- Path aliases (`@/` para `src/`)
- TailwindCSS para estilização
- Early returns quando possível

### Debug

O projeto inclui logs detalhados:

```typescript
console.log('🚀 [HelenaAPI] Fazendo requisição:', { url, method })
console.log('✅ [HelenaAPI] Dados recebidos:', { data })
console.error('❌ [HelenaAPI] Erro:', { error })
```

## 🐛 Troubleshooting

### CORS Error

**Problema:** Erro de CORS ao fazer requisições.

**Solução:** 
- Em desenvolvimento, o proxy do Vite resolve automaticamente
- Em produção, aguardar backend intermediário

### "Total de cards: 0"

**Problema:** Dashboard não carrega dados.

**Solução:**
1. Verificar se `VITE_HELENA_API_TOKEN` está configurado
2. Verificar se o token é válido
3. Verificar logs do console para erros de API

### Build falha no Railway

**Problema:** Build falha com erro de variáveis.

**Solução:**
1. Verificar se Build Arguments estão configurados
2. Verificar se variáveis estão no formato correto
3. Ver logs do Railway para detalhes

## 📊 Status do Projeto

- ✅ Dashboard funcional
- ✅ Integração com API Helena
- ✅ Métricas implementadas
- ✅ Filtros funcionando
- ✅ Deploy configurado (Railway)
- ⏳ Backend intermediário (planejado)
- ⏳ Autenticação JWT (planejado)

## 🤝 Contribuindo

1. Fazer fork do projeto
2. Criar branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📝 Licença

Este projeto é privado e proprietário.

## 📞 Suporte

- **Documentação:** Veja pasta `docs/`
- **Issues:** GitHub Issues
- **Email:** contato@atendebot.com

---

**Desenvolvido com ❤️ para AtendeBot**

**Versão:** 1.0.0  
**Última atualização:** Novembro 2024

