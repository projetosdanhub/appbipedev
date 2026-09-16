# Retomada BipeWPRO

Branch: `feat/bipewpro-planning`. Base auditada: `489fae20e9370d099c1a77701fa1855deb4bb0c4`. Entrega: planejamento, regras, mapa de pacotes, guia premium e taskboard. Nenhum recurso de produção, migration, preço de plano ou publicação foi ativado.

## Leitura

1. `AGENTS.md`, `rules/00_MASTER.md`, `rules/36_BIPEWPRO.md`, `rules/37_PREMIUM_UI_SHARED.md`.
2. `docs/plans/bipewpro.md`, `packages/README.md`, `packages/ui/PREMIUM_LAYOUT.md`.
3. `docs/taskboard.json` e card completo; manter os IDs PAGE/CAT/BILL canônicos.
4. `docs/audit/bipewpro-planning.md` para resultados observados e limites.

## Isolar do Gemini local

No repositório local, sem mudar a branch em que o Gemini trabalha:

```bash
git fetch origin
git worktree add -b work/bipewpro ../appbipe-bipewpro origin/feat/bipewpro-planning
```

Se esse worktree/branch já existir, inspecione e reutilize; não force criação nem apague trabalho local. Ao entrar no worktree separado, confira `git status` e o diff com a main remota antes de editar arquivos compartilhados.

## Próxima fatia

Executar WPRO-002 após conferir dependências: contratos em subpastas, fronteiras e exports compatíveis, plano de contexto tenant/platform, guardas de package e tratamento de logs por allowlist. PAGE-001, BILL-001, WPRO-003 e WPRO-004 vêm a seguir. Nenhuma pasta vazia deve ser apresentada como motor implementado.

Não refatorar globalmente `schema.prisma`, contracts/index, policies, tokens ou lockfile enquanto houver alterações concorrentes não integradas. Registre as adições por responsabilidade e faça migrações do BipeWPRO separadas. Não editar/resetar banco do trabalho local do Gemini.

## Decisões que devem sobreviver à implementação

- Mesmo core/editor/renderer para tenant e platform; segurança/contexto continuam distintos.
- Documento responsivo único; o site público não importa o bundle de edição.
- Uma inicial + três páginas = um site e quatro páginas. Menus/âncoras não duplicam páginas.
- BILL-001 antecede CRUD com cota; planos futuros usam a mesma fundação.
- Food separado do editor; cálculo e snapshot de pedido no backend.
- Pangea exige spike; não prometer grid livre que a biblioteca não suporta.
- CSS/HTML/SVG/shortcode restritos; PHP só após WPRO-016, isolado do SaaS.
- Publicação usa versão imutável e infraestrutura compartilhada MSG; domínio ativo exige propriedade e TLS.

## Verificar e integrar

```bash
pnpm taskboard:render
pnpm taskboard:check
pnpm rules:check
pnpm architecture:check
pnpm secrets:check
git diff --check
```

Para código, instalar a versão de pnpm declarada no package.json e lockfile, gerar Prisma sem migrar banco e executar o gate/card pertinente. Não substituir teste real por relato antigo. O ambiente desta entrega executou os scripts documentais via pnpm/Node; veja evidência antes de inferir que todo o CI foi executado.

Conflitos de taskboard são resolvidos por ID, mantendo os avanços das duas frentes; o Markdown sempre é regenerado. Buscar a main antes da integração. Merge e deploy dependem do escopo solicitado; esta entrega não os inclui.

## Reproduzir o PDF

Com Python, reportlab e fontes DejaVu Sans instalados:

```bash
python3 scripts/build_bipewpro_pdf.py --output output/pdf/bipewpro-planejamento.pdf
```

O Markdown é a fonte técnica; o PDF deve ser regenerado e revisado após alterações no plano. A cópia entregue nesta etapa tem 22 páginas.
