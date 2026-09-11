# Proxy HTTPS local e de producao

Os arquivos deste diretorio sao exemplos versionados de borda. O proxy e a
unica porta de entrada do navegador; PostgreSQL, Redis, Mailpit e MinIO ficam
presos ao loopback no Compose local.

## Local

1. Instale `mkcert` no Windows e execute `mkcert -install`.
2. Gere o certificado somente na maquina local:

```powershell
New-Item -ItemType Directory -Force infra\certs | Out-Null
mkcert -cert-file infra\certs\localhost.pem -key-file infra\certs\localhost-key.pem localhost *.localhost 127.0.0.1 ::1
```

3. Suba o proxy com `docker-compose.https.yml` conforme o `SETUP-01-LOCAL.md`.

O wildcard `*.localhost` atende `app.localhost`, `admin.localhost`,
`api.localhost`, `hooks.localhost` e `www.localhost`. O certificado e a chave
nao entram no Git.

## Producao

Use `nginx.production.conf.example` como base para o provedor de hospedagem,
substituindo upstreams, caminhos de certificado, allowlists e limites. O
certificado deve ser provisionado por ACME/secret manager, nao copiado para a
imagem a partir do repositorio.

## Apache

`infra/apache/.htaccess.example` existe somente para uma hospedagem Apache.
Ele nao e lido pelo Nginx, Next.js, NestJS ou MinIO.
