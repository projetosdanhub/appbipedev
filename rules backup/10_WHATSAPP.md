# WhatsApp e mensageria

## Provider adapter

O dominio depende de uma interface `MessagingProvider`; a implementacao inicial pode usar Evolution API em ambiente controlado, por QR code, atras de um servico de adaptacao. A API do provedor nunca e chamada pelo browser.

A camada normaliza contatos, mensagens, anexos, status, QR, reconexao e erros. A troca futura para API oficial exige novo adapter, sem reescrever CRM e automacoes.

## Riscos

Integracao nao oficial pode quebrar, perder sessao, sofrer bloqueio ou violar termos do provedor. O produto nao deve prometer anti-bloqueio. O roadmap deve manter uma rota oficial e uma chave de feature para desativar o provider instavel.

## Conexao

Somente tenant_admin ou permissao `integrations.whatsapp.manage`. QR com expiracao, uso unico quando possivel, status de conexao, reconexao limitada e auditoria. Segredos e identificadores ficam criptografados/mascarados.

## Entrada e saida

Webhook recebe assinatura/secret, valida timestamp, idempotencia e tamanho. Mensagem recebida passa por normalizacao, anti-abuso, persistencia, evento e notificacao. Envio passa por consentimento, supressao, limite, fila, provider, retry e status.

## Massa

A funcionalidade e protegida por opt-in, lista de supressao, janela de envio, limite por numero/contato, pausa automatica em erros e aprovacao para campanhas de risco. Nao implementar tecnicas para burlar deteccao ou politicas de plataforma.
