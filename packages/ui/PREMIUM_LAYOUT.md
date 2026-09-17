# Guia de layout premium BipeSend

Escopo revisado em 2026-09-16: a reforma de `packages/ui` está adiada pelo usuário. As peças do BipeWPRO são implementadas em `packages/web-builder-ui`, com [guia próprio](../web-builder-ui/PREMIUM_LAYOUT.md). Este documento permanece referência futura para o SaaS. Não contém componentes implementados adicionais. Fontes canônicas: `README.md`, `src/index.ts`, `src/styles/tokens.css` e regras 12/14/22/24/30/32/35/37.

## Identidade e hierarquia

Inter para títulos, Poppins para corpo; números tabulares em métricas. Manter tokens atuais de marca azul/violeta, ação, contraste, borda, sombras, raio e motion. O painel oferece light/dark/sistema. O tema configurável de cada site publicado não modifica o painel, overlays ou campos do editor.

Tela operacional: PageContainer, PageHeader, FilterBar quando necessária e conteúdo. Evitar cards aninhados como decoração. Uma ação primária evidente; secundárias têm menor peso. Labels e descrições esclarecem ações sem tooltip obrigatório.

## Layout estável e responsivo

O shell usa altura mínima de viewport e flex/grid, com áreas de rolagem deliberadas. Cada filho flex que deve encolher precisa de min-width/min-height zero. Não aplicar altura fixa a texto/formulário que precise ampliar. Header, filtros e status não pulam ao alternar carregamento ou seleção.

No editor, toolbar fixa à composição, painel lateral redimensionável dentro de limites e canvas com scroll. O handle de resize tem alternativa por teclado e botão restaurar tamanho. Na largura pequena, o painel vira sheet com foco/retorno ao gatilho; o estado, schema, seleção e histórico continuam únicos.

Prévia por breakpoint usa iframe isolado ou renderer seguro definido no spike, com largura real de viewport. Zoom visual do canvas não troca breakpoint nem largura semântica da página. Escala de preview não substitui teste real em navegador mobile.

## Reutilização de componentes existentes

| Necessidade | Preferir | Responsabilidade da feature |
| --- | --- | --- |
| Ação e publicação | Button/IconButton | Permissão, submit, pending e resultado real |
| Configuração | Input/Select/Checkbox/Switch/Tabs | Schema e campos condicionais derivados de contracts |
| Busca | SearchField/Combobox | Query, cancelamento e descarte de resposta antiga |
| Seleção de assets | FileUpload + Dialog/Drawer | Upload real, autorização, quarentena e storage |
| Alertas | Alert/ErrorState/Toaster | Erro persistente versus feedback transitório |
| Listas e métricas | DataTable/MetricCard/StatusBadge | Dados reais, paginação, filtros e estados |
| Navegação | Tabs/DropdownMenu/Breadcrumb | Destino autorizado, rota ativa e menu real |
| Carregamento | Skeleton/Progress | Fase e progresso observável; sem porcentagem inventada |

Novos candidatos: EditorShell, ResizablePanel, InspectorSection, UnitField, SpacingField, ColorField, GradientField, ResponsiveValueField, DevicePreviewFrame, AssetPickerView, IconPickerView e SaveStatus. Eles entram em WPRO-004 conforme necessidade, não como exports vazios. Tree/layers com regras de nós ficam em web-builder, não em ui. Os controles desta lista pertencem à UI específica do construtor; não autorizam alterações neste pacote.

## Campos e feedback

Busca mantém largura ao foco, espaço entre ícone e texto e ring acessível; debounce não pode manter resposta antiga após troca de filtro. Campos de valor responsivo mostram breakpoint atual, origem herdada, override e restaurar herança. Alterar unidade valida conversão e não descarta valor sem avisar.

Estado alterado/salvando/salvo/conflito usa texto mais ícone. Não mostrar salvo antes do ACK. Erros de validação ficam associados ao campo e persistem; conflito de versão não dispara sobrescrita. Publicação e upload mostram etapa real e permitem recuperação, sem animação que simule sucesso.

Color/GradientField oferece entrada textual validada, amostra, contraste contextual e teclado. O valor do tema público fica em namespace próprio. Nenhum CSS de tenant é montado na folha global do SaaS.

## Motion, ícones e densidade

Motion usa os tokens existentes e não move a geometria do documento para hover. Skeletons e transições respeitam reduced motion. Não aplicar gradiente animado/partículas no workspace como padrão. Efeitos de conteúdo público são presets separados.

Ícones SVG Lucide têm tamanho/stroke consistentes e nome acessível quando acionáveis; decorativos são ocultos da árvore acessível. Busca de ícones não empacota o universo de bibliotecas. Tooltip acessível existente pode ser mantido, mas a tarefa continua compreensível sem hover.

Controles usam alvo confortável de 44 px conforme os tokens; compacto exige verificar a área de interação real e espaçamento. Texto legível, contraste AA e foco têm prioridade sobre densidade.

## Critério de aceite

- Galeria em desenvolvimento com dados sintéticos e exemplos de falha/empty/loading/disabled quando aplicáveis.
- Light/dark/sistema; reflow 320 px; uso em 360, 768, 1024 e 1440 px; zoom 200% e teclado virtual.
- Tab/Shift+Tab, setas, Enter, Escape, anúncio de alteração e retorno de foco funcionais.
- A ação não depende de cor, hover ou arraste. Reduced motion não esconde estado.
- Sem import de servidor, fetch oculto, token local duplicado ou regra de negócio em ui.
- Teste proporcional do comportamento e builds dos consumidores; não validar só className.

Atualizar README e exports quando a implementação existir. Mudança de token global é revisão de design system com impacto nos consumidores, não detalhe local do editor.
