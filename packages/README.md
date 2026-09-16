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
| logger | logs estruturados; redaction atual tem limites documentados no README | servidor | nenhuma |
| ui | tokens, componentes acessíveis e marca | React DOM; server/client conforme componente | nenhuma |

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

## Evolução BipeWPRO - planejamento 2026-09-15

Plano canônico: [docs/plans/bipewpro.md](../docs/plans/bipewpro.md). Guia visual: [ui/PREMIUM_LAYOUT.md](ui/PREMIUM_LAYOUT.md). As pastas abaixo são destinos de implementação; não foram criadas como pacotes vazios nem estão disponíveis como exports.

| Destino planejado | Limite de responsabilidade |
| --- | --- |
| contracts/src/web, catalog e entitlements | Schemas versionados; manter exports atuais enquanto migra consumidores |
| web-builder-core | Árvore, comandos, herança e migrações, sem React/I/O |
| web-renderer | HTML/CSS semânticos e ilhas interativas; entrada server separada |
| web-builder | Editor compartilhado tenant/superadmin; depende de core/renderer/ui |
| security | Sanitização server-side de rich text/HTML/CSS/SVG e URLs |
| ui | Controles genéricos de layout/estilo; sem regra de site, Food ou plano |

Features de integração ficam nos apps; domínio em módulos 10-catalog, 11-pages e 12-billing. BILL-001 é a única fundação de entitlement e cota; o módulo de planos futuro reutiliza esses contratos. Eventos usam a infraestrutura de MSG-001/002, sem segundo outbox do editor.

Extrair código gradualmente com consumidores e testes reais. Não reorganizar o index de contratos, schema Prisma, policies ou tokens em massa enquanto a frente do CRM está ativa. Preservar APIs públicas, evitar imports circulares e impedir que o site publicado carregue o editor. WPRO-002 coordena as mudanças aditivas e atualiza os verificadores de fronteira.
