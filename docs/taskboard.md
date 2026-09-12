# Taskboard BipeSend

Versao: 0.2.0  
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
| FND-007 | READY | Criar mapa modular e regras anti-monolito | FND-003 | dependencias e nomes canonicos documentados |
| FND-008 | READY | Gerar skeleton de modulos sem codigo de negocio | FND-007 | pastas numeradas, READMEs e checks de arquitetura |
| FND-009 | DONE | Consolidar contrato visual, motion e atualizacao de dados | FND-001, FND-007 | tipografia, estados, refresh, frescor e versao documentados |
| FND-010 | DONE | Auditar fundacao e transformar taskboard em guia executavel | FND-009 | auditoria versionada, riscos classificados, cards com arquivos/testes/aceite e regras atualizadas |

## Milestone 1 - ambiente local

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| INF-001 | READY | Subir PostgreSQL/pgvector, Redis, Mailpit e MinIO | FND-003 | `docker compose up -d` saudavel |
| INF-002 | READY | Validar config por schema | INF-001 | boot falha com variavel invalida/ausente critica |
| INF-003 | READY | Criar health/readiness endpoints | INF-001 | API e dependencias reportam estado sem segredos |
| INF-004 | READY | Criar logger estruturado e request id | INF-003 | logs correlacionam uma requisicao ponta a ponta |
| INF-005 | READY | Criar pipeline CI inicial | FND-004 | checks de lint, typecheck, teste e secret scan |
| INF-006 | READY | Configurar proxy HTTPS local e contrato de forwarded headers | INF-003 | hosts locais HTTPS, redirect controlado e proxy confiavel testados |
| INF-007 | READY | Bloquear exposicao de arquivos e portas internas | INF-001, INF-006 | `pnpm security:check` passa; dotfiles, secrets, backups, listagem e servicos internos bloqueados |
| INF-008 | READY | Sanear readiness e mover health para modulo shared | INF-003, FND-008 | nenhum erro bruto, contrato versionado, testes e acesso interno documentado |

## Milestone 2 - identidade e tenant (primeiro desenvolvimento)

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| AUTH-001 | DONE | Modelar users, tenants, memberships e sessions | INF-001, FND-006 | migration, RLS e testes de isolamento |
| AUTH-002 | DONE | Implementar registro de conta | AUTH-001 | email valido, senha Argon2id, tenant pendente |
| AUTH-003 | DONE | Implementar verificacao de e-mail | AUTH-002 | token unico, expiracao e reenvio limitado |
| AUTH-004 | DONE | Implementar login/logout | AUTH-001 | cookie seguro, sessao persistida, logout invalida |
| AUTH-005 | DONE | Implementar recuperacao de senha | AUTH-004 | token de uso unico e logs sem token |
| AUTH-006 | DONE | Criar onboarding do tenant_admin | AUTH-003 | tenant, membership e slug criados atomicamente |
| AUTH-007 | DONE | Criar convite de membro | AUTH-006 | convite escopado ao tenant, expiracao e aceite auditado |
| AUTH-008 | DONE | Implementar RBAC/ABAC v1 | AUTH-001, FND-006 | manager nao eleva/remover admin |
| AUTH-009 | DONE | Criar shell do painel tenant | AUTH-004 | sidebar, topbar, rotas protegidas e mobile 360 px |
| AUTH-010 | DONE | Criar tela de login visual | AUTH-004, AUTH-009 | estados loading/erro/sucesso, acessibilidade e SEO noindex |
| AUTH-011 | DONE | Testar fluxos E2E | AUTH-002..AUTH-010 | registro, login, reset, convite e cross-tenant falham corretamente |
| AUTH-012 | DONE | Revisao de seguranca do primeiro marco | AUTH-011 | checklist sem blocker critico |
| AUTH-013 | DONE | Bootstrap seguro do platform_owner via CLI no VPS | AUTH-001, INF-002 | comando one-shot, stdin seguro, Argon2id, advisory lock, MFA pendente e auditoria |
| AUTH-014 | DONE | Login separado do superadmin e do tenant | AUTH-004, AUTH-008 | cookies, audiences, rotas, rate limit, recovery e MFA sem compartilhamento |
| AUTH-015 | DONE | Proteger API, webhooks e servicos internos | AUTH-004, MSG-005 | API key escopada, HMAC/timestamp/replay, mTLS/JWT interno e health seguro |
| AUTH-016 | DONE | E2E das superficies de acesso | AUTH-013..AUTH-015 | tenant, superadmin, API, hooks, revogacao, CSRF e escalada falham corretamente |

## Milestone 3 - equipe, setores e auditoria

