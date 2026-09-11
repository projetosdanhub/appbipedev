# Taskboard NexoFlow

Versao: 0.1.0  
Legenda: `BACKLOG`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`

## Regra de uso

Uma tarefa so pode entrar em `DONE` com criterio de aceite verificado, testes correspondentes e regras/documentacao atualizadas. O taskboard e ordenado por dependencias; nao iniciar WhatsApp, IA ou billing antes da fundacao de identidade e tenant.

## Milestone 0 - produto e fundacao

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| FND-001 | DONE | Criar regras e convencoes | - | pasta `rules/` versionada e lida pelo bootstrap |
| FND-002 | DONE | Definir nome de trabalho e dominios candidatos | - | ADR registrado; disponibilidade pendente |
| FND-003 | DONE | Definir stack e monorepo inicial | - | README, package manager e workspaces |
| FND-004 | READY | Criar repositorio Git e branch protection | FND-003 | PR exige lint, typecheck e testes |
| FND-005 | READY | Definir threat model inicial | FND-001 | riscos, controles e responsaveis registrados |
| FND-006 | READY | Criar matriz de permissoes v1 | FND-005 | todas as telas do MVP mapeadas |

## Milestone 1 - ambiente local

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| INF-001 | DONE | Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO | FND-003 | `docker compose up -d` saudavel |
| INF-002 | DONE | Validar config por schema | INF-001 | boot falha com variavel invalida/ausente critica |
| INF-003 | DONE | Criar health/readiness endpoints | INF-001 | API e dependencias reportam estado sem segredos |
| INF-004 | READY | Criar logger estruturado e request id | INF-003 | logs correlacionam uma requisicao ponta a ponta |
| INF-005 | READY | Criar pipeline CI inicial | FND-004 | checks de lint, typecheck, teste e secret scan |

## Milestone 2 - identidade e tenant (primeiro desenvolvimento)

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| AUTH-001 | READY | Modelar users, tenants, memberships e sessions | INF-001, FND-006 | migration, RLS e testes de isolamento |
| AUTH-002 | READY | Implementar registro de conta | AUTH-001 | email valido, senha Argon2id, tenant pendente |
| AUTH-003 | READY | Implementar verificacao de e-mail | AUTH-002 | token unico, expiracao e reenvio limitado |
| AUTH-004 | READY | Implementar login/logout | AUTH-001 | cookie seguro, sessao persistida, logout invalida |
| AUTH-005 | READY | Implementar recuperacao de senha | AUTH-004 | token de uso unico e logs sem token |
| AUTH-006 | READY | Criar onboarding do tenant_admin | AUTH-003 | tenant, membership e slug criados atomicamente |
| AUTH-007 | READY | Criar convite de membro | AUTH-006 | convite escopado ao tenant, expiracao e aceite auditado |
| AUTH-008 | READY | Implementar RBAC/ABAC v1 | AUTH-001, FND-006 | manager nao eleva/remover admin |
| AUTH-009 | READY | Criar shell do painel tenant | AUTH-004 | sidebar, topbar, rotas protegidas e mobile 360 px |
| AUTH-010 | READY | Criar tela de login visual | AUTH-004, AUTH-009 | estados loading/erro/sucesso, acessibilidade e SEO noindex |
| AUTH-011 | READY | Testar fluxos E2E | AUTH-002..AUTH-010 | registro, login, reset, convite e cross-tenant falham corretamente |
| AUTH-012 | READY | Revisao de seguranca do primeiro marco | AUTH-011 | checklist sem blocker critico |

## Milestone 3 - equipe, setores e auditoria

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| TEAM-001 | BACKLOG | CRUD de setores | AUTH-008 | acesso por setor testado |
| TEAM-002 | BACKLOG | CRUD de cargos customizados | AUTH-008 | permissao nao pode exceder criador |
| TEAM-003 | BACKLOG | Gestao de membros | TEAM-002 | suspender, reativar, transferir e auditar |
| TEAM-004 | BACKLOG | Auditoria pesquisavel | AUTH-004 | filtros por actor, acao, recurso e periodo |

## Milestone 4 - CRM e inbox

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| CRM-001 | BACKLOG | Contatos e campos customizados | TEAM-001 | CRUD, importacao segura e tenant isolation |
| CRM-002 | BACKLOG | Tags e segmentos | CRM-001 | filtros e limites por plano |
| CRM-003 | BACKLOG | Pipelines configuraveis | CRM-001 | etapas, ordem, cor e regras validas |
| CRM-004 | BACKLOG | Cards/lista/inbox views | CRM-003 | alternativa acessivel ao drag-and-drop |
| CRM-005 | BACKLOG | Conversas e mensagens internas | CRM-001 | historico paginado e auditoria |
| CRM-006 | BACKLOG | Atribuicao a setor/cargo/membro | TEAM-001 | autorizacao e notificacao em tempo real |
| CRM-007 | BACKLOG | WebSocket rooms | CRM-005 | usuario so recebe eventos autorizados |

## Milestone 5 - filas, WhatsApp e automacoes

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| MSG-001 | BACKLOG | Outbox e eventos | INF-004, CRM-005 | sem evento fantasma apos rollback |
| MSG-002 | BACKLOG | BullMQ e dead-letter | MSG-001 | retry/backoff/timeout/idempotencia |
| MSG-003 | BACKLOG | Adapter de provider | MSG-001 | provider fake coberto por contrato |
| MSG-004 | BACKLOG | QR e conexao | MSG-003 | QR expirado e status auditado |
| MSG-005 | BACKLOG | Webhook normalizado | MSG-003 | assinatura e duplicatas tratadas |
| AUTO-001 | BACKLOG | Gatilhos e condicoes | CRM-003, MSG-001 | DSL validada, sem execucao arbitraria |
| AUTO-002 | BACKLOG | Acoes e agendamento | MSG-002 | timezone, cancelamento e limite |
| AUTO-003 | BACKLOG | Campanhas com opt-out | MSG-004 | supressao e rate limit obrigatorios |

## Milestone 6 - IA, conhecimento e MCP

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| AI-001 | BACKLOG | Upload em quarentena | INF-001, TEAM-003 | MIME, tamanho, scan e storage privado |
| AI-002 | BACKLOG | Pipeline de extracao/chunks | AI-001 | documento versionado e reprocessavel |
| AI-003 | BACKLOG | Embeddings + pgvector | AI-002 | retrieval filtra tenant e permissao |
| AI-004 | BACKLOG | Provider adapter de LLM | AI-003 | chave server-only, limite de custo |
| AI-005 | BACKLOG | Copiloto read-only | AI-004, CRM-005 | nao envia nem altera sem aprovacao |
| AI-006 | BACKLOG | Gateway MCP interno | AI-005 | tools allowlist, schema, tenant e auditoria |
| AI-007 | BACKLOG | Testes de prompt injection | AI-005 | ataques conhecidos nao elevam privilegio |

## Milestone 7 - catalogo e paginas

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| CAT-001 | BACKLOG | Categorias/produtos/opcoes | CRM-001 | imagens e limites por plano |
| CAT-002 | BACKLOG | Loja/catalogo publico | CAT-001 | SEO, acessibilidade e cache seguro |
| CAT-003 | BACKLOG | Pedido e automacao | CAT-002, AUTO-001 | estado e idempotencia |
| PAGE-001 | BACKLOG | Schema de blocos | AUTH-009, CRM-001 | sem HTML/JS arbitrario |
| PAGE-002 | BACKLOG | Editor e preview | PAGE-001 | teclado, undo e autosave seguro |
| PAGE-003 | BACKLOG | Publicacao, slug e dominio | PAGE-002 | preview, rollback e TLS |
| PAGE-004 | BACKLOG | SEO/pixel/consentimento | PAGE-003 | tags allowlist e noindex no painel |

## Milestone 8 - billing e gateways

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| BILL-001 | BACKLOG | Entitlements e contadores | AUTH-006 | backend decide acesso e limite |
| BILL-002 | BACKLOG | CRUD de planos superadmin | BILL-001 | custom plan auditado |
| BILL-003 | BACKLOG | Stripe Connect sandbox | BILL-002 | OAuth, state, tokens criptografados e webhook |
| BILL-004 | BACKLOG | Mercado Pago OAuth sandbox | BILL-002 | mesmo contrato e idempotencia |
| BILL-005 | BACKLOG | Upgrade/downgrade | BILL-003, BILL-004 | downgrade nao apaga dados |

## Milestone 9 - operacao e app mobile

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| OPS-001 | BACKLOG | Backup e restore drill | INF-001 | restore documentado e medido |
| OPS-002 | BACKLOG | Observabilidade e alertas | INF-004 | SLOs e runbooks |
| OPS-003 | BACKLOG | Pentest e revisao externa | todos | sem blocker critico |
| MOB-001 | BACKLOG | Especificar app nativo | OPS-003 | decisoes de escopo e API mobile |
| MOB-002 | BACKLOG | Implementar mobile | MOB-001 | paridade dos fluxos prioritarios |

## Sprint 1 recomendado

1. INF-001, INF-002 e INF-003.
2. AUTH-001 e AUTH-004.
3. AUTH-002, AUTH-003 e AUTH-005.
4. AUTH-006, AUTH-008 e AUTH-009.
5. AUTH-010, AUTH-011 e AUTH-012.

O Sprint 1 termina com um login funcional e seguro, mas ainda sem WhatsApp, IA ou pagamentos reais.
