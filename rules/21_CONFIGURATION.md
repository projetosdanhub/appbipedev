# Configuração

## 1. Tipagem

Configuração deve ser validada no startup. Falhar fechado em segredo/URL obrigatórios inválidos.

## 2. Classes

- pública de build: valores realmente seguros para browser;
- backend não sensível;
- segredo;
- feature flag;
- configuração por tenant.

Não transformar segredo em variável `NEXT_PUBLIC_*`.

## 3. Ambientes

Dev/staging/prod separados. Defaults de desenvolvimento não podem vazar para produção.

## 4. Feature flags

Flag tem owner, objetivo, data de revisão e comportamento seguro. Não usar flag como autorização.

## 5. Design

Tokens não devem vir de env por página. Branding/white-label, se existir, passa por tema validado e constraints de contraste.

## Revisão de fundação — 2026-09-13

@bipesend/config valida config da API e origens; @bipesend/auth valida segredos por superfície. Variáveis públicas contêm apenas valores publicáveis. Não registrar valor inválido ao falhar bootstrap. .env.example é catálogo, não configuração pronta para produção.
