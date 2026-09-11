# HTTPS, proxy e protecao de arquivos

## Objetivo

Todo acesso de usuario, webhook e dominio publicado deve usar HTTPS. A borda
de entrada e responsabilidade do proxy; a aplicacao continua responsavel por
autenticacao, autorizacao, tenant, validacao e auditoria. Nao considerar TLS no
proxy uma substituicao para os controles da aplicacao.

## Topologia canonica

| Ambiente | Entrada publica | Upstreams internos | Regra |
| --- | --- | --- | --- |
| local | `https://*.localhost:3443` | `127.0.0.1:3000`, `3001`, `3002`, `4000` | certificado local confiavel; portas internas nao sao URLs de usuario |
| ngrok | URL HTTPS gerada pelo ngrok | servico local escolhido | usar apenas para callback/teste; nunca expor banco, Redis ou storage |
| producao | `443` nos dominios oficiais | rede privada de servicos | HTTP em `80` redireciona permanentemente para HTTPS |

Dominios locais representam as superficies de producao:

- `www.localhost:3443`: marketing e landing;
- `app.localhost:3443`: painel do tenant;
- `admin.localhost:3443`: superpainel;
- `api.localhost:3443`: API;
- `hooks.localhost:3443`: webhooks.

Os nomes oficiais e a porta de producao sao configuracao de ambiente ou do
provedor de hospedagem; nao criar URLs alternativas espalhadas no codigo.

## TLS e proxy confiavel

- local usa certificado gerado por CA de desenvolvimento, como `mkcert`; chave
  privada e certificados ficam em `infra/certs/`, ignorados pelo Git;
- producao usa certificados gerenciados e renovacao automatica;
- permitir somente TLS moderno suportado pelo proxy e desabilitar protocolos
  legados;
- o proxy adiciona `X-Request-Id` quando ausente e preserva um valor valido;
- a API confia em `X-Forwarded-Proto`, `X-Forwarded-Host` e IP real somente
  quando a requisicao vem de proxy cadastrado;
- requisicao com esquema efetivo HTTP em superficie que exige HTTPS deve ser
  redirecionada na borda ou rejeitada pela API, sem loop de redirecionamento;
- cookies de sessao sao `Secure`, `HttpOnly` e `SameSite` conforme o fluxo;
- HSTS fica habilitado somente depois de todos os subdominios de producao
  estarem validados em HTTPS. Nao ativar HSTS global no localhost;
- CORS aceita apenas origens cadastradas. Nunca usar `*` junto com credenciais.

## Cabecalhos minimos

O proxy e a aplicacao devem colaborar para entregar, conforme a superficie:

- `Strict-Transport-Security` somente em producao validada;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` com apenas recursos necessarios;
- `Content-Security-Policy` versionada por superficie, sem `unsafe-eval`;
- `frame-ancestors` restritivo e `X-Frame-Options` quando aplicavel;
- `Cache-Control: no-store` para sessoes, erros internos e dados tenant-owned.

O proxy nunca deve substituir uma politica CSP sem teste da superficie; landing,
painel e editor podem ter allowlists diferentes.

## Protecao contra leitura e download de arquivos

- a raiz publica do servidor contem somente build e assets publicos;
- nao publicar `.env`, `.git`, chaves, certificados, logs, dumps, backups,
  arquivos temporarios, configuracoes, codigo-fonte ou diretorios de trabalho;
- bloquear arquivos ocultos e extensoes sensiveis (`env`, `ini`, `conf`, `key`,
  `pem`, `sql`, `log`, `bak`, `backup`, `sh`) no proxy e no pipeline;
- desabilitar listagem de diretorios;
- source maps de producao ficam privados ou sao enviados apenas ao sistema de
  observabilidade com controle de acesso;
- downloads de documentos passam por endpoint autenticado, autorizacao de
  tenant/recurso, limite de tamanho, `Content-Disposition` seguro e URL
  assinada curta quando o storage suportar;
- nunca montar um caminho de arquivo diretamente com entrada do usuario;
  normalizar, validar allowlist e impedir path traversal;
- storage de uploads e privado por padrao. URL publica permanente exige decisao
  registrada, escopo minimo e revisao de privacidade;
- o proxy nao e a unica defesa: API, storage e bucket tambem validam acesso.

## `.htaccess`

`.htaccess` e aplicavel somente quando o servidor e Apache. O BipeSend usa
Nginx como referencia de proxy; portanto, `infra/apache/.htaccess.example` e um
adaptador opcional e nao substitui as configuracoes Nginx. Nao adicionar um
`.htaccess` no build do frontend acreditando que ele protegera um bucket ou uma
API executada por Node.

## Ngrok

- o agente do ngrok fica local e o endpoint entregue ao exterior deve ser
  HTTPS;
- o authtoken fica na configuracao local do ngrok ou em secret manager, nunca
  em Markdown, `.env.example`, frontend, log ou commit;
- expor somente a porta da aplicacao necessaria ao callback;
- registrar a URL temporaria sem token e invalidar a URL quando o teste acabar;
- nao usar ngrok como entrada de producao.

## Criterios de aceite

- `curl` para HTTP em producao recebe redirecionamento para HTTPS;
- o proxy local responde por HTTPS com certificado confiavel;
- portas de PostgreSQL, Redis, Mailpit e MinIO escutam somente no loopback;
- arquivos sensiveis e listagem de diretorio retornam bloqueio;
- download sem sessao, tenant ou permissao falha sem revelar existencia do
  recurso;
- testes verificam host allowlist, forwarded headers, CORS, cookies e headers.
