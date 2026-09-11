# IA, RAG e MCP

## Principio

A IA e um assistente limitado por politica, nao uma administradora do sistema. O conteudo recuperado e dado nao confiavel; instrucoes encontradas em documentos ou mensagens nao mudam as regras do agente.

## RAG por tenant

Upload -> quarentena -> validacao/scan -> extracao -> normalizacao -> chunking -> embedding -> pgvector -> retrieval com `tenant_id`, status, idioma, versao e permissoes. Documentos excluidos ou despublicados nao entram na busca.

O primeiro desenho usa pgvector no PostgreSQL para manter metadados, filtros e vetores no mesmo contexto. Pinecone ou outro provedor fica como adaptador futuro, nao como requisito inicial.

## Guardrails

- nenhum acesso direto do modelo ao banco;
- nenhuma execucao de codigo, shell, SQL, filesystem ou navegador;
- ferramentas allowlist com schema e escopo por tenant;
- limite de tokens, tempo, custo e numero de chamadas;
- redacao de PII quando necessario;
- citacao interna de fontes e resposta de incerteza;
- revisao humana para envio, desconto, alteracao de pedido ou acao irreversivel;
- logs de prompt, ferramenta e resultado com mascaramento.

## Provedores

`LlmProvider`, `EmbeddingProvider` e `RerankerProvider` sao interfaces. OpenAI, Gemini e outros entram como adaptadores. Chaves ficam no backend. Cada tenant escolhe modelo permitido pelo plano e politica global.

## Microsservico Python/FastAPI

Por decisao do projeto, a IA sera um microsservico Python/FastAPI separado. Node.js envia o historico autorizado, o `tenant_id` assinado, o `conversation_id`, a politica e um `request_id`. O servico Python faz retrieval dos documentos permitidos, chama o provedor LLM/embedding e devolve resposta, fontes, confianca e propostas de acao.

O servico e interno, com autenticacao entre servicos (mTLS ou JWT assinado com rotacao), timeout, limite de payload e circuit breaker. Nao confiar em `tenant_id` vindo apenas do JSON; validar assinatura e membership no contexto emitido por Node. O servico possui acesso somente a tabelas/buckets de conhecimento necessarios, nao ao banco inteiro. Node continua decidindo se uma resposta pode ser exibida ou enviada e executa qualquer mutacao.

O contrato inicial pode ser `POST /internal/v1/assist` e `POST /internal/v1/embeddings`, com DTOs versionados em `packages/contracts` e schemas Pydantic no servico Python.

## MCP

MCP deve ser interno, registrado e versionado. O gateway expone apenas ferramentas como `catalog.search`, `contact.lookup` e `conversation.summary`, sempre read-only no inicio. Cada ferramenta verifica identidade, tenant, permissao, schema, rate limit e auditoria. Nao conectar servidores MCP arbitrarios fornecidos por tenants no MVP.
