# BipeWPRO: criação, catálogo e publicação

Contrato de planejamento, 2026-09-15. Fonte detalhada: `docs/plans/bipewpro.md`; execução em PAGE, CAT, BILL-001 e WPRO no taskboard. Esta regra não declara funcionalidades implementadas.

## Produto e propriedade

- Um editor compartilhado para tenant e conteúdo institucional platform; sessão, ator, espaço e permissão resolvidos no servidor.
- Site, página, catálogo, menu e item de menu são entidades distintas. Uma inicial com três páginas vinculadas consome um site e quatro páginas; âncoras não criam páginas.
- Tenant nunca escolhe autoridade platform por payload. Conteúdo institucional usa contexto específico; não fabricar tenant nem flexibilizar RLS por tenantId nulo.
- Superadmin tem criação institucional ilimitada comercialmente, mantendo limites técnicos e auditoria. Ao acessar tenant via suporte, as cotas do tenant continuam valendo.

## Documento e editor

- Árvore única, JSON versionado validado em contracts; estilos base e overrides de tablet/desktop. Sem duplicar domínio, queries ou página por viewport.
- Core, renderer e editor têm fronteiras explícitas. O bundle público não carrega inspectors, DnD ou dependências de edição.
- Usar `@hello-pangea/dnd` conforme a regra mestre; comprovar a interação no spike WPRO-003. Grid visual não comprova suporte a DnD bidimensional. Oferecer comandos de clique/teclado para hierarquia e ordem.
- Undo/redo, autosave com revisão esperada, erro recuperável, conflito 409 e preview isolado. Salvar rascunho não publica.
- Theme/templates globais e páginas publicadas apontam para revisões exatas. Alterar cabeçalho em rascunho não muda páginas no ar.

## Segurança e extensões

- HTML, rich text, CSS, SVG, URLs, imports e saída de extensão são entradas não confiáveis. Parsers, schemas, allowlists, escaping contextual, limites e isolamento; regex não é fronteira de segurança suficiente.
- Shortcodes só invocam registro tipado e autorizado, sem eval. CSS escopado não pode escapar para o painel ou baixar recursos arbitrários.
- PHP não executa nos processos/credenciais do SaaS. `web.phpExtensions` continua tecnicamente indisponível até WPRO-016 comprovar isolamento, limites, política de rede, revisão e kill switch. Permissão do plano não substitui esse gate.
- Preview sem cookies administrativos; validar origem/remetente/schema no canal de mensagens. Conteúdo público só recebe projeções publicáveis.
- Mídia em quarentena; derivado aprovado antes de publicação, defesa SSRF e cota de storage. Nunca remover mídia em uso silenciosamente.

## Planos, Food e publicação

- BILL-001 é o único serviço de capacidades e cotas. Não criar WebPlan/FoodPlan ou contadores locais concorrentes com billing futuro.
- Criar/duplicar/importar/restaurar e publicar verificam capacidade no servidor; consumo de cota e gravação são atômicos. Downgrade não apaga dados.
- Produtos/opções/frete/pedido pertencem a `10-catalog`; páginas/templates/domínios a `11-pages`; planos a `12-billing`.
- Food recalcula valores no servidor e persiste snapshot. Status de atendimento e financeiro são distintos; redirect não confirma pagamento.
- Publicação usa release imutável, evento pós-commit e ativação por comparação de geração. Retry não duplica e job antigo não substitui versão nova. Reutilizar MSG-001/002.
- URL provisória por site, slug único por site e domínio único globalmente. Verificar propriedade DNS e TLS antes de ativar; bloquear hosts/rotas operacionais reservados.
- Conteúdo de tenant usa origem pública separada da autenticação. Superadmin pode usar caminhos/subdomínios institucionais controlados. Host arbitrário não gera canonical nem autoridade.

## Qualidade e entrega

Templates devem ter HTML significativo, metas verificáveis de Core Web Vitals, Lighthouse reproduzível, WCAG 2.2 AA, reflow e redução de movimento. Não garantir ranking, nota 100 ou conformidade automática. Efeitos públicos são opt-in; interface operacional mantém motion funcional.

Preservar o trabalho paralelo do Gemini. Schema, contratos, exports, lockfile e taskboard exigem integração aditiva. Novas tabelas só em migrations próprias após conferir o estado real; sem reset, migração histórica reescrita ou permissões temporárias abertas.
