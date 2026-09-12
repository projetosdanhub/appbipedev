# Testes

## 1. Pirâmide orientada a risco

- unitários para domínio e utilitários;
- integração para DB, auth, contratos e providers;
- contrato para API/eventos;
- E2E para jornadas críticas;
- testes visuais/a11y para design system.

## 2. Jornadas obrigatórias

- registro;
- verificação de e-mail;
- login sucesso/erro;
- logout;
- recuperação de senha;
- código correto, incorreto, expirado, colagem e reenvio;
- nova senha e confirmação;
- revogação de sessão;
- cross-tenant negado;
- RBAC negado;
- upload inválido;
- webhook duplicado/replay;
- billing idempotente.

## 3. UI

Testar 360, 768, 1024 e desktop representativo. Teclado, foco, zoom e reduced motion fazem parte da cobertura.

## 4. Segurança

Testes negativos são obrigatórios para IDOR, enumeração de conta, brute force, CSRF, XSS em campos ricos, assinatura inválida e escalada de privilégio.

## 5. Design system

Componentes compartilhados devem ter testes de estados e, quando adotado, snapshots/visual regression controlados. Mudança de token deve ser revisada pelo impacto global.

## 6. CI

PR não deve ser mergeada com lint/typecheck/build/teste relevante quebrado sem exceção registrada.
