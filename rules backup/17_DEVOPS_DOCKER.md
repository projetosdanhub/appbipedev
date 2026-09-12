# DevOps, Docker e ambientes

## Ambientes

`local`, `test`, `staging` e `production` separados. Cada um tem chaves, bancos, buckets e dominios distintos. Ngrok e somente local/staging controlado para callbacks; nunca usar URL temporaria em producao.

## HTTPS e proxy

O acesso de navegador passa por proxy HTTPS. No local, o proxy Nginx usa
`https://*.localhost:3443` e certificado de desenvolvimento; as portas de
upstream permanecem locais. Em producao, `80` redireciona para `443`, HSTS so
entra apos validacao de todos os subdominios e certificados sao gerenciados por
ACME/secret manager. `.htaccess` so vale para Apache e nao substitui Nginx.

## Docker local

PostgreSQL com pgvector, Redis, Mailpit e MinIO sobem via `docker compose`. Dados locais podem ser apagados; seeds nao contem PII real.

## Deploy

Build reproduzivel, imagem imutavel, migrations em job controlado, health/readiness checks, rollback documentado, backups e restore testados. Nao executar migration destrutiva automaticamente durante o boot da API.

## Configuracao

Config e validada no boot por schema. Variavel desconhecida falha em CI. Segredo ausente impede somente o modulo dependente quando seguro; integracoes criticas falham fechado.

## Observabilidade

Logs estruturados, request id, correlation id, metricas e traces. Alertas para erro de auth, cross-tenant denial, webhooks falhos, dead-letter, latencia e consumo anormal.

O superpainel exibe dicionario de erros, reportes dos tenants, estado de cada
integracao e ultima verificacao, sem segredos ou payloads brutos.
