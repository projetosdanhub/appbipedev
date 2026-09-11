# Regras de configuracao

## Fonte de configuracao

- configuracao de ambiente fica no servidor e e validada no boot;
- `.env.example` documenta nomes, nunca valores reais;
- frontend recebe somente configuracao publica necessaria para renderizar;
- marca, SEO e preferencia do tenant ficam em tabelas versionadas, nao em variaveis de ambiente;
- feature flags globais sao controladas pelo superadmin e auditadas;
- segredos de provider ficam em secret manager ou ciphertext de envelope, nunca em JSON de configuracao publico.

## Ambientes

`local`, `test`, `staging` e `production` usam bancos, buckets, Redis, e-mails, dominios e credenciais distintos. A aplicacao deve saber o ambiente por configuracao validada, nao por heuristica de URL.

## Variaveis canonicas

Nao criar nomes alternativos para o mesmo recurso. Toda nova variavel deve declarar tipo, obrigatoriedade, ambiente, dono, sensibilidade e valor de exemplo. Variaveis desconhecidas falham no CI; valores invalidos impedem o boot do modulo afetado.

## Configuracao visual e marca

O superadmin define nome da plataforma, texto da aba, favicon, logotipo vertical/horizontal, cores, SEO global e scripts allowlist. O tenant pode definir sua propria marca somente dentro do escopo contratado. O renderer aplica limites de tamanho, MIME, dimensoes e sanitizacao; nao aceita CSS/JS arbitrario.

## Configuracao por plano

Planos controlam entitlements no backend. Nao duplicar limites em `.env`, frontend, migrations ou componentes. O painel exibe o valor retornado pela API e indica a origem: plano, override temporario ou politica global.

## Mudancas

Mudanca de configuracao sensivel exige permissao, confirmacao, auditoria e, quando possivel, preview/rollback. Nunca editar diretamente banco de producao para contornar o painel.

## URLs e proxy

As URLs canonicas de acesso sao HTTPS. Em local, usar os hosts `*.localhost`
atraves do proxy em `3443`; `3000`, `3001`, `3002` e `4000` sao upstreams
internos. `HTTPS_ENFORCE`, `TRUSTED_PROXY_COUNT` e `ALLOWED_ORIGINS` sao
validados no boot. O ngrok nao recebe token por variavel versionada e sua URL
publica e temporaria.
