# Regras de layout e componentes

## Shell

Desktop: sidebar 240 px, topbar 64 px, conteudo com largura maxima e padding 24-32 px. Mobile: drawer ou bottom navigation, topbar compacta e acao primaria acessivel. A largura da sidebar nao deve quebrar o conteudo principal.

## Grid

Usar grid de 4 px para espacamento; cards alinhados por baseline; tabelas com colunas previsiveis; nao usar posicionamento absoluto para informacao essencial. Evitar layout shift reservando dimensao de imagens e skeletons.

## Componentes canonicos

Button, IconButton, Input, Select, Combobox, Dialog, Drawer, Tabs, Table, DataCard, MetricCard, EmptyState, ErrorState, Skeleton, Toast e ConfirmDialog ficam em `packages/ui`. Cada componente tem estados default, hover, focus, disabled, loading e error.

## Formularios

Labels visiveis, ajuda contextual, erro junto ao campo e resumo de erro no topo quando houver varios campos. Nao usar placeholder como label. Botoes de envio mostram estado de processamento e impedem duplo envio.

## Dados densos

Inbox pode usar tres colunas em desktop, duas em tablet e uma em mobile. Kanban tem alternativa de lista e comandos de teclado. Drag-and-drop nunca e a unica forma de ordenar, atribuir ou mover.

## Skeleton e lazy loading

Skeleton representa a forma real do conteudo, nao um spinner global. Lazy load para imagens, editor, graficos e modulos pesados; conteudo critico e acessivel sem depender de JavaScript tardio. Erro de um painel nao derruba a pagina inteira.

## Iconografia

Usar biblioteca SVG aprovada, com `aria-hidden` quando decorativa e label quando interativa. Nao usar emoji, caracteres Unicode ou imagens sem semantica como substitutos de icones.
