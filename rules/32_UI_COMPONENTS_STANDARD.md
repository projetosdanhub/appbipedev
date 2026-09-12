# BipeSend UI Components & Variables Standard

## 1. Visão Geral
Este documento define as regras para criação futura de componentes na camada `@bipesend/ui` (`packages/ui`) e variáveis de design padrão. Ele garante que qualquer novo elemento visual no projeto mantenha consistência arquitetural, visual e de comportamento em todas as aplicações (tenant-web, superadmin-web).

## 2. Variáveis Globais de UI (Tailwind)
Todo novo componente deve utilizar as variáveis de CSS globais, baseadas em `tailwindcss`. Valores absolutos (`#FF0000`, `14px`) devem ser evitados em prol de tokens do sistema.

### 2.1. Tipografia e Fontes
- **Headings (Títulos)**: `font-inter` com tracking-tight.
- **Corpo (Body/Textos)**: `font-poppins`.
- **Tamanhos Padrão**:
  - Títulos principais de página: `text-[27px] md:text-[32px] leading-[33px] md:leading-[38px]`
  - Subtítulos descritivos: `text-[15px] md:text-[16px]`
  - Inputs e Labels: `text-[14px]` (Mobile e Web)
  - Mensagens de Erro/Apoio: `text-[13px]`

### 2.2. Cores Padrão
- Primária (Ações principais): `text-[#007BFF]`, `bg-[#007BFF]`.
- Gradientes Principais: `bg-gradient-to-r from-[#007BFF] to-[#6366F1]`.
- Superfícies (Fundo de cards): `bg-white`, Surface-light: `bg-slate-50`.
- Bordas e divisores: `border-slate-200`.
- Texto Principal (Dark): `text-[#0F172A]`.
- Texto Secundário (Muted): `text-slate-500`.
- Alertas e Erros: `text-[var(--color-danger-600)]` (`#E11D48` ou similar, centralizado no tailwind).

## 3. Padrão Arquitetural do `packages/ui`
Qualquer componente visual reutilizável (Botões, Inputs, Modais, Cards) DEVE residir em `packages/ui/src/components`.

### 3.1. Regras para Novos Componentes
1. **DRY (Don't Repeat Yourself)**: Antes de criar um componente no app (ex: `apps/tenant-web/src/components`), avalie se ele pode ser genérico o suficiente para ir ao `packages/ui`.
2. **"use client" Consciente**: Marque o componente como `"use client"` apenas se ele depender de interatividade (useState, eventos) ou animação no lado do cliente. Se for apenas um layout estático (ex: Icon wrapper), deixe como server component por padrão, permitindo que o consumidor decida.
3. **Propriedades (Props)**: Todo componente deve aceitar `className` (via `twMerge`/`clsx`) para permitir extensões locais de estilo sem quebrar a estrutura.
4. **Variantes (CVA)**: Para componentes com múltiplos estados visuais (ex: Button, Badge), utilize `class-variance-authority` (cva).

## 4. Comportamento e Validação
1. **Labels de Input**: SEMPRE alinhados acima do campo (Top-aligned), nunca flutuantes (Floating), para melhorar clareza em formulários longos.
2. **Feedback Visual Imediato**:
   - Estados de Hover, Focus e Active são obrigatórios para inputs e botões. (ex: `focus-visible:ring-2 focus-visible:ring-[#007BFF]`).
   - Loading States devem inabilitar o elemento interativo (ex: `disabled={isLoading}`).
3. **Erros de Validação**:
   - Em formulários, não exiba erros embaixo de *cada* campo individualmente, poluindo a UI.
   - Utilize um bloco global/central de alerta acima ou abaixo do título do formulário exibindo as mensagens de erro temporárias (com `setTimeout` em milissegundos).

## 5. Animações e Microinterações
- Utilize prefixos como `animate-fade-in`, `animate-slide-up` para transições de entrada em modais, toasts e alertas de erro.
- Animações de loading ("spinners") devem ser sutis.
- Animações de sucesso (checkmarks) devem preencher o tempo de transição (ex: 2000-3000 milissegundos) antes do redirecionamento.

## 6. Padrões Premium (Auth e Globais)
A partir da versão premium da UI, o pacote `@bipesend/ui` conta com componentes globais focados em estética refinada:
1. **AuthLayout**: Layout bi-partido com `Form` no lado esquerdo (branco, com cantos arredondados do lado direito `rounded-r-[2.5rem]`) e área de `Branding` no lado direito, contendo imagem de fundo em full-bleed com overlay opcional.
2. **GlassPill**: Elementos de destaque visual usando "Glassmorphism" com classes como `backdrop-blur-md bg-white/10 border border-white/20`, utilizados para indicar funcionalidades chave da plataforma.
3. **Scrollbar Interativa**: O scroll interno dos componentes e painéis de autenticação utiliza o `.custom-scrollbar`. É mandatório que o hover e active alterem as cores da barra com um fundo de `background-attachment: fixed` para revelar uma transição viva e orgânica do gradiente da marca.
