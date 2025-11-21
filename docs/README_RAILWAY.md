# Dashboard CRM - Deploy Railway

## 🚀 Deploy Rápido

### Arquivos Configurados

✅ **Dockerfile** - Build multi-stage (Node.js + Nginx)  
✅ **nginx.conf** - Servidor web otimizado para SPA  
✅ **railway.json** - Configuração Railway  
✅ **.dockerignore** - Otimização de build  

### ⚠️ IMPORTANTE: Variáveis de Ambiente

**Vite requer variáveis no BUILD TIME, não no runtime!**

Configure na Railway antes do deploy:

```env
VITE_HELENA_API_URL=https://api.flw.chat
VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

**⚠️ ATENÇÃO:**
1. Configure as variáveis ANTES de fazer o deploy
2. Se já fez deploy, reconfigure e force um novo build
3. As variáveis são "baked in" no código durante o build

### Como Fazer Deploy

1. **Conectar Repositório na Railway**
   - Acesse https://railway.app/
   - New Project → Deploy from GitHub
   - Selecione o repositório

2. **⚠️ IMPORTANTE: Configurar Variáveis PRIMEIRO**
   - Na aba "Variables", adicione as variáveis acima
   - **ANTES** do primeiro deploy!
   - Se já deployou sem as variáveis:
     - Adicione as variáveis
     - Na aba "Deployments", clique em "..." → "Redeploy"

3. **Deploy Automático**
   - Railway detecta o Dockerfile automaticamente
   - Build leva ~2-3 minutos
   - Variáveis são injetadas durante o build
   - Aplicação roda na porta 8080

4. **Verificar**
   - Abra o console do navegador
   - Deve aparecer: `✅ [HelenaAPI] hasToken: true`
   - Se aparecer `❌ hasToken: false`, refaça o build

5. **Acessar Aplicação**
   - URL fornecida: `https://seu-projeto.up.railway.app`

## 🧪 Testar Localmente com Docker

```bash
# Build da imagem
docker build -t dashboard-crm .

# Rodar (substitua o token)
docker run -p 8080:8080 \
  -e VITE_HELENA_API_URL=https://api.flw.chat \
  -e VITE_HELENA_API_TOKEN=seu_token \
  dashboard-crm

# Acessar
# http://localhost:8080
```

## 📊 Características

- **Nginx Alpine** (leve e rápido)
- **Gzip compression** ativado
- **Cache de assets** (1 ano)
- **SPA routing** configurado
- **Health check** em `/health`
- **Security headers** habilitados

## 🔧 Troubleshooting

**Build falha?**
- Teste localmente: `npm run build`
- Verifique logs na Railway

**API não funciona?**
- Confirme variáveis de ambiente
- Em produção não usa proxy, vai direto para API

**404 nas rotas?**
- Nginx já configurado para SPA
- Todas as rotas fazem fallback para index.html

## 📁 Estrutura

```
Dockerfile          # Build Node.js → Nginx
nginx.conf          # Config SPA + Gzip + Cache
railway.json        # Config Railway
.dockerignore       # Otimização build
```

## 💰 Custos Railway

- **Gratuito**: $5/mês de crédito
- **Consumo estimado**: $2-3/mês
- **Inclui**: 
  - CPU compartilhado
  - ~100MB RAM
  - SSL automático
  - Deploy automático via Git

## ✅ Checklist Pós-Deploy

- [ ] Testar acesso ao dashboard
- [ ] Verificar integração com API Helena
- [ ] Testar filtros e visualizações
- [ ] Configurar domínio customizado (opcional)
- [ ] Adicionar monitoramento (Sentry, opcional)

