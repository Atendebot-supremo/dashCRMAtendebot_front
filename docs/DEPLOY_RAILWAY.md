# 🚀 Deploy no Railway - Dashboard CRM AtendeBot (Frontend)

## 📋 Pré-requisitos

- Conta no [Railway.app](https://railway.app)
- Projeto conectado ao GitHub
- Token da API Helena em mãos

---

## 🔧 Configuração das Variáveis de Ambiente

No Railway, adicione as seguintes variáveis de ambiente:

### Variáveis Obrigatórias

```env
# URL da API (quando backend próprio estiver pronto)
VITE_HELENA_API_URL=https://api.flw.chat

# Token de autenticação da API Helena
VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

### ⚠️ IMPORTANTE: Build Arguments

Como o Vite "bake in" (injeta) as variáveis de ambiente durante o build, você precisa configurar no Railway:

1. **Settings → Build**
2. Adicionar **Build Arguments**:
   - `VITE_HELENA_API_URL` = `https://api.flw.chat`
   - `VITE_HELENA_API_TOKEN` = `pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk`

---

## 📦 Arquivos de Deploy

### 1. Dockerfile

```dockerfile
# ===========================================
# STAGE 1: BUILD
# ===========================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variáveis injetadas durante o build
ARG VITE_HELENA_API_URL
ARG VITE_HELENA_API_TOKEN

ENV VITE_HELENA_API_URL=$VITE_HELENA_API_URL
ENV VITE_HELENA_API_TOKEN=$VITE_HELENA_API_TOKEN

RUN npm run build

# ===========================================
# STAGE 2: PRODUCTION
# ===========================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### 2. railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. nginx.conf

Configuração do Nginx com:
- Gzip compression
- Cache de assets estáticos
- SPA fallback (todas as rotas → index.html)
- Health check endpoint (`/health`)
- Security headers

---

## 🚀 Passo a Passo do Deploy

### 1. Preparar o Repositório

```bash
# Garantir que todos os arquivos estão commitados
git add .
git commit -m "chore: configurar deploy no Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [Railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório `dashCRMAtendebot_front`
5. Railway detectará automaticamente o Dockerfile

### 3. Configurar Variáveis de Ambiente

#### Via Interface Web:

1. No projeto, clique em **"Variables"**
2. Adicione:
   ```
   VITE_HELENA_API_URL = https://api.flw.chat
   VITE_HELENA_API_TOKEN = pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
   ```

#### Via Railway CLI (opcional):

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Adicionar variáveis
railway variables set VITE_HELENA_API_URL=https://api.flw.chat
railway variables set VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

### 4. Configurar Build Arguments

⚠️ **CRÍTICO para funcionamento:**

1. **Settings → Build**
2. Adicionar **"Build Arguments"**:
   ```
   VITE_HELENA_API_URL=https://api.flw.chat
   VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
   ```

### 5. Deploy

Railway fará o deploy automaticamente. Você verá:

```
✓ Building Docker image
✓ Running npm ci
✓ Building Vite app
✓ Creating nginx container
✓ Deploying...
✓ Deploy successful!
```

### 6. Verificar Health Check

Acesse: `https://seu-app.railway.app/health`

Deve retornar:
```
healthy
```

### 7. Acessar Aplicação

Acesse: `https://seu-app.railway.app`

O dashboard deve carregar normalmente.

---

## 🔍 Troubleshooting

### Problema 1: "Total de cards: 0" na produção

**Causa:** Token não foi injetado corretamente no build.

**Solução:**
1. Verificar se Build Arguments estão configurados
2. Fazer novo deploy: **"Deployments" → "⋮" → "Redeploy"**

### Problema 2: CORS Error

**Causa:** API Helena bloqueando requisições do domínio Railway.

**Solução:**
- Aguardar backend próprio (dashCRMAtendebot_back)
- Backend fará proxy das requisições

### Problema 3: Página em branco

**Causa:** Erro no build ou variáveis incorretas.

**Solução:**
1. Ver logs: **"Deployments" → "View Logs"**
2. Procurar por erros de build
3. Verificar se `dist/` foi criado corretamente

### Problema 4: 502 Bad Gateway

**Causa:** Health check falhando.

**Solução:**
1. Verificar se nginx.conf foi copiado corretamente
2. Testar localmente:
   ```bash
   docker build -t test .
   docker run -p 8080:8080 test
   curl http://localhost:8080/health
   ```

### Problema 5: Assets não carregam (404)

**Causa:** Configuração de roteamento SPA.

**Solução:**
- Verificar `nginx.conf` tem `try_files $uri $uri/ /index.html;`
- Redeploy

---

## 🧪 Testar Localmente Antes do Deploy

### Teste 1: Build Local

```bash
npm run build
npm run preview
```

Abra: `http://localhost:4173`

### Teste 2: Docker Local

```bash
# Build da imagem
docker build -t dashboard-crm \
  --build-arg VITE_HELENA_API_URL=https://api.flw.chat \
  --build-arg VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk \
  .

# Rodar container
docker run -p 8080:8080 dashboard-crm

# Testar
curl http://localhost:8080/health
open http://localhost:8080
```

### Teste 3: Verificar Variáveis no Build

```bash
# Depois do build, inspecionar código
cat dist/assets/index-*.js | grep "flw.chat"
```

Se não encontrar "flw.chat", as variáveis não foram injetadas.

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
railway logs
```

Ou na interface: **"Deployments" → "View Logs"**

### Métricas

Railway fornece automaticamente:
- CPU usage
- Memory usage
- Network traffic
- Request count

---

## 🔄 Atualizações Futuras

Quando o backend estiver pronto:

### 1. Atualizar Variável de Ambiente

```bash
railway variables set VITE_HELENA_API_URL=https://seu-backend.railway.app/api
```

### 2. Remover Token do Frontend

O token deve estar apenas no backend. Remover:
```bash
railway variables delete VITE_HELENA_API_TOKEN
```

### 3. Atualizar Build Arguments

Remover `VITE_HELENA_API_TOKEN` dos Build Arguments.

### 4. Redeploy

```bash
git commit -m "chore: usar backend próprio"
git push
```

---

## 💰 Custos

Railway oferece:
- **Hobby Plan (Gratuito):**
  - $5 de crédito/mês
  - Suficiente para aplicação frontend leve
  - Sem cartão necessário

- **Developer Plan ($5/mês):**
  - $5 de crédito incluído
  - Deploy ilimitado
  - Logs mais extensivos

**Estimativa para este projeto:**
- Frontend estático: ~$0.50 - $2/mês
- Bem dentro do plano gratuito

---

## 🔐 Segurança

### Checklist de Segurança:

- [x] Token no backend apenas (futuro)
- [x] HTTPS habilitado por padrão (Railway)
- [x] Security headers no nginx
- [x] Gzip compression habilitado
- [x] Cache de assets estáticos
- [x] Health check configurado
- [x] Restart policy configurado

### Próximos Passos de Segurança:

- [ ] Implementar backend próprio
- [ ] Remover token do frontend
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting no backend
- [ ] Configurar CORS no backend

---

## 📞 Suporte

### Railway:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://railway.statuspage.io

### Projeto:
- Issues: GitHub Issues
- Documentação: Ver outros arquivos .md no repositório

---

## ✅ Checklist Final

Antes de considerar deploy concluído:

- [ ] Build local funciona
- [ ] Docker local funciona
- [ ] Deploy no Railway sem erros
- [ ] Health check retorna 200
- [ ] Dashboard abre corretamente
- [ ] Cards carregam (não aparecem zero)
- [ ] Filtros funcionam
- [ ] Gráficos renderizam
- [ ] Responsivo funciona (mobile)
- [ ] Logs não mostram erros
- [ ] Performance aceitável (< 3s load)

---

## 🎉 Deploy Concluído!

Sua URL será algo como:
```
https://dashcrmatendebot-front-production.up.railway.app
```

**Próximos passos:**
1. Implementar backend (dashCRMAtendebot_back)
2. Atualizar frontend para usar backend
3. Implementar login
4. Adicionar mais features

**Boa sorte! 🚀**

