# 🔐 Variáveis de Ambiente - Dashboard CRM AtendeBot

## 📋 Variáveis Necessárias

### Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_HELENA_API_URL=https://api.flw.chat
VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
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

**Quando Backend Estiver Pronto:**
```env
# Frontend (.env)
VITE_HELENA_API_URL=https://seu-backend.railway.app/api
# Não precisa mais de VITE_HELENA_API_TOKEN

# Backend (.env)
HELENA_API_URL=https://api.flw.chat
HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
JWT_SECRET=seu-secret-super-seguro
```

---

## 📝 Descrição das Variáveis

### `VITE_HELENA_API_URL`
- **Tipo:** String (URL)
- **Obrigatório:** Sim
- **Descrição:** URL base da API Helena
- **Valor Atual:** `https://api.flw.chat`
- **Futuro:** `https://seu-backend.railway.app/api`

### `VITE_HELENA_API_TOKEN`
- **Tipo:** String (Bearer Token)
- **Obrigatório:** Sim (temporariamente)
- **Descrição:** Token permanente de autenticação da API Helena
- **Valor:** `pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk`
- **Futuro:** Remover (token ficará apenas no backend)

---

## 🔧 Comandos Úteis

### Criar arquivo .env local
```bash
echo "VITE_HELENA_API_URL=https://api.flw.chat" > .env
echo "VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk" >> .env
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

