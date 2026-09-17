# @bipesend/web-builder

Composição React compartilhável entre tenant e superadmin. Consumidor real de `web-builder-core`, `web-renderer`, `web-builder-ui` e `contracts/web`; features dos apps integrarão identidade/API depois dos gates de ownership e cotas.

## Primeira fatia funcional

`DocumentEditor({ initialDocument, onDocumentChange? })` oferece adicionar quatro blocos, selecionar em Camadas, editar conteúdo, flex/grid, estilos por viewport, restaurar herança, reordenar/remover, desfazer/refazer e baixar JSON. Formulários usam schemas compartilhados e react-hook-form. Preview seguro usa o mesmo renderer público com navegação inativa.

Estado em memória, explicitamente indicado na tela. Não há autosave/CRUD/publicação, DnD, catálogo comercial ou enforcement de planos. O callback recebe o documento inicial e suas alterações; não é confirmação de salvamento. `initialDocument` inicializa a sessão: ao trocar espaço/site/página, a futura feature deve remontar com uma key estável desse contexto e tratar rascunhos pendentes/conflitos.

## Desenvolver e verificar

Na raiz:

```bash
pnpm install --frozen-lockfile
pnpm bipewpro:dev
```

Abrir `http://127.0.0.1:3110`. O Vite serve somente a galeria local, com fixture sintética e noindex; não adiciona rota pública nem muda a tela atual de catálogo. `pnpm bipewpro:check` compila/testa/linta a fatia. `pnpm bipewpro:smoke` requer Chromium do Playwright ou `PLAYWRIGHT_CHROMIUM_EXECUTABLE` apontando para um binário compatível. `pnpm --filter @bipesend/web-builder demo:build` mede a galeria de desenvolvimento, não um site publicado.

## Integração posterior

Next Actions continuam BFF fino; Fastify resolve sessão/space/policies e BILL-001. Não transmitir autoridade platform por props/payload do cliente. Não usar `describeSiteCreation` como autorização. Pangea segue obrigatório para o spike de arraste; nesta fatia a reordenação usa comandos explícitos acessíveis.

PAGE-001 e WPRO-004 seguem em andamento; WPRO-003, PAGE-002 e persistência dependem de seus gates. Veja `docs/plans/bipewpro-handoff.md` e a evidência do card antes de iniciar migrations ou ativar o produto.
