# Evidências de validação — fundação

Auditoria iniciada em 2026-09-13; validação final em 2026-09-14. Base: fd3f4c3. Branch: feat/saas-foundation-design-system. A auditoria distingue unidade, navegador, build e integração.

## Resultado final local — 2026-09-14

| Verificação | Resultado | Escopo |
| --- | --- | --- |
| pnpm foundation:check | PASS | 63 testes, tipos de 5 consumidores, lint UI/API e checks estruturais |
| Pacotes contracts/config/security/auth-policies/events | 12/12 | forma, autorização, criptografia, rate limit e adapter de evento |
| UI | 19/19 | inputs, loading, IDs/erros, OTP, senha, foco/modal, tabs e debounce |
| Tenant-web | 27/27 | validação, actions, recovery com rollback simulado e callbacks de superfície/revisão |
| API unit | 5/5 | chave exata, webhook inválido, tenant selector, transação ligada e endpoints legados fechados |
| pnpm ui:smoke | 33 verificações, zero falhas | Chromium; relatório detalhado abaixo |
| Build tenant-web | PASS | Next produção, inclusive guard e catálogo indisponível em produção por código |
| Build superadmin-web | PASS | Next produção, root protegido e handler Auth.js próprio |
| Build API | PASS | TypeScript Node |
| Rules/taskboard | PASS | 36 regras e 85 cards; sem ciclo, ID duplicado ou evidência ausente |
| Fronteiras, marca, segurança estática e diff | PASS | imports, assets sincronizados, padrões de segredo e git diff --check |
| API integração PostgreSQL | NÃO VALIDADO | três testes falharam por ECONNREFUSED no ambiente sem banco |

ESLint da API terminou sem erro, com **5 avisos de any** em adapters/entradas legadas. Eles permanecem como débito explícito; não foi usado echo como lint. O gate não afirma que todo o legado de telas passou em lint estrito. A fundação nova do tenant também foi verificada por ESLint direcionado.

Navegador: 24 combinações (4 larguras × 2 temas × 3 abas do catálogo), mais teclado/foco de modal, combobox, busca/seleção, menu mobile, reduced motion efetivamente aplicado ao spinner, três páginas auth e rejeição de cookie forjado. As páginas avaliadas não apresentaram overflow horizontal nem violações axe nos tags WCAG selecionados. O contraste inicialmente insuficiente no rodapé de recovery foi corrigido e a execução final passou.

- [Relatório do navegador](evidence/ui-report.json)
- [Resumo dos gates](evidence/checks.json)
- [Catálogo claro desktop](evidence/catalogue-1440-light.png)
- [Catálogo escuro desktop](evidence/catalogue-1440-dark.png)

As capturas são recortes de viewport de uma área com rolagem própria e dados sintéticos. Não são E2E de módulos de negócio. Antes desta implementação, a baseline tinha 13 testes UI e 19 tenant; os números finais acima correspondem à versão desta branch.

## Limites obrigatórios

Sem PostgreSQL, Redis e SMTP conectados: não foi possível executar migração, RLS real, concorrência SQL, entrega de e-mail, sessão distribuída ou E2E de identidade. Nenhuma migration, seed, bootstrap ou deploy foi executado. CI remoto exige confirmação após publicação; a API do GitHub confirmou main com protected=false em 2026-09-14. A configuração da proteção permanece em FND-004.

Navegador local usa Chromium 153.0.8010.0 por executável fornecido ao runner, pois o download padrão do Playwright retornou 502. O runner versionado usa Playwright normal por padrão; override `PLAYWRIGHT_CHROMIUM_EXECUTABLE` serve somente à execução local. Não altera dependência de produção.

Axe não certifica WCAG; falta revisão manual com leitores de tela, zoom/teclado virtual e fluxo com backend. Core Web Vitals de campo, conversão, carga e pentest não foram medidos. Fonte/build usa as versões do lockfile; ambiente local Node 24.19.0/pnpm 11.19.0, enquanto o projeto declara pnpm 12.4.1. CI usa a versão declarada.

## Reproduzir

`pnpm foundation:check` → unidade/tipos/lint UI/API/regras/taskboard/fronteiras/padrões de segredo/marca. O lint de telas legadas do tenant não foi convertido em gate artificialmente verde; a fundação nova tem verificação própria e o débito fica registrado no audit.

`pnpm --filter @bipesend/tenant-web build`, `pnpm --filter @bipesend/superadmin-web build`, `pnpm --filter @bipesend/api build`.

`pnpm --dir apps/e2e-tests exec playwright install chromium` e `pnpm ui:smoke`. O runner inicia servidor de desenvolvimento temporário e grava `test-results/foundation` (ignorado pelo git). Fechar outro next dev da mesma pasta antes para evitar lock.

`pnpm --filter @bipesend/api test:integration` após provisionamento/reconciliação, usando role runtime sem bypass e banco descartável autorizado. Não executar em produção.
