# Saúde de integrações

## 1. Estado normalizado

- `healthy`
- `degraded`
- `action_required`
- `down`
- `unknown`

Estado do provider não é igual a estado da credencial; modelar separadamente quando necessário.

## 2. Health check

Check tem timeout e não revela segredo. Resultado armazena horário, latência/erro normalizado e próxima ação.

## 3. UX

`IntegrationStatusBadge` mostra texto + ícone, não só cor. Exibir última verificação e CTA como `Reconectar`, `Ver detalhes` ou `Tentar novamente`.

## 4. Atualização

Revalidar ao abrir, voltar ao foco e por intervalo controlado. Evento de provider pode atualizar imediatamente. Não fazer polling agressivo.

## 5. Alertas

Notificar apenas transições relevantes e deduplicar ruído. Falha temporária não deve virar avalanche de notificações.

## 6. Auditoria

Mudança de credencial, reconnect e disable são auditados. Payload bruto fica fora da auditoria comum.
