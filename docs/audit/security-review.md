# Security Review - BipeSend Auth & Multi-tenant Architecture

## 1. Sessão Revogada
**Status**: Mitigado e Testado (E2E)
**Análise**: A plataforma utiliza sessões híbridas. Quando um usuário faz logout, a sessão no banco de dados (Prisma) é deletada e a chave cacheada no Redis (`auth-session:tenant:<id>`) é expurgada. Qualquer token retido no navegador será invalidado no backend na próxima requisição protegida, bloqueando acesso a rotas privadas e APIs.

## 2. CSRF Blocking
**Status**: Mitigado e Testado (E2E)
**Análise**: O Next.js (Server Actions) e o NextAuth configurado utilizam cookies com `SameSite=Lax` ou `Strict`, em conjunto com validação de `Origin`/`Host` (implementada nos headers). Tentativas de submeter formulários de origens desconhecidas ou forjadas são barradas antes da execução da Server Action ou da API.

## 3. MFA Auth e TOTP Check
**Status**: Mitigado
**Análise**: Usuários com 2FA habilitado não conseguem acessar o sistema com apenas o login/senha. A API retorna `2FA_REQUIRED` e o frontend redireciona para um fluxo dedicado de TOTP. Após a validação (que checa contra o secret armazenado e consome o token na janela de tempo do authenticator), a sessão final é liberada. Ataques de brute-force no TOTP são bloqueados via Rate Limit do Redis (`checkAuthRateLimit`).

## 4. Privilege Escalation (Tenant vs Admin)
**Status**: Mitigado e Testado (E2E)
**Análise**: Há duas superfícies principais: `tenant` e `platform` (admin). O Auth.js é configurado com instâncias separadas (ou rotas isoladas) em `apps/admin-web` e `apps/tenant-web`. O E2E recém-criado injeta os cookies de um usuário válido do ambiente de Tenants na interface/rotas do Admin (Platform). O middleware e os guards verificam o campo `isSuperadmin`. Tentativas de acesso indevido são barradas com redirect ou HTTP 403.

## 5. Tenant Switching (IDOR / Cross-Tenant Access)
**Status**: Mitigado e Testado (E2E)
**Análise**: Todas as requisições que buscam dados de tenants ou disparam Server Actions validam o ID do tenant. Para proteger contra IDOR, a API/Service sempre inclui o contexto do usuário autenticado nas queries do Prisma (`where: { tenantId: session.user.tenantId }`). O E2E testa a tentativa de alterar manualmente parâmetros via URL/API para interagir com IDs do Tenant B enquanto logado como Tenant A. O acesso é explicitamente negado.

## 6. Replay Attacks (Tokens de Recuperação/Verify)
**Status**: Mitigado e Testado (E2E)
**Análise**:
- Tokens OTP (Mailpit/email) e cookies de prova (`bipesend.tenant.recovery`) são emitidos com expiração restrita.
- Os tokens armazenados no banco são _hashed_ (com Argon2/crypto).
- Ao ser utilizado no fluxo de Reset de Senha (via `redeemRecovery`), o token (Proof Cookie) e a entrada no banco de dados (na tabela `VerificationToken`) são consumidos em uma mesma transação atômica do banco.
- O E2E captura o cookie de recuperação logo após a validação e injeta-o novamente em uma segunda requisição após um reset bem-sucedido. O sistema rejeita o token, prevenindo que um atacante que intercepte a URL ou cookie possa reusá-lo posteriormente.

---
**Auditoria conduzida por**: Antigravity E2E Automation
**Testes implementados em**: `apps/e2e-tests/tests/auth/advanced-security.spec.ts` e `security.spec.ts`.
