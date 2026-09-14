# Billing e planos

## 1. Princípios

Billing é controle de entitlement, não apenas tela de preço. Backend é responsável por validar limites e capacidades.

## 2. Entitlements

Plano define capacidades, quantidades e política. UI pode esconder/desabilitar recurso para orientar, mas backend sempre valida.

## 3. Webhooks de pagamento

Assinados, idempotentes, com replay protection quando suportado. Redirect de checkout nunca confirma pagamento.

## 4. Mudanças de plano

Upgrade/downgrade, trial, cancelamento, grace period e suspensão precisam de estado explícito. Limite excedido não apaga dados.

## 5. UX

- preço e periodicidade claros;
- sem dark pattern;
- confirmação para ação financeira;
- mostrar efeito e data;
- falha de pagamento orienta sem expor detalhes sensíveis;
- acessibilidade completa.

## 6. Segurança

Nunca armazenar dados de cartão se o PSP pode tokenizar. Segredos do PSP não chegam ao navegador.

## Revisão de fundação — 2026-09-13

Entitlement e cota no servidor, com consumo atômico. Pagamento é confirmado por webhook autenticado/idempotente; redirect não confirma. Decimais/moeda, timezone, downgrade não destrutivo e replay precisam de testes próprios. Não embutir secrets ou preços supostos na UI.
