# Evidência WPRO-002 — fundação do BipeWPRO

Data da sessão: 2026-09-16. Branch `feat/bipewpro-planning`. Base documental `2057750`; main `46832fcc6226665d545c69d4d2636df8722ba1e1` integrada em merge local `196de87`. Esta evidência acompanha o commit de implementação; o SHA final é o commit que contém este arquivo. Sem merge em main, deploy ou alteração de banco.

## Escopo implementado

Quatro pacotes com código/consumidores reais: core, renderer, web-builder-ui e web-builder. Três subpaths de contracts (web/catalog/entitlements), sem mover os contratos do CRM. Documento v1 estrito, quatro blocos, comandos imutáveis, histórico de 50 entradas, herança e overrides mobile/tablet/desktop. Galeria local: Elementos/Camadas/Ajustes, inclusão/edição/flex/grid, reordenação explícita/remover, undo/redo, prévia isolada e download JSON. Mensagem explícita de estado local, sem botão de salvar/publicar fictício.

Propriedade tenant/platform e evento platform são contratos de forma, não autorização. Envelope tenant legado intacto. Requisitos de criação Food consomem contratos compartilhados; não conferem quota/capacidade. BILL-001 continua como única futura autoridade persistida. Logs agora projetam metadados e descartam Error bruto/contextos arbitrários; API pública usada pela aplicação preservada.

UI dedicada conforme instrução do usuário: os arquivos executáveis, tokens, exports e dependências de `packages/ui` não foram alterados. Somente README/guia apontam para a nova responsabilidade. Main recente do Gemini foi incorporada; esta implementação não altera migrations, policies ou contratos raiz do CRM. As únicas correções na API são a execução portável do teste de boot (`node --import tsx`, sem IPC do CLI) e remoção de quatro bindings catch não utilizados no controller de inbox recebido de main, exigida pelo lint; respostas/lógica permanecem iguais. O lockfile acrescenta somente os quatro importers, preservando resoluções anteriores.

## Validação

Ambiente: Linux, Node 24.19.0, pnpm disponível 11.19.0 (manifesto mantém 12.4.1), TypeScript 5.9.3. Instalação com lockfile congelado passou, sem atualizar versões anteriores. Builds TypeScript também verificam os tipos dos novos pacotes.

| Comando / verificação | Resultado |
| --- | --- |
| `pnpm bipewpro:check` | 22 testes: contracts 7, logger 4, core 4, renderer 3, editor 2, fronteiras 2; builds, lint e arquitetura passaram |
| `pnpm foundation:check` | Execução final passou (exit 0), incluindo compatibilidade do logger/Fastify e as correções mínimas de boot/lint da API; cobre geração Prisma sem migration, fundação, UI atual, tenant, API, tipos e guardas |
| Typecheck de tenant/superadmin/API/UI/DB | Os cinco consumidores passaram |
| UI/tenant/API existentes | 19 / 32 / 6 testes passaram; avisos preexistentes do lint da API não são tratados como erros pelo contrato atual |
| `pnpm --filter @bipesend/web-builder demo:build` | Galeria: JS 389,27 kB / 121,57 kB gzip; CSS 11,81 kB / 3,01 kB gzip; não são budgets de site público |
| Smoke no Chromium 153.0.8010.0 | 17 verificações passaram; zero falhas, zero violações axe no recorte avaliado e zero overflow global |
| Regras/taskboard/segredos/arquitetura/brand/security e `git diff --check` | Passaram |

O Chromium padrão do Playwright não pôde ser baixado por timeout. A inspeção usou binário temporário de `@sparticuz/chromium@153.0.0`, com caminho passado por `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, sem acrescentar dependência ao projeto e sem desabilitar a política de mesma origem. A extração preservou ownership local, sem chown privilegiado. Relatório reproduzível e versionado: [bipewpro-smoke.json](bipewpro-smoke.json).

Navegador: light/dark em 320/360/768/1024/1440; dialog mobile com Escape/foco; edição real, undo/redo e download; largura real de iframe e CSS do título em 390/1280; origem opaca e links inativos; reduced motion e fonte raiz a 200% (não equivale à certificação de zoom do navegador). Axe avaliou o editor/sheet; o conteúdo da prévia foi verificado por DOM/CSS, sem alegar auditoria axe completa do site publicado. Screenshots de 360/1440 e sheet foram inspecionados visualmente; somente conteúdo fictício.

A revisão corrigiu a interpolação de cores que perdia contraste durante troca de tema, glyph substituído por SVG Lucide e organização do painel para evitar rolagem excessiva. O `packages/ui` antigo passou em testes/lint/tipos sem reforma. A revisão dos consumidores identificou também o formato `(metadados, mensagem)` do error handler Fastify; o logger agora suporta ambos os formatos sob a mesma projeção, com teste negativo de Error bruto.

## Limites explícitos

PAGE-001/WPRO-004 permanecem parciais: migrações futuras, registry completo, referências, resize/controles avançados e galeria completa de estados. WPRO-003 ainda fará o spike Pangea; reordenação por botão não é DnD. Sem API/DB/tenant real, autosave/revisão concorrente, enforcement de plano, upload, gestão Food/pedido/frete, navegação multipágina, domínio/publicação, shortcode/HTML/CSS/SVG arbitrário ou PHP.

Não houve E2E com Postgres/Redis, validação de tenant/RLS, medição Lighthouse de site publicado, Core Web Vitals de campo nem certificação WCAG. Axe/foco/reflow são verificações locais do recorte. Fontes da galeria usam fallback quando o host não fornece Inter/Poppins; o pacote respeita os tokens do SaaS.

## Referências técnicas verificadas

[Zod: objetos recursivos](https://zod.dev/api#recursive-objects) motivou proteção de ciclos/tamanho antes do schema recursivo. [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) sustenta a combinação de sandbox sem privilégios, documento separado e viewport real; iframe não substitui validação do conteúdo.
