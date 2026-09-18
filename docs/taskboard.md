# Taskboard BipeSend — executável

Versão 1.0.0 · Revisão 2026-09-16 · Base auditada `46832fc`

**Fonte:** docs/taskboard.json. Não editar este Markdown diretamente; rode `pnpm taskboard:render` e `pnpm taskboard:check`.

Total: 76 cards. BACKLOG: 22 · READY: 1 · IN_PROGRESS: 2 · BLOCKED: 0 · DONE: 51.

DONE exige aceite integral, evidência e dependências concluídas. Código parcial não comprova integração. Áreas de código são alvos de trabalho, podendo incluir pastas a criar. “Testes” são instruções de execução; resultados realmente observados ficam nas evidências.

## Próximo ciclo

1. BILL-001: Entitlements e contadores.
- Em andamento: FND-002: Definir nome de trabalho e dominios candidatos.
- Em andamento: MSG-004: QR e conexao.

Não ativar CRM, mensageria, IA ou billing reais antes do gate AUTH-016; protótipos visuais podem ser revisados, identificados como exemplos.
BipeWPRO: plano em docs/plans/bipewpro.md e handoff em docs/plans/bipewpro-handoff.md. A fundação BILL-001 antecede os CRUDs com cota; planos futuros reutilizam sua estrutura. Respeitar a frente paralela do CRM e os gates de publicação/segurança.

## Índice

