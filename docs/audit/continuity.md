# Auditoria de continuidade e implementação

Data: 2026-09-13. Repositório projetosdanhub/appbipedev. Base acessível: fd3f4c3a6ddbdefd17b591820a4e51b692764773. Branch de trabalho: feat/saas-foundation-design-system.

## Histórico relatado versus evidência

O usuário informou E2E local aprovado para login/cadastro e colou relatos de outro chat sobre recuperação segura, sessões separadas, 85 cards e validações visuais. Ao reconferir o remoto, havia main no fd3f4c3 e feat/https-error-observability no 2406c54, sem branch publicada da continuação. Portanto esses relatos não comprovavam que o GitHub já continha as correções. O trecho “Auto-review stopped” não especificava ação ou motivo; não foi tratado como autorização ou evidência de execução.

O código remoto ainda usava Math.random e OTP na URL no fluxo web de recuperação, UI sem tema semântico completo e taskboard com 81 linhas de cards, muitos AUTH marcados DONE. Esta branch implementou as alterações descritas no relatório a partir do código disponível, preservando a base e registrando verificação própria. O novo taskboard tem 85 cards: os 81 IDs históricos e FND-011..014 para biblioteca, pacotes, migração planejada e entrega.

## Achados priorizados

| ID | Prioridade | Evidência no código de base | Tratamento / pendência |
| --- | --- | --- | --- |
| AUD-01 | P0 | Prisma migration TEXT/password/session_token versus schema UUID/password_hash/token_hash; migrations pg sobrepostas | Runbook/inventário entregues. Banco não migrado; AUTH-001 bloqueado |
| AUD-02 | P0 | Middleware verificava presença de cookie, layout cliente sem sessão validada | Guard servidor e proxy de navegação; cookie forjado exercitado |
| AUD-03 | P0 | Recovery web Math.random/plaintext/URL; consumo não atômico | CSPRNG/HMAC, transação, cookie HttpOnly e limites; unidade passa, PG real pendente |
| AUD-04 | P0 | API legada tinha reset numérico sem limite e outra sessão, contornando o fluxo web novo | Seis endpoints /auth/* retornam 410. Auth.js é entrada web; ponte de API ainda pendente |
| AUD-05 | P0 | RLS parcial, grants amplos, api_pass fixo e nenhum FORCE; memberships sem estado | Plano SQL/runtime explícito; isolamento real não certificado |
| AUD-06 | P1 | Cabeçalho tenant aceito sem membership; convite sem policy/tx ligado | Resolução por subject/tenant, policies e consumo ligado ao tx; capability lookup/RLS pendentes |
| AUD-07 | P1 | Qualquer prefixo bipesend_ aceito como API key; HMAC reserializado e comparação frágil | Chave interna exata e validação raw bytes/timestamp; API keys escopadas/provider/dedupe futuros |
| AUD-08 | P1 | Tenant/platform compartilhavam contrato de sessão; platform sem guard completo | Factory separada, MFA exigido, handlers e root protegidos; sessão por dispositivo e MFA completo pendentes |
| AUD-09 | P1 | updatedAt não revogava JWT; logout não tinha semântica de revogação integral | Callback reconsulta revisão; troca de senha invalida. JWT copiado após logout ainda exige session registry |
| AUD-10 | P1 | TOTP/provider tokens em armazenamento legado não cifrado; recovery platform simulado | Primitive AEAD pronta; telas simuladas removidas. Migração/enrollment/recovery privilegiado permanecem abertos |
| AUD-11 | P1 | Bootstrap ecoava stdin e advisory lock no pool não fixava conexão | JSON stdin sem eco, nonce server-side e lock transacional; auditoria/MFA/lifecycle pendentes |
| AUD-12 | P1 | Cadastro Next só cria user; verificação API não marca emailVerified | Cards AUTH-002/003/006 reabertos; não simular onboarding concluído |
| AUD-13 | P1 | Pacotes config/security/contracts/events somente README | Pacotes tipados, exports e testes; adapters persistentes descritos separadamente |
| AUD-14 | P1 | Input encobria valor/erro expirava; tokens sem dark; Button permitia sobrescrever loading | Biblioteca com semântica/foco/temas e testes de interação; contraste de recovery corrigido |
| AUD-15 | P1 | Dashboard John Doe, métricas e controles sem efeito | Identidade real, métricas indisponíveis, refresh/logout reais e prévias marcadas |
| AUD-16 | P2 | Regras contraditórias e verificador cobria só 00..28 | Revisão das 34 regras originais + 34/35 novas, índice/checks e fontes canônicas |
| AUD-17 | P2 | taskboard com DONE sem prova e dependências abertas/“todos” | 85 cards estruturados e validador de conteúdo/dependência/ciclo/evidência |
| AUD-18 | P2 | scripts lint com echo e ausência de CI; testes imprimiam corpos de resposta | ESLint real UI/API, gate e workflow; logs de E2E reduzidos e scan de padrões |
| AUD-19 | P2 | Metadata do painel indexável/OG inexistente; relatórios antigos tratados como prova geral | noindex no painel/auth, metadata privada reduzida e relatório novo por escopo |

P0 impede liberação de produção; P1 exige fechamento antes de ativar o domínio afetado; P2 melhora consistência/operabilidade. Classificação é da auditoria do repositório, sem pentest externo ou inspeção de produção.

## Audit de UX dos módulos existentes

- Login/registro: preservam composição visual e marca; erros do Input agora são persistentes/acessíveis. Validação compartilhada tem limite e normalização; contrato E2E real depende do banco. Evitar concluir verificação/onboarding pela aparência da tela.
- Workspace: sidebar agrupada e expansível, tema, perfil/logout, refresh contextual e navegação mobile distinta. Seleção/entitlements de tenant ainda não integrados. Ausência de dados não é zero.
- CRM: composição kanban é protótipo. Falta persistência, policies por recurso, erro de movimento, concorrência, alternativa por teclado e virtualização conforme volume. CRM-001..004 descrevem a execução.
- Inbox: estrutura lista/conversa/contexto é útil; dados e ações são locais. Falta histórico paginado, assinatura de realtime, atribuição, anexos seguros, rascunho persistido e jornada móvel própria. CRM-005..007 descrevem a execução.
- Automações/campanhas: canvas e controles são prévias. Exigem DSL validada, simulação identificada, alternativa acessível, idempotência, opt-out e limites. Não ativar envio por um botão visual.
- Catálogo/billing/integrações/equipe: páginas não comprovam backend. Estados de provider/entitlement devem refletir dados reais, e nenhum segredo deve chegar à UI. Os cards são o contrato de implementação.

A base UI permite migrar essas telas de forma consistente. Esta etapa não transforma todos os protótipos em um CRM operacional completo.

## Alcance das evidências

Ver `validation.md` para comandos e resultado. Unidade com adapter não testa lock PostgreSQL; callback não substitui E2E distribuído; axe não certifica WCAG; build não mede Core Web Vitals. Resultados anteriores do usuário foram preservados como histórico relatado, sem revalidar o ambiente que os produziu.
