# UX e UI — contrato de experiência BipeSend

## 1. Direção visual

O BipeSend deve transmitir confiança, tecnologia, clareza e controle. A aparência é moderna e sofisticada, porém operacional: superfícies limpas, contraste forte, tipografia nítida, cor de marca usada com intenção, sombras discretas e motion curto.

Evitar estética genérica de "dashboard template", excesso de glassmorphism, cards por toda parte, gradientes sem função, bordas pesadas, microtexto e efeitos chamativos.

## 2. Princípios

- **clareza antes de decoração**;
- **consistência antes de criatividade local**;
- **ação primária evidente**;
- **densidade confortável** para trabalho diário;
- **feedback imediato** sem bloquear;
- **reversibilidade** quando seguro;
- **progressive disclosure** para complexidade;
- **estado sempre explícito**;
- **navegação previsível**;
- **acessibilidade por construção**.

## 3. Hierarquia de página

Toda página autenticada segue:

1. contexto: breadcrumb opcional / área;
2. título + descrição curta;
3. ações principais à direita em desktop;
4. filtros/abas quando necessários;
5. conteúdo;
6. estados auxiliares;
7. ajuda contextual sem poluir.

Não repetir o nome do produto como título de página.

## 4. Shell do tenant

Desktop:
- sidebar expandida canônica definida em `22_LAYOUT_COMPONENTS.md`;
- topbar com busca, tenant switcher quando aplicável, refresh contextual, notificações e perfil;
- conteúdo usa largura fluida com limite por tipo de página;
- navegação principal organizada por frequência e domínio.

Tablet:
- sidebar pode recolher automaticamente;
- ações secundárias migram para menu.

Mobile:
- navegação vira drawer;
- topbar compacta;
- ação primária permanece alcançável;
- conteúdo em uma coluna;
- sem hover como requisito.

## 5. Navegação de referência

Início, Inbox, Contatos, CRM, Automações, Catálogo, Páginas, Conhecimento, Integrações, Equipe, Billing e Configurações.

Itens dependem de permissão e entitlement. Ocultar item é UX; autorização real é servidor.

## 6. Páginas de autenticação

Login, registro, verificação e recuperação usam um `AuthShell` comum:
- desktop pode usar composição 40/60 ou 45/55;
- painel institucional/visual em gradiente de marca com baixo ruído;
- formulário em superfície clara, largura confortável;
- mobile remove painel decorativo e prioriza formulário;
- sem sidebar/topbar do SaaS;
- transições entre etapas seguem `24` e fluxo `29`.

## 7. Formulários

- label sempre visível;
- placeholder é exemplo, nunca label;
- ajuda contextual antes do erro quando possível;
- erro próximo ao campo e resumo quando houver múltiplos;
- Validação estrita via `zod` integrada com `react-hook-form` garantindo regras em tempo real;
- submit mostra loading, desabilita botão e impede duplo envio;
- Submissões sensíveis ou críticas devem utilizar Server Actions para segurança reforçada;
- foco vai para primeiro erro em submissão inválida quando adequado;
- senha tem mostrar/ocultar com nome acessível;
- requisitos de senha atualizam em tempo real sem depender de cor;
- não limpar formulário por erro de rede.

## 8. Tabelas e dados densos

- cabeçalho legível e alinhamento consistente;
- números alinhados à direita quando melhora comparação;
- ações de linha não devem depender apenas de ícone misterioso;
- filtros persistem por usuário/tenant quando fizer sentido;
- mobile usa cards ou scroll explícito; nunca espremer tabela até ilegibilidade;
- seleção em massa mostra escopo e contagem.

## 9. Empty, loading e error

### Loading
Skeleton que representa o conteúdo real. Evitar spinner de página inteira após shell já carregado.

### Empty
Explicar por que está vazio e oferecer próxima ação útil. Não culpar usuário.

### Error
Explicar de forma segura, oferecer retry quando possível e apresentar `requestId` para suporte em falhas técnicas.

## 10. Confirmações

Confirmar apenas ações destrutivas, financeiras, irreversíveis ou de alto impacto. Preferir undo para ações reversíveis.

Confirmação destrutiva informa:
- o que será afetado;
- se pode ser desfeito;
- dependências importantes;
- CTA destrutiva nomeada pelo verbo real.

## 11. Toasts

Toasts (implementados via Sonner) são para feedback breve, transiente e elegante (ex: "Configurações salvas"). Não devem ser usados para informação crítica que desaparece ou erros de bloqueio. Erro que exige decisão fica no contexto da página/modal.

## 12. Iconografia

Usar ícones SVG da biblioteca aprovada (Lucide no stack atual) com tamanho e stroke padronizados. Não usar emoji como ícone de interface.

## 13. Linguagem

Português do Brasil por padrão. Textos curtos, diretos e humanos. Evitar jargão técnico para cliente. Botões começam com verbo: `Salvar alterações`, `Enviar código`, `Criar conta`.

## 14. Sofisticação visual

Permitido:
- gradiente de marca em superfícies institucionais;
- micro sombras;
- brilho sutil no focus/brand;
- ilustrações abstratas discretas;
- transições curtas de opacidade/transform.

Evitar:
- blur pesado;
- vidro atrás de texto;
- neon;
- partículas contínuas;
- bounce;
- parallax no painel;
- animação infinita decorativa;
- cards com sombras grandes;
- bordas/cores diferentes inventadas por módulo.

## 15. Critério visual de pronto

Uma nova tela deve parecer nativa do BipeSend sem explicação. Se precisa criar novos valores de cor, radius, sombra, duração, botão ou campo para funcionar, a mudança deve primeiro evoluir o design system.

## Revisão de fundação — 2026-09-13

O shell desta branch tem sidebar expansível, navegação mobile própria, refresh e perfil reais. Busca global, sino e tenant switcher só entram com comportamento e dados autorizados. Não deixar controles inertes aparentando função pronta. Fonte de componentes/tokens: packages/ui; instruções de Server Actions não substituem autorização na própria action.
