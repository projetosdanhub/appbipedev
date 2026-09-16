# @bipesend/logger

Logger estruturado existente para uso no servidor. Exporta `Logger`, instância `logger`, `LogLevel` e `LogContext` a partir de `src/index.ts`. Não importar em UI pública nem registrar documentos do construtor, pedidos ou payload de formulário.

## API observada

`withContext` cria logger com contexto; `info`, `warn`, `error` e `debug` emitem JSON com timestamp, nível e mensagem. O dado opcional recebe sanitização recursiva por nomes de chaves conhecidos. O pacote tem scripts build, typecheck e test.

## Limitações importantes da implementação atual

A lista de nomes sensíveis não cobre qualquer PII nem texto embutido em valores. `defaultContext` é espalhado no payload sem passar pelo mesmo sanitizador; `Error` inclui message e stack. Portanto, isso não prova redaction segura para corpo de requisição ou erro bruto. Evitar contextos arbitrários e dados reais; usar somente metadados permitidos, código seguro e IDs necessários.

O BipeWPRO deve usar projeção explícita/allowlist de metadados e os contratos de segurança do projeto. A melhoria executável do logger é trabalho de WPRO-002, com testes de Error, contexto e objetos aninhados; este README apenas documenta o estado observado. Não duplicar logger dentro de web-builder.

## Fronteiras e validação

Observabilidade operacional pertence à aplicação; o pacote não implementa retenção, acesso aos logs, auditoria imutável ou integração com coletor. Rodar scripts de pacote ao alterar código e verificar os consumidores. Logs de teste usam dados sintéticos, sem segredos em argumentos ou snapshots.
