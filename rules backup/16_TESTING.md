# Testes e qualidade

## Camadas

- unitarios: regras puras, policies, entitlements e normalizadores;
- integracao: repositorios, RLS, filas, webhooks e storage;
- contrato: DTOs, eventos e adapters;
- E2E: registro, login, recuperacao, tenant isolation e onboarding;
- visual/a11y: componentes criticos e fluxos de teclado;
- carga: inbox, webhook e filas antes de escala.

## Casos obrigatorios

Tentar ler/criar/editar dados de tenant diferente; manager tentando elevar privilegio; usuario suspenso; token expirado/reutilizado; webhook duplicado; retry de erro permanente; limite de plano; arquivo malicioso; prompt injection em documento; tentativa de ferramenta fora do escopo; pagamento confirmado somente por redirect.

## CI

Lint, typecheck, testes, migration check, dependency audit, secret scan e build em pull request. E2E com servicos efemeros. Branch protegida exige revisao e checks verdes.

## Borda e diagnostico

Testar redirect HTTP->HTTPS, certificado/host allowlist, forwarded headers,
CORS, cookies Secure, headers de seguranca, bloqueio de dotfiles e extensoes
sensiveis, path traversal e download sem permissao. Testar tambem o contrato de
erros, redacao de PII/segredos, reporte do tenant, deduplicacao e transicoes de
saude das integracoes.


## Bootstrap e autenticação de superfícies

Testar que platform_owner não pode nascer por signup, endpoint, seed ou
migration com credencial fixa; testar CLI one-shot, concorrência, advisory lock,
stdin, Argon2id, MFA pendente e auditoria. Testar também que tenant e
superadmin não compartilham cookies, que API keys têm escopo e que hooks
rejeitam assinatura inválida/replay/duplicata.