| ID | Estado | Tarefa | Dependências |
| --- | --- | --- | --- |
| [FND-001](#fnd-001) | DONE | Criar regras e convencoes | — |
| [FND-002](#fnd-002) | IN_PROGRESS | Definir nome de trabalho e dominios candidatos | — |
| [FND-003](#fnd-003) | DONE | Definir stack e monorepo inicial | — |
| [FND-004](#fnd-004) | DONE | Criar repositorio Git e branch protection | FND-003 |
| [FND-005](#fnd-005) | DONE | Definir threat model inicial | FND-001 |
| [FND-006](#fnd-006) | DONE | Criar matriz de permissoes v1 | FND-005 |
| [FND-007](#fnd-007) | DONE | Criar mapa modular e regras anti-monolito | FND-003 |
| [FND-008](#fnd-008) | DONE | Gerar skeleton de modulos sem codigo de negocio | FND-007 |
| [FND-009](#fnd-009) | DONE | Consolidar contrato visual, motion e atualizacao de dados | FND-001, FND-007 |
| [FND-010](#fnd-010) | DONE | Auditar fundacao e transformar taskboard em guia executavel | FND-009 |
| [INF-001](#inf-001) | DONE | Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO | FND-003 |
| [INF-002](#inf-002) | DONE | Validar config por schema | INF-001 |
| [INF-003](#inf-003) | DONE | Criar health/readiness endpoints | INF-001 |
| [INF-004](#inf-004) | DONE | Criar logger estruturado e request id | INF-003 |
| [INF-005](#inf-005) | DONE | Criar pipeline CI inicial | FND-004 |
| [INF-006](#inf-006) | DONE | Configurar proxy HTTPS local e contrato de forwarded headers | INF-003 |
| [INF-007](#inf-007) | DONE | Bloquear exposicao de arquivos e portas internas | INF-001, INF-006 |
| [INF-008](#inf-008) | DONE | Sanear readiness e mover health para modulo shared | INF-003, FND-008 |
| [AUTH-001](#auth-001) | DONE | Modelar users, tenants, memberships e sessions | INF-001, FND-006 |
| [AUTH-002](#auth-002) | DONE | Implementar registro de conta | AUTH-001 |
| [AUTH-003](#auth-003) | DONE | Implementar verificacao de e-mail | AUTH-002 |
| [AUTH-004](#auth-004) | DONE | Implementar login/logout | AUTH-001 |
| [AUTH-005](#auth-005) | DONE | Implementar recuperacao de senha | AUTH-004 |
| [AUTH-006](#auth-006) | DONE | Criar onboarding do tenant_admin | AUTH-003 |
| [AUTH-007](#auth-007) | DONE | Criar convite de membro | AUTH-006 |
| [AUTH-008](#auth-008) | DONE | Implementar RBAC/ABAC v1 | AUTH-001, FND-006 |
| [AUTH-009](#auth-009) | DONE | Criar shell do painel tenant | AUTH-004 |
| [AUTH-010](#auth-010) | DONE | Criar tela de login visual | AUTH-004, AUTH-009 |
| [AUTH-011](#auth-011) | DONE | Testar fluxos E2E | AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, AUTH-007, AUTH-008, AUTH-009, AUTH-010 |
| [AUTH-012](#auth-012) | DONE | Revisao de seguranca do primeiro marco | AUTH-011 |
| [AUTH-013](#auth-013) | DONE | Bootstrap seguro do platform_owner via CLI no VPS | AUTH-001, INF-002 |
| [AUTH-014](#auth-014) | DONE | Login separado do superadmin e do tenant | AUTH-004, AUTH-008 |
| [AUTH-015](#auth-015) | DONE | Proteger API, webhooks e servicos internos | AUTH-004, FND-006 |
| [AUTH-016](#auth-016) | DONE | E2E das superficies de acesso | AUTH-013, AUTH-014, AUTH-015 |
| [TEAM-001](#team-001) | DONE | CRUD de setores | AUTH-008, AUTH-016 |
| [TEAM-002](#team-002) | DONE | CRUD de cargos customizados | AUTH-008, AUTH-016 |
| [TEAM-003](#team-003) | DONE | Gestao de membros | TEAM-002, AUTH-016 |
| [TEAM-004](#team-004) | DONE | Auditoria pesquisavel | AUTH-004, AUTH-016 |
| [TEAM-005](#team-005) | DONE | Contrato de erros e reporte pelo painel tenant | INF-004, AUTH-004, AUTH-016 |
| [TEAM-006](#team-006) | DONE | Dicionario e triagem de erros no superpainel | TEAM-005, AUTH-008, AUTH-016 |
| [CRM-001](#crm-001) | DONE | Contatos e campos customizados | TEAM-001, AUTH-016 |
| [CRM-002](#crm-002) | DONE | Tags e segmentos | CRM-001, AUTH-016 |
| [CRM-003](#crm-003) | DONE | Pipelines configuraveis | CRM-001, AUTH-016 |
| [CRM-004](#crm-004) | DONE | Cards/lista/inbox views | CRM-003, AUTH-016, CRM-005 |
| [CRM-005](#crm-005) | DONE | Conversas e mensagens internas | CRM-001, AUTH-016 |
| [CRM-006](#crm-006) | DONE | Atribuicao a setor/cargo/membro | TEAM-001, AUTH-016, CRM-001, CRM-003, CRM-005, TEAM-002, TEAM-003, CRM-007 |
| [CRM-007](#crm-007) | DONE | WebSocket rooms | CRM-005, AUTH-016, MSG-001, MSG-002 |
| [MSG-001](#msg-001) | DONE | Outbox e eventos | INF-004, CRM-005, AUTH-016 |
| [MSG-002](#msg-002) | DONE | BullMQ e dead-letter | MSG-001, AUTH-016 |
| [MSG-003](#msg-003) | DONE | Adapter de provider | MSG-001, AUTH-016 |
| [MSG-004](#msg-004) | IN_PROGRESS | QR e conexao | MSG-003, AUTH-016 |
| [MSG-005](#msg-005) | BACKLOG | Webhook normalizado | MSG-003, AUTH-016 |
| [AUTO-001](#auto-001) | BACKLOG | Gatilhos e condicoes | CRM-003, MSG-001, AUTH-016 |
| [AUTO-002](#auto-002) | BACKLOG | Acoes e agendamento | MSG-002, AUTH-016 |
| [AUTO-003](#auto-003) | BACKLOG | Campanhas com opt-out | MSG-004, AUTH-016 |
| [AI-001](#ai-001) | BACKLOG | Upload em quarentena | INF-001, TEAM-003, AUTH-016 |
| [AI-002](#ai-002) | BACKLOG | Pipeline de extracao/chunks | AI-001, AUTH-016 |
| [AI-003](#ai-003) | BACKLOG | Embeddings + pgvector | AI-002, AUTH-016 |
| [AI-004](#ai-004) | BACKLOG | Provider adapter de LLM | AI-003, AUTH-016 |
| [AI-005](#ai-005) | BACKLOG | Copiloto read-only | AI-004, CRM-005, AUTH-016 |
| [AI-006](#ai-006) | BACKLOG | Gateway MCP interno | AI-005, AUTH-016 |
| [AI-007](#ai-007) | BACKLOG | Testes de prompt injection | AI-005, AUTH-016 |
| [BILL-001](#bill-001) | READY | Entitlements e contadores | AUTH-006, AUTH-016 |
| [BILL-002](#bill-002) | BACKLOG | CRUD de planos superadmin | BILL-001, AUTH-016 |
| [BILL-003](#bill-003) | BACKLOG | Stripe Connect sandbox | BILL-002, AUTH-016 |
| [BILL-004](#bill-004) | BACKLOG | Mercado Pago OAuth sandbox | BILL-002, AUTH-016 |
| [BILL-005](#bill-005) | BACKLOG | Upgrade/downgrade | BILL-003, BILL-004, AUTH-016 |
| [OPS-001](#ops-001) | BACKLOG | Backup e restore drill | INF-001 |
| [OPS-002](#ops-002) | BACKLOG | Observabilidade e alertas | INF-004 |
| [OPS-003](#ops-003) | BACKLOG | Pentest e revisao externa | AUTH-016, TEAM-004, OPS-001, OPS-002 |
| [OPS-004](#ops-004) | BACKLOG | Registro e verificacao de saude das integracoes | INF-004 |
| [OPS-005](#ops-005) | BACKLOG | Indicadores de API e integracao no painel | OPS-004, AUTH-009 |
| [MOB-001](#mob-001) | BACKLOG | Especificar app nativo | OPS-003 |
| [MOB-002](#mob-002) | BACKLOG | Implementar mobile | MOB-001 |
| [TEAM-007](#team-007) | DONE | Godmode e Impersonation (Superadmin e Contratante) | TEAM-002 |
| [CRM-010](#crm-010) | DONE | Implement Visual Automations (IMPLEMENTATION) | — |

## Execução dos cards

<a id="fnd-001"></a>
### FND-001 — Criar regras e convencoes

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Criar regras e convencoes. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** Nenhuma.

**Passos:**

1. Auditar as 34 regras originais e registrar divergências por arquivo.
2. Unificar tokens, estados, leitura de agentes e critérios de evidência; validar índice ativo.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- pasta `rules/` versionada e lida pelo bootstrap
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/rules-review.md](../docs/audit/rules-review.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-002"></a>
### FND-002 — Definir nome de trabalho e dominios candidatos

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Definir nome de trabalho e dominios candidatos. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** Nenhuma.

**Passos:**

1. Manter BipeSend como nome de trabalho e origens por ambiente.
2. Confirmar propriedade/disponibilidade de domínio antes de configurar DNS público; registrar no ADR.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- ADR registrado; disponibilidade pendente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="fnd-003"></a>
### FND-003 — Definir stack e monorepo inicial

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Definir stack e monorepo inicial. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** Nenhuma.

**Passos:**

1. Confirmar pnpm/workspaces e versões efetivamente instaladas.
2. Construir pacotes na ordem de dependência e documentar runtimes Next/Node.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- README, package manager e workspaces
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [package.json](../package.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-004"></a>
### FND-004 — Criar repositorio Git e branch protection

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Criar repositorio Git e branch protection. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-003

**Passos:**

1. Conferir workflow no GitHub após push desta branch.
2. Configurar proteção de main com checks exigidos, revisão e bloqueio de force push; guardar evidência administrativa.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- PR exige lint, typecheck e testes
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [.github/workflows/foundation.yml](../.github/workflows/foundation.yml)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-005"></a>
### FND-005 — Definir threat model inicial

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Definir threat model inicial. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-001

**Passos:**

1. Mapear ativos e fronteiras web/API/tenant/worker/provider/IA.
2. Priorizar ameaças, controles existentes, lacunas, responsáveis e cenários negativos.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- riscos, controles e responsaveis registrados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/architecture/threat-model.md](../docs/architecture/threat-model.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-006"></a>
### FND-006 — Criar matriz de permissoes v1

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Criar matriz de permissoes v1. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-005

**Passos:**

1. Definir catálogo de permissões e matriz tenant_admin/manager/agent/viewer.
2. Implementar deny-by-default, vínculo ao recurso e prevenção de escalada; mapear telas.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- todas as telas do MVP mapeadas
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/auth/src/policies.ts](../packages/auth/src/policies.ts), [docs/architecture/permissions.md](../docs/architecture/permissions.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-007"></a>
### FND-007 — Criar mapa modular e regras anti-monolito

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Criar mapa modular e regras anti-monolito. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-003

**Passos:**

1. Conferir mapa modular e direção dos imports.
2. Documentar contratos de pacote, superfície e feature, separando runtime Next da API Node.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- dependencias e nomes canonicos documentados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/module-map.md](../docs/module-map.md), [packages/README.md](../packages/README.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-008"></a>
### FND-008 — Gerar skeleton de modulos sem codigo de negocio

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Gerar skeleton de modulos sem codigo de negocio. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-007

**Passos:**

1. Inspecionar skeleton e READMEs de domínio.
2. Manter placeholders identificados sem endpoints ou funcionalidades simuladas em produção.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- pastas numeradas, READMEs e checks de arquitetura
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/module-map.md](../docs/module-map.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-009"></a>
### FND-009 — Consolidar contrato visual, motion e atualizacao de dados

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Consolidar contrato visual, motion e atualizacao de dados. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-001, FND-007

**Passos:**

1. Consolidar Inter/Poppins, marca, temas, foco, radius e motion no CSS canônico.
2. Documentar freshness/refresh e estados que não inventam dados ou disponibilidade.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- tipografia, estados, refresh, frescor e versao documentados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/ui/src/styles/tokens.css](../packages/ui/src/styles/tokens.css), [packages/ui/README.md](../packages/ui/README.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-010"></a>
### FND-010 — Auditar fundacao e transformar taskboard em guia executavel

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

**Objetivo:** Auditar fundacao e transformar taskboard em guia executavel. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-009

**Passos:**

1. Comparar histórico relatado com branches/commits acessíveis.
2. Gerar cards completos, corrigir conclusões sem evidência e checar ciclos/links/status.

**Áreas de código:** `rules`, `docs`, `packages`, `scripts`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check
- Revisão dos arquivos de evidência listados no card.

**Aceite:**

- auditoria versionada, riscos classificados, cards com arquivos/testes/aceite e regras atualizadas
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/continuity.md](../docs/audit/continuity.md), [scripts/taskboard.mjs](../scripts/taskboard.mjs)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-001"></a>
### INF-001 — Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-003

**Passos:**

1. Subir serviços isolados do compose com volumes de desenvolvimento.
2. Verificar portas internas, health, SMTP local e armazenamento sem dados reais.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- `docker compose up -d` saudavel
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docker-compose.yml](../docker-compose.yml)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-002"></a>
### INF-002 — Validar config por schema

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Validar config por schema. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001

**Passos:**

1. Validar URLs, portas e segredos sem revelar valores em erros.
2. Testar boot da API/Next com campo crítico ausente e com configuração válida no ambiente real.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- boot falha com variavel invalida/ausente critica
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/api/src/tests/unit/boot.test.ts](../apps/api/src/tests/unit/boot.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-003"></a>
### INF-003 — Criar health/readiness endpoints

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Criar health/readiness endpoints. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001

**Passos:**

1. Separar liveness de readiness e aplicar timeouts em dependências.
2. Testar dependências saudáveis, indisponíveis e lentas com respostas sanitizadas.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- API e dependencias reportam estado sem segredos
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/api/src/tests/health.test.ts](../apps/api/src/tests/health.test.ts), [packages/contracts/src/index.ts](../packages/contracts/src/index.ts), [apps/api/src/modules/00-shared/presentation/health.controller.ts](../apps/api/src/modules/00-shared/presentation/health.controller.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-004"></a>
### INF-004 — Criar logger estruturado e request id

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Criar logger estruturado e request id. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-003

**Passos:**

1. Propagar requestId por HTTP, transação, evento e job.
2. Aplicar logging estruturado allowlist e teste com senha/cookie/PII em payload de falha.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- logs correlacionam uma requisicao ponta a ponta
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [packages/logger/src/index.ts](../packages/logger/src/index.ts), [packages/logger/tests/logger.test.ts](../packages/logger/tests/logger.test.ts), [apps/api/src/main.ts](../apps/api/src/main.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-005"></a>
### INF-005 — Criar pipeline CI inicial

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Criar pipeline CI inicial. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** FND-004

**Passos:**

1. Executar gate de fundação e builds no workflow com lockfile.
2. Adicionar integração PostgreSQL/Redis após reconciliação, secret scanning e proteção de branch; registrar execução remota.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- checks de lint, typecheck, teste e secret scan
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [.github/workflows/foundation.yml](../.github/workflows/foundation.yml), [package.json](../package.json)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-006"></a>
### INF-006 — Configurar proxy HTTPS local e contrato de forwarded headers

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Configurar proxy HTTPS local e contrato de forwarded headers. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-003

**Passos:**

1. Configurar hosts locais e certificados do proxy conforme regras 25/33.
2. Testar forwarded headers válidos/forjados, origem rejeitada, redirects e callbacks.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- hosts locais HTTPS, redirect controlado e proxy confiavel testados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/api/src/main.ts](../apps/api/src/main.ts), [infra/nginx/nginx.local.conf](../infra/nginx/nginx.local.conf)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-007"></a>
### INF-007 — Bloquear exposicao de arquivos e portas internas

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Bloquear exposicao de arquivos e portas internas. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001, INF-006

**Passos:**

1. Executar security:check e revisar bind de portas/volumes/public assets.
2. Tentar acesso externo a arquivos internos, backups, env e serviços; registrar respostas sem divulgar segredos.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- `pnpm security:check` passa; dotfiles, secrets, backups, listagem e servicos internos bloqueados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [scripts/check-security-baseline.mjs](../scripts/check-security-baseline.mjs), [docs/taskboard.json](../docs/taskboard.json)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-008"></a>
### INF-008 — Sanear readiness e mover health para modulo shared

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

**Objetivo:** Sanear readiness e mover health para modulo shared. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-003, FND-008

**Passos:**

1. Consolidar contrato de readiness em contracts sem misturar estado de provider.
2. Validar timeouts e sanitização em falhas reais de PostgreSQL/Redis; documentar endpoint público versus interno.

**Áreas de código:** `infra`, `apps/api/src/modules/00-shared`, `packages/config`, `.github/workflows`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- nenhum erro bruto, contrato versionado, testes e acesso interno documentado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/api/src/tests/health.test.ts](../apps/api/src/tests/health.test.ts), [packages/contracts/src/index.ts](../packages/contracts/src/index.ts), [apps/api/src/modules/00-shared/presentation/health.controller.ts](../apps/api/src/modules/00-shared/presentation/health.controller.ts), [apps/api/src/modules/00-shared/application/health.service.ts](../apps/api/src/modules/00-shared/application/health.service.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-001"></a>
### AUTH-001 — Modelar users, tenants, memberships e sessions

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Modelar users, tenants, memberships e sessions. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001, FND-006

**Passos:**

1. Executar inventário somente leitura e classificar histórico do banco.
2. Preparar baseline/reconciliação por origem em clone; completar relações, estados de membership, roles e RLS.
3. Testar SELECT/INSERT/UPDATE/DELETE cruzados, contexto ausente, concorrência e pool com runtime sem bypass.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- migration, RLS e testes de isolamento
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/db/prisma/migrations/20260914011735_init_baseline/migration.sql](../packages/db/prisma/migrations/20260914011735_init_baseline/migration.sql), [packages/db/prisma/migrations/20260914011808_isolation_rls_and_roles/migration.sql](../packages/db/prisma/migrations/20260914011808_isolation_rls_and_roles/migration.sql), [apps/api/src/tests/tenant.repository.test.ts](../apps/api/src/tests/tenant.repository.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-002"></a>
### AUTH-002 — Implementar registro de conta

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar registro de conta. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-001

**Passos:**

1. Reutilizar schema de cadastro e hash Argon2id, com limites server-side.
2. Criar identidade e fluxo pendente de verificação de forma consistente; resolver conta existente sem exposição indevida.
3. Exercitar e-mail duplicado, falha parcial e retries com banco reconciliado.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- email valido, senha Argon2id, tenant pendente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/tenant-web/src/app/(auth)/_actions/auth.ts](../apps/tenant-web/src/app/(auth)/_actions/auth.ts), [apps/tenant-web/src/__tests__/actions/auth.test.ts](../apps/tenant-web/src/__tests__/actions/auth.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-003"></a>
### AUTH-003 — Implementar verificacao de e-mail

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar verificacao de e-mail. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-002

**Passos:**

1. Implementar verificação de e-mail distinta de recuperação de senha.
2. Persistir hash/expiração, reenvio limitado e consumo único que efetivamente marque emailVerified.
3. Testar conta já verificada, token expirado, concorrência e reenvio.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- token unico, expiracao e reenvio limitado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/auth/src/verification.ts](../packages/auth/src/verification.ts), [apps/tenant-web/src/app/(auth)/_actions/verification.ts](../apps/tenant-web/src/app/(auth)/_actions/verification.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-004"></a>
### AUTH-004 — Implementar login/logout

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar login/logout. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-001

**Passos:**

1. Consolidar contrato de sessão entre web e API e definir TTL/idle/remember-me.
2. Implementar registro/revogação por dispositivo e logout servidor além da remoção do cookie.
3. Validar revisão, revogação, CSRF, cookie copiado, expiração e Redis indisponível.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- cookie seguro, sessao persistida, logout invalida
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [packages/auth/src/session.ts](../packages/auth/src/session.ts), [apps/tenant-web/src/features/workspace/actions.ts](../apps/tenant-web/src/features/workspace/actions.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-005"></a>
### AUTH-005 — Implementar recuperacao de senha

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar recuperacao de senha. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004

**Passos:**

1. Integrar request/verify/redeemRecovery ao banco reconciliado e SMTP.
2. Manter OTP/prova fora da URL, consumo atômico e expiração; reduzir timing/PII do fluxo com desafio opaco e envio assíncrono.
3. Testar concorrência real, reuso, outro e-mail, falha de entrega/Redis e revogação posterior.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- token de uso unico e logs sem token
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/tenant-web/src/app/(auth)/_actions/auth.ts](../apps/tenant-web/src/app/(auth)/_actions/auth.ts), [packages/auth/src/recovery.ts](../packages/auth/src/recovery.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-006"></a>
### AUTH-006 — Criar onboarding do tenant_admin

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Criar onboarding do tenant_admin. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-003

**Passos:**

1. Após e-mail confirmado, criar tenant/slug/membership admin na mesma transação.
2. Definir retomada idempotente e seleção segura para usuários com múltiplos tenants.
3. Testar slug duplicado, falha parcial, ausência de tenant e reentrada.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- tenant, membership e slug criados atomicamente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/app/(auth)/_actions/onboarding.ts](../apps/tenant-web/src/app/(auth)/_actions/onboarding.ts), [packages/db/src/tenant.ts](../packages/db/src/tenant.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-007"></a>
### AUTH-007 — Criar convite de membro

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Criar convite de membro. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-006

**Passos:**

1. Aplicar RBAC e validação de role na criação de convite com repo ligado ao tx.
2. Resolver aceite por capability segura sem bypass global de RLS e consumir com lock/índice único.
3. Auditar criação/aceite/expiração e testar elevação, concorrência e rollback.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- convite escopado ao tenant, expiracao e aceite auditado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/features/workspace/actions.ts](../apps/tenant-web/src/features/workspace/actions.ts), [apps/tenant-web/src/app/(dashboard)/settings/team/team-client.tsx](../apps/tenant-web/src/app/(dashboard)/settings/team/team-client.tsx)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-008"></a>
### AUTH-008 — Implementar RBAC/ABAC v1

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar RBAC/ABAC v1. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-001, FND-006

**Passos:**

1. Integrar policies em cada endpoint/action/resource do domínio.
2. Adicionar estado ativo/suspenso e revalidar membership na mutação, incluindo revogação concorrente.
3. Testar viewer escrevendo, manager elevando admin, tenant trocado e recurso de outro tenant.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- manager nao eleva/remover admin
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/features/workspace/actions.ts](../apps/tenant-web/src/features/workspace/actions.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-009"></a>
### AUTH-009 — Criar shell do painel tenant

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Criar shell do painel tenant. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004

**Passos:**

1. Usar shell server-side autenticado e composições desktop/mobile existentes.
2. Conectar seleção de tenant e navegação a membership/entitlements reais; preservar filtros/rascunhos.
3. Validar logout, teclado, temas, 320/360/768/1440 e ausência de controle inerte.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- sidebar, topbar, rotas protegidas e mobile 360 px
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/features/workspace/tenant-switcher.tsx](../apps/tenant-web/src/features/workspace/tenant-switcher.tsx), [apps/tenant-web/src/features/workspace/server/session.ts](../apps/tenant-web/src/features/workspace/server/session.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-010"></a>
### AUTH-010 — Criar tela de login visual

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Criar tela de login visual. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004, AUTH-009

**Passos:**

1. Conferir login/cadastro/reset com estados reais e mensagens acessíveis.
2. Validar autofill, paste, foco no erro, mobile, noindex, contraste e reduced motion.
3. Executar o fluxo completo após AUTH-004/009, sem confundir aprovação visual com E2E.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- estados loading/erro/sucesso, acessibilidade e SEO noindex
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/app/(auth)/register/register-client.tsx](../apps/tenant-web/src/app/(auth)/register/register-client.tsx), [apps/tenant-web/src/app/(auth)/layout.tsx](../apps/tenant-web/src/app/(auth)/layout.tsx)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-011"></a>
### AUTH-011 — Testar fluxos E2E

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Testar fluxos E2E. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, AUTH-007, AUTH-008, AUTH-009, AUTH-010

**Passos:**

1. Provisionar dados sintéticos, Redis e SMTP local em ambiente reconciliado.
2. Executar cadastro→verificação→onboarding→login→logout→reset→convite e cenários negativos.
3. Guardar resumo e evidências redigidas por commit; falha de dependência não conta como ataque bloqueado.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- todos os testes passando estavelmente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/e2e-tests/tests/auth/registration.spec.ts](../apps/e2e-tests/tests/auth/registration.spec.ts), [apps/e2e-tests/tests/auth/invitation.spec.ts](../apps/e2e-tests/tests/auth/invitation.spec.ts), [apps/e2e-tests/playwright.config.ts](../apps/e2e-tests/playwright.config.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-012"></a>
### AUTH-012 — Revisao de seguranca do primeiro marco

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Revisao de seguranca do primeiro marco. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-011

**Passos:**

1. Revisar threat model e todos os gates AUTH após E2E.
2. Confirmar que não restam findings críticos/altos sem mitigação aprovada; documentar risco e reteste.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- checklist sem blocker critico
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/security-review.md](../docs/audit/security-review.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-013"></a>
### AUTH-013 — Bootstrap seguro do platform_owner via CLI no VPS

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Bootstrap seguro do platform_owner via CLI no VPS. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-001, INF-002

**Passos:**

1. Revisar stdin sem eco, nonce/janela de bootstrap e lock na mesma transação.
2. Criar owner único com hash Argon2id, auditoria durável e MFA pendente sem acesso ao painel.
3. Testar segunda execução, concorrência, nonce inválido, rollback e logs sem segredo.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- comando one-shot, stdin seguro, Argon2id, advisory lock, MFA pendente e auditoria
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [scripts/bootstrap-superadmin.ts](../scripts/bootstrap-superadmin.ts), [package.json](../package.json)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-014"></a>
### AUTH-014 — Login separado do superadmin e do tenant

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Login separado do superadmin e do tenant. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004, AUTH-008

**Passos:**

1. Integrar handlers/guards tenant/platform com cookies e segredos separados.
2. Completar MFA seguro, setup recente, replay/backup codes, recovery privilegiado e registro de sessão por superfície.
3. Testar credencial/cookie cruzado, isSuperadmin inválido, MFA ausente e revogação nas duas superfícies.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- cookies, audiences, rotas, rate limit, recovery e MFA sem compartilhamento
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/superadmin-web/src/app/(auth)/login/page.tsx](../apps/superadmin-web/src/app/(auth)/login/page.tsx), [apps/superadmin-web/src/app/(auth)/_actions.ts](../apps/superadmin-web/src/app/(auth)/_actions.ts), [packages/auth/src/surface.ts](../packages/auth/src/surface.ts), [packages/auth/src/mfa.ts](../packages/auth/src/mfa.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-015"></a>
### AUTH-015 — Proteger API, webhooks e servicos internos

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Proteger API, webhooks e servicos internos. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004, FND-006

**Passos:**

1. Definir API key pública escopada, hash/rotação/revogação e identidade de serviços internos.
2. Integrar raw body, assinatura, timestamp e dedupe persistente por provider; aplicar audience/scopes/expiração.
3. Testar prefixo falso, chave revogada, assinatura curta, replay, token vencido e tenant trocado.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- API key escopada, HMAC/timestamp/replay, mTLS/JWT interno e health seguro
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/security/src/api-keys.ts](../packages/security/src/api-keys.ts), [packages/security/src/internal.ts](../packages/security/src/internal.ts), [apps/api/src/modules/00-shared/presentation/auth.middleware.ts](../apps/api/src/modules/00-shared/presentation/auth.middleware.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auth-016"></a>
### AUTH-016 — E2E das superficies de acesso

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** E2E das superficies de acesso. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-013, AUTH-014, AUTH-015

**Passos:**

1. Exercitar tenant, platform, API, hook e serviço interno no ambiente reconciliado.
2. Testar sessão revogada, CSRF, tenant switching, MFA, replay e escalada; registrar evidência por superfície.

**Áreas de código:** `packages/auth`, `packages/db`, `apps/tenant-web/src/app/(auth)`, `apps/api/src/modules/01-identity`, `apps/api/src/modules/02-tenancy`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- tenant, superadmin, API, hooks, revogacao, CSRF e escalada falham corretamente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/security-review.md](../docs/audit/security-review.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-001"></a>
### TEAM-001 — CRUD de setores

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** CRUD de setores. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-008, AUTH-016

**Passos:**

1. Criar setores com tenant e estado ativo, schemas e CRUD autorizado.
2. Definir associação/visibilidade de usuários e recursos por setor; testar remoção com dependentes.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- acesso por setor testado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/e2e-tests/tests/team/department-crud.spec.ts](../apps/e2e-tests/tests/team/department-crud.spec.ts), [packages/db/prisma/schema.prisma](../packages/db/prisma/schema.prisma), [apps/tenant-web/src/features/team/actions/department.actions.ts](../apps/tenant-web/src/features/team/actions/department.actions.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-002"></a>
### TEAM-002 — CRUD de cargos customizados

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** CRUD de cargos customizados. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-008, AUTH-016

**Passos:**

1. Modelar cargos customizados como subconjunto das permissões do criador.
2. Impedir alteração de dono/permissão reservada e testar escalada por atualização parcial.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- permissao nao pode exceder criador
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/db/prisma/schema.prisma](../packages/db/prisma/schema.prisma), [packages/auth/src/session.ts](../packages/auth/src/session.ts), [packages/db/prisma/schema.prisma](../packages/db/prisma/schema.prisma), [packages/auth/src/session.ts](../packages/auth/src/session.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-003"></a>
### TEAM-003 — Gestao de membros

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** Gestao de membros. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-002, AUTH-016

**Passos:**

1. Implementar lista, convite, suspensão, reativação e transferência com policies.
2. Revogar acessos/sessões afetados e auditar; testar proteção do último admin.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- suspender, reativar, transferir e auditar
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [packages/auth/src/session.ts](../packages/auth/src/session.ts), [apps/api/src/modules/04-team/infrastructure/team.repository.ts](../apps/api/src/modules/04-team/infrastructure/team.repository.ts), [apps/api/src/modules/04-team/application/team.service.ts](../apps/api/src/modules/04-team/application/team.service.ts), [apps/api/src/modules/05-crm/infrastructure/deal.repository.ts](../apps/api/src/modules/05-crm/infrastructure/deal.repository.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-004"></a>
### TEAM-004 — Auditoria pesquisavel

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** Auditoria pesquisavel. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-004, AUTH-016

**Passos:**

1. Persistir eventos de auditoria minimizados com tenant/actor/requestId.
2. Criar filtros e paginação autorizados, retenção e export controlado; testar acesso cruzado.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- filtros por actor, acao, recurso e periodo
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/04-team/presentation/audit.controller.ts](../apps/api/src/modules/04-team/presentation/audit.controller.ts), [apps/api/src/modules/04-team/infrastructure/audit.repository.ts](../apps/api/src/modules/04-team/infrastructure/audit.repository.ts), [apps/tenant-web/src/features/workspace/actions/audit.actions.ts](../apps/tenant-web/src/features/workspace/actions/audit.actions.ts), [apps/tenant-web/src/app/(dashboard)/settings/security/audit/audit-client.tsx](../apps/tenant-web/src/app/(dashboard)/settings/security/audit/audit-client.tsx), [apps/tenant-web/src/app/(dashboard)/settings/security/audit/page.tsx](../apps/tenant-web/src/app/(dashboard)/settings/security/audit/page.tsx)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-005"></a>
### TEAM-005 — Contrato de erros e reporte pelo painel tenant

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** Contrato de erros e reporte pelo painel tenant. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-004, AUTH-004, AUTH-016

**Passos:**

1. Padronizar erros técnicos + HTTP + protocolo BPS sem stack/PII.
2. Criar reporte contextual com requestId e payload allowlisted; testar falha de envio e consentimento quando aplicável.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- codigo BipeSend, request id, redacao e protocolo de reporte
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/04-team/presentation/support.controller.ts](../apps/api/src/modules/04-team/presentation/support.controller.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-006"></a>
### TEAM-006 — Dicionario e triagem de erros no superpainel

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

**Objetivo:** Dicionario e triagem de erros no superpainel. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-005, AUTH-008, AUTH-016

**Passos:**

1. Criar busca/triagem privilegiada por código/fingerprint/tenant/severidade.
2. Implementar transições open/investigating/resolved/ignored com auditoria e autorização.

**Áreas de código:** `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, `packages/auth`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- buscar, vincular, promover, resolver e auditar
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/features/support/actions/triage.actions.ts](../apps/tenant-web/src/features/support/actions/triage.actions.ts), [apps/tenant-web/src/features/support/actions/report.actions.ts](../apps/tenant-web/src/features/support/actions/report.actions.ts), [apps/tenant-web/src/features/support/components/error-triage-panel.tsx](../apps/tenant-web/src/features/support/components/error-triage-panel.tsx), [apps/api/src/modules/04-team/presentation/support.controller.ts](../apps/api/src/modules/04-team/presentation/support.controller.ts), [apps/api/src/modules/04-team/infrastructure/error-report.repository.ts](../apps/api/src/modules/04-team/infrastructure/error-report.repository.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-001"></a>
### CRM-001 — Contatos e campos customizados

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Contatos e campos customizados. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-001, AUTH-016

**Passos:**

1. Modelar contatos/campos customizados com tenant, índices e schema limitado.
2. Conectar CRUD/importação ao backend; tratar duplicata, CSV injection, tamanho e rollback.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`, `packages/db`, `packages/auth`, `packages/config`, `packages/events`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- CRUD, importacao segura e tenant isolation
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/tenant-web/e2e/crm-pipeline.spec.ts](../apps/tenant-web/e2e/crm-pipeline.spec.ts), [docs/audit/CRM-001.md](../docs/audit/CRM-001.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-002"></a>
### CRM-002 — Tags e segmentos

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Tags e segmentos. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-001, AUTH-016

**Passos:**

1. Criar tags e filtros de segmentos com schema e limites por plano.
2. Testar exclusão, associação cruzada, paginação e reavaliação de segmentos.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- filtros e limites por plano
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/tenant-web/e2e/crm-pipeline.spec.ts](../apps/tenant-web/e2e/crm-pipeline.spec.ts), [docs/audit/CRM-002.md](../docs/audit/CRM-002.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-003"></a>
### CRM-003 — Pipelines configuraveis

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Pipelines configuraveis. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-001, AUTH-016

**Passos:**

1. Persistir pipelines/etapas/ordem e transições autorizadas.
2. Validar cor acessível, movimento concorrente e remoção de etapa com negócios existentes.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- etapas, ordem, cor e regras validas
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [apps/tenant-web/e2e/crm-pipeline.spec.ts](../apps/tenant-web/e2e/crm-pipeline.spec.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-004"></a>
### CRM-004 — Cards/lista/inbox views

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Cards/lista/inbox views. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-003, AUTH-016, CRM-005

**Passos:**

1. Conectar cards/lista às queries do tenant mantendo filtro/sort.
2. Oferecer ação de mover etapa por teclado/menu além do drag; composição mobile própria.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- alternativa acessivel ao drag-and-drop
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/features/crm/components/board/pipeline-board.tsx](../apps/tenant-web/src/features/crm/components/board/pipeline-board.tsx), [apps/tenant-web/src/features/crm/components/board/pipeline-list.tsx](../apps/tenant-web/src/features/crm/components/board/pipeline-list.tsx)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-005"></a>
### CRM-005 — Conversas e mensagens internas

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Conversas e mensagens internas. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-001, AUTH-016

**Passos:**

1. Modelar conversas/mensagens com direção, estado, paginação e retenção.
2. Conectar inbox de três painéis no desktop e lista→conversa→contexto no mobile; preservar rascunho.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`, `06-inbox`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- historico paginado e auditoria
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/tests/deal.service.test.ts](../apps/api/src/tests/deal.service.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-006"></a>
### CRM-006 — Atribuicao a setor/cargo/membro

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Atribuicao a setor/cargo/membro. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-001, AUTH-016, CRM-001, CRM-003, CRM-005, TEAM-002, TEAM-003, CRM-007

**Passos:**

1. Autorizar atribuição por setor/cargo/membro ativo.
2. Persistir atribuição atomicamente, auditar e emitir evento; testar membro suspenso e corrida.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- autorizacao e notificacao em tempo real
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/16-notifications/infrastructure/notification.repository.ts](../apps/api/src/modules/16-notifications/infrastructure/notification.repository.ts), [apps/tenant-web/src/features/notifications/components/notification-bell.tsx](../apps/tenant-web/src/features/notifications/components/notification-bell.tsx), [apps/api/src/modules/05-crm/infrastructure/deal.repository.ts](../apps/api/src/modules/05-crm/infrastructure/deal.repository.ts), [apps/api/src/modules/06-inbox/infrastructure/conversation.repository.ts](../apps/api/src/modules/06-inbox/infrastructure/conversation.repository.ts), [apps/api/src/tests/assignment.test.ts](../apps/api/src/tests/assignment.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-007"></a>
### CRM-007 — WebSocket rooms

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** WebSocket rooms. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-005, AUTH-016, MSG-001, MSG-002

**Passos:**

1. Autenticar handshake e autorizar rooms por tenant/recurso.
2. Revalidar após reconexão/revogação e fazer catch-up paginado; testar inscrição em sala alheia.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`, `06-inbox`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- usuario so recebe eventos autorizados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/tenant-web/src/lib/useRealtime.ts](../apps/tenant-web/src/lib/useRealtime.ts), [apps/api/src/modules/15-events/infrastructure/websocket.gateway.ts](../apps/api/src/modules/15-events/infrastructure/websocket.gateway.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-001"></a>
### MSG-001 — Outbox e eventos

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Outbox e eventos. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-004, CRM-005, AUTH-016

**Passos:**

1. Criar tabela/adapter de outbox na transação da entidade e relay com lease.
2. Persistir dedupe por tenant/consumer/eventId; testar rollback, publicação repetida e queda após envio.

**Áreas de código:** `packages/events`, `apps/worker`, `apps/api/src/modules/07-messaging`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- sem evento fantasma apos rollback
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/15-events/infrastructure/outbox.repository.ts](../apps/api/src/modules/15-events/infrastructure/outbox.repository.ts), [apps/api/src/modules/15-events/application/outbox.worker.ts](../apps/api/src/modules/15-events/application/outbox.worker.ts), [apps/api/src/main.ts](../apps/api/src/main.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-002"></a>
### MSG-002 — BullMQ e dead-letter

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** BullMQ e dead-letter. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-001, AUTH-016

**Passos:**

1. Configurar filas BullMQ isoladas por escopo, payload pequeno e referências.
2. Aplicar retry/backoff/timeout/cancelamento/DLQ e controle de concorrência/custo por tenant.

**Áreas de código:** `packages/events`, `apps/worker`, `apps/api/src/modules/07-messaging`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- retry/backoff/timeout/idempotencia
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/15-events/infrastructure/outbox.repository.ts](../apps/api/src/modules/15-events/infrastructure/outbox.repository.ts), [apps/api/src/modules/15-events/application/outbox.worker.ts](../apps/api/src/modules/15-events/application/outbox.worker.ts), [apps/api/src/main.ts](../apps/api/src/main.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-003"></a>
### MSG-003 — Adapter de provider

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Adapter de provider. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-001, AUTH-016

**Passos:**

1. Definir interface de provider e adapter fake contratual sem rede real.
2. Implementar adapter real server-only com timeout, mapeamento de erros e testes de contrato.

**Áreas de código:** `packages/events`, `apps/worker`, `apps/api/src/modules/07-messaging`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- provider fake coberto por contrato
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/07-messaging/infrastructure/evolution-messaging.provider.ts](../apps/api/src/modules/07-messaging/infrastructure/evolution-messaging.provider.ts), [apps/api/src/tests/messaging-provider.test.ts](../apps/api/src/tests/messaging-provider.test.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-004"></a>
### MSG-004 — QR e conexao

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** QR e conexao. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-003, AUTH-016

**Passos:**

1. Criar estado de conexão/QR com expiração, autorização e emissão segura.
2. Não registrar QR/token; testar expiração, reconexão, logout provider e perda de rede.

**Áreas de código:** `packages/events`, `apps/worker`, `apps/api/src/modules/07-messaging`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- QR expirado e status auditado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** [apps/api/src/modules/07-messaging/http/controllers/connection.controller.ts](../apps/api/src/modules/07-messaging/http/controllers/connection.controller.ts), [apps/api/src/modules/07-messaging/application/connection.service.ts](../apps/api/src/modules/07-messaging/application/connection.service.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-005"></a>
### MSG-005 — Webhook normalizado

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Webhook normalizado. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-003, AUTH-016

**Passos:**

1. Verificar assinatura nos bytes originais conforme provider e mapear evento canônico.
2. Persistir chave idempotente e enfileirar após confirmação segura; testar replay e eventos fora de ordem.

**Áreas de código:** `packages/events`, `apps/worker`, `apps/api/src/modules/07-messaging`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- assinatura e duplicatas tratadas
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auto-001"></a>
### AUTO-001 — Gatilhos e condicoes

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Gatilhos e condicoes. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-003, MSG-001, AUTH-016

**Passos:**

1. Modelar DSL declarativa de gatilhos/condições com schemas e versão.
2. Proibir JS arbitrário e ciclos sem limite; avaliar com contexto autorizado e limite de passos.

**Áreas de código:** `apps/api/src/modules/08-automation`, `apps/tenant-web/src/app/(dashboard)/automations`, `packages/events`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- DSL validada, sem execucao arbitraria
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auto-002"></a>
### AUTO-002 — Acoes e agendamento

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Acoes e agendamento. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-002, AUTH-016

**Passos:**

1. Persistir agenda, timezone, cancelamento e idempotência da execução.
2. Criar ações allowlisted com limite por plano, simulação explícita e rollback/compensação definida.

**Áreas de código:** `apps/api/src/modules/08-automation`, `apps/tenant-web/src/app/(dashboard)/automations`, `packages/events`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- timezone, cancelamento e limite
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="auto-003"></a>
### AUTO-003 — Campanhas com opt-out

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

**Objetivo:** Campanhas com opt-out. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MSG-004, AUTH-016

**Passos:**

1. Implementar seleção de público com opt-in/opt-out e lista de supressão.
2. Enfileirar com limites do provider/tenant, pausa/cancelamento e dedupe por destinatário/campanha.

**Áreas de código:** `apps/api/src/modules/08-automation`, `apps/tenant-web/src/app/(dashboard)/automations`, `packages/events`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- supressao e rate limit obrigatorios
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-001"></a>
### AI-001 — Upload em quarentena

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Upload em quarentena. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001, TEAM-003, AUTH-016

**Passos:**

1. Criar upload privado em quarentena com tenant, limite, MIME real e assinatura temporária.
2. Executar scan e rejeitar arquivo perigoso; testar zip bomb, tamanho e URL expirada.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- MIME, tamanho, scan e storage privado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-002"></a>
### AI-002 — Pipeline de extracao/chunks

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Pipeline de extracao/chunks. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-001, AUTH-016

**Passos:**

1. Extrair texto com sandbox/limites e versionar documento/chunks.
2. Garantir reprocessamento idempotente, exclusão completa e rastreabilidade sem conteúdo em log.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- documento versionado e reprocessavel
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-003"></a>
### AI-003 — Embeddings + pgvector

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Embeddings + pgvector. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-002, AUTH-016

**Passos:**

1. Criar embeddings e índice com namespace e filtro tenant/ACL obrigatório.
2. Testar recuperação cruzada, permissão revogada, atualização/exclusão e isolamento de cache.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- retrieval filtra tenant e permissao
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-004"></a>
### AI-004 — Provider adapter de LLM

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Provider adapter de LLM. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-003, AUTH-016

**Passos:**

1. Definir adapter LLM com credencial server-only, timeout e orçamento.
2. Aplicar limites por tenant/modelo, minimizar envio de dados e registrar custo sem prompt secreto.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- chave server-only, limite de custo
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-005"></a>
### AI-005 — Copiloto read-only

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Copiloto read-only. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-004, CRM-005, AUTH-016

**Passos:**

1. Construir copiloto inicialmente de leitura com referências e incerteza explícita.
2. Sugestões não executam envios/mutações; aprovação humana com contexto precede efeitos autorizados.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- nao envia nem altera sem aprovacao
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-006"></a>
### AI-006 — Gateway MCP interno

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Gateway MCP interno. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-005, AUTH-016

**Passos:**

1. Expor tools allowlisted com JSON schemas, sessão, tenant e escopo mínimos.
2. Autorizar cada chamada/resultado, auditar efeitos e negar endpoints/URLs arbitrários.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- tools allowlist, schema, tenant e auditoria
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ai-007"></a>
### AI-007 — Testes de prompt injection

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 6 - IA, conhecimento e MCP

**Objetivo:** Testes de prompt injection. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AI-005, AUTH-016

**Passos:**

1. Montar casos de injeção em chat, documento, metadata e saída de ferramenta.
2. Verificar exfiltração, tool escalation, cross-tenant e abuso de orçamento; retestar regressões.

**Áreas de código:** `apps/api/src/modules/09-knowledge`, `apps/worker`, `packages/security`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- ataques conhecidos nao elevam privilegio
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-001"></a>
### BILL-001 — Entitlements e contadores

**Estado:** READY · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** Fundação única e antecipada de entitlements/cotas, reutilizada pelo BipeWPRO e pelos planos futuros.

**Dependências:** AUTH-006, AUTH-016

**Passos:**

1. Criar definições/concessões/contadores/reservas com revisão, vigência e motivo auditável.
2. Implementar chaves web/food do plano, limite finito/ilimitado explícito e escopos por dono/site.
3. Consumir atomicamente em criar/duplicar/importar/restaurar e revalidar em publicar; concessão ausente nega.
4. Concessão institucional platform ilimitada comercialmente; suporte usa cota tenant; BILL-002/005 reutilizam estrutura.

**Áreas de código:** `apps/api/src/modules/12-billing`, `packages/contracts/src/entitlements`, `packages/db`, `packages/auth`.

**Testes a executar:**

- Duas escritas para última vaga; reserva abortada/expirada; retry com payload diferente.
- Downgrade não destrutivo, restore acima da cota, platform forjado e capability PHP sem runtime.
- Rodar testes/typecheck/build dos pacotes e apps alterados e os gates pertinentes; registrar comandos, commit e limites da validação.

**Aceite:**

- Backend é fonte única para capacidades/uso/limite; sem WebPlan/FoodPlan ou contadores locais.
- Plano comercial futuro conecta-se ao mesmo modelo, sem recriar estrutura.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-002"></a>
### BILL-002 — CRUD de planos superadmin

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** CRUD de planos superadmin. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** BILL-001, AUTH-016

**Passos:**

1. Criar administração de plano/custom plan com revisão e auditoria.
2. Validar limites/preço/moeda e impacto em assinaturas existentes antes da publicação.
3. Reutilizar definições, concessões e contadores de BILL-001/BipeWPRO; não recriar tabelas ou chaves web/food. Conferir docs/plans/bipewpro.md seção 13.

**Áreas de código:** `apps/api/src/modules/12-billing`, `apps/superadmin-web`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- custom plan auditado
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-003"></a>
### BILL-003 — Stripe Connect sandbox

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** Stripe Connect sandbox. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** BILL-002, AUTH-016

**Passos:**

1. Integrar Stripe Connect em sandbox com state/OAuth escopado.
2. Cifrar credenciais e validar webhook/dedupe; testar conta errada, revogação e replay.

**Áreas de código:** `apps/api/src/modules/12-billing`, `apps/superadmin-web`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- OAuth, state, tokens criptografados e webhook
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-004"></a>
### BILL-004 — Mercado Pago OAuth sandbox

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** Mercado Pago OAuth sandbox. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** BILL-002, AUTH-016

**Passos:**

1. Integrar Mercado Pago OAuth em sandbox conforme documentação vigente.
2. Aplicar contrato comum de credencial/evento, timeout e idempotência; testar revogação.

**Áreas de código:** `apps/api/src/modules/12-billing`, `apps/superadmin-web`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- mesmo contrato e idempotencia
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-005"></a>
### BILL-005 — Upgrade/downgrade

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** Upgrade/downgrade. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** BILL-003, BILL-004, AUTH-016

**Passos:**

1. Implementar upgrade/downgrade com previsão clara e confirmação apropriada.
2. Aplicar mudanças por webhook confirmado; preservar dados excedentes sem apagar por downgrade.
3. Reutilizar definições, concessões e contadores de BILL-001/BipeWPRO; não recriar tabelas ou chaves web/food. Conferir docs/plans/bipewpro.md seção 13.

**Áreas de código:** `apps/api/src/modules/12-billing`, `apps/superadmin-web`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- downgrade nao apaga dados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ops-001"></a>
### OPS-001 — Backup e restore drill

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Backup e restore drill. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-001

**Passos:**

1. Definir RPO/RTO, backup cifrado e retenção para DB/blob/chaves.
2. Ensaiar restauração isolada com contagens e tempo medidos, incluindo rotação de acesso.

**Áreas de código:** `infra`, `docs`, `apps/api/src/modules/00-shared`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- restore documentado e medido
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ops-002"></a>
### OPS-002 — Observabilidade e alertas

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Observabilidade e alertas. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-004

**Passos:**

1. Instrumentar latência/erro/fila/entrega/custo e SLOs acionáveis.
2. Criar alertas deduplicados e runbooks de incidente por responsável.

**Áreas de código:** `infra`, `docs`, `apps/api/src/modules/00-shared`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- SLOs e runbooks
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ops-003"></a>
### OPS-003 — Pentest e revisao externa

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Pentest e revisao externa. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-016, TEAM-004, OPS-001, OPS-002

**Passos:**

1. Executar revisão externa do escopo efetivamente implementado com dados sintéticos.
2. Retestar achados críticos e altos, documentar mitigação e liberar marco somente com aceite.

**Áreas de código:** `infra`, `docs`, `apps/api/src/modules/00-shared`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- sem blocker critico
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ops-004"></a>
### OPS-004 — Registro e verificacao de saude das integracoes

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Registro e verificacao de saude das integracoes. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** INF-004

**Passos:**

1. Persistir estado normalizado da integração, checkedAt e motivo seguro.
2. Agendar verificação com timeout/backoff, limitar por tenant e auditar transições.

**Áreas de código:** `infra`, `docs`, `apps/api/src/modules/00-shared`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- estados, timeout, backoff e resumo sem segredos
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="ops-005"></a>
### OPS-005 — Indicadores de API e integracao no painel

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Indicadores de API e integracao no painel. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** OPS-004, AUTH-009

**Passos:**

1. Conectar IntegrationStatusBadge/LastCheckedLabel ao estado autorizado.
2. Oferecer reconectar/detalhes/retry sem segredo; testar unknown, plano bloqueado e reduced motion.

**Áreas de código:** `infra`, `docs`, `apps/api/src/modules/00-shared`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- status textual, ponto acessivel, ultima verificacao e reduced motion
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="mob-001"></a>
### MOB-001 — Especificar app nativo

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Especificar app nativo. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** OPS-003

**Passos:**

1. Registrar ADR de app nativo: fluxos prioritários, autenticação, storage e notificações.
2. Definir contrato de paridade, offline/conflitos e tokens nativos sem importar DOM/Next.

**Áreas de código:** `apps/mobile`, `packages/contracts`, `rules/35_MOBILE_WEB_NATIVE.md`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- decisoes de escopo e API mobile
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="mob-002"></a>
### MOB-002 — Implementar mobile

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 9 - operacao e app mobile

**Objetivo:** Implementar mobile. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** MOB-001

**Passos:**

1. Implementar navegação/controles nativos sobre contratos autorizados.
2. Validar dispositivos, leitor de tela, deep links, expiração/revogação e armazenamento seguro.

**Áreas de código:** `apps/mobile`, `packages/contracts`, `rules/35_MOBILE_WEB_NATIVE.md`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- paridade dos fluxos prioritarios
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-007"></a>
### TEAM-007 — Godmode e Impersonation (Superadmin e Contratante)

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

**Objetivo:** Implementar as lógicas de impersonation e reset de senhas de contas gerenciadas.

**Dependências:** TEAM-002

**Passos:**

1. Adicionar isManagedAccount e impersonatedBy no banco de dados
2. Propagar campos via callback NextAuth JWT e Session
3. Implementar actions de admin para o Tenant Web e Superadmin Web
4. Gerar logs no AuditLog

**Áreas de código:** `packages/auth`, `apps/tenant-web`, `apps/superadmin-web`.

**Testes a executar:**

- Testes visuais das rotas e validações de actions via server actions

**Aceite:**

- Ações de admin implementadas com log de auditoria

**Evidências:** [apps/tenant-web/src/features/team/actions/member.actions.ts](../apps/tenant-web/src/features/team/actions/member.actions.ts), [apps/superadmin-web/src/actions/admin.ts](../apps/superadmin-web/src/actions/admin.ts), [packages/auth/src/impersonate.ts](../packages/auth/src/impersonate.ts), [rules/05_AUTH_RBAC.md](../rules/05_AUTH_RBAC.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-010"></a>
### CRM-010 — Implement Visual Automations (IMPLEMENTATION)

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 4 - automações

**Objetivo:** Implementar uma interface de automação visual semelhante ao n8n.

**Dependências:** Nenhuma.

**Passos:**

1. Instalar e configurar @xyflow/react
2. Criar os nós customizados e sidebar
3. Criar api route

**Áreas de código:** `apps/tenant-web/src/app/(dashboard)/automations`, `apps/tenant-web/src/features/automations`.

**Testes a executar:**

- pnpm rules:check
- pnpm taskboard:check

**Aceite:**

- React Flow canvas renderizado
- Sidebar de configuração funcionando
- API route mockada

**Evidências:** [apps/tenant-web/src/app/(dashboard)/automations/page.tsx](../apps/tenant-web/src/app/(dashboard)/automations/page.tsx), [apps/tenant-web/src/app/api/automations/route.ts](../apps/tenant-web/src/app/api/automations/route.ts)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.
