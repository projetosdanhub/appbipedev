# WhatsApp e mensageria

## 1. Providers

Integrações de WhatsApp ficam atrás de adaptadores. Payload específico de provider não deve contaminar o domínio.

## 2. Política

Respeitar opt-in, opt-out, janela de atendimento, templates e regras vigentes do provider. Não criar mecanismo para contornar bloqueios, limites ou políticas.

## 3. Envio

- idempotência;
- fila;
- status normalizado;
- retry somente quando seguro;
- correlação com provider message ID;
- limites por tenant/canal;
- auditoria de ações administrativas.

## 4. Recebimento

Webhook validado, deduplicado e enfileirado. Anexos passam pela política de arquivo. Conteúdo é potencialmente malicioso para renderização, IA e links.

## 5. UX

Status de mensagem não depende apenas de cor. Falha deve mostrar motivo seguro/normalizado e ação possível, sem expor payload secreto do provider.

## Revisão de fundação — 2026-09-13

Cada provider tem assinatura/encoding próprios; protocolo genérico timestamp.rawBody não substitui documentação do WhatsApp. Dedupe persistente precede efeito; respeitar opt-out, janela, limites e regras atuais do provider verificadas na implementação.
