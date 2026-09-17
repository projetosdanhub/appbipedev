# Pacotes da fundação BipeSend

Consulte primeiro este mapa e o README do pacote. Versão de contrato: fundação v1, revisão 2026-09-13. A auditoria e o taskboard distinguem código implementado, contratos e capacidades futuras.

| Pacote | Responsabilidade | Ambiente | Dependências internas |
| --- | --- | --- | --- |
| contracts | DTOs Zod, IDs, papéis, eventos, erros e estados | cliente/servidor | nenhuma |
| config | validação de configuração/origens e budgets | servidor; exports públicos cuidadosamente selecionados | nenhuma |
| security | CSPRNG, HMAC, AEAD, redaction e rate limit | Node servidor | nenhuma |
| auth | policies portáveis; Auth.js e recovery no servidor Next | servidor | contracts, security, db |
| db | Prisma e transação com contexto RLS | servidor | contracts |
| events | envelope, adapter outbox, idempotência e backoff | Node servidor | contracts |
| logger | logs estruturados com projeção allowlist; sem payload/stack brutos | servidor | nenhuma |
| ui | tokens, componentes acessíveis e marca do SaaS; reforma global adiada | React DOM; server/client conforme componente | nenhuma |
| web-builder-core | comandos, histórico e herança responsiva | puro cliente/servidor | contracts |
| web-renderer | HTML/CSS validados; prévia sem scripts | puro cliente/servidor | contracts |
| web-builder-ui | componentes próprios do construtor | React DOM cliente | ui (somente tokens CSS) |
| web-builder | composição do editor e galeria local | React DOM cliente | contracts, core, renderer, builder-ui |

`ui` não importa auth/db/security. Fastify importa `auth/policies`, sem trazer Next/Auth.js. Features compõem pacotes e regras de negócio; um pacote não deve importar um app. React Native futuro reutiliza contratos e conceitos, sem importar o pacote DOM.

## Fluxo de desenvolvimento

1. `pnpm install --frozen-lockfile` na raiz; gerar Prisma com `pnpm --filter @bipesend/db generate`.
2. `pnpm foundation:build` antes de rodar os apps: packages compilados exportam `dist`; UI, DB e runtime Auth.js são consumidos como fonte pelo Next.
3. `pnpm foundation:check` verifica contratos, tipos, testes de unidade, regras e taskboard. Build dos apps é gate adicional de entrega.
4. Para UI: `pnpm ui:smoke` inicia preview temporário e verifica a galeria. Chromium precisa estar instalado pelo Playwright.
5. Alterações com banco: seguir `db/README.md`; não executar ambos os migradores ou db push para resolver drift de dados existentes.

## Compatibilidade

Adicionar props/export opcional é evolução compatível; remover/renomear exige migração dos consumidores. Alterações de eventos/DTOs com quebra criam versão explícita. Enum de integração tem uma definição em contracts. Tokens têm uma implementação CSS; as regras descrevem intenção, sem tabela duplicada.

A biblioteca não promete todos os componentes possíveis: calendário avançado, gráficos, editor rich text, virtualização e uploader durável entram por necessidade comprovada, com teclado, performance e segurança no card correspondente.

## BipeWPRO — primeira fatia implementada

Plano canônico: [docs/plans/bipewpro.md](../docs/plans/bipewpro.md). UI própria: [web-builder-ui/README.md](web-builder-ui/README.md) e [guia premium](web-builder-ui/PREMIUM_LAYOUT.md). Por instrução do usuário, `packages/ui` mantém seus componentes/tokens atuais; sua reforma completa fica para outra etapa.

| Caminho implementado | Conteúdo e próximo limite |
| --- | --- |
| contracts/src/web | Documento inicial, estilos, propriedade, intenção de criação e evento platform separado |
| contracts/src/catalog | Configuração inicial Food e formato monetário; sem cálculo comercial |
| contracts/src/entitlements | Chaves, limites e projeção de concessões; enforcement pendente em BILL-001 |
| web-builder-core | Comandos imutáveis, histórico e herança; migrações/registro extensível em PAGE-001 |
| web-renderer | Quatro blocos com HTML/CSS validados; runtime público/domínios em cards posteriores |
| web-builder-ui | Shell, controles, dispositivos, preview, navegação e sheet mobile; WPRO-004 continua |
| web-builder | Consumidor real com galeria de edição local; sem ativação tenant/superadmin |

Rodar `pnpm bipewpro:dev`, `pnpm bipewpro:check` e `pnpm bipewpro:smoke`. Imports/graph são verificados por AST; builds de apps e banco são gates próprios. Novas dependências reutilizam versões já presentes no lockfile, sem atualizar resoluções das aplicações existentes.

Features ficam nos apps; domínio em 10-catalog, 11-pages e 12-billing. BILL-001 é a única fundação de entitlement/cota. Eventos usam MSG-001/002, sem segundo outbox. A organização é aditiva: contratos antigos, schema/policies e trabalho CRM do Gemini não são reorganizados nesta fatia.
