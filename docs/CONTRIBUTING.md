# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Dashboard CRM AtendeBot! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)

## 📜 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter este código.

### Nossos Compromissos

- Ambiente acolhedor e inclusivo
- Respeito a diferentes pontos de vista e experiências
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade

## 🚀 Como Contribuir

### 1. Fork o Projeto

1. Faça fork do repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/dashCRMAtendebot_front.git`
3. Adicione o repositório original como upstream:
   ```bash
   git remote add upstream https://github.com/Atendebot-supremo/dashCRMAtendebot_front.git
   ```

### 2. Crie uma Branch

```bash
# Atualizar main
git checkout main
git pull upstream main

# Criar branch de feature
git checkout -b feature/nome-da-feature

# Ou branch de bugfix
git checkout -b bugfix/descricao-do-bug
```

### 3. Faça suas Mudanças

- Siga os [Padrões de Código](#padrões-de-código)
- Adicione testes se aplicável
- Atualize documentação se necessário
- Certifique-se de que o código compila sem erros

### 4. Commit suas Mudanças

Use mensagens de commit descritivas:

```bash
# Formato
tipo: descrição curta

Descrição detalhada (opcional)

# Exemplos
git commit -m "feat: adicionar filtro por período no dashboard"
git commit -m "fix: corrigir cálculo de taxa de conversão"
git commit -m "docs: atualizar guia de deploy no Railway"
```

### 5. Push para seu Fork

```bash
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request

1. Vá para o repositório original no GitHub
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template do PR
5. Aguarde revisão

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/Atendebot-supremo/dashCRMAtendebot_front.git
cd dashCRMAtendebot_front

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── lib/           # Utilitários e API
├── pages/         # Páginas da aplicação
└── ...
```

## 📝 Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Defina tipos explícitos quando necessário
- Evite `any` - use `unknown` se necessário
- Use interfaces para objetos, types para unions

```typescript
// ✅ Bom
interface User {
  id: string
  name: string
  email: string
}

// ❌ Evitar
const user: any = { id: '1', name: 'John' }
```

### React

- Use componentes funcionais
- Use hooks quando apropriado
- Evite componentes de classe
- Use early returns quando possível

```typescript
// ✅ Bom
const MyComponent = ({ name }: { name: string }) => {
  if (!name) return null
  
  return <div>{name}</div>
}

// ❌ Evitar
class MyComponent extends React.Component {
  // ...
}
```

### Estilização

- Use TailwindCSS para estilização
- Evite CSS inline quando possível
- Use classes utilitárias do Tailwind
- Mantenha consistência com o design system

```typescript
// ✅ Bom
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Evitar
<div style={{ display: 'flex', padding: '16px' }}>
```

### Nomenclatura

- **Componentes:** PascalCase (`DashboardPage.tsx`)
- **Arquivos:** camelCase ou kebab-case (`helena-client.ts`)
- **Variáveis/Funções:** camelCase (`getCards`, `userName`)
- **Constantes:** UPPER_SNAKE_CASE (`API_URL`)
- **Types/Interfaces:** PascalCase (`Card`, `DashboardFilters`)

### Imports

- Ordene imports: externos → internos
- Use path aliases (`@/` para `src/`)
- Agrupe imports relacionados

```typescript
// ✅ Bom
import { useState, useEffect } from 'react'
import { useCards } from '@/lib/api/queries'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// ❌ Evitar
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useState } from 'react'
import { useCards } from '@/lib/api/queries'
```

### Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (não afeta código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

## 🔄 Processo de Pull Request

### Antes de Abrir um PR

- [ ] Código segue os padrões
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Build funciona (`npm run build`)
- [ ] Testado localmente
- [ ] Documentação atualizada (se necessário)
- [ ] Commits com mensagens descritivas

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
Passos para testar as mudanças:
1. ...
2. ...

## Checklist
- [ ] Código segue padrões
- [ ] Testado localmente
- [ ] Documentação atualizada
- [ ] Sem erros de lint
```

### Revisão

- PRs serão revisados por mantenedores
- Feedback será fornecido via comentários
- Mudanças podem ser solicitadas
- Após aprovação, o PR será mergeado

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Teste na versão mais recente
3. Tente reproduzir o bug

### Como Reportar

Use o template de issue:

```markdown
## Descrição
Descrição clara do bug.

## Passos para Reproduzir
1. ...
2. ...
3. ...

## Comportamento Esperado
O que deveria acontecer.

## Comportamento Atual
O que está acontecendo.

## Screenshots
Se aplicável.

## Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 1.0.0]
```

## 💡 Sugerir Funcionalidades

### Antes de Sugerir

1. Verifique se a funcionalidade já foi sugerida
2. Considere se faz sentido para o projeto
3. Pense em casos de uso

### Como Sugerir

Use o template de feature request:

```markdown
## Descrição
Descrição clara da funcionalidade.

## Problema que Resolve
Qual problema isso resolve?

## Solução Proposta
Como você imagina que funcionaria?

## Alternativas Consideradas
Outras soluções que você pensou.

## Contexto Adicional
Qualquer outra informação relevante.
```

## 📚 Recursos

### Documentação

- [README.md](../README.md) - Visão geral do projeto
- [docs/_START_HERE.md](docs/_START_HERE.md) - Índice de documentação
- [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) - Fluxo de trabalho Git

### Links Úteis

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)

## ❓ Dúvidas?

- Abra uma issue no GitHub
- Consulte a documentação em `docs/`
- Entre em contato com os mantenedores

---

**Obrigado por contribuir! 🎉**