| ID | Estado | Tarefa | Dependencias | Aceite |
| --- | --- | --- | --- | --- |
| TEAM-001 | BACKLOG | CRUD de setores | AUTH-008 | acesso por setor testado |
| TEAM-002 | BACKLOG | CRUD de cargos customizados | AUTH-008 | permissao nao pode exceder criador |
| TEAM-003 | BACKLOG | Gestao de membros | TEAM-002 | suspender, reativar, transferir e auditar |
| TEAM-004 | BACKLOG | Auditoria pesquisavel | AUTH-004 | filtros por actor, acao, recurso e periodo |
| TEAM-005 | BACKLOG | Contrato de erros e reporte pelo painel tenant | INF-004, AUTH-004 | codigo BipeSend, request id, redacao e protocolo de reporte |
| TEAM-006 | BACKLOG | Dicionario e triagem de erros no superpainel | TEAM-005, AUTH-008 | buscar, vincular, promover, resolver e auditar |

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
| OPS-004 | BACKLOG | Registro e verificacao de saude das integracoes | INF-004 | estados, timeout, backoff e resumo sem segredos |
| OPS-005 | BACKLOG | Indicadores de API e integracao no painel | OPS-004, AUTH-009 | status textual, ponto acessivel, ultima verificacao e reduced motion |
| MOB-001 | BACKLOG | Especificar app nativo | OPS-003 | decisoes de escopo e API mobile |
| MOB-002 | BACKLOG | Implementar mobile | MOB-001 | paridade dos fluxos prioritarios |

## Sprint 1 recomendado

1. FND-007 e FND-008.
2. INF-001, INF-002, INF-003, INF-006 e INF-007.
3. INF-004 e INF-005.
4. AUTH-001 e AUTH-004.
5. AUTH-002, AUTH-003 e AUTH-005.
6. AUTH-006, AUTH-008 e AUTH-009.
7. AUTH-010, AUTH-011 e AUTH-012.

O Sprint 1 termina com um login funcional e seguro, mas ainda sem WhatsApp, IA ou pagamentos reais.


## Como o Gemini executa uma tarefa

O taskboard e um contrato de execucao, nao apenas uma lista. Ao receber
!construibase <ID>, o agente deve:

1. ler rules/00_MASTER.md e todas as rules na ordem;
2. ler docs/taskboard.md, docs/decisions.md, docs/module-map.md e os contratos da superficie;
3. localizar o card do ID e repetir objetivo, dependencias e criterio de aceite;
4. declarar arquivos a criar/alterar, migration, permissao, evento, risco e testes;
5. parar se a dependencia nao estiver DONE ou se houver conflito de regra;
6. implementar somente a menor fatia vertical do card;
7. rodar os checks do card, atualizar taskboard/decisions e relatar bloqueios;
8. nunca criar mock que pareca funcional sem marcar explicitamente como prototipo.

Saida obrigatoria de cada tarefa:

- resumo do que mudou;
- arquivos criados/alterados e por que;
- tenant/superficie/permissao afetados;
- migrations e rollback;
- eventos, filas e integrações;
- testes executados e resultado;
- riscos pendentes;
- proximo item READY.

## Resumo didatico dos dominios

| Grupo | O que construir | Regra de inicio |
| --- | --- | --- |
| FND | regras, nomes, arquitetura, contratos e skeleton | nenhuma feature antes da fundacao |
| INF | Docker, env, health, HTTPS, proxy, logs e CI | portas internas e segredos protegidos |
| AUTH | usuarios, sessoes, tenant, cargos, logins e bootstrap | isolamento e autorizacao antes do visual |
| TEAM | setores, cargos customizados, membros e auditoria | nunca elevar ou remover tenant_admin |
| CRM | contatos, tags, pipelines, inbox e atribuicao | toda query com tenant context |
| MSG/AUTO | provider WhatsApp, QR, webhooks, filas e automacoes | adapter, idempotencia, opt-in e limites |
| AI | upload, RAG, LLM, MCP e copiloto | read-only, allowlist e tenant assinado |
| CAT/PAGE | catalogo, ecommerce, editor, dominios e SEO | schema de blocos sem JS arbitrario |
| BILL | planos, entitlements, Stripe e Mercado Pago | webhook confirmado; redirect nao confirma |
| OPS/MOB | backup, alertas, pentest e mobile | somente apos fluxos críticos estaveis |

## Cards operacionais do primeiro ciclo

### INF-008 — readiness seguro

