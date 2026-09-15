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
