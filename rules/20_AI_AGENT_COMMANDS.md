# Comandos para agentes de IA

## `!construibase`

`!construibase` e um comando idempotente de bootstrap e contexto. Na primeira execucao, cria a fundacao. Nas seguintes, valida o que ja existe e implementa somente a tarefa informada; nunca recria o projeto inteiro.

1. Ler `rules/00_MASTER.md` e os arquivos de regras na ordem.
2. Ler `docs/taskboard.md` e `docs/decisions.md`.
3. Ler `docs/module-map.md` e identificar o modulo/submodulo afetado.
4. Inspecionar somente o modulo pedido e seus contratos. Para borda, erro ou integracao, ler tambem `docs/error-catalog.md`, `docs/integration-health.md` e os exemplos de `infra/nginx/` quando aplicavel.
5. Propor plano com arquivos, riscos e testes.
6. Se a tarefa for FND-008 ou a fundacao nao tiver skeleton, executar `pnpm structure:scaffold` ou criar a mesma estrutura de forma idempotente.
7. Implementar a menor mudanca que atende o criterio de aceite.
8. Rodar checks relevantes.
9. Atualizar taskboard/decisoes.

Quando o pedido nao informar uma tarefa, o agente deve apenas validar a fundacao e indicar o proximo item READY do taskboard. Nao deve implementar todos os itens automaticamente.

Uso recomendado para uma tarefa especifica:

```text
!construibase <ID-da-tarefa>
Leia integralmente rules/00_MASTER.md, as rules na ordem, docs/taskboard.md,
docs/decisions.md e os contratos do modulo. Execute somente <ID-da-tarefa>,
respeite os criterios de aceite, rode os testes e relate arquivos, riscos e
proximo item READY.
```

## `!planejar <modulo>`

Gerar um plano de implementacao sem editar codigo. Identificar entidades, permissoes, eventos, estados, limites, telas, testes e riscos.

## `!auditar <modulo>`

Procurar violacoes de tenant, segredo, autorizacao, validacao, acessibilidade, SEO, contrato e testes. Nao corrigir automaticamente mudancas de alto risco sem plano.

## `!migrar <mudanca>`

Propor migration, RLS, indices, backfill, rollback e testes de isolamento. Parar se a mudanca puder apagar ou expor dados.

## Formato de saida

Sempre responder com: resumo, arquivos alterados, regras aplicadas, testes rodados, riscos pendentes e proximo item do taskboard. Nunca inventar credenciais ou afirmar que uma integracao externa foi validada sem executar um teste autorizado.
