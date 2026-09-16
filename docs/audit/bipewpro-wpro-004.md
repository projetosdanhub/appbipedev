# Evidência WPRO-004 - evolução dos controles do editor

Data: 2026-09-16. Branch de trabalho: `work/bipewpro-next`. O card continua `IN_PROGRESS`: gradientes, galeria completa de estados e navegação/busca de árvores extensas permanecem abertos.

## Entregas desta sequência

- Painel desktop redimensionável por teclado e ponteiro, com largura de 256 a 520 px, foco preservado, captura do ponteiro e restauração para 312 px.
- Espaçamento interno por lado, com valores tipados em `px`, `rem` ou `%`; documentos legados com número em pixels continuam válidos.
- Limites por unidade no contrato: `px` até 160, `rem` até 10 e `%` até 100. Unidades livres, `calc(...)` e valores fora do limite são rejeitados.
- Renderer público converte somente comprimentos validados e mantém propriedades por lado dentro do CSS gerado.
- Cor textual hexadecimal e seletor visual sincronizado para texto e fundo, sem aceitar CSS livre.
- Guia premium e taskboard vinculados a esta evidência.

## Testes acrescentados

- Redimensionamento por teclado, arraste primário, clamp e término da interação.
- Roundtrip de comprimentos válidos e rejeição de unidade/valor inválido.
- CSS renderizado com `px`, `rem`, `%` e lados individuais.
- Aplicação responsiva de espaçamento por lado e sincronização do seletor visual de cor.

## Limites preservados

Não há persistência, publicação, autorização de tenant, enforcement de plano, gradiente arbitrário ou CSS livre. Os controles editam apenas o documento local versionado e continuam sujeitos aos schemas de `contracts/web` e à revalidação do renderer.
