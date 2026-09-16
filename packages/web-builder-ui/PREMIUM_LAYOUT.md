# UI do construtor BipeWPRO

Guia ativo da UI específica; preserva regras 12/14/22/24/30/32/35/37 e a instrução do usuário de adiar a reforma global de `packages/ui`.

## Composição

Marca e título do documento no topo, dispositivos e ações explícitas. Elementos/Camadas/Ajustes organizam o painel. A mesma árvore, seleção e histórico servem a todas as larguras; não duplicar consultas ou regras por dispositivo. Desktop usa painel/canvas com rolagem independente, min-width/min-height zero e shell estável. Mobile usa sheet acessível e mantém a prévia alcançável.

Reutilizar tokens canônicos azul/violeta, Inter/Poppins, espaçamento, raio e ação. Não inserir valores locais para aproximar screenshots. O site editado usa seu próprio documento de estilo e fica isolado da UI operacional.

## Campos e comportamento

Labels visíveis, erros persistentes vinculados ao campo, valores textuais e teclado. Cada dispositivo mostra herança; aplicar override não copia todos os valores herdados. Restaurar remove o override. Usar schemas de contracts e react-hook-form na composição; UI apenas apresenta.

Rascunho local, salvando, salvo e conflito devem refletir fatos. Só mostrar salvo após ACK; exportação de JSON local não é persistência nem publicação. Não incluir botões de publicar, upload ou integração com aparência funcional antes de existir o backend autorizado.

## Próxima evolução WPRO-004

O painel desktop já oferece resize por teclado: setas alteram a largura em passos limitados, `Home` restaura 312 px e `End` aplica o máximo. Duplo clique também restaura a largura. Próximas fatias: arraste por ponteiro, unidade/cor/espaçamento por lado, gradiente, previews de falha/empty/loading/conflict quando aplicáveis; navegação acessível de árvores extensas e busca. Preservar reduced motion, forced colors, noindex da galeria e semântica dos controles. Ícones SVG Lucide importados nominalmente; não empacotar bibliotecas inteiras de assets de sites.

## Aceite

Testes reais de interação; build e imports públicos; inspeção light/dark em 320/360/768/1024/1440 px; teclado/Escape/retorno, reflow e ampliação. Axe complementa avaliação manual, sem certificar WCAG. Medir bundle do editor separado do HTML público. Alterações do SaaS global exigem uma etapa própria, não entram como consequência desta UI.
