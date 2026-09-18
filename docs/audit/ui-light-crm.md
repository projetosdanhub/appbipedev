# FND-015 — Workspace claro e CRM

Data: 2026-09-18

## Escopo

- tema claro único no `packages/ui` e `tenant-web`;
- tokens canônicos de cor, tipografia, espaçamento, radius, sombra e motion;
- controle segmentado reutilizável e toaster claro;
- cabeçalho com marca e menu expansível no desktop;
- navegação móvel preservada com drawer completo;
- CRM migrado para tokens compartilhados em quadro, lista e cards móveis.

O BipeWPRO continua com componentes específicos em `packages/web-builder-ui`. Temas do conteúdo publicado não alteram o painel.

## Comportamento verificável

- O menu desktop abre pelo botão ao lado da marca, usa `aria-expanded`, fecha por backdrop, Escape ou navegação e não permanece na ordem de tab quando fechado.
- O CRM remove controles aparentes sem comportamento, conecta a criação de funil à rota canônica e permite criar lead diretamente em cada etapa.
- Quadro e lista compartilham estado; a lista possui ação explícita e composição própria para telas menores que 768 px.
- Busca usa o debounce cancelável do design system e os componentes respeitam `prefers-reduced-motion`.

## Evidência de execução

Executado com sucesso:

- `pnpm --filter @bipesend/ui typecheck`;
- `pnpm --filter @bipesend/ui test` — 5 arquivos e 20 testes aprovados;
- `pnpm --filter @bipesend/tenant-web typecheck`;
- `pnpm --filter @bipesend/tenant-web test` — 5 arquivos e 32 testes aprovados;
- ESLint direcionado a todos os arquivos TS/TSX alterados;
- build de produção do `tenant-web`;
- `pnpm architecture:check`, `pnpm secrets:check`, `pnpm brand:check`, `pnpm rules:check` e `pnpm taskboard:check`;
- `git diff --check`.

O lint completo do `tenant-web` permanece fora do gate desta mudança por encontrar 128 erros preexistentes em áreas não alteradas; o lint direcionado desta entrega passou. O build preserva um aviso preexistente do Prisma sobre `export *` em módulo CommonJS.

`pnpm ui:smoke` não pôde ser concluído neste ambiente: o Chromium do Playwright não estava instalado e as tentativas de download excederam o tempo limite da rede. O script foi atualizado para validar somente o tema claro e o fechamento do menu por Escape, mas a inspeção visual em 360/768/1440 px continua pendente antes de mover FND-015 para `DONE`.

Não tratar documentação ou screenshot isolado como E2E de negócio.
