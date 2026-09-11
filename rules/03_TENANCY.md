# Multitenancy e isolamento

## Modelo

- `tenants` representa a empresa contratante.
- `users` representa identidade global, sem dados operacionais de tenant.
- `memberships` liga user a tenant e contem status, cargo e preferencias.
- toda entidade de negocio tenant-owned tem `tenant_id NOT NULL`.
- recursos publicos usam IDs opacos/UUID e nunca expoem sequencias previsiveis.

## Defesa em profundidade

1. o token/session informa o tenant ativo;
2. middleware valida membership e status;
3. caso de uso recebe `TenantContext` tipado;
4. queries incluem filtro tenant;
5. PostgreSQL aplica RLS e `FORCE ROW LEVEL SECURITY` onde aplicavel;
6. testes tentam acessar dados de outro tenant e devem falhar;
7. logs registram tenant sem revelar payload sensivel.

## Troca de tenant

Nao aceitar `tenant_id` enviado pelo frontend como autoridade. A troca so pode ocorrer entre memberships ativas. O novo contexto deve emitir evento de auditoria e atualizar a sessao.

## Superadmin

O superadmin acessa recursos por servico de suporte explicitamente autorizado, com escopo, motivo, prazo e auditoria. Nao reutilizar o token do tenant nem permitir consulta global por uma flag enviada pelo cliente.

## Exclusoes e exportacoes

Exclusao de tenant exige confirmacao forte, janela de retencao e job rastreavel. Exportacoes devem ter filtro de tenant, link assinado com expiracao e registro de quem exportou.
