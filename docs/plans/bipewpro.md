# BipeWPRO - Plano de produto, arquitetura e execução

Versão 1.0 | 15 de setembro de 2026 | Planejamento para implementação por etapas

Repositório: projetosdanhub/appbipedev. Branch: `feat/bipewpro-planning`. Base auditada: `489fae20e9370d099c1a77701fa1855deb4bb0c4`.

Este documento especifica a evolução do BipeSend para criar sites, landing pages e catálogos Food. O planejamento foi entregue primeiro; a execução inicial de WPRO-002 está registrada em `docs/audit/bipewpro-foundation.md`. Já existe galeria local de edição com quatro blocos, sem CRUD, autorização/cotas persistidas ou publicação. O estado de implementação não deve ser inferido das funcionalidades futuras descritas neste plano. O Markdown é a fonte técnica versionada; o PDF é sua edição para leitura. Cards e estado de execução continuam em `docs/taskboard.json`.

## 1. Resultado esperado e decisões de partida

O BipeWPRO será um único produto de criação e publicação, usado pelo contratante e pelo superadmin. Na entrada, a pessoa escolhe **Site / landing page** ou **Catálogo Food**, começa de um modelo ou de uma página em branco, edita com prévia responsiva e publica em endereço provisório ou domínio verificado.

A referência é a liberdade de composição do Elementor Pro, com gestão de catálogo separada da aparência e uma experiência operacional própria do BipeSend. Elementor, WooCommerce, Nuvemshop e Shopify são referências de produto citadas pelo usuário, não dependências nem uma promessa de compatibilidade com seus plugins, temas ou formatos.

Decisões adotadas para esta proposta:

- Painel de elementos/propriedades à esquerda e prévia à direita, conforme as imagens enviadas. A frase que menciona os dois à direita foi interpretada pelas referências visuais. O lado do painel pode virar preferência de interface sem alterar o documento.
- Uma árvore de conteúdo com estilos por breakpoint; não criar duas páginas ou duas regras de negócio para desktop/mobile.
- Manter Inter/Poppins, azul/violeta, tema claro único e componentes existentes no painel. O tema do site publicado é personalizável e independente do tema do painel.
- Cabeçalho, rodapé, navegação, páginas, templates e conteúdo reutilizável usam o mesmo motor.
- O Food terá menu próprio para produtos, categorias, adicionais, disponibilidade, entrega e pedidos. O editor visual seleciona e apresenta esses dados; não se torna o cadastro de comida.
- Autorização, capacidades e cotas são verificadas no servidor desde o primeiro CRUD. A tela comercial de planos pode chegar depois.
- Criação de conteúdo próprio pelo superadmin é ilimitada comercialmente; isso não concede acesso automático ao conteúdo dos contratantes nem remove limites técnicos contra abuso.
- HTML/CSS/shortcodes são recursos controlados. PHP requer execução isolada fora dos processos e credenciais do SaaS; permanece indisponível até o gate específico.
- Nenhuma alteração desta etapa é mesclada ou implantada automaticamente. A branch é o ponto de integração para o trabalho posterior.

## 2. O que a auditoria encontrou

Leitura realizada: `AGENTS.md`, `rules/00_MASTER.md` e regras 01 a 35; mapa e READMEs de packages, contratos/exports/tokens e arquivos centrais; taskboard JSON e sua renderização; schema Prisma; módulos de catálogo, páginas e billing; shell e superfícies públicas; decisões e handoff existentes.

| Área | Evidência na base auditada | Consequência para o BipeWPRO |
| --- | --- | --- |
| Taskboard | 86 cards: 47 DONE, 38 BACKLOG, 1 IN_PROGRESS | Preservar IDs, evidências e estados dos trabalhos anteriores |
| Identidade | AUTH-001 a AUTH-016 marcados DONE | Reutilizar a fundação; validar seus gates no ambiente de integração antes de liberar o módulo |
| CRM | CRM-001 a CRM-004 marcados DONE; último commit trata da lista e ações do pipeline | Não editar o fluxo do CRM nesta branch de planejamento |
| Catálogo | Rota `/catalog` mostra “Em breve”; CAT-001 a CAT-003 no backlog | Não há catálogo Food operacional confirmado nesta base |
| Pages e billing | `10-catalog`, `11-pages` e `12-billing` contêm diretórios com `.gitkeep` | Há fronteiras previstas; implementar dentro delas |
| Banco | 35 modelos, sem Site, Page, Catalog, Domain, Plan ou Entitlement | Modelos abaixo são propostos, não tabelas existentes |
| Público | `apps/marketing-web` tem README e skeleton, sem package.json | Ativar o app público faz parte da implementação, não presumir runtime pronto |
| Packages | 8 pacotes: auth, config, contracts, db, events, logger, security e ui | Incluir logger no mapa; preservar os demais nomes e exports |
| UI | Tokens, Button, campos, overlays, DataTable, MetricCard, SearchField e galeria | Evoluir o sistema existente, sem criar um segundo kit visual |
| Eventos | Helpers de envelope/outbox, sem relay completo; MSG-001/002 no backlog | Publicação assíncrona depende dessa infraestrutura compartilhada |
| Documentação | Alguns READMEs/handoff ainda relatam gates antigos abertos | Estado do taskboard não equivale a nova execução de testes nesta auditoria |

Esta foi uma auditoria de planejamento sobre o código remoto. Não foi feita nova homologação de identidade, banco, Redis, SMTP, pagamentos ou domínios. Alterações locais do Gemini que ainda não foram enviadas ao GitHub não estão nesta fotografia.

## 3. Conceitos e contagem sem ambiguidade

| Conceito | Definição | Exemplo |
| --- | --- | --- |
| Espaço de publicação | Proprietário e fronteira de isolamento dos recursos web | Empresa A ou conteúdo institucional da plataforma |
| Site | Raiz publicável com tema, endereço principal e conjunto de páginas | Site da pizzaria |
| Página | Documento editável com rota própria dentro de um site | `/`, `/sobre`, `/bonus` |
| Landing page | Página com finalidade de campanha; pode ser a única página do site | Campanha de lançamento |
| Catálogo | Dados comerciais reutilizáveis de produtos e configuração Food | Cardápio da loja |
| Menu | Estrutura de navegação reutilizada em cabeçalho/rodapé | Menu principal |
| Item de menu | Referência a página, âncora ou URL aprovada | Sobre nós, `#beneficios`, WhatsApp |
| Template | Estrutura reutilizável; não é uma URL publicada | Cabeçalho, card de produto, seção de depoimentos |
| Release | Conjunto imutável de revisões publicadas do site | Publicação 12 |

Exemplo do pedido: uma página inicial e três destinos independentes “Sobre nós”, “Comprar” e “Bônus” representam **1 site e 4 páginas**, com 3 itens de menu. Se os três links forem âncoras da mesma página, representam **1 site e 1 página**. Repetir o menu em dez páginas não cria dez menus. Referenciar uma página já existente não consome outra página.

“Criar catálogo Food” cria atomicamente um site de tipo Food, uma página inicial e um catálogo: consome as três cotas correspondentes. Reutilizar o mesmo catálogo em outro site consome novo site/páginas, mas não duplica os dados nem a cota de catálogo. Produtos geram rotas dinâmicas por template e consomem cota de produtos; não contam como páginas autorais. Uma página de produto criada manualmente como landing page conta como página.

