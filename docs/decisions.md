# Registro de decisoes

## ADR-0001 - marca BipeSend e dominios candidatos

**Decisao:** usar `BipeSend` como marca escolhida para a proxima versao da fundacao; tratar `bipesend.com.br` como dominio primario candidato e `bipesend.com` como dominio secundario candidato.  
**Motivo:** o nome comunica mensagens, atendimento e vendas sem limitar a plataforma a um unico modulo.  
**Risco:** disponibilidade de marca/domains e conflitos de mercado ainda precisam ser verificados.  
**Status:** escolhido para reestruturacao; registro pendente.

## ADR-0002 - stack inicial

**Decisao:** TypeScript end-to-end, Next.js no frontend, NestJS/Fastify na API, PostgreSQL + RLS + pgvector, Redis + BullMQ, Docker Compose local.  
**Motivo:** contratos compartilhados e menor dispersao operacional no MVP.  
**Alternativas:** backend Python completo; microservicos desde o inicio; Pinecone desde o inicio.  
**Status:** aprovada para o marco inicial.

## ADR-0003 - WhatsApp por adapter

**Decisao:** provider adapter com implementacao nao oficial isolada para desenvolvimento/avaliacao e rota futura oficial.  
**Motivo:** desacoplamento e controle de risco.  
**Status:** requer validacao juridica/operacional antes de venda.

## ADR-0004 - IA sem acesso direto

**Decisao:** IA usa ferramentas allowlist, read-only no inicio, com tenant context, schemas, limites e auditoria.  
**Motivo:** reduzir prompt injection, exfiltracao e escalada de privilegio.  
**Status:** obrigatoria.

## ADR-0005 - arquitetura modular e ordem cronologica

**Decisao:** organizar dominios com pastas numeradas de `00-shared` a `14-platform`, mais `99-test-support`, e separar cada modulo em domain/application/infrastructure/presentation/tests quando aplicavel.  
**Motivo:** evitar arquivos monoliticos, reduzir imports circulares e tornar a localizacao compreensivel para pessoas e agentes de IA.  
**Status:** aprovada para a fundacao.

## ADR-0007 - HTTPS e proxy como entrada unica

**Decisao:** usar Nginx como referencia de borda; localmente, disponibilizar
os hosts `*.localhost` em HTTPS na porta `3443` com certificado de
desenvolvimento, mantendo os processos em portas upstream de loopback. Em
producao, redirecionar `80` para `443`, usar certificados gerenciados e
habilitar HSTS somente depois da validacao dos subdominios.

**Motivo:** manter o mesmo modelo de superficies (`www`, `app`, `admin`, `api`
e `hooks`) em local e producao, reduzir erro de configuracao e impedir acesso
direto aos servicos internos.

**Alternativa rejeitada:** tratar `.htaccess` como controle universal; ele so
funciona em Apache e nao protege Node, Nginx, Docker ou buckets.

**Status:** aprovada para a fundacao; certificados e DNS de producao pendentes.

## ADR-0008 - catalogo de erros e reporte auditavel

**Decisao:** separar status HTTP de codigo de aplicacao `BPS-<DOMINIO>-<NUMERO>`;
usar resposta segura com `message` e `requestId`; aceitar reportes autenticados
do tenant e fazer triagem no superpainel com estados `open`, `investigating`,
`resolved` e `ignored`.

**Motivo:** HTTP `201` e sucesso, e o uso de status como dicionario gera
ambiguidade. Um codigo estavel permite localizar modulo, runbook e causa sem
vazar stack trace ou PII.

**Status:** aprovada; implementacao prevista em TEAM-005 e TEAM-006.

## ADR-0009 - saude de integracoes server-side

**Decisao:** cada adapter publica um estado operacional normalizado
(`connected`, `degraded`, `disconnected`, `misconfigured`, `not_entitled`,
`disabled`, `unknown`). O frontend recebe apenas resumo seguro; transicoes sao
auditadas e atualizadas por eventos/revalidacao controlada.

**Motivo:** identificar Stripe, Mercado Pago, WhatsApp e IA ausentes ou
desconectados sem enviar chaves ao browser e sem confundir limite de plano com
falha tecnica.

**Status:** aprovada; implementacao prevista em OPS-004 e OPS-005.

## ADR-0006 - contrato visual, motion e frescor de dados

**Decisao:** manter tokens tipograficos, cores e espacamentos em
`14_DESIGN_TOKENS.md`; manter o comportamento de interacao, animacao,
refresh, cache e deteccao de versao em `24_INTERACTIONS_MOTION_DATA_REFRESH.md`.
Atualizacoes de dados devem ser orientadas por eventos quando possivel, com
polling de fallback controlado e refresh manual preservando o contexto da tela.

