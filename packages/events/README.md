# @bipesend/events

Contrato e helpers Node para eventos de domínio. **Não há worker/relay/outbox persistente completo nesta versão.** MSG-001/002 permanecem abertos.

## Uso

```ts
import { createEvent, appendOutbox } from '@bipesend/events';
// ctx já foi autenticado e autorizado; tx é a mesma transação da mutação.
const event = createEvent(ctx, 'crm.contact.created.v1', { contactId });
await appendOutbox(txAdapter, event);
```

`OutboxTransaction.insertOutbox` precisa inserir na MESMA conexão/transação que escreveu a entidade. O adapter deve validar vínculo do tenant, payload do domínio, limite de tamanho e constraint de event ID. O helper não abre transação nem consegue comprovar que um adapter arbitrário a respeita.

## Entrega e idempotência

Relay futuro lê pendências após commit, usa lock/lease, publica e marca entrega sem perder evento. Consumidor assume pelo menos uma entrega, persiste dedupe e executa efeito de forma idempotente. `tenantEventKey(event,consumer)` evita colisão entre tenants/consumers; precisa de storage com unicidade, não só Map em memória.

`retryDelay` fornece jitter exponencial até 60 s; jobPolicy define cinco tentativas, 30 s e payload máximo de 64 KiB como contrato inicial. O worker ainda deve aplicar esses limites, timeout, cancelamento, DLQ e observabilidade. Erro permanente não merece retry ilimitado. Dados pessoais completos não devem ser carregados em eventos genéricos quando ID/referência bastam.

## Verificação

`pnpm --filter @bipesend/events build` e `test` verificam envelopes, isolamento de chave, retry e propagação de falha do adapter. Não são prova de rollback de outbox em PostgreSQL. O card MSG-001 exige teste de commit/rollback/duplicata no storage real antes de DONE.
