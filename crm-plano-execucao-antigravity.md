# BipeSend — plano de execução de CRM-001 a CRM-007 para o Antigravity

**Versão:** 1.0 — planejamento para implementação  
**Data da análise:** 15/09/2026  
**Repositório:** [projetosdanhub/appbipedev](https://github.com/projetosdanhub/appbipedev)  
**Código de referência:** [95639ef08979d37fd713a5c31c6df3784d4da7f4](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4)  
**Entrega deste trabalho:** especificação e roteiro. Nenhum código, card, banco ou ambiente foi alterado por esta análise.

**Leitura rápida:** [decisões](#2-revisão-do-esboço-e-decisões-recomendadas), [preparação e ordem](#3-preparação-e-ordem-das-entregas), [CRM-001](#7-crm-001--contatos-campos-customizados-e-importação), [testes](#17-estratégia-de-testes-e-evidências) e [primeiro ciclo](#19-ordem-prática-de-trabalho-para-o-antigravity).

## 0. Como executar este documento

Este roteiro transforma o esboço inicial em entregas verificáveis de produto, dados, autorização, operação e interface. As decisões novas abaixo são recomendações concretas para adoção na implementação; não são descrições de funcionalidades já prontas.

Ao receber este arquivo como instrução de trabalho:

1. Ler AGENTS.md, rules/00_MASTER.md, regras do domínio, docs/taskboard.json, docs/taskboard.md e READMEs dos pacotes afetados.
2. Comparar o checkout atual com o commit de referência. Preservar alterações locais e trabalho de outras pessoas. O estado mais recente precisa ser inspecionado antes de reutilizar qualquer achado deste documento.
3. Executar a etapa de preparação da seção 3. Não começar criando tabelas de CRM sobre um banco cujo histórico não foi identificado.
4. Registrar as decisões adotadas em docs/decisions.md, usando os próximos IDs disponíveis. Os rótulos D-01 a D-12 deste arquivo são referências internas, não IDs de ADR existentes.
5. Implementar uma fatia completa por vez: contrato, autorização, persistência, API, interface, falhas e evidência.
6. Antes da edição, declarar arquivos e critérios de aceite da fatia. Ao concluir, registrar comandos executados, resultados e limitações.
7. Atualizar a fonte docs/taskboard.json; gerar o Markdown por taskboard:render e validar por taskboard:check. Não editar apenas o Markdown gerado.
8. Continuar trabalho reversível já autorizado. Pedir decisão somente diante de conflito real que não possa ser resolvido pelo escopo e pelas regras vigentes.
9. Entregar branch e diff revisáveis. Merge, deploy, mudanças em produção e ativação de provedores seguem a autorização operacional da sessão de execução.
10. Nunca marcar DONE por presença de arquivo, mock visual, validação de Zod ou relato antigo de testes.

**Convenção dos passos:** referências como “CRM-004.A” indicam fatias de um card existente. Não criar cards com esses IDs automaticamente.

**Primeira entrega recomendada:** preparação + CRM-001.A/B, com contato real criado e consultado pela API, isolamento testado e formulário conectado. Importação, campos e demais critérios ainda precisam ser finalizados antes de CRM-001 ficar DONE.

## 1. O que foi verificado no repositório

### 1.1 Situação do taskboard na referência analisada

| Card | Estado registrado | Leitura para este planejamento |
| --- | --- | --- |
| INF-001, AUTH-001, AUTH-008, AUTH-016 | DONE | Confirmar evidências e comportamento no checkout/ambiente de execução. |
| TEAM-001, TEAM-002 | DONE | Há modelos de setores/cargos; isso não prova que a API já calcula todos os escopos. |
| TEAM-003 | BACKLOG | O ciclo completo de suspensão, reativação e transferência afeta atribuição e realtime. |
| TEAM-004 a TEAM-007 | DONE | Reutilizar contratos existentes; validar a integração necessária ao CRM. |
| CRM-001 a CRM-007 | BACKLOG | Nenhum destes sete cards foi considerado implementado nesta análise. |
| MSG-001 e MSG-002 | BACKLOG | Outbox durável, relay e BullMQ ainda precisam de entrega própria. |

Fonte: [taskboard do commit analisado](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/taskboard.json).

### 1.2 Achados que alteram o plano inicial

| Achado no código/documentação | Consequência prática |
| --- | --- |
| rules/00_MASTER.md já determina Actions finas chamando Fastify por HTTP | Manter essa direção em todo o CRM. |
| 05-crm e 06-inbox possuem apenas a estrutura inicial de pastas | Controllers, serviços, repositórios, composição e testes precisam ser conectados de verdade. |
| O Prisma ainda não possui Contact, CustomField, Deal ou Conversation | Modelar por migrations novas, sem presumir estruturas já existentes. |
| O schema possui MembershipRole, DepartmentMembership, DepartmentRoleAssignment e concessões diretas | Reutilizar essas entidades de equipe; conferir FKs, migrations e estado real antes de integrá-las. |
| auth/policies ainda resolve a matriz fixa tenant_admin/manager/agent/viewer | A especificação de cargos cumulativos ainda não equivale ao caminho de autorização efetivamente usado pela API. |
| TenantContext possui uma lista de nomes de permissões, sem pares de ação e escopo | É necessário evoluir o contrato para não ampliar permissões departamentais para o tenant inteiro. |
| crm.contacts.read/create/update/delete/export já existem | Não substituir essas chaves por crm.contacts.manage. |
| crm.deals.write e inbox.conversations.* já existem | Fazer migração explícita quando introduzir ações mais granulares. |
| fetchApi já existe e encaminha todos os cookies | Reutilizar a ponte, restringindo cookies/cabeçalhos, origem, timeout, redirects e cache. |
| A navegação atual chama “Contatos” em /users | Criar uma rota canônica de contatos e preservar um redirecionamento de compatibilidade. |
| /users, /crm e /inbox contêm dados demonstrativos | Substituir a experiência da rota entregue por dados reais e estados reais. |
| packages/events fornece helpers; apps/worker tem README, sem worker operacional observado | Não anunciar job, entrega durável ou atualização distribuída somente por chamar um helper. |
| O script de testes da API procura src/tests; as novas pastas de testes ficam em modules | Incluir explicitamente os testes dos módulos no runner e no gate. |

Há também documentação histórica incompatível com o estado novo: a matriz em docs/architecture/permissions.md ainda cita crm.contacts.write; o handoff e relatórios antigos descrevem gates antes de mudanças recentes. A preparação precisa reconciliar essas referências, sem reabrir ou aprovar cards apenas por inferência.

O schema atual apresenta estruturas de equipe que precisam ser comparadas com o histórico SQL versionado e o banco real. Esta análise foi de código: **não houve introspecção do banco, execução de migrations, E2E ou medição de desempenho**.

## 2. Revisão do esboço e decisões recomendadas

| Decisão | O que faremos | Motivo |
| --- | --- | --- |
| D-01 — fonte de negócio | Fastify + serviços de aplicação + repositórios; Actions como BFF | Uma regra de acesso e de escrita para as superfícies do produto. |
| D-02 — campos dinâmicos | Metadados relacionais em CustomField; valores limitados e tipados em JSONB no Contact | Flexibilidade sem transformar relações centrais em JSON arbitrário. |
| D-03 — CSV inicial | Importação síncrona, até 500 linhas e 512 KiB de CSV, com prévia e confirmação | Entrega útil sem depender de uma fila ainda inexistente; limites sujeitos ao ensaio de carga. |
| D-04 — importação maior | Background após MSG-001/002, com contrato próprio de progresso e falha parcial | Arquivos grandes não devem atravessar Actions como arrays enormes. |
| D-05 — autorização | Reutilizar ações canônicas e preservar ação + escopo + origem da concessão | Ler todo o tenant não pode ampliar o alcance de uma permissão de edição setorial. |
| D-06 — identidade do cliente | Contact é dado do CRM, separado de User e Membership | Cadastrar/importar cliente não cria login, convite, senha ou acesso ao painel. |
| D-07 — duplicidade comercial | Identificadores normalizados para busca e revisão; idempotência para repetição técnica; nenhuma fusão automática | Pessoas distintas podem compartilhar um telefone ou e-mail comercial. |
| D-08 — entidade comercial | Contact e Deal são entidades distintas; um contato pode ter vários negócios | Evita transformar a etapa comercial em um atributo único do cliente. |
| D-09 — comunicação | CRM-005 entrega conversas de atendimento e notas internas; chat da equipe tem domínio separado | Segue ADR-0018 e impede uma nota interna virar resposta ao cliente. |
| D-10 — atribuição | Setor responsável, cargo de roteamento e membro responsável são referências explícitas | Cargo orienta fila/elegibilidade; não cria permissão nem muda a hierarquia de acesso. |
| D-11 — realtime | WebSocket transporta avisos autorizados; HTTP e banco mantêm o estado canônico | Reconexão, revogação e eventos repetidos precisam de recuperação previsível. |
| D-12 — ordem real | Antecipar contratos de atribuição; concluir CRM-007 antes do aceite integral de CRM-006 | O aceite de CRM-006 exige notificação em tempo real. |

### 2.1 Respostas às três perguntas do esboço

**Campos customizados:** sim, usar JSONB para os valores neste primeiro recorte. Remover a afirmação “é a abordagem mais performática”. O desempenho depende das consultas, cardinalidade, tamanho e índices; GIN e índices por expressão atendem usos diferentes. Campos pesquisados/ordenados intensamente podem exigir projeções tipadas posteriormente. A escolha aqui é de adequação ao MVP, com medição. [PostgreSQL — JSON e índices](https://www.postgresql.org/docs/current/datatype-json.html).

**CSV:** usar 500 linhas/512 KiB como orçamento inicial proposto, não 1.000 linhas arbitrariamente. A prévia e a confirmação são requisições distintas, e a confirmação grava o lote selecionado de forma atômica. Reduzir o limite se os testes não cumprirem o orçamento; aumentar somente com evidência. Um CSV de 512 KiB pode produzir JSON maior: impor também limite ao corpo HTTP final.

**Permissões:** manter crm.contacts.read/create/update/delete/export; acrescentar crm.contacts.import e permissões de campos conforme a seção 5. Não criar um crm.contacts.manage que apague a distinção entre cadastrar, alterar, excluir e exportar.

### 2.2 Correções pontuais obrigatórias

- O backend de negócio é **Fastify**. “FastAPI” no esboço é um engano; Python/FastAPI pertence ao contexto de IA do projeto.
- CRUD precisa incluir detalhe, atualização e política de remoção/arquivamento; o esboço só enumera parte das rotas.
- RLS é uma política aplicada no banco, não uma propriedade obtida por escrever “forte RLS” no repositório.
- Parsing local de CSV serve para ajudar a pessoa. O servidor valida os bytes, o mapeamento e todas as linhas novamente.
- Filtros recebidos não são objetos Prisma nem SQL/JSONPath arbitrário.
- Permissão e tenant são verificados na API mesmo que a Action tenha chamado getWorkspaceUser().
- Não salvar campos de autoridade recebidos pelo cliente: tenantId, createdByMembershipId, status interno de importação, versão de política e autoria de mensagem.
- Atualização parcial precisa de semântica explícita: campo omitido mantém valor; remoção é intencional; substituição integral de JSON não é o padrão.

## 3. Preparação e ordem das entregas

### 3.1 Preparação P-01 — repositório e evidências

- [ ] Conferir branch, commit e alterações locais; criar branch de trabalho adequada sem reset/clean.
- [ ] Conferir as dependências declaradas de cada card e abrir suas evidências.
- [ ] Ler os guias da versão local de Next em node_modules/next/dist/docs, conforme apps/tenant-web/AGENTS.md.
- [ ] Registrar decisões deste roteiro que forem adotadas, diferenças em relação ao código e responsáveis pelos bloqueios.
- [ ] Confirmar o caminho real da API no proxy e o prefixo versionado antes de publicar contratos.
- [ ] Preparar somente dados sintéticos de pelo menos dois tenants e múltiplos perfis.

### 3.2 Preparação P-02 — banco e transação

- [ ] Seguir packages/db/README.md e docs/architecture/database-reconciliation.md.
- [ ] Identificar o histórico do ambiente; inspecionar schema, constraints, índices, roles e policies.
- [ ] Comparar as entidades novas de equipe com migrations efetivamente aplicadas.
- [ ] Usar um único histórico de migration futura; não executar Prisma e node-pg-migrate sobre o mesmo banco como tentativa de conserto.
- [ ] Reconciliar em ambiente isolado; não editar SQL histórico já aplicado.
- [ ] Confirmar role de execução sem superuser/BYPASSRLS/DDL e sem propriedade das tabelas.
- [ ] Validar withTenantTransaction com a versão real do Prisma, incluindo a chamada que define o contexto.
- [ ] Testar que contexto e query usam o mesmo cliente transacional e não vazam pelo pool.

### 3.3 Preparação P-03 — contexto e políticas do CRM

Evoluir o caminho compartilhado de autorização antes de liberar registros setoriais:

1. Autenticar a sessão de tenant e vincular a sessão ao subject real.
2. Resolver Membership e Tenant atuais e ativos; reconciliar status novo e active legado.
3. Carregar concessões globais, setoriais e diretas válidas, considerando expiração e revogação.
4. Preservar o setor da concessão: entrar também em Suporte não amplia uma permissão recebida apenas em Vendas.
5. Representar concessões por ação e escopo; invalidar revisões conforme a mudança.
6. Gerar predicados por recurso para leitura, contagem, alteração e exclusão.
7. Testar a combinação de escopos, a suspensão e a remoção de vínculo com o banco real.
8. Atualizar contratos e documentação de compatibilidade. Não usar uma lista de strings como substituto dos escopos.
9. Auditar operações com ator efetivo e, quando houver suporte/impersonação, com ator original e finalidade. O CRM não cria bypass novo por isSuperadmin.
10. Confirmar que uma sessão revogada é negada também quando Redis está indisponível ou foi atualizado fora de ordem.

Sem esse gate, pode-se preparar schema, componentes e contratos, mas não entregar acesso setorial alegando que o isolamento dentro do tenant está pronto.

### 3.4 Ordem operacional recomendada

| Ordem | Entrega | Condição para encerrar |
| --- | --- | --- |
| 0 | P-01 a P-03 | Base e caminho de autorização necessários comprovados. |
| 1 | CRM-001 | Contatos, campos, importação limitada e isolamento completos. |
| 2 | CRM-002 | Tags e segmentos reais, com limites e filtros seguros. |
| 3 | CRM-003 | Pipeline, etapas e negócios persistentes. |
| 4 | CRM-004.A | Cards/lista; esta fatia ainda não conclui o card inteiro. |
| 5 | CRM-005 | Conversas, notas internas e histórico por HTTP. |
| 6 | CRM-004.B | Integração das visualizações com inbox; concluir CRM-004. |
| 7 | MSG-001 e MSG-002 | Outbox/relay/fila/dedupe reais, necessários à entrega distribuída. |
| 8 | CRM-007 | Sockets, autorização, revogação e recuperação. |
| 9 | CRM-006 | Atribuição completa e notificação real, com TEAM-003 validado. |

Os contratos e colunas de atribuição entram junto com Contact, Deal e Conversation. Isso permite construir policies e rooms antes da interface completa de atribuição, sem inverter dependências.

~~~mermaid
flowchart TD
  P["Preparação e autorização"] --> C1["CRM-001 · Contatos"]
  C1 --> C2["CRM-002 · Segmentos"]
  C1 --> C3["CRM-003 · Negócios"]
  C1 --> C5["CRM-005 · Conversas"]
  C3 --> C4["CRM-004 · Visualizações"]
  C5 --> C4
  C5 --> M["MSG-001/002 · Eventos e filas"]
  M --> C7["CRM-007 · Realtime"]
  C7 --> C6["CRM-006 · Atribuição completa"]
  C3 --> C6
  C5 --> C6
~~~

### 3.5 Ajustes propostos no taskboard

Aplicar após conferir o checkout e registrar a decisão; este documento não alterou o board:

- **CRM-004:** acrescentar CRM-005 para o aceite integral da integração com inbox.
- **CRM-006:** acrescentar CRM-001, CRM-003, CRM-005, TEAM-002, TEAM-003 e CRM-007; preservar TEAM-001 e AUTH-016.
- **CRM-007:** acrescentar MSG-001 e MSG-002; preservar CRM-005 e AUTH-016.
- **CRM-005/007:** incluir 06-inbox nas áreas de código, além das integrações necessárias com 05-crm.
- **CRM-001:** incluir packages/db, packages/auth, packages/config e packages/events onde efetivamente alterados.
- Não tornar CRM-007 dependente de CRM-006 enquanto CRM-006 depende da entrega realtime.
- A persistência mínima da outbox pode ser preparada em CRM-001 como infraestrutura compartilhada; MSG-001 só fica DONE com relay, dedupe e testes completos após suas dependências.
- O CSV síncrono de CRM-001 não depende do worker. Background é expansão posterior; não remover critérios de durabilidade para antecipá-lo.
- Se uma dependência existente estiver declarada DONE mas o cenário necessário falhar, registrar o defeito/evidência e corrigir a fatia necessária; não ignorar a falha nem reabrir todos os cards sem diagnóstico.

## 4. Arquitetura e contratos transversais

### 4.1 Responsabilidade por camada

| Camada/caminho | Responsabilidade |
| --- | --- |
| apps/tenant-web/src/app | Rotas, composição inicial, loading/error e metadados. |
| features/crm e features/inbox | Formulários, tabelas, fluxo, estado de interface e feedback. |
| Actions | Sessão web, validação de borda, chamada HTTP, tratamento seguro e invalidação. |
| Loaders de servidor | Leituras pela API; não usar Server Actions como mecanismo genérico de consultas. |
| src/lib/api-client.ts | Cliente HTTP server-only, tipado e restrito à origem configurada. |
| API presentation | Rotas finas, schemas, autenticação e encaminhamento ao caso de uso. |
| API application | Regras, autorização de recurso, transações e coordenação. |
| API domain | Invariantes de contatos, filtros, etapas, mensagens e atribuições. |
| API infrastructure | Repositórios, adaptadores e persistência, sempre sob contexto confiável. |
| packages/contracts | Schemas e DTOs públicos; inferir tipos do schema. |
| packages/auth | Contexto e avaliação de concessões, sem importar runtime Next na API. |
| packages/db | Prisma, migrations e unidade de transação. |
| packages/events | Envelope, outbox, dedupe e política transversal de entrega. |
| apps/worker | Execução de jobs; não duplicar regras comerciais da API. |
| packages/ui | Componentes e tokens reutilizáveis; sem consultas ou autorização de negócio. |

O domínio de contatos/tags/segmentos/pipelines fica em **05-crm**. Conversas de atendimento e notas ficam em **06-inbox**. Jobs de envio/provedores ficam em **07-messaging**. Atribuição compartilha contrato, mas cada domínio altera sua entidade por sua própria API pública interna.

Não importar serviços privados de apps/api no tenant-web. API e worker também não devem copiar validações: quando existir consumidor real no worker de um caso de uso de CRM, extrair uma fronteira server-only compartilhada e registrá-la em ADR; o CSV síncrono não precisa dessa extração agora.

Ao consumir Prisma/eventos diretamente na API, declarar @bipesend/db e @bipesend/events como dependências reais do pacote, quando necessários. O package.json atual de db aponta para src/index.ts: conferir exports ESM, build e execução Node de produção; não provar compatibilidade apenas com tsx em desenvolvimento. Ajustar a distribuição server-only do pacote de forma compatível com os consumidores existentes e testar o start compilado da API.

### 4.2 Ponte Next → Fastify

Evoluir fetchApi existente:

- Aceitar somente caminhos relativos de rotas internas autorizadas, nunca URL livre vinda de formulário.
- Validar API_URL como configuração server-only; fallback local somente em desenvolvimento.
- Encaminhar apenas o cookie de sessão necessário à superfície tenant, incluindo seu formato real/chunking se aplicável. Não encaminhar cookies de recuperação ou da superfície platform.
- Derivar o tenant selecionado da sessão/seleção validada da aplicação; enviar como seletor explícito. A API resolve a membership novamente.
- Impedir que headers arbitrários de options substituam contexto de autenticação.
- Usar timeout, cancelamento e redirect bloqueado para não encaminhar credenciais a outro host.
- Consultas com dados pessoais: cache privado/sem cache compartilhado; qualquer cache futuro inclui tenant, vínculo, revisão de acesso e filtros.
- Respostas tipadas e erros normalizados; não propagar exception.message, stack ou SQL para a UI.
- Retries automáticos de mutação somente quando houver contrato de idempotência.
- Content-Type depende do endpoint. Upload não deve receber application/json por padrão quando for multipart.
- Validar CSRF/origem também na fronteira real da API autenticada por cookie; CORS sozinho não é prova de proteção.
- Rejeitar seletor de tenant conflitante entre parâmetros/cabeçalhos, em vez de escolher silenciosamente um deles.

Prefixo proposto para novos contratos: **/api/v1/tenants/:tenantId**. Os endpoints legados de equipe usam /tenants/:tenantId. Registrar a escolha e o proxy antes de implementar; não duplicar /api/v1 no mount e na rota, nem renomear endpoints existentes por efeito colateral.

### 4.3 Forma comum de dados e concorrência

- UUIDs conforme o banco atual; nomes de coluna em snake_case.
- tenantId em toda entidade do cliente, inclusive tabelas de associação, importações e eventos.
- createdAt/updatedAt em UTC; datas civis usam YYYY-MM-DD sem conversão indevida de fuso.
- version inteiro para recursos mutáveis. PATCH e comandos concorrentes recebem expectedVersion.
- Atualizar com condição de versão, tenant e escopo; zero linhas afetadas exige resposta segura, nunca sucesso fictício.
- FKs compostas preservam tenant, e FKs de etapa também preservam pipeline. Prisma/schema deve refletir as relações; SQL complementa o que não expressar.
- Evitar associação genérica resourceType/resourceId sem FK para a verdade principal da atribuição.
- Queries, joins, contagens, autocompletes e relatórios obedecem ao mesmo predicado de autorização.
- TenantId do payload não pode mover um registro para outra empresa.
- Eventos e auditoria da alteração persistem na mesma transação da entidade.
- Não misturar a transação Prisma com uma transação pg separada acreditando que haverá atomicidade conjunta.

FKs compostas garantem pertença estrutural; regras como “membro está ativo” exigem validação transacional adicional. [PostgreSQL — constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

### 4.4 RLS e checagem de escopo

Habilitar ENABLE/FORCE RLS nas novas tabelas do tenant, definir USING/WITH CHECK e conferir privilégios da role real de execução. Contexto ausente deve negar acesso. RLS por tenant complementa, mas não implementa automaticamente, as restrições por setor/responsável. [PostgreSQL — row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

O serviço valida acesso antes da operação e mantém uma leitura coerente de acesso durante a transação. Definir ordenação de locks/revisões compartilhada com as operações de revogação. Uma operação autorizada e uma revogação concorrente precisam ter ordem de commit definida; operações iniciadas após revogação confirmada não podem usar concessões antigas.

Não prometer retirar dados que já foram exibidos, copiados ou baixados. A revogação impede novos acessos e novas entregas; não apaga conhecimento já recebido.

## 5. Permissões, escopos e visibilidade

### 5.1 Catálogo a reutilizar e ampliar

“Nova” significa proposta que precisa entrar em contracts, policies, persistência/seed controlado de permissões, matriz, testes e editor de cargos. Não é uma string já implementada.

| Recurso | Permissões | Situação |
| --- | --- | --- |
| Contatos | crm.contacts.read/create/update/delete/export | Existentes. |
| Importação | crm.contacts.import | Nova; também exige create no destino. |
| Campos | crm.fields.read/manage | Novas; manage controla definições, não concede leitura de valores do contato. |
| Tags | crm.tags.read/manage/assign | Novas; atribuir também exige update do contato. |
| Segmentos | crm.segments.read/manage | Novas; consultar membros exige contacts.read. |
| Pipelines | crm.pipelines.read/manage | Novas. |
| Negócios | crm.deals.read/write | Existentes; write tem compatibilidade a migrar. |
| Negócios granulares | crm.deals.create/update/delete/move/assign | Novas; mapear compatibilidade explicitamente. |
| Atribuição de contato | crm.contacts.assign | Nova; exige acesso ao contato e ao destino. |
| Assumir da fila | crm.contacts.claim, crm.deals.claim, inbox.conversations.claim | Novas; permitem assumir para o próprio vínculo elegível, sem encaminhar a terceiros. |
| Conversas | inbox.conversations.read/reply/assign | Existentes; reply não ativa canal externo por si. |
| Ciclo de conversa | inbox.conversations.create/update/resolve | Novas. |
| Nota interna | inbox.notes.create | Nova; leitura herda acesso autorizado à conversa. |
| Chat entre equipe | chat.messages.read/send e chat.history.read | Existentes, reservadas ao domínio de comunicação interna separado. |

O proprietário protegido recebe o conjunto que lhe compete por regra explícita. Não promover manager/agent a acesso global por adicionar uma nova chave ao enum. A matriz atual de tenant_admin usa todas as opções do enum: revisar esse efeito antes de acrescentar permissões reservadas.

Cada sufixo separado por barra na tabela representa uma chave distinta; não persistir a expressão abreviada. No fluxo do painel, create/import exigem também read no registro de destino; update/delete/assign/move exigem read do recurso afetado. Registrar dependências explícitas sem ampliar o escopo da leitura ou escrita. Para definições de campo, tags e pipelines sem proprietário/setor próprio, operações de gestão usam escopo TENANT; não aceitar OWN/ASSIGNED fictícios sobre entidades sem esses atributos. Segmentos privados conservam sua política específica de proprietário/visibilidade.

Para crm.deals.write, inventariar consumidores e mapear somente create/update/move dentro do mesmo escopo legado, se essa for a semântica confirmada. Não mapear automaticamente delete, assign, export ou gerência de pipeline. Não retirar a chave antiga até migrar consumidores e concessões.

### 5.2 Escopos operacionais

| Escopo | Predicado do recurso |
| --- | --- |
| TENANT | Recursos da empresa, respeitando estados e outras restrições da operação. |
| DEPARTMENT | departmentId pertence aos setores explicitamente cobertos pela concessão válida para aquela ação. |
| OWN | createdByMembershipId corresponde ao vínculo atual que criou o registro naquele tenant. |
| ASSIGNED | assignedMembershipId corresponde ao vínculo atual ativo. |

OWN representa autoria, alinhado à regra vigente. Alterar responsável não muda criador. Operações de sistema devem registrar autoria/finalidade própria; não inventar membro humano para satisfazer schema.

**Exemplo obrigatório de teste:** Ana lê contatos no tenant inteiro e edita somente em Vendas. Ela pode abrir um contato do Suporte, mas não alterá-lo. Um filtro “todos os contatos” não amplia sua permissão de edição.

A soma é de concessões completas. Não unir separadamente “todas as ações” e “todos os escopos”, pois isso cria combinações que nunca foram concedidas.

### 5.3 Relações e metadados

- Ver um negócio não concede automaticamente acesso integral ao contato vinculado.
- Para o MVP, retornos que incluem contato exigem também contacts.read sobre esse contato; omitir relações/contagens não autorizadas.
- Conversa vinculada a contato exige autorização da conversa e do contato. Se produto precisar permitir atendimento sem abrir cadastro, criar DTO mínimo e regra explícita em entrega futura.
- Catálogo mínimo de campos para formulário/lista é acessível com crm.fields.read junto à operação autorizada de contato; não conceder manage para preencher um valor.
- Campos customizados do MVP compartilham a política do contato. Não anunciar sigilo por campo ou armazenar segredos neles.
- Autocomplete de setor/cargo/membro retorna candidatos elegíveis mínimos; não expõe todo o cadastro de equipe ou dados globais de User.
- Ausência de permissão é distinta de lista vazia. Um ID válido fora do escopo retorna NOT_FOUND genérico, sem identificar o tenant proprietário.
- Exportação e ações em massa reavaliam o conjunto autorizado no servidor. Seleção no navegador não é autorização.

## 6. Convenções de produto e limites iniciais

### 6.1 Entidades que não podem ser confundidas

| Entidade | Significado | Não produz automaticamente |
| --- | --- | --- |
| User | Identidade de login | Acesso a todos os tenants. |
| Membership | Vínculo operacional em um tenant | Cadastro de cliente CRM. |
| Contact | Pessoa ou organização atendida | Usuário, senha, convite ou consentimento de marketing. |
| Deal | Oportunidade comercial | Novo contato ou nova conversa. |
| Conversation | Atendimento relacionado a um contato | Chat entre funcionários ou canal conectado. |
| Internal note | Anotação visível a membros autorizados da conversa | Envio ao cliente. |
| Department | Setor operacional | Autoridade implícita sobre qualquer recurso da empresa. |
| Routing role | Cargo elegível para a fila | Permissão adicional. |

### 6.2 Limites propostos, configurados no servidor

| Item | Limite inicial |
| --- | --- |
| Página comum | 25 por padrão; máximo 100, conforme contrato existente. |
| CSV síncrono | Até 500 linhas de dados, 512 KiB de arquivo, 60 colunas. |
| Corpo total da Action/endpoint de prévia | Até 768 KiB medidos; overhead incluído e configuração compatível na cadeia. |
| Campos ativos por tenant | Teto técnico inicial 50; entitlement pode ser menor. |
| Outros tetos técnicos por tenant | 100 mil contatos ativos, 500 tags ativas, 100 segmentos, 20 pipelines e 30 etapas por pipeline; propostas para ensaio, sujeitas a capacidade/entitlement menor. |
| Valor de texto customizado | Até 2.000 caracteres; JSON de valores até 32 KiB por contato. |
| Nome do contato | Até 255 caracteres. |
| E-mail | Até 254 caracteres, seguindo contrato canônico. |
| Filtro de segmento | Até 20 condições, profundidade 3, listas de até 100 valores. |
| Texto de nota interna | Até 10.000 caracteres e limite de bytes separado. |
| Prévia de importação | Dados temporários por até 24 horas. |
| Metadados de importação/idempotência | Janela inicial 30 dias, sem manter o CSV bruto. |
| Realtime | Limites de conexões, rooms e mensagens configurados antes da ativação. |

São limites de projeto para ensaio, não capacidades medidas nem preços de planos. Uma camada de entitlements deve calcular o menor valor entre limite técnico e plano vigente. Onde billing ainda não existir, usar configuração de capacidade explícita com testes; não inventar planos comerciais.

Consumo de quota é transacional: serializar a criação/reativação pelo registro de quota ou lock do tenant/recurso, verificar a capacidade atual e persistir consumo junto ao efeito. Não usar “contar e depois inserir” em conexões independentes. Arquivar/restaurar tem regra de consumo documentada, sem permitir ciclos de restauração que ultrapassem o limite. Quota de contatos não limita a leitura de uma base já acima do teto após downgrade.

O limite padrão documentado de Server Actions é 1 MB e inclui overhead. A versão instalada e o proxy devem ser conferidos; não aumentar o limite global apenas para aceitar arrays grandes. [Next.js — bodySizeLimit](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions).

### 6.3 Normalização, repetição e duplicidade

**Login:** manter a unicidade global de e-mail normalizado da identidade, conforme o contrato de autenticação.

**CRM:** e-mail/telefone não identificam globalmente uma pessoa. O mesmo e-mail pode existir em tenants distintos e pode representar contatos comerciais diferentes no mesmo tenant. A decisão recomendada é:

1. Guardar valor de exibição e valor normalizado para busca.
2. Normalizar e-mail com trim/lowercase conforme contrato; não remover pontos ou sufixos “+”.
3. Normalizar telefone para E.164 apenas quando país e número forem válidos. Solicitar país na importação quando necessário; não transformar todo número em brasileiro silenciosamente.
4. Criar índices não únicos de tenant + emailNormalized/phoneE164.
5. Exibir candidatos a duplicidade somente dentro do escopo de leitura do ator.
6. Na criação manual, a pessoa revisa candidatos visíveis e confirma “Criar contato separado” se for intencional. Não escolher um contato arbitrário.
7. Na importação inicial, ignorar candidatos visíveis por padrão e nunca atualizar/mesclar registros automaticamente.
8. Não mostrar contagem ou identificação de correspondências fora do escopo. Informar que a revisão cobre os registros acessíveis.
9. Idempotência evita repetir a mesma operação técnica. Não promete impedir dois operadores de cadastrarem a mesma pessoa em operações independentes.
10. Uma política futura de identificadores exclusivos por tenant exigirá decisão explícita, análise de telefones/e-mails compartilhados e migração de conflitos.



## 7. CRM-001 — contatos, campos customizados e importação

### 7.1 Resultado esperado

A pessoa autorizada consegue cadastrar, consultar, pesquisar, editar e arquivar contatos reais do tenant; definir campos adicionais; importar um CSV pequeno com revisão; recuperar-se de erro de rede sem duplicar o lote. O contato já nasce com autoria, contexto e versão para suportar os próximos cards.

### 7.2 Modelo de Contact

| Campo lógico | Tipo / regra |
| --- | --- |
| id, tenantId | UUID; tenant derivado do contexto. |
| name | Texto até 255; manual exige nome não vazio. Importação aceita ausência de nome somente com identificador válido, sem inventar nome fictício. |
| email, emailNormalized | Opcionais; pares coerentes; vazio vira ausência. |
| phone, phoneE164, phoneCountry | Opcionais; valor original limitado e normalização validada; país de interpretação explícito. |
| source | Enum inicial manual ou csv_import; integrações futuras ampliam o contrato. |
| customFields | JSONB obrigatório, default objeto vazio; somente valores de definições conhecidas. |
| departmentId | Opcional; setor responsável, FK do mesmo tenant. |
| routingRoleId | Opcional; preparado para CRM-006, sem conceder acesso. |
| assignedMembershipId | Opcional; responsável atual, FK do mesmo tenant. |
| createdByMembershipId | Autoria do cadastro; imutável em operações comuns. |
| updatedByMembershipId | Último ator da alteração. |
| status, archivedAt | active ou archived; arquivar preserva histórico e relações. |
| version | Inteiro crescente, começando em 1. |
| createdAt, updatedAt | Instantes UTC. |

Invariantes:

- Exigir ao menos nome, e-mail válido ou telefone válido para não produzir registros vazios.
- Payload de criação não aceita autoria, source de provider, tenant ou status arbitrários.
- Criação manual/importação sem atribuição avançada pode usar setor autorizado e atribuição ao próprio ator. Atribuir a outra pessoa/cargo exige a operação específica.
- Registros sem departmentId só entram no alcance de TENANT, OWN ou ASSIGNED aplicável; não são automaticamente visíveis para todos os setores.
- Manter autoria mesmo após saída do colaborador; remoção comum de membro é revogação do vínculo, não cascade de contatos.
- Não permitir que PATCH altere departmentId/routingRoleId/assignedMembershipId por fora do serviço de atribuição.
- No SQL, restringir customFields a objeto JSONB e estados ao catálogo válido. Validação dinâmica contra definições continua no serviço; CHECK de JSON não substitui essa validação.

Índices iniciais: tenant + status + createdAt + id; tenant + emailNormalized; tenant + phoneE164; tenant + departmentId + status + id; tenant + assignedMembershipId + status + id; tenant + createdByMembershipId + id. Avaliar busca por nome com dados sintéticos; não criar um índice por campo possível sem uso demonstrado.

### 7.3 Modelo de CustomField

| Campo lógico | Tipo / regra |
| --- | --- |
| id, tenantId | UUID; definição pertence à empresa. |
| entityType | Enum; somente contact habilitado neste card. |
| key | Identificador estável, minúsculo, até 50 caracteres; regex controlada. |
| label | Texto visível, até 100 caracteres. |
| description | Ajuda opcional, até 500 caracteres; texto simples. |
| type | text, number, date, boolean, single_select ou multi_select. |
| options | Schema de opções com IDs estáveis, labels e estado; somente para selects. |
| validation | Objeto validado por tipo: comprimento, faixa, escala ou quantidade. Sem código/expressões executáveis. |
| required | Booleano, default false; política de aplicação descrita abaixo. |
| status | active ou archived. |
| sortOrder | Ordem determinística de apresentação. |
| version | Revisão da definição; muda em alterações relevantes. |
| createdByMembershipId, updatedByMembershipId | Atoria controlada pelo servidor. |
| createdAt, updatedAt, archivedAt | Timestamps. |

Constraints e comportamento:

1. Unicidade de tenantId + entityType + key. Reservar key mesmo depois do arquivamento.
2. Proibir colisão com campos nativos e chaves perigosas como __proto__, prototype e constructor.
3. A chave é imutável. Após uso, o tipo também é imutável; conversão exige nova definição e migração explícita.
4. IDs das opções permanecem estáveis quando o label muda.
5. Arquivar opção impede novos usos, mas preserva valores históricos. Não reutilizar ID com outro significado.
6. Atualizações de definições incrementam versão; imports e formulários antigos recebem conflito acionável.
7. required vale para novos contatos e para salvamento integral no editor. PATCH de um campo não relacionado não obriga saneamento retroativo de toda a base.
8. Antes de ativar required, mostrar impacto autorizado; não preencher valores antigos com um default fictício.
9. Arquivar campo tira-o dos novos formulários. Valores existentes ficam disponíveis no histórico/detalhe autorizado até a política de descarte.
10. Antes de arquivar campo usado por segmento/regra, informar dependências e exigir remoção explícita dessas referências.
11. Sem unicidade global de valor customizado, upload como campo, fórmula, HTML ou relacionamento arbitrário no MVP.
12. Todo novo tipo precisa de contrato, renderizador, validação, filtros e importação compatíveis; não cadastrar um tipo que a interface não sabe tratar.

### 7.4 Representação dos valores

Decisão para este recorte: usar key imutável da definição como chave do objeto JSONB.

~~~json
{
  "origem_detalhada": "Indicação",
  "numero_unidades": 12,
  "data_primeiro_contato": "2026-09-15",
  "aceita_reuniao": false,
  "perfil": "empresa",
  "interesses": ["crm", "atendimento"]
}
~~~

Os IDs de opções acima são ilustrativos; a implementação usa IDs estáveis validados contra a definição do tenant.

- text: string limitada, texto simples.
- number: número finito com faixa/escala limitada; não usar esse tipo para dinheiro ou identificadores que exigem precisão arbitrária.
- Limite inicial de number: magnitude até 1 trilhão e escala até 6 casas, validando conversão; inteiros devem ser seguros para o runtime. Não converter um identificador longo para número.
- date: data civil válida YYYY-MM-DD, sem aceitar datas impossíveis.
- boolean: boolean real; false não equivale a campo ausente.
- single_select: um ID ativo da definição.
- multi_select: array sem repetições, limitado, com IDs válidos.
- Ausência: chave não existe. O contrato de PATCH usa uma lista explícita de remoções; não espalhar JSON null e SQL NULL com significados distintos.
- Atualização: customFieldChanges.set e customFieldChanges.unset; os mesmos campos não podem aparecer nas duas listas.
- O servidor valida o objeto resultante e aplica o patch com controle de versão, preservando chaves não alteradas.

Não aceitar um record de z.unknown sem refinamento pelas definições reais do tenant. Limitar quantidade de chaves, tamanho total e estrutura de cada valor.

### 7.5 Importação — prévia e confirmação

**Formato inicial:** CSV UTF-8, com ou sem BOM. Separador vírgula ou ponto e vírgula, detectado e confirmado. Cabeçalhos, aspas, quebras de linha dentro de campos e CRLF devem ser tratados por parser confiável. Não usar split por vírgula/quebra de linha.

Transporte decidido para a prévia: multipart/form-data com um arquivo e metadados limitados. A Action encaminha ao endpoint Fastify com boundary correto, sem converter todas as linhas em array JSON no navegador. Adicionar e configurar parser multipart compatível com a versão instalada, incluindo limites do corpo, arquivo, partes e campos. O CSV-modelo e a prévia usam o mesmo contrato de colunas. Limitar também os dados normalizados temporários do batch a 2 MiB para controlar a expansão causada pelas chaves JSON repetidas.

Fluxo:

1. **Selecionar arquivo:** mostrar limites e link para um CSV-modelo sem dados reais.
2. **Mapear colunas:** nome, e-mail, telefone e campos existentes; permitir ignorar colunas. Não criar campo automaticamente a partir do cabeçalho.
3. **Definir interpretação:** país dos telefones, formato de data e separador decimal quando necessário. Conversões ambíguas exigem correção, não adivinhação.
4. **Enviar para prévia:** Action recebe arquivo limitado e metadados; API faz parsing autoritativo. Parsing local é opcional para sugerir mapeamento.
5. **Validar:** esquema, autorização de criação/destino, definições de campo, limites de plano, duplicatas no próprio CSV e candidatos acessíveis no CRM.
6. **Mostrar revisão:** linhas válidas, inválidas e ignoradas, com número de registro e motivo seguro. Linha lógica de CSV pode ocupar mais de uma linha física.
7. **Selecionar o lote:** por padrão, linhas inválidas e candidatas a duplicata ficam fora. A pessoa confirma explicitamente a quantidade selecionada.
8. **Confirmar:** enviar batchId, versão/hash da prévia, seleção de linhas previamente validadas e chave de idempotência. Não reenviar um array livre que substitui a prévia.
9. **Revalidar no servidor:** sessão, vínculo, concessões, destino, quota, definições e dados selecionados.
10. **Transacionar:** lock da importação; gravar todos os contatos selecionados, autoria, eventos e resumo de auditoria na mesma transação.
11. **Retornar resumo:** criados, ignorados na revisão e IDs autorizados necessários. O resultado deve bater com o lote confirmado.
12. **Recuperar rede perdida:** consultar o batch antes de tentar novamente. A mesma confirmação não pode cadastrar uma segunda cópia.

**Atomicidade:** todas as linhas selecionadas são gravadas ou nenhuma. “Importar somente válidas” é uma decisão anterior à escrita, exibida na prévia. Não confundir isso com gravar metade e falhar silenciosamente.

**Concorrência:** durante o commit, reavaliar candidatos visíveis surgidos desde a prévia. Se a revisão mudou, retornar conflito e pedir nova prévia; não mesclar ou atualizar automaticamente. Operações independentes continuam sujeitas à política de duplicidade assistida da seção 6.3.

**Tempo:** fazer parsing e trabalho pesado de validação antes da transação. Dentro dela, repetir as verificações mutáveis necessárias e usar escrita em lote. A transação deve caber no timeout vigente; não aumentar o timeout global para mascarar loops N+1.

### 7.6 Persistência de ContactImportBatch

| Campo | Função |
| --- | --- |
| id, tenantId, createdByMembershipId | Vincular a prévia ao tenant e ator. |
| status | preview_ready, preview_invalid, committed, cancelled ou expired. |
| requestKey, payloadHash | Idempotência de criação da prévia no escopo do ator/operação. |
| mapping, parseOptions | Objetos limitados e validados. |
| definitionSnapshot | IDs/keys/versões necessários à revisão. |
| stagedRows, rowIssues | Dados temporários mínimos; protegidos por RLS, tamanho e TTL. |
| selectionHash, confirmationKey | Fixam a seleção efetivamente confirmada. |
| totalRows, selectedRows, createdCount, skippedCount | Contagens reais. |
| resultReferences | Referências mínimas; cada leitura ainda autoriza os contatos atuais. |
| version, createdAt, expiresAt, committedAt | Concorrência e expiração. |

Constraints: unicidade de tenant + ator + operação + requestKey; mesma chave com payload diferente falha. Só o autor autorizado consulta/confirma sua prévia no MVP. Administrador não recebe o CSV bruto por herdar permissão genérica.

Após commit/cancelamento, remover stagedRows assim que não forem necessárias à recuperação; em qualquer caso, expiram em até 24 horas. Metadados minimizados permanecem por 30 dias. Implementar rotina idempotente de limpeza, acionável por agendador da infraestrutura, e testar sua execução; TTL no código de leitura não remove dados do banco.

Se o commit falhar, contatos/eventos/auditoria de sucesso não persistem; a prévia pode continuar utilizável dentro do prazo. Não registrar estado committed fora da transação.

Cancelar antes da confirmação encerra a prévia. Fechar a tela ou abortar a conexão durante o commit não prova cancelamento: ao retornar, consultar o resultado.

### 7.7 Segurança de CSV

- Rejeitar arquivo acima dos limites, encoding inválido, cabeçalho duplicado/ambíguo e linhas/células excessivas.
- Não aceitar planilha XLSX, ZIP ou binário disfarçado como CSV neste endpoint.
- Texto de célula não é HTML, fórmula executável, template ou comando.
- Não remover indiscriminadamente “+” de telefones ou “-” de números válidos.
- Proteger qualquer CSV de saída, inclusive relatório de erros, contra interpretação de fórmulas. Aspas simples de CSV não bastam; tratar delimitadores, aspas, controles e prefixos perigosos na serialização.
- Preferir relatório de erros JSON no primeiro recorte; exportação CSV posterior precisa de testes nos leitores suportados.
- A segurança após uma pessoa editar e salvar novamente em outra planilha tem limites: não prometer neutralização permanente de conteúdo.
- Nenhum conteúdo do arquivo em log, analytics, traces ou fila.

A ameaça de CSV injection aparece quando uma planilha interpreta células como fórmulas; o parser de importação não deve executá-las, e a proteção de saída precisa ser específica. [OWASP — CSV injection](https://community.owasp.org/attacks/CSV_Injection).

### 7.8 Rotas e contratos

Prefixo desta tabela: /api/v1/tenants/:tenantId.

| Método e rota | Entrada/resultado essencial |
| --- | --- |
| GET /crm/contacts | Busca, filtros allowlisted, sort, cursor; retorna data e nextCursor. |
| POST /crm/contacts | CreateContact; 201 com DTO autorizado e version. |
| GET /crm/contacts/:contactId | Detalhe e campos autorizados; 404 fora do escopo. |
| PATCH /crm/contacts/:contactId | UpdateContact + expectedVersion; sem atribuição por campos soltos. |
| DELETE /crm/contacts/:contactId | Arquivamento lógico documentado; UI chama a ação de “Arquivar”. |
| POST /crm/contacts/:contactId/restore | Restauração autorizada, com versão e validação de dependências. |
| GET /crm/fields | Definições permitidas para uso; gestão exige permissão adicional. |
| POST /crm/fields | Criar definição tipada. |
| PATCH /crm/fields/:fieldId | Editar metadados permitidos com versão. |
| POST /crm/fields/:fieldId/archive | Arquivar após conferir dependências. |
| POST /crm/contact-imports/preview | CSV limitado + mapeamento; retorna batch e resumo paginado. |
| GET /crm/contact-imports/:batchId | Estado e resultado autorizado. |
| GET /crm/contact-imports/:batchId/rows | Prévia/erros paginados do autor; não retornar 500 linhas sem necessidade. |
| POST /crm/contact-imports/:batchId/commit | Confirma seleção e grava de forma síncrona/idempotente. |
| POST /crm/contact-imports/:batchId/cancel | Descarta prévia ainda não confirmada. |

Arquivar exige contacts.delete e leitura do recurso. Restaurar exige contacts.delete + contacts.update; não pressupor que permissão de editar permite recuperar registro excluído. Antes de arquivar contato com negócio aberto ou conversa aberta, retornar dependências e exigir tratamento explícito; não arquivar em cascata silenciosamente.

Exportação de base completa, fusão de contatos e expurgo definitivo são expansões. O botão de exportar da prévia existente não deve parecer operacional sem uma entrega real.

### 7.9 Passos de implementação e arquivos

**CRM-001.A — contratos e persistência**

- [ ] Criar arquivos temáticos em packages/contracts/src/crm para contatos, campos, importação e filtros; exportar pelo ponto público existente.
- [ ] Criar migration de Contact/CustomField/ContactImportBatch, índices, FKs compostas e RLS.
- [ ] Preparar campos comuns de autoria/atribuição; não duplicar entidades de equipe.
- [ ] Preparar persistência mínima de outbox reutilizável conforme seção 14.
- [ ] Definir DTOs de lista e detalhe, com projeção mínima e serialização explícita.

**CRM-001.B — serviço e API**

- [ ] Criar contact.service.ts, custom-field.service.ts e contact-import.service.ts em application.
- [ ] Criar validadores de campo, normalização e duplicidade assistida em domain.
- [ ] Criar repositórios que recebam cliente transacional/contexto; proibir Prisma global dentro da transação.
- [ ] Criar controllers separados por responsabilidade em presentation e registrá-los no bootstrap.
- [ ] Implementar CRUD com auth, escopo, versão, erros e auditoria.
- [ ] Demonstrar criar/consultar contato real pela API antes de compor toda a interface.

**CRM-001.C — experiência**

- [ ] Criar /contacts como rota canônica e /contacts/:id para detalhe.
- [ ] Redirecionar /users para /contacts, preservando apenas parâmetros seguros; atualizar navegação desktop/mobile.
- [ ] Manter /crm para negócios, evitando duas telas canônicas de contatos.
- [ ] Criar /settings/crm/fields.
- [ ] Compor DataTable, formulário, seção de campos e wizard de importação em features/crm.
- [ ] Actions chamam API; loaders fazem leituras; erro não apaga formulário.
- [ ] Implementar leitura sem edição, rótulos, mensagens de conflito e estados reais.

**CRM-001.D — importação e fechamento**

- [ ] Implementar prévia/commit/expiração/idempotência.
- [ ] Testar limites reais no proxy, Next e Fastify.
- [ ] Implementar purga dos dados temporários.
- [ ] Executar os casos abaixo e registrar latência/memória sem PII.
- [ ] Remover mocks da rota entregue; atualizar documentação e taskboard.

### 7.10 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C1-01 | Criar, consultar, editar, arquivar e restaurar respeita permissões e dependências. |
| C1-02 | UUID de outro tenant ou contato fora do escopo não retorna dados nem aceita mutação. |
| C1-03 | Campo de outro tenant, chave desconhecida, tipo inválido ou opção arquivada é rejeitado. |
| C1-04 | PATCH preserva campos não alterados; false, zero e ausência não são confundidos. |
| C1-05 | Atualização concorrente com versão antiga falha sem sobrescrever a alteração anterior. |
| C1-06 | CSV trata BOM, separador, aspas, quebra interna, cabeçalho inválido e formatos ambíguos. |
| C1-07 | Limites de linhas/bytes/colunas e quotas são aplicados no servidor. |
| C1-08 | Prévia expirada, de outro membro ou adulterada não pode ser confirmada. |
| C1-09 | Confirmação repetida/rede perdida não duplica lote; payload diferente com a mesma chave falha. |
| C1-10 | Falha na última linha reverte todo o lote selecionado, seus eventos e auditoria de sucesso. |
| C1-11 | Perda de permissão, setor ou campo entre prévia e commit impede gravação indevida. |
| C1-12 | Criação/importação de Contact não cria User/Membership, não envia convite e não registra opt-in. |
| C1-13 | Dados temporários expiram e são fisicamente removidos pela rotina de limpeza testada. |
| C1-14 | Tabela/formulário/wizard funcionam no teclado, nos dois temas e em mobile. |

## 8. CRM-002 — tags e segmentos

### 8.1 Resultado esperado

Organizar contatos por etiquetas e salvar filtros dinâmicos reutilizáveis. Um segmento contém uma definição de seleção, não uma cópia estática dos contatos, e não concede acesso adicional a quem o abre.

### 8.2 Dados

| Entidade | Campos principais e invariantes |
| --- | --- |
| Tag | id, tenantId, name, nameNormalized, colorToken, status, version, autoria e timestamps. Nome ativo único por tenant; definir comportamento de restauração de conflito. |
| ContactTag | tenantId, contactId, tagId, createdByMembershipId, createdAt; vínculo único e FKs compostas para contato/tag. |
| Segment | id, tenantId, name, description, filterAst, schemaVersion, version, visibility, ownerMembershipId, status e timestamps. |
| Entitlement de CRM | Capacidade de tags, segmentos e tamanho do filtro resolvida no servidor, sem preço inventado. |

Visibilidade inicial do segmento: private ou tenant. Compartilhar com tenant torna a definição disponível a quem pode ler segmentos; o conjunto de contatos continua filtrado para cada pessoa. Um editor de segmento não ganha acesso aos contatos que não podia consultar.

Valores de filtros podem conter dados pessoais. Autorizar a leitura da definição, evitar filtros sensíveis em URL/log e não publicar nomes de segmentos que exponham informação fora do escopo.

### 8.3 Contrato do filtro

Reutilizar um AST de filtros tipado em contacts e segments:

~~~json
{
  "version": 1,
  "operator": "and",
  "conditions": [
    { "field": "status", "operator": "eq", "value": "active" },
    { "field": "tagId", "operator": "in", "value": ["UUID_DA_TAG"] },
    { "field": "custom.numero_unidades", "operator": "gte", "value": 5 }
  ]
}
~~~

Este é exemplo de forma, não um payload executável com UUID válido.

- Operadores por tipo: igualdade/diferença, lista, faixa, contém/prefixo de texto quando implementados, ausência/presença.
- Limitar profundidade, condições e quantidade de valores.
- Campos e operadores devem estar em allowlist; converter para query parametrizada.
- Nunca aceitar Prisma where/orderBy, SQL, regex livre, função ou JSONPath do cliente.
- Ordenação somente por campos suportados e com desempate estável por id.
- Não carregar todos os contatos no Node para filtrar.
- “Vazio”, false e zero têm significados distintos; definir a semântica de negação para campos ausentes.
- Semântica inicial: is_empty cobre chave ausente, texto vazio ou array vazio; false e zero não são vazios. eq/ne/in/not_in e comparações de faixa exigem valor presente e do tipo esperado. Para incluir ausência numa negação, o filtro deve acrescentar is_empty explicitamente. Reutilizar essa regra em prévia, consulta e contagem.
- Datas relativas, se habilitadas, resolvem no fuso do tenant e usam o mesmo instante de referência na consulta.
- Se campo/tag for arquivado, não descartar a condição e ampliar o segmento. Marcar definição inválida e exigir correção.
- Valores de selects usam ID, não label traduzido.

### 8.4 Backend e API

Prefixo /api/v1/tenants/:tenantId:

- GET/POST /crm/tags; PATCH /crm/tags/:tagId; POST /crm/tags/:tagId/archive.
- PUT/DELETE /crm/contacts/:contactId/tags/:tagId, idempotentes.
- POST /crm/contact-tag-batches para seleção explícita e limitada, com chave de idempotência.
- GET/POST /crm/segments; GET/PATCH /crm/segments/:segmentId; POST archive.
- GET /crm/segments/:segmentId/contacts, paginado e sujeito ao escopo atual.
- POST /crm/segments/preview para filtros complexos/privados, evitando dados pessoais na URL.

Gerenciar Tag e atribuí-la a Contact são autorizações diferentes. Operação em massa exige acesso a todos os IDs selecionados e informa o escopo do lote. No MVP, usar IDs explícitos de até 100 registros e transação atômica; “todos os resultados” exige snapshot próprio e fica para expansão.

A reavaliação inicial dos segmentos acontece na consulta. Cache de contagem é opcional, por tenant/filtro/revisão e escopo; não cachear uma contagem global como se fosse igual para todos.

### 8.5 Passos

- [ ] **CRM-002.A:** modelar Tag/ContactTag/Segment; criar constraints/RLS e contratos.
- [ ] **CRM-002.B:** criar compilador de filtros compartilhado com contatos; testar tipos, limites e ausência.
- [ ] **CRM-002.C:** implementar serviços de gestão e associação; limites e consumo concorrente de quota.
- [ ] **CRM-002.D:** compor editor de tags, seleção em contatos e construtor de segmentos por condições.
- [ ] **CRM-002.E:** exibir prévia real, contador autorizado, salvar/editar/arquivar e explicar definição inválida.
- [ ] **CRM-002.F:** verificar paginação, desempenho e isolamento; registrar evidência.

Na interface, cor vem de tokens permitidos e acompanha label. O construtor de filtros mostra frases compreensíveis, validação junto à condição e diferença entre filtro temporário e segmento salvo. Alterar filtro limpa cursor e preserva o rascunho da definição.

### 8.6 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C2-01 | Tag/contact de tenants diferentes não podem ser associados, inclusive por escrita concorrente. |
| C2-02 | Repetir associação/remoção não duplica relação nem gera contagem incorreta. |
| C2-03 | Segmento se atualiza quando dados/tags mudam; resultados respeitam o usuário que consulta. |
| C2-04 | Filtro inválido, profundo demais, SQL/operador desconhecido ou campo alheio é rejeitado. |
| C2-05 | Arquivamento de campo/tag não amplia silenciosamente resultados. |
| C2-06 | Limite de plano não pode ser ultrapassado por duas criações simultâneas. |
| C2-07 | Lote com recurso não autorizado falha de modo atômico e seguro. |
| C2-08 | Prévia, lista e contagem mantêm a mesma semântica de filtro e de acesso. |

## 9. CRM-003 — pipelines, etapas e negócios

### 9.1 Resultado esperado

Configurar funis comerciais e mover oportunidades entre etapas com regras, histórico e proteção contra concorrência. Um contato pode ter vários negócios em um ou mais pipelines.

### 9.2 Dados

| Entidade | Campos principais |
| --- | --- |
| Pipeline | id, tenantId, name, nameNormalized, description, status, defaultCurrency, version, autoria e timestamps. |
| PipelineStage | id, tenantId, pipelineId, name, position, colorToken, category, requiredFieldRules, version, archivedAt. |
| Deal | id, tenantId, contactId, pipelineId, stageId, title, amount, currency, expectedCloseDate, closedAt, lostReason, departmentId, routingRoleId, assignedMembershipId, createdByMembershipId, updatedByMembershipId, version, archivedAt e timestamps. |
| DealStageHistory | id, tenantId, dealId, fromStageId, toStageId, actorMembershipId, reason, occurredAt e sequência/version do negócio. |

- category da etapa: open, won ou lost. Fechamento comercial vem dessa categoria, não do nome “Ganho”.
- Valor monetário: PostgreSQL numeric/Prisma Decimal e string decimal no DTO; não float JavaScript para cálculo.
- Moeda: código validado; moeda padrão inicial pode ser BRL, explicitamente configurada e exibida.
- Não somar valores de moedas diferentes num único total. Agrupar por moeda; conversão fica fora do MVP.
- Um negócio tem uma etapa atual pertencente ao seu pipeline; FK composta verifica tenant/pipeline/stage.
- Não guardar pipeline/etapa em customFields do contato.
- Histórico registra a transição real uma única vez, junto à versão e auditoria.
- Contato vinculado deve ser ativo e autorizado na criação; vínculo posterior não pode ser usado para revelar contato fora do escopo.

### 9.3 Regras de pipeline e etapa

1. Pipeline ativo precisa de ao menos uma etapa open.
2. Criar um modelo inicial somente por ação real de configuração; não simular pipeline com constantes na UI.
3. Ordem é determinística. Reordenar recebe o conjunto exato de etapas afetadas e expectedVersion do pipeline.
4. Validar ausência de IDs duplicados/estranhos antes de aplicar a ordem.
5. Reordenação ocorre em transação/lock do pipeline; tratar índices únicos de posição sem conflito intermediário.
6. Não permitir remover/arquivar etapa com negócios ativos sem transferência explícita a destino válido.
7. Regras iniciais são declarativas e limitadas: exigir campos do negócio ou campos do contato antes da entrada.
8. Não incluir scripts, automações, webhooks de transição ou fórmulas executáveis neste card.
9. Mudança de regra afeta novas transições; não mover negócios existentes automaticamente.
10. Pipeline arquivado preserva histórico; não aceitar novos negócios/movimentos comuns nele.
11. Se excluir uma regra/etapa invalidar referência de outro recurso, retornar dependência com informação autorizada.
12. Depois de receber negócio, a categoria open/won/lost da etapa é imutável neste recorte. Criar outra etapa e transferir por comando válido; editar o nome/cor não pode fechar ou reabrir negócios em massa.

### 9.4 Movimento do negócio

Entrada: dealId, destinationStageId, expectedVersion, reason quando exigido e chave de idempotência.

Sequência no serviço:

1. Validar contexto atual e crm.deals.move no negócio de origem.
2. Carregar negócio e etapa de destino autorizados no mesmo tenant.
3. Confirmar pipeline, estado ativo, regra de transição e campos obrigatórios.
4. Aplicar condição de versão/lock.
5. Atualizar stageId, campos de fechamento coerentes e versão.
6. Gravar DealStageHistory, AuditLog e outbox na mesma transação.
7. Retornar novo DTO/versão.
8. Em conflito, retornar CONFLICT para atualização e revisão, preservando dados digitados.

Mover de uma etapa para outra não altera o setor/responsável automaticamente. Transferir de pipeline é comando separado: validar pipeline/etapa de destino e regras sem bypass. Fechar/reabrir negócio atualiza closedAt coerentemente e exige motivo conforme a operação.

O MVP pode ordenar cards dentro da etapa por updatedAt/id; reordenar etapas é obrigatório, arranjo manual de cada card é expansão. Não mostrar drag para ordenação manual se ela não persiste.

### 9.5 API

Prefixo /api/v1/tenants/:tenantId:

| Rotas | Responsabilidade |
| --- | --- |
| GET/POST /crm/pipelines | Listar/criar pipeline autorizado. |
| GET/PATCH /crm/pipelines/:pipelineId | Detalhe e configuração. |
| POST /crm/pipelines/:pipelineId/archive | Arquivamento com dependências. |
| POST /crm/pipelines/:pipelineId/stages | Nova etapa. |
| PATCH /crm/pipelines/:pipelineId/stages/:stageId | Configuração e regras. |
| PUT /crm/pipelines/:pipelineId/stage-order | Reordenação transacional com versão. |
| POST /crm/pipelines/:pipelineId/stages/:stageId/archive | Arquivar ou exigir transferência prévia. |
| GET/POST /crm/deals | Listar/criar negócio. |
| GET/PATCH /crm/deals/:dealId | Detalhar/editar propriedades permitidas. |
| POST /crm/deals/:dealId/move | Transição de etapa. |
| POST /crm/deals/:dealId/transfer-pipeline | Transferência validada. |
| POST /crm/deals/:dealId/archive | Arquivar oportunidade, sem apagar histórico. |
| GET /crm/deals/:dealId/history | Histórico autorizado e paginado. |

Regras e configurações de funil exigem crm.pipelines.manage. Operar negócio exige ações de crm.deals; gerenciar o funil não concede acesso irrestrito a seus contatos.

### 9.6 Passos e arquivos

- [ ] **CRM-003.A:** criar contratos pipeline/stage/deal/move e schemas de regras limitadas.
- [ ] **CRM-003.B:** adicionar modelos e SQL de integridade, índices por tenant/pipeline/stage e RLS.
- [ ] **CRM-003.C:** criar serviços separados de configuração e operação de negócios.
- [ ] **CRM-003.D:** implementar concorrência, transições, histórico, auditoria/outbox.
- [ ] **CRM-003.E:** criar /settings/crm/pipelines e formulário/detalhe de negócio em features/crm.
- [ ] **CRM-003.F:** conectar criação/edição simples; deixar visualizações avançadas para CRM-004.
- [ ] **CRM-003.G:** testar regras, moedas, remoções e corridas; registrar evidência.

### 9.7 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C3-01 | Etapa de outro pipeline/tenant não pode ser atribuída ao negócio, mesmo por FK trocada. |
| C3-02 | Dois movimentos concorrentes não sobrescrevem a versão nem geram histórico incompatível. |
| C3-03 | Repetição da mesma transição idempotente não duplica histórico/evento. |
| C3-04 | Etapa com negócios não desaparece sem transferência explícita válida. |
| C3-05 | Regra de campo obrigatório é aplicada por API direta e pela UI. |
| C3-06 | Valor preserva precisão; totais não misturam moedas. |
| C3-07 | Ler o pipeline/negócio não vaza dados não autorizados do contato. |
| C3-08 | Renomear etapa não altera sua semântica open/won/lost nem o histórico. |
| C3-09 | Reordenar etapas mantém conjunto e ordem corretos sob concorrência. |
| C3-10 | Transferência de pipeline não contorna regras de entrada nem autorização. |

## 10. CRM-004 — cards, lista e integração com inbox

### 10.1 Resultado esperado

Alternar entre quadro e lista sobre os mesmos negócios e filtros, abrir detalhe sem perder contexto e acessar as conversas relacionadas quando CRM-005 estiver disponível.

**CRM-004.A:** cards/lista após CRM-003.  
**CRM-004.B:** contexto de inbox após CRM-005. O card integral não fica DONE somente com a primeira fatia.

### 10.2 Regras de consulta e estado

- Um contrato canônico de filtro/sort alimenta todas as visualizações.
- Tenant, usuário, revisão de acesso, pipeline e filtro participam da chave de consulta.
- Cada coluna do quadro tem paginação própria. Nunca carregar todos os negócios de todos os pipelines.
- Contadores são calculados com o mesmo escopo dos cards; não representar “carregados” como “total”.
- Usar paginação determinística com desempate; documentar que mudanças concorrentes podem exigir revalidação.
- Alterar filtro invalida cursores e seleção incompatível.
- Busca pessoal não vai a analytics nem a logs de URL; filtros sensíveis podem usar POST de busca.
- DTO de card traz somente campos visíveis; detalhes de contato exigem autorização adicional.
- Atualização de dados não fecha editor nem sobrescreve seu rascunho.
- Preferências persistidas incluem tenant e membership e contêm apenas configuração da visualização; nada de contatos ou mensagens em localStorage.

### 10.3 Interações e acessibilidade

- Alternar quadro/lista preserva pipeline, filtros e registro selecionado.
- Mover etapa por menu/dialog é obrigatório. Drag-and-drop é uma alternativa adicional.
- O menu informa etapa atual, destinos permitidos e motivo de bloqueio.
- Movimento otimista só com rollback previsível; conflito restaura o estado confirmado e explica o que mudou.
- Mobile prioriza lista/cards e ação “Mover etapa”; não comprimir um quadro enorme em 360 px.
- Foco retorna ao card/botão correto; anúncio de movimento é curto e não depende de cor.
- Voltar de negócio/conversa preserva lista, filtros e scroll quando viável.
- Estados: nenhum pipeline, nenhum negócio, filtro sem resultados, acesso negado, erro de coluna, carregamento incremental e atualização pendente.

### 10.4 Integração com inbox

Após CRM-005:

1. Mostrar conversas autorizadas do contato/negócio no detalhe.
2. Abrir /inbox com identificador autorizado, sem mensagem ou e-mail na URL.
3. Voltar ao negócio sem perder o formulário.
4. Exigir as permissões da conversa e do contato; não retornar conteúdo de conversa na listagem de negócios por conveniência.
5. Mostrar indisponibilidade contextual quando não existir conversa. Não fabricar histórico nem simular mensagem enviada.

O inbox completo pertence à feature inbox. CRM-004 compõe links/contexto e visualizações, sem duplicar um segundo módulo de mensagens.

### 10.5 Passos

- [ ] **CRM-004.A1:** criar queries de quadro, lista e contagem com mesmo filtro/escopo.
- [ ] **CRM-004.A2:** substituir mocks da rota /crm por loader e componentes de features/crm.
- [ ] **CRM-004.A3:** implementar paginação por coluna, seleção, detalhe e menu de movimento.
- [ ] **CRM-004.A4:** implementar composição mobile, teclado e estados de conflito.
- [ ] **CRM-004.B1:** integrar conversas relacionadas após CRM-005.
- [ ] **CRM-004.B2:** testar navegação de ida/volta, cache, permissões e troca de tenant.
- [ ] Atualizar o card somente quando ambas as fatias e seus testes estiverem completos.

### 10.6 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C4-01 | Quadro e lista mostram o mesmo conjunto autorizado para o mesmo filtro. |
| C4-02 | Contadores não vazam negócios ocultos e não confundem total com página carregada. |
| C4-03 | Toda movimentação pode ser feita com teclado e sem drag. |
| C4-04 | Erro/conflito reverte otimismo sem apagar rascunho. |
| C4-05 | Mobile permite consultar, abrir, voltar e mover sem depender de hover. |
| C4-06 | Troca de tenant limpa dados/seleções da empresa anterior. |
| C4-07 | Link para inbox não contorna autorização da conversa. |
| C4-08 | Queries e bundle mantêm limites; não há carregamento integral oculto da base. |



## 11. CRM-005 — conversas, histórico e notas internas

### 11.1 Recorte de produto e fronteira

Este card cria o núcleo do atendimento em 06-inbox: conversas relacionadas a contatos, histórico paginado, notas internas e controle de leitura da equipe.

**Não confundir três produtos:**

| Produto | Entrega neste card |
| --- | --- |
| Conversa de atendimento de um cliente | Estrutura e interface reais, com contexto de contato. |
| Nota interna dentro desse atendimento | Criação e leitura reais para membros autorizados. |
| Chat social entre membros/setores/cargos | Domínio futuro separado; não é modelado como conversa de cliente. |

O envio/recebimento por WhatsApp, Instagram ou e-mail depende dos cards MSG e dos adaptadores. Não exibir “enviado”, “entregue” ou “lido pelo cliente” para uma nota salva apenas no banco.

Na ausência de canal conectado, a conversa pode ser um atendimento interno vinculado a um contato, com capacidade explícita de registrar notas. O botão de responder ao cliente só aparece habilitado quando integração, entitlement e política do canal estiverem operacionais.

### 11.2 Dados

| Entidade | Campos e regras |
| --- | --- |
| Conversation | id, tenantId, contactId, subject, source, channelReference opcional, status, departmentId, routingRoleId, assignedMembershipId, createdByMembershipId, version, lastActivityAt, closedAt e timestamps. |
| Message | id, tenantId, conversationId, sequence, kind, direction, authorMembershipId opcional, externalSenderReference opcional, text, state, clientMessageId, createdAt. |
| ConversationReadState | tenantId, conversationId, membershipId, lastReadSequence, updatedAt; combinação única e FKs compostas. |
| ConversationStatusHistory | tenantId, conversationId, fromStatus, toStatus, actorMembershipId, reason, occurredAt. |

Contratos iniciais:

- Conversation.status: open, pending ou closed.
- source: internal_crm inicialmente; outros canais entram por adaptador registrado.
- Message.kind: internal_note habilitado. customer_message é reservado à integração futura.
- Message.direction: internal para nota; inbound/outbound são direções futuras de mensagem externa.
- Message.state: saved para nota. Persistência local não gera sent/delivered/read.
- Texto simples no MVP, com escaping. Rich text exige schema e sanitização próprios.
- Notas são append-only neste recorte. Correção acontece por nova nota; redaction/expurgo privilegiado segue governança, sem apagar silenciosamente auditoria.
- clientMessageId único por tenant + conversa + autor; repetição com texto diferente gera conflito.
- sequence é crescente por conversa, gerada sob lock/ordem transacional. BigInt cru não atravessa JSON: serializar como string decimal.
- Toda FK preserva tenant; contato/conversa/autor de outra empresa são rejeitados.

### 11.3 Visibilidade e histórico

1. A pessoa precisa de inbox.conversations.read e acesso ao recurso, além do contato associado conforme a seção 5.
2. Notas internas são visíveis aos membros atualmente autorizados daquela conversa.
3. Novo responsável autorizado pode consultar o histórico de atendimento retido; esta é uma decisão do histórico de negócio, diferente da futura política de chat privado da equipe.
4. Retirar atribuição remove o acesso ASSIGNED, mas preserva acesso por outra concessão válida.
5. Redigir uma nota exige inbox.notes.create e leitura da conversa.
6. Criar nota não altera o estado da conversa automaticamente. Conversa fechada precisa ser reaberta por operação autorizada antes de nova nota no MVP.
7. Contagens de não lidas são por Membership; não representam confirmação do cliente.
8. lastReadSequence só avança, nunca pode marcar como lida uma sequência além da existente/autorizada.
9. Busca no histórico e preview da última mensagem usam o mesmo escopo; não incluir conteúdo completo no evento realtime.
10. Anexos ficam desabilitados até existir pipeline privado de upload/scan/download autorizado. Não guardar arquivos em public.

### 11.4 API e serviços

Prefixo /api/v1/tenants/:tenantId:

| Método e rota | Contrato |
| --- | --- |
| GET /inbox/conversations | Filtros por status, setor/responsável permitido e contato autorizado; cursor. |
| POST /inbox/conversations | Cria atendimento ligado a contato existente autorizado. |
| GET /inbox/conversations/:conversationId | Contexto mínimo autorizado. |
| PATCH /inbox/conversations/:conversationId | Propriedades comuns e expectedVersion; sem atribuição solta. |
| POST /inbox/conversations/:conversationId/status | Transição open/pending/closed com versão e motivo quando exigido. |
| GET /inbox/conversations/:conversationId/messages | beforeSequence ou afterSequence, mutuamente exclusivos, com limite. |
| POST /inbox/conversations/:conversationId/notes | Texto, clientMessageId e versão/condições da conversa. |
| PUT /inbox/conversations/:conversationId/read-state | Avança marcador do próprio vínculo autenticado. |

Criar conversation.service.ts, message.service.ts e repositórios específicos em 06-inbox. Contact é acessado por uma interface pública interna de 05-crm que preserva autorização; não criar dependência circular entre os domínios.

Salvar nota, atualizar lastActivityAt, consumir sequência, registrar auditoria e inserir evento na outbox são uma unidade transacional. Histórico paginado não depende de WebSocket para funcionar.

### 11.5 UX além da composição visual

**Desktop:** lista de atendimentos; conversa; contexto do contato. Carregamento e erro são locais a cada painel.

**Mobile:** lista → conversa → contexto, com retorno claro. Teclado não encobre compositor e ação de envio.

- Composer identifica permanentemente “Nota interna — visível à equipe autorizada”.
- Nenhum toggle pouco claro pode converter a nota em resposta ao cliente.
- Em erro de rede, texto permanece e a mesma chave de envio permite consultar/repetir com segurança.
- Se a pessoa estiver lendo mensagens antigas, nova nota não força scroll; mostrar aviso “Novas mensagens”.
- Rascunho permanece durante navegação entre painéis na memória da feature, separado por tenant/membership/conversa.
- Não persistir texto em localStorage ou cache público. Persistência entre sessões exige política e entrega próprias.
- Perda de permissão bloqueia novas ações e limpa dados locais após comunicar o contexto, sem reexpor o conteúdo em toast.
- Estado de lista vazia é diferente de canal desconectado ou acesso negado.
- Até CRM-007, usar revalidação após mutações e polling controlado apenas na conversa/lista ativa, com pausa em aba oculta e backoff.
- Notificações de sistema operacional, áudio, presença e typing não são critérios deste núcleo.

### 11.6 Passos

- [ ] **CRM-005.A:** definir contratos de conversa/nota/status/histórico e políticas de retenção.
- [ ] **CRM-005.B:** criar tabelas, índices, sequência transacional, FKs, RLS e idempotência.
- [ ] **CRM-005.C:** implementar serviços e API, incluindo acesso ao contato e histórico paginado.
- [ ] **CRM-005.D:** persistir auditoria/outbox na transação; não emitir evento antes do commit.
- [ ] **CRM-005.E:** substituir mocks de /inbox e compor experiência desktop/mobile.
- [ ] **CRM-005.F:** validar rascunho, retry, fechamento/reabertura e marcadores de leitura.
- [ ] **CRM-005.G:** registrar evidência; habilitar a fatia de integração CRM-004.B.
- [ ] Manter canais externos e chat da equipe em suas entregas próprias.

### 11.7 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C5-01 | Conversa/contact de outro tenant ou fora do escopo não abre nem aceita nota. |
| C5-02 | Nota interna nunca aciona provider, webhook de envio externo ou confirmação de entrega ao cliente. |
| C5-03 | Retry da mesma nota não duplica; mesma chave com conteúdo diferente falha. |
| C5-04 | Histórico before/afterSequence funciona sem perda ou repetição indevida sob concorrência. |
| C5-05 | Não lidas são por membership e não retrocedem com requests fora de ordem. |
| C5-06 | Texto potencialmente malicioso é exibido como dado, sem HTML executável. |
| C5-07 | Mudar responsável/permissão altera acesso ao histórico conforme as concessões atuais. |
| C5-08 | Mobile preserva retorno e rascunho; novas mensagens não interrompem leitura antiga. |
| C5-09 | Falha transacional não deixa nota, contador ou evento fantasma. |
| C5-10 | Estados de fechamento/reabertura e ausência de canal são verdadeiros e compreensíveis. |

## 12. CRM-006 — atribuição a setor, cargo e membro

### 12.1 Resultado esperado e dependências

Encaminhar contatos, negócios e atendimentos a uma fila ou responsável válido, com transação, histórico, revogação do acesso derivado e notificação real.

A implementação completa acontece após CRM-007 para cumprir o aceite “autorização e notificação em tempo real”. Os contratos/colunas básicos já foram preparados nos recursos anteriores.

TEAM-003 precisa entregar ou comprovar o ciclo de membros necessário: suspensão, reativação, saída de setor e proteção do proprietário. Um campo active isolado não comprova esse ciclo.

### 12.2 Significado dos três campos

| Campo | Função |
| --- | --- |
| departmentId | Setor responsável pelo recurso; participa do escopo DEPARTMENT. |
| routingRoleId | Cargo elegível para atender uma fila; não cria permissão. |
| assignedMembershipId | Responsável individual; participa do escopo ASSIGNED. |

Estados válidos incluem: sem atribuição; somente setor; setor + cargo; somente membro quando a regra do recurso permitir; setor + membro; setor + cargo + membro elegível.

Cargo de roteamento controla elegibilidade para assumir trabalho, não confidencialidade adicional: uma pessoa com read DEPARTMENT pode continuar vendo o recurso daquele setor mesmo sem o cargo da fila. Caso o produto precise de fila sigilosa por cargo, será necessário um predicado de visibilidade específico; não inferi-lo apenas de routingRoleId.

Regras:

1. Todas as referências são do mesmo tenant.
2. Setor, cargo e vínculo devem estar ativos no momento do commit.
3. Cargo departamental exige o mesmo departmentId.
4. Cargo global pode ser usado numa fila de setor, desde que a elegibilidade da pessoa seja verificada para setor e cargo.
5. Quando houver setor + membro, a pessoa deve pertencer ativamente ao setor.
6. Quando houver cargo + membro, a pessoa deve possuir atribuição válida desse cargo; nome do cargo não é prova.
7. Destinatário precisa ter permissão aplicável de leitura/operação, considerando o estado projetado após receber a atribuição.
8. O criador do registro não muda durante transferência.
9. Cargo/setor não recebe login próprio; notificações vão para memberships humanas elegíveis.
10. Retirar o último responsável não torna o recurso público.

### 12.3 Autorizar mudança sem escalada

Cada recurso usa sua ação específica: crm.contacts.assign, crm.deals.assign ou inbox.conversations.assign.

- Validar acesso ao recurso de origem e competência para encaminhar ao destino.
- Transferir entre departamentos exige alcance de assign para origem e destino.
- Escopos OWN/ASSIGNED, por si, não autorizam encaminhar a qualquer departamento. No MVP, permitem operações no contexto atual permitido; mudança de setor exige concessão apropriada TENANT/DEPARTMENT.
- A atribuição pode fazer uma permissão ASSIGNED já existente passar a alcançar o recurso. Esse efeito precisa fazer parte da autorização, auditoria e prévia da transferência.
- Não conceder cargo/permissão ao destinatário como efeito colateral de uma atribuição.
- Não deixar o ator trocar campos pelo PATCH geral para contornar assign.
- Validar alvo em transação e coordenar locks/revisões com suspensão/saída de setor.
- Não aceitar lista de “membros elegíveis” produzida pelo navegador como decisão final.

**Assumir da fila:** usar ação distinta de encaminhar a terceiros. Propor crm.contacts.claim, crm.deals.claim e inbox.conversations.claim no catálogo. claim só atribui ao próprio membership, exige elegibilidade na fila e recurso ainda disponível; nunca aceita targetMembershipId arbitrário.

O alcance de claim precisa cobrir a fila/recurso antes da atribuição, por TENANT, DEPARTMENT ou OWN aplicável. ASSIGNED não dá acesso a um item ainda sem responsável; não usar a própria atribuição projetada como justificativa circular para autorizar o claim.

Duas pessoas assumindo o mesmo recurso ao mesmo tempo: uma vence; a outra recebe conflito e estado atualizado. Não gravar dois responsáveis em uma coluna nem retornar sucesso às duas.

### 12.4 O que não se propaga automaticamente

Transferir contato não transfere seus negócios/conversas. Transferir conversa não altera responsável do contato. Transferir negócio não muda equipe do cliente inteiro.

Como o acesso às entidades relacionadas pode depender da leitura do contato, mudar o escopo do contato pode retirar acesso à composição de negócio/conversa. Invalidar e reautorizar também essas dependências, sem alterar sua atribuição silenciosamente.

Uma ação futura “Transferir contato e todos os atendimentos” precisa de prévia com conjunto, autorizações, limites e semântica transacional próprios.

### 12.5 Contratos e endpoints

Criar um schema compartilhado de AssignmentTarget com departmentId, routingRoleId, assignedMembershipId e intenção explícita de limpar/manter cada referência.

Comandos recebem expectedVersion, reason opcional/obrigatório conforme transferência e chave de idempotência.

Rotas propostas sob o recurso:

- GET .../:resourceId/assignment-candidates.
- PUT .../:resourceId/assignment.
- POST .../:resourceId/assignment/claim.
- POST .../:resourceId/assignment/release.

Os caminhos concretos são /crm/contacts, /crm/deals e /inbox/conversations. Não construir uma rota genérica que permita acessar qualquer tabela por resourceType recebido.

Ao mudar setor, a UI limpa o cargo/membro incompatível e pede nova escolha. No backend, referências incompatíveis são rejeitadas; não descartadas silenciosamente.

release exige regra explícita: o próprio responsável pode devolver à fila com claim aplicável, e gestores com assign podem retirar responsável. A operação não apaga o setor/cargo da fila sem intenção declarada.

### 12.6 Auditoria, eventos e notificação

Dentro da mesma transação:

1. Verificar versão e estado anterior.
2. Persistir nova atribuição.
3. Incrementar a versão do recurso.
4. Registrar origem/destino por IDs, ator e motivo minimizado.
5. Inserir evento versionado na outbox.
6. Inserir notificações persistentes deduplicadas para destinatários elegíveis. A notificação faz parte do aceite de CRM-006; não substituí-la por um toast que desaparece se a pessoa estiver offline.

Após commit, relay entrega o evento. O gateway revalida o destinatário atual antes de entregar qualquer conteúdo.

O novo responsável recebe aviso com informação mínima autorizada e acesso ao recurso. O anterior perde dados derivados da atribuição e recebe no máximo sinal de invalidação sem conteúdo novo. Outro cargo global válido pode manter seu acesso, conforme a regra cumulativa.

Notificação deduplicada por tenant + evento + destinatário. Se lida em várias abas, marcador consistente. Não tratar chegada de socket como prova de que a pessoa leu.

Modelo mínimo de Notification: id, tenantId, recipientMembershipId, eventId, kind, referência mínima de recurso, createdAt e readAt. FK composta para o destinatário, índice tenant/destinatário/leitura/data e unicidade tenant/evento/destinatário. A referência informativa do recurso não substitui sua autorização: leitura/detalhe/notificação revalidam acesso e não persistem cópia de nome, e-mail ou conteúdo de mensagem. Expor lista paginada e marcação de leitura apenas ao destinatário atual. Histórico de atribuição pode usar projeção autorizada do AuditLog do próprio recurso; não dar acesso ao log inteiro do tenant para mostrar essa linha do tempo.

### 12.7 Suspensão, reativação e saída

- Suspensão interrompe novas atribuições, pickups e acesso derivado.
- Referências históricas permanecem para auditoria. A UI marca responsável indisponível para quem pode ver a fila.
- Recursos não são encaminhados a pessoa aleatória.
- Gestor autorizado recebe uma fila de pendências para reatribuir.
- Reativação não restaura cargos departamentais revogados nem assinaturas antigas automaticamente.
- Saída de setor remove elegibilidade à fila daquele setor; permissões globais válidas permanecem.
- Um setor com trabalho ativo não pode ser apagado por cascade. Arquivar exige resolver/transferir dependências de forma explícita.
- Definir e testar a ordem das transações concorrentes de suspensão e atribuição.

### 12.8 Passos

- [ ] **CRM-006.A:** completar contratos de atribuição e catálogo assign/claim.
- [ ] **CRM-006.B:** implementar consultas mínimas de candidatos pela fronteira de 04-team.
- [ ] **CRM-006.C:** implementar comandos por domínio com validação de origem/destino.
- [ ] **CRM-006.D:** adicionar locks/versão/idempotência e histórico de atribuição.
- [ ] **CRM-006.E:** conectar seletores no contato, negócio e atendimento; compor fila e ação “Assumir”.
- [ ] **CRM-006.F:** integrar notificações/eventos via infraestrutura e gateway de CRM-007.
- [ ] **CRM-006.G:** exercitar suspensão, saída, reativação, concorrência e permissões cumulativas.
- [ ] Concluir o card só com notificação e revogação verificadas, além da gravação dos três campos.

### 12.9 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C6-01 | Setor/cargo/membro de outro tenant ou inativo nunca recebe atribuição. |
| C6-02 | Membro incompatível com setor/cargo não aparece como elegível nem passa na API direta. |
| C6-03 | Duas pessoas assumindo o mesmo item resultam em um único vencedor. |
| C6-04 | Transferência não permite ampliar acesso por PATCH, OWN ou ASSIGNED indevidamente. |
| C6-05 | Saída de setor elimina elegibilidade e concessões derivadas; cargo global válido permanece. |
| C6-06 | Suspensão concorrente com atribuição tem resultado ordenado e seguro. |
| C6-07 | Transferência persiste recurso, histórico, auditoria e evento atomicamente. |
| C6-08 | Destinatário recebe uma notificação efetiva e deduplicada após commit. |
| C6-09 | Responsável antigo deixa de receber conteúdo quando perdeu todas as concessões aplicáveis. |
| C6-10 | Alterar contato não move negócios/conversas silenciosamente e invalida composições cujo acesso mudou. |

## 13. CRM-007 — WebSocket, rooms e recuperação

### 13.1 Resultado esperado

Atualizar conversa, lista e contexto após mudanças reais, com conexão autenticada, inscrição autorizada, revogação durante a conexão e recuperação quando eventos forem perdidos.

O primeiro protocolo usa WebSocket para assinaturas/avisos. As mutações de negócio continuam na API HTTP, evitando dois caminhos de escrita.

### 13.2 Topologia e autenticação

Decisão recomendada: publicar **/ws na mesma origem do painel**, pelo proxy HTTPS, encaminhando o upgrade ao Fastify. Assim, o cookie host-only de tenant pode ser usado sem ampliar Domain para todos os subdomínios.

- Produção usa WSS.
- Proxy valida host/origem, encaminha somente o necessário e suporta upgrade/timeouts.
- Fastify autentica cookie de sessão real, surface, subject, expiração, revisão e estado atual.
- Origin deve estar em allowlist exata do painel; rejeitar origem ausente/inválida para esse fluxo de navegador.
- API_URL/origem configurada não deriva de Host arbitrário enviado pelo cliente.
- Não passar sessão, JWT ou ticket de longa duração na query string.
- Conexão fica vinculada a uma sessão, membership e tenant. Troca de tenant encerra a conexão anterior.
- Se a topologia exigir origem separada, definir antes um protocolo de ticket curto, de uso único e finalidade específica, transmitido em mensagem inicial protegida; não improvisar compartilhamento de cookies.

Autenticar a conexão não autoriza cada assinatura ou entrega. Validar origem, sessão e mensagens são controles distintos. [OWASP — segurança de WebSocket](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

### 13.3 Protocolo mínimo

| Comando/evento | Conteúdo mínimo |
| --- | --- |
| subscribe | requestId, resourceType permitido, resourceId ou descrição de lista allowlisted. |
| subscribed | subscriptionId gerado pelo servidor, recurso autorizado e revisão de referência. |
| unsubscribe | subscriptionId da própria conexão. |
| resource_changed | eventId, resourceType, resourceId autorizado, version e occurredAt. |
| access_changed | Invalidação de contexto, sem conteúdo do recurso perdido. |
| subscription_denied | Código seguro e requestId; sem informar tenant proprietário. |
| heartbeat/pong | Saúde da conexão, com limites. |

O cliente não envia nome bruto de room como tenant:qualquer_uuid. O servidor resolve a sala lógica depois de autorizar o recurso. Nomes de sala não são credenciais.

Para CRM-007, assinar mudanças dos recursos/escopos já criados em CRM-001/003/005. O contrato de atribuição existe; a interface completa de CRM-006 pode chegar depois sem exigir outra política de rooms.

### 13.4 Autorizar também a entrega

1. Handshake verifica identidade e contexto atual.
2. Subscribe verifica permissão da operação de leitura e escopo do recurso.
3. Notificação oriunda de outbox é candidata a entrega, não prova de que o destinatário ainda tem acesso.
4. Antes do envio, revalidar concessões/revisões e relação do recurso com contato/setor/responsável.
5. Se o contexto não puder ser validado, não enviar conteúdo.
6. Fanout usa lote/índices para reduzir consultas, mantendo a garantia de atualização das revisões; cache positivo antigo não é suficiente.
7. Mesmo evento minimalista pode revelar a existência de um ID. Não transmitir IDs de recursos não autorizados numa sala geral do tenant.
8. O cliente deduplica eventId, compara resourceVersion e reconsulta DTO autorizado.
9. A API reautoriza a leitura causada pelo evento; o socket não libera automaticamente o fetch.
10. Em logout, suspensão, saída de setor ou mudança de cargo, encerrar/remover assinaturas afetadas e limpar estado de interface.

Eventos de revogação aceleram o encerramento. A verificação de autoridade antes de novas entregas precisa impedir vazamento mesmo se o aviso de revogação se perder. Medir e documentar o tempo de encerramento operacional; não chamar um TTL longo de revogação imediata.

### 13.5 Reconexão e catch-up

A estratégia inicial recupera **estado e histórico do banco**, sem prometer replay integral de todos os eventos de transporte.

1. Reconectar com backoff exponencial, jitter e limite; pausar quando offline.
2. Autenticar e resolver contexto novamente.
3. Refazer apenas assinaturas ainda necessárias à tela e autorizadas.
4. Reconsultar listas/detalhes; cursores de páginas podem precisar ser reiniciados para nova consulta.
5. Para conversa, pedir mensagens depois da última sequence confirmada, com paginação.
6. Na abertura inicial, assinar e buscar snapshot/histórico de modo a cobrir a corrida entre consulta e assinatura; deduplicar o que chegou pelos dois caminhos.
7. Repetir catch-up até alcançar o limite de referência da consulta e depois revalidar se houve novas alterações.
8. Versionar recursos e ignorar notificações mais antigas que o estado já confirmado.
9. Se retenção removeu o intervalo, responder “resincronização necessária” e carregar estado/histórico ainda disponível.
10. Se o recurso deixou de ser autorizado, removê-lo do estado local; não reapresentar snapshot antigo.

Não usar timestamp ou ordem de chegada como garantia de ordem de negócio. IDs UUID de eventos também não são cursor monotônico. Mensagens usam sequence transacional por conversa; outras telas reconsultam o estado canônico.

### 13.6 Múltiplas instâncias e infraestrutura

- Registro local de conexões por instância; Redis distribui avisos entre instâncias quando necessário.
- Outbox/dedupe persistentes sustentam processamento; Pub/Sub não guarda todo evento perdido durante desconexão.
- Estado de conversa e histórico no PostgreSQL permitem recuperação.
- Consumidores tratam repetição e desordem por eventId/versão.
- Queda de Redis marca realtime como indisponível/degradado; HTTP autorizado continua utilizável quando suas próprias dependências estão saudáveis.
- Não cair para fanout global sem filtro como fallback.
- Heartbeat detecta conexões mortas e libera recursos.
- Limitar conexões por sessão/membership/tenant, inscrições por conexão, taxa e tamanho de mensagens.
- Configurar backpressure: cliente lento não pode criar buffer sem limite. Encerrar com código seguro e permitir resincronização.
- Não enviar bytes de anexos pelo socket neste recorte.
- Dados de presença/digitação têm contrato e retenção próprios; não implementá-los implicitamente como “online” global.

Orçamentos iniciais de ensaio, ajustáveis em configuração: 5 conexões por membership, 30 assinaturas por conexão, mensagens de controle até 16 KiB, handshake timeout de 10 s e heartbeat de 30 s. Testar ambiente/proxy antes de adotá-los como valores de produção.

### 13.7 Passos e arquivos

- [ ] **CRM-007.A:** registrar protocolo e topologia; conferir plugin/biblioteca compatível com Fastify instalado.
- [ ] **CRM-007.B:** adicionar schemas de controle/eventos e testes de contrato.
- [ ] **CRM-007.C:** implementar gateway/serviço de assinaturas em 06-inbox, com interfaces públicas para eventos de CRM.
- [ ] **CRM-007.D:** integrar auth compartilhada e revisão de acesso sem copiar lógica de autorização.
- [ ] **CRM-007.E:** conectar outbox/relay/broker e distribuição entre instâncias.
- [ ] **CRM-007.F:** criar conexão compartilhada da feature/workspace com lifecycle por tenant; evitar um socket por card.
- [ ] **CRM-007.G:** implementar dedupe, invalidação e catch-up paginado via HTTP.
- [ ] **CRM-007.H:** exercitar revogação, perda de eventos, reconexão, cliente lento e duas instâncias.
- [ ] **CRM-007.I:** documentar métricas, estado degradado e runbook.

### 13.8 Critérios de aceite

| ID | Cenário obrigatório |
| --- | --- |
| C7-01 | Cookie inválido/platform, sessão vencida/revogada ou origin indevida não abre conexão autorizada. |
| C7-02 | Inscrição em recurso de outro tenant ou fora do escopo é negada sem conteúdo. |
| C7-03 | Suspensão/remoção de cargo com socket aberto impede novas entregas indevidas. |
| C7-04 | Mudança de setor/responsável/contato relacionado reavalia autorização das assinaturas. |
| C7-05 | Evento repetido ou fora de ordem não duplica nota nem regride estado. |
| C7-06 | Desconexão durante nota/movimento recupera o estado por HTTP e histórico paginado. |
| C7-07 | Queda de Redis ou de uma instância não provoca vazamento nem perda permanente do estado de negócio. |
| C7-08 | Duas instâncias entregam avisos corretos e respeitam as mesmas revogações. |
| C7-09 | Tamanho/taxa/assinaturas e backpressure são limitados e observáveis. |
| C7-10 | Troca de tenant encerra conexão anterior e elimina seus dados/assinaturas. |
| C7-11 | Corrida entre snapshot e subscribe não perde nota; versão/sequence e dedupe comprovam recuperação. |
| C7-12 | Nenhum token, texto de mensagem ou dado pessoal é registrado em URL/log de socket. |

## 14. Infraestrutura compartilhada — eventos, auditoria e background

### 14.1 Outbox preparada cedo, entrega durável concluída depois

CRM-001 pode preparar a tabela e o adaptador transacional de outbox porque os próximos módulos os reutilizam. Isso é trabalho parcial de infraestrutura; não significa que MSG-001/002 estejam concluídos.

Campos mínimos de OutboxEvent:

- id/eventId, tenantId, name/version e occurredAt.
- actorId do User autor e referência de actorMembershipId, quando aplicável.
- aggregateType, aggregateId e aggregateVersion.
- correlationId/requestId e data com schema mínimo.
- status, availableAt, attempts, leasedUntil/leaseOwner e publishedAt.
- Unicidade e índices para leitura de pendentes; tenant sempre explícito.

Não incluir nome, e-mail, telefone ou texto da mensagem se referências resolvem a necessidade. A auditoria usa o AuditLog existente com metadados allowlisted; não criar um segundo histórico de auditoria concorrente só porque o contrato menciona AuditEvent.

Antes de registrar relações de autoria, confirmar a semântica do actorId atual: User e Membership não são intercambiáveis. Acrescentar campo/referência apropriada sem trocar IDs silenciosamente.

### 14.2 Relay e dedupe — MSG-001/002

1. Selecionar eventos pendentes com lease/lock adequado.
2. Publicar após commit do negócio.
3. Repetir com backoff/jitter e tentativas limitadas.
4. Marcar entrega usando condição de lease para evitar disputa entre relays.
5. Deduplicar efeito do consumidor por tenant + consumer + eventId.
6. Gravar o marcador de consumo junto ao efeito quando ele ocorre no mesmo banco.
7. Tratar a queda “publicou e caiu antes de marcar”: entrega pode repetir e consumidor deve suportar.
8. Quarentenar/DLQ erros permanentes; permitir reprocessamento auditado, sem edição livre de payload.
9. Expor idade do evento mais antigo, tentativas, falhas e latência.
10. Definir retenção e recuperação antes de apagar outbox/dedupe.
11. Não prometer exactly-once de transporte. O objetivo é entrega pelo menos uma vez com efeitos idempotentes.
12. Até o relay estar ativo, não exibir uma notificação ou integração como entregue.

A descoberta técnica de eventos pendentes precisa de capability própria e limitada à outbox/leases, sem acesso global a contatos ou mensagens e sem usar role BYPASSRLS. Depois de obter a referência validada do evento/job, o consumidor aplica contexto do tenant na sua transação. Separar identidade técnica do worker da autoridade humana que originou o efeito. Não fabricar Membership ou User administrador para executar manutenção. Como apps/worker ainda não tem implementação operacional observada, MSG-002 também deve incluir pacote, entrypoint, configuração validada, startup/shutdown e supervisão do processo.

Jobs pequenos e idempotentes simplificam recuperação de falha. O jobId da fila, sozinho, não substitui a unicidade do efeito no banco. [BullMQ — jobs idempotentes](https://docs.bullmq.io/patterns/idempotent-jobs).

### 14.3 Catálogo inicial de eventos

| Nome proposto | Dados de negócio mínimos |
| --- | --- |
| crm.contact.created.v1 | contactId, version. |
| crm.contact.updated.v1 | contactId, version, nomes allowlisted dos campos alterados, sem valores. |
| crm.contact.archived.v1 | contactId, version. |
| crm.field.updated.v1 | fieldId, definitionVersion. |
| crm.import.completed.v1 | batchId e contagens minimizadas. |
| crm.tag.changed.v1 | tagId, version. |
| crm.segment.changed.v1 | segmentId, version, sem filtro pessoal. |
| crm.pipeline.changed.v1 | pipelineId, version. |
| crm.deal.moved.v1 | dealId, fromStageId, toStageId, version. |
| inbox.conversation.updated.v1 | conversationId, version. |
| inbox.note.created.v1 | conversationId, messageId, sequence. |
| crm.contact.assigned.v1 | contactId, version, referências de destino necessárias. |
| crm.deal.assigned.v1 | dealId, version, referências de destino necessárias. |
| inbox.conversation.assigned.v1 | conversationId, version, referências de destino necessárias. |

São contratos a registrar e validar, não strings livres. Publicar somente nomes realmente consumidos ou necessários ao histórico de integração. Actor/correlation/tenant vêm do envelope, não do formulário.

### 14.4 Importação em background — expansão após o MVP

Ativar quando arquivos maiores forem necessários e MSG-001/002 + storage privado estiverem prontos.

- Upload autenticado privado, limitado e temporário; usar streaming/adaptador de armazenamento, não array gigante em Server Action.
- Job no PostgreSQL como fonte de estado: queued, validating, processing, completed, completed_with_errors, failed ou cancelled.
- POST retorna 202 somente após persistir job e intenção durável de processamento.
- Payload da fila contém IDs, tenant e correlation; arquivo/linhas ficam em storage privado/banco conforme retenção.
- Revalidar identidade do solicitante, membership, escopo e quota no início e a cada bloco; não usar permissão congelada do instante do upload.
- Reutilizar validação de contato/campo; não copiar lógica do importador síncrono.
- Processar blocos pequenos com idempotência por job/linha; retries não repetem contatos já confirmados.
- Progresso é baseado em contagem real; distinguir lidas, validadas, criadas, ignoradas e rejeitadas.
- Cancelamento interrompe blocos futuros; não desfaz automaticamente blocos já confirmados.
- Falha parcial tem relatório e retomada explícita. Não chamar essa semântica de rollback integral.
- “Desfazer importação” futura exige verificar se os contatos criados foram alterados ou ganharam relações; não executar DELETE indiscriminado.
- Remover arquivos temporários por rotina monitorada; limitar retenção de erros contendo PII.
- Autorizar consulta, cancelamento, download de erros e retomada por ator/tenant/escopo atual.
- Testar worker duplicado, queda no meio do bloco, quota concorrente, campo alterado, suspensão e exclusão de arquivo.

Não ampliar silenciosamente o endpoint síncrono para semântica assíncrona. Criar/versar o contrato e adaptar a UI com estado persistente.



## 15. Contratos HTTP, erros e idempotência

### 15.1 Organização de contratos

Criar arquivos temáticos, evitando transformar packages/contracts/src/index.ts num arquivo de todo o CRM:

| Grupo proposto | Conteúdo |
| --- | --- |
| src/crm/contact.ts | Create/Update/List/Detail e projeções. |
| src/crm/custom-field.ts | Definição discriminada por tipo e alterações de valor. |
| src/crm/contact-import.ts | Prévia, seleção, confirmação, resultado e limites. |
| src/crm/filter.ts | AST e ordenações permitidas. |
| src/crm/tag.ts e segment.ts | Gestão, associação e consulta. |
| src/crm/pipeline.ts e deal.ts | Configuração, transição, histórico e dinheiro. |
| src/inbox/conversation.ts e message.ts | Conversas, notas, paginação e leitura. |
| src/assignment.ts | Destino/claim/release, sem repositório genérico. |
| src/realtime.ts | Protocolo de controle e avisos mínimos. |

Os nomes de arquivo são propostos; ajustar ao padrão real da branch sem duplicar contratos existentes. Exportar inicialmente pelo ponto público atual. Se adicionar subpath exports, atualizar package.json/build/consumidores e testar Node/Next.

Todo schema de entrada é estrito e limitado. DTO público é independente do retorno completo do Prisma: não usar include de User/Membership e devolver a árvore inteira.

### 15.2 Listas, busca e paginação

- Forma comum: data + nextCursor; hasMore/contagem somente quando definidos no contrato.
- Cursor opaco, limitado e validado; inclui ordenação/desempate e vínculo com o filtro quando necessário.
- Cursor não substitui auth. Trocá-lo de tenant/membership/consulta deve falhar ou reiniciar consulta com segurança.
- Busca simples sem dados pessoais pode usar parâmetros; filtros com e-mails, telefones ou outros valores pessoais usam POST de busca/prévia, com logs de body desabilitados.
- Acrescentar POST /crm/contacts/search, /crm/deals/search e /inbox/conversations/search quando esses filtros forem habilitados; todos usam o mesmo serviço da listagem.
- Campos de sort são enumerados; valores não podem virar nomes de coluna diretamente.
- Listas de IDs são limitadas; projeções e relações são autorizadas.
- Em listas mutáveis, não prometer snapshot estável entre páginas sem uma implementação própria. Revalidar em mutação/reconexão e documentar o comportamento.
- Busca de nome precisa de semântica definida de acento/case; não simular busca parcial com filtro local apenas sobre a página.

### 15.3 Erros

Preservar a forma canônica error.code, error.message e error.requestId. Mensagens públicas em pt-BR, sem SQL/stack/detalhes internos.

| Situação | HTTP proposto | Código técnico |
| --- | --- | --- |
| Não autenticado/sessão inválida | 401 | AUTH_REQUIRED |
| Operação sem permissão | 403 | PERMISSION_DENIED |
| Tenant selecionado inacessível | 403 | TENANT_ACCESS_DENIED |
| Recurso ausente ou não visível | 404 | NOT_FOUND |
| Estrutura inválida | 400 | VALIDATION_FAILED |
| Dados de domínio inválidos | 422 | VALIDATION_FAILED ou código específico registrado |
| Versão antiga | 409 | CONFLICT |
| Prévia/campo/seleção mudou | 409 | CRM_IMPORT_PREVIEW_STALE — novo |
| Prévia expirada | 410 | CRM_IMPORT_EXPIRED — novo |
| Dependência impede arquivamento | 409 | CRM_RESOURCE_IN_USE — novo |
| Quota excedida | 409 | CRM_LIMIT_REACHED — novo |
| Payload maior que o permitido | 413 | PAYLOAD_TOO_LARGE — novo |
| Limite de requisições | 429 | AUTH_RATE_LIMITED ou código transversal existente adequado |
| Infra necessária indisponível | 503 | SERVICE_UNAVAILABLE |
| Falha inesperada | 500 | INTERNAL_ERROR |

Registrar códigos novos no catálogo e schemas. Não tratar todo erro como 403. Não expor campos/IDs de recursos ocultos em detalhes de conflito.

Erros de formulário precisam de estrutura tipada para caminhos e mensagens. A extensão deve ser feita no contrato compartilhado e em todos os consumidores afetados: o envelope atual é strict, portanto acrescentar propriedades não é automaticamente compatível com leitores antigos.

Na prévia de importação, rowIssues é DTO próprio, com índice lógico, campo e código; evitar repetir a linha inteira em cada erro.

### 15.4 Regras de idempotência

- Chave no escopo tenant + ator + operação, com tamanho/formato limitados.
- Mesma chave + mesma intenção confirmada retorna o resultado compatível.
- Mesma chave + intenção diferente retorna CONFLICT.
- Constraints/locks no banco protegem requisições simultâneas.
- Usar representação canônica da intenção para hash; não comparar JSON por ordem incidental de propriedades.
- Revalidar sessão e autorização antes de retornar um resultado idempotente antigo.
- Resultado guardado não dá acesso permanente a dados que o usuário deixou de poder ler.
- Não repetir automaticamente mutação sem chave.
- Explicitar janela de retenção; depois dela, o cliente não pode tratar retry antigo como garantidamente seguro.
- Atualizar contato não significa substituir todos os campos por dados importados: importação inicial é create-only.

## 16. Experiência, operação e critérios não visuais

### 16.1 Jornadas completas

| Jornada | Início → fim verificável |
| --- | --- |
| Primeiro uso | Lista vazia → novo contato → detalhe real → retorno à lista. |
| Personalização | Criar campo → preencher contato → filtrar valor → editar definição permitida. |
| Importação | Arquivo → mapa → revisão → confirmação → resultado → consultar contatos. |
| Organização | Criar tag → aplicar → salvar segmento → observar reavaliação. |
| Venda | Configurar pipeline → criar negócio → mover por regra → consultar histórico. |
| Atendimento | Abrir contato/conversa → registrar nota interna → marcar leitura → resolver. |
| Distribuição | Escolher fila/membro → transferir → notificar → verificar retirada/manutenção de acesso. |
| Recuperação | Perder rede/sessão → preservar intenção segura → reautenticar/reconsultar → evitar repetição. |

### 16.2 Padrões obrigatórios de interface

- Usar PageHeader, DataTable, Dialog/Drawer, Input, Select/Combobox, Alert, EmptyState e demais exports reais de packages/ui.
- Usar react-hook-form e Zod conforme as regras do produto.
- Não recriar cores, botões, alturas ou modais específicos para cada card.
- Títulos Inter e corpo Poppins; light/dark/sistema; tokens canônicos.
- Loading local, empty orientado, error acionável, success verdadeiro e disabled explicado.
- Erro impeditivo permanece visível; toast não é seu único local.
- Label visível e mensagem associada ao campo; foco no primeiro erro quando apropriado.
- Inputs não perdem conteúdo em 4xx/5xx ou timeout; não mostrar sucesso antes da confirmação.
- Nome/e-mail/telefone reais não entram em analytics ou gravação automática de suporte.
- “Zero” apenas para contagem confirmada; estado indisponível usa mensagem/indicador apropriado.
- Permissões afetam leitura/edição de cada ação; a API continua sendo autoridade.
- Confirmação proporcional para arquivo/lote/transferência/arquivamento; não pedir modal extra para cada ação reversível trivial.
- Detalhe mostra origem, criação, última alteração, responsável e histórico permitido.
- Seleção em massa informa quantidade e “nesta página”; não sugerir seleção de toda a base.
- Reflow desde 320 px; testar 360, 768, 1024 e desktop, zoom, teclado virtual e safe-area.
- Reduced motion, retorno de foco e alternativa ao drag fazem parte do aceite.

### 16.3 Consistência de cache e rascunhos

Escolher o mecanismo de query/cache já adotado ou registrar uma escolha compartilhada para CRM/inbox. Não introduzir bibliotecas diferentes por card.

- Chaves por tenant + membership + revisão de autorização + consulta.
- Invalidar a entidade, listas/contagens afetadas e relações autorizadas após mutação.
- Revalidar no foco e por evento conforme necessidade; cancelar request obsoleto.
- Trocar de tenant remove seleção, dados, sockets e rascunhos do contexto anterior.
- Manter rascunho em memória da sessão/feature; persistência em disco exige política específica.
- Em conflito, oferecer atualizar dados confirmados e reaplicar intenção manualmente; não sobrescrever silenciosamente.
- Não armazenar payload de contatos/conversas em cache público, service worker ou fallback offline sem contrato próprio.

### 16.4 Observabilidade

Registrar métricas e logs estruturados minimizados:

| Área | Medir |
| --- | --- |
| API | Latência p50/p95, erro por código, timeout e rejeição de limites. |
| Banco | Queries lentas, locks, tamanho/uso de índices e duração transacional. |
| Importação | Linhas, bytes, duração de prévia/commit, conflitos, expiração e retries deduplicados. |
| Autorização | Negativas por categoria e revisão; sem dump de concessões ou identidade pessoal em labels. |
| Outbox/fila | Backlog, idade do evento mais antigo, tentativas, DLQ e atraso de entrega. |
| Realtime | Conexões, inscrições, recusas, reconexão, backpressure e atraso de invalidação. |
| UX | Falhas por etapa e conclusão de jornada, sem conteúdo digitado. |
| Retenção | Itens expirados pendentes de purga e execução da rotina de limpeza. |

RequestId e correlationId precisam ser limitados/validados antes de refletir cabeçalhos. IDs arbitrários recebidos não podem gerar injeção em log nem cardinalidade ilimitada em métricas.

### 16.5 Orçamento de desempenho para validação

Valores abaixo são metas iniciais de laboratório, **não resultados medidos**:

- Listagem/detalhe: p95 até 500 ms no backend em ambiente de ensaio documentado.
- Mutação simples: p95 até 800 ms, excluindo WAN do navegador.
- Commit do CSV de 500 linhas: alvo até 5 s, dentro do timeout transacional existente.
- Realtime: medir commit até UI e revogação até bloqueio; definir SLO após teste com a topologia real.
- Usar datasets sintéticos representativos: pelo menos dois tenants, um com 10 mil e outro com 100 mil contatos, além de mensagens/negócios suficientes para exercitar paginação.
- Não exigir benchmark de 100 mil registros em toda alteração de texto; executar na fundação de consulta/índices e quando houver risco de regressão.
- Inspecionar EXPLAIN (ANALYZE, BUFFERS) em ambiente de ensaio para as queries críticas.
- Não medir uma base vazia e concluir que JSONB/segmentação escala.

Se a meta não for cumprida, registrar hardware, concorrência e gargalo; reduzir limite ou melhorar query antes de prometer volume maior.

### 16.6 Retenção e governança

- Contato arquivado permanece consultável por quem tem contacts.read no recurso, com indicação de estado; lista comum filtra ativos. Isso preserva contexto histórico autorizado.
- Arquivamento não é expurgo. Não apagar histórico por cascata.
- Definir retenção de notas, contatos, auditoria, blobs e backups na configuração operacional do produto antes da liberação correspondente; não inventar prazo legal neste roteiro.
- Importação tem TTL técnico explícito na seção 7, com limpeza testada.
- Cadastro/importação não significa opt-in de marketing, aceite de canal ou autorização de disparo.
- Não coletar campos sensíveis “para talvez usar”; documentar finalidade dos campos.
- Exportação, correção e exclusão definitiva precisam de fluxo autorizado, escopo e auditoria próprios.
- Configurações de entitlement não podem apagar dados automaticamente quando um plano é reduzido.
- Impedir credenciais, documentos secretos ou tokens em customFields/notas por orientação e controles compatíveis; não anunciar detecção infalível.

## 17. Estratégia de testes e evidências

### 17.1 Camadas de validação

| Tipo | Prova esperada |
| --- | --- |
| Unidade de domínio | Normalização, campos, filtros, transições, elegibilidade e máquinas de estado. |
| Contrato | Schemas/DTOs, limites, erros e compatibilidade de eventos. |
| Integração com PostgreSQL | RLS, FKs, locks, versionamento, quotas, idempotência e rollback. |
| Integração com Redis/worker | Retry, dedupe, perda/reordenação e recuperação de infraestrutura. |
| API por injeção/HTTP | Rotas registradas, auth real do cenário, códigos e serialização. |
| E2E de produto | Jornadas com banco, sessão e interface conectados; não apenas mocks. |
| UI/acessibilidade | Teclado, foco, responsividade, temas e reduced motion. |
| Carga direcionada | Consultas/importação/realtime contra volume relevante. |

Mock não prova RLS; build não prova revogação; um helper de evento não prova relay. O caso negativo precisa falhar pelo motivo esperado, não por serviço desligado.

### 17.2 Fixtures mínimas

- Tenant A e Tenant B.
- Proprietário protegido, gerente com leitura ampla/edição setorial, agente com OWN/ASSIGNED e usuário somente leitura.
- Pessoa com memberships em ambos os tenants, sem compartilhar permissões.
- Membro suspenso; vínculo removido de setor; cargo revogado/expirado.
- Dois setores em A e um em B; cargo global e cargo setorial.
- Contatos e negócios com/sem setor e responsável.
- Campos com false, zero, ausência, select arquivado e texto potencialmente malicioso.
- Conversas e notas sintéticas; nunca copiar conversas reais para teste.
- Sessões tenant/platform distintas e cenários de cache revogado.

### 17.3 Casos transversais obrigatórios

| ID | Validação |
| --- | --- |
| T-01 | Query sem contexto não lê/escreve tabelas de tenant. |
| T-02 | UUID real de B em request de A não atravessa serviço nem FK/RLS. |
| T-03 | Membership em dois tenants não mistura roles, cache, segmentos, rascunhos ou sockets. |
| T-04 | read TENANT + update DEPARTMENT permanece edição apenas no departamento concedido. |
| T-05 | Departamento adicional sem concessão não amplia o escopo de cargo de outro setor. |
| T-06 | Sessão inválida/revogada e membro/tenant inativos negam API direta, Action e socket. |
| T-07 | Revogação concorrente e Redis indisponível não mantêm acesso por cache positivo antigo. |
| T-08 | Listagem, detalhe, count, lookup, relatório e evento obedecem ao mesmo limite de recurso. |
| T-09 | Payload extra não altera tenant, autoria, estado interno ou atribuição por caminho alternativo. |
| T-10 | Rollback remove entidade/alteração, auditoria de sucesso e outbox associados. |
| T-11 | Erros/logs/telemetria não contêm arquivo, PII, token, cookie, SQL ou texto de nota. |
| T-12 | Mesmo request concorrente/idempotente não duplica efeito. |
| T-13 | Pool de conexões não reaproveita contexto de tenant após commit/rollback. |
| T-14 | CSRF/origin/host inválidos não acionam mutações autenticadas por cookie. |
| T-15 | Publicação de evento anterior à revogação não autoriza entrega posterior sem revalidação. |
| T-16 | Compatibilidade de permissões não concede ações novas a papéis legados por acidente. |

Os casos específicos C1 a C7 estão em cada card. Associar cada critério a um teste ou evidência manual reproduzível; critérios críticos de segurança/atomicidade precisam de teste automatizado com infraestrutura adequada.

### 17.4 Ajustar a descoberta de testes

O script atual da API procura testes em src/tests, enquanto o esqueleto dos módulos possui suas próprias pastas tests. Não criar testes “invisíveis” ao gate.

Escolher e documentar uma estratégia única:

- incluir módulos no runner, enumerando explicitamente os arquivos por script portátil; ou
- manter testes executáveis na árvore existente com nomes por domínio.

Se criar script test:crm/test:inbox/test:realtime, adicioná-lo de fato ao package.json e ao gate pertinente. Validar o número de arquivos executados. Um comando que termina com zero testes não é evidência de sucesso.

## 18. Comandos, mudanças de arquivos e forma de entrega

### 18.1 Inventário de arquivos por entrega

| Entrega | Áreas de criação/alteração |
| --- | --- |
| Preparação | contracts de contexto, auth/policies e sessão, middleware API, api-client, config, docs/decisions e evidências. |
| CRM-001 | packages/db/prisma; contracts/crm; 05-crm; features/crm; rotas /contacts e fields; navegação; events mínimo. |
| CRM-002 | Modelos Tag/ContactTag/Segment; filtros compartilhados; serviços/controllers; gestão e seleção na feature. |
| CRM-003 | Modelos Pipeline/Stage/Deal/History; regras; serviços; configurações e editor de negócio. |
| CRM-004 | Queries/projeções do quadro; componentes de lista/card; rota /crm; composição com inbox. |
| CRM-005 | Modelos de conversa/nota/leitura; contracts/inbox; 06-inbox; features/inbox; rota /inbox. |
| CRM-006 | Contratos de atribuição; interfaces públicas de team; serviços por recurso; notificações e UI de encaminhamento. |
| CRM-007 | Contratos realtime; gateway/assinaturas; auth/contexto; integração broker; conexão do painel e configuração do proxy. |
| MSG-001/002 | Outbox/relay/dedupe, worker, jobs, DLQ, configuração e operação. |
| Todas | Testes relevantes; docs/taskboard.json; Markdown gerado; evidência versionada e READMEs afetados. |

Não criar arquivos vazios para “cumprir arquitetura”. Cada módulo deve ter responsabilidades e imports reais, sem circularidade.

### 18.2 Comandos existentes a reutilizar

Conferir scripts da branch antes de executar. Instalação e geração não aplicam migration.

~~~bash
pnpm install --frozen-lockfile
pnpm --filter @bipesend/db generate
pnpm --filter @bipesend/db db:validate
pnpm foundation:check
pnpm --filter @bipesend/api test:integration
pnpm --filter @bipesend/api build
pnpm --filter @bipesend/tenant-web build
pnpm taskboard:render
pnpm taskboard:check
~~~

Observações:

- test:integration atual cobre um arquivo da fundação; ampliá-lo/integrá-lo aos testes novos antes de usá-lo como prova de CRM.
- Rodar lint/typecheck/testes dos pacotes alterados, conforme seus scripts reais.
- Contratos/auth/eventos compartilhados podem afetar outras superfícies; buildar consumidores atingidos pela mudança.
- Para testes de UI compartilhada, reutilizar pnpm ui:smoke quando houver alteração no design system.
- Para jornadas CRM, criar testes Playwright próprios e executá-los, por exemplo pelo pacote @bipesend/e2e-tests com os caminhos reais dos arquivos criados.
- Não usar comandos de migration/reset/seed por cópia deste bloco. Seguir P-02 e o SQL revisado no ambiente autorizado.
- Não registrar segredos, dumps ou bodies de resposta sensíveis como saída de teste.

### 18.3 Sequência de validação por fatia

1. Testes de domínio/contrato da mudança.
2. Integração de banco para as invariantes alteradas.
3. API e interface conectadas no caminho principal e falhas relevantes.
4. Gate compartilhado exigido pelas regras.
5. Build dos consumidores afetados.
6. Revisão de teclado/mobile/estados quando a interface mudou.
7. Atualização de evidências e taskboard.
8. Revisão do diff: migração, compatibilidade, acessos, dados e componentes.

Repetir ou ampliar testes quando houver risco concreto restante, não por ritual. Se faltar infraestrutura, deixar o gate explicitamente pendente; não substituir por mock e declarar a mesma prova.

### 18.4 Modelo de evidência do card

Criar registro em docs/audit com nome estável do card/entrega:

~~~markdown
# Evidência — CRM-001

- Commit/branch avaliados:
- Ambiente e versões relevantes:
- Dependências conferidas:
- Critérios de aceite cobertos:
- Arquivos e contratos alterados:
- Migration criada e ambiente em que foi ensaiada:
- Comandos realmente executados:
- Resultados e quantidade de testes:
- Cenários negativos:
- Medições relevantes:
- Revisão de teclado/mobile/temas:
- Limitações/bloqueios:
- Efeito de rollback e procedimento:
- Estado correto do card:
~~~

Evidência deve descrever o código executado. Registrar histórico de falha/correção sem substituir resultados por uma afirmação genérica de “testado”.

### 18.5 Plano de liberação e reversão

- Feature flags controlam exposição gradual, com owner e data de revisão; não substituem autorização.
- Ensaiar migrations em banco isolado compatível e, quando existir dado, em cópia restaurável autorizada.
- Preferir mudanças aditivas; backfill pesado separado e monitorado.
- Verificar índices/locks/tempo antes de aplicar a ambiente com clientes.
- Publicar componentes compatíveis com o schema durante a transição.
- Em falha, desligar a funcionalidade pela flag/rota e reverter código compatível; não retornar a caminho antigo que tenha autorização mais fraca.
- Não apagar tabelas ou desfazer contatos importados como rollback automático de deploy.
- Contract/descarte de colunas só após todos os consumidores migrarem e a retenção ser resolvida.
- Liberação de canais externos, provedor de mensagem ou importação grande é entrega separada com seus gates.

## 19. Ordem prática de trabalho para o Antigravity

### 19.1 Primeiro ciclo

1. Ler e conferir a referência atual, regras e cards.
2. Registrar a adoção das decisões e o diff necessário de dependências.
3. Executar P-01/P-02/P-03; localizar a falha concreta antes de refatorar fundação.
4. Validar a ponte autenticada tenant-web → Fastify com um cenário de leitura protegido.
5. Implementar contratos e persistência de contatos/campos.
6. Entregar criação/listagem/detalhe/edição de contato com testes de tenant e escopo.
7. Conectar /contacts e substituir a prévia /users por redirecionamento.
8. Entregar gestão de campos e validar o ciclo definição → valor → leitura.
9. Entregar wizard de importação limitado, idempotência, rollback e expiração.
10. Fechar CRM-001 apenas com os critérios C1 cumpridos.

### 19.2 Ciclos seguintes

- Tags/filtros/segmentos: CRM-002.
- Pipeline/etapas/negócios: CRM-003.
- Quadro/lista reais: CRM-004.A.
- Atendimento/notas/histórico: CRM-005.
- Integração de visualizações: CRM-004.B e fechamento CRM-004.
- Relay/fila/dedupe: MSG-001/002.
- Realtime e recuperação: CRM-007.
- Encaminhamento, fila, claim e notificação: CRM-006.
- Importação grande, exportação ampla, merges, canais externos e chat da equipe: expansões explícitas com novos recortes no board.

### 19.3 Condições para seguir sem nova decisão

Usar os defaults deste roteiro quando ele tiver sido adotado como instrução de execução e não houver regra mais específica conflitante. Ajustes de nomes de arquivo, organização local e implementação interna podem seguir o padrão da branch.

Registrar e pedir decisão somente quando aparecer conflito material, como:

- requisito comercial que imponha identificador de contato exclusivo e rejeite e-mail/telefone compartilhado;
- necessidade de arquivo maior que o recorte síncrono antes de existir a infraestrutura assíncrona;
- necessidade de envio ao cliente ou chat privado da equipe dentro de CRM-005, alterando a fronteira adotada;
- política de acesso que exija sigilo por campo, exceções de owner ou ampliação de escopo não coberta;
- banco real com histórico/invariantes incompatíveis que exija operação irreversível fora do escopo autorizado.

Não pedir confirmação repetida para rotinas já autorizadas. Trabalhar a preparação útil e explicar o impedimento concreto se uma dessas situações bloquear o aceite.

### 19.4 Definição de pronto do marco

- [ ] Contatos e campos são persistentes, tipados e isolados.
- [ ] CSV limitado tem revisão, idempotência, limite, atomicidade e limpeza.
- [ ] Tags e segmentos usam filtros seguros e quotas reais.
- [ ] Negócios têm pipeline/etapa/histórico e concorrência correta.
- [ ] Quadro/lista/mobile possuem ações reais e alternativa ao drag.
- [ ] Conversas e notas são separadas de mensagens externas e de chat da equipe.
- [ ] Atribuições validam setor/cargo/membro e não criam concessões implícitas.
- [ ] Notificação/realtime respeitam revogação, duplicidade e reconexão.
- [ ] Não há mock demonstrativo apresentado como dado operacional nas rotas entregues.
- [ ] Gates e critérios estão ligados a evidências do commit real.
- [ ] Documentação/taskboard refletem exatamente o que foi entregue e o que continua pendente.

## 20. Fontes e rastreabilidade

### 20.1 Fontes do projeto

Todas as referências de código desta análise foram fixadas no commit 95639ef08979d37fd713a5c31c6df3784d4da7f4 para não misturar versões. O Antigravity deve comparar o novo checkout antes de executar.

- [Regra mestre e divisão frontend/backend](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/rules/00_MASTER.md).
- [Regras ativas 01–35](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4/rules).
- [Contrato de agentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/AGENTS.md).
- [Taskboard editável](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/taskboard.json).
- [Decisões, incluindo ADR-0012 a ADR-0018](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/decisions.md).
- [Mapa de módulos](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/module-map.md).
- [Schema Prisma](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/prisma/schema.prisma).
- [Histórico de migrations Prisma](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/prisma/migrations).
- [Contrato de banco e transação](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/README.md).
- [Reconciliação histórica de banco](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/architecture/database-reconciliation.md).
- [Policies efetivamente existentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/auth/src/policies.ts).
- [Contratos e permissões executáveis](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/contracts/src/index.ts).
- [Ponte HTTP do painel](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/tenant-web/src/lib/api-client.ts).
- [Middleware de identidade/tenant da API](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/api/src/modules/00-shared/presentation/auth.middleware.ts).
- [Helpers de eventos](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/events/src/index.ts).
- [Design system e componentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/ui/README.md).
- [Scripts da API e descoberta de testes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/api/package.json).
- [Evidência histórica da fundação](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/audit/validation.md).
- [Relatório de segurança registrado pelo projeto](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/audit/security-review.md).

### 20.2 Referências técnicas consultadas

Consultadas em 15/09/2026. Confirmar detalhes na versão efetivamente instalada antes de escrever código.

- [PostgreSQL — JSON types e índices](https://www.postgresql.org/docs/current/datatype-json.html).
- [PostgreSQL — row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- [PostgreSQL — constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).
- [Next.js — limites de Server Actions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions).
- [OWASP — CSV injection](https://community.owasp.org/attacks/CSV_Injection).
- [OWASP — WebSocket security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).
- [BullMQ — jobs idempotentes](https://docs.bullmq.io/patterns/idempotent-jobs).

**Limite desta análise:** inspeção do planejamento, regras e código remoto. Os modelos, limites, rotas e critérios propostos precisam ser implementados e verificados; este arquivo não certifica desempenho, segurança operacional ou conclusão de nenhum card.

## 21. CRM-010 - Automa��es visuais (Pr�xima Sess�o)

- Arrastar, pan e zoom estilo n8n.
- Menu de gatilhos flutuante, ativado por clique.
- Sincronizar eventos de mouse para evitar conflitos (clique esquerdo longo/arrastar para pan, scroll para zoom, ou mapear para bot�o do meio do mouse).
- Corre��o do scroll duplicado ao clicar em 'a��o'.
- Total personaliza��o no fluxo (cards menos retangulares e mais bonitos).

