# @bipesend/web-builder-ui

UI própria do BipeWPRO, criada conforme instrução do usuário em 2026-09-16. `packages/ui` continua com sua implementação atual; a reforma completa desse pacote está adiada.

## Responsabilidade e exports

`EditorShell`, `BuilderButton`, `BuilderField`, `InspectorSection`, `ElementTile`, `PanelNavigation`, `DeviceSwitcher`, `DevicePreviewFrame`, `PREVIEW_DEVICES` e tipo `PreviewDevice`.

Controles recebem props/callbacks; sem Food, planos, API, fetching, sessão ou persistência. Desktop mostra painel à esquerda e canvas à direita; mobile usa Dialog Radix, com foco/Escape/retorno. O portal permanece dentro do tema do editor. Prévia usa iframe isolado e largura real de 390/768/1280 px; escala visual não altera a largura semântica.

## Estilos e tipografia

Importar `@bipesend/web-builder-ui/styles.css` uma vez no CSS/entry global do consumidor. Essa folha importa `@bipesend/ui/tokens.css` e utiliza seletores `bw-ui-*`; não copia a paleta nem importa os componentes legados. O app fornece Inter/Poppins pelos tokens de fonte existentes. A galeria local pode usar o fallback de sistema; nenhum download externo de fonte é disparado pelo pacote.

Light/dark/sistema são resolvidos pelo host; a UI respeita `.dark` e `data-theme`. O tema do site publicado está no iframe e não altera o painel. Mudança de tema não interpola cores entre estados de contraste diferentes. Motion respeita reduced motion e o foco mantém outline visível.

## Galeria e validação

`pnpm bipewpro:dev` em `http://127.0.0.1:3110`. Consumidor real: `packages/web-builder`, com testes de interação e `pnpm bipewpro:smoke` para temas, larguras, drawer, foco e download. Galeria com dados explicitamente fictícios, sem conexão com tenant/superadmin.

WPRO-004 continua em andamento. Ainda faltam painel redimensionável, unidades além de px, spacing por lado, gradientes, galeria completa de estados e verificação manual assistiva. O guia [PREMIUM_LAYOUT.md](PREMIUM_LAYOUT.md) governa essa evolução.
