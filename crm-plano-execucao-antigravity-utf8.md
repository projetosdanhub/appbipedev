# BipeSend â€” plano de execuÃ§Ã£o de CRM-001 a CRM-007 para o Antigravity

**VersÃ£o:** 1.0 â€” planejamento para implementaÃ§Ã£o  
**Data da anÃ¡lise:** 15/09/2026  
**RepositÃ³rio:** [projetosdanhub/appbipedev](https://github.com/projetosdanhub/appbipedev)  
**CÃ³digo de referÃªncia:** [95639ef08979d37fd713a5c31c6df3784d4da7f4](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4)  
**Entrega deste trabalho:** especificaÃ§Ã£o e roteiro. Nenhum cÃ³digo, card, banco ou ambiente foi alterado por esta anÃ¡lise.

**Leitura rÃ¡pida:** [decisÃµes](#2-revisÃ£o-do-esboÃ§o-e-decisÃµes-recomendadas), [preparaÃ§Ã£o e ordem](#3-preparaÃ§Ã£o-e-ordem-das-entregas), [CRM-001](#7-crm-001--contatos-campos-customizados-e-importaÃ§Ã£o), [testes](#17-estratÃ©gia-de-testes-e-evidÃªncias) e [primeiro ciclo](#19-ordem-prÃ¡tica-de-trabalho-para-o-antigravity).

## 0. Como executar este documento

Este roteiro transforma o esboÃ§o inicial em entregas verificÃ¡veis de produto, dados, autorizaÃ§Ã£o, operaÃ§Ã£o e interface. As decisÃµes novas abaixo sÃ£o recomendaÃ§Ãµes concretas para adoÃ§Ã£o na implementaÃ§Ã£o; nÃ£o sÃ£o descriÃ§Ãµes de funcionalidades jÃ¡ prontas.

Ao receber este arquivo como instruÃ§Ã£o de trabalho:

1. Ler AGENTS.md, rules/00_MASTER.md, regras do domÃ­nio, docs/taskboard.json, docs/taskboard.md e READMEs dos pacotes afetados.
2. Comparar o checkout atual com o commit de referÃªncia. Preservar alteraÃ§Ãµes locais e trabalho de outras pessoas. O estado mais recente precisa ser inspecionado antes de reutilizar qualquer achado deste documento.
3. Executar a etapa de preparaÃ§Ã£o da seÃ§Ã£o 3. NÃ£o comeÃ§ar criando tabelas de CRM sobre um banco cujo histÃ³rico nÃ£o foi identificado.
4. Registrar as decisÃµes adotadas em docs/decisions.md, usando os prÃ³ximos IDs disponÃ­veis. Os rÃ³tulos D-01 a D-12 deste arquivo sÃ£o referÃªncias internas, nÃ£o IDs de ADR existentes.
5. Implementar uma fatia completa por vez: contrato, autorizaÃ§Ã£o, persistÃªncia, API, interface, falhas e evidÃªncia.
6. Antes da ediÃ§Ã£o, declarar arquivos e critÃ©rios de aceite da fatia. Ao concluir, registrar comandos executados, resultados e limitaÃ§Ãµes.
7. Atualizar a fonte docs/taskboard.json; gerar o Markdown por taskboard:render e validar por taskboard:check. NÃ£o editar apenas o Markdown gerado.
8. Continuar trabalho reversÃ­vel jÃ¡ autorizado. Pedir decisÃ£o somente diante de conflito real que nÃ£o possa ser resolvido pelo escopo e pelas regras vigentes.
9. Entregar branch e diff revisÃ¡veis. Merge, deploy, mudanÃ§as em produÃ§Ã£o e ativaÃ§Ã£o de provedores seguem a autorizaÃ§Ã£o operacional da sessÃ£o de execuÃ§Ã£o.
10. Nunca marcar DONE por presenÃ§a de arquivo, mock visual, validaÃ§Ã£o de Zod ou relato antigo de testes.

**ConvenÃ§Ã£o dos passos:** referÃªncias como â€œCRM-004.Aâ€ indicam fatias de um card existente. NÃ£o criar cards com esses IDs automaticamente.

**Primeira entrega recomendada:** preparaÃ§Ã£o + CRM-001.A/B, com contato real criado e consultado pela API, isolamento testado e formulÃ¡rio conectado. ImportaÃ§Ã£o, campos e demais critÃ©rios ainda precisam ser finalizados antes de CRM-001 ficar DONE.

## 1. O que foi verificado no repositÃ³rio

### 1.1 SituaÃ§Ã£o do taskboard na referÃªncia analisada

| Card | Estado registrado | Leitura para este planejamento |
| --- | --- | --- |
| INF-001, AUTH-001, AUTH-008, AUTH-016 | DONE | Confirmar evidÃªncias e comportamento no checkout/ambiente de execuÃ§Ã£o. |
| TEAM-001, TEAM-002 | DONE | HÃ¡ modelos de setores/cargos; isso nÃ£o prova que a API jÃ¡ calcula todos os escopos. |
| TEAM-003 | BACKLOG | O ciclo completo de suspensÃ£o, reativaÃ§Ã£o e transferÃªncia afeta atribuiÃ§Ã£o e realtime. |
| TEAM-004 a TEAM-007 | DONE | Reutilizar contratos existentes; validar a integraÃ§Ã£o necessÃ¡ria ao CRM. |
| CRM-001 a CRM-007 | BACKLOG | Nenhum destes sete cards foi considerado implementado nesta anÃ¡lise. |
| MSG-001 e MSG-002 | BACKLOG | Outbox durÃ¡vel, relay e BullMQ ainda precisam de entrega prÃ³pria. |

Fonte: [taskboard do commit analisado](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/taskboard.json).

### 1.2 Achados que alteram o plano inicial

| Achado no cÃ³digo/documentaÃ§Ã£o | ConsequÃªncia prÃ¡tica |
| --- | --- |
| rules/00_MASTER.md jÃ¡ determina Actions finas chamando Fastify por HTTP | Manter essa direÃ§Ã£o em todo o CRM. |
| 05-crm e 06-inbox possuem apenas a estrutura inicial de pastas | Controllers, serviÃ§os, repositÃ³rios, composiÃ§Ã£o e testes precisam ser conectados de verdade. |
| O Prisma ainda nÃ£o possui Contact, CustomField, Deal ou Conversation | Modelar por migrations novas, sem presumir estruturas jÃ¡ existentes. |
| O schema possui MembershipRole, DepartmentMembership, DepartmentRoleAssignment e concessÃµes diretas | Reutilizar essas entidades de equipe; conferir FKs, migrations e estado real antes de integrÃ¡-las. |
| auth/policies ainda resolve a matriz fixa tenant_admin/manager/agent/viewer | A especificaÃ§Ã£o de cargos cumulativos ainda nÃ£o equivale ao caminho de autorizaÃ§Ã£o efetivamente usado pela API. |
| TenantContext possui uma lista de nomes de permissÃµes, sem pares de aÃ§Ã£o e escopo | Ã‰ necessÃ¡rio evoluir o contrato para nÃ£o ampliar permissÃµes departamentais para o tenant inteiro. |
| crm.contacts.read/create/update/delete/export jÃ¡ existem | NÃ£o substituir essas chaves por crm.contacts.manage. |
| crm.deals.write e inbox.conversations.* jÃ¡ existem | Fazer migraÃ§Ã£o explÃ­cita quando introduzir aÃ§Ãµes mais granulares. |
| fetchApi jÃ¡ existe e encaminha todos os cookies | Reutilizar a ponte, restringindo cookies/cabeÃ§alhos, origem, timeout, redirects e cache. |
| A navegaÃ§Ã£o atual chama â€œContatosâ€ em /users | Criar uma rota canÃ´nica de contatos e preservar um redirecionamento de compatibilidade. |
| /users, /crm e /inbox contÃªm dados demonstrativos | Substituir a experiÃªncia da rota entregue por dados reais e estados reais. |
| packages/events fornece helpers; apps/worker tem README, sem worker operacional observado | NÃ£o anunciar job, entrega durÃ¡vel ou atualizaÃ§Ã£o distribuÃ­da somente por chamar um helper. |
| O script de testes da API procura src/tests; as novas pastas de testes ficam em modules | Incluir explicitamente os testes dos mÃ³dulos no runner e no gate. |

HÃ¡ tambÃ©m documentaÃ§Ã£o histÃ³rica incompatÃ­vel com o estado novo: a matriz em docs/architecture/permissions.md ainda cita crm.contacts.write; o handoff e relatÃ³rios antigos descrevem gates antes de mudanÃ§as recentes. A preparaÃ§Ã£o precisa reconciliar essas referÃªncias, sem reabrir ou aprovar cards apenas por inferÃªncia.

O schema atual apresenta estruturas de equipe que precisam ser comparadas com o histÃ³rico SQL versionado e o banco real. Esta anÃ¡lise foi de cÃ³digo: **nÃ£o houve introspecÃ§Ã£o do banco, execuÃ§Ã£o de migrations, E2E ou mediÃ§Ã£o de desempenho**.

## 2. RevisÃ£o do esboÃ§o e decisÃµes recomendadas

| DecisÃ£o | O que faremos | Motivo |
| --- | --- | --- |
| D-01 â€” fonte de negÃ³cio | Fastify + serviÃ§os de aplicaÃ§Ã£o + repositÃ³rios; Actions como BFF | Uma regra de acesso e de escrita para as superfÃ­cies do produto. |
| D-02 â€” campos dinÃ¢micos | Metadados relacionais em CustomField; valores limitados e tipados em JSONB no Contact | Flexibilidade sem transformar relaÃ§Ãµes centrais em JSON arbitrÃ¡rio. |
| D-03 â€” CSV inicial | ImportaÃ§Ã£o sÃ­ncrona, atÃ© 500 linhas e 512 KiB de CSV, com prÃ©via e confirmaÃ§Ã£o | Entrega Ãºtil sem depender de uma fila ainda inexistente; limites sujeitos ao ensaio de carga. |
| D-04 â€” importaÃ§Ã£o maior | Background apÃ³s MSG-001/002, com contrato prÃ³prio de progresso e falha parcial | Arquivos grandes nÃ£o devem atravessar Actions como arrays enormes. |
| D-05 â€” autorizaÃ§Ã£o | Reutilizar aÃ§Ãµes canÃ´nicas e preservar aÃ§Ã£o + escopo + origem da concessÃ£o | Ler todo o tenant nÃ£o pode ampliar o alcance de uma permissÃ£o de ediÃ§Ã£o setorial. |
| D-06 â€” identidade do cliente | Contact Ã© dado do CRM, separado de User e Membership | Cadastrar/importar cliente nÃ£o cria login, convite, senha ou acesso ao painel. |
| D-07 â€” duplicidade comercial | Identificadores normalizados para busca e revisÃ£o; idempotÃªncia para repetiÃ§Ã£o tÃ©cnica; nenhuma fusÃ£o automÃ¡tica | Pessoas distintas podem compartilhar um telefone ou e-mail comercial. |
| D-08 â€” entidade comercial | Contact e Deal sÃ£o entidades distintas; um contato pode ter vÃ¡rios negÃ³cios | Evita transformar a etapa comercial em um atributo Ãºnico do cliente. |
| D-09 â€” comunicaÃ§Ã£o | CRM-005 entrega conversas de atendimento e notas internas; chat da equipe tem domÃ­nio separado | Segue ADR-0018 e impede uma nota interna virar resposta ao cliente. |
| D-10 â€” atribuiÃ§Ã£o | Setor responsÃ¡vel, cargo de roteamento e membro responsÃ¡vel sÃ£o referÃªncias explÃ­citas | Cargo orienta fila/elegibilidade; nÃ£o cria permissÃ£o nem muda a hierarquia de acesso. |
| D-11 â€” realtime | WebSocket transporta avisos autorizados; HTTP e banco mantÃªm o estado canÃ´nico | ReconexÃ£o, revogaÃ§Ã£o e eventos repetidos precisam de recuperaÃ§Ã£o previsÃ­vel. |
| D-12 â€” ordem real | Antecipar contratos de atribuiÃ§Ã£o; concluir CRM-007 antes do aceite integral de CRM-006 | O aceite de CRM-006 exige notificaÃ§Ã£o em tempo real. |

### 2.1 Respostas Ã s trÃªs perguntas do esboÃ§o

**Campos customizados:** sim, usar JSONB para os valores neste primeiro recorte. Remover a afirmaÃ§Ã£o â€œÃ© a abordagem mais performÃ¡ticaâ€. O desempenho depende das consultas, cardinalidade, tamanho e Ã­ndices; GIN e Ã­ndices por expressÃ£o atendem usos diferentes. Campos pesquisados/ordenados intensamente podem exigir projeÃ§Ãµes tipadas posteriormente. A escolha aqui Ã© de adequaÃ§Ã£o ao MVP, com mediÃ§Ã£o. [PostgreSQL â€” JSON e Ã­ndices](https://www.postgresql.org/docs/current/datatype-json.html).

**CSV:** usar 500 linhas/512 KiB como orÃ§amento inicial proposto, nÃ£o 1.000 linhas arbitrariamente. A prÃ©via e a confirmaÃ§Ã£o sÃ£o requisiÃ§Ãµes distintas, e a confirmaÃ§Ã£o grava o lote selecionado de forma atÃ´mica. Reduzir o limite se os testes nÃ£o cumprirem o orÃ§amento; aumentar somente com evidÃªncia. Um CSV de 512 KiB pode produzir JSON maior: impor tambÃ©m limite ao corpo HTTP final.

**PermissÃµes:** manter crm.contacts.read/create/update/delete/export; acrescentar crm.contacts.import e permissÃµes de campos conforme a seÃ§Ã£o 5. NÃ£o criar um crm.contacts.manage que apague a distinÃ§Ã£o entre cadastrar, alterar, excluir e exportar.

### 2.2 CorreÃ§Ãµes pontuais obrigatÃ³rias

- O backend de negÃ³cio Ã© **Fastify**. â€œFastAPIâ€ no esboÃ§o Ã© um engano; Python/FastAPI pertence ao contexto de IA do projeto.
- CRUD precisa incluir detalhe, atualizaÃ§Ã£o e polÃ­tica de remoÃ§Ã£o/arquivamento; o esboÃ§o sÃ³ enumera parte das rotas.
- RLS Ã© uma polÃ­tica aplicada no banco, nÃ£o uma propriedade obtida por escrever â€œforte RLSâ€ no repositÃ³rio.
- Parsing local de CSV serve para ajudar a pessoa. O servidor valida os bytes, o mapeamento e todas as linhas novamente.
- Filtros recebidos nÃ£o sÃ£o objetos Prisma nem SQL/JSONPath arbitrÃ¡rio.
- PermissÃ£o e tenant sÃ£o verificados na API mesmo que a Action tenha chamado getWorkspaceUser().
- NÃ£o salvar campos de autoridade recebidos pelo cliente: tenantId, createdByMembershipId, status interno de importaÃ§Ã£o, versÃ£o de polÃ­tica e autoria de mensagem.
- AtualizaÃ§Ã£o parcial precisa de semÃ¢ntica explÃ­cita: campo omitido mantÃ©m valor; remoÃ§Ã£o Ã© intencional; substituiÃ§Ã£o integral de JSON nÃ£o Ã© o padrÃ£o.

## 3. PreparaÃ§Ã£o e ordem das entregas

### 3.1 PreparaÃ§Ã£o P-01 â€” repositÃ³rio e evidÃªncias

- [ ] Conferir branch, commit e alteraÃ§Ãµes locais; criar branch de trabalho adequada sem reset/clean.
- [ ] Conferir as dependÃªncias declaradas de cada card e abrir suas evidÃªncias.
- [ ] Ler os guias da versÃ£o local de Next em node_modules/next/dist/docs, conforme apps/tenant-web/AGENTS.md.
- [ ] Registrar decisÃµes deste roteiro que forem adotadas, diferenÃ§as em relaÃ§Ã£o ao cÃ³digo e responsÃ¡veis pelos bloqueios.
- [ ] Confirmar o caminho real da API no proxy e o prefixo versionado antes de publicar contratos.
- [ ] Preparar somente dados sintÃ©ticos de pelo menos dois tenants e mÃºltiplos perfis.

### 3.2 PreparaÃ§Ã£o P-02 â€” banco e transaÃ§Ã£o

- [ ] Seguir packages/db/README.md e docs/architecture/database-reconciliation.md.
- [ ] Identificar o histÃ³rico do ambiente; inspecionar schema, constraints, Ã­ndices, roles e policies.
- [ ] Comparar as entidades novas de equipe com migrations efetivamente aplicadas.
- [ ] Usar um Ãºnico histÃ³rico de migration futura; nÃ£o executar Prisma e node-pg-migrate sobre o mesmo banco como tentativa de conserto.
- [ ] Reconciliar em ambiente isolado; nÃ£o editar SQL histÃ³rico jÃ¡ aplicado.
- [ ] Confirmar role de execuÃ§Ã£o sem superuser/BYPASSRLS/DDL e sem propriedade das tabelas.
- [ ] Validar withTenantTransaction com a versÃ£o real do Prisma, incluindo a chamada que define o contexto.
- [ ] Testar que contexto e query usam o mesmo cliente transacional e nÃ£o vazam pelo pool.

### 3.3 PreparaÃ§Ã£o P-03 â€” contexto e polÃ­ticas do CRM

Evoluir o caminho compartilhado de autorizaÃ§Ã£o antes de liberar registros setoriais:

1. Autenticar a sessÃ£o de tenant e vincular a sessÃ£o ao subject real.
2. Resolver Membership e Tenant atuais e ativos; reconciliar status novo e active legado.
3. Carregar concessÃµes globais, setoriais e diretas vÃ¡lidas, considerando expiraÃ§Ã£o e revogaÃ§Ã£o.
4. Preservar o setor da concessÃ£o: entrar tambÃ©m em Suporte nÃ£o amplia uma permissÃ£o recebida apenas em Vendas.
5. Representar concessÃµes por aÃ§Ã£o e escopo; invalidar revisÃµes conforme a mudanÃ§a.
6. Gerar predicados por recurso para leitura, contagem, alteraÃ§Ã£o e exclusÃ£o.
7. Testar a combinaÃ§Ã£o de escopos, a suspensÃ£o e a remoÃ§Ã£o de vÃ­nculo com o banco real.
8. Atualizar contratos e documentaÃ§Ã£o de compatibilidade. NÃ£o usar uma lista de strings como substituto dos escopos.
9. Auditar operaÃ§Ãµes com ator efetivo e, quando houver suporte/impersonaÃ§Ã£o, com ator original e finalidade. O CRM nÃ£o cria bypass novo por isSuperadmin.
10. Confirmar que uma sessÃ£o revogada Ã© negada tambÃ©m quando Redis estÃ¡ indisponÃ­vel ou foi atualizado fora de ordem.

Sem esse gate, pode-se preparar schema, componentes e contratos, mas nÃ£o entregar acesso setorial alegando que o isolamento dentro do tenant estÃ¡ pronto.

### 3.4 Ordem operacional recomendada

| Ordem | Entrega | CondiÃ§Ã£o para encerrar |
| --- | --- | --- |
| 0 | P-01 a P-03 | Base e caminho de autorizaÃ§Ã£o necessÃ¡rios comprovados. |
| 1 | CRM-001 | Contatos, campos, importaÃ§Ã£o limitada e isolamento completos. |
| 2 | CRM-002 | Tags e segmentos reais, com limites e filtros seguros. |
| 3 | CRM-003 | Pipeline, etapas e negÃ³cios persistentes. |
| 4 | CRM-004.A | Cards/lista; esta fatia ainda nÃ£o conclui o card inteiro. |
| 5 | CRM-005 | Conversas, notas internas e histÃ³rico por HTTP. |
| 6 | CRM-004.B | IntegraÃ§Ã£o das visualizaÃ§Ãµes com inbox; concluir CRM-004. |
| 7 | MSG-001 e MSG-002 | Outbox/relay/fila/dedupe reais, necessÃ¡rios Ã  entrega distribuÃ­da. |
| 8 | CRM-007 | Sockets, autorizaÃ§Ã£o, revogaÃ§Ã£o e recuperaÃ§Ã£o. |
| 9 | CRM-006 | AtribuiÃ§Ã£o completa e notificaÃ§Ã£o real, com TEAM-003 validado. |

Os contratos e colunas de atribuiÃ§Ã£o entram junto com Contact, Deal e Conversation. Isso permite construir policies e rooms antes da interface completa de atribuiÃ§Ã£o, sem inverter dependÃªncias.

~~~mermaid
flowchart TD
  P["PreparaÃ§Ã£o e autorizaÃ§Ã£o"] --> C1["CRM-001 Â· Contatos"]
  C1 --> C2["CRM-002 Â· Segmentos"]
  C1 --> C3["CRM-003 Â· NegÃ³cios"]
  C1 --> C5["CRM-005 Â· Conversas"]
  C3 --> C4["CRM-004 Â· VisualizaÃ§Ãµes"]
  C5 --> C4
  C5 --> M["MSG-001/002 Â· Eventos e filas"]
  M --> C7["CRM-007 Â· Realtime"]
  C7 --> C6["CRM-006 Â· AtribuiÃ§Ã£o completa"]
  C3 --> C6
  C5 --> C6
~~~

### 3.5 Ajustes propostos no taskboard

Aplicar apÃ³s conferir o checkout e registrar a decisÃ£o; este documento nÃ£o alterou o board:

- **CRM-004:** acrescentar CRM-005 para o aceite integral da integraÃ§Ã£o com inbox.
- **CRM-006:** acrescentar CRM-001, CRM-003, CRM-005, TEAM-002, TEAM-003 e CRM-007; preservar TEAM-001 e AUTH-016.
- **CRM-007:** acrescentar MSG-001 e MSG-002; preservar CRM-005 e AUTH-016.
- **CRM-005/007:** incluir 06-inbox nas Ã¡reas de cÃ³digo, alÃ©m das integraÃ§Ãµes necessÃ¡rias com 05-crm.
- **CRM-001:** incluir packages/db, packages/auth, packages/config e packages/events onde efetivamente alterados.
- NÃ£o tornar CRM-007 dependente de CRM-006 enquanto CRM-006 depende da entrega realtime.
- A persistÃªncia mÃ­nima da outbox pode ser preparada em CRM-001 como infraestrutura compartilhada; MSG-001 sÃ³ fica DONE com relay, dedupe e testes completos apÃ³s suas dependÃªncias.
- O CSV sÃ­ncrono de CRM-001 nÃ£o depende do worker. Background Ã© expansÃ£o posterior; nÃ£o remover critÃ©rios de durabilidade para antecipÃ¡-lo.
- Se uma dependÃªncia existente estiver declarada DONE mas o cenÃ¡rio necessÃ¡rio falhar, registrar o defeito/evidÃªncia e corrigir a fatia necessÃ¡ria; nÃ£o ignorar a falha nem reabrir todos os cards sem diagnÃ³stico.

## 4. Arquitetura e contratos transversais

### 4.1 Responsabilidade por camada

| Camada/caminho | Responsabilidade |
| --- | --- |
| apps/tenant-web/src/app | Rotas, composiÃ§Ã£o inicial, loading/error e metadados. |
| features/crm e features/inbox | FormulÃ¡rios, tabelas, fluxo, estado de interface e feedback. |
| Actions | SessÃ£o web, validaÃ§Ã£o de borda, chamada HTTP, tratamento seguro e invalidaÃ§Ã£o. |
| Loaders de servidor | Leituras pela API; nÃ£o usar Server Actions como mecanismo genÃ©rico de consultas. |
| src/lib/api-client.ts | Cliente HTTP server-only, tipado e restrito Ã  origem configurada. |
| API presentation | Rotas finas, schemas, autenticaÃ§Ã£o e encaminhamento ao caso de uso. |
| API application | Regras, autorizaÃ§Ã£o de recurso, transaÃ§Ãµes e coordenaÃ§Ã£o. |
| API domain | Invariantes de contatos, filtros, etapas, mensagens e atribuiÃ§Ãµes. |
| API infrastructure | RepositÃ³rios, adaptadores e persistÃªncia, sempre sob contexto confiÃ¡vel. |
| packages/contracts | Schemas e DTOs pÃºblicos; inferir tipos do schema. |
| packages/auth | Contexto e avaliaÃ§Ã£o de concessÃµes, sem importar runtime Next na API. |
| packages/db | Prisma, migrations e unidade de transaÃ§Ã£o. |
| packages/events | Envelope, outbox, dedupe e polÃ­tica transversal de entrega. |
| apps/worker | ExecuÃ§Ã£o de jobs; nÃ£o duplicar regras comerciais da API. |
| packages/ui | Componentes e tokens reutilizÃ¡veis; sem consultas ou autorizaÃ§Ã£o de negÃ³cio. |

O domÃ­nio de contatos/tags/segmentos/pipelines fica em **05-crm**. Conversas de atendimento e notas ficam em **06-inbox**. Jobs de envio/provedores ficam em **07-messaging**. AtribuiÃ§Ã£o compartilha contrato, mas cada domÃ­nio altera sua entidade por sua prÃ³pria API pÃºblica interna.

NÃ£o importar serviÃ§os privados de apps/api no tenant-web. API e worker tambÃ©m nÃ£o devem copiar validaÃ§Ãµes: quando existir consumidor real no worker de um caso de uso de CRM, extrair uma fronteira server-only compartilhada e registrÃ¡-la em ADR; o CSV sÃ­ncrono nÃ£o precisa dessa extraÃ§Ã£o agora.

Ao consumir Prisma/eventos diretamente na API, declarar @bipesend/db e @bipesend/events como dependÃªncias reais do pacote, quando necessÃ¡rios. O package.json atual de db aponta para src/index.ts: conferir exports ESM, build e execuÃ§Ã£o Node de produÃ§Ã£o; nÃ£o provar compatibilidade apenas com tsx em desenvolvimento. Ajustar a distribuiÃ§Ã£o server-only do pacote de forma compatÃ­vel com os consumidores existentes e testar o start compilado da API.

### 4.2 Ponte Next â†’ Fastify

Evoluir fetchApi existente:

- Aceitar somente caminhos relativos de rotas internas autorizadas, nunca URL livre vinda de formulÃ¡rio.
- Validar API_URL como configuraÃ§Ã£o server-only; fallback local somente em desenvolvimento.
- Encaminhar apenas o cookie de sessÃ£o necessÃ¡rio Ã  superfÃ­cie tenant, incluindo seu formato real/chunking se aplicÃ¡vel. NÃ£o encaminhar cookies de recuperaÃ§Ã£o ou da superfÃ­cie platform.
- Derivar o tenant selecionado da sessÃ£o/seleÃ§Ã£o validada da aplicaÃ§Ã£o; enviar como seletor explÃ­cito. A API resolve a membership novamente.
- Impedir que headers arbitrÃ¡rios de options substituam contexto de autenticaÃ§Ã£o.
- Usar timeout, cancelamento e redirect bloqueado para nÃ£o encaminhar credenciais a outro host.
- Consultas com dados pessoais: cache privado/sem cache compartilhado; qualquer cache futuro inclui tenant, vÃ­nculo, revisÃ£o de acesso e filtros.
- Respostas tipadas e erros normalizados; nÃ£o propagar exception.message, stack ou SQL para a UI.
- Retries automÃ¡ticos de mutaÃ§Ã£o somente quando houver contrato de idempotÃªncia.
- Content-Type depende do endpoint. Upload nÃ£o deve receber application/json por padrÃ£o quando for multipart.
- Validar CSRF/origem tambÃ©m na fronteira real da API autenticada por cookie; CORS sozinho nÃ£o Ã© prova de proteÃ§Ã£o.
- Rejeitar seletor de tenant conflitante entre parÃ¢metros/cabeÃ§alhos, em vez de escolher silenciosamente um deles.

Prefixo proposto para novos contratos: **/api/v1/tenants/:tenantId**. Os endpoints legados de equipe usam /tenants/:tenantId. Registrar a escolha e o proxy antes de implementar; nÃ£o duplicar /api/v1 no mount e na rota, nem renomear endpoints existentes por efeito colateral.

### 4.3 Forma comum de dados e concorrÃªncia

- UUIDs conforme o banco atual; nomes de coluna em snake_case.
- tenantId em toda entidade do cliente, inclusive tabelas de associaÃ§Ã£o, importaÃ§Ãµes e eventos.
- createdAt/updatedAt em UTC; datas civis usam YYYY-MM-DD sem conversÃ£o indevida de fuso.
- version inteiro para recursos mutÃ¡veis. PATCH e comandos concorrentes recebem expectedVersion.
- Atualizar com condiÃ§Ã£o de versÃ£o, tenant e escopo; zero linhas afetadas exige resposta segura, nunca sucesso fictÃ­cio.
- FKs compostas preservam tenant, e FKs de etapa tambÃ©m preservam pipeline. Prisma/schema deve refletir as relaÃ§Ãµes; SQL complementa o que nÃ£o expressar.
- Evitar associaÃ§Ã£o genÃ©rica resourceType/resourceId sem FK para a verdade principal da atribuiÃ§Ã£o.
- Queries, joins, contagens, autocompletes e relatÃ³rios obedecem ao mesmo predicado de autorizaÃ§Ã£o.
- TenantId do payload nÃ£o pode mover um registro para outra empresa.
- Eventos e auditoria da alteraÃ§Ã£o persistem na mesma transaÃ§Ã£o da entidade.
- NÃ£o misturar a transaÃ§Ã£o Prisma com uma transaÃ§Ã£o pg separada acreditando que haverÃ¡ atomicidade conjunta.

FKs compostas garantem pertenÃ§a estrutural; regras como â€œmembro estÃ¡ ativoâ€ exigem validaÃ§Ã£o transacional adicional. [PostgreSQL â€” constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

### 4.4 RLS e checagem de escopo

Habilitar ENABLE/FORCE RLS nas novas tabelas do tenant, definir USING/WITH CHECK e conferir privilÃ©gios da role real de execuÃ§Ã£o. Contexto ausente deve negar acesso. RLS por tenant complementa, mas nÃ£o implementa automaticamente, as restriÃ§Ãµes por setor/responsÃ¡vel. [PostgreSQL â€” row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

O serviÃ§o valida acesso antes da operaÃ§Ã£o e mantÃ©m uma leitura coerente de acesso durante a transaÃ§Ã£o. Definir ordenaÃ§Ã£o de locks/revisÃµes compartilhada com as operaÃ§Ãµes de revogaÃ§Ã£o. Uma operaÃ§Ã£o autorizada e uma revogaÃ§Ã£o concorrente precisam ter ordem de commit definida; operaÃ§Ãµes iniciadas apÃ³s revogaÃ§Ã£o confirmada nÃ£o podem usar concessÃµes antigas.

NÃ£o prometer retirar dados que jÃ¡ foram exibidos, copiados ou baixados. A revogaÃ§Ã£o impede novos acessos e novas entregas; nÃ£o apaga conhecimento jÃ¡ recebido.

## 5. PermissÃµes, escopos e visibilidade

### 5.1 CatÃ¡logo a reutilizar e ampliar

â€œNovaâ€ significa proposta que precisa entrar em contracts, policies, persistÃªncia/seed controlado de permissÃµes, matriz, testes e editor de cargos. NÃ£o Ã© uma string jÃ¡ implementada.

| Recurso | PermissÃµes | SituaÃ§Ã£o |
| --- | --- | --- |
| Contatos | crm.contacts.read/create/update/delete/export | Existentes. |
| ImportaÃ§Ã£o | crm.contacts.import | Nova; tambÃ©m exige create no destino. |
| Campos | crm.fields.read/manage | Novas; manage controla definiÃ§Ãµes, nÃ£o concede leitura de valores do contato. |
| Tags | crm.tags.read/manage/assign | Novas; atribuir tambÃ©m exige update do contato. |
| Segmentos | crm.segments.read/manage | Novas; consultar membros exige contacts.read. |
| Pipelines | crm.pipelines.read/manage | Novas. |
| NegÃ³cios | crm.deals.read/write | Existentes; write tem compatibilidade a migrar. |
| NegÃ³cios granulares | crm.deals.create/update/delete/move/assign | Novas; mapear compatibilidade explicitamente. |
| AtribuiÃ§Ã£o de contato | crm.contacts.assign | Nova; exige acesso ao contato e ao destino. |
| Assumir da fila | crm.contacts.claim, crm.deals.claim, inbox.conversations.claim | Novas; permitem assumir para o prÃ³prio vÃ­nculo elegÃ­vel, sem encaminhar a terceiros. |
| Conversas | inbox.conversations.read/reply/assign | Existentes; reply nÃ£o ativa canal externo por si. |
| Ciclo de conversa | inbox.conversations.create/update/resolve | Novas. |
| Nota interna | inbox.notes.create | Nova; leitura herda acesso autorizado Ã  conversa. |
| Chat entre equipe | chat.messages.read/send e chat.history.read | Existentes, reservadas ao domÃ­nio de comunicaÃ§Ã£o interna separado. |

O proprietÃ¡rio protegido recebe o conjunto que lhe compete por regra explÃ­cita. NÃ£o promover manager/agent a acesso global por adicionar uma nova chave ao enum. A matriz atual de tenant_admin usa todas as opÃ§Ãµes do enum: revisar esse efeito antes de acrescentar permissÃµes reservadas.

Cada sufixo separado por barra na tabela representa uma chave distinta; nÃ£o persistir a expressÃ£o abreviada. No fluxo do painel, create/import exigem tambÃ©m read no registro de destino; update/delete/assign/move exigem read do recurso afetado. Registrar dependÃªncias explÃ­citas sem ampliar o escopo da leitura ou escrita. Para definiÃ§Ãµes de campo, tags e pipelines sem proprietÃ¡rio/setor prÃ³prio, operaÃ§Ãµes de gestÃ£o usam escopo TENANT; nÃ£o aceitar OWN/ASSIGNED fictÃ­cios sobre entidades sem esses atributos. Segmentos privados conservam sua polÃ­tica especÃ­fica de proprietÃ¡rio/visibilidade.

Para crm.deals.write, inventariar consumidores e mapear somente create/update/move dentro do mesmo escopo legado, se essa for a semÃ¢ntica confirmada. NÃ£o mapear automaticamente delete, assign, export ou gerÃªncia de pipeline. NÃ£o retirar a chave antiga atÃ© migrar consumidores e concessÃµes.

### 5.2 Escopos operacionais

| Escopo | Predicado do recurso |
| --- | --- |
| TENANT | Recursos da empresa, respeitando estados e outras restriÃ§Ãµes da operaÃ§Ã£o. |
| DEPARTMENT | departmentId pertence aos setores explicitamente cobertos pela concessÃ£o vÃ¡lida para aquela aÃ§Ã£o. |
| OWN | createdByMembershipId corresponde ao vÃ­nculo atual que criou o registro naquele tenant. |
| ASSIGNED | assignedMembershipId corresponde ao vÃ­nculo atual ativo. |

OWN representa autoria, alinhado Ã  regra vigente. Alterar responsÃ¡vel nÃ£o muda criador. OperaÃ§Ãµes de sistema devem registrar autoria/finalidade prÃ³pria; nÃ£o inventar membro humano para satisfazer schema.

**Exemplo obrigatÃ³rio de teste:** Ana lÃª contatos no tenant inteiro e edita somente em Vendas. Ela pode abrir um contato do Suporte, mas nÃ£o alterÃ¡-lo. Um filtro â€œtodos os contatosâ€ nÃ£o amplia sua permissÃ£o de ediÃ§Ã£o.

A soma Ã© de concessÃµes completas. NÃ£o unir separadamente â€œtodas as aÃ§Ãµesâ€ e â€œtodos os escoposâ€, pois isso cria combinaÃ§Ãµes que nunca foram concedidas.

### 5.3 RelaÃ§Ãµes e metadados

- Ver um negÃ³cio nÃ£o concede automaticamente acesso integral ao contato vinculado.
- Para o MVP, retornos que incluem contato exigem tambÃ©m contacts.read sobre esse contato; omitir relaÃ§Ãµes/contagens nÃ£o autorizadas.
- Conversa vinculada a contato exige autorizaÃ§Ã£o da conversa e do contato. Se produto precisar permitir atendimento sem abrir cadastro, criar DTO mÃ­nimo e regra explÃ­cita em entrega futura.
- CatÃ¡logo mÃ­nimo de campos para formulÃ¡rio/lista Ã© acessÃ­vel com crm.fields.read junto Ã  operaÃ§Ã£o autorizada de contato; nÃ£o conceder manage para preencher um valor.
- Campos customizados do MVP compartilham a polÃ­tica do contato. NÃ£o anunciar sigilo por campo ou armazenar segredos neles.
- Autocomplete de setor/cargo/membro retorna candidatos elegÃ­veis mÃ­nimos; nÃ£o expÃµe todo o cadastro de equipe ou dados globais de User.
- AusÃªncia de permissÃ£o Ã© distinta de lista vazia. Um ID vÃ¡lido fora do escopo retorna NOT_FOUND genÃ©rico, sem identificar o tenant proprietÃ¡rio.
- ExportaÃ§Ã£o e aÃ§Ãµes em massa reavaliam o conjunto autorizado no servidor. SeleÃ§Ã£o no navegador nÃ£o Ã© autorizaÃ§Ã£o.

## 6. ConvenÃ§Ãµes de produto e limites iniciais

### 6.1 Entidades que nÃ£o podem ser confundidas

| Entidade | Significado | NÃ£o produz automaticamente |
| --- | --- | --- |
| User | Identidade de login | Acesso a todos os tenants. |
| Membership | VÃ­nculo operacional em um tenant | Cadastro de cliente CRM. |
| Contact | Pessoa ou organizaÃ§Ã£o atendida | UsuÃ¡rio, senha, convite ou consentimento de marketing. |
| Deal | Oportunidade comercial | Novo contato ou nova conversa. |
| Conversation | Atendimento relacionado a um contato | Chat entre funcionÃ¡rios ou canal conectado. |
| Internal note | AnotaÃ§Ã£o visÃ­vel a membros autorizados da conversa | Envio ao cliente. |
| Department | Setor operacional | Autoridade implÃ­cita sobre qualquer recurso da empresa. |
| Routing role | Cargo elegÃ­vel para a fila | PermissÃ£o adicional. |

### 6.2 Limites propostos, configurados no servidor

| Item | Limite inicial |
| --- | --- |
| PÃ¡gina comum | 25 por padrÃ£o; mÃ¡ximo 100, conforme contrato existente. |
| CSV sÃ­ncrono | AtÃ© 500 linhas de dados, 512 KiB de arquivo, 60 colunas. |
| Corpo total da Action/endpoint de prÃ©via | AtÃ© 768 KiB medidos; overhead incluÃ­do e configuraÃ§Ã£o compatÃ­vel na cadeia. |
| Campos ativos por tenant | Teto tÃ©cnico inicial 50; entitlement pode ser menor. |
| Outros tetos tÃ©cnicos por tenant | 100 mil contatos ativos, 500 tags ativas, 100 segmentos, 20 pipelines e 30 etapas por pipeline; propostas para ensaio, sujeitas a capacidade/entitlement menor. |
| Valor de texto customizado | AtÃ© 2.000 caracteres; JSON de valores atÃ© 32 KiB por contato. |
| Nome do contato | AtÃ© 255 caracteres. |
| E-mail | AtÃ© 254 caracteres, seguindo contrato canÃ´nico. |
| Filtro de segmento | AtÃ© 20 condiÃ§Ãµes, profundidade 3, listas de atÃ© 100 valores. |
| Texto de nota interna | AtÃ© 10.000 caracteres e limite de bytes separado. |
| PrÃ©via de importaÃ§Ã£o | Dados temporÃ¡rios por atÃ© 24 horas. |
| Metadados de importaÃ§Ã£o/idempotÃªncia | Janela inicial 30 dias, sem manter o CSV bruto. |
| Realtime | Limites de conexÃµes, rooms e mensagens configurados antes da ativaÃ§Ã£o. |

SÃ£o limites de projeto para ensaio, nÃ£o capacidades medidas nem preÃ§os de planos. Uma camada de entitlements deve calcular o menor valor entre limite tÃ©cnico e plano vigente. Onde billing ainda nÃ£o existir, usar configuraÃ§Ã£o de capacidade explÃ­cita com testes; nÃ£o inventar planos comerciais.

Consumo de quota Ã© transacional: serializar a criaÃ§Ã£o/reativaÃ§Ã£o pelo registro de quota ou lock do tenant/recurso, verificar a capacidade atual e persistir consumo junto ao efeito. NÃ£o usar â€œcontar e depois inserirâ€ em conexÃµes independentes. Arquivar/restaurar tem regra de consumo documentada, sem permitir ciclos de restauraÃ§Ã£o que ultrapassem o limite. Quota de contatos nÃ£o limita a leitura de uma base jÃ¡ acima do teto apÃ³s downgrade.

O limite padrÃ£o documentado de Server Actions Ã© 1 MB e inclui overhead. A versÃ£o instalada e o proxy devem ser conferidos; nÃ£o aumentar o limite global apenas para aceitar arrays grandes. [Next.js â€” bodySizeLimit](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions).

### 6.3 NormalizaÃ§Ã£o, repetiÃ§Ã£o e duplicidade

**Login:** manter a unicidade global de e-mail normalizado da identidade, conforme o contrato de autenticaÃ§Ã£o.

**CRM:** e-mail/telefone nÃ£o identificam globalmente uma pessoa. O mesmo e-mail pode existir em tenants distintos e pode representar contatos comerciais diferentes no mesmo tenant. A decisÃ£o recomendada Ã©:

1. Guardar valor de exibiÃ§Ã£o e valor normalizado para busca.
2. Normalizar e-mail com trim/lowercase conforme contrato; nÃ£o remover pontos ou sufixos â€œ+â€.
3. Normalizar telefone para E.164 apenas quando paÃ­s e nÃºmero forem vÃ¡lidos. Solicitar paÃ­s na importaÃ§Ã£o quando necessÃ¡rio; nÃ£o transformar todo nÃºmero em brasileiro silenciosamente.
4. Criar Ã­ndices nÃ£o Ãºnicos de tenant + emailNormalized/phoneE164.
5. Exibir candidatos a duplicidade somente dentro do escopo de leitura do ator.
6. Na criaÃ§Ã£o manual, a pessoa revisa candidatos visÃ­veis e confirma â€œCriar contato separadoâ€ se for intencional. NÃ£o escolher um contato arbitrÃ¡rio.
7. Na importaÃ§Ã£o inicial, ignorar candidatos visÃ­veis por padrÃ£o e nunca atualizar/mesclar registros automaticamente.
8. NÃ£o mostrar contagem ou identificaÃ§Ã£o de correspondÃªncias fora do escopo. Informar que a revisÃ£o cobre os registros acessÃ­veis.
9. IdempotÃªncia evita repetir a mesma operaÃ§Ã£o tÃ©cnica. NÃ£o promete impedir dois operadores de cadastrarem a mesma pessoa em operaÃ§Ãµes independentes.
10. Uma polÃ­tica futura de identificadores exclusivos por tenant exigirÃ¡ decisÃ£o explÃ­cita, anÃ¡lise de telefones/e-mails compartilhados e migraÃ§Ã£o de conflitos.



## 7. CRM-001 â€” contatos, campos customizados e importaÃ§Ã£o

### 7.1 Resultado esperado

A pessoa autorizada consegue cadastrar, consultar, pesquisar, editar e arquivar contatos reais do tenant; definir campos adicionais; importar um CSV pequeno com revisÃ£o; recuperar-se de erro de rede sem duplicar o lote. O contato jÃ¡ nasce com autoria, contexto e versÃ£o para suportar os prÃ³ximos cards.

### 7.2 Modelo de Contact

| Campo lÃ³gico | Tipo / regra |
| --- | --- |
| id, tenantId | UUID; tenant derivado do contexto. |
| name | Texto atÃ© 255; manual exige nome nÃ£o vazio. ImportaÃ§Ã£o aceita ausÃªncia de nome somente com identificador vÃ¡lido, sem inventar nome fictÃ­cio. |
| email, emailNormalized | Opcionais; pares coerentes; vazio vira ausÃªncia. |
| phone, phoneE164, phoneCountry | Opcionais; valor original limitado e normalizaÃ§Ã£o validada; paÃ­s de interpretaÃ§Ã£o explÃ­cito. |
| source | Enum inicial manual ou csv_import; integraÃ§Ãµes futuras ampliam o contrato. |
| customFields | JSONB obrigatÃ³rio, default objeto vazio; somente valores de definiÃ§Ãµes conhecidas. |
| departmentId | Opcional; setor responsÃ¡vel, FK do mesmo tenant. |
| routingRoleId | Opcional; preparado para CRM-006, sem conceder acesso. |
| assignedMembershipId | Opcional; responsÃ¡vel atual, FK do mesmo tenant. |
| createdByMembershipId | Autoria do cadastro; imutÃ¡vel em operaÃ§Ãµes comuns. |
| updatedByMembershipId | Ãšltimo ator da alteraÃ§Ã£o. |
| status, archivedAt | active ou archived; arquivar preserva histÃ³rico e relaÃ§Ãµes. |
| version | Inteiro crescente, comeÃ§ando em 1. |
| createdAt, updatedAt | Instantes UTC. |

Invariantes:

- Exigir ao menos nome, e-mail vÃ¡lido ou telefone vÃ¡lido para nÃ£o produzir registros vazios.
- Payload de criaÃ§Ã£o nÃ£o aceita autoria, source de provider, tenant ou status arbitrÃ¡rios.
- CriaÃ§Ã£o manual/importaÃ§Ã£o sem atribuiÃ§Ã£o avanÃ§ada pode usar setor autorizado e atribuiÃ§Ã£o ao prÃ³prio ator. Atribuir a outra pessoa/cargo exige a operaÃ§Ã£o especÃ­fica.
- Registros sem departmentId sÃ³ entram no alcance de TENANT, OWN ou ASSIGNED aplicÃ¡vel; nÃ£o sÃ£o automaticamente visÃ­veis para todos os setores.
- Manter autoria mesmo apÃ³s saÃ­da do colaborador; remoÃ§Ã£o comum de membro Ã© revogaÃ§Ã£o do vÃ­nculo, nÃ£o cascade de contatos.
- NÃ£o permitir que PATCH altere departmentId/routingRoleId/assignedMembershipId por fora do serviÃ§o de atribuiÃ§Ã£o.
- No SQL, restringir customFields a objeto JSONB e estados ao catÃ¡logo vÃ¡lido. ValidaÃ§Ã£o dinÃ¢mica contra definiÃ§Ãµes continua no serviÃ§o; CHECK de JSON nÃ£o substitui essa validaÃ§Ã£o.

Ãndices iniciais: tenant + status + createdAt + id; tenant + emailNormalized; tenant + phoneE164; tenant + departmentId + status + id; tenant + assignedMembershipId + status + id; tenant + createdByMembershipId + id. Avaliar busca por nome com dados sintÃ©ticos; nÃ£o criar um Ã­ndice por campo possÃ­vel sem uso demonstrado.

### 7.3 Modelo de CustomField

| Campo lÃ³gico | Tipo / regra |
| --- | --- |
| id, tenantId | UUID; definiÃ§Ã£o pertence Ã  empresa. |
| entityType | Enum; somente contact habilitado neste card. |
| key | Identificador estÃ¡vel, minÃºsculo, atÃ© 50 caracteres; regex controlada. |
| label | Texto visÃ­vel, atÃ© 100 caracteres. |
| description | Ajuda opcional, atÃ© 500 caracteres; texto simples. |
| type | text, number, date, boolean, single_select ou multi_select. |
| options | Schema de opÃ§Ãµes com IDs estÃ¡veis, labels e estado; somente para selects. |
| validation | Objeto validado por tipo: comprimento, faixa, escala ou quantidade. Sem cÃ³digo/expressÃµes executÃ¡veis. |
| required | Booleano, default false; polÃ­tica de aplicaÃ§Ã£o descrita abaixo. |
| status | active ou archived. |
| sortOrder | Ordem determinÃ­stica de apresentaÃ§Ã£o. |
| version | RevisÃ£o da definiÃ§Ã£o; muda em alteraÃ§Ãµes relevantes. |
| createdByMembershipId, updatedByMembershipId | Atoria controlada pelo servidor. |
| createdAt, updatedAt, archivedAt | Timestamps. |

Constraints e comportamento:

1. Unicidade de tenantId + entityType + key. Reservar key mesmo depois do arquivamento.
2. Proibir colisÃ£o com campos nativos e chaves perigosas como __proto__, prototype e constructor.
3. A chave Ã© imutÃ¡vel. ApÃ³s uso, o tipo tambÃ©m Ã© imutÃ¡vel; conversÃ£o exige nova definiÃ§Ã£o e migraÃ§Ã£o explÃ­cita.
4. IDs das opÃ§Ãµes permanecem estÃ¡veis quando o label muda.
5. Arquivar opÃ§Ã£o impede novos usos, mas preserva valores histÃ³ricos. NÃ£o reutilizar ID com outro significado.
6. AtualizaÃ§Ãµes de definiÃ§Ãµes incrementam versÃ£o; imports e formulÃ¡rios antigos recebem conflito acionÃ¡vel.
7. required vale para novos contatos e para salvamento integral no editor. PATCH de um campo nÃ£o relacionado nÃ£o obriga saneamento retroativo de toda a base.
8. Antes de ativar required, mostrar impacto autorizado; nÃ£o preencher valores antigos com um default fictÃ­cio.
9. Arquivar campo tira-o dos novos formulÃ¡rios. Valores existentes ficam disponÃ­veis no histÃ³rico/detalhe autorizado atÃ© a polÃ­tica de descarte.
10. Antes de arquivar campo usado por segmento/regra, informar dependÃªncias e exigir remoÃ§Ã£o explÃ­cita dessas referÃªncias.
11. Sem unicidade global de valor customizado, upload como campo, fÃ³rmula, HTML ou relacionamento arbitrÃ¡rio no MVP.
12. Todo novo tipo precisa de contrato, renderizador, validaÃ§Ã£o, filtros e importaÃ§Ã£o compatÃ­veis; nÃ£o cadastrar um tipo que a interface nÃ£o sabe tratar.

### 7.4 RepresentaÃ§Ã£o dos valores

DecisÃ£o para este recorte: usar key imutÃ¡vel da definiÃ§Ã£o como chave do objeto JSONB.

~~~json
{
  "origem_detalhada": "IndicaÃ§Ã£o",
  "numero_unidades": 12,
  "data_primeiro_contato": "2026-09-15",
  "aceita_reuniao": false,
  "perfil": "empresa",
  "interesses": ["crm", "atendimento"]
}
~~~

Os IDs de opÃ§Ãµes acima sÃ£o ilustrativos; a implementaÃ§Ã£o usa IDs estÃ¡veis validados contra a definiÃ§Ã£o do tenant.

- text: string limitada, texto simples.
- number: nÃºmero finito com faixa/escala limitada; nÃ£o usar esse tipo para dinheiro ou identificadores que exigem precisÃ£o arbitrÃ¡ria.
- Limite inicial de number: magnitude atÃ© 1 trilhÃ£o e escala atÃ© 6 casas, validando conversÃ£o; inteiros devem ser seguros para o runtime. NÃ£o converter um identificador longo para nÃºmero.
- date: data civil vÃ¡lida YYYY-MM-DD, sem aceitar datas impossÃ­veis.
- boolean: boolean real; false nÃ£o equivale a campo ausente.
- single_select: um ID ativo da definiÃ§Ã£o.
- multi_select: array sem repetiÃ§Ãµes, limitado, com IDs vÃ¡lidos.
- AusÃªncia: chave nÃ£o existe. O contrato de PATCH usa uma lista explÃ­cita de remoÃ§Ãµes; nÃ£o espalhar JSON null e SQL NULL com significados distintos.
- AtualizaÃ§Ã£o: customFieldChanges.set e customFieldChanges.unset; os mesmos campos nÃ£o podem aparecer nas duas listas.
- O servidor valida o objeto resultante e aplica o patch com controle de versÃ£o, preservando chaves nÃ£o alteradas.

NÃ£o aceitar um record de z.unknown sem refinamento pelas definiÃ§Ãµes reais do tenant. Limitar quantidade de chaves, tamanho total e estrutura de cada valor.

### 7.5 ImportaÃ§Ã£o â€” prÃ©via e confirmaÃ§Ã£o

**Formato inicial:** CSV UTF-8, com ou sem BOM. Separador vÃ­rgula ou ponto e vÃ­rgula, detectado e confirmado. CabeÃ§alhos, aspas, quebras de linha dentro de campos e CRLF devem ser tratados por parser confiÃ¡vel. NÃ£o usar split por vÃ­rgula/quebra de linha.

Transporte decidido para a prÃ©via: multipart/form-data com um arquivo e metadados limitados. A Action encaminha ao endpoint Fastify com boundary correto, sem converter todas as linhas em array JSON no navegador. Adicionar e configurar parser multipart compatÃ­vel com a versÃ£o instalada, incluindo limites do corpo, arquivo, partes e campos. O CSV-modelo e a prÃ©via usam o mesmo contrato de colunas. Limitar tambÃ©m os dados normalizados temporÃ¡rios do batch a 2 MiB para controlar a expansÃ£o causada pelas chaves JSON repetidas.

Fluxo:

1. **Selecionar arquivo:** mostrar limites e link para um CSV-modelo sem dados reais.
2. **Mapear colunas:** nome, e-mail, telefone e campos existentes; permitir ignorar colunas. NÃ£o criar campo automaticamente a partir do cabeÃ§alho.
3. **Definir interpretaÃ§Ã£o:** paÃ­s dos telefones, formato de data e separador decimal quando necessÃ¡rio. ConversÃµes ambÃ­guas exigem correÃ§Ã£o, nÃ£o adivinhaÃ§Ã£o.
4. **Enviar para prÃ©via:** Action recebe arquivo limitado e metadados; API faz parsing autoritativo. Parsing local Ã© opcional para sugerir mapeamento.
5. **Validar:** esquema, autorizaÃ§Ã£o de criaÃ§Ã£o/destino, definiÃ§Ãµes de campo, limites de plano, duplicatas no prÃ³prio CSV e candidatos acessÃ­veis no CRM.
6. **Mostrar revisÃ£o:** linhas vÃ¡lidas, invÃ¡lidas e ignoradas, com nÃºmero de registro e motivo seguro. Linha lÃ³gica de CSV pode ocupar mais de uma linha fÃ­sica.
7. **Selecionar o lote:** por padrÃ£o, linhas invÃ¡lidas e candidatas a duplicata ficam fora. A pessoa confirma explicitamente a quantidade selecionada.
8. **Confirmar:** enviar batchId, versÃ£o/hash da prÃ©via, seleÃ§Ã£o de linhas previamente validadas e chave de idempotÃªncia. NÃ£o reenviar um array livre que substitui a prÃ©via.
9. **Revalidar no servidor:** sessÃ£o, vÃ­nculo, concessÃµes, destino, quota, definiÃ§Ãµes e dados selecionados.
10. **Transacionar:** lock da importaÃ§Ã£o; gravar todos os contatos selecionados, autoria, eventos e resumo de auditoria na mesma transaÃ§Ã£o.
11. **Retornar resumo:** criados, ignorados na revisÃ£o e IDs autorizados necessÃ¡rios. O resultado deve bater com o lote confirmado.
12. **Recuperar rede perdida:** consultar o batch antes de tentar novamente. A mesma confirmaÃ§Ã£o nÃ£o pode cadastrar uma segunda cÃ³pia.

**Atomicidade:** todas as linhas selecionadas sÃ£o gravadas ou nenhuma. â€œImportar somente vÃ¡lidasâ€ Ã© uma decisÃ£o anterior Ã  escrita, exibida na prÃ©via. NÃ£o confundir isso com gravar metade e falhar silenciosamente.

**ConcorrÃªncia:** durante o commit, reavaliar candidatos visÃ­veis surgidos desde a prÃ©via. Se a revisÃ£o mudou, retornar conflito e pedir nova prÃ©via; nÃ£o mesclar ou atualizar automaticamente. OperaÃ§Ãµes independentes continuam sujeitas Ã  polÃ­tica de duplicidade assistida da seÃ§Ã£o 6.3.

**Tempo:** fazer parsing e trabalho pesado de validaÃ§Ã£o antes da transaÃ§Ã£o. Dentro dela, repetir as verificaÃ§Ãµes mutÃ¡veis necessÃ¡rias e usar escrita em lote. A transaÃ§Ã£o deve caber no timeout vigente; nÃ£o aumentar o timeout global para mascarar loops N+1.

### 7.6 PersistÃªncia de ContactImportBatch

| Campo | FunÃ§Ã£o |
| --- | --- |
| id, tenantId, createdByMembershipId | Vincular a prÃ©via ao tenant e ator. |
| status | preview_ready, preview_invalid, committed, cancelled ou expired. |
| requestKey, payloadHash | IdempotÃªncia de criaÃ§Ã£o da prÃ©via no escopo do ator/operaÃ§Ã£o. |
| mapping, parseOptions | Objetos limitados e validados. |
| definitionSnapshot | IDs/keys/versÃµes necessÃ¡rios Ã  revisÃ£o. |
| stagedRows, rowIssues | Dados temporÃ¡rios mÃ­nimos; protegidos por RLS, tamanho e TTL. |
| selectionHash, confirmationKey | Fixam a seleÃ§Ã£o efetivamente confirmada. |
| totalRows, selectedRows, createdCount, skippedCount | Contagens reais. |
| resultReferences | ReferÃªncias mÃ­nimas; cada leitura ainda autoriza os contatos atuais. |
| version, createdAt, expiresAt, committedAt | ConcorrÃªncia e expiraÃ§Ã£o. |

Constraints: unicidade de tenant + ator + operaÃ§Ã£o + requestKey; mesma chave com payload diferente falha. SÃ³ o autor autorizado consulta/confirma sua prÃ©via no MVP. Administrador nÃ£o recebe o CSV bruto por herdar permissÃ£o genÃ©rica.

ApÃ³s commit/cancelamento, remover stagedRows assim que nÃ£o forem necessÃ¡rias Ã  recuperaÃ§Ã£o; em qualquer caso, expiram em atÃ© 24 horas. Metadados minimizados permanecem por 30 dias. Implementar rotina idempotente de limpeza, acionÃ¡vel por agendador da infraestrutura, e testar sua execuÃ§Ã£o; TTL no cÃ³digo de leitura nÃ£o remove dados do banco.

Se o commit falhar, contatos/eventos/auditoria de sucesso nÃ£o persistem; a prÃ©via pode continuar utilizÃ¡vel dentro do prazo. NÃ£o registrar estado committed fora da transaÃ§Ã£o.

Cancelar antes da confirmaÃ§Ã£o encerra a prÃ©via. Fechar a tela ou abortar a conexÃ£o durante o commit nÃ£o prova cancelamento: ao retornar, consultar o resultado.

### 7.7 SeguranÃ§a de CSV

- Rejeitar arquivo acima dos limites, encoding invÃ¡lido, cabeÃ§alho duplicado/ambÃ­guo e linhas/cÃ©lulas excessivas.
- NÃ£o aceitar planilha XLSX, ZIP ou binÃ¡rio disfarÃ§ado como CSV neste endpoint.
- Texto de cÃ©lula nÃ£o Ã© HTML, fÃ³rmula executÃ¡vel, template ou comando.
- NÃ£o remover indiscriminadamente â€œ+â€ de telefones ou â€œ-â€ de nÃºmeros vÃ¡lidos.
- Proteger qualquer CSV de saÃ­da, inclusive relatÃ³rio de erros, contra interpretaÃ§Ã£o de fÃ³rmulas. Aspas simples de CSV nÃ£o bastam; tratar delimitadores, aspas, controles e prefixos perigosos na serializaÃ§Ã£o.
- Preferir relatÃ³rio de erros JSON no primeiro recorte; exportaÃ§Ã£o CSV posterior precisa de testes nos leitores suportados.
- A seguranÃ§a apÃ³s uma pessoa editar e salvar novamente em outra planilha tem limites: nÃ£o prometer neutralizaÃ§Ã£o permanente de conteÃºdo.
- Nenhum conteÃºdo do arquivo em log, analytics, traces ou fila.

A ameaÃ§a de CSV injection aparece quando uma planilha interpreta cÃ©lulas como fÃ³rmulas; o parser de importaÃ§Ã£o nÃ£o deve executÃ¡-las, e a proteÃ§Ã£o de saÃ­da precisa ser especÃ­fica. [OWASP â€” CSV injection](https://community.owasp.org/attacks/CSV_Injection).

### 7.8 Rotas e contratos

Prefixo desta tabela: /api/v1/tenants/:tenantId.

| MÃ©todo e rota | Entrada/resultado essencial |
| --- | --- |
| GET /crm/contacts | Busca, filtros allowlisted, sort, cursor; retorna data e nextCursor. |
| POST /crm/contacts | CreateContact; 201 com DTO autorizado e version. |
| GET /crm/contacts/:contactId | Detalhe e campos autorizados; 404 fora do escopo. |
| PATCH /crm/contacts/:contactId | UpdateContact + expectedVersion; sem atribuiÃ§Ã£o por campos soltos. |
| DELETE /crm/contacts/:contactId | Arquivamento lÃ³gico documentado; UI chama a aÃ§Ã£o de â€œArquivarâ€. |
| POST /crm/contacts/:contactId/restore | RestauraÃ§Ã£o autorizada, com versÃ£o e validaÃ§Ã£o de dependÃªncias. |
| GET /crm/fields | DefiniÃ§Ãµes permitidas para uso; gestÃ£o exige permissÃ£o adicional. |
| POST /crm/fields | Criar definiÃ§Ã£o tipada. |
| PATCH /crm/fields/:fieldId | Editar metadados permitidos com versÃ£o. |
| POST /crm/fields/:fieldId/archive | Arquivar apÃ³s conferir dependÃªncias. |
| POST /crm/contact-imports/preview | CSV limitado + mapeamento; retorna batch e resumo paginado. |
| GET /crm/contact-imports/:batchId | Estado e resultado autorizado. |
| GET /crm/contact-imports/:batchId/rows | PrÃ©via/erros paginados do autor; nÃ£o retornar 500 linhas sem necessidade. |
| POST /crm/contact-imports/:batchId/commit | Confirma seleÃ§Ã£o e grava de forma sÃ­ncrona/idempotente. |
| POST /crm/contact-imports/:batchId/cancel | Descarta prÃ©via ainda nÃ£o confirmada. |

Arquivar exige contacts.delete e leitura do recurso. Restaurar exige contacts.delete + contacts.update; nÃ£o pressupor que permissÃ£o de editar permite recuperar registro excluÃ­do. Antes de arquivar contato com negÃ³cio aberto ou conversa aberta, retornar dependÃªncias e exigir tratamento explÃ­cito; nÃ£o arquivar em cascata silenciosamente.

ExportaÃ§Ã£o de base completa, fusÃ£o de contatos e expurgo definitivo sÃ£o expansÃµes. O botÃ£o de exportar da prÃ©via existente nÃ£o deve parecer operacional sem uma entrega real.

### 7.9 Passos de implementaÃ§Ã£o e arquivos

**CRM-001.A â€” contratos e persistÃªncia**

- [ ] Criar arquivos temÃ¡ticos em packages/contracts/src/crm para contatos, campos, importaÃ§Ã£o e filtros; exportar pelo ponto pÃºblico existente.
- [ ] Criar migration de Contact/CustomField/ContactImportBatch, Ã­ndices, FKs compostas e RLS.
- [ ] Preparar campos comuns de autoria/atribuiÃ§Ã£o; nÃ£o duplicar entidades de equipe.
- [ ] Preparar persistÃªncia mÃ­nima de outbox reutilizÃ¡vel conforme seÃ§Ã£o 14.
- [ ] Definir DTOs de lista e detalhe, com projeÃ§Ã£o mÃ­nima e serializaÃ§Ã£o explÃ­cita.

**CRM-001.B â€” serviÃ§o e API**

- [ ] Criar contact.service.ts, custom-field.service.ts e contact-import.service.ts em application.
- [ ] Criar validadores de campo, normalizaÃ§Ã£o e duplicidade assistida em domain.
- [ ] Criar repositÃ³rios que recebam cliente transacional/contexto; proibir Prisma global dentro da transaÃ§Ã£o.
- [ ] Criar controllers separados por responsabilidade em presentation e registrÃ¡-los no bootstrap.
- [ ] Implementar CRUD com auth, escopo, versÃ£o, erros e auditoria.
- [ ] Demonstrar criar/consultar contato real pela API antes de compor toda a interface.

**CRM-001.C â€” experiÃªncia**

- [ ] Criar /contacts como rota canÃ´nica e /contacts/:id para detalhe.
- [ ] Redirecionar /users para /contacts, preservando apenas parÃ¢metros seguros; atualizar navegaÃ§Ã£o desktop/mobile.
- [ ] Manter /crm para negÃ³cios, evitando duas telas canÃ´nicas de contatos.
- [ ] Criar /settings/crm/fields.
- [ ] Compor DataTable, formulÃ¡rio, seÃ§Ã£o de campos e wizard de importaÃ§Ã£o em features/crm.
- [ ] Actions chamam API; loaders fazem leituras; erro nÃ£o apaga formulÃ¡rio.
- [ ] Implementar leitura sem ediÃ§Ã£o, rÃ³tulos, mensagens de conflito e estados reais.

**CRM-001.D â€” importaÃ§Ã£o e fechamento**

- [ ] Implementar prÃ©via/commit/expiraÃ§Ã£o/idempotÃªncia.
- [ ] Testar limites reais no proxy, Next e Fastify.
- [ ] Implementar purga dos dados temporÃ¡rios.
- [ ] Executar os casos abaixo e registrar latÃªncia/memÃ³ria sem PII.
- [ ] Remover mocks da rota entregue; atualizar documentaÃ§Ã£o e taskboard.

### 7.10 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C1-01 | Criar, consultar, editar, arquivar e restaurar respeita permissÃµes e dependÃªncias. |
| C1-02 | UUID de outro tenant ou contato fora do escopo nÃ£o retorna dados nem aceita mutaÃ§Ã£o. |
| C1-03 | Campo de outro tenant, chave desconhecida, tipo invÃ¡lido ou opÃ§Ã£o arquivada Ã© rejeitado. |
| C1-04 | PATCH preserva campos nÃ£o alterados; false, zero e ausÃªncia nÃ£o sÃ£o confundidos. |
| C1-05 | AtualizaÃ§Ã£o concorrente com versÃ£o antiga falha sem sobrescrever a alteraÃ§Ã£o anterior. |
| C1-06 | CSV trata BOM, separador, aspas, quebra interna, cabeÃ§alho invÃ¡lido e formatos ambÃ­guos. |
| C1-07 | Limites de linhas/bytes/colunas e quotas sÃ£o aplicados no servidor. |
| C1-08 | PrÃ©via expirada, de outro membro ou adulterada nÃ£o pode ser confirmada. |
| C1-09 | ConfirmaÃ§Ã£o repetida/rede perdida nÃ£o duplica lote; payload diferente com a mesma chave falha. |
| C1-10 | Falha na Ãºltima linha reverte todo o lote selecionado, seus eventos e auditoria de sucesso. |
| C1-11 | Perda de permissÃ£o, setor ou campo entre prÃ©via e commit impede gravaÃ§Ã£o indevida. |
| C1-12 | CriaÃ§Ã£o/importaÃ§Ã£o de Contact nÃ£o cria User/Membership, nÃ£o envia convite e nÃ£o registra opt-in. |
| C1-13 | Dados temporÃ¡rios expiram e sÃ£o fisicamente removidos pela rotina de limpeza testada. |
| C1-14 | Tabela/formulÃ¡rio/wizard funcionam no teclado, nos dois temas e em mobile. |

## 8. CRM-002 â€” tags e segmentos

### 8.1 Resultado esperado

Organizar contatos por etiquetas e salvar filtros dinÃ¢micos reutilizÃ¡veis. Um segmento contÃ©m uma definiÃ§Ã£o de seleÃ§Ã£o, nÃ£o uma cÃ³pia estÃ¡tica dos contatos, e nÃ£o concede acesso adicional a quem o abre.

### 8.2 Dados

| Entidade | Campos principais e invariantes |
| --- | --- |
| Tag | id, tenantId, name, nameNormalized, colorToken, status, version, autoria e timestamps. Nome ativo Ãºnico por tenant; definir comportamento de restauraÃ§Ã£o de conflito. |
| ContactTag | tenantId, contactId, tagId, createdByMembershipId, createdAt; vÃ­nculo Ãºnico e FKs compostas para contato/tag. |
| Segment | id, tenantId, name, description, filterAst, schemaVersion, version, visibility, ownerMembershipId, status e timestamps. |
| Entitlement de CRM | Capacidade de tags, segmentos e tamanho do filtro resolvida no servidor, sem preÃ§o inventado. |

Visibilidade inicial do segmento: private ou tenant. Compartilhar com tenant torna a definiÃ§Ã£o disponÃ­vel a quem pode ler segmentos; o conjunto de contatos continua filtrado para cada pessoa. Um editor de segmento nÃ£o ganha acesso aos contatos que nÃ£o podia consultar.

Valores de filtros podem conter dados pessoais. Autorizar a leitura da definiÃ§Ã£o, evitar filtros sensÃ­veis em URL/log e nÃ£o publicar nomes de segmentos que exponham informaÃ§Ã£o fora do escopo.

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

Este Ã© exemplo de forma, nÃ£o um payload executÃ¡vel com UUID vÃ¡lido.

- Operadores por tipo: igualdade/diferenÃ§a, lista, faixa, contÃ©m/prefixo de texto quando implementados, ausÃªncia/presenÃ§a.
- Limitar profundidade, condiÃ§Ãµes e quantidade de valores.
- Campos e operadores devem estar em allowlist; converter para query parametrizada.
- Nunca aceitar Prisma where/orderBy, SQL, regex livre, funÃ§Ã£o ou JSONPath do cliente.
- OrdenaÃ§Ã£o somente por campos suportados e com desempate estÃ¡vel por id.
- NÃ£o carregar todos os contatos no Node para filtrar.
- â€œVazioâ€, false e zero tÃªm significados distintos; definir a semÃ¢ntica de negaÃ§Ã£o para campos ausentes.
- SemÃ¢ntica inicial: is_empty cobre chave ausente, texto vazio ou array vazio; false e zero nÃ£o sÃ£o vazios. eq/ne/in/not_in e comparaÃ§Ãµes de faixa exigem valor presente e do tipo esperado. Para incluir ausÃªncia numa negaÃ§Ã£o, o filtro deve acrescentar is_empty explicitamente. Reutilizar essa regra em prÃ©via, consulta e contagem.
- Datas relativas, se habilitadas, resolvem no fuso do tenant e usam o mesmo instante de referÃªncia na consulta.
- Se campo/tag for arquivado, nÃ£o descartar a condiÃ§Ã£o e ampliar o segmento. Marcar definiÃ§Ã£o invÃ¡lida e exigir correÃ§Ã£o.
- Valores de selects usam ID, nÃ£o label traduzido.

### 8.4 Backend e API

Prefixo /api/v1/tenants/:tenantId:

- GET/POST /crm/tags; PATCH /crm/tags/:tagId; POST /crm/tags/:tagId/archive.
- PUT/DELETE /crm/contacts/:contactId/tags/:tagId, idempotentes.
- POST /crm/contact-tag-batches para seleÃ§Ã£o explÃ­cita e limitada, com chave de idempotÃªncia.
- GET/POST /crm/segments; GET/PATCH /crm/segments/:segmentId; POST archive.
- GET /crm/segments/:segmentId/contacts, paginado e sujeito ao escopo atual.
- POST /crm/segments/preview para filtros complexos/privados, evitando dados pessoais na URL.

Gerenciar Tag e atribuÃ­-la a Contact sÃ£o autorizaÃ§Ãµes diferentes. OperaÃ§Ã£o em massa exige acesso a todos os IDs selecionados e informa o escopo do lote. No MVP, usar IDs explÃ­citos de atÃ© 100 registros e transaÃ§Ã£o atÃ´mica; â€œtodos os resultadosâ€ exige snapshot prÃ³prio e fica para expansÃ£o.

A reavaliaÃ§Ã£o inicial dos segmentos acontece na consulta. Cache de contagem Ã© opcional, por tenant/filtro/revisÃ£o e escopo; nÃ£o cachear uma contagem global como se fosse igual para todos.

### 8.5 Passos

- [ ] **CRM-002.A:** modelar Tag/ContactTag/Segment; criar constraints/RLS e contratos.
- [ ] **CRM-002.B:** criar compilador de filtros compartilhado com contatos; testar tipos, limites e ausÃªncia.
- [ ] **CRM-002.C:** implementar serviÃ§os de gestÃ£o e associaÃ§Ã£o; limites e consumo concorrente de quota.
- [ ] **CRM-002.D:** compor editor de tags, seleÃ§Ã£o em contatos e construtor de segmentos por condiÃ§Ãµes.
- [ ] **CRM-002.E:** exibir prÃ©via real, contador autorizado, salvar/editar/arquivar e explicar definiÃ§Ã£o invÃ¡lida.
- [ ] **CRM-002.F:** verificar paginaÃ§Ã£o, desempenho e isolamento; registrar evidÃªncia.

Na interface, cor vem de tokens permitidos e acompanha label. O construtor de filtros mostra frases compreensÃ­veis, validaÃ§Ã£o junto Ã  condiÃ§Ã£o e diferenÃ§a entre filtro temporÃ¡rio e segmento salvo. Alterar filtro limpa cursor e preserva o rascunho da definiÃ§Ã£o.

### 8.6 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C2-01 | Tag/contact de tenants diferentes nÃ£o podem ser associados, inclusive por escrita concorrente. |
| C2-02 | Repetir associaÃ§Ã£o/remoÃ§Ã£o nÃ£o duplica relaÃ§Ã£o nem gera contagem incorreta. |
| C2-03 | Segmento se atualiza quando dados/tags mudam; resultados respeitam o usuÃ¡rio que consulta. |
| C2-04 | Filtro invÃ¡lido, profundo demais, SQL/operador desconhecido ou campo alheio Ã© rejeitado. |
| C2-05 | Arquivamento de campo/tag nÃ£o amplia silenciosamente resultados. |
| C2-06 | Limite de plano nÃ£o pode ser ultrapassado por duas criaÃ§Ãµes simultÃ¢neas. |
| C2-07 | Lote com recurso nÃ£o autorizado falha de modo atÃ´mico e seguro. |
| C2-08 | PrÃ©via, lista e contagem mantÃªm a mesma semÃ¢ntica de filtro e de acesso. |

## 9. CRM-003 â€” pipelines, etapas e negÃ³cios

### 9.1 Resultado esperado

Configurar funis comerciais e mover oportunidades entre etapas com regras, histÃ³rico e proteÃ§Ã£o contra concorrÃªncia. Um contato pode ter vÃ¡rios negÃ³cios em um ou mais pipelines.

### 9.2 Dados

| Entidade | Campos principais |
| --- | --- |
| Pipeline | id, tenantId, name, nameNormalized, description, status, defaultCurrency, version, autoria e timestamps. |
| PipelineStage | id, tenantId, pipelineId, name, position, colorToken, category, requiredFieldRules, version, archivedAt. |
| Deal | id, tenantId, contactId, pipelineId, stageId, title, amount, currency, expectedCloseDate, closedAt, lostReason, departmentId, routingRoleId, assignedMembershipId, createdByMembershipId, updatedByMembershipId, version, archivedAt e timestamps. |
| DealStageHistory | id, tenantId, dealId, fromStageId, toStageId, actorMembershipId, reason, occurredAt e sequÃªncia/version do negÃ³cio. |

- category da etapa: open, won ou lost. Fechamento comercial vem dessa categoria, nÃ£o do nome â€œGanhoâ€.
- Valor monetÃ¡rio: PostgreSQL numeric/Prisma Decimal e string decimal no DTO; nÃ£o float JavaScript para cÃ¡lculo.
- Moeda: cÃ³digo validado; moeda padrÃ£o inicial pode ser BRL, explicitamente configurada e exibida.
- NÃ£o somar valores de moedas diferentes num Ãºnico total. Agrupar por moeda; conversÃ£o fica fora do MVP.
- Um negÃ³cio tem uma etapa atual pertencente ao seu pipeline; FK composta verifica tenant/pipeline/stage.
- NÃ£o guardar pipeline/etapa em customFields do contato.
- HistÃ³rico registra a transiÃ§Ã£o real uma Ãºnica vez, junto Ã  versÃ£o e auditoria.
- Contato vinculado deve ser ativo e autorizado na criaÃ§Ã£o; vÃ­nculo posterior nÃ£o pode ser usado para revelar contato fora do escopo.

### 9.3 Regras de pipeline e etapa

1. Pipeline ativo precisa de ao menos uma etapa open.
2. Criar um modelo inicial somente por aÃ§Ã£o real de configuraÃ§Ã£o; nÃ£o simular pipeline com constantes na UI.
3. Ordem Ã© determinÃ­stica. Reordenar recebe o conjunto exato de etapas afetadas e expectedVersion do pipeline.
4. Validar ausÃªncia de IDs duplicados/estranhos antes de aplicar a ordem.
5. ReordenaÃ§Ã£o ocorre em transaÃ§Ã£o/lock do pipeline; tratar Ã­ndices Ãºnicos de posiÃ§Ã£o sem conflito intermediÃ¡rio.
6. NÃ£o permitir remover/arquivar etapa com negÃ³cios ativos sem transferÃªncia explÃ­cita a destino vÃ¡lido.
7. Regras iniciais sÃ£o declarativas e limitadas: exigir campos do negÃ³cio ou campos do contato antes da entrada.
8. NÃ£o incluir scripts, automaÃ§Ãµes, webhooks de transiÃ§Ã£o ou fÃ³rmulas executÃ¡veis neste card.
9. MudanÃ§a de regra afeta novas transiÃ§Ãµes; nÃ£o mover negÃ³cios existentes automaticamente.
10. Pipeline arquivado preserva histÃ³rico; nÃ£o aceitar novos negÃ³cios/movimentos comuns nele.
11. Se excluir uma regra/etapa invalidar referÃªncia de outro recurso, retornar dependÃªncia com informaÃ§Ã£o autorizada.
12. Depois de receber negÃ³cio, a categoria open/won/lost da etapa Ã© imutÃ¡vel neste recorte. Criar outra etapa e transferir por comando vÃ¡lido; editar o nome/cor nÃ£o pode fechar ou reabrir negÃ³cios em massa.

### 9.4 Movimento do negÃ³cio

Entrada: dealId, destinationStageId, expectedVersion, reason quando exigido e chave de idempotÃªncia.

SequÃªncia no serviÃ§o:

1. Validar contexto atual e crm.deals.move no negÃ³cio de origem.
2. Carregar negÃ³cio e etapa de destino autorizados no mesmo tenant.
3. Confirmar pipeline, estado ativo, regra de transiÃ§Ã£o e campos obrigatÃ³rios.
4. Aplicar condiÃ§Ã£o de versÃ£o/lock.
5. Atualizar stageId, campos de fechamento coerentes e versÃ£o.
6. Gravar DealStageHistory, AuditLog e outbox na mesma transaÃ§Ã£o.
7. Retornar novo DTO/versÃ£o.
8. Em conflito, retornar CONFLICT para atualizaÃ§Ã£o e revisÃ£o, preservando dados digitados.

Mover de uma etapa para outra nÃ£o altera o setor/responsÃ¡vel automaticamente. Transferir de pipeline Ã© comando separado: validar pipeline/etapa de destino e regras sem bypass. Fechar/reabrir negÃ³cio atualiza closedAt coerentemente e exige motivo conforme a operaÃ§Ã£o.

O MVP pode ordenar cards dentro da etapa por updatedAt/id; reordenar etapas Ã© obrigatÃ³rio, arranjo manual de cada card Ã© expansÃ£o. NÃ£o mostrar drag para ordenaÃ§Ã£o manual se ela nÃ£o persiste.

### 9.5 API

Prefixo /api/v1/tenants/:tenantId:

| Rotas | Responsabilidade |
| --- | --- |
| GET/POST /crm/pipelines | Listar/criar pipeline autorizado. |
| GET/PATCH /crm/pipelines/:pipelineId | Detalhe e configuraÃ§Ã£o. |
| POST /crm/pipelines/:pipelineId/archive | Arquivamento com dependÃªncias. |
| POST /crm/pipelines/:pipelineId/stages | Nova etapa. |
| PATCH /crm/pipelines/:pipelineId/stages/:stageId | ConfiguraÃ§Ã£o e regras. |
| PUT /crm/pipelines/:pipelineId/stage-order | ReordenaÃ§Ã£o transacional com versÃ£o. |
| POST /crm/pipelines/:pipelineId/stages/:stageId/archive | Arquivar ou exigir transferÃªncia prÃ©via. |
| GET/POST /crm/deals | Listar/criar negÃ³cio. |
| GET/PATCH /crm/deals/:dealId | Detalhar/editar propriedades permitidas. |
| POST /crm/deals/:dealId/move | TransiÃ§Ã£o de etapa. |
| POST /crm/deals/:dealId/transfer-pipeline | TransferÃªncia validada. |
| POST /crm/deals/:dealId/archive | Arquivar oportunidade, sem apagar histÃ³rico. |
| GET /crm/deals/:dealId/history | HistÃ³rico autorizado e paginado. |

Regras e configuraÃ§Ãµes de funil exigem crm.pipelines.manage. Operar negÃ³cio exige aÃ§Ãµes de crm.deals; gerenciar o funil nÃ£o concede acesso irrestrito a seus contatos.

### 9.6 Passos e arquivos

- [ ] **CRM-003.A:** criar contratos pipeline/stage/deal/move e schemas de regras limitadas.
- [ ] **CRM-003.B:** adicionar modelos e SQL de integridade, Ã­ndices por tenant/pipeline/stage e RLS.
- [ ] **CRM-003.C:** criar serviÃ§os separados de configuraÃ§Ã£o e operaÃ§Ã£o de negÃ³cios.
- [ ] **CRM-003.D:** implementar concorrÃªncia, transiÃ§Ãµes, histÃ³rico, auditoria/outbox.
- [ ] **CRM-003.E:** criar /settings/crm/pipelines e formulÃ¡rio/detalhe de negÃ³cio em features/crm.
- [ ] **CRM-003.F:** conectar criaÃ§Ã£o/ediÃ§Ã£o simples; deixar visualizaÃ§Ãµes avanÃ§adas para CRM-004.
- [ ] **CRM-003.G:** testar regras, moedas, remoÃ§Ãµes e corridas; registrar evidÃªncia.

### 9.7 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C3-01 | Etapa de outro pipeline/tenant nÃ£o pode ser atribuÃ­da ao negÃ³cio, mesmo por FK trocada. |
| C3-02 | Dois movimentos concorrentes nÃ£o sobrescrevem a versÃ£o nem geram histÃ³rico incompatÃ­vel. |
| C3-03 | RepetiÃ§Ã£o da mesma transiÃ§Ã£o idempotente nÃ£o duplica histÃ³rico/evento. |
| C3-04 | Etapa com negÃ³cios nÃ£o desaparece sem transferÃªncia explÃ­cita vÃ¡lida. |
| C3-05 | Regra de campo obrigatÃ³rio Ã© aplicada por API direta e pela UI. |
| C3-06 | Valor preserva precisÃ£o; totais nÃ£o misturam moedas. |
| C3-07 | Ler o pipeline/negÃ³cio nÃ£o vaza dados nÃ£o autorizados do contato. |
| C3-08 | Renomear etapa nÃ£o altera sua semÃ¢ntica open/won/lost nem o histÃ³rico. |
| C3-09 | Reordenar etapas mantÃ©m conjunto e ordem corretos sob concorrÃªncia. |
| C3-10 | TransferÃªncia de pipeline nÃ£o contorna regras de entrada nem autorizaÃ§Ã£o. |

## 10. CRM-004 â€” cards, lista e integraÃ§Ã£o com inbox

### 10.1 Resultado esperado

Alternar entre quadro e lista sobre os mesmos negÃ³cios e filtros, abrir detalhe sem perder contexto e acessar as conversas relacionadas quando CRM-005 estiver disponÃ­vel.

**CRM-004.A:** cards/lista apÃ³s CRM-003.  
**CRM-004.B:** contexto de inbox apÃ³s CRM-005. O card integral nÃ£o fica DONE somente com a primeira fatia.

### 10.2 Regras de consulta e estado

- Um contrato canÃ´nico de filtro/sort alimenta todas as visualizaÃ§Ãµes.
- Tenant, usuÃ¡rio, revisÃ£o de acesso, pipeline e filtro participam da chave de consulta.
- Cada coluna do quadro tem paginaÃ§Ã£o prÃ³pria. Nunca carregar todos os negÃ³cios de todos os pipelines.
- Contadores sÃ£o calculados com o mesmo escopo dos cards; nÃ£o representar â€œcarregadosâ€ como â€œtotalâ€.
- Usar paginaÃ§Ã£o determinÃ­stica com desempate; documentar que mudanÃ§as concorrentes podem exigir revalidaÃ§Ã£o.
- Alterar filtro invalida cursores e seleÃ§Ã£o incompatÃ­vel.
- Busca pessoal nÃ£o vai a analytics nem a logs de URL; filtros sensÃ­veis podem usar POST de busca.
- DTO de card traz somente campos visÃ­veis; detalhes de contato exigem autorizaÃ§Ã£o adicional.
- AtualizaÃ§Ã£o de dados nÃ£o fecha editor nem sobrescreve seu rascunho.
- PreferÃªncias persistidas incluem tenant e membership e contÃªm apenas configuraÃ§Ã£o da visualizaÃ§Ã£o; nada de contatos ou mensagens em localStorage.

### 10.3 InteraÃ§Ãµes e acessibilidade

- Alternar quadro/lista preserva pipeline, filtros e registro selecionado.
- Mover etapa por menu/dialog Ã© obrigatÃ³rio. Drag-and-drop Ã© uma alternativa adicional.
- O menu informa etapa atual, destinos permitidos e motivo de bloqueio.
- Movimento otimista sÃ³ com rollback previsÃ­vel; conflito restaura o estado confirmado e explica o que mudou.
- Mobile prioriza lista/cards e aÃ§Ã£o â€œMover etapaâ€; nÃ£o comprimir um quadro enorme em 360 px.
- Foco retorna ao card/botÃ£o correto; anÃºncio de movimento Ã© curto e nÃ£o depende de cor.
- Voltar de negÃ³cio/conversa preserva lista, filtros e scroll quando viÃ¡vel.
- Estados: nenhum pipeline, nenhum negÃ³cio, filtro sem resultados, acesso negado, erro de coluna, carregamento incremental e atualizaÃ§Ã£o pendente.

### 10.4 IntegraÃ§Ã£o com inbox

ApÃ³s CRM-005:

1. Mostrar conversas autorizadas do contato/negÃ³cio no detalhe.
2. Abrir /inbox com identificador autorizado, sem mensagem ou e-mail na URL.
3. Voltar ao negÃ³cio sem perder o formulÃ¡rio.
4. Exigir as permissÃµes da conversa e do contato; nÃ£o retornar conteÃºdo de conversa na listagem de negÃ³cios por conveniÃªncia.
5. Mostrar indisponibilidade contextual quando nÃ£o existir conversa. NÃ£o fabricar histÃ³rico nem simular mensagem enviada.

O inbox completo pertence Ã  feature inbox. CRM-004 compÃµe links/contexto e visualizaÃ§Ãµes, sem duplicar um segundo mÃ³dulo de mensagens.

### 10.5 Passos

- [ ] **CRM-004.A1:** criar queries de quadro, lista e contagem com mesmo filtro/escopo.
- [ ] **CRM-004.A2:** substituir mocks da rota /crm por loader e componentes de features/crm.
- [ ] **CRM-004.A3:** implementar paginaÃ§Ã£o por coluna, seleÃ§Ã£o, detalhe e menu de movimento.
- [ ] **CRM-004.A4:** implementar composiÃ§Ã£o mobile, teclado e estados de conflito.
- [ ] **CRM-004.B1:** integrar conversas relacionadas apÃ³s CRM-005.
- [ ] **CRM-004.B2:** testar navegaÃ§Ã£o de ida/volta, cache, permissÃµes e troca de tenant.
- [ ] Atualizar o card somente quando ambas as fatias e seus testes estiverem completos.

### 10.6 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C4-01 | Quadro e lista mostram o mesmo conjunto autorizado para o mesmo filtro. |
| C4-02 | Contadores nÃ£o vazam negÃ³cios ocultos e nÃ£o confundem total com pÃ¡gina carregada. |
| C4-03 | Toda movimentaÃ§Ã£o pode ser feita com teclado e sem drag. |
| C4-04 | Erro/conflito reverte otimismo sem apagar rascunho. |
| C4-05 | Mobile permite consultar, abrir, voltar e mover sem depender de hover. |
| C4-06 | Troca de tenant limpa dados/seleÃ§Ãµes da empresa anterior. |
| C4-07 | Link para inbox nÃ£o contorna autorizaÃ§Ã£o da conversa. |
| C4-08 | Queries e bundle mantÃªm limites; nÃ£o hÃ¡ carregamento integral oculto da base. |



## 11. CRM-005 â€” conversas, histÃ³rico e notas internas

### 11.1 Recorte de produto e fronteira

Este card cria o nÃºcleo do atendimento em 06-inbox: conversas relacionadas a contatos, histÃ³rico paginado, notas internas e controle de leitura da equipe.

**NÃ£o confundir trÃªs produtos:**

| Produto | Entrega neste card |
| --- | --- |
| Conversa de atendimento de um cliente | Estrutura e interface reais, com contexto de contato. |
| Nota interna dentro desse atendimento | CriaÃ§Ã£o e leitura reais para membros autorizados. |
| Chat social entre membros/setores/cargos | DomÃ­nio futuro separado; nÃ£o Ã© modelado como conversa de cliente. |

O envio/recebimento por WhatsApp, Instagram ou e-mail depende dos cards MSG e dos adaptadores. NÃ£o exibir â€œenviadoâ€, â€œentregueâ€ ou â€œlido pelo clienteâ€ para uma nota salva apenas no banco.

Na ausÃªncia de canal conectado, a conversa pode ser um atendimento interno vinculado a um contato, com capacidade explÃ­cita de registrar notas. O botÃ£o de responder ao cliente sÃ³ aparece habilitado quando integraÃ§Ã£o, entitlement e polÃ­tica do canal estiverem operacionais.

### 11.2 Dados

| Entidade | Campos e regras |
| --- | --- |
| Conversation | id, tenantId, contactId, subject, source, channelReference opcional, status, departmentId, routingRoleId, assignedMembershipId, createdByMembershipId, version, lastActivityAt, closedAt e timestamps. |
| Message | id, tenantId, conversationId, sequence, kind, direction, authorMembershipId opcional, externalSenderReference opcional, text, state, clientMessageId, createdAt. |
| ConversationReadState | tenantId, conversationId, membershipId, lastReadSequence, updatedAt; combinaÃ§Ã£o Ãºnica e FKs compostas. |
| ConversationStatusHistory | tenantId, conversationId, fromStatus, toStatus, actorMembershipId, reason, occurredAt. |

Contratos iniciais:

- Conversation.status: open, pending ou closed.
- source: internal_crm inicialmente; outros canais entram por adaptador registrado.
- Message.kind: internal_note habilitado. customer_message Ã© reservado Ã  integraÃ§Ã£o futura.
- Message.direction: internal para nota; inbound/outbound sÃ£o direÃ§Ãµes futuras de mensagem externa.
- Message.state: saved para nota. PersistÃªncia local nÃ£o gera sent/delivered/read.
- Texto simples no MVP, com escaping. Rich text exige schema e sanitizaÃ§Ã£o prÃ³prios.
- Notas sÃ£o append-only neste recorte. CorreÃ§Ã£o acontece por nova nota; redaction/expurgo privilegiado segue governanÃ§a, sem apagar silenciosamente auditoria.
- clientMessageId Ãºnico por tenant + conversa + autor; repetiÃ§Ã£o com texto diferente gera conflito.
- sequence Ã© crescente por conversa, gerada sob lock/ordem transacional. BigInt cru nÃ£o atravessa JSON: serializar como string decimal.
- Toda FK preserva tenant; contato/conversa/autor de outra empresa sÃ£o rejeitados.

### 11.3 Visibilidade e histÃ³rico

1. A pessoa precisa de inbox.conversations.read e acesso ao recurso, alÃ©m do contato associado conforme a seÃ§Ã£o 5.
2. Notas internas sÃ£o visÃ­veis aos membros atualmente autorizados daquela conversa.
3. Novo responsÃ¡vel autorizado pode consultar o histÃ³rico de atendimento retido; esta Ã© uma decisÃ£o do histÃ³rico de negÃ³cio, diferente da futura polÃ­tica de chat privado da equipe.
4. Retirar atribuiÃ§Ã£o remove o acesso ASSIGNED, mas preserva acesso por outra concessÃ£o vÃ¡lida.
5. Redigir uma nota exige inbox.notes.create e leitura da conversa.
6. Criar nota nÃ£o altera o estado da conversa automaticamente. Conversa fechada precisa ser reaberta por operaÃ§Ã£o autorizada antes de nova nota no MVP.
7. Contagens de nÃ£o lidas sÃ£o por Membership; nÃ£o representam confirmaÃ§Ã£o do cliente.
8. lastReadSequence sÃ³ avanÃ§a, nunca pode marcar como lida uma sequÃªncia alÃ©m da existente/autorizada.
9. Busca no histÃ³rico e preview da Ãºltima mensagem usam o mesmo escopo; nÃ£o incluir conteÃºdo completo no evento realtime.
10. Anexos ficam desabilitados atÃ© existir pipeline privado de upload/scan/download autorizado. NÃ£o guardar arquivos em public.

### 11.4 API e serviÃ§os

Prefixo /api/v1/tenants/:tenantId:

| MÃ©todo e rota | Contrato |
| --- | --- |
| GET /inbox/conversations | Filtros por status, setor/responsÃ¡vel permitido e contato autorizado; cursor. |
| POST /inbox/conversations | Cria atendimento ligado a contato existente autorizado. |
| GET /inbox/conversations/:conversationId | Contexto mÃ­nimo autorizado. |
| PATCH /inbox/conversations/:conversationId | Propriedades comuns e expectedVersion; sem atribuiÃ§Ã£o solta. |
| POST /inbox/conversations/:conversationId/status | TransiÃ§Ã£o open/pending/closed com versÃ£o e motivo quando exigido. |
| GET /inbox/conversations/:conversationId/messages | beforeSequence ou afterSequence, mutuamente exclusivos, com limite. |
| POST /inbox/conversations/:conversationId/notes | Texto, clientMessageId e versÃ£o/condiÃ§Ãµes da conversa. |
| PUT /inbox/conversations/:conversationId/read-state | AvanÃ§a marcador do prÃ³prio vÃ­nculo autenticado. |

Criar conversation.service.ts, message.service.ts e repositÃ³rios especÃ­ficos em 06-inbox. Contact Ã© acessado por uma interface pÃºblica interna de 05-crm que preserva autorizaÃ§Ã£o; nÃ£o criar dependÃªncia circular entre os domÃ­nios.

Salvar nota, atualizar lastActivityAt, consumir sequÃªncia, registrar auditoria e inserir evento na outbox sÃ£o uma unidade transacional. HistÃ³rico paginado nÃ£o depende de WebSocket para funcionar.

### 11.5 UX alÃ©m da composiÃ§Ã£o visual

**Desktop:** lista de atendimentos; conversa; contexto do contato. Carregamento e erro sÃ£o locais a cada painel.

**Mobile:** lista â†’ conversa â†’ contexto, com retorno claro. Teclado nÃ£o encobre compositor e aÃ§Ã£o de envio.

- Composer identifica permanentemente â€œNota interna â€” visÃ­vel Ã  equipe autorizadaâ€.
- Nenhum toggle pouco claro pode converter a nota em resposta ao cliente.
- Em erro de rede, texto permanece e a mesma chave de envio permite consultar/repetir com seguranÃ§a.
- Se a pessoa estiver lendo mensagens antigas, nova nota nÃ£o forÃ§a scroll; mostrar aviso â€œNovas mensagensâ€.
- Rascunho permanece durante navegaÃ§Ã£o entre painÃ©is na memÃ³ria da feature, separado por tenant/membership/conversa.
- NÃ£o persistir texto em localStorage ou cache pÃºblico. PersistÃªncia entre sessÃµes exige polÃ­tica e entrega prÃ³prias.
- Perda de permissÃ£o bloqueia novas aÃ§Ãµes e limpa dados locais apÃ³s comunicar o contexto, sem reexpor o conteÃºdo em toast.
- Estado de lista vazia Ã© diferente de canal desconectado ou acesso negado.
- AtÃ© CRM-007, usar revalidaÃ§Ã£o apÃ³s mutaÃ§Ãµes e polling controlado apenas na conversa/lista ativa, com pausa em aba oculta e backoff.
- NotificaÃ§Ãµes de sistema operacional, Ã¡udio, presenÃ§a e typing nÃ£o sÃ£o critÃ©rios deste nÃºcleo.

### 11.6 Passos

- [ ] **CRM-005.A:** definir contratos de conversa/nota/status/histÃ³rico e polÃ­ticas de retenÃ§Ã£o.
- [ ] **CRM-005.B:** criar tabelas, Ã­ndices, sequÃªncia transacional, FKs, RLS e idempotÃªncia.
- [ ] **CRM-005.C:** implementar serviÃ§os e API, incluindo acesso ao contato e histÃ³rico paginado.
- [ ] **CRM-005.D:** persistir auditoria/outbox na transaÃ§Ã£o; nÃ£o emitir evento antes do commit.
- [ ] **CRM-005.E:** substituir mocks de /inbox e compor experiÃªncia desktop/mobile.
- [ ] **CRM-005.F:** validar rascunho, retry, fechamento/reabertura e marcadores de leitura.
- [ ] **CRM-005.G:** registrar evidÃªncia; habilitar a fatia de integraÃ§Ã£o CRM-004.B.
- [ ] Manter canais externos e chat da equipe em suas entregas prÃ³prias.

### 11.7 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C5-01 | Conversa/contact de outro tenant ou fora do escopo nÃ£o abre nem aceita nota. |
| C5-02 | Nota interna nunca aciona provider, webhook de envio externo ou confirmaÃ§Ã£o de entrega ao cliente. |
| C5-03 | Retry da mesma nota nÃ£o duplica; mesma chave com conteÃºdo diferente falha. |
| C5-04 | HistÃ³rico before/afterSequence funciona sem perda ou repetiÃ§Ã£o indevida sob concorrÃªncia. |
| C5-05 | NÃ£o lidas sÃ£o por membership e nÃ£o retrocedem com requests fora de ordem. |
| C5-06 | Texto potencialmente malicioso Ã© exibido como dado, sem HTML executÃ¡vel. |
| C5-07 | Mudar responsÃ¡vel/permissÃ£o altera acesso ao histÃ³rico conforme as concessÃµes atuais. |
| C5-08 | Mobile preserva retorno e rascunho; novas mensagens nÃ£o interrompem leitura antiga. |
| C5-09 | Falha transacional nÃ£o deixa nota, contador ou evento fantasma. |
| C5-10 | Estados de fechamento/reabertura e ausÃªncia de canal sÃ£o verdadeiros e compreensÃ­veis. |

## 12. CRM-006 â€” atribuiÃ§Ã£o a setor, cargo e membro

### 12.1 Resultado esperado e dependÃªncias

Encaminhar contatos, negÃ³cios e atendimentos a uma fila ou responsÃ¡vel vÃ¡lido, com transaÃ§Ã£o, histÃ³rico, revogaÃ§Ã£o do acesso derivado e notificaÃ§Ã£o real.

A implementaÃ§Ã£o completa acontece apÃ³s CRM-007 para cumprir o aceite â€œautorizaÃ§Ã£o e notificaÃ§Ã£o em tempo realâ€. Os contratos/colunas bÃ¡sicos jÃ¡ foram preparados nos recursos anteriores.

TEAM-003 precisa entregar ou comprovar o ciclo de membros necessÃ¡rio: suspensÃ£o, reativaÃ§Ã£o, saÃ­da de setor e proteÃ§Ã£o do proprietÃ¡rio. Um campo active isolado nÃ£o comprova esse ciclo.

### 12.2 Significado dos trÃªs campos

| Campo | FunÃ§Ã£o |
| --- | --- |
| departmentId | Setor responsÃ¡vel pelo recurso; participa do escopo DEPARTMENT. |
| routingRoleId | Cargo elegÃ­vel para atender uma fila; nÃ£o cria permissÃ£o. |
| assignedMembershipId | ResponsÃ¡vel individual; participa do escopo ASSIGNED. |

Estados vÃ¡lidos incluem: sem atribuiÃ§Ã£o; somente setor; setor + cargo; somente membro quando a regra do recurso permitir; setor + membro; setor + cargo + membro elegÃ­vel.

Cargo de roteamento controla elegibilidade para assumir trabalho, nÃ£o confidencialidade adicional: uma pessoa com read DEPARTMENT pode continuar vendo o recurso daquele setor mesmo sem o cargo da fila. Caso o produto precise de fila sigilosa por cargo, serÃ¡ necessÃ¡rio um predicado de visibilidade especÃ­fico; nÃ£o inferi-lo apenas de routingRoleId.

Regras:

1. Todas as referÃªncias sÃ£o do mesmo tenant.
2. Setor, cargo e vÃ­nculo devem estar ativos no momento do commit.
3. Cargo departamental exige o mesmo departmentId.
4. Cargo global pode ser usado numa fila de setor, desde que a elegibilidade da pessoa seja verificada para setor e cargo.
5. Quando houver setor + membro, a pessoa deve pertencer ativamente ao setor.
6. Quando houver cargo + membro, a pessoa deve possuir atribuiÃ§Ã£o vÃ¡lida desse cargo; nome do cargo nÃ£o Ã© prova.
7. DestinatÃ¡rio precisa ter permissÃ£o aplicÃ¡vel de leitura/operaÃ§Ã£o, considerando o estado projetado apÃ³s receber a atribuiÃ§Ã£o.
8. O criador do registro nÃ£o muda durante transferÃªncia.
9. Cargo/setor nÃ£o recebe login prÃ³prio; notificaÃ§Ãµes vÃ£o para memberships humanas elegÃ­veis.
10. Retirar o Ãºltimo responsÃ¡vel nÃ£o torna o recurso pÃºblico.

### 12.3 Autorizar mudanÃ§a sem escalada

Cada recurso usa sua aÃ§Ã£o especÃ­fica: crm.contacts.assign, crm.deals.assign ou inbox.conversations.assign.

- Validar acesso ao recurso de origem e competÃªncia para encaminhar ao destino.
- Transferir entre departamentos exige alcance de assign para origem e destino.
- Escopos OWN/ASSIGNED, por si, nÃ£o autorizam encaminhar a qualquer departamento. No MVP, permitem operaÃ§Ãµes no contexto atual permitido; mudanÃ§a de setor exige concessÃ£o apropriada TENANT/DEPARTMENT.
- A atribuiÃ§Ã£o pode fazer uma permissÃ£o ASSIGNED jÃ¡ existente passar a alcanÃ§ar o recurso. Esse efeito precisa fazer parte da autorizaÃ§Ã£o, auditoria e prÃ©via da transferÃªncia.
- NÃ£o conceder cargo/permissÃ£o ao destinatÃ¡rio como efeito colateral de uma atribuiÃ§Ã£o.
- NÃ£o deixar o ator trocar campos pelo PATCH geral para contornar assign.
- Validar alvo em transaÃ§Ã£o e coordenar locks/revisÃµes com suspensÃ£o/saÃ­da de setor.
- NÃ£o aceitar lista de â€œmembros elegÃ­veisâ€ produzida pelo navegador como decisÃ£o final.

**Assumir da fila:** usar aÃ§Ã£o distinta de encaminhar a terceiros. Propor crm.contacts.claim, crm.deals.claim e inbox.conversations.claim no catÃ¡logo. claim sÃ³ atribui ao prÃ³prio membership, exige elegibilidade na fila e recurso ainda disponÃ­vel; nunca aceita targetMembershipId arbitrÃ¡rio.

O alcance de claim precisa cobrir a fila/recurso antes da atribuiÃ§Ã£o, por TENANT, DEPARTMENT ou OWN aplicÃ¡vel. ASSIGNED nÃ£o dÃ¡ acesso a um item ainda sem responsÃ¡vel; nÃ£o usar a prÃ³pria atribuiÃ§Ã£o projetada como justificativa circular para autorizar o claim.

Duas pessoas assumindo o mesmo recurso ao mesmo tempo: uma vence; a outra recebe conflito e estado atualizado. NÃ£o gravar dois responsÃ¡veis em uma coluna nem retornar sucesso Ã s duas.

### 12.4 O que nÃ£o se propaga automaticamente

Transferir contato nÃ£o transfere seus negÃ³cios/conversas. Transferir conversa nÃ£o altera responsÃ¡vel do contato. Transferir negÃ³cio nÃ£o muda equipe do cliente inteiro.

Como o acesso Ã s entidades relacionadas pode depender da leitura do contato, mudar o escopo do contato pode retirar acesso Ã  composiÃ§Ã£o de negÃ³cio/conversa. Invalidar e reautorizar tambÃ©m essas dependÃªncias, sem alterar sua atribuiÃ§Ã£o silenciosamente.

Uma aÃ§Ã£o futura â€œTransferir contato e todos os atendimentosâ€ precisa de prÃ©via com conjunto, autorizaÃ§Ãµes, limites e semÃ¢ntica transacional prÃ³prios.

### 12.5 Contratos e endpoints

Criar um schema compartilhado de AssignmentTarget com departmentId, routingRoleId, assignedMembershipId e intenÃ§Ã£o explÃ­cita de limpar/manter cada referÃªncia.

Comandos recebem expectedVersion, reason opcional/obrigatÃ³rio conforme transferÃªncia e chave de idempotÃªncia.

Rotas propostas sob o recurso:

- GET .../:resourceId/assignment-candidates.
- PUT .../:resourceId/assignment.
- POST .../:resourceId/assignment/claim.
- POST .../:resourceId/assignment/release.

Os caminhos concretos sÃ£o /crm/contacts, /crm/deals e /inbox/conversations. NÃ£o construir uma rota genÃ©rica que permita acessar qualquer tabela por resourceType recebido.

Ao mudar setor, a UI limpa o cargo/membro incompatÃ­vel e pede nova escolha. No backend, referÃªncias incompatÃ­veis sÃ£o rejeitadas; nÃ£o descartadas silenciosamente.

release exige regra explÃ­cita: o prÃ³prio responsÃ¡vel pode devolver Ã  fila com claim aplicÃ¡vel, e gestores com assign podem retirar responsÃ¡vel. A operaÃ§Ã£o nÃ£o apaga o setor/cargo da fila sem intenÃ§Ã£o declarada.

### 12.6 Auditoria, eventos e notificaÃ§Ã£o

Dentro da mesma transaÃ§Ã£o:

1. Verificar versÃ£o e estado anterior.
2. Persistir nova atribuiÃ§Ã£o.
3. Incrementar a versÃ£o do recurso.
4. Registrar origem/destino por IDs, ator e motivo minimizado.
5. Inserir evento versionado na outbox.
6. Inserir notificaÃ§Ãµes persistentes deduplicadas para destinatÃ¡rios elegÃ­veis. A notificaÃ§Ã£o faz parte do aceite de CRM-006; nÃ£o substituÃ­-la por um toast que desaparece se a pessoa estiver offline.

ApÃ³s commit, relay entrega o evento. O gateway revalida o destinatÃ¡rio atual antes de entregar qualquer conteÃºdo.

O novo responsÃ¡vel recebe aviso com informaÃ§Ã£o mÃ­nima autorizada e acesso ao recurso. O anterior perde dados derivados da atribuiÃ§Ã£o e recebe no mÃ¡ximo sinal de invalidaÃ§Ã£o sem conteÃºdo novo. Outro cargo global vÃ¡lido pode manter seu acesso, conforme a regra cumulativa.

NotificaÃ§Ã£o deduplicada por tenant + evento + destinatÃ¡rio. Se lida em vÃ¡rias abas, marcador consistente. NÃ£o tratar chegada de socket como prova de que a pessoa leu.

Modelo mÃ­nimo de Notification: id, tenantId, recipientMembershipId, eventId, kind, referÃªncia mÃ­nima de recurso, createdAt e readAt. FK composta para o destinatÃ¡rio, Ã­ndice tenant/destinatÃ¡rio/leitura/data e unicidade tenant/evento/destinatÃ¡rio. A referÃªncia informativa do recurso nÃ£o substitui sua autorizaÃ§Ã£o: leitura/detalhe/notificaÃ§Ã£o revalidam acesso e nÃ£o persistem cÃ³pia de nome, e-mail ou conteÃºdo de mensagem. Expor lista paginada e marcaÃ§Ã£o de leitura apenas ao destinatÃ¡rio atual. HistÃ³rico de atribuiÃ§Ã£o pode usar projeÃ§Ã£o autorizada do AuditLog do prÃ³prio recurso; nÃ£o dar acesso ao log inteiro do tenant para mostrar essa linha do tempo.

### 12.7 SuspensÃ£o, reativaÃ§Ã£o e saÃ­da

- SuspensÃ£o interrompe novas atribuiÃ§Ãµes, pickups e acesso derivado.
- ReferÃªncias histÃ³ricas permanecem para auditoria. A UI marca responsÃ¡vel indisponÃ­vel para quem pode ver a fila.
- Recursos nÃ£o sÃ£o encaminhados a pessoa aleatÃ³ria.
- Gestor autorizado recebe uma fila de pendÃªncias para reatribuir.
- ReativaÃ§Ã£o nÃ£o restaura cargos departamentais revogados nem assinaturas antigas automaticamente.
- SaÃ­da de setor remove elegibilidade Ã  fila daquele setor; permissÃµes globais vÃ¡lidas permanecem.
- Um setor com trabalho ativo nÃ£o pode ser apagado por cascade. Arquivar exige resolver/transferir dependÃªncias de forma explÃ­cita.
- Definir e testar a ordem das transaÃ§Ãµes concorrentes de suspensÃ£o e atribuiÃ§Ã£o.

### 12.8 Passos

- [ ] **CRM-006.A:** completar contratos de atribuiÃ§Ã£o e catÃ¡logo assign/claim.
- [ ] **CRM-006.B:** implementar consultas mÃ­nimas de candidatos pela fronteira de 04-team.
- [ ] **CRM-006.C:** implementar comandos por domÃ­nio com validaÃ§Ã£o de origem/destino.
- [ ] **CRM-006.D:** adicionar locks/versÃ£o/idempotÃªncia e histÃ³rico de atribuiÃ§Ã£o.
- [ ] **CRM-006.E:** conectar seletores no contato, negÃ³cio e atendimento; compor fila e aÃ§Ã£o â€œAssumirâ€.
- [ ] **CRM-006.F:** integrar notificaÃ§Ãµes/eventos via infraestrutura e gateway de CRM-007.
- [ ] **CRM-006.G:** exercitar suspensÃ£o, saÃ­da, reativaÃ§Ã£o, concorrÃªncia e permissÃµes cumulativas.
- [ ] Concluir o card sÃ³ com notificaÃ§Ã£o e revogaÃ§Ã£o verificadas, alÃ©m da gravaÃ§Ã£o dos trÃªs campos.

### 12.9 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C6-01 | Setor/cargo/membro de outro tenant ou inativo nunca recebe atribuiÃ§Ã£o. |
| C6-02 | Membro incompatÃ­vel com setor/cargo nÃ£o aparece como elegÃ­vel nem passa na API direta. |
| C6-03 | Duas pessoas assumindo o mesmo item resultam em um Ãºnico vencedor. |
| C6-04 | TransferÃªncia nÃ£o permite ampliar acesso por PATCH, OWN ou ASSIGNED indevidamente. |
| C6-05 | SaÃ­da de setor elimina elegibilidade e concessÃµes derivadas; cargo global vÃ¡lido permanece. |
| C6-06 | SuspensÃ£o concorrente com atribuiÃ§Ã£o tem resultado ordenado e seguro. |
| C6-07 | TransferÃªncia persiste recurso, histÃ³rico, auditoria e evento atomicamente. |
| C6-08 | DestinatÃ¡rio recebe uma notificaÃ§Ã£o efetiva e deduplicada apÃ³s commit. |
| C6-09 | ResponsÃ¡vel antigo deixa de receber conteÃºdo quando perdeu todas as concessÃµes aplicÃ¡veis. |
| C6-10 | Alterar contato nÃ£o move negÃ³cios/conversas silenciosamente e invalida composiÃ§Ãµes cujo acesso mudou. |

## 13. CRM-007 â€” WebSocket, rooms e recuperaÃ§Ã£o

### 13.1 Resultado esperado

Atualizar conversa, lista e contexto apÃ³s mudanÃ§as reais, com conexÃ£o autenticada, inscriÃ§Ã£o autorizada, revogaÃ§Ã£o durante a conexÃ£o e recuperaÃ§Ã£o quando eventos forem perdidos.

O primeiro protocolo usa WebSocket para assinaturas/avisos. As mutaÃ§Ãµes de negÃ³cio continuam na API HTTP, evitando dois caminhos de escrita.

### 13.2 Topologia e autenticaÃ§Ã£o

DecisÃ£o recomendada: publicar **/ws na mesma origem do painel**, pelo proxy HTTPS, encaminhando o upgrade ao Fastify. Assim, o cookie host-only de tenant pode ser usado sem ampliar Domain para todos os subdomÃ­nios.

- ProduÃ§Ã£o usa WSS.
- Proxy valida host/origem, encaminha somente o necessÃ¡rio e suporta upgrade/timeouts.
- Fastify autentica cookie de sessÃ£o real, surface, subject, expiraÃ§Ã£o, revisÃ£o e estado atual.
- Origin deve estar em allowlist exata do painel; rejeitar origem ausente/invÃ¡lida para esse fluxo de navegador.
- API_URL/origem configurada nÃ£o deriva de Host arbitrÃ¡rio enviado pelo cliente.
- NÃ£o passar sessÃ£o, JWT ou ticket de longa duraÃ§Ã£o na query string.
- ConexÃ£o fica vinculada a uma sessÃ£o, membership e tenant. Troca de tenant encerra a conexÃ£o anterior.
- Se a topologia exigir origem separada, definir antes um protocolo de ticket curto, de uso Ãºnico e finalidade especÃ­fica, transmitido em mensagem inicial protegida; nÃ£o improvisar compartilhamento de cookies.

Autenticar a conexÃ£o nÃ£o autoriza cada assinatura ou entrega. Validar origem, sessÃ£o e mensagens sÃ£o controles distintos. [OWASP â€” seguranÃ§a de WebSocket](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

### 13.3 Protocolo mÃ­nimo

| Comando/evento | ConteÃºdo mÃ­nimo |
| --- | --- |
| subscribe | requestId, resourceType permitido, resourceId ou descriÃ§Ã£o de lista allowlisted. |
| subscribed | subscriptionId gerado pelo servidor, recurso autorizado e revisÃ£o de referÃªncia. |
| unsubscribe | subscriptionId da prÃ³pria conexÃ£o. |
| resource_changed | eventId, resourceType, resourceId autorizado, version e occurredAt. |
| access_changed | InvalidaÃ§Ã£o de contexto, sem conteÃºdo do recurso perdido. |
| subscription_denied | CÃ³digo seguro e requestId; sem informar tenant proprietÃ¡rio. |
| heartbeat/pong | SaÃºde da conexÃ£o, com limites. |

O cliente nÃ£o envia nome bruto de room como tenant:qualquer_uuid. O servidor resolve a sala lÃ³gica depois de autorizar o recurso. Nomes de sala nÃ£o sÃ£o credenciais.

Para CRM-007, assinar mudanÃ§as dos recursos/escopos jÃ¡ criados em CRM-001/003/005. O contrato de atribuiÃ§Ã£o existe; a interface completa de CRM-006 pode chegar depois sem exigir outra polÃ­tica de rooms.

### 13.4 Autorizar tambÃ©m a entrega

1. Handshake verifica identidade e contexto atual.
2. Subscribe verifica permissÃ£o da operaÃ§Ã£o de leitura e escopo do recurso.
3. NotificaÃ§Ã£o oriunda de outbox Ã© candidata a entrega, nÃ£o prova de que o destinatÃ¡rio ainda tem acesso.
4. Antes do envio, revalidar concessÃµes/revisÃµes e relaÃ§Ã£o do recurso com contato/setor/responsÃ¡vel.
5. Se o contexto nÃ£o puder ser validado, nÃ£o enviar conteÃºdo.
6. Fanout usa lote/Ã­ndices para reduzir consultas, mantendo a garantia de atualizaÃ§Ã£o das revisÃµes; cache positivo antigo nÃ£o Ã© suficiente.
7. Mesmo evento minimalista pode revelar a existÃªncia de um ID. NÃ£o transmitir IDs de recursos nÃ£o autorizados numa sala geral do tenant.
8. O cliente deduplica eventId, compara resourceVersion e reconsulta DTO autorizado.
9. A API reautoriza a leitura causada pelo evento; o socket nÃ£o libera automaticamente o fetch.
10. Em logout, suspensÃ£o, saÃ­da de setor ou mudanÃ§a de cargo, encerrar/remover assinaturas afetadas e limpar estado de interface.

Eventos de revogaÃ§Ã£o aceleram o encerramento. A verificaÃ§Ã£o de autoridade antes de novas entregas precisa impedir vazamento mesmo se o aviso de revogaÃ§Ã£o se perder. Medir e documentar o tempo de encerramento operacional; nÃ£o chamar um TTL longo de revogaÃ§Ã£o imediata.

### 13.5 ReconexÃ£o e catch-up

A estratÃ©gia inicial recupera **estado e histÃ³rico do banco**, sem prometer replay integral de todos os eventos de transporte.

1. Reconectar com backoff exponencial, jitter e limite; pausar quando offline.
2. Autenticar e resolver contexto novamente.
3. Refazer apenas assinaturas ainda necessÃ¡rias Ã  tela e autorizadas.
4. Reconsultar listas/detalhes; cursores de pÃ¡ginas podem precisar ser reiniciados para nova consulta.
5. Para conversa, pedir mensagens depois da Ãºltima sequence confirmada, com paginaÃ§Ã£o.
6. Na abertura inicial, assinar e buscar snapshot/histÃ³rico de modo a cobrir a corrida entre consulta e assinatura; deduplicar o que chegou pelos dois caminhos.
7. Repetir catch-up atÃ© alcanÃ§ar o limite de referÃªncia da consulta e depois revalidar se houve novas alteraÃ§Ãµes.
8. Versionar recursos e ignorar notificaÃ§Ãµes mais antigas que o estado jÃ¡ confirmado.
9. Se retenÃ§Ã£o removeu o intervalo, responder â€œresincronizaÃ§Ã£o necessÃ¡riaâ€ e carregar estado/histÃ³rico ainda disponÃ­vel.
10. Se o recurso deixou de ser autorizado, removÃª-lo do estado local; nÃ£o reapresentar snapshot antigo.

NÃ£o usar timestamp ou ordem de chegada como garantia de ordem de negÃ³cio. IDs UUID de eventos tambÃ©m nÃ£o sÃ£o cursor monotÃ´nico. Mensagens usam sequence transacional por conversa; outras telas reconsultam o estado canÃ´nico.

### 13.6 MÃºltiplas instÃ¢ncias e infraestrutura

- Registro local de conexÃµes por instÃ¢ncia; Redis distribui avisos entre instÃ¢ncias quando necessÃ¡rio.
- Outbox/dedupe persistentes sustentam processamento; Pub/Sub nÃ£o guarda todo evento perdido durante desconexÃ£o.
- Estado de conversa e histÃ³rico no PostgreSQL permitem recuperaÃ§Ã£o.
- Consumidores tratam repetiÃ§Ã£o e desordem por eventId/versÃ£o.
- Queda de Redis marca realtime como indisponÃ­vel/degradado; HTTP autorizado continua utilizÃ¡vel quando suas prÃ³prias dependÃªncias estÃ£o saudÃ¡veis.
- NÃ£o cair para fanout global sem filtro como fallback.
- Heartbeat detecta conexÃµes mortas e libera recursos.
- Limitar conexÃµes por sessÃ£o/membership/tenant, inscriÃ§Ãµes por conexÃ£o, taxa e tamanho de mensagens.
- Configurar backpressure: cliente lento nÃ£o pode criar buffer sem limite. Encerrar com cÃ³digo seguro e permitir resincronizaÃ§Ã£o.
- NÃ£o enviar bytes de anexos pelo socket neste recorte.
- Dados de presenÃ§a/digitaÃ§Ã£o tÃªm contrato e retenÃ§Ã£o prÃ³prios; nÃ£o implementÃ¡-los implicitamente como â€œonlineâ€ global.

OrÃ§amentos iniciais de ensaio, ajustÃ¡veis em configuraÃ§Ã£o: 5 conexÃµes por membership, 30 assinaturas por conexÃ£o, mensagens de controle atÃ© 16 KiB, handshake timeout de 10 s e heartbeat de 30 s. Testar ambiente/proxy antes de adotÃ¡-los como valores de produÃ§Ã£o.

### 13.7 Passos e arquivos

- [ ] **CRM-007.A:** registrar protocolo e topologia; conferir plugin/biblioteca compatÃ­vel com Fastify instalado.
- [ ] **CRM-007.B:** adicionar schemas de controle/eventos e testes de contrato.
- [ ] **CRM-007.C:** implementar gateway/serviÃ§o de assinaturas em 06-inbox, com interfaces pÃºblicas para eventos de CRM.
- [ ] **CRM-007.D:** integrar auth compartilhada e revisÃ£o de acesso sem copiar lÃ³gica de autorizaÃ§Ã£o.
- [ ] **CRM-007.E:** conectar outbox/relay/broker e distribuiÃ§Ã£o entre instÃ¢ncias.
- [ ] **CRM-007.F:** criar conexÃ£o compartilhada da feature/workspace com lifecycle por tenant; evitar um socket por card.
- [ ] **CRM-007.G:** implementar dedupe, invalidaÃ§Ã£o e catch-up paginado via HTTP.
- [ ] **CRM-007.H:** exercitar revogaÃ§Ã£o, perda de eventos, reconexÃ£o, cliente lento e duas instÃ¢ncias.
- [ ] **CRM-007.I:** documentar mÃ©tricas, estado degradado e runbook.

### 13.8 CritÃ©rios de aceite

| ID | CenÃ¡rio obrigatÃ³rio |
| --- | --- |
| C7-01 | Cookie invÃ¡lido/platform, sessÃ£o vencida/revogada ou origin indevida nÃ£o abre conexÃ£o autorizada. |
| C7-02 | InscriÃ§Ã£o em recurso de outro tenant ou fora do escopo Ã© negada sem conteÃºdo. |
| C7-03 | SuspensÃ£o/remoÃ§Ã£o de cargo com socket aberto impede novas entregas indevidas. |
| C7-04 | MudanÃ§a de setor/responsÃ¡vel/contato relacionado reavalia autorizaÃ§Ã£o das assinaturas. |
| C7-05 | Evento repetido ou fora de ordem nÃ£o duplica nota nem regride estado. |
| C7-06 | DesconexÃ£o durante nota/movimento recupera o estado por HTTP e histÃ³rico paginado. |
| C7-07 | Queda de Redis ou de uma instÃ¢ncia nÃ£o provoca vazamento nem perda permanente do estado de negÃ³cio. |
| C7-08 | Duas instÃ¢ncias entregam avisos corretos e respeitam as mesmas revogaÃ§Ãµes. |
| C7-09 | Tamanho/taxa/assinaturas e backpressure sÃ£o limitados e observÃ¡veis. |
| C7-10 | Troca de tenant encerra conexÃ£o anterior e elimina seus dados/assinaturas. |
| C7-11 | Corrida entre snapshot e subscribe nÃ£o perde nota; versÃ£o/sequence e dedupe comprovam recuperaÃ§Ã£o. |
| C7-12 | Nenhum token, texto de mensagem ou dado pessoal Ã© registrado em URL/log de socket. |

## 14. Infraestrutura compartilhada â€” eventos, auditoria e background

### 14.1 Outbox preparada cedo, entrega durÃ¡vel concluÃ­da depois

CRM-001 pode preparar a tabela e o adaptador transacional de outbox porque os prÃ³ximos mÃ³dulos os reutilizam. Isso Ã© trabalho parcial de infraestrutura; nÃ£o significa que MSG-001/002 estejam concluÃ­dos.

Campos mÃ­nimos de OutboxEvent:

- id/eventId, tenantId, name/version e occurredAt.
- actorId do User autor e referÃªncia de actorMembershipId, quando aplicÃ¡vel.
- aggregateType, aggregateId e aggregateVersion.
- correlationId/requestId e data com schema mÃ­nimo.
- status, availableAt, attempts, leasedUntil/leaseOwner e publishedAt.
- Unicidade e Ã­ndices para leitura de pendentes; tenant sempre explÃ­cito.

NÃ£o incluir nome, e-mail, telefone ou texto da mensagem se referÃªncias resolvem a necessidade. A auditoria usa o AuditLog existente com metadados allowlisted; nÃ£o criar um segundo histÃ³rico de auditoria concorrente sÃ³ porque o contrato menciona AuditEvent.

Antes de registrar relaÃ§Ãµes de autoria, confirmar a semÃ¢ntica do actorId atual: User e Membership nÃ£o sÃ£o intercambiÃ¡veis. Acrescentar campo/referÃªncia apropriada sem trocar IDs silenciosamente.

### 14.2 Relay e dedupe â€” MSG-001/002

1. Selecionar eventos pendentes com lease/lock adequado.
2. Publicar apÃ³s commit do negÃ³cio.
3. Repetir com backoff/jitter e tentativas limitadas.
4. Marcar entrega usando condiÃ§Ã£o de lease para evitar disputa entre relays.
5. Deduplicar efeito do consumidor por tenant + consumer + eventId.
6. Gravar o marcador de consumo junto ao efeito quando ele ocorre no mesmo banco.
7. Tratar a queda â€œpublicou e caiu antes de marcarâ€: entrega pode repetir e consumidor deve suportar.
8. Quarentenar/DLQ erros permanentes; permitir reprocessamento auditado, sem ediÃ§Ã£o livre de payload.
9. Expor idade do evento mais antigo, tentativas, falhas e latÃªncia.
10. Definir retenÃ§Ã£o e recuperaÃ§Ã£o antes de apagar outbox/dedupe.
11. NÃ£o prometer exactly-once de transporte. O objetivo Ã© entrega pelo menos uma vez com efeitos idempotentes.
12. AtÃ© o relay estar ativo, nÃ£o exibir uma notificaÃ§Ã£o ou integraÃ§Ã£o como entregue.

A descoberta tÃ©cnica de eventos pendentes precisa de capability prÃ³pria e limitada Ã  outbox/leases, sem acesso global a contatos ou mensagens e sem usar role BYPASSRLS. Depois de obter a referÃªncia validada do evento/job, o consumidor aplica contexto do tenant na sua transaÃ§Ã£o. Separar identidade tÃ©cnica do worker da autoridade humana que originou o efeito. NÃ£o fabricar Membership ou User administrador para executar manutenÃ§Ã£o. Como apps/worker ainda nÃ£o tem implementaÃ§Ã£o operacional observada, MSG-002 tambÃ©m deve incluir pacote, entrypoint, configuraÃ§Ã£o validada, startup/shutdown e supervisÃ£o do processo.

Jobs pequenos e idempotentes simplificam recuperaÃ§Ã£o de falha. O jobId da fila, sozinho, nÃ£o substitui a unicidade do efeito no banco. [BullMQ â€” jobs idempotentes](https://docs.bullmq.io/patterns/idempotent-jobs).

### 14.3 CatÃ¡logo inicial de eventos

| Nome proposto | Dados de negÃ³cio mÃ­nimos |
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
| crm.contact.assigned.v1 | contactId, version, referÃªncias de destino necessÃ¡rias. |
| crm.deal.assigned.v1 | dealId, version, referÃªncias de destino necessÃ¡rias. |
| inbox.conversation.assigned.v1 | conversationId, version, referÃªncias de destino necessÃ¡rias. |

SÃ£o contratos a registrar e validar, nÃ£o strings livres. Publicar somente nomes realmente consumidos ou necessÃ¡rios ao histÃ³rico de integraÃ§Ã£o. Actor/correlation/tenant vÃªm do envelope, nÃ£o do formulÃ¡rio.

### 14.4 ImportaÃ§Ã£o em background â€” expansÃ£o apÃ³s o MVP

Ativar quando arquivos maiores forem necessÃ¡rios e MSG-001/002 + storage privado estiverem prontos.

- Upload autenticado privado, limitado e temporÃ¡rio; usar streaming/adaptador de armazenamento, nÃ£o array gigante em Server Action.
- Job no PostgreSQL como fonte de estado: queued, validating, processing, completed, completed_with_errors, failed ou cancelled.
- POST retorna 202 somente apÃ³s persistir job e intenÃ§Ã£o durÃ¡vel de processamento.
- Payload da fila contÃ©m IDs, tenant e correlation; arquivo/linhas ficam em storage privado/banco conforme retenÃ§Ã£o.
- Revalidar identidade do solicitante, membership, escopo e quota no inÃ­cio e a cada bloco; nÃ£o usar permissÃ£o congelada do instante do upload.
- Reutilizar validaÃ§Ã£o de contato/campo; nÃ£o copiar lÃ³gica do importador sÃ­ncrono.
- Processar blocos pequenos com idempotÃªncia por job/linha; retries nÃ£o repetem contatos jÃ¡ confirmados.
- Progresso Ã© baseado em contagem real; distinguir lidas, validadas, criadas, ignoradas e rejeitadas.
- Cancelamento interrompe blocos futuros; nÃ£o desfaz automaticamente blocos jÃ¡ confirmados.
- Falha parcial tem relatÃ³rio e retomada explÃ­cita. NÃ£o chamar essa semÃ¢ntica de rollback integral.
- â€œDesfazer importaÃ§Ã£oâ€ futura exige verificar se os contatos criados foram alterados ou ganharam relaÃ§Ãµes; nÃ£o executar DELETE indiscriminado.
- Remover arquivos temporÃ¡rios por rotina monitorada; limitar retenÃ§Ã£o de erros contendo PII.
- Autorizar consulta, cancelamento, download de erros e retomada por ator/tenant/escopo atual.
- Testar worker duplicado, queda no meio do bloco, quota concorrente, campo alterado, suspensÃ£o e exclusÃ£o de arquivo.

NÃ£o ampliar silenciosamente o endpoint sÃ­ncrono para semÃ¢ntica assÃ­ncrona. Criar/versar o contrato e adaptar a UI com estado persistente.



## 15. Contratos HTTP, erros e idempotÃªncia

### 15.1 OrganizaÃ§Ã£o de contratos

Criar arquivos temÃ¡ticos, evitando transformar packages/contracts/src/index.ts num arquivo de todo o CRM:

| Grupo proposto | ConteÃºdo |
| --- | --- |
| src/crm/contact.ts | Create/Update/List/Detail e projeÃ§Ãµes. |
| src/crm/custom-field.ts | DefiniÃ§Ã£o discriminada por tipo e alteraÃ§Ãµes de valor. |
| src/crm/contact-import.ts | PrÃ©via, seleÃ§Ã£o, confirmaÃ§Ã£o, resultado e limites. |
| src/crm/filter.ts | AST e ordenaÃ§Ãµes permitidas. |
| src/crm/tag.ts e segment.ts | GestÃ£o, associaÃ§Ã£o e consulta. |
| src/crm/pipeline.ts e deal.ts | ConfiguraÃ§Ã£o, transiÃ§Ã£o, histÃ³rico e dinheiro. |
| src/inbox/conversation.ts e message.ts | Conversas, notas, paginaÃ§Ã£o e leitura. |
| src/assignment.ts | Destino/claim/release, sem repositÃ³rio genÃ©rico. |
| src/realtime.ts | Protocolo de controle e avisos mÃ­nimos. |

Os nomes de arquivo sÃ£o propostos; ajustar ao padrÃ£o real da branch sem duplicar contratos existentes. Exportar inicialmente pelo ponto pÃºblico atual. Se adicionar subpath exports, atualizar package.json/build/consumidores e testar Node/Next.

Todo schema de entrada Ã© estrito e limitado. DTO pÃºblico Ã© independente do retorno completo do Prisma: nÃ£o usar include de User/Membership e devolver a Ã¡rvore inteira.

### 15.2 Listas, busca e paginaÃ§Ã£o

- Forma comum: data + nextCursor; hasMore/contagem somente quando definidos no contrato.
- Cursor opaco, limitado e validado; inclui ordenaÃ§Ã£o/desempate e vÃ­nculo com o filtro quando necessÃ¡rio.
- Cursor nÃ£o substitui auth. TrocÃ¡-lo de tenant/membership/consulta deve falhar ou reiniciar consulta com seguranÃ§a.
- Busca simples sem dados pessoais pode usar parÃ¢metros; filtros com e-mails, telefones ou outros valores pessoais usam POST de busca/prÃ©via, com logs de body desabilitados.
- Acrescentar POST /crm/contacts/search, /crm/deals/search e /inbox/conversations/search quando esses filtros forem habilitados; todos usam o mesmo serviÃ§o da listagem.
- Campos de sort sÃ£o enumerados; valores nÃ£o podem virar nomes de coluna diretamente.
- Listas de IDs sÃ£o limitadas; projeÃ§Ãµes e relaÃ§Ãµes sÃ£o autorizadas.
- Em listas mutÃ¡veis, nÃ£o prometer snapshot estÃ¡vel entre pÃ¡ginas sem uma implementaÃ§Ã£o prÃ³pria. Revalidar em mutaÃ§Ã£o/reconexÃ£o e documentar o comportamento.
- Busca de nome precisa de semÃ¢ntica definida de acento/case; nÃ£o simular busca parcial com filtro local apenas sobre a pÃ¡gina.

### 15.3 Erros

Preservar a forma canÃ´nica error.code, error.message e error.requestId. Mensagens pÃºblicas em pt-BR, sem SQL/stack/detalhes internos.

| SituaÃ§Ã£o | HTTP proposto | CÃ³digo tÃ©cnico |
| --- | --- | --- |
| NÃ£o autenticado/sessÃ£o invÃ¡lida | 401 | AUTH_REQUIRED |
| OperaÃ§Ã£o sem permissÃ£o | 403 | PERMISSION_DENIED |
| Tenant selecionado inacessÃ­vel | 403 | TENANT_ACCESS_DENIED |
| Recurso ausente ou nÃ£o visÃ­vel | 404 | NOT_FOUND |
| Estrutura invÃ¡lida | 400 | VALIDATION_FAILED |
| Dados de domÃ­nio invÃ¡lidos | 422 | VALIDATION_FAILED ou cÃ³digo especÃ­fico registrado |
| VersÃ£o antiga | 409 | CONFLICT |
| PrÃ©via/campo/seleÃ§Ã£o mudou | 409 | CRM_IMPORT_PREVIEW_STALE â€” novo |
| PrÃ©via expirada | 410 | CRM_IMPORT_EXPIRED â€” novo |
| DependÃªncia impede arquivamento | 409 | CRM_RESOURCE_IN_USE â€” novo |
| Quota excedida | 409 | CRM_LIMIT_REACHED â€” novo |
| Payload maior que o permitido | 413 | PAYLOAD_TOO_LARGE â€” novo |
| Limite de requisiÃ§Ãµes | 429 | AUTH_RATE_LIMITED ou cÃ³digo transversal existente adequado |
| Infra necessÃ¡ria indisponÃ­vel | 503 | SERVICE_UNAVAILABLE |
| Falha inesperada | 500 | INTERNAL_ERROR |

Registrar cÃ³digos novos no catÃ¡logo e schemas. NÃ£o tratar todo erro como 403. NÃ£o expor campos/IDs de recursos ocultos em detalhes de conflito.

Erros de formulÃ¡rio precisam de estrutura tipada para caminhos e mensagens. A extensÃ£o deve ser feita no contrato compartilhado e em todos os consumidores afetados: o envelope atual Ã© strict, portanto acrescentar propriedades nÃ£o Ã© automaticamente compatÃ­vel com leitores antigos.

Na prÃ©via de importaÃ§Ã£o, rowIssues Ã© DTO prÃ³prio, com Ã­ndice lÃ³gico, campo e cÃ³digo; evitar repetir a linha inteira em cada erro.

### 15.4 Regras de idempotÃªncia

- Chave no escopo tenant + ator + operaÃ§Ã£o, com tamanho/formato limitados.
- Mesma chave + mesma intenÃ§Ã£o confirmada retorna o resultado compatÃ­vel.
- Mesma chave + intenÃ§Ã£o diferente retorna CONFLICT.
- Constraints/locks no banco protegem requisiÃ§Ãµes simultÃ¢neas.
- Usar representaÃ§Ã£o canÃ´nica da intenÃ§Ã£o para hash; nÃ£o comparar JSON por ordem incidental de propriedades.
- Revalidar sessÃ£o e autorizaÃ§Ã£o antes de retornar um resultado idempotente antigo.
- Resultado guardado nÃ£o dÃ¡ acesso permanente a dados que o usuÃ¡rio deixou de poder ler.
- NÃ£o repetir automaticamente mutaÃ§Ã£o sem chave.
- Explicitar janela de retenÃ§Ã£o; depois dela, o cliente nÃ£o pode tratar retry antigo como garantidamente seguro.
- Atualizar contato nÃ£o significa substituir todos os campos por dados importados: importaÃ§Ã£o inicial Ã© create-only.

## 16. ExperiÃªncia, operaÃ§Ã£o e critÃ©rios nÃ£o visuais

### 16.1 Jornadas completas

| Jornada | InÃ­cio â†’ fim verificÃ¡vel |
| --- | --- |
| Primeiro uso | Lista vazia â†’ novo contato â†’ detalhe real â†’ retorno Ã  lista. |
| PersonalizaÃ§Ã£o | Criar campo â†’ preencher contato â†’ filtrar valor â†’ editar definiÃ§Ã£o permitida. |
| ImportaÃ§Ã£o | Arquivo â†’ mapa â†’ revisÃ£o â†’ confirmaÃ§Ã£o â†’ resultado â†’ consultar contatos. |
| OrganizaÃ§Ã£o | Criar tag â†’ aplicar â†’ salvar segmento â†’ observar reavaliaÃ§Ã£o. |
| Venda | Configurar pipeline â†’ criar negÃ³cio â†’ mover por regra â†’ consultar histÃ³rico. |
| Atendimento | Abrir contato/conversa â†’ registrar nota interna â†’ marcar leitura â†’ resolver. |
| DistribuiÃ§Ã£o | Escolher fila/membro â†’ transferir â†’ notificar â†’ verificar retirada/manutenÃ§Ã£o de acesso. |
| RecuperaÃ§Ã£o | Perder rede/sessÃ£o â†’ preservar intenÃ§Ã£o segura â†’ reautenticar/reconsultar â†’ evitar repetiÃ§Ã£o. |

### 16.2 PadrÃµes obrigatÃ³rios de interface

- Usar PageHeader, DataTable, Dialog/Drawer, Input, Select/Combobox, Alert, EmptyState e demais exports reais de packages/ui.
- Usar react-hook-form e Zod conforme as regras do produto.
- NÃ£o recriar cores, botÃµes, alturas ou modais especÃ­ficos para cada card.
- TÃ­tulos Inter e corpo Poppins; light/dark/sistema; tokens canÃ´nicos.
- Loading local, empty orientado, error acionÃ¡vel, success verdadeiro e disabled explicado.
- Erro impeditivo permanece visÃ­vel; toast nÃ£o Ã© seu Ãºnico local.
- Label visÃ­vel e mensagem associada ao campo; foco no primeiro erro quando apropriado.
- Inputs nÃ£o perdem conteÃºdo em 4xx/5xx ou timeout; nÃ£o mostrar sucesso antes da confirmaÃ§Ã£o.
- Nome/e-mail/telefone reais nÃ£o entram em analytics ou gravaÃ§Ã£o automÃ¡tica de suporte.
- â€œZeroâ€ apenas para contagem confirmada; estado indisponÃ­vel usa mensagem/indicador apropriado.
- PermissÃµes afetam leitura/ediÃ§Ã£o de cada aÃ§Ã£o; a API continua sendo autoridade.
- ConfirmaÃ§Ã£o proporcional para arquivo/lote/transferÃªncia/arquivamento; nÃ£o pedir modal extra para cada aÃ§Ã£o reversÃ­vel trivial.
- Detalhe mostra origem, criaÃ§Ã£o, Ãºltima alteraÃ§Ã£o, responsÃ¡vel e histÃ³rico permitido.
- SeleÃ§Ã£o em massa informa quantidade e â€œnesta pÃ¡ginaâ€; nÃ£o sugerir seleÃ§Ã£o de toda a base.
- Reflow desde 320 px; testar 360, 768, 1024 e desktop, zoom, teclado virtual e safe-area.
- Reduced motion, retorno de foco e alternativa ao drag fazem parte do aceite.

### 16.3 ConsistÃªncia de cache e rascunhos

Escolher o mecanismo de query/cache jÃ¡ adotado ou registrar uma escolha compartilhada para CRM/inbox. NÃ£o introduzir bibliotecas diferentes por card.

- Chaves por tenant + membership + revisÃ£o de autorizaÃ§Ã£o + consulta.
- Invalidar a entidade, listas/contagens afetadas e relaÃ§Ãµes autorizadas apÃ³s mutaÃ§Ã£o.
- Revalidar no foco e por evento conforme necessidade; cancelar request obsoleto.
- Trocar de tenant remove seleÃ§Ã£o, dados, sockets e rascunhos do contexto anterior.
- Manter rascunho em memÃ³ria da sessÃ£o/feature; persistÃªncia em disco exige polÃ­tica especÃ­fica.
- Em conflito, oferecer atualizar dados confirmados e reaplicar intenÃ§Ã£o manualmente; nÃ£o sobrescrever silenciosamente.
- NÃ£o armazenar payload de contatos/conversas em cache pÃºblico, service worker ou fallback offline sem contrato prÃ³prio.

### 16.4 Observabilidade

Registrar mÃ©tricas e logs estruturados minimizados:

| Ãrea | Medir |
| --- | --- |
| API | LatÃªncia p50/p95, erro por cÃ³digo, timeout e rejeiÃ§Ã£o de limites. |
| Banco | Queries lentas, locks, tamanho/uso de Ã­ndices e duraÃ§Ã£o transacional. |
| ImportaÃ§Ã£o | Linhas, bytes, duraÃ§Ã£o de prÃ©via/commit, conflitos, expiraÃ§Ã£o e retries deduplicados. |
| AutorizaÃ§Ã£o | Negativas por categoria e revisÃ£o; sem dump de concessÃµes ou identidade pessoal em labels. |
| Outbox/fila | Backlog, idade do evento mais antigo, tentativas, DLQ e atraso de entrega. |
| Realtime | ConexÃµes, inscriÃ§Ãµes, recusas, reconexÃ£o, backpressure e atraso de invalidaÃ§Ã£o. |
| UX | Falhas por etapa e conclusÃ£o de jornada, sem conteÃºdo digitado. |
| RetenÃ§Ã£o | Itens expirados pendentes de purga e execuÃ§Ã£o da rotina de limpeza. |

RequestId e correlationId precisam ser limitados/validados antes de refletir cabeÃ§alhos. IDs arbitrÃ¡rios recebidos nÃ£o podem gerar injeÃ§Ã£o em log nem cardinalidade ilimitada em mÃ©tricas.

### 16.5 OrÃ§amento de desempenho para validaÃ§Ã£o

Valores abaixo sÃ£o metas iniciais de laboratÃ³rio, **nÃ£o resultados medidos**:

- Listagem/detalhe: p95 atÃ© 500 ms no backend em ambiente de ensaio documentado.
- MutaÃ§Ã£o simples: p95 atÃ© 800 ms, excluindo WAN do navegador.
- Commit do CSV de 500 linhas: alvo atÃ© 5 s, dentro do timeout transacional existente.
- Realtime: medir commit atÃ© UI e revogaÃ§Ã£o atÃ© bloqueio; definir SLO apÃ³s teste com a topologia real.
- Usar datasets sintÃ©ticos representativos: pelo menos dois tenants, um com 10 mil e outro com 100 mil contatos, alÃ©m de mensagens/negÃ³cios suficientes para exercitar paginaÃ§Ã£o.
- NÃ£o exigir benchmark de 100 mil registros em toda alteraÃ§Ã£o de texto; executar na fundaÃ§Ã£o de consulta/Ã­ndices e quando houver risco de regressÃ£o.
- Inspecionar EXPLAIN (ANALYZE, BUFFERS) em ambiente de ensaio para as queries crÃ­ticas.
- NÃ£o medir uma base vazia e concluir que JSONB/segmentaÃ§Ã£o escala.

Se a meta nÃ£o for cumprida, registrar hardware, concorrÃªncia e gargalo; reduzir limite ou melhorar query antes de prometer volume maior.

### 16.6 RetenÃ§Ã£o e governanÃ§a

- Contato arquivado permanece consultÃ¡vel por quem tem contacts.read no recurso, com indicaÃ§Ã£o de estado; lista comum filtra ativos. Isso preserva contexto histÃ³rico autorizado.
- Arquivamento nÃ£o Ã© expurgo. NÃ£o apagar histÃ³rico por cascata.
- Definir retenÃ§Ã£o de notas, contatos, auditoria, blobs e backups na configuraÃ§Ã£o operacional do produto antes da liberaÃ§Ã£o correspondente; nÃ£o inventar prazo legal neste roteiro.
- ImportaÃ§Ã£o tem TTL tÃ©cnico explÃ­cito na seÃ§Ã£o 7, com limpeza testada.
- Cadastro/importaÃ§Ã£o nÃ£o significa opt-in de marketing, aceite de canal ou autorizaÃ§Ã£o de disparo.
- NÃ£o coletar campos sensÃ­veis â€œpara talvez usarâ€; documentar finalidade dos campos.
- ExportaÃ§Ã£o, correÃ§Ã£o e exclusÃ£o definitiva precisam de fluxo autorizado, escopo e auditoria prÃ³prios.
- ConfiguraÃ§Ãµes de entitlement nÃ£o podem apagar dados automaticamente quando um plano Ã© reduzido.
- Impedir credenciais, documentos secretos ou tokens em customFields/notas por orientaÃ§Ã£o e controles compatÃ­veis; nÃ£o anunciar detecÃ§Ã£o infalÃ­vel.

## 17. EstratÃ©gia de testes e evidÃªncias

### 17.1 Camadas de validaÃ§Ã£o

| Tipo | Prova esperada |
| --- | --- |
| Unidade de domÃ­nio | NormalizaÃ§Ã£o, campos, filtros, transiÃ§Ãµes, elegibilidade e mÃ¡quinas de estado. |
| Contrato | Schemas/DTOs, limites, erros e compatibilidade de eventos. |
| IntegraÃ§Ã£o com PostgreSQL | RLS, FKs, locks, versionamento, quotas, idempotÃªncia e rollback. |
| IntegraÃ§Ã£o com Redis/worker | Retry, dedupe, perda/reordenaÃ§Ã£o e recuperaÃ§Ã£o de infraestrutura. |
| API por injeÃ§Ã£o/HTTP | Rotas registradas, auth real do cenÃ¡rio, cÃ³digos e serializaÃ§Ã£o. |
| E2E de produto | Jornadas com banco, sessÃ£o e interface conectados; nÃ£o apenas mocks. |
| UI/acessibilidade | Teclado, foco, responsividade, temas e reduced motion. |
| Carga direcionada | Consultas/importaÃ§Ã£o/realtime contra volume relevante. |

Mock nÃ£o prova RLS; build nÃ£o prova revogaÃ§Ã£o; um helper de evento nÃ£o prova relay. O caso negativo precisa falhar pelo motivo esperado, nÃ£o por serviÃ§o desligado.

### 17.2 Fixtures mÃ­nimas

- Tenant A e Tenant B.
- ProprietÃ¡rio protegido, gerente com leitura ampla/ediÃ§Ã£o setorial, agente com OWN/ASSIGNED e usuÃ¡rio somente leitura.
- Pessoa com memberships em ambos os tenants, sem compartilhar permissÃµes.
- Membro suspenso; vÃ­nculo removido de setor; cargo revogado/expirado.
- Dois setores em A e um em B; cargo global e cargo setorial.
- Contatos e negÃ³cios com/sem setor e responsÃ¡vel.
- Campos com false, zero, ausÃªncia, select arquivado e texto potencialmente malicioso.
- Conversas e notas sintÃ©ticas; nunca copiar conversas reais para teste.
- SessÃµes tenant/platform distintas e cenÃ¡rios de cache revogado.

### 17.3 Casos transversais obrigatÃ³rios

| ID | ValidaÃ§Ã£o |
| --- | --- |
| T-01 | Query sem contexto nÃ£o lÃª/escreve tabelas de tenant. |
| T-02 | UUID real de B em request de A nÃ£o atravessa serviÃ§o nem FK/RLS. |
| T-03 | Membership em dois tenants nÃ£o mistura roles, cache, segmentos, rascunhos ou sockets. |
| T-04 | read TENANT + update DEPARTMENT permanece ediÃ§Ã£o apenas no departamento concedido. |
| T-05 | Departamento adicional sem concessÃ£o nÃ£o amplia o escopo de cargo de outro setor. |
| T-06 | SessÃ£o invÃ¡lida/revogada e membro/tenant inativos negam API direta, Action e socket. |
| T-07 | RevogaÃ§Ã£o concorrente e Redis indisponÃ­vel nÃ£o mantÃªm acesso por cache positivo antigo. |
| T-08 | Listagem, detalhe, count, lookup, relatÃ³rio e evento obedecem ao mesmo limite de recurso. |
| T-09 | Payload extra nÃ£o altera tenant, autoria, estado interno ou atribuiÃ§Ã£o por caminho alternativo. |
| T-10 | Rollback remove entidade/alteraÃ§Ã£o, auditoria de sucesso e outbox associados. |
| T-11 | Erros/logs/telemetria nÃ£o contÃªm arquivo, PII, token, cookie, SQL ou texto de nota. |
| T-12 | Mesmo request concorrente/idempotente nÃ£o duplica efeito. |
| T-13 | Pool de conexÃµes nÃ£o reaproveita contexto de tenant apÃ³s commit/rollback. |
| T-14 | CSRF/origin/host invÃ¡lidos nÃ£o acionam mutaÃ§Ãµes autenticadas por cookie. |
| T-15 | PublicaÃ§Ã£o de evento anterior Ã  revogaÃ§Ã£o nÃ£o autoriza entrega posterior sem revalidaÃ§Ã£o. |
| T-16 | Compatibilidade de permissÃµes nÃ£o concede aÃ§Ãµes novas a papÃ©is legados por acidente. |

Os casos especÃ­ficos C1 a C7 estÃ£o em cada card. Associar cada critÃ©rio a um teste ou evidÃªncia manual reproduzÃ­vel; critÃ©rios crÃ­ticos de seguranÃ§a/atomicidade precisam de teste automatizado com infraestrutura adequada.

### 17.4 Ajustar a descoberta de testes

O script atual da API procura testes em src/tests, enquanto o esqueleto dos mÃ³dulos possui suas prÃ³prias pastas tests. NÃ£o criar testes â€œinvisÃ­veisâ€ ao gate.

Escolher e documentar uma estratÃ©gia Ãºnica:

- incluir mÃ³dulos no runner, enumerando explicitamente os arquivos por script portÃ¡til; ou
- manter testes executÃ¡veis na Ã¡rvore existente com nomes por domÃ­nio.

Se criar script test:crm/test:inbox/test:realtime, adicionÃ¡-lo de fato ao package.json e ao gate pertinente. Validar o nÃºmero de arquivos executados. Um comando que termina com zero testes nÃ£o Ã© evidÃªncia de sucesso.

## 18. Comandos, mudanÃ§as de arquivos e forma de entrega

### 18.1 InventÃ¡rio de arquivos por entrega

| Entrega | Ãreas de criaÃ§Ã£o/alteraÃ§Ã£o |
| --- | --- |
| PreparaÃ§Ã£o | contracts de contexto, auth/policies e sessÃ£o, middleware API, api-client, config, docs/decisions e evidÃªncias. |
| CRM-001 | packages/db/prisma; contracts/crm; 05-crm; features/crm; rotas /contacts e fields; navegaÃ§Ã£o; events mÃ­nimo. |
| CRM-002 | Modelos Tag/ContactTag/Segment; filtros compartilhados; serviÃ§os/controllers; gestÃ£o e seleÃ§Ã£o na feature. |
| CRM-003 | Modelos Pipeline/Stage/Deal/History; regras; serviÃ§os; configuraÃ§Ãµes e editor de negÃ³cio. |
| CRM-004 | Queries/projeÃ§Ãµes do quadro; componentes de lista/card; rota /crm; composiÃ§Ã£o com inbox. |
| CRM-005 | Modelos de conversa/nota/leitura; contracts/inbox; 06-inbox; features/inbox; rota /inbox. |
| CRM-006 | Contratos de atribuiÃ§Ã£o; interfaces pÃºblicas de team; serviÃ§os por recurso; notificaÃ§Ãµes e UI de encaminhamento. |
| CRM-007 | Contratos realtime; gateway/assinaturas; auth/contexto; integraÃ§Ã£o broker; conexÃ£o do painel e configuraÃ§Ã£o do proxy. |
| MSG-001/002 | Outbox/relay/dedupe, worker, jobs, DLQ, configuraÃ§Ã£o e operaÃ§Ã£o. |
| Todas | Testes relevantes; docs/taskboard.json; Markdown gerado; evidÃªncia versionada e READMEs afetados. |

NÃ£o criar arquivos vazios para â€œcumprir arquiteturaâ€. Cada mÃ³dulo deve ter responsabilidades e imports reais, sem circularidade.

### 18.2 Comandos existentes a reutilizar

Conferir scripts da branch antes de executar. InstalaÃ§Ã£o e geraÃ§Ã£o nÃ£o aplicam migration.

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

ObservaÃ§Ãµes:

- test:integration atual cobre um arquivo da fundaÃ§Ã£o; ampliÃ¡-lo/integrÃ¡-lo aos testes novos antes de usÃ¡-lo como prova de CRM.
- Rodar lint/typecheck/testes dos pacotes alterados, conforme seus scripts reais.
- Contratos/auth/eventos compartilhados podem afetar outras superfÃ­cies; buildar consumidores atingidos pela mudanÃ§a.
- Para testes de UI compartilhada, reutilizar pnpm ui:smoke quando houver alteraÃ§Ã£o no design system.
- Para jornadas CRM, criar testes Playwright prÃ³prios e executÃ¡-los, por exemplo pelo pacote @bipesend/e2e-tests com os caminhos reais dos arquivos criados.
- NÃ£o usar comandos de migration/reset/seed por cÃ³pia deste bloco. Seguir P-02 e o SQL revisado no ambiente autorizado.
- NÃ£o registrar segredos, dumps ou bodies de resposta sensÃ­veis como saÃ­da de teste.

### 18.3 SequÃªncia de validaÃ§Ã£o por fatia

1. Testes de domÃ­nio/contrato da mudanÃ§a.
2. IntegraÃ§Ã£o de banco para as invariantes alteradas.
3. API e interface conectadas no caminho principal e falhas relevantes.
4. Gate compartilhado exigido pelas regras.
5. Build dos consumidores afetados.
6. RevisÃ£o de teclado/mobile/estados quando a interface mudou.
7. AtualizaÃ§Ã£o de evidÃªncias e taskboard.
8. RevisÃ£o do diff: migraÃ§Ã£o, compatibilidade, acessos, dados e componentes.

Repetir ou ampliar testes quando houver risco concreto restante, nÃ£o por ritual. Se faltar infraestrutura, deixar o gate explicitamente pendente; nÃ£o substituir por mock e declarar a mesma prova.

### 18.4 Modelo de evidÃªncia do card

Criar registro em docs/audit com nome estÃ¡vel do card/entrega:

~~~markdown
# EvidÃªncia â€” CRM-001

- Commit/branch avaliados:
- Ambiente e versÃµes relevantes:
- DependÃªncias conferidas:
- CritÃ©rios de aceite cobertos:
- Arquivos e contratos alterados:
- Migration criada e ambiente em que foi ensaiada:
- Comandos realmente executados:
- Resultados e quantidade de testes:
- CenÃ¡rios negativos:
- MediÃ§Ãµes relevantes:
- RevisÃ£o de teclado/mobile/temas:
- LimitaÃ§Ãµes/bloqueios:
- Efeito de rollback e procedimento:
- Estado correto do card:
~~~

EvidÃªncia deve descrever o cÃ³digo executado. Registrar histÃ³rico de falha/correÃ§Ã£o sem substituir resultados por uma afirmaÃ§Ã£o genÃ©rica de â€œtestadoâ€.

### 18.5 Plano de liberaÃ§Ã£o e reversÃ£o

- Feature flags controlam exposiÃ§Ã£o gradual, com owner e data de revisÃ£o; nÃ£o substituem autorizaÃ§Ã£o.
- Ensaiar migrations em banco isolado compatÃ­vel e, quando existir dado, em cÃ³pia restaurÃ¡vel autorizada.
- Preferir mudanÃ§as aditivas; backfill pesado separado e monitorado.
- Verificar Ã­ndices/locks/tempo antes de aplicar a ambiente com clientes.
- Publicar componentes compatÃ­veis com o schema durante a transiÃ§Ã£o.
- Em falha, desligar a funcionalidade pela flag/rota e reverter cÃ³digo compatÃ­vel; nÃ£o retornar a caminho antigo que tenha autorizaÃ§Ã£o mais fraca.
- NÃ£o apagar tabelas ou desfazer contatos importados como rollback automÃ¡tico de deploy.
- Contract/descarte de colunas sÃ³ apÃ³s todos os consumidores migrarem e a retenÃ§Ã£o ser resolvida.
- LiberaÃ§Ã£o de canais externos, provedor de mensagem ou importaÃ§Ã£o grande Ã© entrega separada com seus gates.

## 19. Ordem prÃ¡tica de trabalho para o Antigravity

### 19.1 Primeiro ciclo

1. Ler e conferir a referÃªncia atual, regras e cards.
2. Registrar a adoÃ§Ã£o das decisÃµes e o diff necessÃ¡rio de dependÃªncias.
3. Executar P-01/P-02/P-03; localizar a falha concreta antes de refatorar fundaÃ§Ã£o.
4. Validar a ponte autenticada tenant-web â†’ Fastify com um cenÃ¡rio de leitura protegido.
5. Implementar contratos e persistÃªncia de contatos/campos.
6. Entregar criaÃ§Ã£o/listagem/detalhe/ediÃ§Ã£o de contato com testes de tenant e escopo.
7. Conectar /contacts e substituir a prÃ©via /users por redirecionamento.
8. Entregar gestÃ£o de campos e validar o ciclo definiÃ§Ã£o â†’ valor â†’ leitura.
9. Entregar wizard de importaÃ§Ã£o limitado, idempotÃªncia, rollback e expiraÃ§Ã£o.
10. Fechar CRM-001 apenas com os critÃ©rios C1 cumpridos.

### 19.2 Ciclos seguintes

- Tags/filtros/segmentos: CRM-002.
- Pipeline/etapas/negÃ³cios: CRM-003.
- Quadro/lista reais: CRM-004.A.
- Atendimento/notas/histÃ³rico: CRM-005.
- IntegraÃ§Ã£o de visualizaÃ§Ãµes: CRM-004.B e fechamento CRM-004.
- Relay/fila/dedupe: MSG-001/002.
- Realtime e recuperaÃ§Ã£o: CRM-007.
- Encaminhamento, fila, claim e notificaÃ§Ã£o: CRM-006.
- ImportaÃ§Ã£o grande, exportaÃ§Ã£o ampla, merges, canais externos e chat da equipe: expansÃµes explÃ­citas com novos recortes no board.

### 19.3 CondiÃ§Ãµes para seguir sem nova decisÃ£o

Usar os defaults deste roteiro quando ele tiver sido adotado como instruÃ§Ã£o de execuÃ§Ã£o e nÃ£o houver regra mais especÃ­fica conflitante. Ajustes de nomes de arquivo, organizaÃ§Ã£o local e implementaÃ§Ã£o interna podem seguir o padrÃ£o da branch.

Registrar e pedir decisÃ£o somente quando aparecer conflito material, como:

- requisito comercial que imponha identificador de contato exclusivo e rejeite e-mail/telefone compartilhado;
- necessidade de arquivo maior que o recorte sÃ­ncrono antes de existir a infraestrutura assÃ­ncrona;
- necessidade de envio ao cliente ou chat privado da equipe dentro de CRM-005, alterando a fronteira adotada;
- polÃ­tica de acesso que exija sigilo por campo, exceÃ§Ãµes de owner ou ampliaÃ§Ã£o de escopo nÃ£o coberta;
- banco real com histÃ³rico/invariantes incompatÃ­veis que exija operaÃ§Ã£o irreversÃ­vel fora do escopo autorizado.

NÃ£o pedir confirmaÃ§Ã£o repetida para rotinas jÃ¡ autorizadas. Trabalhar a preparaÃ§Ã£o Ãºtil e explicar o impedimento concreto se uma dessas situaÃ§Ãµes bloquear o aceite.

### 19.4 DefiniÃ§Ã£o de pronto do marco

- [ ] Contatos e campos sÃ£o persistentes, tipados e isolados.
- [ ] CSV limitado tem revisÃ£o, idempotÃªncia, limite, atomicidade e limpeza.
- [ ] Tags e segmentos usam filtros seguros e quotas reais.
- [ ] NegÃ³cios tÃªm pipeline/etapa/histÃ³rico e concorrÃªncia correta.
- [ ] Quadro/lista/mobile possuem aÃ§Ãµes reais e alternativa ao drag.
- [ ] Conversas e notas sÃ£o separadas de mensagens externas e de chat da equipe.
- [ ] AtribuiÃ§Ãµes validam setor/cargo/membro e nÃ£o criam concessÃµes implÃ­citas.
- [ ] NotificaÃ§Ã£o/realtime respeitam revogaÃ§Ã£o, duplicidade e reconexÃ£o.
- [ ] NÃ£o hÃ¡ mock demonstrativo apresentado como dado operacional nas rotas entregues.
- [ ] Gates e critÃ©rios estÃ£o ligados a evidÃªncias do commit real.
- [ ] DocumentaÃ§Ã£o/taskboard refletem exatamente o que foi entregue e o que continua pendente.

## 20. Fontes e rastreabilidade

### 20.1 Fontes do projeto

Todas as referÃªncias de cÃ³digo desta anÃ¡lise foram fixadas no commit 95639ef08979d37fd713a5c31c6df3784d4da7f4 para nÃ£o misturar versÃµes. O Antigravity deve comparar o novo checkout antes de executar.

- [Regra mestre e divisÃ£o frontend/backend](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/rules/00_MASTER.md).
- [Regras ativas 01â€“35](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4/rules).
- [Contrato de agentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/AGENTS.md).
- [Taskboard editÃ¡vel](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/taskboard.json).
- [DecisÃµes, incluindo ADR-0012 a ADR-0018](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/decisions.md).
- [Mapa de mÃ³dulos](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/module-map.md).
- [Schema Prisma](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/prisma/schema.prisma).
- [HistÃ³rico de migrations Prisma](https://github.com/projetosdanhub/appbipedev/tree/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/prisma/migrations).
- [Contrato de banco e transaÃ§Ã£o](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/db/README.md).
- [ReconciliaÃ§Ã£o histÃ³rica de banco](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/architecture/database-reconciliation.md).
- [Policies efetivamente existentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/auth/src/policies.ts).
- [Contratos e permissÃµes executÃ¡veis](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/contracts/src/index.ts).
- [Ponte HTTP do painel](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/tenant-web/src/lib/api-client.ts).
- [Middleware de identidade/tenant da API](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/api/src/modules/00-shared/presentation/auth.middleware.ts).
- [Helpers de eventos](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/events/src/index.ts).
- [Design system e componentes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/packages/ui/README.md).
- [Scripts da API e descoberta de testes](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/apps/api/package.json).
- [EvidÃªncia histÃ³rica da fundaÃ§Ã£o](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/audit/validation.md).
- [RelatÃ³rio de seguranÃ§a registrado pelo projeto](https://github.com/projetosdanhub/appbipedev/blob/95639ef08979d37fd713a5c31c6df3784d4da7f4/docs/audit/security-review.md).

### 20.2 ReferÃªncias tÃ©cnicas consultadas

Consultadas em 15/09/2026. Confirmar detalhes na versÃ£o efetivamente instalada antes de escrever cÃ³digo.

- [PostgreSQL â€” JSON types e Ã­ndices](https://www.postgresql.org/docs/current/datatype-json.html).
- [PostgreSQL â€” row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- [PostgreSQL â€” constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).
- [Next.js â€” limites de Server Actions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions).
- [OWASP â€” CSV injection](https://community.owasp.org/attacks/CSV_Injection).
- [OWASP â€” WebSocket security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).
- [BullMQ â€” jobs idempotentes](https://docs.bullmq.io/patterns/idempotent-jobs).

**Limite desta anÃ¡lise:** inspeÃ§Ã£o do planejamento, regras e cÃ³digo remoto. Os modelos, limites, rotas e critÃ©rios propostos precisam ser implementados e verificados; este arquivo nÃ£o certifica desempenho, seguranÃ§a operacional ou conclusÃ£o de nenhum card.

## 21. CRM-010 - Automações visuais (Próxima Sessão)

- Arrastar, pan e zoom estilo n8n.
- Menu de gatilhos flutuante, ativado por clique.
- Sincronizar eventos de mouse para evitar conflitos (clique esquerdo longo/arrastar para pan, scroll para zoom, ou mapear para botão do meio do mouse).
- Correção do scroll duplicado ao clicar em 'ação'.
- Total personalização no fluxo (cards menos retangulares e mais bonitos).

