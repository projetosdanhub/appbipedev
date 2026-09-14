# Reconciliação de banco — gate AUTH-001

Data: 2026-09-13. Base auditada: fd3f4c3. Nenhum banco real foi inspecionado ou alterado; este plano não pressupõe qual histórico o ambiente local/VPS executou.

## Divergências verificadas no código

| Área | node-pg-migrate | Migration Prisma histórica | schema.prisma atual |
| --- | --- | --- | --- |
| users.id | UUID + gen_random_uuid | TEXT sem default | UUID |
| senha | password_hash obrigatório | password nullable | password_hash nullable |
| sessões | token_hash/expires_at/created_at | session_token/expires | token_hash/expires_at/created_at |
| tenant | tenants/memberships/roles/permissions/invitations | ausentes | modelos presentes, várias relações ausentes |
| MFA | ausente | ausente | two_factor_enabled/two_factor_secret |
| Google/verification | verifications e password_resets próprios | accounts/verification_tokens | coexistem os modelos |
| RLS | memberships, roles e invitations com ENABLE | ausente | Prisma não representa policies |
| role_permissions | sem proteção indireta | ausente | modelo sem relação tenant |
| runtime | api_user com senha fixa legada e grants ALL | não provisionado | não provisionado |

Logo, migrate deploy do histórico atual em banco vazio não entrega o schema consumido pelo código. Rodar o migrador da API em seguida tenta recriar tabelas e mistura tipos/semânticas. FORCE RLS não está aplicado nas migrations antigas; owner/superuser pode bypassar policies. A coluna chamada token_hash não torna um token automaticamente hash: Auth.js adapter e sessão legada possuem contratos distintos.

## Inventário e decisão

1. Identificar ambiente, responsável pelo banco e janela. Fazer backup cifrado, testar restore e guardar hashes/contagens minimizadas. Não copiar dump com dados reais para a branch.
2. Executar `psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f packages/db/audit/inventory.sql` em conexão autorizada. A variável contém segredo e não deve ser impressa. Registrar engine, proprietário, roles, colunas, constraints, policies e presença de cada histórico.
3. Em cópia descartável, ler os históricos e comparar com o schema pretendido. PostgreSQL/pgvector do compose e produção devem ter versões compatíveis. Prisma `migrate diff` com histórico requer shadow database **descartável**, nunca a URL da produção.
4. Classificar a origem: vazio; apenas legacy pg; apenas Prisma histórico; misto ou alterado manualmente. Não utilizar um ALTER genérico para todas essas origens.
5. Definir um único dono das futuras migrations no ADR: proposta é Prisma para schema/código atual, com SQL explícito para RLS/roles/constraints. A seleção é uma decisão de migração, não autorização para apagar o outro histórico.

## Plano por origem

| Origem | Trabalho necessário no clone | Condição de saída |
| --- | --- | --- |
| Vazio | gerar baseline revisada a partir do schema alvo e SQL de isolamento; criar runtime sem privilégios de migration | build + integração + introspecção sem drift |
| Legacy pg | adicionar campos Auth.js/MFA com defaults seguros; compatibilizar nullability, e-mail verificado e provider; revisar timestamps e relações | usuários/senhas preservados e autenticação exercitada |
| Prisma TEXT | analisar todos os IDs e FKs antes de UUID; preservar mapeamento quando não convertíveis; renomear colunas com migração de aplicação coordenada | zero referência órfã e rollback ensaiado |
| Misto/manual | inventário de divergências e migração individualizada, com checkpoints e bloqueio de escrita conforme risco | reconciliação comprovada, sem resolver histórico por adivinhação |

Antes de baseline de banco existente, comprovar equivalência entre schema e registros de histórico. `migrate resolve` só depois dessa equivalência; nunca serve para ignorar erro SQL. Não editar migration já aplicada. Não incluir senha fixa ou GRANT ALL indiscriminado na nova baseline. A senha legada api_pass deve ser tratada como pública e substituída no ambiente que a usa.

## Segurança a incluir no schema alvo

- FK e unicidade de membership tenant/user; estados active/suspended e índices de consulta; papéis canônicos e dono único/transição auditada.
- RLS ENABLE + FORCE nas tabelas tenant-owned, USING e WITH CHECK; proteção de vínculos indiretos e FK composta quando dois IDs pertencem ao mesmo tenant.
- Runtime sem superuser, BYPASSRLS, owner ou DDL. Migration role separado. Não depender de SECURITY DEFINER sem search_path fixo e grants mínimos.
- Contexto por transação usando `NULLIF(current_setting('app.current_tenant_id', true), '')::uuid` para contexto ausente/resetado; consultas sempre no mesmo tx.
- Descoberta de membership e aceite de convite antes do tenant escolhido: capability por token hash/usuário, finalidade estreita e sem listagem global. Não usar admin connection como atalho geral.
- Separar registro de sessão por superfície/subject/revogação/expiração; nome token_hash deve corresponder ao contrato real do adapter. Aplicar revisão de sessão explícita em evolução futura.
- Migrar TOTP/provider tokens para envelope AEAD com keyId; não descartar chave antiga antes de recriptografia validada. Onboarding MFA com recent-auth e uso único/replay/backup codes.
- Outbox/dedupe persistentes, auditoria minimizada e retenção, quando os cards MSG/TEAM forem implementados.

## Ensaio e aceite

Executar contra runtime role: sem contexto; tenant A solicita UUID de B; SELECT/INSERT/UPDATE/DELETE cruzados; troca de FK; múltiplas conexões; contexto após commit e rollback; membership suspensa; sessão revogada; concorrência de consumo OTP/prova/convite; evento não persiste após rollback. Casos de ataque precisam falhar pelo motivo esperado, não por banco desligado ou tabela inexistente.

Rodar a suíte `pnpm --filter @bipesend/api test:integration` e expandi-la conforme schema alvo. Rodar E2E de identidade com SMTP local/Redis e dados sintéticos, incluindo cookies das duas superfícies. Validar migração de ida em cada origem e rollback/restauração em clone; guardar contagens, tempos e resultado, sem dumps no git.

Em produção: revisão do SQL final, backup restaurável, janela, plano de reversão e autorização operacional específica. A branch da fundação não aplica migration nem certifica esse gate.
