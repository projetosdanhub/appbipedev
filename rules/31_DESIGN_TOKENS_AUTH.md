# 31. Design Tokens & Auth Layout (BipeSend)

Este documento define os padrões visuais rigorosos e responsivos para fluxos de autenticação, seguindo o redesign premium solicitado. Estes tokens devem ser respeitados ao criar novas telas e componentes associados.

## 1. Tipografia (Inter & Poppins)
- **Fonte Principal (Headings):** Inter
- **Fonte Base (Textos, Labels, Componentes):** Poppins

### Tamanhos
- **Desktop H1:** `32px` a `34px` / Line-Height: `38px` a `42px` / Font-Weight: `700`
- **Mobile H1:** `27px` a `29px` / Line-Height: `33px` a `35px` / Font-Weight: `700`
- **Subtítulo Desktop:** `16px` / Line-Height: `24px` / Font-Weight: `400`
- **Subtítulo Mobile:** `15px` a `16px` / Line-Height: `22px` a `24px` / Font-Weight: `400`
- **Labels de Input:** `14px` / Line-Height: `20px` / Font-Weight: `500`
- **Texto de Input:** `16px` / Font-Weight: `400`
- **Botões:** `16px` / Font-Weight: `600`
- **Helper Texts / Errors:** `13px` a `14px` / Line-Height: `18px` a `20px`

## 2. Cores & Estilos
- **Fundo Mobile:** `#FFFFFF` (branco puro, sem imagens, sem glassmorphism).
- **Primary CTA:** Fundo em gradiente `bg-gradient-to-r from-[#007BFF] to-[#6366F1]`, sem borda.
- **Secondary CTA (Google, Voltar):** Fundo branco, borda neutra clara, cor de texto `#0F172A`.
- **Inputs:** Fundo `#FFFFFF`, borda cinza neutro (ex: `border-slate-200`).
- **Links:** Azul da marca (`text-[#007BFF]`), hover opcional sutil (`hover:text-[#6366F1]`).

## 3. Espaçamentos (Rhythm)
- **Título para Subtítulo:** `8px` a `10px` (`space-y-2` ou `space-y-2.5`)
- **Subtítulo para Formulário:** `24px` a `28px` (`mb-6` ou `mb-7`)
- **Label para Input:** `7px` a `8px` (margem inferior no label)
- **Entre campos (Group Gap):** `14px` a `16px` mobile, `16px` a `18px` desktop (`space-y-4`)
- **Formulário para CTA Primário:** `20px` a `24px` (`pt-5` ou `pt-6`)
- **Gap do Divisor Social:** `18px` a `20px` (`py-4` ou `py-5`)
- **Horizontal Padding Mobile:** `20px` (telas 320-374px), `24px` (telas >= 375px)
- **Horizontal Padding Desktop:** `48px` a `72px` no contêiner do formulário.

## 4. Estrutura e Componentes
- **Inputs:**
  - Altura: `52px` (mobile), `54px`-`56px` (desktop).
  - Border-Radius: `12px` (`rounded-xl`).
  - Label: **Sempre visível acima do input**, não usar placeholder flutuante (floating label).
  - Validação: Erros devem aparecer logo abaixo do input, com fade-in, não afetando agressivamente o layout (layout shift mínimo).
- **Botões:**
  - Altura e Border-Radius equivalem ao input (`52px`/`54px`, `rounded-xl`).
  - Evitar formato exageradamente redondo ("pill") para elementos principais, preferir `rounded-xl` (`12px`).
- **Cards/Containers:**
  - Mobile: Layout de tela inteira (`min-h-[100dvh]`), sem bordas externas, sem sombras externas, scroll liberado se o teclado subir.
  - Desktop: Área de 440px a 500px, fundo `#FFFFFF` sólido, sombra sutil, sem glassmorphism sobrepondo a forma final da caixa do form.

## 5. Animações e Motion
- **Page Entry:** 180-220ms, opacity 0 -> 1, translateY 6px -> 0.
- **Button Hover:** Pequena mudança de luminosidade ou `scale-[1.01]`.
- **Button Active:** `scale-[0.99]`.
- **Focus:** 140-180ms de outline sutil (ex: `ring-2 ring-blue-500/20`), sem scale no input.

## 6. Layouts Base
- **Tenant Web Desktop:** Split layout (Lado esquerdo imagem+branding, Lado direito painel 100% branco com auth).
- **Superadmin Desktop:** Painel branco sólido centralizado (remover o glassmorphism caso exista).
- **Ambos Mobile:** Tela 100% branca, sem imagens de fundo, uso eficiente do espaço para evitar rolagem horizontal.
