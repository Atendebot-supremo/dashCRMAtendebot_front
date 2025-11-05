# 🔧 FIX: Token não configurado na Railway

## Problema

Após fazer deploy na Railway, o console mostra:

```
❌ [HelenaAPI] Token de autenticação não configurado
⚠️ [HelenaAPI] VITE_HELENA_API_TOKEN não configurado
```

## Por que isso acontece?

**Vite usa variáveis de ambiente no BUILD TIME, não no runtime!**

Quando você faz `npm run build`, o Vite substitui todas as referências a `import.meta.env.VITE_*` pelos valores reais das variáveis. Essas variáveis ficam "baked in" no código JavaScript final.

## Solução

### 1. Adicionar Variáveis na Railway

Na aba **Variables** do seu projeto Railway, adicione:

```env
VITE_HELENA_API_URL=https://api.flw.chat
VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk
```

### 2. Forçar Novo Build

**Se você já fez deploy antes de adicionar as variáveis:**

1. Vá na aba **Deployments**
2. Clique nos 3 pontinhos (...) do último deploy
3. Selecione **"Redeploy"**
4. Aguarde o novo build (~2-3 minutos)

### 3. Verificar se Funcionou

Abra o console do navegador na aplicação deployada:

```javascript
// ✅ Deve aparecer:
🔧 [HelenaAPI] Configuração inicializada: {
  hasToken: true,
  tokenPreview: "pn_mh3AGdH..."
}
```

Se aparecer `hasToken: false`, o token não foi configurado corretamente.

## Dockerfile Atualizado

O Dockerfile foi atualizado para receber as variáveis como argumentos de build:

```dockerfile
# Argumentos de build para variáveis de ambiente
ARG VITE_HELENA_API_URL
ARG VITE_HELENA_API_TOKEN

# Definir variáveis de ambiente para o build
ENV VITE_HELENA_API_URL=$VITE_HELENA_API_URL
ENV VITE_HELENA_API_TOKEN=$VITE_HELENA_API_TOKEN

# Build da aplicação Vite (variáveis são "baked in" no código)
RUN npm run build
```

## Checklist

- [ ] Variáveis adicionadas na Railway
- [ ] Novo deploy feito após adicionar variáveis
- [ ] Console mostra `hasToken: true`
- [ ] Dashboard carrega dados da API

## Não Funcionou?

### Verifique:

1. **Variáveis estão corretas?**
   - Nome exato: `VITE_HELENA_API_URL` e `VITE_HELENA_API_TOKEN`
   - Valores sem aspas extras

2. **Fez redeploy?**
   - Só adicionar variáveis não basta
   - Precisa fazer um novo build

3. **Logs de build**
   - Na Railway, veja os logs do build
   - Procure por erros durante `npm run build`

4. **Teste local**
   ```bash
   # Crie um arquivo .env.local
   echo 'VITE_HELENA_API_URL=https://api.flw.chat' > .env.local
   echo 'VITE_HELENA_API_TOKEN=pn_mh3AGdH9Exo8PsLsEQjRvg80IB66FEOieyPJlKaCxk' >> .env.local
   
   # Build
   npm run build
   
   # Verifique se funcionou
   npm run preview
   ```

## Exemplo Visual na Railway

1. **Variables Tab:**
   ```
   ┌─────────────────────────────────────────────────┐
   │ Environment Variables                            │
   ├─────────────────────────────────────────────────┤
   │ VITE_HELENA_API_URL     https://api.flw.chat    │
   │ VITE_HELENA_API_TOKEN   pn_mh3AGdH9...          │
   └─────────────────────────────────────────────────┘
   ```

2. **Deployments Tab:**
   ```
   ┌─────────────────────────────────────────────────┐
   │ Deployments                                      │
   ├─────────────────────────────────────────────────┤
   │ ● Active    main    2 min ago    [...]          │
   │                                    └─ Redeploy   │
   └─────────────────────────────────────────────────┘
   ```

## Sucesso!

Quando tudo funcionar, você verá:

```
✅ [HelenaAPI] Configuração inicializada
✅ [HelenaAPI] Dados recebidos
📊 [DashboardPage] Total de cards: 15
```

