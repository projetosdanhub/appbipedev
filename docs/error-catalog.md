# Catalogo inicial de erros BipeSend

Este arquivo e o dicionario inicial de codigos de aplicacao. O status HTTP e
separado do codigo BipeSend; HTTP `201` e uma resposta de sucesso e nao entra
como erro.

| Codigo | HTTP padrao | Severidade | Mensagem segura | Origem provavel / proximo passo |
| --- | ---: | --- | --- | --- |
| `BPS-AUTH-001` | 401 | medium | Nao foi possivel autenticar. | credencial invalida; revisar tentativa, rate limit e sessao |
| `BPS-AUTH-002` | 401 | low | Sua sessao expirou. Entre novamente. | sessao expirada/revogada; renovar fluxo de login |
| `BPS-AUTH-003` | 403 | high | Voce nao tem permissao para esta acao. | policy/RBAC; conferir cargo, setor e tenant |
| `BPS-TENANT-001` | 400 | high | Nao foi possivel identificar o contexto da empresa. | tenant context ausente/invalido; revisar middleware |
| `BPS-TENANT-002` | 404 | critical | Recurso nao encontrado. | possivel IDOR/cross-tenant; auditar request e RLS |
| `BPS-RATE-001` | 429 | medium | Muitas tentativas. Tente novamente em instantes. | rate limit por IP, usuario, tenant ou provider |
| `BPS-CONFIG-001` | 500 | critical | O sistema esta com uma configuracao indisponivel. | schema/env/config; consultar logs internos sem expor segredo |
| `BPS-INT-001` | 503 | high | A integracao esta temporariamente indisponivel. | timeout, circuit breaker ou indisponibilidade do provider |
| `BPS-INT-002` | 503 | high | A integracao precisa de configuracao. | credencial, redirect ou webhook ausente/invalido |
| `BPS-INT-003` | 502 | high | A integracao recusou a requisicao. | token expirado, escopo ou contrato do provider |
| `BPS-WEBHOOK-001` | 401 | high | Webhook nao autorizado. | assinatura, timestamp ou segredo incorreto |
| `BPS-WEBHOOK-002` | 409 | medium | Este evento ja foi processado. | duplicata; confirmar idempotencia, sem reprocessar efeito |
| `BPS-UPLOAD-001` | 422 | medium | O arquivo nao atende aos requisitos. | MIME, tamanho, scan, extensao ou quarentena |
| `BPS-PLAN-001` | 403 | low | Seu plano nao permite esta operacao ou atingiu o limite. | entitlement/contador; exibir limite e acao de upgrade |
| `BPS-GENERIC-001` | 500 | high | Ocorreu um erro inesperado. | erro sem catalogo; gerar reporte e abrir triagem |

## Campos internos recomendados

O registro interno pode conter `requestId`, `correlationId`, tenant,
`actorId` pseudonimizado, modulo, rota, versao, ambiente, fingerprint,
`providerRequestId`, status, latencia e causa classificada. Remover tokens,
cookies, Authorization, body bruto, texto de cliente e PII antes de persistir.

## Evolucao

Novos codigos devem seguir `BPS-<DOMINIO>-<NUMERO>`, ser adicionados aqui e
registrados em `docs/decisions.md` quando alterarem contrato. Nao reutilizar um
codigo para outra causa depois de publicado.
