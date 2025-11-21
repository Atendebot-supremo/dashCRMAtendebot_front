# 🌿 Git Workflow - Dashboard CRM AtendeBot

## 📋 Estrutura de Branches

### Branches Principais

- **`main`** - Produção (código estável e testado)
- **`dev`** - Desenvolvimento (código em desenvolvimento)

---

## 🔄 Fluxo de Trabalho

### Desenvolvimento Diário

```bash
# 1. Garantir que está na branch dev
git checkout dev

# 2. Atualizar com as últimas mudanças
git pull origin dev

# 3. Criar branch de feature (opcional, mas recomendado)
git checkout -b feature/nome-da-feature

# 4. Trabalhar no código...
# ... fazer commits ...

# 5. Fazer push da feature
git push origin feature/nome-da-feature

# 6. Voltar para dev e fazer merge
git checkout dev
git merge feature/nome-da-feature

# 7. Enviar dev para o repositório
git push origin dev
```

### Deploy para Produção

```bash
# 1. Garantir que dev está atualizada
git checkout dev
git pull origin dev

# 2. Testar tudo localmente
npm run build
npm run preview

# 3. Fazer merge de dev para main
git checkout main
git pull origin main
git merge dev

# 4. Fazer push para produção
git push origin main

# 5. Railway fará deploy automaticamente da branch main
```

---

## 📝 Convenções de Commits

### Formato
```
tipo: descrição curta

Descrição detalhada (opcional)
```