**Motivo:** evitar regras visuais espalhadas, chamadas duplicadas, perda de
rascunhos e atualizacoes que interrompam o trabalho do usuario.

**Status:** aprovada para a fundacao.


## ADR-0010 - superficies separadas e bootstrap do platform_owner

**Decisao:** tenant, superadmin, API, hooks e servicos internos terao contratos
de autenticacao separados. O primeiro platform_owner sera criado somente por
CLI no VPS, com acesso OS/SSH autorizado, janela/nonce de secret manager,
advisory lock, hash Argon2id, MFA pendente e auditoria.

**Motivo:** dominio ou URL nao provam identidade do terminal. O controle real e
o acesso ao ambiente de controle, segredo fora do banco, transacao one-shot e
ausencia de endpoint publico.

**Status:** contrato aprovado; implementacao em AUTH-013 a AUTH-016.

## ADR-0011 - readiness sem mensagens de infraestrutura

**Decisao:** /health retorna somente liveness; /ready retorna estado e latencia
sanitizados. Mensagens brutas de Postgres, Redis, SDK e stack trace nao entram
na resposta. Diagnostico detalhado fica em logs internos com redacao e acesso
restrito.

**Motivo:** erros de conexão podem carregar host, usuario, DSN ou detalhes de
infraestrutura e não devem ser expostos por uma rota de health.

**Status:** corrigido na fundacao; manter teste de contrato.

## 2026-09-13 — fundação executável e identidade canônica

Adotado o ADR em [architecture/foundation.md](architecture/foundation.md): tokens/UI compartilhados, contratos/policies, taskboard estruturado e Auth.js como entrada web. Endpoints Fastify antigos de identidade retornam 410 para fechar caminho paralelo inseguro. Reconciliação do banco, registro de sessões e MFA completo permanecem gates explícitos. Pesquisa e evidências estão em research/ e audit/.

## ADR-0012 - Identidade global e vínculos empresariais separados

**Decisão:** Manter uma conta global (`User`) para login, e vínculos independentes (`Membership`) para cada empresa (`Tenant`), onde a origem do cadastro não concede autoridade implícita.
**Motivo:** Evitar vazamento de acessos entre lojas da mesma pessoa, e garantir que a autenticação e os poderes sejam gerenciados separadamente.
**Status:** Aprovada (parte do rascunho de acessos).

## ADR-0013 - Cargos cumulativos com escopo explícito

**Decisão:** O acesso efetivo será a soma dos cargos atribuídos. Os cargos possuem escopos: globais do tenant ou restritos a setores específicos.
**Motivo:** Evitar que a participação em um setor (ex: Vendas) libere acesso global indevidamente, permitindo que a edição no setor não escale para leitura de outros setores privados.
**Status:** Aprovada.

## ADR-0014 - Cargo base visível e substituível

**Decisão:** Ao criar um setor, um cargo base será criado visível e sem poderes implícitos. Não haverá "herança obrigatória" para cargos hierárquicos.
**Motivo:** Permite adicionar pessoas a um setor com permissões restritas (abaixo da base média) sem forçá-las a herdar privilégios desnecessários.
**Status:** Aprovada.

## ADR-0015 - Proprietário protegido e limites de delegação

**Decisão:** Cada tenant ativo terá exatamente um proprietário técnico (`ownerMembershipId`). Gestores só poderão delegar poderes que eles mesmos possuam (e que sejam marcados como delegáveis). Concessões de permissões diretas (exceções) serão permitidas apenas pelo proprietário inicialmente.
**Motivo:** Impedir escalada de privilégio por um gestor secundário e evitar travamentos na gestão principal.
**Status:** Aprovada.

## ADR-0016 - Convite com prova de finalidade e snapshot

**Decisão:** Convites não terão a senha provisória exposta de forma insegura. Utilizarão prova temporal e salvarão o snapshot exato dos acessos propostos. Se os acessos do cargo mudarem antes do aceite, o convite precisará de revisão.
**Motivo:** Prevenir que um cargo que ganhou privilégios recentemente conceda mais acesso do que o originalmente pretendido a convites antigos pendentes.
**Status:** Aprovada.

## ADR-0017 - Revogação coerente

**Decisão:** A revogação de acessos, setores ou cargos deve invalidar as permissões em todas as camadas (Banco, Cache, Jobs e Realtime).
**Motivo:** Garantir que sessões ativas (JWTs/Sockets) percam o acesso simultaneamente com a revogação no banco.
**Status:** Aprovada.

