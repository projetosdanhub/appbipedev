# Saúde e estado de integrações — v2

Contrato canônico: `integrationStateSchema` em `packages/contracts`. Estados: `connected`, `degraded`, `disconnected`, `misconfigured`, `not_entitled`, `disabled`, `unknown`. O antigo conjunto healthy/action_required/down não é enum público válido; adapters devem mapeá-lo explicitamente.

Health de infraestrutura é contrato diferente de estado do provider. Não misturar disponibilidade, credencial, habilitação e entitlement sem preservar o motivo normalizado.

Cada verificação tem timeout, checkedAt, escopo e erro seguro. Ausência de verificação é unknown, nunca connected. Use IntegrationStatusBadge e LastCheckedLabel com texto/ícone, timezone e ação contextual. Não mostrar credenciais, DSN ou resposta bruta.

Revalidar por abertura/foco/evento e intervalo controlado. Aplicar backoff, evitar polling por aba invisível e deduplicar alertas de transição. Mudanças de credencial e reconexão são auditadas. Autorização e cache incluem tenant; somente operação privilegiada pode ver agregados.

OPS-004/005 continuam abertos até persistência, workers, autorização e testes reais; componentes de status não implementam monitoramento.
