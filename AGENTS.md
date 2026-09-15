# BipeSend — contrato para humanos e agentes

Leia `rules/00_MASTER.md`, as regras do domínio, `docs/taskboard.md` e o README do pacote antes de alterar código. A instrução do usuário define o escopo autorizado. Continue trabalho reversível já autorizado; não peça a mesma permissão novamente.

- Títulos Inter; corpo Poppins. Marca preservada: azul #007BFF, violeta #6366F1, tinta #0F172A e superfície #F8FAFC.
- Valores executáveis em `packages/ui/src/styles/tokens.css`. Gradiente original é identidade visual; controles usam tons semânticos com contraste. Nunca copiar a paleta para cada app.
- Novos componentes genéricos em `packages/ui`; fluxos de negócio em `apps/*/src/features`; rotas finas. Pacotes de servidor nunca no bundle cliente.
- Ao implementar validações de interface condicionais (ex: campos de formulário dependentes de estágio), espelhe os schemas Zod de `packages/contracts` que ditam as regras do banco (ex: JSONB rules). 
- Para Drag-and-Drop, use exclusivamente `@hello-pangea/dnd`. Sempre aplique regras de acessibilidade e meta tags para SEO em páginas do Next.js.
- Autorização real em cada entrada de servidor. Tenant selecionado pelo cliente não é contexto confiável. Use policies e transação ligada à mesma conexão.
- Login/registro têm composição visual existente. Alterações de segurança e acessibilidade necessárias são permitidas; registre a validação, sem declarar E2E por inferência.
- Nenhuma credencial, OTP, token, conversa real ou `.env` no git, screenshot ou log. Use dados explicitamente fictícios em demonstrações.
- Rode os comandos do card. `pnpm foundation:check` é o gate da fundação; integração com PostgreSQL/Redis e E2E de identidade são gates separados.
- Atualize `docs/taskboard.json`, rode `pnpm taskboard:render` e `pnpm taskboard:check`. DONE exige evidência e dependências satisfeitas; trabalho parcial continua aberto.
- Entregue branch revisável, sem merge/deploy implícito. Retomada: `docs/ANTIGRAVITY_HANDOFF.md`. Migrações incompatíveis: `packages/db/README.md`.
