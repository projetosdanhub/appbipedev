# API e eventos

## 1. HTTP

Contratos são tipados e versionados quando houver quebra. Entrada deve ser validada na borda; domínio valida regras sem confiar no cliente.

## 2. Envelope de erro

Formato de referência:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Não foi possível entrar com os dados informados.",
    "requestId": "req_..."
  }
}
```

Status HTTP e código de aplicação são contratos separados. Mensagem pública é segura e acionável.

## 3. Idempotência

Criação de pagamento, envio, integração, webhook e mutações suscetíveis a retry devem suportar idempotência. Mesma chave + mesmo payload retorna resultado compatível; mesma chave + payload diferente falha.

## 4. Paginação e filtros

Usar limites máximos. Filtros são allowlisted. Ordenação só por campos aprovados.

## 5. Eventos

Nome semântico e versionável: `domain.entity.action.v1`. Evento carrega somente dados necessários, tenant quando aplicável, actor/correlation IDs e timestamp.

## 6. Outbox

Eventos críticos derivados de transação devem usar outbox ou padrão equivalente para evitar "DB confirmou, evento sumiu".

## 7. Realtime

WebSocket/SSE não é fonte de verdade. Ao reconectar, cliente revalida estado. Eventos são autorizados por contexto e não podem vazar dados entre tenants.

## Revisão de fundação — 2026-09-13

Schemas executáveis em @bipesend/contracts. code técnico estável é distinto do código BPS de suporte, ainda a implementar. Eventos incluem tenant obrigatório, actor, requestId, versão e occurredAt. appendOutbox recebe o adapter da transação; publicar fora dela exige relay persistente ainda pendente.
