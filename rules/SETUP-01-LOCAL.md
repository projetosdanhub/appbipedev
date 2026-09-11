# SETUP-01-LOCAL — Configuração local única do BipeSend

Versão: 1.1.0  
Escopo: ambiente local no Windows/Antigravity  
Execução: uma vez, com comportamento idempotente  
Projeto: BipeSend

> Este arquivo é um runbook para o Gemini executar dentro da raiz do
> repositório. Ele não é um script de sistema. Comandos que exigem segredo,
> permissão administrativa ou reinicialização devem ser confirmados pelo
> proprietário no terminal local.

## Comando de execução

Abra o Gemini no Antigravity com a pasta do projeto aberta e envie:

    !construibase

    Leia integralmente SETUP-01-LOCAL.md e execute o setup local descrito nele.
    Antes de editar, leia rules/00_MASTER.md, todos os arquivos de rules/ na
    ordem definida pelo master, docs/taskboard.md, docs/decisions.md e
    docs/module-map.md. Para a borda, leia também docs/error-catalog.md,
    docs/integration-health.md e infra/nginx/README.md.

    Este setup deve ser idempotente: validar o que já existe, criar somente o
    que estiver ausente e nunca apagar código, regras, volumes Docker ou
    configurações existentes. Não solicitar nem registrar tokens ou senhas no
    chat. Ao final, entregar o relatório exigido neste arquivo.

## 1. Pré-condições e raiz correta

A raiz aberta no Antigravity deve conter diretamente:

    package.json
    docker-compose.yml
    .env.example
    apps/
    packages/
    services/
    infra/
    rules/00_MASTER.md
    docs/taskboard.md
    scripts/

Se esses arquivos não estiverem na raiz atual, parar e informar o caminho
correto. Não procurar nem mesclar um 00_MASTER.md ou taskboard antigo fora da
raiz ativa.

Não apagar arquivos antigos automaticamente. Se houver cópias antigas dentro
da raiz ativa, parar e pedir confirmação antes de movê-las para docs/archive/.

## 2. Pré-verificação do ambiente

Executar e registrar:

    node --version
    pnpm --version
    docker --version
    docker compose version
    ngrok version
    git --version
    mkcert -version

Se pnpm não existir e Node.js estiver disponível:

    npm install --global pnpm@12.4.1

Se `mkcert` estiver ausente, parar e informar que ele precisa ser instalado
pelo proprietario. Nao baixar executaveis ou instalar certificados
silenciosamente.

Não instalar Docker Desktop ou Node.js silenciosamente. Se estiverem ausentes,
parar e informar que a instalação exige ação do usuário.

## 3. Ambiente .env local

Se .env não existir:

    Copy-Item .env.example .env

Garantir que:

- APP_ENV seja local ou equivalente validado pelo projeto;
- URLs locais usem 127.0.0.1 quando o serviço permitir;
- banco, Redis, Mailpit e MinIO permaneçam acessíveis apenas localmente;
- .env esteja ignorado pelo Git;
- nenhuma chave real seja escrita em código, Markdown, fixture, log ou commit.
- `API_HOST=127.0.0.1` no ambiente local; nao alterar para `0.0.0.0` no host.

As URLs publicas locais devem ser HTTPS e usar o proxy:

    PUBLIC_BASE_URL=https://www.localhost:3443
    TENANT_APP_URL=https://app.localhost:3443
    SUPERADMIN_APP_URL=https://admin.localhost:3443
    API_URL=https://api.localhost:3443
    HOOKS_URL=https://hooks.localhost:3443

As portas `3000`, `3001`, `3002` e `4000` sao upstreams locais, nao URLs para
usuarios. Nao colocar essas portas no ngrok quando o objetivo for expor o
painel completo; para callback, expor somente a API/webhook necessaria.

Gerar valores locais para AUTH_SESSION_SECRET, DATA_ENCRYPTION_KEY e
WEBHOOK_SIGNING_SECRET com o gerador criptográfico do Node:

    node -e "const c=require('crypto'); console.log(c.randomBytes(32).toString('base64url'))"

Repetir para cada segredo e inserir os valores somente no .env local. Não
exibir os valores no relatório. Nunca substituir um segredo existente sem
confirmação.

## 4. Dependências do projeto

Executar na raiz:

    pnpm install
    pnpm rules:check
    pnpm security:check
    pnpm structure:scaffold

O scaffold é idempotente. Ele deve criar apenas pastas e marcadores
estruturais; não deve criar tabelas, endpoints de negócio, permissões ou
integrações reais.

## 5. Docker local

Validar e subir somente os serviços do Compose:

    docker compose config --quiet
    docker compose up -d
    docker compose ps

Serviços esperados:

- PostgreSQL com pgvector;
- Redis;
- Mailpit;
- MinIO.

Não executar:

    docker compose down -v
    docker volume prune
    docker system prune

Não apagar volumes durante o setup. Não expor PostgreSQL, Redis ou MinIO pelo
ngrok.

## 6. Certificado e proxy HTTPS local

Depois de criar o `.env`, gerar o certificado somente na maquina local:

    mkcert -install
    New-Item -ItemType Directory -Force infra\certs | Out-Null
    mkcert -cert-file infra\certs\localhost.pem -key-file infra\certs\localhost-key.pem localhost *.localhost 127.0.0.1 ::1

