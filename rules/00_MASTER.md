# BipeSend Rules — regra mestre

Versão: 2.2.0
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
7. Reflow obrigatório desde 320 px; validar mobile em 360 px.
8. Motion é funcional, curto e opcional via `prefers-reduced-motion`. Feedback transiente (sucesso/erro não bloqueante) deve usar sistema unificado de Toasts (Sonner).
9. Segredos nunca chegam ao frontend, logs públicos, URLs ou repositório.
10. Toda ação sensível gera auditoria segura e minimizada.
11. Integrações externas usam adaptador, timeout, retry, idempotência e observabilidade.
12. Suporte nativo a temas (Light/Dark) via `next-themes` sem "FOUC", lendo a preferência do sistema operacional por padrão.
13. IA nunca recebe autoridade implícita para executar ações destrutivas ou acessar dados fora do escopo.
14. Nenhum módulo concentra domínio, banco, HTTP e UI em arquivo monolítico.
15. Não inventar novo padrão visual se já existir token, componente ou fluxo equivalente.
16. Validações de UI dinâmicas e formulários (ex: campos obrigatórios por estágio) devem espelhar as regras de servidor, utilizando schemas unificados do `packages/contracts` para garantir única fonte de verdade.
17. Utilizar `@hello-pangea/dnd` para funcionalidades de Drag-and-Drop, garantindo acessibilidade, suporte a navegação por teclado e sem ferir os estilos nativos do Tailwind/UI.
18. Padrões de SEO (Title, Meta Descriptions semânticas) devem ser aplicados consistentemente no frontend.
19. Colunas JSONB (como regras de estágio de pipeline) devem ter contratos explícitos e versionados (ex: `{"version": 1, "rules": []}`) em `packages/contracts` com Zod. Validações dinâmicas devem considerar referências desconhecidas ou de outros tenants como inválidas e bloquear deleções de campos ou opções em uso por regras ativas. Campos obrigatórios validam ausência, `null`, texto/seleção vazia como não preenchidos; mas `0` e `false` são preenchidos.

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
33. `33_ENVIRONMENT_VARIABLES_GUIDELINES.md`
34. `34_DELIVERY_EVIDENCE.md`
35. `35_MOBILE_WEB_NATIVE.md`
36. `36_PREMIUM_UI_SHARED.md`

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
- usar componentes de `packages/ui` antes de criar componente local; exceção específica autorizada: UI do BipeWPRO em `packages/web-builder-ui`, compartilhando os tokens atuais;
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
- `packages/ui` é a casa dos componentes compartilhados do SaaS; a UI específica do construtor fica em `packages/web-builder-ui`;
- `packages/auth`, `packages/security`, `packages/contracts` e `packages/db` concentram contratos transversais.

### Padrão Arquitetural de Integração Frontend-Backend

A plataforma adota uma divisão estrita de responsabilidades para garantir que as regras de negócio e de autorização sejam centralizadas e consumíveis por múltiplas superfícies (painel, app mobile, integrações):

- **Server Actions (`tenant-web` e afins)**: Atuam como uma camada fina (BFF). Responsáveis por verificar a sessão web, validar a entrada (Zod), chamar a API via HTTP (não devem usar Prisma direto) e atualizar a interface após o sucesso (`revalidatePath`).
- **Fastify (`apps/api`)**: Recebe as requisições, identifica usuário e sessão, resolve o vínculo ativo (tenant) e encaminha para os serviços de aplicação com regras de negócio.
- **`packages/auth/policies`**: Avalia permissões e escopos. A aplicação obrigatória ocorre no backend (Fastify).
- **Repositórios e `packages/db`**: Executam Prisma, gerenciam transações, isolamento e persistência de auditoria, operando estritamente por trás dos serviços do Fastify.
- **`packages/contracts`**: Compartilham schemas, dados de entrada/saída e erros entre o painel e a API.

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
- Auth mantém composição clara específica; o workspace mobile suporta light/dark e navegação própria, conforme `35`.
- Em conflitos de números/tokens, `packages/ui/src/styles/tokens.css` + regra `14` prevalecem; regras `31/32` foram reconciliadas nesta revisão.
- Evidência atual: `docs/audit/validation.md`; histórico relatado não substitui execução. Arquivos arquivados fora de `rules/` não são regras ativas.

## 9. Planejamento BipeWPRO - 2026-09-15

O construtor compartilhado, catálogo Food, publicação e contratos de capacidade/cota estão especificados em `docs/plans/bipewpro.md`. Regras 36/37 complementam os padrões existentes. O planejamento não ativa funcionalidades nem conclui cards de implementação. O taskboard preserva PAGE/CAT/BILL e acrescenta WPRO para entregas distintas. Integração com a frente do Gemini é aditiva, sem mover código ou alterar migração histórica por conveniência.

### Início da execução — 2026-09-16

O usuário reservou a reforma completa de `packages/ui` para outra etapa. A primeira fatia do BipeWPRO cria `web-builder-ui`, `web-builder-core`, `web-renderer` e `web-builder`, sem alterar componentes/tokens atuais do SaaS. Estado real, gates e limites em `docs/audit/bipewpro-foundation.md`. A galeria é local; ela não constitui habilitação do produto, CRUD autorizado nem publicação.
