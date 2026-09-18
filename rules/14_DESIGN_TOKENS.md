# Tokens canônicos — v2

A fonte executável é `packages/ui/src/styles/tokens.css`; a documentação de uso é `packages/ui/README.md`. Esta regra substitui a antiga paleta indigo e o contrato multitema do workspace.

- Inter em títulos, Poppins em corpo. Não carregar fontes dentro de componentes; o app carrega uma vez e fornece as variáveis.
- Preservar a marca #007BFF/#6366F1 no material institucional. Botões e texto usam `--action-primary`, `--action-foreground` e `--action-gradient`, calibrados por tema.
- Canvas, superfície, texto, borda, seleção, foco, status, espaçamento, radius, sombra, motion e empilhamento usam tokens semânticos. Consulte o CSS em vez de manter tabelas numéricas duplicadas.
- Controles operacionais têm alvo confortável de 44 px; auth mantém 54 px. O mínimo AA de 24 px tem exceções; não confundir a escolha de produto de 44 px com esse mínimo normativo.
- Cantos arredondados: controles 14 px, cards 18 px, diálogos 24 px; pill reservado a badges. Sem cartões excessivos em listas densas.
- O workspace, autenticação e mobile web usam tema claro único. Não oferecer alternância de tema nem reagir à preferência escura do sistema.
- Temas do BipeWPRO afetam somente o conteúdo publicado/prévia isolada, nunca o shell, overlays ou campos do painel. Logos existentes mantêm proporção e cores.
- Motion funcional 140/180/240 ms; reduced motion elimina deslocamentos/espera. Não atrasar navegação para exibir sucesso.
- Validar contraste no componente renderizado, incluindo gradientes, hover, focus, disabled, portais e erro; axe não mede toda combinação de imagem/gradiente.
- Novos tokens requerem necessidade demonstrável, uso semântico e atualização conjunta do catálogo e das evidências. Não criar tokens por tela.
