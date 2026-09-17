# Evidência de planejamento BipeWPRO

Data: 2026-09-15. Base: `489fae20e9370d099c1a77701fa1855deb4bb0c4`. Branch criada no GitHub: `feat/bipewpro-planning`. Escopo: documentação, regras, organização de packages e taskboard; não implementação do construtor.

## Base observada

- 86 cards na origem: 47 DONE, 38 BACKLOG e 1 IN_PROGRESS. Identidade AUTH-001..016 e CRM-001..004 marcados DONE, sem nova homologação nesta entrega.
- 35 modelos Prisma, sem modelos de sites/catálogos/planos. Módulos 10-catalog/11-pages/12-billing são skeletons; rota catalog mostra “Em breve”. marketing-web ainda não tem package.json.
- O mapa de packages omitia logger; README novo registra suas limitações reais de redaction, sem afirmar que foram corrigidas.
- Handoff/READMEs antigos têm estado histórico divergente do taskboard. O plano distingue relato de execução atual.

## Verificação anterior às edições

No checkout limpo da base, `node scripts/taskboard.mjs` e os comandos `pnpm taskboard:check`, `pnpm rules:check`, `pnpm architecture:check` passaram. Saída: 86 cards sem ciclos; 36 regras ativas; fronteiras estáticas de packages válidas. Node 24.19.0; pnpm disponível 11.19.0, enquanto o projeto declara 12.4.1. A invocação do pnpm instalou dependências do lockfile localmente; nenhum manifesto/lockfile foi alterado como entrega.

## Alterações documentadas

Plano detalhado, handoff específico, guia premium de UI, mapa de pacotes, README de logger, regras 36/37, referência na regra mestre e regra de billing. ADRs BW-001..008 registram as decisões. PAGE/CAT/BILL mantêm IDs e ganham critérios específicos; WPRO-001..018 detalham entregas adicionais. O renderizador do taskboard passa a listar cards READY/IN_PROGRESS reais, em vez de sequência fixa já concluída.

## Verificação final

- `pnpm taskboard:render` e `pnpm taskboard:check`: PASS, 104 cards sem ciclos; 53 BACKLOG, 1 READY, 1 IN_PROGRESS, 1 BLOCKED e 48 DONE.
- Comparação por ID com a base: nenhum card removido, nenhum estado ou evidência anterior alterado. Somente WPRO-001 acrescenta um DONE documental; WPRO-002 é a próxima fatia READY.
- `pnpm rules:check`: PASS, 38 regras ativas. O verificador legado cobre 7 guias; o README de logger foi revisado separadamente.
- `pnpm architecture:check`: PASS para o scanner estático existente; não é evidência de novo bundle público.
- `pnpm secrets:check` e `git diff --check`: PASS no conteúdo da entrega.
- PDF: gerado de `docs/plans/bipewpro.md` por `scripts/build_bipewpro_pdf.py`; 22 páginas A4, 24 entradas de sumário/bookmarks e 69 anotações de links. Texto extraído confere as seções e decisões principais; nenhuma ocorrência de glifo fora dos limites de página no exame por pdfplumber.
- PDF renderizado por Poppler e revisado visualmente nas 22 páginas: sem corte/sobreposição; paginação, tabelas, capa e sumário conferidos. A primeira renderização foi ajustada para eliminar páginas quase vazias; esta evidência se refere à versão final.

O critério DONE de WPRO-001 refere-se exclusivamente à entrega de planejamento; os cards funcionais continuam abertos. Não houve teste funcional novo do produto porque código de runtime dos apps/pacotes não foi alterado.

## Limites

Não foram executados E2E do produto, integração PostgreSQL/Redis/SMTP, Lighthouse, testes de carga, operação DNS/TLS, migrações ou pagamentos. Não houve mudança de runtime, merge ou deploy. A consulta ao GitHub não inclui mudanças ainda locais do Gemini. A revisão desta etapa não é auditoria completa de segurança dos módulos existentes.
