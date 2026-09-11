# Saude de APIs e integracoes

## Objetivo

O sistema deve identificar configuracao ausente, desconexao, degradacao,
expiracao e falha de provider sem expor credenciais. A saude exibida no painel
vem de verificacoes server-side e nunca de uma chave ou chamada feita pelo
frontend.

## Estados canonicos

| Estado | Significado | Indicacao visual |
| --- | --- | --- |
| `connected` | ultima verificacao autorizada teve sucesso | indicador verde + texto |
| `degraded` | funciona parcialmente, com latencia/erros acima do limite | indicador amarelo + texto |
| `disconnected` | provider recusou, expirou ou perdeu conexao | indicador vermelho suave + texto |
| `misconfigured` | credencial, redirect, webhook ou requisito obrigatorio ausente/invalido | indicador vermelho suave + acao |
| `not_entitled` | recurso nao esta incluido no plano | estado neutro + upgrade |
| `disabled` | desativado intencionalmente | estado neutro + texto |
| `unknown` | ainda nao verificado ou verificacao vencida | indicador neutro + ultima verificacao |

`not_entitled` nao e erro tecnico e nao deve ser tratado como provider
desconectado.

## Registro server-side

Cada conexao deve manter, no minimo:

- tenant, provider, ambiente e identificador interno da conexao;
- estado, `lastCheckedAt`, `lastSuccessAt`, latencia e proxima verificacao;
- codigo BipeSend seguro, mensagem operacional curta e motivo da transicao;
- `providerRequestId` quando fornecido e `correlationId` interno;
- versao do adapter e timestamp de atualizacao.

Nunca persistir token em resposta de leitura, log, evento de UI ou mensagem de
erro. Segredos ficam em secret manager ou ciphertext de envelope conforme
`04_SECURITY.md`, e a tela mostra somente mascara e data da ultima validacao.

## Verificacao e transicoes

- health check usa adapter, timeout curto, retry com backoff e circuit breaker;
- verificacao nao deve enviar mensagem real nem criar cobranca;
- webhooks, OAuth e jobs podem atualizar a saude, sempre com idempotencia;
- falha transitoria muda para `degraded` antes de `disconnected` quando a
  politica do provider permitir;
- credencial ausente/invalida muda para `misconfigured` e mostra instrucao sem
  revelar o valor faltante;
- `lastSuccessAt` nunca e sobrescrito por falha;
- mudanca de estado relevante gera evento e registro de auditoria;
- verificacao manual exige permissao, tem cooldown e nao ignora circuit breaker.

## Visibilidade por superficie

- admin do tenant e cargos autorizados veem somente conexoes do proprio tenant;
- superadmin ve saude agregada e detalhe operacional conforme permissao de
  suporte;
- frontend recebe estado, mensagem segura, timestamps e acao permitida, nunca
  segredo, URL interna ou payload bruto;
- integrações ausentes aparecem como `not_configured` ou `not_entitled`, nunca
  como um erro generico que confunda suporte.

## Indicador acessivel

O ponto vermelho pode piscar suavemente para chamar atencao, mas nunca e a
unica comunicacao. A celula deve ter texto, icone SVG e `aria-label` com o
estado e a ultima verificacao. A animacao deve parar com
`prefers-reduced-motion`, aba oculta ou quando o usuario dispensar o alerta.
Nao usar polling global: atualizar por evento, revalidacao ao abrir/foco e
intervalo por provider com backoff.

## Criterios de teste

- Stripe e Mercado Pago sem credencial ficam `misconfigured` sem vazar segredo;
- token expirado, timeout, 401, 429 e 5xx produzem transicoes previsiveis;
- tenant A nao consulta saude de tenant B;
- superadmin sem permissao nao acessa diagnostico detalhado;
- estado resolvido aparece no painel e deixa de piscar;
- eventos duplicados nao criam transicoes duplicadas;
- indicadores passam em teclado, leitor de tela, contraste e reduced motion.
