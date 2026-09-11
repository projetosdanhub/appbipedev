# UX e UI

## Principios

Clareza, densidade confortavel, hierarquia visual, feedback imediato, reversibilidade e linguagem simples. O painel nao deve parecer um dashboard de numeros sem contexto: cada metrica tem definicao, periodo, fonte e acao recomendada. Icones sao SVG do sistema visual; nao usar emojis genericos como icones de interface.

## Layout do tenant

Sidebar de 240 px em desktop, recolhivel; topbar com busca, tenant, notificacoes e perfil; conteudo em grid; paineis com cantos sutis; estados de loading com skeleton; empty states com proxima acao; erros com mensagem acionavel.

## Navegacao

Inicio, Inbox, Contatos, CRM, Automacoes, Catalogo, Paginas, Conhecimento, Integracoes, Equipe, Billing e Configuracoes. Mostrar somente itens autorizados; nao esconder permissoes importantes apenas por CSS.

## Interacoes

Drag and drop deve ter alternativa por teclado e botoes. Filtros sao persistiveis por usuario/tenant, com reset claro. Confirmacoes so para operacoes destrutivas ou de alto impacto; usar undo quando seguro.

## Mobile

A experiencia responsiva e prioridade desde o primeiro componente. Inbox e CRM devem funcionar em 360 px; tabelas viram cards ou rolagem explicita; sidebar vira bottom sheet/drawer; acao primaria fica alcancavel.
