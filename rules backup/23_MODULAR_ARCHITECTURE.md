# Arquitetura modular e organizacao de arquivos

## Objetivo

Manter o BipeSend responsivo, testavel, evolutivo e compreensivel para pessoas e agentes de IA. Nenhum arquivo deve concentrar tela, regra de negocio, acesso a banco, integracao externa e tratamento de erro ao mesmo tempo.

## Limites de modulo

Cada modulo representa um dominio de negocio e possui quatro camadas quando aplicavel:

```text
<module>/
  domain/          entidades, value objects, policies e eventos
  application/     use cases, commands, queries e ports
  infrastructure/  repositorios, adapters, filas e persistencia
  presentation/    controllers, routes, DTOs e serializers
  tests/            unit, integration e contract
```

O modulo publica somente contratos necessarios. A camada de dominio nao importa framework, ORM, Redis, HTTP ou SDK de provedor. A camada de infraestrutura implementa ports definidos pela aplicacao.

## Mapa cronologico

```text
00-shared -> 01-identity -> 02-tenancy -> 03-authorization -> 04-team
          -> 05-crm -> 06-inbox -> 07-messaging -> 08-automation
          -> 09-knowledge -> 10-catalog -> 11-pages -> 12-billing
          -> 13-integrations -> 14-platform -> 99-test-support
```

Um modulo pode depender de modulos anteriores por contrato. Nao criar importacao circular. Se a dependencia apontar para frente, extrair um contrato para `00-shared` ou publicar um evento.

## Frontends

Cada frontend segue feature slices, nao pastas globais gigantes:

```text
src/
  app/                 rotas e layouts finos
  features/            cada feature com api, components, hooks e schemas
  components/          componentes visuais compartilhados da aplicacao
  lib/                 clients, formatters e config local
  styles/              tokens e estilos globais
  tests/               E2E, visual e acessibilidade
```

`app/` compoe; `features/` implementa comportamento; `packages/ui` fornece componentes genericos. Nenhuma pagina deve conter query SQL, regra de billing ou chamada direta de provider.

## API e workers

API organiza rotas por modulo e use case. Workers organizam jobs por dominio e usam os mesmos contratos/eventos. Integracoes externas ficam em `13-integrations` ou em adapters de `07-messaging`, nunca espalhadas por controllers.

## Python/FastAPI

O `services/ai-service` segue a mesma ideia:

```text
app/
  00_shared/
  01_ingestion/
  02_retrieval/
  03_generation/
  04_tools/
  05_evaluation/
  99_test_support/
```

O servico Python nao importa codigo interno do Node. Ambos compartilham contratos versionados, exemplos de payload e testes de contrato.

## Regra contra arquivo monolitico

Se um arquivo comeca a receber responsabilidades de outro modulo, o agente deve parar, propor a divisao e atualizar o mapa de modulos. Nao resolver crescimento com `utils`, `misc`, `common` ou `helpers` sem dominio definido.

## Checklist de novo modulo

Antes de criar um modulo, declarar: objetivo, dependencia cronologica, entidades, permissoes, eventos, endpoints, jobs, limites de plano, telas, testes e owner. Depois criar somente os arquivos necessarios e registrar a decisao.

## Scaffolding

O script `scripts/create-modular-skeleton.mjs` cria somente diretorios e marcadores vazios, e pode ser executado mais de uma vez. Ele nao sobrescreve codigo, nao cria migrations e nao inventa entidades. A criacao de arquivos de negocio acontece somente por tarefa do taskboard.
