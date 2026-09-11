# Integracoes externas

## Adapter boundary

Cada provedor implementa uma interface interna, com DTO normalizado, timeout, retry, circuit breaker, health check e telemetria. SDK do provedor fica somente no pacote/servico do adapter.

## Pagamento

Stripe Connect e Mercado Pago OAuth usam ambiente sandbox local/staging. Callback valida `state`, PKCE quando suportado, origem, redirect allowlist e expiracao. Webhook valida assinatura, persiste evento bruto minimizado, deduplica e processa assincronamente.

## IA

Provedores de chat e embeddings entram como configuracao do backend. Nunca chamar API por chave enviada ao browser. Restringir modelos por plano, custo e politica de dados.

## Observabilidade de provedor

Guardar `provider_request_id`, status, latencia, tipo de erro e correlation id. Nao guardar payload completo com segredo ou PII sem necessidade. Painel mostra saude, nao tokens.
