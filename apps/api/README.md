# api

API Fastify versionada. O primeiro modulo sera identity/tenant.

## Bind local

Em ambiente local, `API_HOST=127.0.0.1` e obrigatorio. A API e acessada pelo
proxy HTTPS em `https://api.localhost:3443`; a porta `4000` e apenas upstream
de diagnostico local. Em uma imagem de container, o processo pode usar
`0.0.0.0` somente dentro da rede privada do Compose e sem publicar a porta no
host.
