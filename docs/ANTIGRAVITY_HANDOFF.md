# Retomada no Antigravity — BipeSend

## Frente BipeWPRO — implementação inicial 2026-09-16

Branch `feat/bipewpro-planning`, com main `46832fc` integrada. Leia [plano](plans/bipewpro.md), [handoff específico](plans/bipewpro-handoff.md), [evidência](audit/bipewpro-foundation.md) e cards WPRO/PAGE/CAT/BILL-001. Há contratos, core, renderer e editor local com UI própria em `packages/web-builder-ui`. **Não reformular `packages/ui` agora**: o usuário adiou essa etapa. Rodar `pnpm bipewpro:dev` para a galeria; persistência, quotas e publicação continuam nos próximos cards.

O conteúdo abaixo preserva o histórico da fundação; pendências antigas não substituem o taskboard atual nem evidências novas.

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

Revisão humana: tema claro em 320/360/768/1440 px; zoom; Tab/Shift+Tab, Enter/setas/Escape; retorno de foco; leitor de tela; teclado móvel e safe-area. Confirme legibilidade da marca, contraste sobre imagem/gradiente e recuperação de erros. A navegação do catálogo aponta para as rotas reais, que continuam exigindo sessão.

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

Revisar o workflow Foundation no GitHub; presença do YAML não garante que branch protection esteja ativada.

### AUTH-011: Estabilização de Testes E2E e E-mail
- **Playwright Configuration:** Alterado `workers: 1` para evitar timeouts devido à concorrência com o Argon2 e reduzido a carga na CPU durante os testes. Forçado uso do Mailpit definindo `RESEND_API_KEY=""` em `env` no `webServer`.
- **Validação de Cadastro:** Corrigido esquema para `companyName` opcional.
- **Adaptação de UI nos Testes:** 
  - Expressões Regulares mais robustas em `auth.spec.ts`.
  - Tratamento aprimorado de redirecionamento dinâmico para `/onboarding` ou `/`.
  - Adicionado suporte a `onboarding` em `invitation.spec.ts`.
- **E-mails & Resend:**
  - Adicionado o token Resend ao projeto e `.env`.
  - Configurado o emissor para `onboarding@resend.dev`.
  - Implementado transporte com `nodemailer` quando `RESEND_API_KEY` não for provido, visando o Mailpit em testes E2E.
- `docs/taskboard.json` atualizado.

## Próximos Passos
- Concluir **AUTH-014** para revisão final de segurança, fluxos e logs de E2E.
- Confirmar sucesso da pipeline com `pnpm build && pnpm foundation:check`. Depois de corrigir os gates necessários ao marco, atualizar cards/evidências e revisar o diff antes do merge. Esta fundação não autoriza deploy do CRM completo com blockers P0 abertos.

## Frente IA: Estúdio de Voz & Clonagem Neural (XTTSv2) — 2026-09-23
- **Microsserviço de IA (`services/ai-service`)**:
  - Baseado em Coqui XTTSv2 com endpoints REST FastAPI: `GET /v1/tts/voices`, `GET /v1/tts/voices/{id}/sample`, `POST /v1/tts/clone`, `POST /v1/tts/synthesize`, `POST /v1/tts/synthesize/audio`, `DELETE /v1/tts/voices/{id}` e `GET /v1/tts/health`.
  - Tratamento de áudio robusto no Windows via `soundfile` e `torchaudio` monkey-patching, contornando limitações de binários externos e FFmpeg estático.
  - Suporte a persistência local em disco (`app/speakers/`) e na nuvem via Cloudflare R2 (S3-compatible) em `services/ai-service/app/storage.py`.
- **Vozes Pré-definidas Homologadas**:
  - **Germani** (Feminina Oficial, calorosa e consultiva): convertida e ajustada a partir de `voz-feminina-copy-opna.mp3`.
  - **Lucas** (Masculino SDR / Negócios, objetivo e confiante): gerada e calibrada com XTTSv2.
  - **Bia** (Infantil / Jovem, alegre e acolhedora): gerada e calibrada com XTTSv2.
