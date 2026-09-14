# Retomada no Antigravity — BipeSend

Branch: `feat/saas-foundation-design-system`. Base: `fd3f4c3`. Objetivo: fundação de UI/pacotes/regras e taskboard executável, com correções de identidade e auditoria. Não houve merge ou deploy. Validação final: 63 testes locais, 33 verificações de navegador e builds dos três apps passaram; gates de banco/MFA permanecem abertos.

## Buscar a branch

Em um checkout limpo (preserve/commite trabalho local antes de trocar):

```bash
git fetch origin
git switch --track origin/feat/saas-foundation-design-system
pnpm install --frozen-lockfile
pnpm --filter @bipesend/db generate
pnpm foundation:check
```

Se já criou a branch local, use `git switch feat/saas-foundation-design-system` e compare o histórico antes de atualizar. Não aplicar reset/clean sobre alterações de outro chat.

## O que revisar primeiro

1. `docs/audit/continuity.md`: achados e o que realmente estava no GitHub.
2. `docs/audit/validation.md`: resultados e limites; relato antigo não substitui nova execução.
3. `packages/README.md` e `packages/ui/README.md`: fronteiras, exports e catálogo.
4. `docs/architecture/database-reconciliation.md`: bloqueio de migration antes de qualquer deploy.
5. `docs/taskboard.md`: 85 cards. Fonte editável `docs/taskboard.json`; valide com taskboard:render/check.
6. `docs/research/saas-foundation-2026-09.md`: pesquisa primária e decisões de UX/engenharia, sem promessa de conversão.

## Testar o design system

```bash
pnpm --dir apps/e2e-tests exec playwright install chromium
pnpm ui:smoke
pnpm --filter @bipesend/tenant-web dev
```

Acesse `http://127.0.0.1:3001/design-system` durante desenvolvimento. A galeria mostra dados de exemplo, componentes, tabelas, formulários, estados, temas, modal/drawer e menu mobile. Em produção esta rota retorna 404. O smoke inicia servidor próprio; encerre outro next dev da mesma pasta antes de executá-lo.

Revisão humana: temas claro/escuro/sistema; 320/360/768/1440 px; zoom; Tab/Shift+Tab, Enter/setas/Escape; retorno de foco; leitor de tela; teclado móvel e safe-area. Confirme legibilidade da marca, contraste sobre imagem/gradiente e recuperação de erros. A navegação do catálogo aponta para as rotas reais, que continuam exigindo sessão.

## Testar identidade e dados

Não rodar `db:migrate`, `db push` ou o migrador da API diretamente sobre banco existente. Os dois históricos não produzem o mesmo schema. Comece por INF-001 e AUTH-001: ambiente isolado, inventário read-only, backup restaurável, classificação do histórico e reconciliação em clone.

Configure valores próprios via `.env.example`: PostgreSQL/Redis, AUTH_SECRET, SUPERADMIN_AUTH_SECRET **distinto**, INTERNAL_API_KEY e AUTH_SESSION_SECRET na API, SMTP local e origens das superfícies. Nenhum segredo no frontend, git ou saída de teste. AUTH_TRUST_HOST pressupõe proxy/hosts controlados. O limite de identidade depende de Redis e falha fechado.

Depois do banco reconciliado:

```bash
pnpm --filter @bipesend/api test:integration
pnpm --filter @bipesend/api test
```

Execute E2E de cadastro/verificação/onboarding/login/logout/reset/convite com dados sintéticos e SMTP local. Muitos desses passos ainda precisam ser completados conforme cards: não use o catálogo visual como prova de backend.

Casos obrigatórios: tenant A acessando UUID de B, escrita sem contexto, membership suspensa, sessão revogada, cookie de outra superfície, OTP/prova reutilizados ou de outro e-mail, tentativa concorrente, Redis indisponível, MFA ausente/replay, CSRF/Host forjado e webhook duplicado.

## Mudanças de compatibilidade

- Fastify `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/request-password-reset` e `/auth/reset-password` retornam **410**. O caminho legado permitia contornar a recuperação nova e usava outra sessão. Web usa Auth.js/Server Actions. A ponte autenticada para dados da API ainda precisa de AUTH-004/015.
- Cookies tenant/platform e segredos são separados. Copiar cookie antigo não deve abrir painel. Alteração de senha/revisão invalida JWT; logout individual de cópia roubada ainda precisa de registro de sessões.
- Recuperação web usa prova HttpOnly no caminho /forgot-password. Não enviar código/prova por URL. Recovery de superadmin simulado foi retirado; permanece procedimento privilegiado a completar.
- CLI agora exige stdin JSON com password/nonce, sem TTY, flag de confirmação e nonce no ambiente; lock é transacional. Não execute em produção antes de AUTH-013 completar auditoria, lifecycle do nonce e enrollment MFA. Não existe seed de owner automático.
- Home usa usuário real e métricas indisponíveis; CRM/inbox/canvas restantes são prévias identificadas. Não ativar canais/pagamentos/IA reais com esses dados locais.
- Marca em packages/ui/assets é o ativo horizontal disponível. Segunda variante vertical/reversa oficial não estava no repositório acessível.

## Builds e entrega

```bash
pnpm --filter @bipesend/api build
pnpm --filter @bipesend/tenant-web build
pnpm --filter @bipesend/superadmin-web build
pnpm taskboard:check
```

Revisar o workflow Foundation no GitHub; presença do YAML não garante que branch protection esteja ativada. CI não roda migration nem certifica integração real.

A validação do Antigravity pode ocorrer nesta branch. Depois de corrigir os gates necessários ao marco, atualizar cards/evidências e revisar o diff antes do merge. Esta fundação não autoriza deploy do CRM completo com blockers P0 abertos.

## Reversão

Nenhuma migration foi aplicada nesta entrega. Para desfazer código, use revert do(s) commit(s) da branch em um checkout apropriado; não apagar volumes nem executar down/reset. A reversão reabre os defeitos anteriores de autenticação: mantê-los corrigidos é preferível a reutilizar o caminho legado. Se houver mudanças locais adicionais, revisar antes de reverter.

## Referência publicada

Código validado: `5f5449ff8c7e5c217d590f67e67c6a9dec4868e1`. [Abrir branch no GitHub](https://github.com/projetosdanhub/appbipedev/tree/feat/saas-foundation-design-system). A entrega documental posterior preserva esse código. O CI remoto deve ser consultado antes do merge; esta branch não foi mesclada.

CI da implementação: [Foundation passou](https://github.com/projetosdanhub/appbipedev/actions/runs/34793805919), incluindo builds e smoke de navegador. Banco, integração real de identidade e MFA continuam nos gates explícitos.
