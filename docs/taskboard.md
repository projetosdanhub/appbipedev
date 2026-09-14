# Taskboard BipeSend — executável

Versão 1.0.0 · Revisão 2026-09-14 · Base auditada `fd3f4c3`

**Fonte:** docs/taskboard.json. Não editar este Markdown diretamente; rode `pnpm taskboard:render` e `pnpm taskboard:check`.

Total: 85 cards. BACKLOG: 47 · READY: 1 · IN_PROGRESS: 17 · BLOCKED: 9 · DONE: 11.

DONE exige aceite integral, evidência e dependências concluídas. Código parcial não comprova integração. Áreas de código são alvos de trabalho, podendo incluir pastas a criar. “Testes” são instruções de execução; resultados realmente observados ficam nas evidências.

## Próximo ciclo

1. INF-001: preparar ambiente isolado com PostgreSQL/Redis/SMTP.
2. AUTH-001: inventário e reconciliação do banco em clone, antes de rodar migrations.
3. AUTH-004/005/014: integrar sessão/recovery/MFA com banco real.
4. AUTH-002/003/006/007/008: cadastro verificado, onboarding, convites e autorização.
5. AUTH-009/010/011/012/016: conectar shell ao tenant e validar as superfícies ponta a ponta.

Não ativar CRM, mensageria, IA ou billing reais antes do gate AUTH-016; protótipos visuais podem ser revisados, identificados como exemplos.

## Índice

