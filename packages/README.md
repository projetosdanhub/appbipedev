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
