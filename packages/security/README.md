# @bipesend/security

Primitivas **Node server-only**. Não importar em componente cliente ou registrar argumentos/resultado secreto. Recursos disponíveis não significam que cada legado já foi migrado para eles.

## API e limites

| Função | Uso | Responsabilidade do consumidor |
| --- | --- | --- |
| generateOtp | seis dígitos via crypto.randomInt | hash com chave, expiração, tentativas e consumo único |
| hashSecret | HMAC-SHA256 com propósito e segredo ≥32 caracteres | alta entropia, separação de propósito, rotação/invalidação |
| constantTimeEqual | compara comprimentos e buffers | formato/algoritmo do protocolo correto |
| encryptSecret/decryptSecret | AES-256-GCM, IV aleatório, keyId e AAD de contexto | keyring server-only; contexto tenant/provider; rotação e backup de chave |
| verifyWebhook | protocolo interno timestamp.rawBody ±300 s | bytes originais; formato específico do provider; dedupe persistente |
| redactLog | allowlist de metadados escalares | não esconder PII em campo allowlisted; não serializar payload extra |
| isAllowedOrigin | correspondência exata de origem | lista administrada; integração real com middleware/CSRF |
| consumeRateLimit/rateLimitLua | janela fixa atômica e fail-closed | store Redis, identidade/tenant e limite global/IP, métricas |

## Criptografia

Senha é Argon2id em auth, nunca AES. Para segredos recuperáveis, key deve ter 32 bytes e keyId explícito; ciphertext é envelope `v1.keyId.iv.tag.data`. Incluir tenantId/provider/finalidade em context e manter keyring com chave ativa e chaves antigas durante rotação. Autenticação AEAD rejeita troca de tenant, chave desconhecida e alteração de ciphertext; não tentar descriptografar payload arbitrário no browser.

Não gerar chave a cada boot: isso perderia acesso aos dados. Falta de chave correta bloqueia a operação. A migração do twoFactorSecret e de OAuth tokens legados para envelope ainda é pendência auditada, não foi aplicada automaticamente.

## Webhooks e limites

Assinatura válida não evita replay dentro da janela. Persistir event ID por tenant/provider com índice único antes do efeito e responder duplicata sem repetir ação. Verificar documentação atual de cada provider: este helper não a substitui. Sem rawBody o middleware rejeita; não reserializar JSON.

Rate limit atômico usa INCR/PEXPIRE/PTTL no mesmo Lua. Falha do store propaga e interrompe ação protegida. Limite por e-mail não impede ataque distribuído de e-mails distintos; aplicar limite global/IP/custo no edge e operação. Não usar Math.random para segredo; jitter não secreto pode usá-lo.

## Verificação

`pnpm --filter @bipesend/security build` e `test`: adulteração/contexto AEAD, HMAC/timestamp/tamanho, redaction e store indisponível. A segurança do sistema também depende de chaves, RLS, autorização e infraestrutura reais, registradas no threat model.