- **Áudio da Landing Page**:
  - Atualizado com a síntese de alta fidelidade da voz clonada da Germani declamando o pitch comercial: *"Olá Camila! Temos sim o Kit Duo Floral a pronta entrega com frete grátis hoje..."*.
- **Interface e Experiência (`apps/tenant-web`)**:
  - Nova aba **"Estúdio de Voz & Clonagem Neural (XTTSv2)"** integrada em `/ai-agents` com reprodução de prévias em tempo real, seleção de categorias (femininas, masculinas, infantis, clonadas), sintetizador interativo de texto com chips de demonstração rápida, player de áudio com download de WAV e formulário de upload de áudios de referência para clonagem.
  - Vínculo direto de vozes aos Agentes de Atendimento Omnichannel no modal de criação (`CreateAgentModal`).

## Frente CRM: Ajuste de Contagem de Funis e Conector Completo do Telegram — 2026-09-24
- **Ajuste da Contagem de Funis do CRM (Funil Principal do Sistema + Cota Adicional)**:
  - **Funil Principal Gratuito (`isDefault = true`, "Atendimento Omnichannel")**: Não consome a cota de funis do plano comercial contratado e é permanente em todos os workspaces.
  - **Proteção Absoluta contra Exclusão**: Bloqueio de exclusão e arquivamento tanto na API (`CANNOT_DELETE_DEFAULT_PIPELINE`) quanto na interface visual (`archive-pipeline-modal.tsx` e `crm-client.tsx`).
  - **Contagem de Funis Customizados (`countCustomPipelines`)**: Considera estritamente `is_default = false AND status = 'active'`, garantindo que limites comerciais se apliquem apenas a funis extras criados pelo usuário.
  - **Transparência Visual nos Planos e CRM**:
    - Catálogo de Planos e Landing Page exibem: "1 Funil adicional (+1 Principal Gratuito = 2 funis)", "3 adicionais (+1 Principal = 4 funis)", etc.
    - Seletor de Funil no CRM exibe badge emerald `Principal Gratuito` e contador explicativo `1 Principal Gratuito + X adicionais`.
    - Modal de Criação de Funil com banner explicativo de regras de cotas.
- **Integração Completa do Conector Telegram (Telegram Bot API)**:
  - **Webhook Controller (`telegram-webhook.controller.ts`)**: Rotas `GET /api/v1/webhooks/telegram` e `POST /api/v1/webhooks/telegram` com suporte a mensagens de texto, comandos (`/start`, `/ajuda`), inline callbacks, criação automática de contatos, conversas e mensagens inbound.
  - **Roteamento Automático de Leads no CRM**: O helper `syncLeadToCrm` consulta os funis ordenando por `is_default DESC, created_at ASC LIMIT 1`, garantindo que todo contato do Telegram (e demais canais) entre automaticamente no funil principal do workspace.
  - **Interface de Conexão no Tenant Web (`integrations-client.tsx`)**:
    - Card de métricas e canal ativo com telemetria (latência, mensagens, status).
    - Modal de onboarding com passo a passo ilustrado do `@BotFather` e botão de teste do token em tempo real (`testTelegramBotTokenAction` via `getMe`).
    - Simulador de mensagens inbound com suporte completo a mensagens simuladas do Telegram.
  - **Filtros e Ações no CRM**:
    - `OmnichannelFilter` com suporte ao canal Telegram e ícone `Send` em azul `#229ED9`.
    - `AddLeadModal` com filtro de leads do Telegram, pesquisa por `@username` e criação rápida com canal Telegram.

