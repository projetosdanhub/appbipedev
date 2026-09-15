# Próximos Passos (Next Steps)

Com base nas regras estabelecidas em `rules/00_MASTER.md` e no estado atual do `docs/taskboard.md`, aqui estão os próximos passos recomendados para o projeto:

## Contexto Atual
Finalizamos a implementação do **Godmode e Impersonation (TEAM-007)**, com as ações de segurança e revogação exigidas, bem como a desconexão de membros e workspaces. A fundação de identidade está pronta.

## Próximos Cards do Backlog (Milestone 3)

1. **TEAM-003: Gestão de membros**
   - **Objetivo**: Implementar lista completa, convite, suspensão, reativação e transferência de membros com policies.
   - **Requisitos de segurança**: Garantir que as sessões e acessos afetados sejam revogados e auditados. Também é necessário testar a proteção do último admin do tenant para que o tenant não fique órfão.
   - **Onde**: `apps/api/src/modules/04-team`, `apps/tenant-web/src/features`, e `packages/auth`.

2. **TEAM-004: Auditoria pesquisável**
   - **Objetivo**: Implementar a listagem, pesquisa e filtros de auditoria para o workspace, permitindo saber *quem* fez *o que* e *quando*.

3. **TEAM-005 & TEAM-006: Contrato de erros e Dicionário de erros**
   - **Objetivo**: Padronizar a forma como os erros são reportados no painel do tenant e criar o dicionário e triagem de erros no superpainel para os administradores globais.

## Orientação Estratégica (rules/00_MASTER.md)
Conforme as regras mestras, lembre-se sempre de:
- **Separação Rígida**: O Superadmin e o Tenant usam superfícies (interfaces e domínios) separadas.
- **Autorização Servidor-First**: O tenant selecionado pelo cliente não é confiável; toda autorização deve usar policies de servidor na mesma conexão com o banco de dados.
- **Segurança**: Testes locais não precisam se preocupar com infraestrutura indisponível, mas os gates de código (`pnpm foundation:check`) devem sempre passar.

## O que fazer agora?
Podemos prosseguir com o card **TEAM-003 (Gestão de membros)**, implementando as funcionalidades de convite, edição de permissões, suspensão e proteção de último admin, garantindo que o tenant esteja sempre utilizável.

Deseja que eu inicie o planejamento de arquitetura e código para o **TEAM-003**?
