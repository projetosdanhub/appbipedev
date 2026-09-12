# Interações, motion e atualização de dados

## 1. Objetivo

Definir comportamento compartilhado de feedback, transições, carregamento e atualização. Valores vêm de `14_DESIGN_TOKENS.md`.

## 2. Motion funcional

Motion deve:
- confirmar causalidade;
- orientar mudança de contexto;
- preservar sensação de continuidade;
- nunca atrasar tarefa.

Não usar animação infinita decorativa no painel.

## 3. Padrões

### Hover
`motion.fast`; alteração sutil de fundo/borda/elevação. Nunca deslocar layout.

### Pressed
`motion.instant`; compressão visual máxima ~1–2% quando apropriado. Evitar em controles pequenos se prejudicar nitidez.

### Focus
Ring aparece imediatamente; glow de marca discreto opcional, sem pulsar.

### Entrada de página
Fade + translateY pequeno (4–8 px), `motion.base`. Shell não reanima a cada navegação.

### Troca de auth
Conteúdo da etapa: fade + translateX/Y pequeno, `motion.auth`. Não animar painel inteiro com deslocamentos longos.

### Dialog
Overlay fade; superfície fade + scale muito sutil ou translateY, `motion.panel`.

### Drawer
Slide do lado lógico da navegação, `motion.panel`.

### Toast
Fade/translate de poucos pixels. Saída mais rápida.

### Success
Check pode desenhar/escala discretamente até `motion.success`; texto permanece estável.

### Error
Não sacudir formulário. Borda/mensagem aparecem com fade curto. Shake é proibido como padrão.

## 4. Loading

Ação local mostra loading local. Preservar largura de botão para evitar layout shift. Skeleton em conteúdo. Spinner apenas quando a forma do resultado não é conhecida.

## 5. Auth específico

- botão `Entrar`: label pode virar `Entrando...`;
- `Enviar código`: `Enviando...`;
- `Redefinir senha`: `Atualizando...`;
- após sucesso, check + mensagem;
- OTP: preenchimento tem feedback sutil por célula, sem bounce;
- erro de OTP mantém dígitos para correção;
- reenvio exibe contador textual;
- colagem preenche tudo em uma operação.

## 6. Reduced motion

Com `prefers-reduced-motion: reduce`:
- remover transforms decorativos;
- reduzir duração drasticamente;
- manter mudança de estado instantânea/fade mínimo;
- parar shimmer/pulsos;
- não alterar ordem/foco.

## 7. Dados

Cliente usa mecanismo compartilhado de query/cache/invalidação. Não criar fetch/polling isolado por página sem justificativa.

## 8. Atualização por recurso

| Recurso | Estratégia |
|---|---|
| Inbox/conversa | evento realtime + revalidação |
| Notificações | evento + reconexão/backoff |
| Dashboard | revalidar ao abrir/foco + intervalo moderado |
| Listas | após mutação + foco |
| Upload/processamento | evento ou polling controlado |
| Configurações | após salvar |
| Saúde integrações | evento/revalidação + intervalo por provider |

Polling pausa em aba oculta e usa backoff.

## 9. Refresh global

Atualiza apenas superfície atual, preservando rota, filtros, seleção, scroll e rascunho. Não usar `window.location.reload` como padrão.

## 10. Otimismo

Optimistic UI somente quando rollback é seguro e efeito é previsível. Cobrança, envio externo, permissão e destruição não presumem sucesso sem confirmação adequada.

## 11. Versão da aplicação

Detectar versão nova sem recarregar durante digitação/edição/operação crítica. Oferecer atualização acessível e preservar rascunho quando possível.
