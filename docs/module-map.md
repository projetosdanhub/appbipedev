# Mapa modular BipeSend

Este arquivo explica onde cada tipo de responsabilidade deve ficar. A numeracao representa a ordem de dependencia/construcao, nao uma ordem para renomear arquivos a cada sprint.

## Backend Node.js

```text
apps/api/src/modules/
  00-shared/
  01-identity/
  02-tenancy/
  03-authorization/
  04-team/
  05-crm/
  06-inbox/
  07-messaging/
  08-automation/
  09-knowledge/
  10-catalog/
  11-pages/
  12-billing/
  13-integrations/
  14-platform/
  99-test-support/
```

Dentro de cada modulo:

```text
domain/
application/
infrastructure/
presentation/
tests/
```

## Frontend tenant-web

```text
apps/tenant-web/src/
  app/
    (auth)/login/
    (auth)/forgot-password/
    (workspace)/dashboard/
    (workspace)/inbox/
    (workspace)/crm/
  features/
    identity/
    team/
    crm/
    inbox/
    billing/
  components/
  lib/
  styles/
  tests/
```

Superadmin e marketing seguem o mesmo padrao, com features proprias. Nao compartilhar componentes de negocio entre superficies; compartilhar somente UI, contratos e utilitarios seguros.

## Python AI service

```text
services/ai-service/app/
  00_shared/
  01_ingestion/
  02_retrieval/
  03_generation/
  04_tools/
  05_evaluation/
  99_test_support/
```

## Regra de localizacao

Se o arquivo atende uma regra de negocio, ele fica no modulo do dominio. Se atende somente visual, fica em `packages/ui` ou `components`. Se conversa com provider, fica no adapter de integracao. Se e contrato entre servicos, fica em `packages/contracts`.
