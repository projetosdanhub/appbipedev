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

Status normalizado: `connected`, `degraded`, `action_required`, `disconnected`, `unknown`. Mostrar última verificação e ação recomendada.
