# Filas e jobs

## 1. Princípios

Jobs devem ser idempotentes, observáveis e tolerantes a retry. Fila não é banco de negócio.

## 2. Payload

Payload mínimo, com IDs, tenant/contexto e correlation ID. Evitar segredo e PII. Dados grandes ficam em storage/banco e são referenciados.

## 3. Retry

- backoff exponencial com jitter;
- número máximo por tipo;
- erros permanentes não entram em loop;
- DLQ para inspeção;
- reprocessamento auditado.

## 4. Concorrência

Usar chave de deduplicação/lock quando duas execuções causarem efeito duplicado. Provedor externo deve receber idempotency key quando suportar.

## 5. UX

Processos longos expõem estado `queued`, `processing`, `completed`, `failed` e progresso quando confiável. UI pode usar evento ou polling controlado; não fingir percentual.

## Revisão de fundação — 2026-09-13

Retry sempre possui limite, timeout, jitter, classificação e DLQ; consumidor é idempotente por tenant/evento/consumer. packages/events fornece política/helper, não worker pronto. Teste rollback e duplicata contra storage real antes de DONE em MSG-001/002.