### Tipos
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (não afeta código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

### Exemplos
```bash
git commit -m "feat: adicionar autenticação JWT"
git commit -m "fix: corrigir cálculo de métricas de funil"
git commit -m "docs: atualizar guia de deploy no Railway"
git commit -m "refactor: reorganizar estrutura de pastas"
```

---

## 🚀 Comandos Úteis

### Verificar Status
```bash
# Ver branch atual
git branch

# Ver todas as branches (locais e remotas)
git branch -a

# Ver status das mudanças
git status

# Ver histórico de commits
git log --oneline --graph --all
```

### Trabalhar com Branches
```bash
# Criar nova branch
git checkout -b feature/nome

# Mudar de branch
git checkout dev

# Deletar branch local
git branch -d feature/nome

# Deletar branch remota
git push origin --delete feature/nome
```

### Sincronizar com Remoto
```bash
# Atualizar branch atual
git pull origin dev

# Enviar mudanças
git push origin dev

# Ver diferenças
git diff origin/dev
```

### Desfazer Mudanças
```bash
# Descartar mudanças não commitadas
git restore arquivo.ts

# Descartar todas as mudanças
git restore .

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1
```

---

## 🔀 Merge vs Rebase

### Merge (Recomendado)
```bash
# Merge de dev para main
git checkout main
git merge dev
git push origin main
```

**Vantagens:**
- Preserva histórico completo
- Mais seguro
- Fácil de reverter

### Rebase (Avançado)
```bash
# Rebase de dev em main
git checkout dev
git rebase main
```

**Vantagens:**
- Histórico linear
- Mais limpo

**Desvantagens:**
- Pode ser perigoso se já foi feito push
- Reescreve histórico

---

## 🛡️ Proteção de Branches (GitHub)

### Configurar Proteção da Branch `main`

1. Acesse: **Settings → Branches**
2. Adicionar regra para `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Restrict who can push to matching branches

### Workflow com Pull Requests

```bash
# 1. Trabalhar em feature branch
git checkout -b feature/nova-funcionalidade
# ... fazer commits ...

# 2. Push da feature
git push origin feature/nova-funcionalidade

# 3. Criar Pull Request no GitHub
# - Base: dev
# - Compare: feature/nova-funcionalidade

# 4. Após aprovação, merge via GitHub

# 5. Deletar branch local e remota
git checkout dev
git pull origin dev
git branch -d feature/nova-funcionalidade
git push origin --delete feature/nova-funcionalidade
```

---

## 📊 Estrutura de Branches Recomendada

```
main (produção)
  ↑
  └── dev (desenvolvimento)
       ↑
       ├── feature/autenticacao
       ├── feature/dashboard
       ├── feature/metricas
       └── hotfix/cors-error
```

### Tipos de Branches

- **`main`** - Código em produção
- **`dev`** - Código em desenvolvimento
- **`feature/*`** - Novas funcionalidades
- **`hotfix/*`** - Correções urgentes em produção
- **`bugfix/*`** - Correções de bugs

---

## 🚨 Situações Especiais

### Merge de Hotfix Urgente

```bash
# 1. Criar hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/cors-error

# 2. Corrigir bug
# ... fazer commit ...

# 3. Merge em main
git checkout main
git merge hotfix/cors-error
git push origin main

# 4. Merge em dev também
git checkout dev
git merge hotfix/cors-error
git push origin dev
```

### Resolver Conflitos

```bash
# 1. Tentar merge
git merge dev

# 2. Se houver conflitos, Git mostrará:
# CONFLICT (content): Merge conflict in arquivo.ts

# 3. Abrir arquivo e resolver manualmente
# Procurar por marcadores:
# <<<<<<< HEAD
# código da branch atual
# =======
# código da branch sendo mergeada
# >>>>>>> dev

# 4. Após resolver, adicionar arquivo
git add arquivo.ts

# 5. Finalizar merge
git commit
```

---

## 🔍 Verificar Diferenças

### Entre Branches
```bash
# Ver diferenças entre dev e main
git diff main..dev

# Ver arquivos diferentes
git diff --name-only main..dev

# Ver commits diferentes
git log main..dev
```

### Antes de Fazer Push
```bash
# Ver o que será enviado
git diff origin/dev

# Ver commits que serão enviados
git log origin/dev..HEAD
```

---

## 📦 Tags para Versões

### Criar Tag
```bash
# Tag de versão
git tag -a v1.0.0 -m "Versão 1.0.0 - Release inicial"

# Enviar tag para remoto
git push origin v1.0.0

# Enviar todas as tags
git push origin --tags
```

### Listar Tags
```bash
# Ver todas as tags
git tag

# Ver detalhes de uma tag
git show v1.0.0
```

---

## 🎯 Checklist Antes de Merge

Antes de fazer merge de `dev` para `main`:

- [ ] Código testado localmente
- [ ] Build sem erros (`npm run build`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente documentadas
- [ ] Commits com mensagens descritivas
- [ ] Branch `dev` atualizada
- [ ] Sem conflitos pendentes

---

## 🚀 Deploy Automático

### Railway Configuration

Railway pode ser configurado para fazer deploy automático:

- **Branch `main`** → Deploy em produção
- **Branch `dev`** → Deploy em staging (opcional)

### Configurar no Railway

1. **Settings → Source**
2. Selecionar branch:
   - **Production:** `main`
   - **Preview:** `dev` (opcional)

---

## 📚 Comandos Rápidos

### Setup Inicial (já feito)
```bash
git checkout -b dev
git push -u origin dev
```

### Trabalho Diário
```bash
# Atualizar
git checkout dev
git pull origin dev

# Trabalhar
git checkout -b feature/nome
# ... commits ...
git push origin feature/nome

# Merge
git checkout dev
git merge feature/nome
git push origin dev
```

### Deploy
```bash
git checkout main
git merge dev
git push origin main
```

---

## 🔐 Boas Práticas

### ✅ Fazer
- Trabalhar sempre em `dev` ou branches de feature
- Fazer commits frequentes e pequenos
- Escrever mensagens de commit descritivas
- Fazer pull antes de push
- Testar antes de merge em `main`
- Usar branches de feature para funcionalidades grandes

### ❌ Evitar
- Commits diretos em `main`
- Commits grandes com muitas mudanças
- Mensagens de commit vagas ("fix", "update")
- Push sem testar
- Merge sem revisar código
- Deletar branches importantes

---

## 📞 Troubleshooting

### "Your branch is ahead of 'origin/dev'"
```bash
# Fazer push
git push origin dev
```

### "Your branch is behind 'origin/dev'"
```bash
# Fazer pull
git pull origin dev
```

### "Merge conflict"
```bash
# Ver arquivos com conflito
git status

# Resolver manualmente
# Depois:
git add .
git commit
```

### "Branch diverged"
```bash
# Ver diferenças
git log --oneline --graph --all

# Fazer merge
git pull origin dev --no-rebase
```

---

## 🎉 Status Atual

✅ Branch `main` criada e configurada  
✅ Branch `dev` criada e configurada  
✅ Tracking configurado  
✅ Pronto para desenvolvimento!  

**Branch atual:** `dev`  
**Próximo passo:** Começar a desenvolver na branch `dev`

---

**Última atualização:** Novembro 2024  
**Repositório:** https://github.com/Atendebot-supremo/dashCRMAtendebot_front

