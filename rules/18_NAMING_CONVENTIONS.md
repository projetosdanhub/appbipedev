# Convenções de nomes

## 1. Código

- TypeScript: `camelCase` para variáveis/funções, `PascalCase` para componentes/tipos.
- componentes: nome por responsabilidade, não por aparência.
- hooks: `useX`.
- eventos: `domain.entity.action.v1`.
- permissões: `domain.resource.action`.
- erros: `DOMAIN_REASON`.

## 2. Arquivos

Nomes semânticos e estáveis. Evitar `utils2`, `new`, `final`, `temp`, `misc`.

## 3. Componentes

Canônicos em inglês no código (`Button`, `AuthShell`, `OtpInput`), copy em pt-BR por camada de conteúdo/i18n quando aplicável.

## 4. Design tokens

Usar nomes semânticos (`text.primary`, `action.primary`) no consumo. Escalas cruas pertencem à definição do tema.

## 5. Banco

Convenção consistente para tabelas/colunas e migrations. IDs e foreign keys nomeadas de forma previsível.
