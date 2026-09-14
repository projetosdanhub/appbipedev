# Execução, continuidade e evidências

A fonte do taskboard é `docs/taskboard.json`, renderizada em `docs/taskboard.md`. Os comandos `taskboard:render` e `taskboard:check` validam campos, IDs, dependências, ciclos, evidências e sincronização. Cada card descreve passos, áreas de código, testes, aceite e bloqueios.

- READY: dependências DONE e entrada de execução disponível. IN_PROGRESS: implementação parcial. BLOCKED: impedimento concreto. DONE: aceite integral verificado, com evidência versionada. BACKLOG: trabalho futuro.
- Uma aprovação relatada em outro chat é relato, até localizar branch/commit e resultado correspondente. Conferir remoto, base, dirty tree e referências antes de continuar. Não sobrescrever alterações de outro agente.
- Diferenciar teste unitário com adapter, integração PostgreSQL/Redis, inspeção visual e E2E completo. Não chamar validação de DTO de autorização; não chamar assinatura de proteção contra replay; não chamar helper de outbox de entrega durável.
- Evidência registra comando, ambiente, resultado, cobertura, limitações e código avaliado. O log não pode conter corpo de resposta, cookies, credenciais ou dados reais.
- Não editar migração aplicada nem executar reset contra banco existente. Usar inventário somente leitura, backup verificado, ensaio em clone e plano de rollback.
- Gate de fundação deve executar checks reais; script echo não é lint. Gates com dependências ausentes falham ou ficam explicitamente pendentes; nunca substituir por um teste que sempre passa.
- Branch é entregue com instruções reproduzíveis. Merge, publicação e operação de produção seguem o escopo já autorizado pelo usuário. Uma exigência local não apaga autorização já concedida.
- Revisar contrato quando houver mudança de ameaça, dependência, funcionalidade ou padrão. Evitar duplicação reduz manutenção; nenhuma regra elimina a necessidade de atualização de segurança.
