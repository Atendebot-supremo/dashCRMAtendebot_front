# 🎨 Design System - Dashboard CRM AtendeBot

## Visão Geral

O Dashboard CRM AtendeBot utiliza um design system moderno baseado em **tema dark elegante** com efeitos de **glassmorphism** e **gradientes sutis**. O design foi criado para ser profissional, moderno e visualmente atraente.

---

## 🎨 Paleta de Cores

### Cores Principais

```css
/* Cor Accent - Verde Vibrante */
--accent: #c8fa00
--accent-hover: #b8ea00
--accent-dark: #a8d600

/* Backgrounds - Escala de Cinzas Escuros */
--bg-primary: #111827 (gray-900)
--bg-secondary: #1f2937 (gray-800)
--bg-tertiary: #374151 (gray-700)

/* Textos */
--text-primary: #ffffff (white)
--text-secondary: #d1d5db (gray-300)
--text-tertiary: #9ca3af (gray-400)
--text-muted: #6b7280 (gray-500)

/* Bordas */
--border-primary: rgba(55, 65, 81, 0.5) (gray-700/50)
--border-secondary: rgba(75, 85, 99, 0.3) (gray-600/30)

/* Estados */
--success: #10b981 (emerald-500)
--error: #ef4444 (red-500)
--warning: #f59e0b (amber-500)
```

### Uso das Cores

