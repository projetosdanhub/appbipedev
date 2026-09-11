# Contrato inicial de saude de integracoes

O contrato e uma referencia para Stripe Connect, Mercado Pago OAuth, provider
de WhatsApp e provedores de IA. A implementacao fica nos adapters de
`13-integrations`; o painel consome apenas o resumo seguro.

## Resposta segura do painel

```json
{
  "provider": "stripe",
  "state": "misconfigured",
  "safeMessage": "A integração precisa de configuração.",
  "errorCode": "BPS-INT-002",
  "lastCheckedAt": "2026-09-11T12:00:00Z",
  "lastSuccessAt": null,
  "nextCheckAt": "2026-09-11T12:05:00Z",
  "latencyMs": null,
  "canRecheck": true
}
```

Nunca retornar client secret, access token, refresh token, assinatura, URL
interna, payload completo ou stack trace.

## Estados e acao visual

`connected` mostra check e ultima verificacao; `degraded` mostra alerta e
detalhe seguro; `disconnected` e `misconfigured` mostram ponto vermelho com
pisca suave, texto e acao de reconectar/configurar; `resolved` nao e um estado
persistido separado, e sim uma transicao registrada para `connected` ou
`disabled`. `not_entitled` mostra o limite do plano e nao abre incidente.

## Dados armazenados

O banco deve persistir somente o resumo operacional e referencias de segredo
gerenciadas. Os campos sensiveis da conexao usam envelope encryption e nunca
sao carregados em SSR/JSON publico.

## Exemplo de transicao

```text
connected -> degraded -> disconnected
disconnected -> connected
misconfigured -> connected
qualquer estado -> unknown durante verificacao vencida
```

Cada transicao relevante gera evento auditavel e pode alimentar o dicionario de
erros e os alertas do superpainel.
