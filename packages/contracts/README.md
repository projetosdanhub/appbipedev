# @bipesend/contracts

Schemas Zod e tipos compartilhados, sem ambiente, I/O ou segredos. Build gera dist; cliente pode importar esses contratos. Validação de forma nunca comprova autenticação ou autorização.

## Exports

IDs UUID, requestId limitado, e-mail normalizado, passwordSchema de compatibilidade (9–128 + símbolo), OTP de seis dígitos; tenantRole/permission/TenantContext; pagination com limit 1–100; envelope de erro seguro; health simples; integrationState/Health; convite limitado; envelope de evento versionado e auditEvent.

Papéis: tenant_admin, manager, agent, viewer. Os 20 nomes de permissão estão no enum. platform_owner não é papel de tenant. Não aceitar TenantContext serializado pelo cliente como prova: resolver a membership atual no servidor com `auth/policies`.

## Contratos e compatibilidade

Integração: connected/degraded/disconnected/misconfigured/not_entitled/disabled/unknown. Adapters mapeiam estados externos; UI não inventa enum. `healthSchema` é liveness simples; readiness detalhada precisa de contrato específico no card INF-008, não adaptar resposta silenciosamente.

Erro: `{error:{code,message,requestId}}`, onde code técnico é estável e separado de HTTP e do futuro protocolo BPS de suporte. Vários endpoints legados ainda retornam formatos anteriores; sua migração fica no taskboard. Nunca preencher message com exception bruta.

Evento: id, name `domain.entity.action.vN`, tenantId, actorId, correlationId, occurredAt e data. data genérico não é schema de domínio pronto: cada evento concreto valida seu payload e limita tamanho/PII. auditEvent é contrato inicial, não serviço de auditoria persistente.

## Exemplo

```ts
import { tenantInvitationSchema } from '@bipesend/contracts';
const input = tenantInvitationSchema.parse(untrustedBody);
// Em seguida: autenticar, resolver contexto, autorizar cargo e transacionar.
```

## Verificação

`pnpm --filter @bipesend/contracts build` e `test`. Mudanças incompatíveis devem versionar o contrato e migrar consumidores; não criar cópia do schema em um módulo novo. Validações legadas de tela conservam mensagens PT-BR e precisam acompanhar a mesma política de senha.
