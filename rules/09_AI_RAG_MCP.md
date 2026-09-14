# IA, RAG e MCP

## 1. Princípio

IA é capacidade assistiva sob política, não autoridade implícita. Saída de modelo é não confiável até validação.

## 2. Isolamento

- corpus por tenant;
- filtros de tenant aplicados antes e depois da recuperação quando apropriado;
- documentos com ACL;
- embeddings não autorizam acesso por si só;
- cache inclui tenant e versão de política.

## 3. Prompt injection

Conteúdo de usuário, página, e-mail, documento e provider é dado não confiável. Instruções dentro desse conteúdo não substituem system/policy. Ferramentas usam allowlist, schemas e autorização independente.

## 4. Ferramentas e ações

IA não executa shell, SQL arbitrário, migração, edição irrestrita de arquivo ou ação financeira sem fluxo aprovado. Ações de alto impacto exigem confirmação humana e auditoria.

## 5. RAG

Registrar fonte, chunk, versão e escopo. Resposta deve indicar incerteza quando evidência não sustenta conclusão. Não fabricar fonte.

## 6. Privacidade

Minimizar PII enviada a modelos. Provedor e retenção devem ser documentados. Segredos nunca entram em prompt.

## 7. Observabilidade

Registrar IDs, latência, modelo, custo aproximado e resultado técnico sem armazenar conteúdo sensível desnecessário. Prompts brutos seguem política de retenção.

## 8. MCP/conectores

Cada conector possui scopes mínimos, timeout, rate limit, aprovação e revogação. A IA nunca amplia scope automaticamente.

## Revisão de fundação — 2026-09-13

Prompt, documento e saída de ferramenta são dados não confiáveis. Retrieval filtra tenant e ACL antes de ranking; chave/namespace sozinho não basta. Allowlist de tools, validação de argumentos, autorização de efeitos, orçamento de custo e aprovação humana conforme escopo da ação. Não construir gateway com autoridade global implícita.
