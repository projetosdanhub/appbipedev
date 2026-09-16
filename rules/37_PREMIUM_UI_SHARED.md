# UI premium e pacotes compartilhados

Complementa regras 12, 14, 22, 24, 30, 32 e 35. `packages/ui/src/styles/tokens.css` continua sendo a fonte executável dos valores. Guia de aplicação: `packages/ui/PREMIUM_LAYOUT.md`. Escopo: novas peças e refatorações autorizadas; não obriga reforma global fora do card.

## Composição

- Hierarquia clara: contexto, título, ação principal, filtros necessários e conteúdo. Uma ação primária por grupo; sem métricas fictícias ou controles inertes.
- Workspace estável com flex/grid e altura mínima apropriada. Filhos roláveis usam min-height/min-width zero; não cortar texto por altura fixa.
- Skeleton mantém a geometria plausível; loading local não desmonta shell, filtro ou rascunho. Erro não se disfarça de vazio.
- Toolbar e busca não expandem ao foco; debounce cancelável e descarte de respostas obsoletas no data layer. Usar filtro de período apenas onde os dados o exigem.
- Sidebar, métricas, ícones, texto e espaçamento seguem componentes existentes. Light/dark/sistema mantêm semântica; o painel não herda CSS editado do site.
- Mobile tem navegação e disposição próprias do mesmo estado/contrato. Não duplicar consultas, permissões ou cálculo por viewport.

## Componentes

Antes de criar, procurar export existente. Primitives genéricas ficam em ui; o editor compartilhado fica em web-builder; regras de Food/publicação ficam nos módulos de negócio. UI não busca dados, lê env secreto ou decide permissão/plano.

Novos controles de cor, unidade, espaçamento, gradiente e breakpoint precisam de labels, valor textual, estados de erro e teclado. Foco visível é obrigatório; tooltip pode complementar, nunca carregar a única explicação. Não remover uma implementação acessível existente apenas por preferência estética.

Preservar Inter/Poppins e azul/violeta no SaaS. Branding do conteúdo publicado é um contrato separado e validado. Glass, blur ou gradiente não são requisitos universais de componente. Não criar valores locais para reproduzir screenshot.

## Fronteiras e verificação

Pacotes não importam apps. Contracts e core são puros; UI é React DOM; security/auth/db/logger de servidor não entram no cliente. Exports server/client são explícitos. Não criar pastas genéricas `misc`/`utils` para esconder responsabilidades.

Evoluir por adição e manter exports legados durante a migração. Dependências novas exigem uso real, licença adequada, compatibilidade, budget e manutenção; não instalar todas as bibliotecas de ícones ou widgets antecipadamente.

O card de uma peça compartilhada inclui galeria de desenvolvimento, teclado/foco/zoom, reduced motion, light/dark, 320/360/768/1024/1440 px, estados de falha e verificação do bundle dos consumidores. Testar comportamento que pode falhar; documentação de arquitetura não exige executar E2E de módulos não alterados.
