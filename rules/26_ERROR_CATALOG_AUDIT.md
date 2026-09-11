# Dicionario de erros, reportes e auditoria

## Objetivo

Erros precisam ser compreensiveis para o usuario, acionaveis pela equipe e
seguros nos logs. O catalogo de erros e uma fonte de verdade versionada; o
superadmin pode complementar descricoes e runbooks pelo painel sem alterar o
contrato de resposta da API.

## Codigo da aplicacao e status HTTP

Nao usar status HTTP como identificador do erro. Por exemplo, HTTP `201`
significa recurso criado com sucesso. O codigo estavel do BipeSend usa o
formato `BPS-<DOMINIO>-<NUMERO>`, e o status HTTP continua sendo transportado
separadamente.

Resposta publica canonica:

```json
{
  "error": {
    "code": "BPS-INT-002",
    "message": "A integração precisa de configuração.",
    "requestId": "req_01J..."
  }
}
```

`message` e seguro e pode ser exibido. Stack trace, SQL, caminho de arquivo,
token, prompt, payload de provider e detalhes de PII ficam somente no contexto
interno sanitizado, se forem realmente necessarios.

## Registro do dicionario

Cada entrada deve declarar:

- `code`, dominio, titulo e status HTTP padrao;
- mensagem segura para usuario e mensagem operacional interna;
- severidade, origem provavel, owner e runbook;
- acao recomendada e se o usuario pode tentar novamente;
- versao, estado ativo/obsoleto e data da ultima revisao;
- classificacao de dados que pode aparecer no log.

O arquivo inicial esta em `docs/error-catalog.md`. Mudancas de contrato exigem
ADR, atualizacao de testes e compatibilidade retroativa quando possivel.

## Reporte pelo painel do tenant

O botao `Reportar erro` deve:

1. mostrar uma mensagem segura e um `requestId` quando existir;
2. abrir formulario curto com descricao do usuario e opcao de contexto da tela;
3. enviar somente rota, modulo, codigo conhecido, versao, navegador resumido e
   identificadores tecnicos nao sensiveis;
4. redigir e-mails, telefones, tokens, cookies, mensagens e texto de cliente
   antes de persistir o contexto;
5. exigir autenticacao e aplicar rate limit por usuario e tenant;
6. permitir anexos somente quando autorizados, com a mesma quarentena de
   uploads, limite, MIME allowlist e storage privado;
7. devolver um protocolo de reporte, sem revelar detalhes internos.

O backend calcula uma impressao digital do erro para agrupar duplicatas. O
reporte pertence ao tenant; somente superadmin autorizado pode ver dados
globais. Suporte temporario a um tenant precisa de motivo, expiracao e
auditoria.

## Estados e auditoria

Estados canonicos: `open`, `investigating`, `resolved`, `ignored`.

Toda mudanca de estado registra actor, contexto de autenticacao, tenant quando
aplicavel, timestamp, codigo, acao, motivo e `requestId`. Nao permitir que o
cliente apague ou marque como resolvido um reporte. `resolved` pode voltar a
`open` se uma ocorrencia nova for correlacionada.

O superpainel deve permitir buscar por codigo, protocolo, fingerprint, tenant,
modulo, severidade, estado e periodo. A tela deve ligar cada reporte a uma
entrada do dicionario ou oferecer `Promover para dicionario`, exigindo revisao
e runbook antes de publicar a nova entrada.

## Logs e privacidade

- logs estruturados usam `requestId`, `correlationId`, codigo e metadados
  minimos;
- cliente nunca recebe stack trace ou decisao de autorizacao detalhada;
- eventos de erro sao retidos conforme a politica do modulo e anonimizados
  quando possivel;
- o catalogo e publico apenas para mensagens seguras; runbooks sao internos;
- falhas de um widget nao derrubam a tela inteira e oferecem retry acessivel.

## Testes obrigatorios

- contrato de todos os codigos e status;
- redacao de PII, segredo e cabecalhos;
- deduplicacao por fingerprint;
- isolamento tenant/superadmin;
- rate limit do reporte;
- transicoes de estado e auditoria;
- erro desconhecido gera codigo generico seguro e entra em fila de triagem;
- `requestId` acompanha API, worker, webhook e provider quando permitido.
