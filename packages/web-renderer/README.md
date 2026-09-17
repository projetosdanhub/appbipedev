# @bipesend/web-renderer

Renderer puro compartilhado, consumido pela prévia real do editor. Depende apenas de contracts. Não importa editor/UI/React/servidor, não busca dados e não executa scripts.

## API implementada

`renderPage(input, { preview? })` revalida e retorna `{ html, css, nodeCount }`. Renderiza os quatro blocos iniciais em uma única árvore semântica; CSS usa as mesmas regras mobile/tablet/desktop. Texto e atributos são escapados; propriedades CSS são compiladas exclusivamente dos campos tipados. Links passam pela política de URL.

`renderPreviewDocument(input)` cria documento HTML com idioma, title/description escapados, noindex e CSP que nega recursos/rede/scripts e permite somente o CSS gerado. Links viram elementos de apresentação na prévia. Consumir em iframe `sandbox=""`, sem allow-scripts/allow-same-origin, conforme web-builder-ui. Nenhum canal de mensagens foi aberto.

## Limites e próximos cards

O renderer não é sanitizador de HTML/CSS/SVG livre. Esses formatos não são aceitos nesta versão; shortcodes/PHP também não. Não reutilizar escapeHtml como proteção para contexto JavaScript/CSS arbitrário.

A string pública não inclui JS de edição. Isso não homologa publicação, SEO/canonical/sitemap, mídia, consentimento ou métricas de produção: WPRO-007, PAGE-003/004 e widgets posteriores completam esses fluxos. Na publicação, o adapter deve aplicar os headers/CSP e domínio verificado próprios; não reutilizar noindex da prévia como página pública.

## Verificação

`pnpm --filter @bipesend/web-renderer build` e `test`; `pnpm bipewpro:smoke` verifica o renderer no iframe. Testes negativos cobrem atributos, texto, links e CSS malformados; sem infraestrutura externa.
