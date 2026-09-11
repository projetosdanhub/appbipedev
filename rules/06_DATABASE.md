# Banco de dados

## Convencoes

- PostgreSQL como fonte de verdade.
- IDs UUID ou UUIDv7 quando suportado; timestamps em UTC.
- tabelas e colunas em `snake_case`; codigo TypeScript em `camelCase`.
- toda tabela tenant-owned: `id`, `tenant_id`, `created_at`, `updated_at`, e quando necessario `deleted_at`.
- dinheiro em menor unidade inteira + moeda ISO; nunca float.
- status usando enum de dominio ou tabela de referencia, nao strings livres em regras criticas.

## RLS

Cada migration tenant-owned deve habilitar RLS, criar policy de `select/insert/update/delete` e garantir que o contexto de tenant seja aplicado na transacao. O usuario de aplicacao nao deve ser owner das tabelas. Policies inexistentes significam deny-by-default.

## Integridade

Unique e foreign keys devem incluir tenant quando o relacionamento for interno ao tenant. Indices comecam por `tenant_id` e pelos filtros mais frequentes. Soft delete nao substitui foreign key nem auditoria.

## Migrations

Uma migration por mudanca coerente, reversivel quando possivel, com dados de backfill separado de DDL pesada. Nao editar migration aplicada. Seed local nao pode conter segredos ou PII real.

## Auditoria

`audit_logs` registra actor, tenant, acao, recurso, resultado, request_id, motivo quando exigido e diff minimizado. Nunca gravar senha, token completo ou conteudo sensivel sem necessidade aprovada.

## Entidades iniciais

`tenants`, `users`, `memberships`, `roles`, `permissions`, `role_permissions`, `sessions`, `email_verifications`, `password_resets`, `audit_logs`, `plans`, `subscriptions`, `entitlements`.