## 4. Experiência do contratante e do superadmin

Menu principal do painel: **BipeWPRO**. Dentro dele: Visão geral, Sites e páginas, Catálogos Food, Modelos, Mídia e Domínios. O acesso de operação Food expõe Produtos, Categorias, Adicionais e combos, Horários, Entrega e retirada, Pedidos e Configurações. Mostrar apenas itens com comportamento implementado e acesso autorizado.

Fluxo de criação:

1. Escolher Site/landing page ou Catálogo Food e informar nome.
2. Mostrar cotas disponíveis e o consumo previsto antes da confirmação.
3. Escolher modelo ou documento em branco; configurar marca e dados básicos.
4. Criar os recursos em transação idempotente; retentar não duplica o site.
5. Abrir editor com rascunho e endereço provisório reservado.
6. Revisar mobile, conteúdo, acessibilidade, SEO e destino de publicação.
7. Publicar e mostrar URL real, versão, horário e resultado da operação.

O superadmin usa o mesmo editor e modelos para conteúdo institucional. A sessão platform identifica a pessoa e a permissão de publicação; a escolha “conteúdo da plataforma” vem do servidor. Acesso de suporte a um tenant continua sendo outro fluxo, temporário e auditado. Ao editar como suporte, as cotas daquele tenant continuam valendo.

## 5. Editor visual e interação

Desktop: toolbar estável com nome da página, seletor de página, desfazer/refazer, estado do salvamento, seletor Mobile/Tablet/Desktop, prévia externa e Publicar. Abaixo, painel lateral redimensionável e canvas com rolagem própria. O modo “Editar” permite selecionar blocos; o modo “Interagir” testa links, formulários e menus sem acionar uma compra real.

O painel tem abas **Elementos**, **Estrutura** e **Configurações**. Ao selecionar um elemento, apresenta **Conteúdo**, **Layout**, **Estilo** e **Avançado**, com controles relevantes ao tipo. Pesquisa de widgets usa debounce cancelável; listas grandes são virtualizadas quando a medição justificar. Camadas podem renomear, reordenar, duplicar, mover para outro contêiner e ocultar visualmente por breakpoint.

Comandos de edição são operações tipadas sobre a árvore: inserir, remover, mover, atualizar props, atualizar estilo e alterar referência. Cada comando tem inverso ou snapshot para undo/redo. Agrupar digitação em uma ação de histórico, limitar memória e preservar seleção. Copiar/colar valida a árvore, gera novos IDs e confere permissões/cotas/referências; não colar HTML bruto do clipboard diretamente no DOM.

Autosave proposto: após 800 ms sem edição, com janela máxima de 5 s, uma escrita por vez e `expectedRevision`. São parâmetros iniciais do editor, sujeitos ao ensaio de uso. Estados: alterado, salvando, salvo, erro, conflito. Falha preserva rascunho em memória e permite retentar. Sair com escrita pendente avisa de forma contextual. Armazenamento offline permanente e colaboração simultânea não fazem parte da primeira entrega; exigem política de dados e reconciliação próprias.

Conflito de versão retorna 409; nunca sobrescrever silenciosamente. Oferecer recarregar a versão atual, comparar e salvar cópia autorizada. Duplicar também consome cota. A função de refresh contextual não destrói edição não salva.

Mobile: canvas ocupa a largura; elementos/propriedades entram em sheet com foco correto, e toolbar inferior prioriza seleção, camadas e prévia. O mesmo estado alimenta ambas as composições. Não exigir hover nem drag para uma ação. Permitir inserir antes/depois, mover acima/abaixo e escolher contêiner por controle acessível.

### Restrição real de drag-and-drop

`AGENTS.md` e a regra mestre exigem `@hello-pangea/dnd`. A biblioteca documenta foco em listas e limitações para grid e movimento entre níveis aninhados. Portanto, o primeiro spike deve validar reordenação por listas/camadas, transferência entre contêineres autorizados e comandos explícitos de hierarquia. Flex e Grid são capacidades do layout gerado; não dependem de arrastar células de um grid bidimensional.