| ID | Estado | Tarefa | Dependências |
| --- | --- | --- | --- |
| [FND-001](#fnd-001) | DONE | Criar regras e convencoes | — |
| [FND-002](#fnd-002) | IN_PROGRESS | Definir nome de trabalho e dominios candidatos | — |
| [FND-003](#fnd-003) | DONE | Definir stack e monorepo inicial | — |
| [FND-004](#fnd-004) | BLOCKED | Criar repositorio Git e branch protection | FND-003 |
| [FND-005](#fnd-005) | DONE | Definir threat model inicial | FND-001 |
| [FND-006](#fnd-006) | DONE | Criar matriz de permissoes v1 | FND-005 |
| [FND-007](#fnd-007) | DONE | Criar mapa modular e regras anti-monolito | FND-003 |
| [FND-008](#fnd-008) | DONE | Gerar skeleton de modulos sem codigo de negocio | FND-007 |
| [FND-009](#fnd-009) | DONE | Consolidar contrato visual, motion e atualizacao de dados | FND-001, FND-007 |
| [FND-010](#fnd-010) | DONE | Auditar fundacao e transformar taskboard em guia executavel | FND-009 |
| [INF-001](#inf-001) | READY | Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO | FND-003 |
| [INF-002](#inf-002) | IN_PROGRESS | Validar config por schema | INF-001 |
| [INF-003](#inf-003) | IN_PROGRESS | Criar health/readiness endpoints | INF-001 |
| [INF-004](#inf-004) | IN_PROGRESS | Criar logger estruturado e request id | INF-003 |
| [INF-005](#inf-005) | IN_PROGRESS | Criar pipeline CI inicial | FND-004 |
| [INF-006](#inf-006) | IN_PROGRESS | Configurar proxy HTTPS local e contrato de forwarded headers | INF-003 |
| [INF-007](#inf-007) | IN_PROGRESS | Bloquear exposicao de arquivos e portas internas | INF-001, INF-006 |
| [INF-008](#inf-008) | IN_PROGRESS | Sanear readiness e mover health para modulo shared | INF-003, FND-008 |
| [AUTH-001](#auth-001) | BLOCKED | Modelar users, tenants, memberships e sessions | INF-001, FND-006 |
| [AUTH-002](#auth-002) | IN_PROGRESS | Implementar registro de conta | AUTH-001 |
| [AUTH-003](#auth-003) | BLOCKED | Implementar verificacao de e-mail | AUTH-002 |
| [AUTH-004](#auth-004) | IN_PROGRESS | Implementar login/logout | AUTH-001 |
| [AUTH-005](#auth-005) | IN_PROGRESS | Implementar recuperacao de senha | AUTH-004 |
| [AUTH-006](#auth-006) | BLOCKED | Criar onboarding do tenant_admin | AUTH-003 |
| [AUTH-007](#auth-007) | IN_PROGRESS | Criar convite de membro | AUTH-006 |
| [AUTH-008](#auth-008) | IN_PROGRESS | Implementar RBAC/ABAC v1 | AUTH-001, FND-006 |
| [AUTH-009](#auth-009) | IN_PROGRESS | Criar shell do painel tenant | AUTH-004 |
| [AUTH-010](#auth-010) | IN_PROGRESS | Criar tela de login visual | AUTH-004, AUTH-009 |
| [AUTH-011](#auth-011) | BLOCKED | Testar fluxos E2E | AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, AUTH-007, AUTH-008, AUTH-009, AUTH-010 |
| [AUTH-012](#auth-012) | BLOCKED | Revisao de seguranca do primeiro marco | AUTH-011 |
| [AUTH-013](#auth-013) | BLOCKED | Bootstrap seguro do platform_owner via CLI no VPS | AUTH-001, INF-002 |
| [AUTH-014](#auth-014) | BLOCKED | Login separado do superadmin e do tenant | AUTH-004, AUTH-008 |
| [AUTH-015](#auth-015) | IN_PROGRESS | Proteger API, webhooks e servicos internos | AUTH-004, FND-006 |
| [AUTH-016](#auth-016) | BLOCKED | E2E das superficies de acesso | AUTH-013, AUTH-014, AUTH-015 |
| [TEAM-001](#team-001) | BACKLOG | CRUD de setores | AUTH-008, AUTH-016 |
| [TEAM-002](#team-002) | BACKLOG | CRUD de cargos customizados | AUTH-008, AUTH-016 |
| [TEAM-003](#team-003) | BACKLOG | Gestao de membros | TEAM-002, AUTH-016 |
| [TEAM-004](#team-004) | BACKLOG | Auditoria pesquisavel | AUTH-004, AUTH-016 |
| [TEAM-005](#team-005) | BACKLOG | Contrato de erros e reporte pelo painel tenant | INF-004, AUTH-004, AUTH-016 |
| [TEAM-006](#team-006) | BACKLOG | Dicionario e triagem de erros no superpainel | TEAM-005, AUTH-008, AUTH-016 |
| [CRM-001](#crm-001) | BACKLOG | Contatos e campos customizados | TEAM-001, AUTH-016 |
| [CRM-002](#crm-002) | BACKLOG | Tags e segmentos | CRM-001, AUTH-016 |
| [CRM-003](#crm-003) | BACKLOG | Pipelines configuraveis | CRM-001, AUTH-016 |
| [CRM-004](#crm-004) | BACKLOG | Cards/lista/inbox views | CRM-003, AUTH-016 |
| [CRM-005](#crm-005) | BACKLOG | Conversas e mensagens internas | CRM-001, AUTH-016 |
| [CRM-006](#crm-006) | BACKLOG | Atribuicao a setor/cargo/membro | TEAM-001, AUTH-016 |
| [CRM-007](#crm-007) | BACKLOG | WebSocket rooms | CRM-005, AUTH-016 |
| [MSG-001](#msg-001) | BACKLOG | Outbox e eventos | INF-004, CRM-005, AUTH-016 |
| [MSG-002](#msg-002) | BACKLOG | BullMQ e dead-letter | MSG-001, AUTH-016 |
| [MSG-003](#msg-003) | BACKLOG | Adapter de provider | MSG-001, AUTH-016 |
| [MSG-004](#msg-004) | BACKLOG | QR e conexao | MSG-003, AUTH-016 |
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
| [CAT-001](#cat-001) | BACKLOG | Categorias/produtos/opcoes | CRM-001, AUTH-016 |
| [CAT-002](#cat-002) | BACKLOG | Loja/catalogo publico | CAT-001, AUTH-016 |
| [CAT-003](#cat-003) | BACKLOG | Pedido e automacao | CAT-002, AUTO-001, AUTH-016 |
| [PAGE-001](#page-001) | BACKLOG | Schema de blocos | AUTH-009, CRM-001, AUTH-016 |
| [PAGE-002](#page-002) | BACKLOG | Editor e preview | PAGE-001, AUTH-016 |
| [PAGE-003](#page-003) | BACKLOG | Publicacao, slug e dominio | PAGE-002, AUTH-016 |
| [PAGE-004](#page-004) | BACKLOG | SEO/pixel/consentimento | PAGE-003, AUTH-016 |
| [BILL-001](#bill-001) | BACKLOG | Entitlements e contadores | AUTH-006, AUTH-016 |
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
| [FND-011](#fnd-011) | DONE | Implementar biblioteca UI e catálogo interativo | FND-009 |
| [FND-012](#fnd-012) | DONE | Implementar pacotes compartilhados e testes de contrato | FND-003, FND-006 |
| [FND-013](#fnd-013) | DONE | Documentar reconciliação dos históricos de banco | FND-005 |
| [FND-014](#fnd-014) | IN_PROGRESS | Entregar branch e guia de validação para Antigravity | FND-010, FND-011, FND-012, FND-013 |

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

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 0 - produto e fundacao

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** GitHub confirmou main com protected=false em 2026-09-14; proteção e execução remota do CI pendentes.

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

**Estado:** READY · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="inf-002"></a>
### INF-002 — Validar config por schema

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-003"></a>
### INF-003 — Criar health/readiness endpoints

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-004"></a>
### INF-004 — Criar logger estruturado e request id

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-005"></a>
### INF-005 — Criar pipeline CI inicial

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-006"></a>
### INF-006 — Configurar proxy HTTPS local e contrato de forwarded headers

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-007"></a>
### INF-007 — Bloquear exposicao de arquivos e portas internas

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="inf-008"></a>
### INF-008 — Sanear readiness e mover health para modulo shared

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 1 - ambiente local

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-001"></a>
### AUTH-001 — Modelar users, tenants, memberships e sessions

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Históricos de migration incompatíveis; PostgreSQL real indisponível nesta sessão.

<a id="auth-002"></a>
### AUTH-002 — Implementar registro de conta

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-003"></a>
### AUTH-003 — Implementar verificacao de e-mail

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Verificação de e-mail real não concluída; depende do banco e cadastro.

<a id="auth-004"></a>
### AUTH-004 — Implementar login/logout

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-005"></a>
### AUTH-005 — Implementar recuperacao de senha

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-006"></a>
### AUTH-006 — Criar onboarding do tenant_admin

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Criação atômica de tenant/membership não implementada no cadastro web.

<a id="auth-007"></a>
### AUTH-007 — Criar convite de membro

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-008"></a>
### AUTH-008 — Implementar RBAC/ABAC v1

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-009"></a>
### AUTH-009 — Criar shell do painel tenant

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-010"></a>
### AUTH-010 — Criar tela de login visual

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-011"></a>
### AUTH-011 — Testar fluxos E2E

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

- registro, login, reset, convite e cross-tenant falham corretamente
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Fluxos reais dependem de reconciliação do banco, SMTP e Redis.

<a id="auth-012"></a>
### AUTH-012 — Revisao de seguranca do primeiro marco

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Revisão final depende dos E2E e correção dos blockers.

<a id="auth-013"></a>
### AUTH-013 — Bootstrap seguro do platform_owner via CLI no VPS

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Stdin sem eco, nonce e lock transacional preparados; auditoria durável, lifecycle one-shot do nonce e enrollment MFA ainda pendentes.

<a id="auth-014"></a>
### AUTH-014 — Login separado do superadmin e do tenant

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** MFA/recuperação privilegiada e registro de sessões incompletos.

<a id="auth-015"></a>
### AUTH-015 — Proteger API, webhooks e servicos internos

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Implementação parcial; consultar achados e gates em docs/audit/continuity.md.

<a id="auth-016"></a>
### AUTH-016 — E2E das superficies de acesso

**Estado:** BLOCKED · **Responsável:** Engenharia BipeSend · Milestone 2 - identidade e tenant (primeiro desenvolvimento)

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** E2E entre superfícies ainda depende de AUTH-013/014/015.

<a id="team-001"></a>
### TEAM-001 — CRUD de setores

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-002"></a>
### TEAM-002 — CRUD de cargos customizados

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-003"></a>
### TEAM-003 — Gestao de membros

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-004"></a>
### TEAM-004 — Auditoria pesquisavel

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-005"></a>
### TEAM-005 — Contrato de erros e reporte pelo painel tenant

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="team-006"></a>
### TEAM-006 — Dicionario e triagem de erros no superpainel

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 3 - equipe, setores e auditoria

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-001"></a>
### CRM-001 — Contatos e campos customizados

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Contatos e campos customizados. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-001, AUTH-016

**Passos:**

1. Modelar contatos/campos customizados com tenant, índices e schema limitado.
2. Conectar CRUD/importação ao backend; tratar duplicata, CSV injection, tamanho e rollback.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- CRUD, importacao segura e tenant isolation
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-002"></a>
### CRM-002 — Tags e segmentos

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-003"></a>
### CRM-003 — Pipelines configuraveis

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-004"></a>
### CRM-004 — Cards/lista/inbox views

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Cards/lista/inbox views. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-003, AUTH-016

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-005"></a>
### CRM-005 — Conversas e mensagens internas

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Conversas e mensagens internas. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-001, AUTH-016

**Passos:**

1. Modelar conversas/mensagens com direção, estado, paginação e retenção.
2. Conectar inbox de três painéis no desktop e lista→conversa→contexto no mobile; preservar rascunho.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- historico paginado e auditoria
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-006"></a>
### CRM-006 — Atribuicao a setor/cargo/membro

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** Atribuicao a setor/cargo/membro. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** TEAM-001, AUTH-016

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="crm-007"></a>
### CRM-007 — WebSocket rooms

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 4 - CRM e inbox

**Objetivo:** WebSocket rooms. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-005, AUTH-016

**Passos:**

1. Autenticar handshake e autorizar rooms por tenant/recurso.
2. Revalidar após reconexão/revogação e fazer catch-up paginado; testar inscrição em sala alheia.

**Áreas de código:** `apps/api/src/modules/05-crm`, `apps/tenant-web/src/app/(dashboard)`, `packages/contracts`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- usuario so recebe eventos autorizados
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-001"></a>
### MSG-001 — Outbox e eventos

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-002"></a>
### MSG-002 — BullMQ e dead-letter

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-003"></a>
### MSG-003 — Adapter de provider

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

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

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="msg-004"></a>
### MSG-004 — QR e conexao

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 5 - filas, WhatsApp e automacoes

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

**Evidências:** Nenhuma execução registrada.

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

<a id="cat-001"></a>
### CAT-001 — Categorias/produtos/opcoes

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Categorias/produtos/opcoes. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CRM-001, AUTH-016

**Passos:**

1. Criar categorias/produtos/opções com tenant, estoque/preço quando aplicáveis.
2. Validar mídia privada/pública, alt text, moeda e limites por plano.

**Áreas de código:** `apps/api/src/modules/10-catalog`, `apps/tenant-web/src/features`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- imagens e limites por plano
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="cat-002"></a>
### CAT-002 — Loja/catalogo publico

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Loja/catalogo publico. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CAT-001, AUTH-016

**Passos:**

1. Publicar catálogo com dados explicitamente públicos e escopo de tenant.
2. Aplicar canonical/sitemap/metadata/robots, acessibilidade e cache sem dado privado.

**Áreas de código:** `apps/api/src/modules/10-catalog`, `apps/tenant-web/src/features`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- SEO, acessibilidade e cache seguro
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="cat-003"></a>
### CAT-003 — Pedido e automacao

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Pedido e automacao. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** CAT-002, AUTO-001, AUTH-016

**Passos:**

1. Criar pedido com estados validados e idempotência de criação.
2. Emitir eventos após commit; automação não confirma pagamento; testar duplicata e concorrência.

**Áreas de código:** `apps/api/src/modules/10-catalog`, `apps/tenant-web/src/features`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- estado e idempotencia
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="page-001"></a>
### PAGE-001 — Schema de blocos

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Schema de blocos. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-009, CRM-001, AUTH-016

**Passos:**

1. Definir blocos versionados com props allowlisted e sem JS arbitrário.
2. Validar rich text/URLs e política de mídia, sem iframe/script livre.

**Áreas de código:** `apps/api/src/modules/11-pages`, `apps/tenant-web/src/features`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- sem HTML/JS arbitrario
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="page-002"></a>
### PAGE-002 — Editor e preview

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Editor e preview. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** PAGE-001, AUTH-016

**Passos:**

1. Criar editor com undo/redo, teclado e preview isolado.
2. Autosave com revisão otimista e proteção de concorrência; distinguir rascunho de publicado.

**Áreas de código:** `apps/api/src/modules/11-pages`, `apps/tenant-web/src/features`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- teclado, undo e autosave seguro
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="page-003"></a>
### PAGE-003 — Publicacao, slug e dominio

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** Publicacao, slug e dominio. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** PAGE-002, AUTH-016

**Passos:**

1. Publicar revisão imutável, slug/domínio verificado e TLS.
2. Permitir rollback, validar colisão/tomada de domínio e invalidar cache por versão.

**Áreas de código:** `apps/api/src/modules/11-pages`, `apps/tenant-web/src/features`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- preview, rollback e TLS
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="page-004"></a>
### PAGE-004 — SEO/pixel/consentimento

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 7 - catalogo e paginas

**Objetivo:** SEO/pixel/consentimento. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** PAGE-003, AUTH-016

**Passos:**

1. Gerar metadata/canonical/sitemap e consentimento conforme finalidade.
2. Permitir pixels somente allowlist e após estado de consentimento aplicável; painel permanece noindex.

**Áreas de código:** `apps/api/src/modules/11-pages`, `apps/tenant-web/src/features`, `packages/ui`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- tags allowlist e noindex no painel
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

**Evidências:** Nenhuma execução registrada.

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="bill-001"></a>
### BILL-001 — Entitlements e contadores

**Estado:** BACKLOG · **Responsável:** Engenharia BipeSend · Milestone 8 - billing e gateways

**Objetivo:** Entitlements e contadores. Entregar comportamento verificável dentro do escopo do card.

**Dependências:** AUTH-006, AUTH-016

**Passos:**

1. Modelar entitlement/cota por plano no backend com consumo atômico.
2. Testar esgotamento, concorrência, reset de período e UI explicando disponibilidade real.

**Áreas de código:** `apps/api/src/modules/12-billing`, `apps/superadmin-web`, `packages/contracts`.

**Testes a executar:**

- Executar os testes específicos descritos nos passos acima, incluindo falha/recuperação.
- Rodar typecheck, testes e build dos apps/pacotes alterados; documentar comando e resultado.

**Aceite:**

- backend decide acesso e limite
- Todos os passos deste card executados, com comportamento e cenários negativos documentados quando aplicáveis.

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

<a id="fnd-011"></a>
### FND-011 — Implementar biblioteca UI e catálogo interativo

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - implementação auditada

**Objetivo:** Implementar biblioteca UI e catálogo interativo

**Dependências:** FND-009

**Passos:**

1. Criar componentes base, overlays, tabelas, campos, estados e tokens light/dark.
2. Validar teclado, foco, contraste automático e mobile no catálogo sem dados reais.

**Áreas de código:** `packages/ui`, `apps/tenant-web/src/features/design-system`.

**Testes a executar:**

- pnpm --filter @bipesend/ui test
- pnpm --filter @bipesend/ui lint
- pnpm ui:smoke

**Aceite:**

- Biblioteca importável e catálogo acessível em desenvolvimento, sem simular backend.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md), [docs/audit/evidence/ui-report.json](../docs/audit/evidence/ui-report.json)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-012"></a>
### FND-012 — Implementar pacotes compartilhados e testes de contrato

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - implementação auditada

**Objetivo:** Implementar pacotes compartilhados e testes de contrato

**Dependências:** FND-003, FND-006

**Passos:**

1. Construir contracts/config/security/events/auth-policies com limites server/client explícitos.
2. Testar rejeição de escopo, validação, adulteração, rate limit e documentar adapters ainda necessários.

**Áreas de código:** `packages`.

**Testes a executar:**

- pnpm foundation:test
- pnpm --filter @bipesend/api test:unit

**Aceite:**

- Pacotes buildam e testes de unidade passam; limitações de integração estão explícitas.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-013"></a>
### FND-013 — Documentar reconciliação dos históricos de banco

**Estado:** DONE · **Responsável:** Engenharia BipeSend · Milestone 0 - implementação auditada

**Objetivo:** Documentar reconciliação dos históricos de banco

**Dependências:** FND-005

**Passos:**

1. Comparar schema e ambos os históricos sem alterar migrations aplicadas.
2. Entregar inventário somente leitura, plano por origem, testes e rollback em clone.

**Áreas de código:** `packages/db/audit`, `docs/architecture/database-reconciliation.md`.

**Testes a executar:**

- Revisar SQL de inventário e matriz de diferenças.

**Aceite:**

- Runbook pronto; aplicação/integração permanece em AUTH-001.

**Evidências:** [docs/architecture/database-reconciliation.md](../docs/architecture/database-reconciliation.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.

<a id="fnd-014"></a>
### FND-014 — Entregar branch e guia de validação para Antigravity

**Estado:** IN_PROGRESS · **Responsável:** Engenharia BipeSend · Milestone 0 - implementação auditada

**Objetivo:** Entregar branch e guia de validação para Antigravity

**Dependências:** FND-010, FND-011, FND-012, FND-013

**Passos:**

1. Rodar gates da fundação e builds; registrar evidência e falhas de infraestrutura.
2. Publicar branch sem merge e entregar comandos de checkout e próximo card.

**Áreas de código:** `docs/ANTIGRAVITY_HANDOFF.md`, `docs/audit/validation.md`.

**Testes a executar:**

- pnpm foundation:check
- pnpm ui:smoke
- Build tenant-web/superadmin-web/API

**Aceite:**

- Branch remota disponível; relatório diferencia checks passados e blockers.

**Evidências:** [docs/audit/validation.md](../docs/audit/validation.md)

**Bloqueios:** Nenhum impedimento adicional registrado; respeitar dependências e estado.
