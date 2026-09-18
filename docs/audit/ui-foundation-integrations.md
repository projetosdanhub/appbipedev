# FND-016 — Fundação completa e loja de integrações

Data: 2026-09-18

## Escopo

- padrões compartilhados para filtros, chips ativos, cards de integração, avatar/presença, perfil e notificações;
- tokens adicionais de superfície, sombras, foco, motion e easing;
- shell com central de notificações real em empty state e menu de usuário completo;
- loja responsiva com busca, categorias, métricas e estados explícitos;
- WhatsApp instalável pelo fluxo existente da Evolution API;
- Instagram e TikTok visíveis como conectores em preparação, sem instalação simulada.

## Limites reais

- a UI não torna MSG-003/MSG-004 concluídos nem comprova segurança operacional da Evolution API;
- Instagram e TikTok dependem de adapters, OAuth, escopos oficiais, persistência, auditoria e testes ainda inexistentes;
- notificações ainda não possuem fonte de dados; portanto não exibem badge, polling ou conteúdo fictício;
- o smoke visual continua dependente do Chromium do Playwright no ambiente.

## Evidência de execução

Executado com sucesso:

- `@bipesend/ui`: typecheck, lint e 22 testes aprovados;
- `@bipesend/tenant-web`: typecheck, lint direcionado e 32 testes aprovados;
- build de produção do `tenant-web`;
- `architecture:check`, `secrets:check`, `brand:check`, `rules:check` e `taskboard:check`;
- `git diff --check`.

O build preserva o aviso preexistente do Prisma sobre `export *` em módulo CommonJS. O smoke visual continua pendente pelo Chromium indisponível no ambiente; essa limitação e os backends ausentes de Instagram/TikTok mantêm FND-016 em `IN_PROGRESS`.
