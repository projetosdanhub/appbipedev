# Arquitetura de referencia

## Contextos

| Contexto | Responsabilidade | Dados principais |
| --- | --- | --- |
| Identity | autenticar e criar sessoes | users, sessions, verifications |
| Tenant | empresa, membros e cargos | tenants, memberships, roles |
| CRM | contatos, pipeline e conversas | contacts, conversations, messages |
| Messaging | providers, QR, webhooks e envio | channels, provider_events |
| Automation | regras e execucoes | triggers, workflows, runs |
| Knowledge | documentos e embeddings | documents, chunks, embeddings |
| Catalog | produtos e pedidos | catalogs, products, orders |
| Pages | editor e publicacao | sites, pages, domains |
| Billing | planos e uso | plans, subscriptions, entitlements |
| Integrations | adapters, OAuth, webhooks e saude | integration_connections, provider_events |
| Platform | erros, reportes, auditoria e configuracao global | error_catalog_entries, error_reports, audit_events |

## Contrato de contexto

```ts
type TenantContext = {
  requestId: string;
  userId: string;
  tenantId: string;
  membershipId: string;
  permissions: readonly string[];
  supportAccess?: { reason: string; expiresAt: string };
};
```

Nenhum use case tenant-owned recebe apenas `userId`. O `TenantContext` e criado pelo servidor depois da sessao e da membership serem validados.

## Evolução planejada: BipeWPRO

[Plano BipeWPRO](plans/bipewpro.md): motor de documento, editor compartilhado, renderer público, propriedade tenant/platform, catálogo Food, publicação e entitlements. A primeira fatia já implementa contracts/web/catalog/entitlements, core, renderer, editor e UI própria em `web-builder-ui`. Modelos persistidos, cotas e publicação continuam nos cards PAGE/CAT/BILL/WPRO. `packages/ui` mantém sua implementação; sua reforma global foi adiada pelo usuário. A superfície pública permanece em marketing-web, a ser ativada, sem misturar cookies dos painéis.