## ADR-0018 - Separação de comunicação, inbox e domínios

**Decisão:** Comunicação interna, inbox de clientes, domínio de site e serviços de e-mail terão módulos, regras de retenção e destinatários totalmente distintos.
**Motivo:** Uma "nota interna" não pode virar resposta ao cliente por falha de contexto; domínios DNS validados para site não autorizam envio de email corporativo implicitamente.
**Status:** Aprovada.

## ADR-0019 - Fonte de negócio (D-01)
**Decisão:** Fastify + serviços de aplicação + repositórios; Actions como BFF.
**Motivo:** Uma regra de acesso e de escrita para as superfícies do produto.
**Status:** Aprovada (CRM-001).

## ADR-0020 - Campos dinâmicos (D-02)
**Decisão:** Metadados relacionais em CustomField; valores limitados e tipados em JSONB no Contact.
**Motivo:** Flexibilidade sem transformar relações centrais em JSON arbitrário.
**Status:** Aprovada (CRM-001).

## ADR-0021 - CSV inicial (D-03)
**Decisão:** Importação síncrona, até 500 linhas e 512 KiB de CSV, com prévia e confirmação.
**Motivo:** Entrega útil sem depender de uma fila ainda inexistente; limites sujeitos ao ensaio de carga.
**Status:** Aprovada (CRM-001).

## ADR-0022 - Importação maior (D-04)
**Decisão:** Background após MSG-001/002, com contrato próprio de progresso e falha parcial.
**Motivo:** Arquivos grandes não devem atravessar Actions como arrays enormes.
**Status:** Aprovada (Pendente MSG).

## ADR-0023 - Autorização (D-05)
**Decisão:** Reutilizar ações canônicas e preservar ação + escopo + origem da concessão.
**Motivo:** Ler todo o tenant não pode ampliar o alcance de uma permissão de edição setorial.
**Status:** Aprovada.

## ADR-0024 - Identidade do cliente (D-06)
**Decisão:** Contact é dado do CRM, separado de User e Membership.
**Motivo:** Cadastrar/importar cliente não cria login, convite, senha ou acesso ao painel.
**Status:** Aprovada.

## ADR-0025 - Duplicidade comercial (D-07)
**Decisão:** Identificadores normalizados para busca e revisão; idempotência para repetição técnica; nenhuma fusão automática.
**Motivo:** Pessoas distintas podem compartilhar um telefone ou e-mail comercial.
**Status:** Aprovada.

## ADR-0026 - Entidade comercial (D-08)
**Decisão:** Contact e Deal são entidades distintas; um contato pode ter vários negócios.
**Motivo:** Evita transformar a etapa comercial em um atributo único do cliente.
**Status:** Aprovada.

## ADR-0027 - Comunicação (D-09)
**Decisão:** CRM-005 entrega conversas de atendimento e notas internas; chat da equipe tem domínio separado.
**Motivo:** Segue ADR-0018 e impede uma nota interna virar resposta ao cliente.
**Status:** Aprovada.

## ADR-0028 - Atribuição (D-10)
**Decisão:** Setor responsável, cargo de roteamento e membro responsável são referências explícitas.
**Motivo:** Cargo orienta fila/elegibilidade; não cria permissão nem muda a hierarquia de acesso.
**Status:** Aprovada.

## ADR-0029 - Realtime (D-11)
**Decisão:** WebSocket transporta avisos autorizados; HTTP e banco mantêm o estado canônico.
**Motivo:** Reconexão, revogação e eventos repetidos precisam de recuperação previsível.
**Status:** Aprovada.

## ADR-0030 - Ordem real (D-12)
**Decisão:** Antecipar contratos de atribuição; concluir CRM-007 antes do aceite integral de CRM-006.
**Motivo:** O aceite de CRM-006 exige notificação em tempo real.
**Status:** Aprovada.


## ADR-0004 - Pipelines, Etapas e Negocios (CRM-003)

**Decisao:**
1. **PipelineStage.requiredFieldRules**: Armazenar em JSONB com contrato explicito versionado ({"version":1,"rules":[]}). As regras referenciam campos nativos e customizados permitidos. A validacao ocorre no backend na criacao, transicao e transferencia. Valores omissos (null, vazio) reprovam; (0, false) sao aceitos quando validos.
2. **Moedas**: Moeda padrao BRL por pipeline. Negocios possuem currency persistida, definida via input ou herdada do pipeline. Totais sao segmentados por moeda; sem conversao neste MVP. Tipagem no BD e Decimal.
3. **Relacionamentos Prisma**: Negocios reusam Department, Role e Membership (opcionais). Integridade mantida via FKs compostas com 	enantId.

