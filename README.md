# BipeSend - plataforma multitenant de CRM, automacao e catalogo

BipeSend e o nome escolhido para a plataforma. `bipesend.com.br` e `bipesend.com` sao dominios candidatos; a disponibilidade e a verificacao de marca ainda precisam ser confirmadas antes do registro.

## Objetivo desta base

Este repositorio comeca como a fonte de verdade da arquitetura e das regras de implementacao. A pasta `rules/` deve ser lida antes de qualquer agente de IA criar ou alterar codigo, banco, componentes, eventos ou configuracoes.

O primeiro recorte de construcao e:

1. fundacao local com Docker;
2. autenticacao e recuperacao de conta;
3. isolamento multitenant;
4. onboarding do administrador do tenant;
5. shell do painel do contratante;
6. testes automatizados e verificacoes de seguranca.

## Comando de bootstrap para agentes

```text
!construibase
```

Ao receber esse comando, a IA deve ler `rules/00_MASTER.md` e os arquivos de regras na ordem indicada, conferir o taskboard e propor uma mudanca pequena, testavel e rastreavel. Nenhum agente pode criar tabelas, permissoes, variaveis de ambiente ou integracoes fora das regras sem registrar uma decisao em `docs/decisions.md`.

Na fundacao, a tarefa `FND-008` pode executar `pnpm structure:scaffold`. Esse comando cria apenas a estrutura de pastas modular; o codigo de negocio sera construido por tarefas posteriores.

## Superficies e dominios propostos

- `bipesend.com.br`: dominio primario para o mercado brasileiro.
- `bipesend.com`: dominio secundario/reserva, com redirecionamento planejado para o primario no inicio.
- `www.bipesend.com.br`: landing page e documentacao comercial publica.
- `app.bipesend.com.br`: painel dos tenants.
- `admin.bipesend.com.br`: superpainel da equipe proprietaria da plataforma.
- `api.bipesend.com.br`: API privada e publica conforme cada contrato.
- `hooks.bipesend.com.br`: endpoint de webhooks, com verificacao e idempotencia.
- `tenant-slug.bipesend.com.br`: dominio provisiorio para sites/catalogos publicados.

Todos sao nomes candidatos. A disponibilidade dos dominios, marca e requisitos legais devem ser confirmados antes do lancamento.

## Stack decidida para o MVP

- Frontend: Next.js + React + TypeScript + Tailwind CSS + componentes acessiveis.
- Backend: NestJS com adaptador Fastify, REST versionada e WebSocket para tempo real.
- Dados: PostgreSQL com migracoes SQL/Drizzle e RLS; pgvector para RAG.
- Filas: Redis + BullMQ; PostgreSQL permanece como fonte de verdade.
- IA: microsservico Python/FastAPI isolado para RAG, orquestracao de LLM e avaliacao; Node.js continua como autoridade de negocio e mensageria.
- Infra local: Docker Compose, Mailpit, MinIO opcional e ngrok apenas para callbacks de desenvolvimento.
- Monorepo: pnpm + Turborepo.

## Arquitetura modular

O backend e dividido por dominios numerados em `apps/api/src/modules/`, com camadas `domain`, `application`, `infrastructure`, `presentation` e `tests`. Os frontends usam feature slices. O mapa completo esta em `docs/module-map.md` e as regras anti-monolito em `rules/23_MODULAR_ARCHITECTURE.md`.

## Estado atual

Esta base e uma especificacao inicial v0.2. O documento PDF em `output/pdf/` e o taskboard em `docs/taskboard.md` devem ser revisados antes de qualquer integracao externa em producao.