Nao copiar os arquivos de `infra\certs` para GitHub. O `.gitignore` deve
mante-los fora do commit.

Subir o proxy junto com a infraestrutura:

    docker compose -f docker-compose.yml -f docker-compose.https.yml --profile https config --quiet
    docker compose -f docker-compose.yml -f docker-compose.https.yml --profile https up -d
    docker compose -f docker-compose.yml -f docker-compose.https.yml --profile https ps

O proxy usa `https://*.localhost:3443` e encaminha para os processos locais.
Se a API ainda nao existir, o proxy pode subir, mas o `/health` so funcionara
depois de INF-003.

Se o proxy for executado dentro de container e nao conseguir acessar um
processo preso ao loopback do host, nao ampliar o bind do host. Nesse caso,
executar o proxy no host ou containerizar o upstream na mesma rede privada.

## 7. Tarefas do taskboard nesta execução

Validar ou executar somente nesta ordem:

1. FND-007 — mapa modular e regra anti-monolito;
2. FND-008 — skeleton modular idempotente;
3. INF-001 — infraestrutura local Docker;
4. INF-002 — configuração validada por schema;
5. INF-003 — health/readiness da API;
6. INF-006 — proxy HTTPS local e forwarded headers;
7. INF-007 — bloqueio de arquivos e portas internas.

Para INF-003, se não existir API, criar a menor base modular em apps/api:

- pacote próprio @bipesend/api;
- Node.js, TypeScript e NestJS/Fastify conforme as regras;
- porta local 4000;
- GET /health sem segredos;
- GET /ready verificando dependências sem expor credenciais;
- configuração centralizada;
- logs estruturados básicos;
- testes mínimos dos endpoints.

Não iniciar ainda autenticação, CRM, WhatsApp, IA, catálogo, páginas,
pagamentos ou integrações externas.

## 8. Localhost

Depois que a API for criada, garantir que funcione por:

    pnpm dev

Validar:

    curl.exe --fail https://api.localhost:3443/health
    curl.exe --fail https://api.localhost:3443/ready

O painel do tenant usa `https://app.localhost:3443` somente quando as tarefas
de identidade e shell estiverem implementadas. Nao criar painel falso apenas
para preencher uma porta. Acesso direto a `http://localhost:4000` e apenas
diagnostico local e nao deve ser usado como URL publica.

## 9. Ngrok com segurança

O token enviado anteriormente na conversa não deve ser reutilizado. Ele deve
ser revogado no painel do ngrok e substituído por um novo token.

O novo token deve ser inserido somente no terminal local, nunca no Gemini,
neste arquivo, no .env, no GitHub ou em logs:

    ngrok config add-authtoken SEU_NOVO_TOKEN

Substituir SEU_NOVO_TOKEN somente no terminal. Não salvar o valor no
repositório.

Depois que `https://api.localhost:3443/health` funcionar:

    ngrok http 4000

Copiar a URL HTTPS gerada para o .env apenas se callbacks forem necessários:

    NGROK_PUBLIC_URL=https://URL-GERADA.ngrok.app
    HOOKS_URL=https://URL-GERADA.ngrok.app

Reiniciar a API apos alterar o `.env`. Nao iniciar ngrok para portas de banco,
Redis ou armazenamento.

O comando do ngrok entrega URL HTTPS publica, mesmo quando o upstream local e
`127.0.0.1:4000`. Para um teste do painel por proxy, usar somente apos validar
o certificado local e o host routing:

    ngrok http https://api.localhost:3443 --host-header=api.localhost:3443

Se o agente nao confiar no certificado local, voltar ao primeiro comando
(`ngrok http 4000`); a borda publica continuara HTTPS e os servicos internos
continuarao inacessiveis pela rede.

## 10. Git

Antes do primeiro commit:

    git status --short
    git diff -- .env

Confirmar que .env, tokens, senhas e temporários não aparecem no status. Se o
repositório ainda não existir:

    git init
    git add .
    git commit -m "chore: initialize BipeSend local foundation"

Não fazer push remoto sem confirmação do proprietário.

## 11. Critérios de conclusão

Concluir somente quando:

- pnpm rules:check passar;
- pnpm security:check passar;
- pnpm structure:scaffold terminar sem erro;
- docker compose config --quiet passar;
- PostgreSQL, Redis, Mailpit e MinIO estiverem em execução;
- proxy HTTPS local passar em `nginx -t` e escutar somente em `127.0.0.1:3443`;
- HTTP local redirecionar para HTTPS quando o proxy estiver habilitado;
- .env existir e não estiver versionado;
- /health e /ready responderem sem segredos pelo endpoint HTTPS;
- arquivos sensiveis e listagem de diretorio serem bloqueados pelo proxy;
- ngrok estiver configurado sem token no repositório;
- nenhuma tarefa posterior ao INF-007 tiver sido iniciada.

## 12. Relatório obrigatório

Responder com:

1. resumo do setup;
2. arquivos criados ou alterados;
3. comandos executados;
4. versões detectadas;
5. serviços Docker e portas;
6. URLs HTTPS locais e URL upstream usada somente para diagnostico;
7. URL temporária do ngrok, sem token;
8. testes e resultados;
9. riscos ou bloqueios;
10. próximo item READY do taskboard.

Nunca declarar sucesso de um item cujo critério de aceite não tenha sido
verificado.
