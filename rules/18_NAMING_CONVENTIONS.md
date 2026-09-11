# Convencoes de nomes

## Codigo

Pastas e arquivos em kebab-case quando forem de frontend; classes e tipos em PascalCase; funcoes em camelCase; constantes de ambiente em UPPER_SNAKE_CASE.

## Banco

Tabelas no plural snake_case; FK `<entity>_id`; indices `idx_<table>_<columns>`; unique `uq_<table>_<columns>`; RLS policy `rls_<table>_<operation>`.

## API e eventos

Rotas REST em plural e kebab-case; recursos versionados; permissoes em `dominio.recurso.acao`; eventos em `dominio.recurso.acao` no passado quando forem fatos.

## Componentes

Componentes visuais no pacote `ui`; nao criar um botao local se um componente compartilhado resolver. Tokens nunca ficam hardcoded em paginas.

## Evitar repeticao e monolitos

Nao usar nomes genericos e repetidos como `service.ts`, `utils.ts`, `helpers.ts`, `types.ts`, `controller.ts` ou `index.ts` para esconder responsabilidade. Preferir nomes semanticos e contextualizados: `create-tenant.use-case.ts`, `tenant.repository.ts`, `tenant-http.controller.ts`, `tenant-policy.ts`.

Cada arquivo deve ter uma responsabilidade principal. Como regra de revisao, arquivos acima de 300 linhas exigem justificativa; acima de 500 linhas devem ser divididos, exceto arquivos gerados, migrations ou fixtures controladas.

## Ordem cronologica

Pastas de dominio usam prefixos `00` a `14` e `99` conforme `23_MODULAR_ARCHITECTURE.md`. Dentro delas, nomes de arquivos nao recebem numeros artificiais: a ordem e expressa pelo fluxo do dominio, contratos e taskboard.

## Variaveis e segredos

Usar nomes canonicos do `.env.example`. Segredos sempre terminam com contexto claro, nunca `SECRET` generico reutilizado entre ambientes.