**Motivo:** Assegurar isolamento de tenant em FKs de CRM (evitar relacionamento cruzado), prevenir que configuracoes antigas quebrem entidades antigas, e fornecer base rigorosa para funis comerciais na primeira fase do MVP.
**Risco:** A gestao manual de transicoes via scripts de banco podera estar sujeita a falhas (optimistic locking no ORM lidara com aplicacoes concorrentes via ersion).
**Status:** Aprovada. Implementacao do CRM-003.

## ADR-BW-001 - BipeWPRO compartilhado e documento responsivo

**Decisão de planejamento:** um core, um renderer e um editor para tenant e conteúdo institucional, com documento versionado único e overrides por breakpoint. Preservar packages/ui e a marca atual do SaaS. O público não carrega o editor. Fonte: [plano BipeWPRO](plans/bipewpro.md), seções 5-10. **Implementação:** WPRO-002/003/004/007 e PAGE-001/002, ainda pendente.

## ADR-BW-002 - Propriedade e isolamento de publicação

**Decisão de planejamento:** PublishingSpace diferencia tenant e platform com invariantes explícitas. Contextos vêm da sessão/guard; não criar tenant fictício nem bypass por tenantId nulo. Dados públicos são projeções próprias. Eventos platform têm contrato separado/versionado, preservando tenantId obrigatório nos eventos tenant existentes. **Implementação:** WPRO-005 e integração de eventos.

## ADR-BW-003 - Entitlements antes do editor publicável

**Decisão de planejamento:** antecipar BILL-001; definições, concessões, quotas e reservas serão únicas para todo o produto. BILL-002/005 reutilizam o modelo, sem WebPlan/FoodPlan. Um site com inicial e três páginas consome um site e quatro páginas; links/âncoras não criam páginas. Conteúdo institucional tem criação comercial ilimitada, com limites técnicos. **Implementação:** BILL-001, ainda pendente.

## ADR-BW-004 - Código personalizado e PHP

**Decisão de planejamento:** HTML/CSS/SVG/shortcode passam por schemas, parsers, allowlists e isolamento. PHP não executa em Next/Fastify/worker geral; capability permanece indisponível até WPRO-016 validar runtime isolado sem credenciais do SaaS, rede/recursos controlados e kill switch. Filtro de strings não comprova segurança. **Implementação:** WPRO-006/009/016, ainda pendente.

## ADR-BW-005 - Food separado de aparência e billing de assinatura

**Decisão de planejamento:** produtos/adicionais/entrega/pedido ficam em 10-catalog e gestão própria; editor consome bindings tipados. Preço/frete e snapshot são server-side; atendimento e pagamento têm estados distintos. CAT-003 entrega núcleo de pedido sem depender de AUTO-001; integração avançada fica explicitamente em WPRO-017, preservando seu escopo original de automação. Cobrança Food é distinta da assinatura SaaS. **Implementação:** CAT e WPRO-012/013/017, ainda pendente.

## ADR-BW-006 - Publicação imutável e domínio verificado

**Decisão de planejamento:** release fixa revisões de páginas/tema/templates/menu/assets; job idempotente e ativação por geração evitam corrida. Reutilizar MSG-001/002. Slug/host são normalizados e únicos; propriedade DNS e TLS antecedem ativação. URL provisória tenant fica em origem separada de autenticação; conteúdo institucional pode usar domínio controlado da plataforma. **Implementação:** PAGE-003 e WPRO-011, ainda pendente.

## ADR-BW-007 - DnD precisa de ensaio

**Decisão de planejamento:** preservar @hello-pangea/dnd conforme AGENTS/regra mestre. Ensaiar camadas/listas e comandos de hierarquia em WPRO-003; Flex/Grid no renderer não implica suporte de drag livre bidimensional. Qualquer mudança de motor exige evidência e decisão específica, sem trocar o CRM silenciosamente. **Implementação:** WPRO-003, ainda pendente.

## ADR-BW-008 - Integração aditiva e evidência

**Decisão:** branch `feat/bipewpro-planning` desde `489fae2`, com documentação/regras/taskboard antes da implementação. Preservar estados históricos e resolver conflitos por card/arquivo. Packages novos só existem quando houver código/consumidor; não migrar schema/contratos em massa durante trabalho local concorrente. SEO/Lighthouse/CWV/WCAG são critérios de validação, sem promessa de ranking ou certificação automática. **Evidência desta etapa:** [auditoria de planejamento](audit/bipewpro-planning.md).
