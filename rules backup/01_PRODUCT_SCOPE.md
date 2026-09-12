# Escopo de produto

## Modulos

- Identidade: conta, tenant, sessoes, verificacao, recuperacao, MFA futuro.
- Equipe: membros, cargos, permissoes, setores, convites e auditoria.
- Inbox: conversas, mensagens, anexos, atribuicao, tags e tempo real.
- CRM: contatos, campos customizados, pipelines, etapas, listas, kanban e visualizacao inbox.
- Automacoes: gatilhos, condicoes, acoes, agendamento, aprovacoes e historico.
- WhatsApp: conexao por QR, recebimento, envio, status e provider adapter.
- IA: copiloto, RAG por tenant, politicas, provedores e trilhas de auditoria.
- Catalogo: categorias, produtos, adicionais, imagens, videos, carrinho e pedidos.
- Pagamentos: Stripe Connect e Mercado Pago OAuth em modo sandbox primeiro.
- Pages: editor de blocos, temas, SEO, dominios, pixel e catalogo publicado.
- Billing: planos, assinaturas, entitlements, uso, upgrade, downgrade e faturas.
- Superadmin: tenants, planos, plataforma, docs/rules, suporte, integracoes e observabilidade.

## MVP realista

Entra no MVP: identidade, tenant, RBAC, painel base, contatos, inbox manual com dados de teste, auditoria, limites simples, Docker local e testes de isolamento.

Fica para a fase seguinte: WhatsApp real, automacoes, RAG, catalogo publico, pagamentos e editor de paginas.

Nao entra antes de uma revisao de produto: marketplace de extensoes, marketplace de agentes, execucao de MCP arbitrario, anti-bloqueio de WhatsApp e personalizacao com JavaScript livre.

## Regra de produto

Cada modulo deve ter: objetivo, entidades, permissoes, eventos, limites, estados, telas, criterios de aceite, estrategia de erro e cobertura de testes.
