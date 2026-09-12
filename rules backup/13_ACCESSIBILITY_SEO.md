# Acessibilidade e SEO

## Acessibilidade

Alvo WCAG 2.2 AA. Toda entrada tem label; foco visivel; ordem de tab previsivel; contraste validado; mensagens de erro ligadas ao campo; dialogs com foco preso; sem depender apenas de cor; `prefers-reduced-motion`; textos alternativos uteis; live regions para eventos de inbox.

## SEO

Landing e sites publicados possuem title, description, canonical, robots, sitemap, Open Graph, Twitter card, headings semanticos, schema JSON-LD quando aplicavel, alt text e performance Core Web Vitals. Painel autenticado usa `noindex` e nao deve vazar conteudo em HTML publico.

## Dominios

Slugs sao normalizados, reservados e unicos. Dominios customizados passam por verificacao DNS, provisionamento TLS e estado de validacao. Conteudo publicado tem preview e rollback.

## Pixel e tracking

Tags sao registradas por tenant, validadas e carregadas apenas em paginas autorizadas. Consentimento, redacao de PII, allowlist de destinos e auditoria sao obrigatorios. Nenhum script arbitrario entra no editor.

## Status e reportes

Estado de API/integracao nunca depende somente de cor ou de animacao: exibir
texto, icone SVG, ultima verificacao e `aria-label`. O ponto vermelho pode
piscar suavemente apenas para erro ativo e deve parar com
`prefers-reduced-motion`, aba oculta ou resolucao. O botao `Reportar erro` deve
ser operavel por teclado e anunciar protocolo, sucesso e falha em live region.
