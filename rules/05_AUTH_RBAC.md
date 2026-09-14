# Autenticação, RBAC e ABAC

## 1. Papéis de referência

- `platform_owner`: equipe proprietária; contexto superadmin separado.
- `tenant_admin`: administrador máximo do tenant.
- `manager`: gestão delegada.
- `agent`: operação/atendimento.
- `viewer`: leitura limitada.

Nome exibido pode ser customizado, mas capacidades internas usam chaves estáveis.

## 2. Autorização

RBAC define capacidades estáveis; ABAC restringe por tenant, setor, equipe, ownership, estado do recurso e sensibilidade.

Exemplos:

- `inbox.conversations.read`
- `inbox.conversations.assign`
- `crm.deals.move`
- `integrations.whatsapp.manage`
- `team.roles.manage`
- `billing.subscription.manage`
- `settings.security.manage`

Um cargo nunca concede permissão que não possui. Nenhum cargo de tenant pode criar, igualar, editar ou remover `tenant_admin` sem fluxo explicitamente autorizado.

## 3. Fluxos humanos

Registro → verificação de e-mail → onboarding → tenant.  
Login → sessão → contexto de tenant → shell.  
Recuperação → desafio → código/link → nova senha → revogação conforme política.  
Logout → invalidar sessão no servidor.

Detalhes de UX ficam em `29_AUTH_UX_FLOWS.md`.

## 4. Superadmin

Não existe link de superadmin no painel do tenant. `platform_owner` usa domínio, cookie, audience e MFA separados. Suporte temporário exige justificativa, auditoria, duração e indicador visível quando houver impersonation/assistance.

## 5. Estados de conta

Estados canônicos: `pending_verification`, `active`, `locked`, `suspended`, `disabled`. O frontend recebe estado necessário, sem detalhes que facilitem enumeração ou bypass.

## 6. Reautenticação

Ações como alterar e-mail, senha, MFA, API key, permissão crítica ou billing podem exigir prova recente de autenticação.

## 7. Sessões

Usuário deve poder encerrar sessão atual; admins podem ter gerenciamento de sessões conforme política. Troca de senha, comprometimento e remoção de acesso devem revogar sessões afetadas.

## Revisão de fundação — 2026-09-13

Matriz executável em packages/auth/src/policies.ts. Superadmin não é cargo de tenant. Validação da sessão e RBAC devem ocorrer a cada operação. Mudança de updatedAt invalida JWT web atual; logout por dispositivo/idle e revogação dirigida exigem registro de sessões ainda pendente.
