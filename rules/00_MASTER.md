# NexoFlow Rules - regra mestre

Versao: 0.1.0  
Status: proposta inicial  
Comando de bootstrap: `!construibase`

## Missao

Construir uma plataforma multitenant de CRM, atendimento omnichannel, automacao, catalogo e paginas publicadas, com isolamento forte de dados, limites por plano e IA controlada por politicas.

## Ordem obrigatoria de leitura

1. `01_PRODUCT_SCOPE.md`
2. `02_ARCHITECTURE.md`
3. `03_TENANCY.md`
4. `04_SECURITY.md`
5. `05_AUTH_RBAC.md`
6. `06_DATABASE.md`
7. `07_API_EVENTS.md`
8. `08_QUEUES.md`
9. `09_AI_RAG_MCP.md`
10. `10_WHATSAPP.md`
11. `11_BILLING_PLANS.md`
12. `12_UX_UI.md`
13. `13_ACCESSIBILITY_SEO.md`
14. `14_DESIGN_TOKENS.md`
15. `15_INTEGRATIONS.md`
16. `16_TESTING.md`
17. `17_DEVOPS_DOCKER.md`
18. `18_NAMING_CONVENTIONS.md`
19. `19_DATA_GOVERNANCE.md`
20. `20_AI_AGENT_COMMANDS.md`
21. `21_CONFIGURATION.md`
22. `22_LAYOUT_COMPONENTS.md`

## Contrato para qualquer agente de IA

Antes de editar:

- identificar o modulo, tenant e superfice afetada;
- consultar o taskboard e as decisoes existentes;
- verificar se ja existe entidade, evento, permissao, token de design ou variavel com o mesmo objetivo;
- declarar arquivos que serao criados, alterados e testes esperados;
- parar se houver conflito de regra, ambiguidade de dominio ou requisito de seguranca nao resolvido.

Durante a edicao:

- reutilizar nomes canonicos;
- nao criar SQL, endpoint, evento, tabela, permissao, claim ou segredo fora do contrato;
- validar entrada no limite do sistema e novamente no dominio;
- aplicar `tenant_id` e autorizacao em toda operacao de dados do tenant;
- nao colocar segredos, tokens ou dados pessoais em frontend, logs, fixtures publicas ou mensagens de erro;
- escrever testes de unidade, integracao ou contrato proporcionais a mudanca.

Depois da edicao:

- rodar lint, typecheck e testes relevantes;
- conferir migracoes para frente e rollback/documentacao;
- atualizar `docs/taskboard.md` e `docs/decisions.md` se houver mudanca de design;
- registrar riscos e itens deixados para depois;
- nunca declarar concluido sem criterio de aceite verificavel.

## Prioridade em caso de conflito

1. seguranca, isolamento de tenant e privacidade;
2. integridade dos dados e autorizacao;
3. comportamento documentado e contratos publicos;
4. acessibilidade e confiabilidade;
5. experiencia visual e performance;
6. velocidade de implementacao.

## Escopo do primeiro marco

O primeiro marco e o painel do contratante com registro, verificacao de e-mail, login, logout, recuperacao de senha, criacao de tenant, convite inicial e shell responsivo. CRM, WhatsApp, IA, catalogo e pagamentos entram depois que a fundacao de identidade, tenant e auditoria estiverem testadas.

## Nao negociaveis

- o superadmin e uma superficie e um contexto de autenticacao separados;
- o administrador do tenant nunca pode ser removido por um cargo inferior;
- a IA nao executa codigo, SQL arbitrario, comandos de sistema ou edicao direta de arquivos;
- o frontend nunca recebe segredos de integracao;
- o banco e a fonte de verdade; cache e fila nao substituem transacoes;
- toda integracao externa usa adaptador, timeout, retry, idempotencia e auditoria.
