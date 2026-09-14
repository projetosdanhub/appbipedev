# Banco de dados

## 1. Fonte de verdade

PostgreSQL é a fonte de verdade de negócio. Redis/cache/fila não substituem persistência transacional.

## 2. Modelagem

- IDs estáveis e não previsíveis quando expostos;
- `tenant_id` em entidades do tenant;
- timestamps em UTC;
- soft delete somente quando houver necessidade real;
- constraints no banco para invariantes importantes;
- enums de domínio controlados;
- evitar JSON sem schema para dados centrais.

## 3. Migrações

- migration versionada e revisável;
- expand/contract para mudanças incompatíveis;
- backfill separado quando pesado;
- índice criado conscientemente;
- rollback/documentação quando rollback automático não for seguro;
- migration nunca inclui credencial inicial.

## 4. Queries

- parametrizadas;
- paginação;
- índices guiados por uso;
- proibir N+1 conhecido;
- transação para alterações relacionadas;
- locks/advisory locks quando concorrência exigir;
- idempotência protegida por constraint quando possível.

## 5. Tenant

Toda query de dado tenant-aware deve receber contexto confiável de tenant. Testes devem tentar acesso cruzado com IDs válidos.

## 6. Dados sensíveis

Senha é hash; segredo recuperável usa envelope encryption; PII segue minimização e retenção. Não armazenar payload bruto de provider sem propósito e retenção definidos.

## 7. Auditoria

Eventos de auditoria devem ser resistentes a alteração comum, conter ator, ação, alvo, tenant, horário, resultado e metadados mínimos.

## Revisão de fundação — 2026-09-13

Não rodar os dois migradores sobre o mesmo banco. Drift foi encontrado entre node-pg-migrate, migration Prisma e schema atual. Seguir packages/db/audit/inventory.sql e docs/architecture/database-reconciliation.md antes de deploy. RLS precisa incluir tabelas indiretas e runtime sem owner/BYPASSRLS.
