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

## BipeWPRO - fundação antecipada

BILL-001 deve entregar o catálogo único de capacidades/cotas e concessões auditadas antes do CRUD publicável de sites/Food. BILL-002/005 reutilizam essa estrutura: não criar WebPlan/FoodPlan nem um segundo contador ao implementar planos. Contratos e exemplos de contagem estão em `docs/plans/bipewpro.md`, seções 3 e 13. Site, página, catálogo, menu e item de menu são distintos. Criação, importação, duplicação e restauração usam a mesma reserva/contagem atômica. Conteúdo institucional platform é comercialmente ilimitado com limites técnicos; suporte a tenant continua sujeito à cota do cliente. PHP requer também disponibilidade técnica homologada.