- **Accent (#c8fa00)**: Botões principais, ícones destacados, badges de sucesso
- **Backgrounds**: Gradientes de gray-900 → gray-800 → gray-900
- **Textos**: Hierarquia clara com diferentes tons de cinza
- **Bordas**: Transparências sutis para efeito glassmorphism

---

## 🌟 Efeitos Visuais

### Glassmorphism

```css
/* Exemplo de card com glassmorphism */
.card {
  background: rgba(31, 41, 55, 0.8); /* gray-800/80 */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(55, 65, 81, 0.5); /* gray-700/50 */
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Gradientes Decorativos

O dashboard utiliza gradientes radiais decorativos no background:

```css
/* Gradiente radial superior esquerdo */
background: radial-gradient(
  ellipse at center,
  rgba(200, 250, 0, 0.1) 0%,
  transparent 70%
);

/* Gradiente radial inferior direito */
background: radial-gradient(
  ellipse at center,
  rgba(200, 250, 0, 0.05) 0%,
  transparent 70%
);
```

### Efeitos de Hover

```css
/* Hover em cards */
.card:hover {
  border-color: rgba(200, 250, 0, 0.3);
  box-shadow: 0 25px 50px -12px rgba(200, 250, 0, 0.1);
}

/* Glow effect */
.glow {
  background: linear-gradient(
    to bottom right,
    rgba(200, 250, 0, 0.05),
    transparent
  );
  opacity: 0;
  transition: opacity 300ms;
}

.glow:hover {
  opacity: 1;
}
```

---

## 📐 Componentes Base

### DashboardLayout

**Localização:** `src/components/dashboard/DashboardLayout.tsx`

**Características:**
- Background gradiente escuro
- Efeitos decorativos fixos no background
- Header com glassmorphism
- Menu do usuário com dropdown elegante
- Footer discreto

**Estrutura:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  {/* Background decorativo fixo */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Gradientes radiais */}
  </div>
  
  {/* Header */}
  <header className="relative z-20 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-xl">
    {/* Logo e menu */}
  </header>
  
  {/* Conteúdo */}
  <main className="relative z-10">
    {/* Children */}
  </main>
  
  {/* Footer */}
  <footer className="relative z-10 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
    {/* Copyright */}
  </footer>
</div>
```

### TremorMetricCard

**Localização:** `src/components/dashboard/TremorMetricCard.tsx`

**Características:**
- Card com glassmorphism
- Ícone em container com gradiente
- Efeito glow no hover
- Transições suaves

**Estrutura:**
```tsx
<div className="group relative rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
  {/* Glow effect */}
  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c8fa00]/5 to-transparent opacity-0 group-hover:opacity-100" />
  
  {/* Conteúdo */}
  <div className="relative flex items-start justify-between">
    {/* Métricas */}
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    
    {/* Ícone */}
    <div className="ml-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#c8fa00]/20 to-[#c8fa00]/5">
      <Icon className="h-7 w-7 text-[#c8fa00]" />
    </div>
  </div>
</div>
```

### ChartCard

**Localização:** `src/components/dashboard/ChartCard.tsx`

**Características:**
- Container para gráficos
- Header separado com ícone opcional
- Conteúdo com padding adequado

**Estrutura:**
```tsx
<div className="group relative rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
  {/* Header */}
  <div className="border-b border-gray-700/50 px-6 py-4">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8fa00]/10">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  </div>
  
  {/* Content */}
  <div className="p-6">{children}</div>
</div>
```

### FiltersBar

**Localização:** `src/components/dashboard/FiltersBar.tsx`

**Características:**
- Barra de filtros com glassmorphism
- Ícones para cada seção
- Selects estilizados com tema dark
- Botão de reset elegante

---

## 📊 Gráficos

### Configuração Dark Mode

Todos os gráficos (BarChart, LineChart, PieChart, FunnelChart) foram atualizados para tema dark:

```typescript
// Exemplo: BarChart
<CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
<XAxis
  tick={{ fill: '#9ca3af', fontSize: 12 }}
  axisLine={{ stroke: '#4b5563' }}
/>
<YAxis
  tick={{ fill: '#9ca3af', fontSize: 12 }}
  axisLine={{ stroke: '#4b5563' }}
/>
<Tooltip
  contentStyle={{
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  }}
  labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
  itemStyle={{ color: '#d1d5db' }}
/>
```

### Paleta de Cores dos Gráficos

```typescript
const colors = [
  '#c8fa00', // Verde accent (primária)
  '#10b981', // Verde esmeralda
  '#3b82f6', // Azul
  '#8b5cf6', // Roxo
  '#f59e0b', // Âmbar
  '#ef4444', // Vermelho
  '#06b6d4', // Ciano
  '#ec4899', // Rosa
]
```

---

## 🎯 Página de Login

**Localização:** `src/pages/LoginPage.tsx`

**Características:**
- Mesmo tema dark elegante do dashboard
- Card centralizado com glassmorphism
- Tabs para telefone/email
- Validação em tempo real
- Estados de loading elegantes

**Estrutura Visual:**
- Background: Gradiente escuro com efeitos decorativos
- Card: Glassmorphism com backdrop blur
- Inputs: Fundo escuro com bordas sutis
- Botão: Gradiente verde accent
- Erros: Badge vermelho com ícone

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Desktops grandes */
```

### Adaptações

- **Mobile**: Cards em coluna única, menu do usuário simplificado
- **Tablet**: Grid de 2 colunas para métricas
- **Desktop**: Grid de 3 colunas, layout completo

---

## 🎭 Estados Visuais

### Loading

```tsx
<div className="flex flex-col items-center gap-4">
  <div className="relative">
    <div className="absolute inset-0 rounded-full bg-[#c8fa00]/20 blur-xl animate-pulse" />
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/80 border border-gray-700/50">
      <Loader2 className="h-8 w-8 animate-spin text-[#c8fa00]" />
    </div>
  </div>
  <div className="text-center">
    <p className="text-lg font-medium text-white">Carregando...</p>
  </div>
</div>
```

### Erro

```tsx
<div className="flex flex-col items-center gap-3">
  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
    <AlertCircle className="h-6 w-6 text-red-400" />
  </div>
  <p className="text-red-400 font-medium">Erro ao carregar dados</p>
</div>
```

### Vazio

```tsx
<div className="flex flex-col items-center gap-3">
  <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
    <Icon className="h-6 w-6 text-gray-500" />
  </div>
  <p className="text-gray-400">Nenhum dado disponível</p>
</div>
```

---

## 🔤 Tipografia

### Hierarquia

```css
/* Títulos */
h1: text-2xl font-bold text-white
h2: text-xl font-semibold text-white
h3: text-lg font-semibold text-white
h4: text-base font-semibold text-white

/* Textos */
body: text-sm text-gray-300
small: text-xs text-gray-400
muted: text-xs text-gray-500

/* Destaques */
accent: text-[#c8fa00]
success: text-emerald-400
error: text-red-400
warning: text-amber-400
```

---

## 🎨 Ícones

### Biblioteca

- **Lucide React** - Ícones modernos e consistentes

### Uso

```tsx
// Ícones em containers
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8fa00]/10">
  <Icon className="h-4 w-4 text-[#c8fa00]" />
</div>

// Ícones inline
<Icon className="h-4 w-4 text-gray-400" />
```

---

## 📏 Espaçamento

### Sistema de Espaçamento

```css
/* Padding */
p-2: 0.5rem (8px)
p-4: 1rem (16px)
p-6: 1.5rem (24px)
p-8: 2rem (32px)

/* Gap */
gap-2: 0.5rem
gap-4: 1rem
gap-6: 1.5rem

/* Margin */
mt-2, mb-2, etc.
```

---

## 🎯 Boas Práticas

### Consistência

1. **Sempre use** `backdrop-blur-xl` para glassmorphism
2. **Sempre use** `border-gray-700/50` para bordas sutis
3. **Sempre use** `bg-gray-800/80` para backgrounds de cards
4. **Sempre use** `text-white` para títulos principais
5. **Sempre use** `text-gray-400` para textos secundários

### Acessibilidade

1. **Contraste**: Todos os textos têm contraste adequado (WCAG AA)
2. **Focus**: Estados de focus visíveis em todos os elementos interativos
3. **Aria labels**: Todos os botões e ícones têm labels descritivos

### Performance

1. **Transições**: Use `transition-all duration-300` para animações suaves
2. **Backdrop blur**: Use com moderação (pode impactar performance)
3. **Gradientes**: Use `fixed` para backgrounds decorativos (não re-renderizam)

---

## 📚 Referências

- **TailwindCSS**: https://tailwindcss.com
- **Radix UI**: https://www.radix-ui.com
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org

---

**Última atualização:** Janeiro 2025

