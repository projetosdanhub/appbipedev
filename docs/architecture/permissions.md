# Matriz de autorização v1

Fonte executável: packages/auth/src/policies.ts e packages/contracts/src/index.ts. Toda permissão requer mesmo tenant do recurso, membership atual e as condições adicionais do caso de uso.

| Permissão | tenant_admin | manager | agent | viewer |
| --- | --- | --- | --- | --- |
| dashboard.read | ✓ | ✓ | ✓ | ✓ |
| crm.contacts.read | ✓ | ✓ | ✓ | ✓ |
| crm.contacts.write | ✓ | ✓ | — | — |
| crm.deals.read | ✓ | ✓ | ✓ | ✓ |
| crm.deals.write | ✓ | ✓ | — | — |
| inbox.conversations.read | ✓ | ✓ | ✓ | — |
| inbox.conversations.reply | ✓ | ✓ | ✓ | — |
| inbox.conversations.assign | ✓ | ✓ | — | — |
| campaigns.manage | ✓ | — | — | — |
| automations.manage | ✓ | — | — | — |
| catalog.manage | ✓ | — | — | — |
| knowledge.manage | ✓ | — | — | — |
| integrations.manage | ✓ | — | — | — |
| team.members.read | ✓ | ✓ | ✓ | ✓ |
| team.members.manage | ✓ | ✓ | — | — |
| team.roles.manage | ✓ | — | — | — |
| billing.subscription.manage | ✓ | — | — | — |
| settings.security.manage | ✓ | — | — | — |
| audit.read | ✓ | ✓ | — | — |
| data.export | ✓ | — | — | — |

## Superfícies e telas

| Área | Permissão principal | Condição adicional |
| --- | --- | --- |
| Início | dashboard.read | métricas do tenant ativo |
| Contatos/CRM | crm.contacts.*, crm.deals.* | recurso pertence ao tenant; escrita explícita |
| Inbox | inbox.conversations.* | setor/atribuição quando implementado; conversa autorizada |
| Campanhas/automações | campaigns.manage, automations.manage | entitlement, opt-out e orçamento |
| Catálogo/conhecimento | catalog.manage, knowledge.manage | tenant/ACL e limites de arquivo |
| Equipe | team.members.*, team.roles.manage | não elevar cargo além do ator; proteger admin |
| Integrações | integrations.manage | autenticação recente para segredo/rotação |
| Faturamento | billing.subscription.manage | confirmação de mudança com impacto |
| Segurança | settings.security.manage | subject e recent-auth; não equivale a reset de qualquer usuário |
| Auditoria/exportação | audit.read, data.export | minimizar PII e autorizar escopo do lote |
| Superadmin | identidade platform própria | isSuperadmin + MFA + operação privilegiada; não é papel tenant |

A presença de uma permissão na matriz não significa que todos os endpoints/telas já a consultem. Integração por recurso/estado está em AUTH-008 e nos cards de domínio. Cada nova mutação deve autenticar e autorizar antes do efeito; menus visuais não fazem esse controle.

Admin/member legados são normalizados para tenant_admin/agent; cargos desconhecidos falham. Convite não cria tenant_admin; transferência de propriedade exige fluxo separado. Policies testam tentativa de outro tenant e escalada.
