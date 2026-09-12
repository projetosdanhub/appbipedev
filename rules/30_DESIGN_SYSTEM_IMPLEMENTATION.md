# Implementação e governança do Design System BipeSend

## 1. Objetivo

Fazer qualquer nova funcionalidade criada por humano ou IA parecer parte do mesmo produto sem depender de screenshots anteriores.

## 2. Camadas

### Foundations
Cores, tipografia, espaçamento, radius, sombra, motion, breakpoints, iconografia e z-index.

### Primitives
Button, Input, Dialog, Tabs, Tooltip etc. Acessibilidade complexa deve ser abstraída usando `@radix-ui` sempre que possível. Toasts são gerenciados exclusivamente pelo Sonner.

### Composites
FilterBar, DataTable, AuthCard, TenantSwitcher, MetricCard, EmptyState.

### Patterns
Auth flow, CRUD, list/detail, wizard, settings, destructive action, upload, integration connect, billing.

### Screens
Composição de patterns. Tela não redefine foundation.

## 3. Fonte de verdade

- valores: `14_DESIGN_TOKENS.md`;
- UX: `12_UX_UI.md`;
- layout/components: `22_LAYOUT_COMPONENTS.md`;
- motion: `24_INTERACTIONS_MOTION_DATA_REFRESH.md`;
- auth: `29_AUTH_UX_FLOWS.md`.

## 4. Política "do not invent"

Uma feature NÃO cria localmente:
- nova cor;
- novo radius;
- nova shadow;
- novo easing;
- novo botão base;
- novo input base;
- novo modal base;
- novo formato de toast;
- novo padrão de erro;
- novo padrão de status.

Se faltar capacidade, evoluir `packages/ui` e regra correspondente.

## 5. API de tema

Implementação deve expor tokens por CSS variables/tema central. Exemplo conceitual:

```css
:root {
  --bg-canvas: #F8FAFC;
  --bg-surface: #FFFFFF;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --border-default: #E2E8F0;
  --action-primary: #4F46E5;
  --action-primary-hover: #4338CA;
  --focus-ring: #6674F4;

  --radius-control: 10px;
  --radius-card: 12px;
  --radius-dialog: 16px;

  --motion-fast: 140ms;
  --motion-base: 180ms;
  --motion-panel: 240ms;
}
```

Tailwind deve consumir tema/tokens; não espalhar literals em JSX.

## 6. Biblioteca de componentes

Cada componente compartilhado deve ter:
- props claras;
- variantes limitadas;
- estados documentados;
- keyboard behavior;
- ARIA;
- responsive behavior quando aplicável;
- reduced motion;
- teste;
- exemplo de uso.

## 7. Checklist para IA antes de criar uma tela

1. Qual pattern já existe?
2. Quais components de `packages/ui` compõem a tela?
3. Qual ação é primária?
4. Quais estados de dados existem?
5. Quais permissões/entitlements afetam a UI?
6. Como funciona em 360 px?
7. Como funciona por teclado?
8. Que motion é necessário?
9. O que ocorre em erro/retry?
10. Há PII/segredo no frontend/log?
11. É necessário criar token/componente novo? Se sim, justificar.

## 8. Checklist visual de PR

- nenhum hex literal novo fora do tema;
- nenhum `style={{ ... }}` para contornar design system sem justificativa;
- espaçamento em escala;
- CTA primária única;
- tipografia em papel canônico;
- ícones consistentes;
- loading não desloca layout;
- empty/error definidos;
- foco visível;
- mobile testado;
- contraste validado;
- motion respeita reduced motion.

## 9. Breakpoints

Usar abordagem mobile-first. Breakpoints podem seguir infraestrutura do projeto, mas comportamento esperado é:
- mobile: 360–767;
- tablet: 768–1023;
- desktop: 1024+;
- wide: otimização opcional acima de 1440.

Não codificar experiência somente para 1920 px.

## 10. Densidade

Painel operacional usa 14 px body e controles padrão. Auth/marketing usam corpo 16 px e controles confortáveis. Data-heavy pode usar densidade compacta de modo explícito, sem comprometer touch/a11y.

## 11. Marca

Brand gradient é assinatura em auth/marketing, não cor de fundo permanente do app. O app autenticado privilegia superfície neutra e usa brand em ação, seleção, foco e destaques.

## 12. Motion budget

Se uma tela possui mais de uma animação chamando atenção simultaneamente, reduzir. Motion concorrente em dashboard, tabela e toast deve ser mínimo.

## 13. Copy

CTA descreve ação. Mensagens de erro dizem o que aconteceu em linguagem segura e o que a pessoa pode fazer. Evitar "Oops!", humor em falhas críticas e linguagem culpabilizante.

## 14. Mudanças globais

Alterar token/componente base exige:
- motivo;
- exemplos afetados;
- migração;
- teste visual;
- validação de contraste;
- revisão de auth, dashboard e componentes densos.

## 15. Critério final

Uma tela aprovada deve:
- funcionar antes de encantar;
- encantar sem distrair;
- parecer BipeSend sem depender de instrução adicional;
- ser segura e acessível;
- sobreviver a conteúdo real, erro, loading e mobile.
