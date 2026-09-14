# Implementação do design system — v2

`packages/ui/README.md` descreve exports, estados e composição. Importar `@bipesend/ui/styles.css` uma vez no CSS global após Tailwind; consumir tokens, nunca uma cópia local.

1. Procurar um componente existente e avaliar os estados necessários.
2. Separar componente genérico, composição da feature e acesso ao servidor. UI não importa auth/db/security, não busca dados e não decide entitlements.
3. Preferir HTML nativo. Dialog, dropdown, tabs, tooltip e popover usam Radix. Combobox segue listbox/teclado; tabela preserva semântica nativa.
4. Fornecer nome acessível, foco, erro persistente, carregamento, vazio, disabled e redução de movimento quando aplicáveis. ConfirmDialog precisa de descrição, cancelamento seguro e estado de falha.
5. Adicionar exemplo no catálogo `/design-system` (somente desenvolvimento), com dados identificados como exemplo e sem autenticação fictícia nas rotas reais.
6. Testar a interação que pode falhar: Escape, retorno de foco, seta/Enter, colagem, seleção, reenvio, duplo submit e erros de rede. Não testar apenas className.
7. Validar light/dark, 320/360/768/1440 px, teclado e reflow. Native mobile será implementação própria; o mobile web usa composição própria da mesma feature.
8. Documentar API, limites, dependências e compatibilidade. Introduzir mudanças incompatíveis com migração de consumidores, nunca apenas renomear props.

A lista do pacote é uma fundação reutilizável, não uma afirmação de que todos os módulos CRM estão operacionais. Tabelas, gráficos, editores, datas e upload pesado exigem evolução por card, com orçamento de bundle e validação proporcional.
