# Deploy do Dashboard CRM na Railway

## Arquivos de Configuração

O projeto está configurado para deploy na Railway usando Docker e Nginx.

### Arquivos criados:

- `Dockerfile` - Build multi-stage para produção
- `nginx.conf` - Configuração do Nginx para servir o SPA
- `railway.json` - Configuração da Railway
- `.dockerignore` - Arquivos a ignorar no build

## Passo a Passo do Deploy

### 1. Preparar Variáveis de Ambiente

Na Railway, configure as seguintes variáveis de ambiente:

```
VITE_HELENA_API_URL=https://api.flw.chat
VITE_HELENA_API_TOKEN=seu_token_aqui
```

### 2. Conectar Repositório

1. Acesse [Railway](https://railway.app/)
2. Crie um novo projeto
3. Conecte seu repositório do GitHub
4. A Railway detectará automaticamente o `railway.json`

### 3. Deploy Automático

A Railway irá:
1. Detectar o Dockerfile
2. Fazer build da aplicação com Vite
3. Servir os arquivos estáticos com Nginx na porta 8080
4. Configurar health check em `/health`

### 4. Domínio

A Railway fornecerá um domínio automático:
- `https://seu-projeto.up.railway.app`

Você pode adicionar um domínio customizado nas configurações.

## Características do Deploy

### Build Multi-Stage
- **Stage 1**: Build da aplicação React + Vite
- **Stage 2**: Nginx Alpine servindo arquivos estáticos

### Otimizações
- ✅ Gzip compression habilitado
- ✅ Cache de assets estáticos (1 ano)
- ✅ SPA routing (fallback para index.html)
- ✅ Security headers
- ✅ Health check endpoint

### Porta
- A aplicação roda na porta **8080** (padrão Railway)

## Comandos Úteis

### Build local para teste
```bash
# Build da aplicação
npm run build

# Preview local
npm run preview
```

### Build com Docker localmente
```bash
# Build da imagem
docker build -t dashboard-crm .

# Rodar container
docker run -p 8080:8080 \
  -e VITE_HELENA_API_URL=https://api.flw.chat \
  -e VITE_HELENA_API_TOKEN=seu_token \
  dashboard-crm
```

### Logs na Railway
```bash
# Via Railway CLI
railway logs
```

## Troubleshooting

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Confirme que `npm run build` funciona localmente

### Variáveis de ambiente não funcionam
- Lembre-se: variáveis `VITE_*` precisam ser definidas no **build time**
- Configure as variáveis na Railway antes do deploy

### Rotas 404
- O `nginx.conf` está configurado para SPA routing
- Todas as rotas fazem fallback para `index.html`

### API CORS
- Em produção, não usamos proxy
- A API deve permitir requisições do domínio Railway
- Configure `VITE_HELENA_API_URL` para apontar diretamente para `https://api.flw.chat`

## Estrutura de Arquivos

```
.
├── Dockerfile              # Build multi-stage
├── nginx.conf              # Configuração Nginx
├── railway.json            # Config Railway
├── .dockerignore          # Arquivos ignorados
└── dist/                  # Arquivos buildados (gerado)
```

## Monitoramento

A Railway fornece:
- 📊 Métricas de CPU/Memória
- 📝 Logs em tempo real
- 🔄 Deploy automático via Git
- 💚 Health checks automáticos

## Custos

- Railway oferece $5 de crédito gratuito mensalmente
- Projeto consome aproximadamente:
  - CPU: Baixo (apenas Nginx)
  - Memória: ~50-100MB
  - Tráfego: Depende do uso

## Próximos Passos

Após o deploy:
1. ✅ Testar todas as funcionalidades
2. ✅ Verificar se a API está respondendo
3. ✅ Configurar domínio customizado (opcional)
4. ✅ Configurar monitoramento de erros (Sentry, etc.)

