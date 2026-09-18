# Acessibilidade e SEO

## 1. Alvo

WCAG 2.2 AA em superfícies de produto e páginas públicas.

## 2. Teclado e foco

- toda ação operável por teclado;
- ordem de tab previsível;
- `focus-visible` claro;
- dialogs prendem foco e restauram ao fechar;
- drawer idem;
- skip link em layouts extensos;
- não remover outline sem substituto equivalente.

## 3. Formulários

Labels associados, descrição/erro via `aria-describedby`, `aria-invalid` quando inválido, erro não depende de cor, OTP possui nome acessível e alternativa de colagem.

## 4. Motion

Respeitar `prefers-reduced-motion`: reduzir/remover animações não essenciais. Nunca depender de animação para indicar sucesso/erro.

## 5. Contraste

Texto normal >= 4.5:1. Texto grande e gráficos essenciais >= 3:1. Estados hover/focus/disabled também são validados.

## 6. Realtime

Atualizações de inbox, upload e feedback podem usar live region `polite`; erros urgentes podem usar `assertive` com moderação. Não anunciar cada atualização ruidosa.

## 7. Touch

Alvos interativos preferencialmente 44×44 px; mínimo técnico nunca deve tornar uso difícil. Espaçamento evita cliques acidentais.

## 8. Zoom e reflow

Interface deve continuar funcional em zoom 200% e reflow sem perda de conteúdo essencial.

## 9. SEO

Marketing e páginas públicas: title, description, canonical, robots, sitemap, Open Graph, headings semânticos, structured data quando aplicável e Core Web Vitals.

Painéis autenticados: `noindex`, sem vazamento de conteúdo em HTML público/cache compartilhado.

## 10. Tracking

Scripts e pixels dependem de política e consentimento. Nunca permitir JavaScript arbitrário de tenant dentro do painel.

## Revisão de fundação — 2026-09-13

Novo workspace: tema claro único, teclado, foco não encoberto, erros associados e reflow 320 px. WCAG 2.2 AA é meta, não certificação por axe. Painel/login/reset/catalogo de componentes são noindex; SEO público pertence ao marketing/catalogo publicado. Core Web Vitals de campo não são inferidos de um build ou Lighthouse local.
