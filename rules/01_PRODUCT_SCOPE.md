# Escopo de produto

## 1. Produto

O BipeSend é uma plataforma SaaS multitenant para centralizar relacionamento, operação comercial e atendimento. O produto deve crescer por módulos independentes sobre uma fundação comum de identidade, tenant, autorização, auditoria, design system, eventos e billing.

## 2. Superfícies oficiais

- `www`: marketing e conteúdo público.
- `app`: painel do tenant/cliente.
- `admin`: superadmin da plataforma.
- `api`: contratos de negócio e integrações autorizadas.
- `hooks`: entrada de webhooks.
- serviços internos: rede privada, sem login de navegador.

Não criar login universal entre essas superfícies.

## 3. Módulos de negócio previstos

- autenticação e onboarding;
- home/dashboard;
- inbox omnichannel;
- contatos;
- CRM/pipeline;
- automações;
- catálogo;
- páginas/publicação;
- conhecimento/RAG;
- integrações;
- equipe, setores, cargos e permissões;
- billing e planos;
- configurações;
- notificações;
- auditoria e suporte;
- painel superadmin.

## 4. Fundação transversal obrigatória

Antes de qualquer módulo ser considerado pronto, deve reutilizar:

- contexto de tenant;
- sessão e autorização;
- catálogo de permissões;
- contratos de API;
- catálogo de erros;
- design tokens;
- componentes compartilhados;
- auditoria;
- observabilidade;
- política de dados;
- testes.

## 5. Objetivo de experiência

A interface deve parecer uma única aplicação, mesmo com dezenas de módulos. A pessoa não deve perceber diferenças de espaçamento, botões, mensagens, animações, formulários ou padrões de navegação entre equipes de desenvolvimento.

## 6. Fora de escopo por padrão

Sem decisão explícita, não implementar:

- execução arbitrária de código pelo usuário ou IA;
- SQL arbitrário;
- scripts de terceiros irrestritos;
- armazenamento de cartão;
- compartilhamento de credencial entre usuários;
- acesso cross-tenant;
- login do superadmin pelo painel do tenant;
- bypass de política de canal;
- recursos que prometam evitar bloqueios de provedores;
- dark patterns de consentimento, cobrança ou cancelamento.

## 7. Definição de pronto de um módulo

Um módulo só está pronto quando possui fluxo feliz e falhas, autorização, auditoria, acessibilidade, responsividade, loading/empty/error, testes e observabilidade proporcionais ao risco.

## Revisão de fundação — 2026-09-13

Escopo desta entrega é a fundação e suas composições. CRM/inbox/canvas existentes permanecem prévias identificadas; IA, billing e canais reais exigem cards próprios. Não apresentar roadmap como funcionalidade disponível.
