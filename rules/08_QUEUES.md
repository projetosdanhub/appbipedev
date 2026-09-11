# Filas e processamento assincrono

## Redis e BullMQ

BullMQ processa jobs de webhook, mensagens, agendamentos, automacoes, indexacao RAG, thumbnails e notificacoes. Redis nao guarda o estado definitivo do negocio.

## Outbox

Transacao de negocio grava mudanca e outbox na mesma transacao. Um dispatcher publica jobs/eventos depois do commit. Isso evita publicar uma mensagem que nao foi persistida ou perder um evento apos o commit.

## Regras de job

Todo job tem nome canonico, schema, timeout, retry com backoff, limite de tentativas, dead-letter, correlation id, tenant id e politica de concorrencia. Jobs externos usam idempotency key. Nunca fazer retry cego de erro permanente ou de opt-out.

## Agendamento

Horario armazenado em UTC mais timezone do tenant. Mudanca de timezone deve ser explicita. Mensagem agendada pode ser cancelada; o worker verifica permissao, assinatura, limite e supressao antes de enviar.

## Observabilidade

Metricas por fila: enqueued, started, succeeded, failed, retried, delayed, latency e age of oldest job. Alertar dead-letter e crescimento anormal.
