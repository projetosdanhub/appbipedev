# Arquitetura

## Aplicacoes

```text
apps/
  tenant-web       painel app.bipesend.com.br
  superadmin-web   painel admin.bipesend.com.br
  marketing-web    landing www.bipesend.com.br
  api              API NestJS/Fastify e WebSockets
  worker           BullMQ, webhooks, mensagens e automacoes
  ai-worker        jobs assincronos de ingestao e avaliacao
services/
  ai-service       microsservico Python/FastAPI para RAG e LLM
```

## Modulos cronologicos

Cada aplicacao organiza seus dominios na mesma ordem de construcao:

```text
00-shared          contratos internos, erros, observabilidade e config
01-identity        usuarios, sessoes, email e recuperacao
02-tenancy         tenants, memberships e onboarding
03-authorization   roles, permissions e policies
04-team            membros, setores, convites e cargos
05-crm             contatos, campos, tags e pipelines
06-inbox           conversas, mensagens e atribuicao
07-messaging       providers, QR, webhooks e envio
08-automation      gatilhos, workflows e execucoes
09-knowledge       documentos, chunks, embeddings e retrieval
10-catalog         categorias, produtos, pedidos e storefront
11-pages           blocos, temas, SEO, dominios e publicacao
12-billing         planos, entitlements, subscriptions e uso
13-integrations    Stripe, Mercado Pago, IA, tracking e MCP
14-platform        branding, superadmin, suporte e docs
99-test-support    factories, fixtures e harnesses de teste
```

Os numeros mostram a ordem de dependencia e ajudam a localizar cada arquivo. Eles nao devem ser usados para renumerar arquivos individuais a cada mudanca.

## Pacotes compartilhados

```text
packages/
  ui, db, auth, contracts, events, security, config
```

## Fluxo de requisicao

`web -> api gateway -> autenticacao -> tenant context -> permissao -> caso de uso -> repositorio -> PostgreSQL`.

O caso de uso nao deve consultar tabelas aleatorias. O repositorio recebe o contexto autorizado e toda query tenant-owned inclui isolamento por banco e por aplicacao.

Node.js e a autoridade para identidade, tenant, permissoes, CRM, WebSockets, billing, webhooks e envio. O `ai-service` Python/FastAPI fica em rede interna, recebe chamadas autenticadas de Node, consulta apenas conhecimento permitido e devolve resposta, fontes, confianca e eventuais propostas de ferramenta. Ele nao pode alterar CRM, enviar mensagens ou executar codigo.

## Separacao de superficies

O painel de tenant, superpainel e landing publica possuem builds e politicas de seguranca distintas. Compartilham tokens visuais e contratos, mas nao compartilham cookies, sessions ou rotas de autorizacao.

## Comunicacao interna

REST versionada para comandos e consultas; eventos de dominio para efeitos assincronos; WebSocket para notificacao de interface. Nao usar chamadas HTTP entre modulos internos quando um caso de uso local ou evento for suficiente.

## Fonte de verdade

PostgreSQL guarda estado de negocio. Redis guarda fila, locks, cache curto e rate limit. Object storage guarda binarios. Logs e auditoria tem retencao definida por politica.
