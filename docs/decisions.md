# Registro de decisoes

## ADR-0001 - marca BipeSend e dominios candidatos

**Decisao:** usar `BipeSend` como marca escolhida para a proxima versao da fundacao; tratar `bipesend.com.br` como dominio primario candidato e `bipesend.com` como dominio secundario candidato.  
**Motivo:** o nome comunica mensagens, atendimento e vendas sem limitar a plataforma a um unico modulo.  
**Risco:** disponibilidade de marca/domains e conflitos de mercado ainda precisam ser verificados.  
**Status:** escolhido para reestruturacao; registro pendente.

## ADR-0002 - stack inicial

**Decisao:** TypeScript end-to-end, Next.js no frontend, NestJS/Fastify na API, PostgreSQL + RLS + pgvector, Redis + BullMQ, Docker Compose local.  
**Motivo:** contratos compartilhados e menor dispersao operacional no MVP.  
**Alternativas:** backend Python completo; microservicos desde o inicio; Pinecone desde o inicio.  
**Status:** aprovada para o marco inicial.

## ADR-0003 - WhatsApp por adapter

**Decisao:** provider adapter com implementacao nao oficial isolada para desenvolvimento/avaliacao e rota futura oficial.  
**Motivo:** desacoplamento e controle de risco.  
**Status:** requer validacao juridica/operacional antes de venda.

## ADR-0004 - IA sem acesso direto

**Decisao:** IA usa ferramentas allowlist, read-only no inicio, com tenant context, schemas, limites e auditoria.  
**Motivo:** reduzir prompt injection, exfiltracao e escalada de privilegio.  
**Status:** obrigatoria.

## ADR-0005 - arquitetura modular e ordem cronologica

**Decisao:** organizar dominios com pastas numeradas de `00-shared` a `14-platform`, mais `99-test-support`, e separar cada modulo em domain/application/infrastructure/presentation/tests quando aplicavel.  
**Motivo:** evitar arquivos monoliticos, reduzir imports circulares e tornar a localizacao compreensivel para pessoas e agentes de IA.  
**Status:** aprovada para a fundacao.

## ADR-0006 - contrato visual, motion e frescor de dados

**Decisao:** manter tokens tipograficos, cores e espacamentos em
`14_DESIGN_TOKENS.md`; manter o comportamento de interacao, animacao,
refresh, cache e deteccao de versao em `24_INTERACTIONS_MOTION_DATA_REFRESH.md`.
Atualizacoes de dados devem ser orientadas por eventos quando possivel, com
polling de fallback controlado e refresh manual preservando o contexto da tela.

**Motivo:** evitar regras visuais espalhadas, chamadas duplicadas, perda de
rascunhos e atualizacoes que interrompam o trabalho do usuario.

**Status:** aprovada para a fundacao.

## ADR-0007 - API minima com Fastify e health/ready

**Decisao:** criar a API minima em `apps/api` usando Fastify (nao NestJS completo) para a fase de fundacao, com apenas `GET /health` e `GET /ready`.  
**Motivo:** Fastify e a engine declarada na ADR-0002; o bootstrap minimo permite validar infraestrutura Docker, configuracao e conectividade sem introduzir complexidade de modulos de negocio.  
**Detalhes:** `/health` retorna status e uptime sem segredos; `/ready` verifica PostgreSQL e Redis reportando latencia sem expor credenciais. Configuracao validada no boot via schema em `src/config/env.ts`. Testes com `node:test` nativo.  
**Status:** implementada e validada.
