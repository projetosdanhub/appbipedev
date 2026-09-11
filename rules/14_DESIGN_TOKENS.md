# Tokens de design

## Tipografia

- UI: Inter auto-hospedada, fallback `system-ui`.
- Marketing: Manrope opcional, fallback `system-ui`.
- corpo: 14 px em densidade de painel; 16 px em formularios publicos.
- escala: 12, 14, 16, 18, 20, 24, 28, 32, 40 px.
- line-height: 1.4 para UI e 1.55 para leitura.

## Cores propostas

| Token | Valor | Uso |
| --- | --- | --- |
| `brand.600` | `#356AE6` | acao primaria |
| `brand.700` | `#2856C7` | hover/active |
| `ink.900` | `#172033` | texto principal |
| `ink.600` | `#536078` | texto secundario |
| `surface.0` | `#FFFFFF` | cards |
| `surface.50` | `#F7F9FC` | fundo |
| `border.200` | `#E3E8F1` | divisorias |
| `success.600` | `#16845B` | sucesso |
| `warning.600` | `#A96B05` | alerta |
| `danger.600` | `#C23B52` | erro |

Validar contraste de cada combinacao antes de congelar. Modo escuro pode ser adicionado depois de estabilizar os tokens.

## Espacamento e formas

Base de 4 px; gaps comuns 8, 12, 16, 24, 32; radius 8 para campos, 10 para cards e 12 para modais; botoes com altura minima 40 px; icones SVG de 18 ou 20 px; sombras discretas.

## Motion

Transicoes de 120-180 ms, sem animacao decorativa em excesso. Respeitar reduced motion e evitar layout shift.

## Papeis tipograficos canonicos

Usar os papeis abaixo em vez de inventar tamanhos por pagina:

| Papel | Tamanho | Line-height | Peso | Uso |
| --- | ---: | ---: | ---: | --- |
| page-title | 28 px | 36 px | 700 | titulo principal do painel |
| section-title | 20 px | 28 px | 600 | secoes e titulos de pagina |
| card-title | 16 px | 24 px | 600 | titulos de cards e registros |
| body | 14 px | 20 px | 400 | texto padrao do painel |
| public-body | 16 px | 25 px | 400 | formularios e paginas publicas |
| description | 14 px | 20 px | 400 | descricoes e ajuda contextual |
| label | 12 px | 16 px | 600 | labels, metadados e auxiliares |
| navigation | 14 px | 20 px | 500 | menu lateral e navegacao |
| tab | 14 px | 20 px | 600 | abas internas |
| button | 14 px | 20 px | 600 | botoes e acoes |

O tamanho de 40 px fica reservado para hero de marketing, nunca para o painel
operacional. Nao usar texto menor que 12 px em informacao essencial. Evitar
caixa alta prolongada, texto condensado e mais de duas familias tipograficas.

## Contraste e superficies

- texto normal deve atingir contraste minimo de 4.5:1;
- texto grande e elementos graficos essenciais devem atingir pelo menos 3:1;
- contraste deve ser validado tambem em hover, selected, disabled e dark mode
  quando este existir;
- bordas e divisorias nao podem ser a unica forma de separar conteudo;
- tokens de cor sao a unica fonte para texto, fundo, borda, estado e acao;
- gradientes sao decorativos, exigem fallback solido e nao podem carregar
  significado de erro, sucesso, permissao ou status;
- foco visivel deve usar indicador de pelo menos 2 px;
- nao usar blur ou opacity para reduzir a legibilidade.
