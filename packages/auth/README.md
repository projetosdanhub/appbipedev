# @bipesend/auth

Auth.js de tenant/platform, recuperação e policies de autorização. Next consome runtime TypeScript; a API Node deve importar **somente `@bipesend/auth/policies`** para não depender do runtime Next.

## Exports

- raiz: handlers, auth, signIn e signOut da superfície tenant;
- `./superadmin`: os mesmos exports da superfície platform;
- `./policies`: matriz de permissões, normalizeTenantRole, resolveTenantContext, assertPermission e canGrantRole;
- `./recovery`: requestRecovery, verifyRecovery, redeemRecovery;
- `./rate-limit`: validação de AUTH_SECRET e limiter Redis.

Cookies de sessão: bipesend.tenant.session-token / bipesend.platform.session-token, com prefixo __Secure- em produção, Secure, HttpOnly, SameSite=Lax e Path=/, sem Domain compartilhado. Segredos AUTH_SECRET e SUPERADMIN_AUTH_SECRET são distintos. CSRF/callback também têm nomes separados. AUTH_TRUST_HOST só deve ser ativado com proxy/Host controlado; revisar origins no ambiente.

## Sessão e autorização

JWT tem surface, user ID e authVersion derivado de updatedAt. Cada callback de validação reconsulta usuário no banco; usuário removido, revisão divergente ou classe de identidade errada invalida a sessão. Troca de senha atualiza updatedAt e remove registros de sessão. Tenant rejeita superadmin; platform exige isSuperadmin e twoFactorEnabled.

Isso **não** é um registro completo de sessões por dispositivo. Logout atual remove o cookie do browser; uma cópia do JWT continua válida até expirar ou mudar a revisão do usuário. Idle timeout, revogação individual, detecção de roubo e armazenamento protegido de MFA são gates abertos. Não anunciar essas capacidades como prontas.

A matriz tem tenant_admin, manager, agent e viewer. Legados admin/member são normalizados; cargos desconhecidos são rejeitados. Escopo de recurso deve corresponder ao tenant; criação de outro tenant_admin por convite é bloqueada. resolveTenantContext requer lookup atual e ativo ligado a userId+tenantId autenticados. O schema de membership ainda precisa de estado de suspensão e constraints adequadas.

## Recuperação

1. Normalizar e-mail, limitar envio (1/45 s e 5/h), buscar usuário tenant.
2. Criar OTP criptográfico, armazenar HMAC com propósito por e-mail e expiração 10 min; invalidar desafios anteriores em transação.
3. Após commit, enviar e-mail pelo adapter. Resposta pública é genérica inclusive em falha do provedor; implementar telemetria interna minimizada para entrega.
4. Verificar com limite 5/10 min e DELETE condicional atômico; só count=1 permite criar prova aleatória de 32 bytes com HMAC e validade 10 min.
5. Server Action guarda prova em cookie HttpOnly, SameSite=Strict, Path=/forgot-password. Não devolver token ou carregar OTP/prova na URL.
6. Reset exige prova do cookie, senha válida e consumo atômico na mesma transação da atualização/revogação. Erro reverte consumo; sucesso expira o cookie.

A identidade continua no e-mail da navegação existente; substituir por desafio opaco reduz PII em histórico/referrer. O timing de envio síncrono ainda precisa de equalização assíncrona na integração de outbox. Não afirmar proteção total contra enumeração por tempo.

## Compatibilidade HTTP

A API Fastify retorna 410 nos seis endpoints legados /auth/* de login/cadastro/logout/verificação/recovery. Eles constituíam um caminho paralelo com reset de seis dígitos sem limite e sessões incompatíveis. Web usa Auth.js/Server Actions. A ponte de identidade para os endpoints de dados da API ainda é gate AUTH-004/015; não reativar o legado para contornar isso.

## Operação e gates

Redis ausente/indisponível impede operações protegidas; não retornar a contador em cookie. Limites IP/global e circuit breaker de custo precisam do edge/API. Google só é configurado no tenant quando há ID/secret; account linking inseguro está desativado. Secrets TOTP/OAuth ainda exigem cifragem/rotação; platform recovery usa procedimento privilegiado, não tenant recovery.

`pnpm --filter @bipesend/auth build/test/typecheck` valida policies. `pnpm --filter @bipesend/tenant-web test/typecheck` cobre runtime/actions/callbacks com adapters. Integração de banco, Redis, SMTP, MFA e E2E continuam necessários após reconciliar o schema. Veja AUTH-001..016 e o handoff.
