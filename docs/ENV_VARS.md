# 🔐 Variáveis de Ambiente - Dashboard CRM AtendeBot

## 📋 Variáveis Necessárias

### Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
# URL base da API Backend (SEM /api no final)
VITE_API_URL=https://dashcrmatendebotback-desenvolvimento.up.railway.app

# Para desenvolvimento local:
# VITE_API_URL=http://localhost:3000
```

### Railway (Produção)

Configure em **duas** etapas:

#### 1. Variables (Runtime)
```
Settings → Variables → Add Variable
```

Adicione:
```
VITE_HELENA_API_URL = https://api.flw.chat
VITE_HELENA_API_TOKEN = pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

#### 2. Build Arguments (Build Time) ⚠️ CRÍTICO
```
Settings → Build → Build Arguments
```

Adicione:
```
VITE_HELENA_API_URL = https://api.flw.chat
VITE_HELENA_API_TOKEN = pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

---

## ❓ Por Que Build Arguments?

O Vite **"bake in"** (injeta) as variáveis de ambiente no código durante o `npm run build`.

Se você não configurar os Build Arguments, o build será feito sem as variáveis, resultando em:
- `VITE_HELENA_API_URL = undefined`
- `VITE_HELENA_API_TOKEN = undefined`
- Dashboard não carregará dados

---

## 🔍 Como Verificar Se Funcionou

### Localmente:
```bash
npm run build
cat dist/assets/index-*.js | grep "flw.chat"
```

Se encontrar "flw.chat", as variáveis foram injetadas ✅

### No Railway:
1. Deploy a aplicação
2. Abra a URL do projeto
3. Abra DevTools → Network
4. Verifique se as requisições estão indo para `https://api.flw.chat`

---

## ⚠️ Aviso de Segurança

**Problema Atual:**
- O token está exposto no código JavaScript do frontend
- Qualquer pessoa pode ver o token inspecionando o código
- Não é seguro para produção

**Solução Recomendada:**
1. Criar backend intermediário (dashCRMAtendebot_back)
2. Backend guarda o token de forma segura
3. Frontend faz login e recebe JWT
4. Frontend usa JWT para chamar backend
5. Backend usa token Helena para chamar API

**Configuração Atual (Backend Implementado):**
```env
# Frontend (.env)
VITE_API_URL=https://dashcrmatendebotback-desenvolvimento.up.railway.app

# Backend (.env)
HELENA_API_URL=https://api.flw.chat
HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
JWT_SECRET=seu-secret-super-seguro
```

---

## 📝 Descrição das Variáveis

### `VITE_API_URL`
- **Tipo:** String (URL)
- **Obrigatório:** Sim
- **Descrição:** URL base da API Backend (sem `/api` no final)
- **Valor Desenvolvimento:** `https://dashcrmatendebotback-desenvolvimento.up.railway.app`
- **Valor Local:** `http://localhost:3000`
- **Nota:** As rotas da API incluem `/api/` automaticamente (ex: `/api/auth/login`)

---

## 🔧 Comandos Úteis

### Criar arquivo .env local
```bash
# Desenvolvimento (Railway)
echo "VITE_API_URL=https://dashcrmatendebotback-desenvolvimento.up.railway.app" > .env

# Ou local
echo "VITE_API_URL=http://localhost:3000" > .env
```

### Testar localmente
```bash
npm run dev
```

### Build com variáveis
```bash
npm run build
```

### Verificar variáveis no build
```bash
# Windows
findstr "flw.chat" dist\assets\index-*.js

# Linux/Mac
grep "flw.chat" dist/assets/index-*.js
```

---

## 🚀 Railway CLI

### Instalar
```bash
npm install -g @railway/cli
```

### Configurar variáveis via CLI
```bash
railway login
railway link
railway variables set VITE_HELENA_API_URL=https://api.flw.chat
railway variables set VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

### Ver variáveis atuais
```bash
railway variables
```

---

## 📚 Referências

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Build Arguments](https://docs.railway.app/deploy/builds#build-arguments)

