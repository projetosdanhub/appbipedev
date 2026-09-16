# @bipesend/web-builder-core

Núcleo puro do BipeWPRO. Depende apenas dos contratos; não conhece React, apps, sessão, banco, rede ou env. Consumido pelo editor e seus testes.

## API implementada

`createNode`, `WIDGETS`, `findNode`, `resolveStyles`, `applyCommand`, `createHistory`, `executeCommand`, `undo`, `redo`. Quatro blocos: container/heading/text/button. Comandos de inserir, remover, mover, props e estilos são imutáveis, validados integralmente e falham sem alterar a árvore original. A posição de move é a posição final após a remoção. Raiz protegida; destino descendente, ID duplicado e documento inválido são rejeitados.

Uma árvore; base mobile → tablet 768 → desktop 1024. Remover override restaura herança; zero é valor válido. Histórico limitado a 50 entradas, com invalidação do redo ao criar nova sequência.

`describeSiteCreation` consome os contratos de criação/Food e descreve capacidades e incremento de cotas: landing = 1 site + 1 página; Food = 1 site + 1 página + 1 catálogo. Não consulta plano nem reserva vagas. BILL-001 fará isso atomicamente no servidor, derivando proprietário da sessão.

## Uso e validação

`pnpm bipewpro:build`, `pnpm --filter @bipesend/web-builder-core test`. Funções recebem documento validável; IDs novos são fornecidos pelo chamador. Não adicionar relógio, gerador aleatório, storage ou autorização ao núcleo.

PAGE-001 continua em andamento: migrações de futuras versões, registro extensível com capabilities e referências precisam do próximo recorte. Esta entrega rejeita versões desconhecidas e não converte documentos Elementor/WordPress.
