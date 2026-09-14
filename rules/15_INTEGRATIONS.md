# Integrações

## 1. Adaptadores

Cada provider possui adaptador próprio sob contrato interno estável. UI e domínio não dependem do payload bruto do provider.

## 2. Credenciais

Segredos ficam no backend e são mascarados na UI. Leitura comum nunca devolve token completo.

## 3. Conexão

Fluxo: iniciar → autorização/provider → callback validado → persistir credencial segura → health check → ativo.

## 4. Operação

Timeout, retry com backoff, circuit breaker quando adequado, rate limit, idempotência e observabilidade. Falha externa não pode derrubar processo inteiro.

## 5. Desconexão

Revogar localmente e, quando disponível, no provider. Limpar caches e marcar estado. Histórico de negócio não é apagado automaticamente.

## 6. UX

Status normalizado: `connected`, `degraded`, `disconnected`, `misconfigured`, `not_entitled`, `disabled`, `unknown`. Mostrar última verificação e ação recomendada.

## Revisão de fundação — 2026-09-13

Adapters server-only tipados, timeouts/AbortSignal, retry classificado, idempotência, circuit breaker quando necessário, logs minimizados e credenciais cifradas com rotação de chave. Não confiar em URLs de callback fornecidas pelo cliente; allowlist e proteção SSRF.
