# Retomada BipeWPRO

Branch: `feat/bipewpro-planning`. Planejamento sobre `489fae2`; execução incorpora main `46832fc` e preserva CRM/inbox. Primeira fatia: contratos, core, renderer, UI dedicada e editor local. Nenhum CRUD/entitlement persistido, migration, preço de plano ou publicação foi ativado.

## Leitura

1. `AGENTS.md`, `rules/00_MASTER.md`, `rules/36_BIPEWPRO.md`, `rules/37_PREMIUM_UI_SHARED.md`.
2. `docs/plans/bipewpro.md`, `packages/README.md`, `packages/web-builder-ui/PREMIUM_LAYOUT.md`.
3. `docs/taskboard.json` e card completo; manter os IDs PAGE/CAT/BILL canônicos.
4. `docs/audit/bipewpro-foundation.md` para resultados executados; planejamento histórico em `docs/audit/bipewpro-planning.md`.

## Isolar do Gemini local

No repositório local, sem mudar a branch em que o Gemini trabalha:

```bash
git fetch origin
git worktree add -b work/bipewpro ../appbipe-bipewpro origin/feat/bipewpro-planning
```

Se esse worktree/branch já existir, inspecione e reutilize; não force criação nem apague trabalho local. Ao entrar no worktree separado, confira `git status` e o diff com a main remota antes de editar arquivos compartilhados.

## Próxima fatia

Retomar PAGE-001 (migrações/manifest/capabilities e referências), WPRO-004 (controles/estados e resize restantes) e BILL-001 (enforcement persistido). WPRO-003 depende de PAGE-001: fazer o spike Pangea antes de oferecer arraste. Consultar o status canônico e evidência de WPRO-002. Não reconstruir schemas já adicionados em contracts/web/catalog/entitlements, nem criar serviço de planos paralelo.

Não refatorar globalmente `schema.prisma`, contracts/index, policies, tokens ou lockfile enquanto houver alterações concorrentes não integradas. Registre as adições por responsabilidade e faça migrações do BipeWPRO separadas. Não editar/resetar banco do trabalho local do Gemini.

## Decisões que devem sobreviver à implementação

- UI específica em `packages/web-builder-ui`. Preservar a implementação de `packages/ui`; sua reforma completa está fora desta etapa.
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
pnpm install --frozen-lockfile
pnpm bipewpro:check
pnpm bipewpro:smoke
pnpm taskboard:render
pnpm taskboard:check
pnpm rules:check
pnpm architecture:check
pnpm secrets:check
git diff --check
```

Para código, instalar a versão de pnpm declarada no package.json e lockfile, gerar Prisma sem migrar banco e executar o gate/card pertinente. Não substituir teste real por relato antigo. Resultados, ambiente e gates que continuam abertos estão na auditoria da implementação; não inferir produção/E2E de banco a partir dos testes locais.

Conflitos de taskboard são resolvidos por ID, mantendo os avanços das duas frentes; o Markdown sempre é regenerado. Buscar a main antes da integração. Merge e deploy dependem do escopo solicitado; esta entrega não os inclui.

## Testar a galeria local

`pnpm bipewpro:dev` abre servidor em `http://127.0.0.1:3110`. Contém fixture explícita, quatro elementos, estilos responsivos, histórico e download de rascunho. Estado em memória; não é a página atual de catálogo do tenant. Não usar dados reais, credenciais ou conteúdo de cliente na galeria.

## Reproduzir o PDF

Com Python, reportlab e fontes DejaVu Sans instalados:

```bash
python3 scripts/build_bipewpro_pdf.py --output output/pdf/bipewpro-planejamento.pdf
```

O Markdown é a fonte técnica; o PDF deve ser regenerado e revisado após alterações no plano. A cópia entregue no planejamento original tem 22 páginas e representa aquela revisão; após a mudança de destino da UI, o Markdown/ADR-BW-009 e o taskboard são a referência vigente.
