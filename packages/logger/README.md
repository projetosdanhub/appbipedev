# @bipesend/logger

Logger estruturado de servidor. Exporta `Logger`, `logger`, `LogLevel`, `LogContext` e `projectLogMetadata`. Não importar em cliente, nem registrar documentos, pedidos, formulários ou corpos de requisição.

## API e minimização

`withContext` cria contexto independente. `info`, `warn`, `error` e `debug` preservam assinatura, envelope JSON e contexto usado pela API (`app`, `env`, `requestId`). Contexto padrão e dados passam pela mesma projeção explícita. Suporta `(mensagem, metadados)` e `(metadados, mensagem)`, usado pelo error handler do Fastify; `err` é projetado como nome seguro de erro.

IDs operacionais limitados, `code`/`operation`/`component`/`app`, ambiente conhecido, métricas numéricas e status HTTP são permitidos. Objetos/arrays/chaves desconhecidos são descartados, incluindo valores aninhados e ciclos. Não executar getters/toJSON. Error vira somente nome de classe nativa conhecido; sem message, stack, cause ou propriedade de provider. Contexto não pode sobrescrever timestamp/level/message.

**Mudança intencional de segurança:** e-mail e campos livres antes retornados por `data` deixaram de ser emitidos. Os consumidores observados enviam contexto operacional e Error; suas assinaturas não mudaram. Se precisar de metadado novo, acrescentar chave com validação, propósito e teste. Não voltar a espalhar payload bruto por compatibilidade.

## Limites

A mensagem deve ser texto estático do código. O logger não identifica PII/segredos arbitrários disfarçados em IDs/códigos permitidos nem em mensagens livres. Não substituir projeção consciente por uma alegação de redaction universal. Retenção, acesso ao coletor e auditoria persistente pertencem à aplicação.

## Verificação

`pnpm --filter @bipesend/logger build` e `test`. Cobertura: contexto filho sem mutar pai, envelope protegido, Error/contexto/nested/ciclos, tipos inválidos, getters e toJSON. Todos os dados de teste são sintéticos.
