# Autenticacao, cargos e permissoes

## Papeis de referencia

- `platform_owner`: equipe proprietaria; contexto superadmin separado.
- `tenant_admin`: administrador do contratante; primeiro membro do tenant.
- `manager`: cargo configuravel, sempre limitado pelo tenant_admin.
- `agent`: atendimento e operacao conforme permissoes.
- `viewer`: leitura limitada.

Os nomes exibidos podem ser personalizados, mas as capacidades internas usam chaves estaveis. Setores e cargos sao criados inicialmente pelo tenant_admin; essa funcao pode ser delegada somente por uma permissao explicita como `team.roles.manage` ou `team.departments.manage`. Um cargo de tenant nunca pode criar ou conceder uma permissao que nao possui. Nao pode criar, editar, igualar ou remover o tenant_admin.

## Autorizacao

Usar RBAC para capacidades estaveis e ABAC para escopo: tenant, setor, equipe, conversa, proprietario do registro e acao sensivel. As permissoes sao chaves canonicas, por exemplo `inbox.conversations.assign`, `integrations.whatsapp.manage`, `billing.subscription.manage`.

## Fluxos de conta

Registro -> verificacao de e-mail -> onboarding -> tenant criado -> convite de equipe. Login -> sessao -> selecao de tenant quando necessario. Recuperacao -> token de uso unico, expiracao curta, invalidacao apos uso. Logout invalida a sessao no servidor.

## Superadmin e suporte

Nao existe link de login do superadmin dentro do painel do tenant. Suporte usa acesso temporario, justificativa, banner visivel e auditoria. Segredos de tenants nunca ficam visiveis por padrao.

## Excecoes

Conta suspensa nao pode operar. Tenant sem assinatura ativa pode entrar apenas no billing e suporte, conforme politica. Limite de plano bloqueia criacao/execucao, mas nao deve apagar dados.
