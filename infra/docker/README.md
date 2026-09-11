# Infraestrutura local

Execute `docker compose up -d` para subir PostgreSQL com pgvector, Redis, Mailpit e MinIO local. As portas sao publicadas somente em `127.0.0.1`.

Para a entrada HTTPS local, gere o certificado de desenvolvimento e execute:

```powershell
docker compose -f docker-compose.yml -f docker-compose.https.yml --profile https up -d
```

O Nginx fica em `127.0.0.1:3443` e encaminha os hosts `*.localhost` para os
upstreams. Consulte `infra/nginx/README.md` e `SETUP-01-LOCAL.md`.

O compose e somente para desenvolvimento. Em producao, usar servicos gerenciados, redes privadas, backups testados, secrets manager e observabilidade.