Não prometer um canvas de arraste livre antes desse ensaio. Se a experiência pretendida exigir outro motor, registrar os resultados e uma decisão arquitetural específica, preservando o DnD do CRM. Referência: [documentação do hello-pangea/dnd](https://github.com/hello-pangea/dnd).

## 6. Responsividade e documento único

Um documento `schemaVersion: 1` contém uma árvore de nós, tokens do site e referências. Cada nó tem `id`, `type`, `version`, `props`, `children` e `styles`. `styles.base` é a composição mobile; `styles.tablet` e `styles.desktop` guardam apenas diferenças. Propriedade ausente herda, enquanto “restaurar herança” remove o override. Não confundir string vazia com ausência.

Breakpoints iniciais: base abaixo de 768 px, tablet de 768 a 1023 px e desktop a partir de 1024 px. Validar 320, 360, 390, 768, 1024 e 1440 px, além de larguras intermediárias. Uma prévia de 390 px no editor continua gerando o mesmo CSS que o site público. Não usar user agent para selecionar uma segunda árvore HTML.

Contêineres oferecem `flex` e `grid`: direção, wrap, alinhamento, gap, colunas, frações, minmax, largura máxima, padding/margin, proporção e posicionamento limitado. Grid deve ter fallback de uma coluna. Usar unidades tipadas (`px`, `rem`, `%`, `fr`) e faixas válidas, sem aceitar expressões livres em controles numéricos. `min-width: 0` e `min-height: 0` nos filhos evitam overflow em painéis com scroll; altura mínima é aplicada à composição, não a um bloco que corte texto ampliado.

O botão “ocultar em mobile” é visual, nunca uma proteção de informação. Conteúdo sensível não entra no documento público. Reordenação visual deve preservar ordem compreensível de leitura/foco. Navegação mobile e desktop compartilham o mesmo modelo de links; se precisarem de composições DOM distintas, não duplicar handlers, IDs, consultas ou lógica, e retirar a versão inativa da navegação assistiva.

## 7. Matriz de elementos e liberdade visual

Todos os widgets usam registro único com schema de props, renderização, controles, versão, capacidades exigidas, política de mídia, orçamento e testes. A tabela define escopo; não é catálogo de funcionalidades já disponíveis.

| Família | Recursos planejados | Entrega |
| --- | --- | --- |
| Estrutura | Seção, contêiner Flex/Grid, colunas, divisor, espaçador, âncora | PAGE-001/002 |
| Texto | Título semântico, texto rico restrito, listas, citação, texto destacado | PAGE-002; enriquecimento WPRO-009 |
| Ações | Botão, grupo de botões, CTA, link, WhatsApp, telefone e e-mail | PAGE-002 |
| Marca e navegação | Logo, cabeçalho, rodapé, menu desktop/mobile, breadcrumb, off-canvas | WPRO-008 |
| Imagens | Imagem responsiva, imagem com texto, galeria, comparação e hotspots acessíveis | Base PAGE-002; avançados WPRO-009 |
| Ícones | Lucide pesquisável, ícone com texto/lista, redes sociais, SVG próprio sanitizado | WPRO-006/009 |
| Mídia | Vídeo com poster, áudio e playlist; embeds por provedores aprovados | WPRO-009 |
| Conteúdo agrupado | Tabs, accordion, FAQ, cards, tabelas de preços, lista de preços | WPRO-009 |
| Prova social | Depoimentos, reviews reais, notas e carrossel de depoimentos | WPRO-009 |
| Dinâmicos | Loop/grid de catálogo, carrossel de itens e filtros por categoria | CAT-002 |
| Conversão | Formulário, banners, popup/off-canvas com regras e frequência | WPRO-010; popups WPRO-009 |
| Indicadores | Contador, progresso e countdown com data/timezone reais | WPRO-009 |
| Efeitos | Fade, slide curto, scale discreto, hover, gradiente estático/animado | WPRO-009 |
| Especializados | Flip box com alternativa estática, sumário, code highlight como texto, Lottie validado, text path decorativo | WPRO-009, após core |
| Extensões | Shortcode tipado, HTML restrito, CSS escopado, embed autorizado | WPRO-009 |
| Food | Card personalizado, menu de categorias, busca, ficha, opções, carrinho, checkout e status | CAT-001/002/003 e WPRO-012/013 |
| Recursos de outros ecossistemas | Posts/portfolio podem usar futura coleção de conteúdo; login, Facebook/PayPal dependem de integração própria | Não simular WordPress nem marcar como pronto |

Estilo comum: cor sólida ou gradiente, imagem de fundo, overlay, borda, raio, sombra, tipografia, espaçamento, alinhamento, estados de foco/hover/ativo e tema. Editor de gradiente controla paradas, ângulo e contraste; fontes vêm de biblioteca licenciada, sem baixar uma fonte por widget.

Animações são presets tipados com duração/intensidade limitadas. Preferir transform e opacity. Gradiente animado é opt-in do conteúdo público, para quando fora da tela/aba e tem versão estática com reduced motion. Não aplicar animação infinita na interface de trabalho. Conteúdo essencial fica visível mesmo sem JS. Carrossel inicia sem autoplay; se habilitado, precisa pausar, parar com foco/hover e respeitar movimento reduzido.

“Todos os SVGs” significa extensibilidade de catálogo e importação controlada, não incluir todas as bibliotecas no bundle. Pesquisar ícones por nome/categoria, carregar apenas os usados e preservar autoria/licenças. SVG importado passa por parser, remoção de scripts/eventos/foreignObject/referências externas, limites de nós/path/bytes e preview seguro.

## 8. Theme builder, páginas e navegação

O site tem tema global: paleta, fontes, escalas de espaço, largura de conteúdo e presets de componentes. Cada página herda o tema e pode fazer overrides explícitos. Alterar tema mostra as páginas impactadas antes de publicar.

Cabeçalho e rodapé são templates com revisões. Regras de aplicação são declarativas: site inteiro, páginas selecionadas ou tipos de página, com prioridade determinística e validação contra conflitos. Menu usa referências estáveis a Page, âncora ou URL validada, não cópia textual do caminho; trocar slug atualiza a resolução do link. Detectar página removida, link quebrado e âncora inexistente.

Seções reutilizáveis podem ser **cópias independentes** ou **referências globais**; a UI explica a diferença. Referências globais não mudam páginas no ar ao salvar rascunho: o release fixa revisões de página, tema, cabeçalho, rodapé e seções. O usuário vê o conjunto afetado ao republicar. Bloquear dependências circulares e profundidade excessiva.

Catálogo Food usa templates para card, listagem, detalhe e carrinho. Instâncias usam IDs de dados e bindings autorizados, nunca SQL ou consulta livre. Atualizar um template não exige duplicar todos os produtos.

## 9. Organização dos pacotes e aplicações

Preservar os oito pacotes existentes. Extrair por responsabilidade, com exports de compatibilidade e migração dos consumidores em PRs pequenos. Não mover todo `src/index.ts` enquanto o Gemini adiciona contratos ao mesmo arquivo. Novos contratos entram em subpastas; a extração do legado ocorre quando a integração estiver estabilizada.

| Caminho | Responsabilidade e evolução |
| --- | --- |
| `packages/contracts/src/web/` | Espaços, sites, páginas, blocos, revisões, menus, domínios e publicação |
| `packages/contracts/src/catalog/` | Food, preços, opções, disponibilidade, entrega e pedidos |
| `packages/contracts/src/entitlements/` | Capacidades, quotas, disponibilidade e erros; fonte única compartilhada |
| `packages/ui` | Primitives/tokens atuais do SaaS preservados; reforma completa adiada pelo usuário |
| `packages/web-builder-ui` (novo) | UI específica do construtor, shell/controles/prévia; importa somente tokens de ui |
| `packages/auth` | Policies tenant e platform; avaliar ação/escopo no backend |
| `packages/security` | Sanitização server-side de conteúdo/SVG/CSS, URLs, uploads e redaction por finalidade |
| `packages/db` | Prisma, migrations aditivas, constraints compostas, RLS, índices e transações |
| `packages/events` | Reutilizar outbox/relay e contratos de publicação; não criar segunda fila de eventos |
| `packages/config` | Breakpoints e budgets tipados, limites de parser e origens públicas aprovadas |
| `packages/logger` | Logs estruturados minimizados; completar README e revisar a fronteira de redaction |
| `packages/web-builder-core` (novo) | Árvore, comandos, herança, migrações e registro lógico, sem React/I/O |
| `packages/web-renderer` (novo) | Renderização semântica compartilhada; entrada server e ilhas interativas separadas |
| `packages/web-builder` (novo) | Editor React usado por tenant e superadmin, consumindo core/renderer/web-builder-ui |
| `apps/*/src/features/bipewpro` | Adapters de sessão/Actions/query, entrada e composição do contexto da superfície |
| `apps/api/src/modules/11-pages` | Casos de uso de edição, publicação, domínios e persistência |
| `apps/api/src/modules/10-catalog` | Dados Food, cálculo comercial e pedidos |
| `apps/api/src/modules/12-billing` | Entitlements/contadores primeiro; produtos comerciais e assinaturas depois |
| `apps/marketing-web` | Ativar runtime público Next para conteúdo institucional e sites publicados por host autorizado |
| `apps/worker` | Jobs de publicação, mídia e DNS com adapters dos serviços, após infraestrutura compartilhada |

Direção de dependências: contracts é folha; core depende de contracts; renderer depende de core/contracts e componentes públicos selecionados; builder depende de core/renderer/web-builder-ui; apps compõem adapters. Nenhum pacote importa apps. Core, contracts e UI não importam Prisma, sessão, env secreto ou serviços HTTP. `web-renderer/server` não entra no bundle cliente. O site público nunca importa o editor, seus inspectors ou DnD.

Core e renderer não possuem fetching oculto; recebem documento validado e projeção pública de dados. Next Server Actions validam a sessão e encaminham à API, sem Prisma direto. Fastify valida identidade/contexto e executa o caso de uso autorizado. Worker reaproveita serviços, sem inventar regra alternativa de preço, publicação ou limites.

Novos pacotes só ganham package.json/exports na fatia com implementação e consumidores reais. O catálogo de diretórios propostos não declara pacotes existentes. Testar imports públicos e os bundles antes de mover exports legados.

## 10. UI dedicada e padrão premium

Por instrução do usuário em 2026-09-16, os componentes do construtor ficam em `packages/web-builder-ui`; a reformulação completa de `packages/ui` não pertence a esta etapa. O guia ativo fica em `packages/web-builder-ui/PREMIUM_LAYOUT.md`. O guia anterior de ui permanece referência futura do SaaS. Premium significa previsibilidade, legibilidade, acabamento e comportamento completo: não depende de vidro, sombras grandes ou efeitos contínuos.

Primitives previstas, a serem criadas apenas onde faltar equivalente: `EditorShell`, `ResizablePanel`, `InspectorSection`, `UnitField`, `SpacingField`, `ColorField`, `GradientField`, `ResponsiveValueField`, `DevicePreviewFrame`, `AssetPickerView`, `IconPickerView` e `SaveStatus`. O domínio decide capacidades, dados, salvamento e validação; a UI recebe props e callbacks.

Layout preserva a altura do workspace e dos estados de conteúdo sem efeito sanfona. Não fixar alturas que cortem zoom ou teclado móvel. Painéis têm scroll previsível; divisórias e foco mantêm contraste. Busca não expande horizontalmente ao receber foco. Filtros, período e métricas reutilizam o padrão existente quando fizerem sentido; não adicionar métricas decorativas sem dados.

Toda peça deve cobrir loading/empty/error/disabled/conflict quando aplicáveis, além de retorno de foco, teclado, temas, toque e reduced motion. Novas peças do construtor aparecem na galeria local `pnpm bipewpro:dev`; o `/design-system` atual do SaaS é preservado. Valores de cor/tamanho/motion continuam no CSS canônico; novas necessidades viram tokens semânticos, não uma tabela paralela por módulo.

## 11. Modelo de dados proposto

Nomes abaixo são contratos candidatos para a implementação de WPRO-005 e cards relacionados. Não aplicar migração a partir deste documento sem conferir o schema atual e o histórico enviado pelo Gemini.

| Grupo | Entidades propostas | Invariantes principais |
| --- | --- | --- |
| Propriedade | `PublishingSpace` | `kind=tenant` exige tenantId único; `kind=platform` usa chave institucional única; CHECK exclusivo |
| Conteúdo | `WebSite`, `WebPage`, `WebPageRevision` | spaceId obrigatório, tipo, versão, slug normalizado, rascunho separado |
| Reuso | `WebTemplate`, `WebTemplateRevision`, `WebThemeRevision` | referência ao mesmo espaço; template público curado é outra permissão |
| Navegação | `WebMenu`, `WebMenuItem` | vínculo com site, ordem, destino tipado e profundidade máxima |
| Publicação | `WebRelease`, `WebReleasePage`, `PublicationJob` | manifesto de revisões exatas, idempotência, estado e geração esperada |
| Endereços | `WebDomain`, `WebRouteBinding`, `WebRedirect` | host único globalmente, rota única no host, propriedade/TLS e destino sem loop |
| Mídia | `WebAsset`, `WebAssetVariant`, `WebAssetReference` | quarentena, derivados imutáveis, licença, alt, uso e tamanho |
| Food | `Catalog`, `CatalogCategory`, `CatalogProduct`, `CatalogVariant` | espaço/catálogo obrigatórios, preço/moeda e disponibilidade |
| Personalização Food | `ModifierGroup`, `ModifierOption`, `ProductModifierGroup`, `ComboComponent` | min/max, tipo, quantidades e elegibilidade no servidor |
| Operação Food | `StoreSchedule`, `DeliveryZone`, `DeliveryRule`, `PickupLocation` | timezone, faixa/região, custo/prazo e precedência determinística |
| Compra | `CatalogCart`, `CatalogQuote`, `CatalogOrder`, `CatalogOrderItem`, `OrderStatusHistory` | cálculo server-side, expiração, idempotência e snapshot imutável |
| Planos | `EntitlementDefinition`, `EntitlementAssignment`, `UsageCounter`, `UsageReservation` | mesma estrutura de BILL-001; consumo atômico por dono/recurso |

Todos os recursos editoriais têm `spaceId`; entidades de tenant preservam tenantId explícito onde necessário para RLS e relações existentes. FKs compostas garantem que página/site/template/mídia/catálogo pertençam ao mesmo espaço; CHECK/índices impedem combinações contraditórias. A relação com Contact continua tenant-scoped e opcional; comprador público não vira User/Membership.

Contexto interno discriminado: `TenantPublishingContext` carrega o TenantContext canônico; `PlatformPublishingContext` carrega ator platform autenticado e espaço institucional obtido no servidor. Não fabricar tenant institucional nem aceitar `scope=platform` como autoridade do payload. RLS utiliza políticas separadas, verificadas com runtime sem owner/BYPASSRLS. Null tenantId nunca concede leitura universal.

Eventos atuais exigem tenantId. Manter o envelope atual para tenants e introduzir contrato separado/versionado para eventos institucionais, com `spaceId` e ator platform; não tornar tenantId opcional globalmente nem reutilizar um tenant de cliente para emitir evento da plataforma.

Índices mínimos: dono/status/updatedAt, site/slug, página/revisão, host normalizado, host/path, catálogo/categoria/status, pedido/status/createdAt e chave idempotente por operação/escopo. Busca pública usa projeções próprias, paginação e limites; revisão JSON não substitui relações centrais.

## 12. Contratos, APIs e concorrência

JSONB é adequado à árvore visual, mas o contrato é estrito e versionado. IDs duplicados, ciclos, tipo desconhecido, props não autorizadas, chave perigosa de objeto, profundidade e tamanho excedidos são rejeitados. Validar antes de recursão pesada. Limites técnicos iniciais propostos: 1 MiB de JSON por página, 500 nós e 12 níveis; medir no spike e centralizar configuração, sem confundir esses limites com planos pagos.

Rotas candidatas sob `/v1/web`: sites; páginas e rascunhos; revisões; templates; menus; releases; domínios; assets. Rotas Food sob `/v1/catalog`: catálogos, produtos, opções, disponibilidade, quotes e pedidos. O backend deriva o espaço da sessão autorizada e do recurso. Entradas platform usam guard e audience próprios.

| Operação | Contrato obrigatório |
| --- | --- |
| Criar site/página/catálogo | idempotency key, fingerprint, validação de cota e gravação na mesma transação |
| Salvar rascunho | expectedRevision, schemaVersion, erro 409 em conflito |
| Publicar | revisão esperada, manifesto de dependências, entitlement atualizado, job idempotente |
| Importar/duplicar | validar envelope, novas identidades, cotas e referências autorizadas |
| Cotar Food | IDs e quantidades; servidor retorna preço/frete/validade e versão |
| Enviar pedido | quote e idempotency key; revalidar valores/disponibilidade e persistir snapshot |
| Mudar slug/domínio principal | disponibilidade, titularidade, redirects e invalidação auditada |

Erros estáveis propostos: `WEB_QUOTA_EXCEEDED`, `WEB_CAPABILITY_DENIED`, `WEB_REVISION_CONFLICT`, `WEB_DOCUMENT_INVALID`, `WEB_REFERENCE_IN_USE`, `WEB_ROUTE_CONFLICT`, `WEB_DOMAIN_NOT_READY`, `WEB_PUBLISH_FAILED`, `CATALOG_ITEM_UNAVAILABLE`, `CATALOG_QUOTE_EXPIRED`. Usar envelope canônico com requestId; erros internos/PII não chegam ao cliente. Consultas não autorizadas seguem a política uniforme de não revelar existência.

## 13. Planos preparados desde a fundação

Antecipar **BILL-001 Entitlements e contadores**, mantendo BILL-002 a BILL-005 para administração comercial, assinaturas e gateways. Não criar `WebPlan`, `FoodPlan` ou tabela paralela de preços. O construtor consulta um serviço único: capacidade permitida, limite efetivo, uso e motivo de indisponibilidade.

| Chave canônica proposta | Tipo | Regra |
| --- | --- | --- |
| `web.enabled` | boolean | Entrada do produto |
| `web.sites.max` | cota | Todos os sites, inclusive os de tipo Food |
| `web.pages.max` | cota por proprietário | Páginas autorais não excluídas, rascunhos incluídos |
| `web.catalogs.max` | cota | Instâncias de catálogo, sem duplicar por embed |
| `web.menus.maxPerSite` | cota | Estruturas de menu distintas |
| `web.menuItems.maxPerSite` | cota | Itens armazenados nos menus, não cada renderização |
| `web.customDomains.max` | cota | Domínios reservados/verificados associados |
| `web.customSubdomain` | boolean | Escolha do nome de subdomínio da plataforma |
| `web.rootRouting` | boolean | Escolha de página/site padrão de um host autorizado |
| `web.customCss` | boolean | CSS dentro da política de segurança |
| `web.customHtml` | boolean | HTML restrito e sanitizado |
| `web.shortcodes` | boolean | Registro de shortcodes aprovado |
| `web.svgUpload` | boolean | Importação sob política de mídia |
| `web.advancedWidgets` | boolean | Grupo de widgets avançados do manifest |
| `web.forms` / `web.tracking` | boolean | Formulários/pixels com controles próprios |
| `web.phpExtensions` | boolean | Só pode produzir acesso se runtime isolado estiver homologado |
| `web.storageBytes.max` | cota | Originais e derivados retidos por proprietário |
| `food.products.max` | cota | Produtos ativos/rascunhos não excluídos |
| `food.modifiers` / `food.delivery` | boolean | Opções comerciais e entrega |
| `food.onlinePayments` | boolean | Somente com gateway efetivamente habilitado |

Sem atribuição válida, negar capacidade/cota comercial; não assumir plano ilimitado. Desenvolvimento usa fixtures sintéticas explícitas. Produção pode receber concessão administrativa auditada enquanto ainda não existe a UI de planos. Grant tem origem, revisão, vigência e motivo, sem inventar preços.

Representar limite finito e ilimitado como união explícita, por exemplo `{kind: 'limited', value: 5}` e `{kind: 'unlimited'}`. Não usar 999999 ou -1 como infinito. Superadmin institucional recebe política de criação comercial ilimitada, resolvida no servidor; controles de segurança, recursos por job e storage operacional continuam aplicáveis.

Consumo usa lock/atualização condicional e constraint por espaço/chave. Reservas de tarefas assíncronas expiram ou são liberadas quando falham; confirmar publicação revalida capacidade. Criar, duplicar, importar e restaurar usam o mesmo serviço de cota. Arquivar não libera vaga; excluir para lixeira libera a cota autoral e restauração revalida, enquanto bytes retidos continuam no consumo de storage. Política e prazo de lixeira devem estar explícitos na UI.

Downgrade não apaga conteúdo. Proposta: preservar leitura, exportação, exclusão e versão publicada durante o período contratual de tolerância; bloquear expansão e novos recursos acima da cota. Edição básica que não aumenta uso continua possível; republicar recurso premium removido exige adequação ou tolerância explícita. Suspensão é estado separado, com retirada controlada de publicação, nunca exclusão implícita. BILL-005 fecha os prazos comerciais sem reconstruir o modelo.

## 14. Catálogo Food e regras comerciais

Produtos aceitam nome, descrição, imagens/alt, categorias, etiquetas informativas, preço BRL, variações, disponibilidade, preparo e observações limitadas. Restrições alimentares/alérgenos são informação fornecida pelo estabelecimento, não inferência automática. Estoque pode ser finito ou disponibilidade manual; ambas as opções têm comportamento explícito.

Casos concretos:

- Pizza: tamanho, sabores, limite de sabores, borda e adicionais; política de preço por maior sabor ou média ponderada configurada e visível. Arredondar somente na etapa definida, em centavos.
- Hambúrguer: ponto/opção do produto, ingredientes removíveis, extra pago e combo com bebida; remover ingrediente não aplica desconto sem regra configurada.
- Açaí: tamanho, grupo de complementos incluídos, quantidade de inclusos e adicionais pagos após o limite; max total impede combinações inválidas.
- Combos: componentes obrigatórios/opcionais, grupos elegíveis e quantidade por componente; referências são a produtos do mesmo catálogo.

ModifierGroup define tipo de seleção, obrigatório, mínimo, máximo, repetição permitida e quantidade gratuita. Opção possui preço e disponibilidade. O servidor valida que produto, variação e opções estão vinculados e disponíveis; não aceita preço ou nome financeiro do browser como fonte de verdade.

Horários têm timezone IANA do estabelecimento, intervalos, exceções/feriados, pausa manual e prazo de preparo. Agendamento tem capacidade por janela e corte de horário, se habilitado. Exibir fechado/abre às antes do cliente montar compra que não pode finalizar. Expiração de carrinho e preço não garante reserva permanente de estoque.

Entrega inicial por regiões/CEP configurados, preço fixo ou faixas e retirada. Regra por raio pode entrar com adapter de geocodificação homologado e proteção de custo/privacidade; sem fingir distância real. Definir pedido mínimo, gratuidade por subtotal elegível, taxa, prazo e desempate entre zonas. Ausência de cobertura impede finalizar entrega e oferece retirada quando disponível. Taxas e descontos nunca tornam o total negativo.

Carrinho: um catálogo e uma moeda; ao mudar, confirmar reinício ou manter carrinhos separados identificados. Linhas são distintas quando possuem opções diferentes. Quantidade, opções e preço são recalculados no servidor; mostrar mudança antes de confirmar. Dados públicos de vitrine podem estar em cache; estoque/preço final e frete são revalidados na cotação e no pedido.

## 15. Pedidos, pagamentos e operação

O pedido é persistido com snapshot: item, variação, adicionais, preço unitário, descontos, subtotal, taxa/frete, moeda e total. Usar Decimal no banco e string decimal nos contratos, com operações monetárias precisas. Não usar ponto flutuante binário para consolidar valores.

Estados de atendimento: recebido, aceito, em preparo, pronto, em entrega, concluído, cancelado. Estado financeiro separado: pendente, autorizado, pago, falhou, estornado parcial/total quando houver adapter. Aceitar pedido, confirmar recebimento manual e confirmar pagamento online são ações distintas, com permissões e histórico.

Primeira operação útil pode registrar pagamento na entrega/retirada ou pedido aguardando confirmação, conforme configuração real. Link de WhatsApp pode compartilhar referência e resumo mínimo, mas clicar não significa mensagem entregue nem pagamento confirmado. Catálogo não reutiliza o checkout de assinatura do SaaS como checkout do restaurante.

Pagamento online exige contrato próprio de cobrança comercial e adapter homologado. Reutilizar infraestrutura de credenciais, idempotência e webhooks; separar assinatura BipeSend de compra Food, contas recebedoras, fluxos de reembolso e conciliação. Não armazenar cartão. Redirect nunca confirma pagamento; somente evento autenticado e deduplicado do provedor. Gateways ainda no backlog não são tratados como conectados.

Pedidos geram eventos após commit. Integração com automações/CRM é um card posterior; não fazer pedido básico depender de um construtor de automações completo. Retentativas não repetem pedido, reserva de estoque, mensagem ou cobrança. Em caso de preço alterado/estoque concorrente, recalcular e pedir nova confirmação comercial ao comprador.

Operação Food inclui fila de pedidos com filtro/status, detalhes, prazo, atualização contextual e alternativa mobile. Atualizações públicas revelam somente o pedido autorizado por referência opaca/capability limitada e expirada, sem IDs enumeráveis ou dados de outros clientes. Impressão/KDS, entregadores próprios com rastreamento e marketplace multiloja ficam como evoluções posteriores, não paridade presumida com iFood.

## 16. Segurança de conteúdo, código e dados públicos

Tratar documento, rich text, SVG, HTML, CSS, URLs, imports e saída de extensão como não confiáveis. Validar no backend ao salvar/importar e novamente ao publicar, registrando a versão da política. Usar parsers e sanitizadores mantidos; não resolver segurança com regex de palavras proibidas. Escaping depende do contexto. Referência: [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

| Entrada | Política proposta |
| --- | --- |
| Texto rico | AST com tags/marcas aprovadas, sem atributos de evento ou HTML livre |
| HTML avançado | Lista pequena de elementos/atributos, URLs validadas, sem script/style/form ativo/iframe livre |
| CSS | Parsear AST, limitar seletores ao site/bloco, propriedades e valores permitidos; bloquear import, URLs externas livres, escapes de escopo e sobreposição que oculte controles essenciais |
| Shortcode | Nome e versão registrados, argumentos Zod, saída limitada e tipada; sem eval, expressão livre ou recursão irrestrita |
| SVG | Sanitizar, limitar complexidade, remover conteúdo ativo e referenciar derivado seguro |
| Embed/pixel | Adapter por provedor, origem allowlisted, consentimento e lazy load; nunca colar tag script no painel |
| PHP | Extensão em serviço isolado, sem execução direta em Next, Fastify, worker geral ou banco |

O suporte PHP proposto é um recurso avançado com gate próprio: sandbox forte por execução/tenant (microVM ou isolamento equivalente validado), filesystem efêmero/read-only onde aplicável, usuário sem privilégio, sem socket Docker/host mount, sem credenciais do SaaS, rede negada por padrão, CPU/memória/tempo/saída limitados, imagem fixa e auditada, revisão de extensão, kill switch e trilha minimizada. Pacote Docker comum ou filtro de strings não comprova isolamento.

A integração preferida executa na publicação e produz conteúdo estático sanitizado; renderização por requisição exige análise adicional de custo/cache/abuso e não entra no lançamento. O plano só habilita `web.phpExtensions` depois de capability, permissão e disponibilidade técnica serem verdadeiras. Até lá a UI explica indisponibilidade e não oferece um textarea que pareça executar PHP. É decisão técnica desta proposta, não alegação de que PHP em si seja proibido.

Preview usa origem dedicada sem cookies do painel, CSP e sandbox compatível com os widgets permitidos. O pai autentica a autorização de preview; nenhum cookie/segredo administrativo é enviado ao frame. Canal `postMessage` verifica origem, janela remetente, schema, nonce de sessão e tamanho; não usar origem `*`. Para preview opaco, especificar handshake/capability em canal restrito no spike em vez de relaxar a checagem. Separar modo edição de navegação e bloquear top navigation/popups não previstos.

Importação de URL/imagem precisa de defesa SSRF: DNS/IP IPv4/IPv6, endereços privados/loopback/link-local, redirects e resolução no momento da conexão; aplicar também regras de rede, timeout e limite de bytes. Preferir upload ao download de URL arbitrária. Referência: [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

Upload passa por MIME real, quota, quarentena, scan/decodificação e derivados; original privado, apenas variantes aprovadas são públicas. JPEG/PNG/WebP/AVIF e SVG seguem políticas diferentes; evitar bombas de imagem/zip. Bloquear remoção de mídia em uso por release ativo ou oferecer migração explícita. Referência: [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

Não mandar pedidos, endereços, tokens, dados de formulários ou rascunhos para analytics/logs. Formulários públicos têm rate limit, antispam acessível, tamanho máximo, finalidade e retenção definidos. Consentimento de marketing é separado de envio operacional. Privacidade e retenção seguem as regras do projeto; políticas legais finais precisam da revisão do responsável da plataforma, sem inventar conformidade por componente.

## 17. Publicação, URL provisória e domínios

Toda criação recebe identificador não previsível e rota provisória estável, por exemplo `https://<site-id>.<dominio-de-publicacao>/<slug>`. O domínio real é configuração de infraestrutura, ainda a confirmar/provisionar; exemplos não representam endereço já registrado. Separar conteúdo de tenant em domínio registrável próprio para reduzir riscos de same-site com app/admin. Enquanto isso não estiver provisionado, não disponibilizar conteúdo ativo de terceiros no domínio de autenticação.

Contratante pode escolher o slug de cada página quando dispõe de páginas adicionais. Uma página tem slug único no site; um host/path vincula apenas um destino. Nome personalizado de subdomínio, domínio próprio e seleção de raiz são capacidades comerciais distintas. Fallback seguro permanece acessível conforme política de canonical/redirect, sem tomar URL de outro tenant.

Superadmin institucional pode publicar em caminhos ou subdomínios do domínio controlado pela plataforma, inclusive escolher o site/página padrão para `/`. “Ilimitado” não significa poder registrar DNS de domínio não controlado. `app`, `admin`, `api`, `hooks`, `assets`, `preview` e rotas operacionais reservadas nunca são atribuídos a site comercial.

Domínio próprio: normalizar IDNA/case/ponto final, proibir credenciais/caminho/porta indevida e reservar globalmente. Emitir desafio TXT único e expirável para propriedade; verificar também apontamento CNAME/ALIAS/A conforme o provedor efetivamente suportado. Não tratar CNAME sozinho como prova de propriedade. Aceitar apex apenas com configuração documentada e certificação válida.

Estados: reservado, aguardando DNS, verificando propriedade, aguardando apontamento, emitindo TLS, ativo, degradado, suspenso, liberado. Só atender conteúdo após verificação de propriedade e TLS. Revalidar DNS/renovação; falha não permite troca de dono silenciosa. Ao remover, invalidar rotas/cache, revogar bindings e aplicar período de proteção contra takeover antes de nova atribuição.

O edge valida host/SNI/forwarded headers do proxy confiável; consulta registro de bindings. URL absoluta/canonical vem do domínio verificado, nunca concatenação de Host arbitrário. Escolha de URL padrão gera redirect apenas para recurso do mesmo espaço ou destino externo expressamente validado; detectar loops e cadeias. Troca permanente de slug/canonical cria 301/308 conforme contrato; prévias não ganham redirects permanentes.

### Publicação consistente

1. Congelar manifesto com revisão da página, tema, templates, menu e assets.
2. Validar referências, políticas de segurança, cotas, links, SEO e destino.
3. Gravar release/job e evento de outbox na mesma transação.
4. Worker gera artefatos em destino imutável com hash/versão; falha não altera o site atual.
5. Verificar artefato e trocar ponteiro ativo por comparação de geração; job antigo não vence release mais novo.
6. Invalidar CDN por site/release/host e registrar resultado auditado.
7. Rollback aponta para release anterior válido, com nova auditoria e revalidação de políticas críticas.

Salvar rascunho não publica. Despublicar corta resolução/cache sem apagar o documento. Cache público usa host normalizado + rota + release + variante de dados públicos; dados autenticados não entram nele. Catálogo separa estrutura editorial imutável de disponibilidade/preço corrente, revalidados na compra. Não buscar dados com cookie administrativo para renderizar visitante anônimo.

## 18. SEO, desempenho e acessibilidade

Objetivo: páginas úteis, rápidas e indexáveis, com configuração que ajuda o usuário a produzir bom conteúdo. Não garantir posição no Google nem nota 100 para qualquer conteúdo/terceiro inserido. O [guia do Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) deixa claro que boas práticas não garantem primeiro lugar ou indexação.

SEO por página: título, descrição, canonical, robots, idioma, Open Graph, imagem social, favicon e headings semânticos. Gerar sitemap apenas com rotas públicas canônicas; redirects, erro 404 real e conteúdo removido têm status correto. Preview/draft/painéis exigem autenticação quando privada e `noindex`; robots.txt não protege segredo. Evitar duplicidade entre provisório e domínio próprio; eleger uma canonical. Dados estruturados só descrevem conteúdo real e suportado, sem avaliações inventadas.

Renderizar HTML significativo no servidor/artefato estático. Hidratar apenas interações necessárias; páginas de texto não devem trazer o runtime do editor. Reservar dimensões de imagens, `srcset/sizes`, formatos modernos, preload apenas da imagem LCP/fontes críticas e lazy load abaixo da dobra. Terceiros carregam somente por necessidade/consentimento. Fonts usam subconjuntos/licenças e são carregadas uma vez por site.

| Medida | Meta de produto | Como verificar |
| --- | --- | --- |
| Core Web Vitals | LCP <=2,5 s; INP <=200 ms; CLS <=0,1 | p75 real, separado mobile/desktop, com amostra suficiente |
| Lighthouse de templates oficiais | Performance >=95; Accessibility/Best Practices/SEO >=95, alvo 100 nas verificações determinísticas | Build de produção, URL HTTPS de staging, mediana de 3 execuções em cada perfil |
| JS inicial público | Teto inicial proposto de 180 KiB comprimidos por template básico | Bundle report por rota; revisar após medição real do runtime |
| CSS inicial público | Teto inicial proposto de 50 KiB comprimidos | Artefato de produção |
| Peso inicial de mídia | Alvo <=1 MiB no template de referência | Waterfall, sem contar vídeo sob demanda |
| Editor | Meta provisória p95 <100 ms para seleção/alteração local em documento de 200 nós | Ensaio com equipamento/perfil registrado no spike |
| API | Meta provisória p95 <300 ms para leitura e <500 ms para salvar documento dentro do limite | Carga definida com volume, banco e concorrência registrados |

Os budgets numéricos adicionais são decisões iniciais do projeto, não resultados medidos nem exigências do Google. Revisá-los com dados sem esconder regressão. INP é métrica de campo e não pode ser afirmado a partir da nota Lighthouse; os limites oficiais estão em [Web Vitals](https://web.dev/articles/vitals).

WCAG 2.2 AA orienta produto e templates. Garantir teclado, foco visível/não encoberto, nomes acessíveis, zoom 200%, reflow 320 px, contraste, ordem semântica e erros persistentes. Padrão de toque BipeSend é 44 px; o mínimo normativo de 24 px e suas exceções não é o mesmo alvo de design. Drag tem alternativa de clique e teclado; campos de cor têm valor textual; carrossel/efeitos têm controle e reduced motion. Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [movimentos de arraste](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

Preflight distingue erro bloqueante de orientação: estrutura inválida, insegurança, URL não pronta e perda de conteúdo essencial bloqueiam; boas práticas editoriais apresentam explicação. A verificação automática não certifica WCAG. Fazer revisão manual com leitor de tela, teclado, ampliação e conteúdo longo. Alterações do cliente podem reduzir a qualidade; exibir achados reais, sem “selo 100” estimado.

## 19. Fases de entrega e critérios de saída

| Fase | Cards principais | Resultado verificável |
| --- | --- | --- |
| 0 - Planejamento | WPRO-001 | Branch, plano, regras, mapa e cards, sem ativação do produto |
| 1 - Fundação | WPRO-002/003/004, BILL-001, PAGE-001 | Contratos, spike do editor, componentes, cotas e documento versionado |
| 2 - Edição útil | WPRO-005/006/007, PAGE-002 | Criar página, editar, salvar/reabrir, prévia fiel e isolamento |
| 3 - Sites completos | WPRO-008/009/018, PAGE-003/004, WPRO-011 | Templates, menus, publicação, URL provisória, domínio verificado e SEO |
| 4 - Food | CAT-001/002/003, WPRO-012/013 | Comida/opções, entrega, carrinho, pedido e fila operacional reais |
| 5 - Evolução e lançamento | WPRO-010/014/015 | Formulários, portabilidade, validação de carga/segurança/a11y e release |
| Posterior condicionado | WPRO-016/017 | Extensões PHP isoladas; pagamentos/automação Food homologados |

Dependências reais: publicação por jobs reutiliza MSG-001/002. Esses cards hoje dependem de CRM-005; registrar a integração com a frente do Gemini e evitar construir um segundo outbox para ganhar prazo. Contratos/core/editor podem evoluir enquanto os serviços compartilhados são concluídos. A alteração de sequência do outbox, se necessária, será uma decisão de integração, não um bypass desta branch.

Manter PAGE-001 a PAGE-004, CAT-001 a CAT-003 e BILL-001 como unidades canônicas. Seus critérios serão detalhados, sem marcar como DONE por receber documentação. WPRO adiciona somente entregas distintas. CAT-003 passa a cobrir o núcleo de pedidos; sua automação avançada fica explicitamente em WPRO-017 para não bloquear pedido básico.

Primeira fatia implementável após leitura deste plano: **WPRO-002**, preparando contratos e fronteiras aditivas, seguida de PAGE-001 e do spike WPRO-003. Não iniciar pela tela inteira nem pela migration de todos os modelos. Cada PR entrega um fluxo vertical pequeno com testes dos riscos daquela fatia.

## 20. Matriz de aceite e testes de risco

| Risco/fluxo | Prova exigida |
| --- | --- |
| Multi-tenant/platform | IDs válidos de outro espaço negados em ler/escrever/publicar/importar; tenant nunca obtém policy platform |
| Cotas | Duas criações para a última vaga: uma vence; duplicar/importar/restaurar revalidam; rollback libera reserva |
| Documento | Ciclo, nó desconhecido, override inválido, referência externa e JSON acima do limite rejeitados |
| Editor | Editar/salvar/reabrir; undo/redo; falha de rede; versão 409; teclado; mover sem arraste |
| Responsividade | Mesma árvore nas larguras, prévia corresponde ao público; foco/zoom/teclado móvel preservados |
| Mídia e código | SVG ativo, HTML malicioso, CSS fora de escopo, zip/imagem expansiva e SSRF negados |
| Publicação | Falha conserva release anterior; retry não duplica; job atrasado não troca versão nova; rollback completo |
| Domínios | TXT incorreto, host duplicado, TLS pendente, Host forjado, DNS perdido, takeover e redirect loop tratados |
| Food | Pizza meio a meio, min/max de adicionais, item indisponível, carrinho alterado, CEP sem cobertura, loja fechada |
| Financeiro | Manipulação de preço/frete ignorada; totals precisos; corrida de estoque; idempotência do pedido |
| Pagamentos | Assinatura inválida/replay/conta errada negados; retorno de browser não paga pedido |
| Público | Sem cookie/PII do painel no HTML/cache; draft inacessível; SEO de erro real; conteúdo sem JS legível |
| Qualidade | Lighthouse reproduzível, bundle por rota, axe e revisão manual; resultados ligados ao commit |

Comandos existentes: `pnpm taskboard:render`, `pnpm taskboard:check`, `pnpm rules:check`, `pnpm architecture:check`, `pnpm secrets:check` e `pnpm foundation:check`. Rodar builds/testes dos pacotes/apps alterados. Scripts futuros de renderer, Lighthouse e E2E serão introduzidos no card que os implementa; não citar comando inexistente como executado.

Antes de usar banco: conferir migrations atuais, role runtime e ambiente isolado. Nunca resetar banco do Gemini ou editar migração já aplicada. Migrações do BipeWPRO serão aditivas com índices/constraints e testes reais de RLS; backfills e remoções têm plano separado.

## 21. Trabalho paralelo e integração com o Gemini

Branch desta frente: `feat/bipewpro-planning`, criada de main em 489fae2. Preferir um worktree separado ao testar localmente; não trocar a branch do diretório no qual o Gemini está trabalhando.

Áreas de maior conflito: `packages/db/prisma/schema.prisma`, `packages/contracts/src/index.ts`, `packages/auth/src/policies.ts`, exports/CSS de UI, lockfile, taskboard JSON, decisões e registro de rotas da API. Alterações compartilhadas entram de modo aditivo e são revisadas contra a main atual antes de cada integração.

A entrega inicial foi documental. A primeira implementação é aditiva e não refatora o CRM; arquivos e resultados exatos constam na auditoria da fundação BipeWPRO. Não enviar mensagens ao Gemini por serviços externos. O handoff no repositório oferece a coordenação necessária para o usuário e ferramentas locais.

Ao integrar: buscar remoto, comparar por arquivo e por card, manter os dois históricos, resolver JSON por ID, regenerar Markdown e validar dependências. Não escolher a versão inteira de um taskboard para resolver conflito. Rebase/merge na branch de trabalho só com árvore limpa e revisão; não force-push no trabalho de outro agente.

## 22. Templates iniciais, portabilidade e limites da primeira versão

Modelos oficiais iniciais: landing de serviço, campanha de produto, institucional com três páginas, pizzaria, hamburgueria e açaí. Devem ser conteúdo sintético explicitamente identificado no preview de escolha; ao usar, pedir substituição dos dados antes de publicar. Não criar depoimentos/avaliações que aparentem ser reais. Cada modelo tem versão, licença de mídia, tema, mobile, estados vazios e baseline de desempenho.

Exportar documento/tema/templates e manifesto de mídia sem segredos, PII de pedidos ou permissões. Importação valida versões, tamanhos, paths, assinatura/integridade quando aplicável, dependências, referências e cotas. Não executar código trazido por ZIP. Não prometer importação automática de Elementor/WordPress/Shopify; um conversor específico exigiria mapeamento e relatório de perdas.

Como catálogo/páginas atuais são skeletons nesta base, não há migração de conteúdo legado comprovadamente necessária. Mesmo assim, WPRO-014 começa por inventário do banco no ambiente autorizado antes de concluir ausência de dados; qualquer conversão será idempotente, com prévia, cópia de segurança e relatório.

Fora da primeira versão: marketplace de vendedores, logística com frota/rastreamento, app nativo, colaboração simultânea em tempo real, offline completo, WordPress/plugin runtime, PHP irrestrito, múltiplas moedas no mesmo carrinho e automações/pagamentos declarados funcionais sem seus gates. Esses limites não removem a arquitetura para evolução; evitam marcar uma referência visual como produto pronto.

## 23. Decisões restantes e como avançar

| Decisão/entrada | Tratamento atual | Momento necessário |
| --- | --- | --- |
| Domínio provisório separado e provedor DNS/TLS | Origem configurável, exemplos neutros | Antes da publicação externa |
| Cotas e preços de cada plano | Chaves e contratos definidos; concessões auditadas | BILL-001 para grants; preços em BILL-002 |
| Biblioteca de rich text e parser CSS/SVG | Reutilizar dependência existente adequada ou selecionar por spike/documentação atual | PAGE-001/WPRO-009 |
| Canvas além de listas com Pangea | Ensaio obrigatório; comandos acessíveis cobrem a primeira versão | WPRO-003 |
| Provider de geocodificação e cobrança Food | Adapter e estado indisponível até homologação | WPRO-012/017 |
| Infraestrutura de PHP | Desativada, requisitos explícitos | WPRO-016, posterior ao core |
| Avanços locais não enviados pelo Gemini | Não presumir que estão em main | Antes de integrar schema/contratos |

Essas entradas não impedem começar contratos, core, UI e editor. Nenhuma decisão comercial ainda pendente justifica criar autorização permissiva temporária.

## 24. Fontes e rastreabilidade

Fonte interna principal: [base auditada do repositório](https://github.com/projetosdanhub/appbipedev/tree/489fae20e9370d099c1a77701fa1855deb4bb0c4), `AGENTS.md`, regras 00-35, taskboard, schema e packages. As imagens anexadas pelo usuário orientam a composição do editor; não foram copiadas como assets do produto.

Fontes técnicas primárias consultadas em 15/09/2026, com aplicação nas seções acima:

- [Elementor Theme Builder](https://elementor.com/help/the-elementor-theme-builder/): referência de composição global de partes do site.
- [Shopify Theme Architecture](https://shopify.dev/docs/storefronts/themes/architecture): referência de separação entre layout, templates, seções e blocos; o modelo BipeWPRO é próprio.
- [WooCommerce Product Add-Ons](https://woocommerce.com/document/product-add-ons/): referência de configuração de opções comerciais, sem dependência do plugin.
- [hello-pangea/dnd](https://github.com/hello-pangea/dnd): capacidades e limitações a validar no spike.
- [Google Search: guia inicial](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) e [Web Vitals](https://web.dev/articles/vitals): SEO e medição de qualidade.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): acessibilidade; auditoria automática não substitui avaliação de conformidade.
- [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) e [uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): defesa em profundidade para entradas não confiáveis.

Os desenhos de domínio, chaves de entitlement, fases e budgets adicionais são decisões desta proposta, sustentadas pela base do projeto; não são afirmações de implementação ou exigências atribuídas aos fornecedores de referência.
