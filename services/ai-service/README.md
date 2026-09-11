# ai-service

Microsservico Python/FastAPI para RAG, embeddings e chamadas a provedores de LLM.

## Limites

- acessivel somente pela rede interna;
- autentica chamadas de Node.js por mTLS ou JWT assinado e rotacionado;
- valida `tenant_id`, `conversation_id`, politica e request id assinados;
- consulta somente conhecimento permitido;
- nao executa codigo, SQL arbitrario, shell ou filesystem;
- nao grava diretamente em CRM, nao envia mensagem e nao altera billing;
- devolve resposta, fontes, confianca, custo estimado e propostas de ferramenta para Node decidir.

O contrato deve ser versionado em `packages/contracts` e duplicado em schemas Pydantic com testes de contrato.
