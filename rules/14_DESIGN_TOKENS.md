# Design tokens — BipeSend

## 1. Regra

Tokens semânticos são a única fonte para cor, espaçamento, radius, sombra, tipografia, z-index e motion. Não usar hex, pixel ou duração solta em componentes de produto salvo exceção documentada.

## 2. Tipografia

Família UI: `Inter`, fallback `ui-sans-serif, system-ui, sans-serif`.

| Papel | Tamanho | Linha | Peso |
|---|---:|---:|---:|
| display | 36 px | 44 px | 700 |
| page-title | 28 px | 36 px | 700 |
| section-title | 20 px | 28 px | 650 |
| card-title | 16 px | 24 px | 600 |
| body | 14 px | 20 px | 400 |
| body-strong | 14 px | 20 px | 600 |
| public-body | 16 px | 24 px | 400 |
| label | 13 px | 18 px | 600 |
| caption | 12 px | 16 px | 500 |
| button | 14 px | 20 px | 600 |

Não usar texto essencial abaixo de 12 px.

## 3. Paleta base

### Marca

| Token | Valor | Uso |
|---|---|---|
| `brand.50` | `#F5F6FF` | fundo sutil |
| `brand.100` | `#ECEEFF` | selected sutil |
| `brand.200` | `#D9DEFF` | borda brand |
| `brand.300` | `#B8C2FF` | detalhe |
| `brand.400` | `#8F9EFF` | detalhe |
| `brand.500` | `#6674F4` | brand intermediária |
| `brand.600` | `#4F46E5` | primária |
| `brand.700` | `#4338CA` | hover |
| `brand.800` | `#3730A3` | pressed |
| `brand.900` | `#312E81` | texto em fundo claro especial |

### Acento violeta

- `accent.500`: `#8B5CF6`
- `accent.600`: `#7C3AED`
- `accent.700`: `#6D28D9`

Gradiente de marca permitido em áreas institucionais:
`linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`.

### Neutros

- `ink.950`: `#0F172A`
- `ink.800`: `#1E293B`
- `ink.700`: `#334155`
- `ink.600`: `#475569`
- `ink.500`: `#64748B`
- `surface.0`: `#FFFFFF`
- `surface.50`: `#F8FAFC`
- `surface.100`: `#F1F5F9`
- `border.200`: `#E2E8F0`
- `border.300`: `#CBD5E1`

### Semânticos

- `success.50`: `#ECFDF5`
- `success.600`: `#047857`
- `warning.50`: `#FFFBEB`
- `warning.700`: `#B45309`
- `danger.50`: `#FEF2F2`
- `danger.700`: `#B91C1C`
- `info.50`: `#F0F9FF`
- `info.700`: `#0369A1`

Combinação final deve ser validada por contraste no componente real.

## 4. Tokens semânticos recomendados

- `bg.canvas = surface.50`
- `bg.surface = surface.0`
- `bg.subtle = surface.100`
- `text.primary = ink.950`
- `text.secondary = ink.600`
- `text.muted = ink.500`
- `border.default = border.200`
- `action.primary = brand.600`
- `action.primaryHover = brand.700`
- `focus.ring = brand.500`
- `status.success = success.600`
- `status.warning = warning.700`
- `status.danger = danger.700`

## 5. Espaçamento

Base 4 px:

`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.

Padrões:
- gap compacto: 8;
- gap formulário: 16;
- gap seção: 24 ou 32;
- padding card: 20/24;
- padding página desktop: 24/32;
- mobile: 16.

## 6. Radius

- `radius.sm = 8px`
- `radius.md = 10px`
- `radius.lg = 12px`
- `radius.xl = 16px`
- `radius.pill = 999px`

Campos e botões: 10 px. Cards: 12 px. Modal: 16 px. Não criar radius por tela.

## 7. Sombras

- `shadow.xs`: separação mínima;
- `shadow.sm`: dropdown/card elevado;
- `shadow.md`: dialog/drawer.

Sombras devem ser suaves, sem aparência flutuante excessiva.

## 8. Tamanhos de controle

- compacto: 32 px, uso denso e não primário;
- padrão: 40 px;
- confortável/auth: 44–48 px;
- icon button touch: área mínima confortável.

## 9. Motion

| Token | Valor | Uso |
|---|---:|---|
| `motion.instant` | 80 ms | pressed |
| `motion.fast` | 140 ms | hover/focus |
| `motion.base` | 180 ms | fade/estado |
| `motion.panel` | 240 ms | drawer/dialog |
| `motion.auth` | 280 ms | transição de etapa |
| `motion.success` | 320 ms | check discreto |

Easing:
- entrada: `cubic-bezier(0.16, 1, 0.3, 1)`
- saída: `cubic-bezier(0.4, 0, 1, 1)`
- estado: `cubic-bezier(0.2, 0, 0, 1)`

Reduced motion reduz transform e duração para quase instantâneo, preservando feedback.

## 10. Z-index

Faixas, não números aleatórios:
- base 0;
- sticky 100;
- dropdown 200;
- overlay 300;
- dialog 400;
- toast 500;
- critical overlay 600.

## 11. Dark mode

Não é requisito obrigatório do primeiro marco. A arquitetura de tokens deve permitir dark mode futuro sem hardcode em componentes.
