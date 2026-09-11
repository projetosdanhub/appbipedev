# Interações, motion e atualização de dados

## Objetivo

Definir o comportamento visual e operacional de menus, abas, filtros, botões,
dados carregados, atualização automática e atualização de versões sem duplicar
as regras de UX, tokens ou componentes.

- UX e UI ficam em 12_UX_UI.md.
- valores visuais canônicos ficam em 14_DESIGN_TOKENS.md.
- contratos de componentes e layout ficam em 22_LAYOUT_COMPONENTS.md.
- este arquivo define comportamento de interação, frescor de dados e versão.

## Estados obrigatórios

Todo componente interativo deve ter, quando aplicável:

- default;
- hover;
- focus-visible;
- pressed ou selected;
- disabled;
- loading;
- success;
- error;
- empty;
- offline ou stale.

Estados não podem depender apenas de cor. O estado atual deve ser perceptível
por texto, ícone SVG, forma, posição ou combinação acessível desses recursos.

## Motion e transições

- usar somente tokens de duração e easing definidos no design system;
- padrão: 120 ms para feedback imediato, 180 ms para transições de interface e
  até 240 ms para painéis ou drawers;
- entradas usam opacity e transform, sem alterar o layout de conteúdo essencial;
- saídas podem ser mais rápidas que entradas;
- menus, drawers, diálogos e abas devem ter entrada e saída consistentes;
- não usar bounce, zoom exagerado, parallax ou animação decorativa contínua no
  painel administrativo;
- não animar a posição de conteúdo enquanto o usuário digita ou navega;
- reservar dimensões antes de carregar imagens, gráficos ou dados;
- respeitar prefers-reduced-motion: remover animações não essenciais, manter
  foco, ordem e feedback;
- animação nunca pode ser o único meio de comunicar mudança de estado.

## Gradientes, nitidez e visibilidade

- gradientes são decorativos e devem usar somente cores do design system;
- todo gradiente deve ter fallback de cor sólida;
- não usar gradiente atrás de texto pequeno, mensagens de erro, preços,
  métricas críticas ou controles primários sem validação de contraste;
- não usar gradiente animado no painel;
- não usar blur, glassmorphism ou transparência para esconder informação;
- textos e ícones informativos devem permanecer nítidos em zoom de 200%;
- não usar opacity para tornar informação importante ilegível;
- focus-visible deve ter indicador de pelo menos 2 px e contraste verificável;
- estados de disabled não podem ser confundidos com erro ou carregamento.

## Fonte de verdade dos dados

- PostgreSQL é a fonte de verdade de negócio;
- o cliente usa um único mecanismo compartilhado de consulta, cache e
  invalidação;
- não criar fetch, polling ou cache isolado dentro de cada página;
- uma mutação bem-sucedida deve invalidar ou atualizar o recurso relacionado;
- atualização otimista só é permitida quando houver rollback seguro;
- filtros, aba ativa, seleção, scroll e rascunho devem ser preservados após
  atualização de dados;
- uma falha em um painel não pode derrubar a tela inteira.

## Atualização automática

A política deve ser definida por recurso, nunca por um timer global:

| Recurso | Padrão |
| --- | --- |
| Inbox e conversa | WebSocket/evento; polling de fallback somente em tela visível |
| Notificações | evento em tempo real, com reconexão e backoff |
| Métricas e dashboard | revalidação ao abrir, ao voltar ao foco e intervalo configurável |
| Tabelas e listas | revalidação após mutação e ao voltar ao foco |
| Upload e processamento | evento de progresso ou polling controlado |
| Configurações | revalidação após salvar e ao reabrir |
| Conteúdo público | cache com invalidação por publicação |
| Saúde de integrações | evento de transição, revalidação ao abrir/foco e intervalo por provider |

Polling deve pausar quando a aba estiver oculta, respeitar limite do plano,
usar backoff em falhas e impedir requisições concorrentes duplicadas. Dados
stale devem ser identificados sem bloquear a leitura segura do último estado.

## Botão global de refresh

O shell autenticado deve oferecer uma ação global de atualizar dados:

- ícone SVG aprovado e label acessível;
- atualiza somente os dados da superfície atual;
- não usa window.location.reload como comportamento padrão;
- mantém rota, filtros, aba, seleção, scroll e rascunhos;
- mostra loading no próprio botão;
- impede cliques duplicados e chamadas concorrentes;
- informa horário da última atualização;
- anuncia sucesso ou erro sem roubar foco;
- oferece retry acionável quando falhar;
- não substitui atualizações em tempo real;
- não atualiza dados para os quais o usuário não tem permissão.

Cada módulo pode ter refresh local adicional, mas deve reutilizar o mesmo
contrato de consulta e não criar outro padrão visual.

## Atualização de frontend e backend

O backend não deve enviar código ou arquivos arbitrários ao navegador. Para
entregar versões atualizadas:

- assets de frontend devem usar nomes com hash de build;
- contratos de API devem ser versionados quando houver quebra;
- respostas adequadas podem usar ETag ou Last-Modified;
- conteúdo autenticado não deve ficar em cache público;
- o cliente deve detectar mudança de versão do aplicativo por um manifesto ou
  endpoint controlado;
- quando houver nova versão, mostrar aviso acessível de atualização;
- nunca recarregar durante digitação, envio, edição ou operação crítica;
- preservar rascunhos antes de solicitar reload;
- service worker só pode existir com cache versionado, invalidação e rollback;
- correções de segurança podem exigir atualização imediata conforme política
  registrada e auditada.

## Critérios de teste

Cada módulo que exibir dados deve testar:

- loading sem layout shift;
- refresh manual com preservação de contexto;
- atualização após mutação;
- reconexão ou fallback quando evento falhar;
- pausa de polling com aba oculta;
- erro e retry;
- foco e teclado;
- prefers-reduced-motion;
- ausência de chamadas duplicadas;
- detecção de nova versão sem perda de dados não salvos.
- estado de integração com texto/ícone, última verificação e reduced motion.
