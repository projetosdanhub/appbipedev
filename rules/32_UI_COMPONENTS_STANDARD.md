# Contrato comportamental de componentes — v2

Esta versão elimina as instruções antigas de erro temporário e animações de 2–3 segundos. Referências: regras `12`, `14`, `24`, `30`, catálogo e testes de `packages/ui`.

- Labels visíveis, IDs únicos, erros persistentes e texto auxiliar associado. Erro local próximo do campo; resumo de falhas no formulário quando útil. Não depender apenas de cor.
- `Button` usa type=button por padrão; submit deve ser explícito. `isLoading` bloqueia clique mesmo com disabled=false recebido do consumidor.
- `IconButton` exige label; tooltip complementa, sem substituir nome acessível. Controle tocável ≥44 px na composição padrão.
- Dialog/Drawer tratam foco, Escape, descrição e retorno ao gatilho. A ação irreversível tem contexto concreto, cancelamento inicial e proteção de concorrência; erro permanece aberto.
- Busca tem debounce cancelável. Respostas obsoletas devem ser descartadas pelo data layer; componente visual não implementa cache de negócio.
- Tabela informa caption, sort, escopo da seleção e paginação. Mobile apresenta cards próprios quando a tarefa pedir; detalhes continuam disponíveis por navegação.
- Estados comunicam dados reais. `—` significa indisponível; zero é apenas contagem confirmada. Demonstração sempre identificada; botão de produto precisa agir, orientar ou explicar indisponibilidade.
- Skeleton decorativo é oculto da árvore acessível; o contêiner comunica carregamento. Toast é feedback não crítico; erro impeditivo não expira sozinho.
- Upload do pacote apenas seleciona/valida localmente: servidor confere tamanho, MIME real, quarentena, varredura, escopo, limites e storage privado.
- Não há scrollbar animada obrigatória nem glassmorphism obrigatório. O contraste e a leitura têm prioridade.
- `use client` apenas na fronteira interativa necessária; dependências de servidor não podem atravessá-la.
