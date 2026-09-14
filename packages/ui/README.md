# @bipesend/ui — BipeSend Foundation v1

Biblioteca React DOM compartilhada entre tenant-web e superadmin-web. Mantém a marca e oferece light/dark/sistema, cantos arredondados, foco visível, estados claros e composição confortável. O catálogo executável fica em `/design-system` no tenant-web **apenas em desenvolvimento**; em produção retorna 404.

## Instalação e tema

O workspace já declara a dependência. No CSS global do app, depois de `@import "tailwindcss"`, importar `@bipesend/ui/styles.css`. Não importar esse CSS em cada componente. O app fornece Inter (`--font-inter`) e Poppins (`--font-poppins`) e envolve o conteúdo em ThemeProvider com atributo class, defaultTheme=system e enableSystem. A preferência é visual; nunca incluir dados de usuário no tema persistido.

Tokens de referência estão em `src/styles/tokens.css`; aliases permitem migração incremental dos consumidores legados. Novas telas usam `--bg-canvas`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--border-control`, `--action-primary`, `--action-foreground`, `--focus-ring`, `--status-*`, `--radius-*` e `--motion-*`.

| Decisão | Contrato |
| --- | --- |
| Tipografia | Inter em títulos; Poppins no corpo, números tabulares em indicadores |
| Marca | azul #007BFF + violeta #6366F1; tons de ação ajustados por contraste |
| Radius | controles 14 px, cards 18 px, diálogos 24 px |
| Altura | operacional 44 px; auth 54 px; compacto 32 px só quando a composição mantém alvo/espaçamento adequado |
| Layout | sidebar 256/80 px; header 64 px; leitura/formulário têm largura limitada |
| Motion | 140/180/240 ms; reduced motion reduz deslocamento/duração sem esconder estado |
| Tema | light/dark/sistema no workspace; AuthLayout delimita sua superfície clara |
| Breakpoints | mobile web próprio <1024 px; tabela vira cards <768 px; reflow desde 320 px |

## Catálogo de componentes

| Grupo | Exports | Contrato essencial |
| --- | --- | --- |
| Ações | Button, IconButton | CVA, loading bloqueia clique, type=button; IconButton exige label |
| Formulários | Input, PasswordInput, Textarea, Select | label visível, ID único, descrição/erro persistente; Select é nativo |
| Seleção | Checkbox, Radio, Switch | inputs nativos com teclado, estado e nome acessível |
| Busca | SearchField, Combobox, TenantSwitcher | debounce cancelável; combobox com busca/setas/Enter/Escape; tenant switcher apenas visual |
| Código | OtpInput | um input semântico, inputMode numeric, autocomplete, seis dígitos e paste |
| Estrutura | Card e partes, PageContainer, PageHeader, FilterBar, Breadcrumb, SkipLink | hierarquia, ações, largura e salto para conteúdo |
| Sobreposições | Dialog, Drawer/Sheet e partes, ConfirmDialog | Radix: foco contido, Escape e retorno ao gatilho; confirmação com pendência/erro |
| Menus | DropdownMenu e partes, Popover e partes, Tooltip e partes | Radix; tooltip só ajuda complementar |
| Navegação local | Tabs, TabsList, TabsTrigger, TabsContent, Pagination | teclado e estado controlado |
| Dados | DataTable, DataColumn | sorting/seleção/paginação controlados; caption; renderMobileCard separado |
| Feedback | Badge, StatusBadge, Alert, EmptyState, ErrorState, Skeleton, MetricCard, Progress | texto além de cor; sem inventar métrica zero; erro persistente |
| Integração | IntegrationStatusBadge, LastCheckedLabel | sete estados canônicos; unknown se não verificado; horário explícito |
| Identidade | BrandLogo, Avatar, ThemeToggle | proporção da marca, alternativa textual, preferência de tema |
| Arquivos | FileUpload | seleção/validação local; não envia, não executa scan, não valida autorização |
| Compatibilidade | AuthLayout, GlassPill, Toaster, primitives de Form | consumidores existentes preservados; novos fluxos seguem o contrato de estados |

Confira `src/index.ts` para os nomes exatos das partes exportadas e os tipos de props. Nem toda peça precisa de use client: componentes estáticos podem ser renderizados no servidor; a fronteira que usa hook/evento é cliente.

## Exemplo de formulário

```tsx
'use client';
import { Button, Input } from '@bipesend/ui';
// A feature decide schema, estado e action; a UI apenas apresenta.
export function ContactForm({ pending, error, submit }: {
  pending: boolean; error?: string; submit(data: FormData): void;
}) {
  return <form action={submit} className="grid gap-4">
    <Input name="name" label="Nome do contato" autoComplete="name" errorMessage={error} />
    <Button type="submit" size="md" isLoading={pending}>Salvar contato</Button>
  </form>;
}
```

Erro de autenticação é global/genérico. Erro de formato fica ligado ao campo, com aria-invalid e aria-describedby. Loading preserva texto e bloqueia duplicata; erros não desaparecem por timeout nem encobrem o valor digitado.

## Dados, mobile e estado

DataTable recebe rows, columns, rowKey, sort/onSort e selected/onSelectionChange. A feature aplica filtro/sort/paginação no servidor para dados reais, com limite máximo e cache por tenant/permissão. A seleção do cabeçalho atua **na página carregada**, preservando seleções controladas de outras páginas; a UI deve informar esse escopo antes de ação em massa. Uma ação “todos os resultados” exige contrato próprio de snapshot/filtro e autorização.

renderMobileCard oferece uma composição legível, sem comprimir a tabela. As duas composições compartilham o mesmo estado; CSS oculta a apresentação não aplicável da árvore acessível. A navegação móvel completa está em `apps/tenant-web/src/features/workspace/mobile-navigation.tsx`, enquanto a desktop fica em arquivo próprio. Nenhuma query de negócio é duplicada para detectar largura de tela.

Estados: loading preserva shell; empty explica próximo passo; erro oferece retry e protocolo seguro; success não atrasa navegação; disabled explica indisponibilidade quando necessário. Permission denied não é empty. Última verificação ausente não é agora. Galeria usa dados identificados como exemplo; dashboard real mostra indisponibilidade onde não há backend.

## Acessibilidade e performance

Meta WCAG 2.2 AA: contraste textual 4,5:1 (texto grande 3:1), controles/foco perceptíveis, teclado, reflow e identificação de erro. O padrão confortável de toque é 44 px. Validação automática não substitui leitor de tela, zoom, foco e avaliação do fluxo completo. Medir especialmente gradientes e texto sobre imagem.

Usar HTML nativo antes de primitives adicionais. Ícones SVG decorativos ficam aria-hidden. Evitar dependência grande para uma peça pequena; charts/canvas/editor futuros devem ser carregados por rota. Sem polling, analytics ou acesso a rede dentro do pacote. Respeitar reduced motion e forced colors. Core Web Vitals são metas de campo definidas em config, ainda sem medição de produção nesta entrega.

## Marca

`assets/bipesend-logo.webp` é o ativo canônico copiado sem alteração da arte existente, com proporção 1080×328. `pnpm brand:sync` mantém os caminhos públicos legados. Veja `assets/README.md`: uma segunda composição vertical/reversa não estava disponível. BrandLogo usa superfície branca em dark para preservar a arte.

## Validar e evoluir

`pnpm --filter @bipesend/ui test`, `lint` e `typecheck`; `pnpm ui:smoke` para galeria light/dark, tamanhos e teclado. Evidências em `docs/audit/validation.md`.

Ao adicionar componente: documentar necessidade/props/estados, implementar sem domínio, incluir exemplo, testar a falha comportamental possível, validar temas/mobile e atualizar exports. Segurança real de tenant, upload e sessão permanece no servidor; aparência de disabled não autoriza nem revoga operação.
