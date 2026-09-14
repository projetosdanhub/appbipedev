# @bipesend/db

PrismaClient compartilhado e `withTenantTransaction(client,context,work)`. Uso exclusivamente no servidor. O banco acessível pelo projeto **não foi conectado nem migrado nesta auditoria**.

## Bloqueio de migração identificado

Existem dois históricos incompatíveis: node-pg-migrate em apps/api e Prisma em prisma/migrations. O schema.prisma atual usa UUID/password_hash/token_hash e mais tabelas; a migration Prisma histórica cria TEXT/password/session_token e não cria tenants/memberships. Não executar prisma db push, reset, resolve ou ambos os migradores para encobrir a divergência.

O runbook completo e a matriz de diferenças estão em `docs/architecture/database-reconciliation.md`. `audit/inventory.sql` lê apenas catálogo, constraints, policies, roles e presença de históricos, sem dados de clientes ou segredos. Execute primeiro em cópia/ambiente autorizado, guarde saída minimizada e escolha plano conforme estado real.

## Contexto de tenant

```ts
import { withTenantTransaction } from '@bipesend/db';
// session + membership atual + assertPermission ocorreram antes.
await withTenantTransaction(prisma, context, async tx => {
  // Todas as consultas tenant-owned usam tx; nunca prisma global aqui.
  return tx.membership.findMany({ where: { tenantId: context.tenantId } });
});
```

O helper valida forma, abre uma transação e faz set_config(...,true), ligado à mesma conexão. RLS real depende de ENABLE/FORCE, USING/WITH CHECK, tabelas indiretas, índices compostos e runtime sem superuser/BYPASSRLS/owner. Isso não implementa autorização por si só.

Users/sessions são globais de identidade; precisam de acesso por subject e finalidade, não de contexto de tenant falso. Role_permissions precisa proteção via role pertencente ao tenant; memberships/invitations precisam tratamento de descoberta por capability antes de escolha de tenant, sem liberar consulta global arbitrária.

## Comandos

- generate: gera cliente a partir do schema, sem aplicar SQL.
- db:validate: valida sintaxe do schema; não compara com banco.
- db:diff: requer `--shadow-database-url` para comparar histórico em um banco descartável autorizado.
- db:migrate: deploy Prisma somente **depois** do plano de reconciliação e dos testes de clone.
- push/migrate:dev/studio: ferramentas de desenvolvimento, não correção automática de drift em produção.

Não existe seed de produção autorizado; comando raiz db:seed falha com explicação. Bootstrap do platform_owner é outro fluxo sensível ainda auditado no taskboard.

## Gates reais

Runtime role confirmado sem bypass; tenant ausente; leitura A com ID de B; insert/update/delete cruzados; constraints de FK compostas; transação concorrente; contexto não vaza no pool; convite simultâneo; prova expirada/reutilizada/concorrente; sessões revogadas; rollback de outbox. Os testes de API existentes precisam de PostgreSQL real e não passaram neste ambiente sem esse serviço. Consulte `docs/audit/validation.md` para separar checks locais de testes pendentes.
