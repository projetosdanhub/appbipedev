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
