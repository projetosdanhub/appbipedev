# API, contratos e eventos

## API

Prefixo `/v1`. Schemas de entrada e saida versionados em `packages/contracts`. Erros usam formato estavel com `code`, `message` seguro, `requestId` e `details` somente quando nao expuserem dados.

O codigo de aplicacao usa `BPS-<DOMINIO>-<NUMERO>` e nao substitui o status
HTTP. Nunca tratar HTTP `201` como codigo de erro. O servidor redige segredos e
PII antes de logar ou devolver qualquer detalhe.

Endpoints de autenticacao nunca retornam tokens de provedor. Recursos tenant-owned exigem contexto autenticado. Operacoes mutaveis sensiveis aceitam idempotency key.

## Eventos canonicos

- `identity.user.created`
- `identity.email.verified`
- `tenant.created`
- `tenant.member.invited`
- `conversation.created`
- `message.received`
- `message.send.requested`
- `message.send.succeeded`
- `message.send.failed`
- `automation.run.requested`
- `knowledge.document.index.requested`
- `billing.subscription.updated`
- `integration.webhook.received`

Eventos sao fatos, nao comandos genericos. Cada evento tem `event_id`, `type`, `version`, `occurred_at`, `tenant_id`, `actor`, `correlation_id` e payload tipado. Consumidores sao idempotentes.

## Tempo real

WebSocket com rooms por tenant e usuario. O servidor autoriza a entrada na room. Eventos de UI sao notificacoes; o comando original continua sendo validado pela API.

## Saude de integracoes

O estado exibido para Stripe, Mercado Pago, WhatsApp e IA vem de verificacao
server-side e usa os estados de `27_INTEGRATION_HEALTH.md`. Eventos de
transicao sao idempotentes, auditaveis e nunca carregam tokens.