- Objetivo: manter liveness simples e readiness sem vazamento de DSN, stack ou provider.
- Arquivos esperados: modulo 00-shared de health, contrato em packages/contracts e testes de API.
- Nao fazer: expor mensagem de exception, liberar diagnostico detalhado no frontend ou criar polling global.
- Testes: Postgres/Redis ok, timeout, senha errada, resposta sem DSN/stack, status 200/503.
- Aceite: health/ready documentados, sanitizados e executados pelo proxy/conteiners.

### AUTH-001 — modelo de identidade e tenant

- Entidades: users, tenants, memberships, roles, permissions, role_permissions, sessions, verifications e password_resets.
- Arquivos esperados: migration, repositorios, policies, RLS, contratos, factories de teste.
- Seguranca: tenant_id obrigatorio nas tabelas tenant-owned, FORCE RLS, UUID, hashes e auditoria.
- Testes: cross-tenant, membership suspensa, sessão revogada e rollback da migration.
- Aceite: migration reversivel/documentada e isolamento demonstrado por teste.

### AUTH-009/AUTH-010 — shell e login do tenant

- Superficie: app.bipesend.com.br; SEO noindex; responsivo desde 360 px.
- Telas: login, cadastro, verificacao de e-mail, recuperar senha, redefinir senha e estados loading/error/success.
- Arquivos esperados: app rotas finas, feature identity, contratos API, componentes UI compartilhados e testes E2E/a11y.
- Seguranca: cookie server-side, CSRF, rate limit, mensagens genericas, sem token no localStorage.
- Aceite: fluxo real conectado à API, teclado, foco, reduced motion e cross-tenant negativos.

### AUTH-013 — bootstrap do platform_owner

- Superficie: somente CLI no VPS; nenhum endpoint, seed ou formulario.
- Arquivos esperados: use case em 01-identity, adapter de transacao/advisory lock, CLI em 14-platform, auditoria e testes.
- Entrada: email normalizado e senha por stdin; exigir confirmacao explicita e janela/nonce de secret manager.
- Armazenamento: hash Argon2id; nunca cifra reversivel de senha; MFA fica pendente ate registro seguro.
- Testes: primeira execucao, segunda execução, concorrencia, stdin ausente, nonce invalido, logs sem segredo.
- Aceite: exatamente um owner, execução auditada e modo bootstrap fechado após sucesso.

### AUTH-014 — login superadmin e tenant

- Superadmin: admin.bipesend.com.br, cookie/audience/rotas separados, MFA/WebAuthn obrigatório.
- Tenant: app.bipesend.com.br, membership e permissões do tenant.
- Arquivos esperados: features de cada frontend, policies, sessões, recovery, controllers e testes.
- Não fazer: link cruzado, flag de admin enviada pelo cliente, reutilização de cookie ou painel mock.
- Aceite: login, logout, recovery, MFA, revogacao e redirecionamentos testados por superfície.

### AUTH-015 — API, hooks e serviços internos

- API: sessão/API key escopada, tenant context e permissão; sem página de login.
- Hooks: assinatura, raw body quando exigido, timestamp, replay protection, idempotencia e fila.
- Interno: mTLS/JWT com audience, scopes, expiração e rotação; sem acesso total da IA.
- Testes: assinatura invalida, replay, duplicata, API key revogada, cross-tenant e token interno vencido.
- Aceite: nenhuma superficie maquina-a-maquina depende de cookie de navegador.

### TEAM-005/TEAM-006 — erros e auditoria

- Tenant reporta erro com requestId, rota, módulo e contexto redigido.
- Superadmin busca por codigo, fingerprint, tenant, severidade, estado e periodo.
- Estados: open, investigating, resolved, ignored.
- Aceite: PII/segredo redigidos, auditoria completa e codigo BPS separado do status HTTP.

### OPS-004/OPS-005 — saúde de integrações

- Providers: Stripe, Mercado Pago, WhatsApp e IA via adapter.
- Estados: connected, degraded, disconnected, misconfigured, not_entitled, disabled, unknown.
- Frontend mostra texto, icone, ultima verificacao e reduced motion; nunca apenas bolinha.
- Aceite: tenant vê apenas o proprio escopo; superadmin vê agregado conforme permissao; nenhum token retorna.

## Ordem de inicio após a fundacao

1. INF-008 e INF-004.
2. AUTH-001.
3. AUTH-002, AUTH-003, AUTH-004 e AUTH-005.
4. AUTH-006, AUTH-007 e AUTH-008.
5. AUTH-009 e AUTH-010.
6. AUTH-011 e AUTH-012.
7. AUTH-013, AUTH-014, AUTH-015 e AUTH-016.
8. TEAM-005/TEAM-006 e OPS-004/OPS-005.

Nao iniciar CRM, WhatsApp, IA, catalogo, paginas ou billing antes de AUTH-016
passar.
