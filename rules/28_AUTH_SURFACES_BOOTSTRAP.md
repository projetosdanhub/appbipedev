# Superfícies de autenticação e bootstrap

## 1. Separação

| Superfície | Domínio de referência | Humano | Proteções |
|---|---|---|---|
| Marketing | `www` | público | HTTPS/SEO/rate limit |
| Tenant | `app` | tenant users | sessão, RBAC/ABAC, CSRF |
| Superadmin | `admin` | platform_owner/suporte | sessão separada, MFA, auditoria |
| API | `api` | máquina/app | sessão/API key escopada |
| Hooks | `hooks` | providers | assinatura/replay/idempotência |
| Interno | rede privada | serviços | identidade de serviço |

Não compartilhar cookie, audience ou rota entre tenant e superadmin.

## 2. Registro público

Registro cria usuário/tenant conforme fluxo comercial. Nunca cria `platform_owner`.

## 3. Platform owner

Primeiro owner nasce apenas via CLI/processo controlado no VPS. Sem seed público, endpoint HTTP ou formulário.

Referência:

```bash
pnpm --filter @bipesend/api admin:bootstrap \
  --email owner@dominio-controlado.tld \
  --password-stdin \
  --confirm-production
```

Senha entra por stdin seguro, nunca argumento. Processo usa lock/transação, falha se owner já existe e exige MFA pendente/ativação.

## 4. Superadmin

MFA/WebAuthn obrigatório. Acesso de suporte temporário exige justificativa e auditoria. Segredo de tenant não é visível por padrão.

## 5. API keys

Emitidas com escopo, tenant, expiração/rotação/revogação. Exibidas uma vez; armazenamento preferencial por hash.

## 6. Critérios

Testar brute force, CSRF, session fixation/revocation, cross-tenant, replay, assinatura inválida e tentativa de escalar para platform owner.
