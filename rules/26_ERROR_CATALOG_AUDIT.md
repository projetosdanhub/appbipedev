# Catálogo de erros e auditoria

## 1. Código de erro

Formato estável, por exemplo:
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_CODE_INVALID`
- `AUTH_CODE_EXPIRED`
- `AUTH_RATE_LIMITED`
- `TENANT_ACCESS_DENIED`
- `VALIDATION_FAILED`
- `INTEGRATION_UNAVAILABLE`

Mensagem pública pode evoluir; código é contrato.

## 2. Segurança

Erro público não inclui stack, SQL, segredo, token, prompt, provider payload ou PII desnecessária.

## 3. requestId

Toda falha técnica relevante deve expor `requestId`/correlation ID seguro para suporte.

## 4. Auditoria

Evento inclui:
- actor;
- tenant;
- ação;
- alvo;
- resultado;
- timestamp;
- request/correlation ID;
- metadados mínimos.

Não gravar senha, OTP, cookie, token ou segredo.

## 5. UX

Erro de campo fica junto do campo. Erro de bloco não derruba página. Erro de página oferece retry/suporte quando aplicável.

## 6. Reporte

`Reportar erro` envia identificadores técnicos permitidos e contexto controlado. Usuário deve saber que protocolo foi criado. Não capturar formulário sensível inteiro.
