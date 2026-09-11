# Planos, limites e billing

## Modelo

- `plans`: produto comercial configuravel pelo superadmin.
- `plan_features`: feature key, tipo, valor e modo de bloqueio.
- `subscriptions`: tenant, plano, ciclo, status, periodo e provedor.
- `usage_counters`: consumo por janela, tenant e recurso.
- `entitlement_overrides`: excecoes auditadas e temporarias.

## Chaves de feature

Exemplos: `team.members.max`, `whatsapp.instances.max`, `contacts.max`, `messages.outbound.monthly`, `ai.copilot.enabled`, `ai.rag.storage_bytes`, `pages.published.max`, `catalog.products.max`.

## Planos de referencia

Os nomes abaixo sao comerciais provisiorios e os precos nao estao definidos:

| Plano | Perfil | Exemplo de limite |
| --- | --- | --- |
| Nexo Start | equipe pequena | 3 membros, 1 numero, CRM basico, sem automacao avancada |
| Nexo Growth | vendas em crescimento | 10 membros, 3 numeros, automacoes, copiloto de IA |
| Nexo Scale | operacao multicanal | 30 membros, 10 numeros, RAG, catalogo e paginas |
| Nexo Enterprise | contrato customizado | limites e integracoes negociados, SSO futuro, suporte dedicado |

O superadmin pode criar planos personalizados por feature. O backend calcula entitlement; o frontend apenas exibe o que o backend autoriza.

## Mudanca de plano

Upgrade aplica apos confirmacao do provedor e pode liberar limite imediatamente. Downgrade normalmente vigora no proximo ciclo; nao apagar dados acima do novo limite. Bloquear novas criacoes e oferecer caminho de ajuste/exportacao.

## Pagamentos

Stripe Connect e Mercado Pago entram com OAuth, sandbox, state/PKCE quando aplicavel, redirect allowlist, tokens criptografados, webhooks verificados e idempotencia. O redirect do navegador nao confirma pagamento; o webhook do provedor atualiza o estado.