## Frente SuperAdmin: Reestruturação de IA Mestre, Análise de Arquivos da Germani & Configurações de Identidade — 2026-09-24
- **Reestruturação Completa da Criação de IA Mestre (`MasterAgentEditor`)**:
  - Eliminação total de popups: criação e edição acontecem diretamente na tela (`isCreatingTemplate`) com fluxo guiado passo a passo.
  - Passo 1 (Identidade & Persona): Nome, pronome/gênero, categoria e system prompt com templates de conduta rápida.
  - Passo 2 (Motor de IA & Modelo Ativo): Catálogo com Google Gemini (3.8 Flash, 3.8 Pro, etc.) e OpenAI (GPT-4.5 Instant, o3-mini, etc.).
  - Passo 3 (Temperatura & Criatividade Dedicada): Calibração de temperatura estritamente isolada daquele agente mestre, sem interferir na Germani.
  - Passo 4 (Síntese Vocal): Associação direta de vozes homologadas ou clonadas no Estúdio XTTS.
  - Passo 5 (Guardrails Inegociáveis): Chips de adição rápida e edição inline de diretrizes éticas.
  - Coluna Direita (Sticky): Preview visual idêntico ao card que os clientes verão na biblioteca e Simulador de Consumo por Mensagem em tempo real (custo em BRL/USD, rendimento por R$ 1,00 e projeções por volume).
- **Análise Multimodal de Arquivos para a Germani (`uploadGermaniAttachmentAction`)**:
  - Suporte completo a envio de imagens, áudios e documentos no chat com a Germani (`germani-copilot-drawer.tsx` e `germani-chat-playground.tsx`).
  - Tratamento com Base64 e integração direta à API multimodal do Google Gemini (`inlineData`), além de suporte a persistência no Cloudflare R2 / Local Storage.
- **Configurações & Identidade do Painel SuperAdmin (`/settings`)**:
  - Nova rota dedicada no SuperAdmin com acesso na barra lateral e top navbar.
  - Simulador interativo em tempo real da aba do navegador (Chrome/Edge/Firefox) com atualização dinâmica de `document.title` e `<link rel="icon">`.
  - Galeria de Favicons Oficiais da BipeSend (Degradê Original, Azul Soberano, Violeta Tech, Dark Carbon e ICO Clássico) e suporte a upload personalizado.
  - Painel de Auditoria Lighthouse & Diretrizes de SEO Privado: confirmação do bloqueio de indexação (`robots: { index: false, follow: false }`) e checklist completo de Acessibilidade WCAG AAA/AA (100% Lighthouse target).
- **Esclarecimento de Escopos e Memória da Germani**:
  - `saveGermaniChatHistoryAction()`: Grava atômica e seguramente até 200 mensagens no servidor, garantindo continuidade entre diferentes dispositivos e mesmo após limpeza de cache do navegador.
  - `clearGermaniChatHistoryAction()`: Limpa exclusivamente o histórico da conversa ativa; todas as configurações, personalidade, inteligência, temperatura, guardrails e integrações permanecem 100% intactas e salvas.
  - Distinção no painel da Germani entre a Cota Global da Plataforma (tokens compartilhados com clientes) e as Calibrações Exclusivas da assessora.

## Reversão

Nenhuma migration foi aplicada nesta entrega. Para desfazer código, use revert do(s) commit(s) da branch em um checkout apropriado; não apagar volumes nem executar down/reset. A reversão reabre os defeitos anteriores de autenticação: mantê-los corrigidos é preferível a reutilizar o caminho legado. Se houver mudanças locais adicionais, revisar antes de reverter.

## Referência publicada

Código validado: `5f5449ff8c7e5c217d590f67e67c6a9dec4868e1`. [Abrir branch no GitHub](https://github.com/projetosdanhub/appbipedev/tree/feat/saas-foundation-design-system). A entrega documental posterior preserva esse código. O CI remoto deve ser consultado antes do merge; esta branch não foi mesclada.

CI da implementação: [Foundation passou](https://github.com/projetosdanhub/appbipedev/actions/runs/34793805919), incluindo builds e smoke de navegador. Banco, integração real de identidade e MFA continuam nos gates explícitos.

