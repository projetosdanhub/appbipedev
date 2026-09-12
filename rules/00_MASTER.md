# BipeSend Rules — regra mestre

Versão: 1.0.0  
Status: contrato oficial de engenharia, UX/UI e segurança  
Bootstrap de agente: `!construibase`

## 1. Missão

Construir e evoluir o BipeSend como uma plataforma SaaS multitenant moderna para CRM, atendimento omnichannel, automações, catálogo, páginas, integrações e recursos com IA, com segurança por padrão, forte isolamento entre tenants, experiência consistente e operação auditável.

Estas regras são a fonte de verdade para humanos e agentes de IA. Quando código existente divergir deste contrato, a divergência deve ser registrada e corrigida de forma planejada — nunca silenciosamente.

## 2. Princípios inegociáveis

1. Segurança, privacidade e isolamento de tenant acima de conveniência.
2. Autorização no servidor; esconder elemento no frontend nunca é controle de acesso. (Mutações críticas via Server Actions no Next.js).
3. Banco é a fonte de verdade de negócio; cache, fila e realtime são derivados.
4. Componentes, tokens e padrões compartilhados precedem implementações locais.
5. Toda tela precisa de estados `loading`, `empty`, `error`, `success` e `disabled` quando aplicáveis. Formulários devem usar `react-hook-form` e `zod` para validação robusta.
6. WCAG 2.2 AA é requisito de produto. Componentes interativos complexos (Dialog, Dropdown, Select) devem usar primitivas de acessibilidade (como `@radix-ui`).
7. Responsividade obrigatória desde 360 px.
8. Motion é funcional, curto e opcional via `prefers-reduced-motion`. Feedback transiente (sucesso/erro não bloqueante) deve usar sistema unificado de Toasts (Sonner).
9. Segredos nunca chegam ao frontend, logs públicos, URLs ou repositório.
10. Toda ação sensível gera auditoria segura e minimizada.
11. Integrações externas usam adaptador, timeout, retry, idempotência e observabilidade.
12. Suporte nativo a temas (Light/Dark) via `next-themes` sem "FOUC", lendo a preferência do sistema operacional por padrão.
12. IA nunca recebe autoridade implícita para executar ações destrutivas ou acessar dados fora do escopo.
13. Nenhum módulo concentra domínio, banco, HTTP e UI em arquivo monolítico.
14. Não inventar novo padrão visual se já existir token, componente ou fluxo equivalente.

## 3. Ordem obrigatória de leitura

1. `01_PRODUCT_SCOPE.md`
2. `02_ARCHITECTURE.md`
3. `03_TENANCY.md`
4. `04_SECURITY.md`
5. `05_AUTH_RBAC.md`
6. `06_DATABASE.md`
7. `07_API_EVENTS.md`
8. `08_QUEUES.md`
9. `09_AI_RAG_MCP.md`
10. `10_WHATSAPP.md`
11. `11_BILLING_PLANS.md`
12. `12_UX_UI.md`
13. `13_ACCESSIBILITY_SEO.md`
14. `14_DESIGN_TOKENS.md`
15. `15_INTEGRATIONS.md`
16. `16_TESTING.md`
17. `17_DEVOPS_DOCKER.md`
18. `18_NAMING_CONVENTIONS.md`
19. `19_DATA_GOVERNANCE.md`
20. `20_AI_AGENT_COMMANDS.md`
21. `21_CONFIGURATION.md`
22. `22_LAYOUT_COMPONENTS.md`
23. `23_MODULAR_ARCHITECTURE.md`
24. `24_INTERACTIONS_MOTION_DATA_REFRESH.md`
25. `25_HTTPS_PROXY_FILE_SECURITY.md`
26. `26_ERROR_CATALOG_AUDIT.md`
27. `27_INTEGRATION_HEALTH.md`
28. `28_AUTH_SURFACES_BOOTSTRAP.md`
29. `29_AUTH_UX_FLOWS.md`
30. `30_DESIGN_SYSTEM_IMPLEMENTATION.md`
31. `31_DESIGN_TOKENS_AUTH.md`
32. `32_UI_COMPONENTS_STANDARD.md`

## 4. Precedência em caso de conflito

1. segurança, privacidade, LGPD e isolamento de tenant;
2. integridade, autorização e contratos de dados;
3. arquitetura e limites de módulo;
4. acessibilidade e confiabilidade;
5. design system e consistência de experiência;
6. performance;
7. velocidade de entrega.

Regra mais específica prevalece sobre regra genérica desde que não reduza segurança, privacidade ou acessibilidade.

## 5. Contrato para qualquer agente de IA

### Antes de editar

- identificar módulo, superfície, tenant e usuário afetado;
- ler as regras relacionadas;
- verificar componentes, tokens, eventos, permissões, tabelas e erros já existentes;
- declarar arquivos a criar/alterar e critérios de aceite;
- identificar risco de segurança, migração, compatibilidade e acessibilidade;
- parar e pedir decisão quando houver conflito real de domínio.

### Durante a edição

- reutilizar nomes canônicos;
- não criar endpoints, SQL, permissões, claims ou segredos fora do contrato;
- validar entrada na borda e no domínio;
- aplicar tenant context e autorização em cada operação;
- usar componentes de `packages/ui` antes de criar componente local;
- usar tokens semânticos em vez de valores soltos;
- impedir duplo submit e operações concorrentes não idempotentes;
- escrever testes proporcionais ao risco.

### Depois da edição

- rodar lint, typecheck, testes e build relevantes;
- conferir acessibilidade por teclado e reduced motion;
- verificar responsividade em 360, 768, 1024 e desktop;
- revisar logs e erros para ausência de segredo/PII desnecessária;
- documentar decisão relevante em `docs/decisions.md`;
- atualizar taskboard quando aplicável;
- não declarar concluído sem critério de aceite verificável.

## 6. Stack de referência observada no repositório

- monorepo com pnpm + Turborepo;
- frontends em Next.js + React + TypeScript;
- Tailwind CSS como infraestrutura de estilos;
- `apps/tenant-web` para painel do contratante;
- `apps/superadmin-web` para operação da plataforma;
- `apps/marketing-web` para presença pública;
- `apps/api`, workers e pacotes compartilhados;
- `packages/ui` é a casa dos componentes compartilhados;
- `packages/auth`, `packages/security`, `packages/contracts` e `packages/db` concentram contratos transversais.

A implementação pode evoluir, mas alterações estruturais exigem decisão registrada.

## 7. Primeiro marco de experiência

A fundação de identidade deve ficar completa antes de expandir módulos operacionais:

registro → verificação de e-mail → onboarding → criação/seleção de tenant → login → logout → recuperação de senha → nova senha → revogação de sessão → shell responsivo.

O fluxo visual e comportamental dessas telas está em `29_AUTH_UX_FLOWS.md`.

## 8. Não negociáveis adicionais

- `platform_owner` nasce apenas por bootstrap controlado no servidor.
- Superadmin e tenant usam superfícies, cookies e audiences separados.
- Nenhum token de integração é retornado por endpoint de leitura.
- Recuperação de senha não revela se um e-mail existe.
- OTP/código de verificação é de uso único, expira e possui proteção contra brute force.
- O layout do SaaS deve seguir `12`, `14`, `22`, `24` e `30` sem criar variações ad hoc.
- Gradiente pode reforçar marca; nunca é a única forma de comunicar estado.
- Motion nunca bloqueia tarefa, foco, leitura ou navegação.
