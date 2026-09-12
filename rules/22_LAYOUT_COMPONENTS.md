# Layout e componentes canônicos

## 1. Regra

Primitives reutilizáveis vivem em `packages/ui`. Feature pode compor componentes, mas não recriar Button/Input/Dialog localmente por conveniência.

## 2. App shell

### Desktop
- sidebar expandida: 256 px;
- sidebar recolhida: 72 px;
- topbar: 64 px;
- conteúdo: padding 24–32 px;
- largura fluida; páginas de leitura podem limitar linha, páginas de dados podem usar largura total;
- sidebar não sobrepõe conteúdo em desktop.

### Tablet
- sidebar recolhida ou drawer conforme largura/contexto;
- padding 20–24 px.

### Mobile
- drawer para navegação;
- topbar 56 px;
- padding 16 px;
- uma coluna por padrão;
- ações críticas não ficam fora da viewport.

## 3. Auth shell

`AuthShell`, `AuthCard`, `AuthHeader`, `AuthFooter` e `AuthIllustrationPanel`.

Desktop:
- min-height viewport;
- painel visual 42–46%;
- painel de formulário 54–58%;
- card/form max-width aproximada 440–480 px;
- controles confortáveis 44–48 px.

Mobile:
- painel visual removido ou reduzido;
- logo no topo;
- formulário largura total com margens 16–24 px;
- conteúdo scrollável com teclado virtual.

## 4. Componentes base

- Button
- IconButton
- Input
- PasswordInput
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- OtpInput
- Badge
- Tooltip
- Popover
- DropdownMenu
- Tabs
- Breadcrumb
- Dialog
- ConfirmDialog
- Drawer
- Sheet
- Toast
- Alert
- InlineMessage
- Skeleton
- EmptyState
- ErrorState
- DataTable
- Pagination
- DataCard
- MetricCard
- Avatar
- TenantSwitcher
- SearchField
- FilterBar
- FileUpload
- Progress
- StatusBadge
- IntegrationStatusBadge
- LastCheckedLabel

## 5. Estados

Todo componente interativo deve cobrir quando aplicável:
`default`, `hover`, `focus-visible`, `pressed/selected`, `disabled`, `loading`, `success`, `warning`, `error`.

## 6. Button

Variantes:
- primary;
- secondary;
- subtle/ghost;
- danger;
- link.

Não ter duas ações `primary` competindo no mesmo bloco. Loading preserva largura e mantém label compreensível.

## 7. Input

Altura canônica, label, descrição, prefix/suffix opcional, estado de erro e foco. Ícone não reduz área de texto. Error text não causa salto excessivo em formulários previsíveis.

## 8. PasswordInput

Inclui toggle acessível de visibilidade. `autocomplete` correto (`current-password` ou `new-password`). Medidor de força é orientação, não única regra de validação.

## 9. OtpInput

Implementação preferencial é um único input semanticamente coerente com visual segmentado, ou grupo robusto equivalente.

Requisitos:
- 6 dígitos por padrão, configurável;
- teclado numérico mobile (`inputmode=numeric`);
- colagem do código completo via Ctrl/Cmd+V e menu de colar;
- avançar automaticamente;
- Backspace previsível;
- setas/foco acessíveis;
- não bloquear password managers;
- erro não apaga código automaticamente;
- permite selecionar tudo e substituir;
- `autocomplete="one-time-code"` quando aplicável.

## 10. Dialog/Drawer

Foco preso, ESC quando seguro, overlay, restauração de foco, título semântico. Ação destrutiva nomeada. Mobile pode trocar dialog grande por sheet.

## 11. DataTable

Sort, filtros, paginação, loading/empty/error, seleção e ações. Mobile escolhe entre scroll explícito ou card view conforme tarefa.

## 12. Componentes de feedback

`Alert` para mensagem persistente; `Toast` para confirmação breve; `InlineMessage` junto do contexto; `ErrorState` para falha de bloco/página.

## 13. Skeleton

Representa forma real. Sem shimmer agressivo; animação reduzida/desligada em reduced motion.

## 14. Não permitido

- criar botão via `<div onClick>`;
- modal sem focus trap;
- ícone sem nome acessível quando ação;
- hardcode de token;
- tooltip como única forma de entender função essencial;
- dropdown para ação primária frequente;
- componente duplicado com aparência ligeiramente diferente.
