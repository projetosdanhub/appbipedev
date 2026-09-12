# Arquitetura

## 1. Direção

Usar monorepo modular com fronteiras explícitas. Aplicações coordenam casos de uso; pacotes compartilhados concentram contratos transversais; domínio não depende de detalhes visuais ou de provider externo.

## 2. Estrutura de referência

- `apps/tenant-web`: UI autenticada do tenant.
- `apps/superadmin-web`: UI administrativa da plataforma.
- `apps/marketing-web`: páginas públicas.
- `apps/api`: HTTP/API e orquestração.
- `apps/worker`: jobs assíncronos.
- `apps/ai-worker`: processamento de IA isolado.
- `apps/e2e-tests`: jornadas críticas.
- `packages/ui`: design system e componentes.
- `packages/auth`: sessão, autenticação e autorização compartilhada.
- `packages/security`: primitives e políticas.
- `packages/contracts`: schemas, DTOs e eventos.
- `packages/db`: acesso ao banco e migrações.
- `packages/events`: contratos e infraestrutura de eventos.
- `packages/config`: configuração tipada.

## 3. Fronteiras

- UI não acessa banco diretamente.
- Rotas de UI não contêm regra de negócio complexa.
- Adaptador de provider não vaza payload bruto para domínio.
- Domínio não depende de framework HTTP.
- Componente visual não decide autorização.
- Worker não cria regra alternativa à API; reutiliza serviços/casos de uso.
- Eventos carregam IDs e dados mínimos; evitar PII desnecessária.

## 4. Fluxo recomendado

UI → contrato HTTP → autorização → caso de uso → domínio/repositório → transação → evento/outbox → integrações/worker → atualização de UI.

## 5. Dependências

Dependências apontam para dentro: aplicação pode usar domínio e contratos; domínio não depende de UI, banco concreto ou provider. Ciclos entre módulos são proibidos.

## 6. Idempotência e consistência

Operações com efeito externo devem aceitar/gerar chave idempotente. Eventos derivados de transação crítica devem preferir outbox. Não publicar evento de sucesso antes da persistência confirmar.

## 7. Performance

- paginação em listas;
- cache apenas com estratégia de invalidação;
- queries observáveis;
- evitar N+1;
- payloads enxutos;
- lazy load de módulos pesados;
- imagens dimensionadas;
- sem polling global indiscriminado.

## 8. Evolução

Mudança estrutural exige ADR/decisão documentada, plano de migração e compatibilidade. Não trocar framework ou arquitetura por conveniência local.
