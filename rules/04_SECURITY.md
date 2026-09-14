# Segurança

## 1. Baseline

Adotar OWASP ASVS como checklist técnico, threat model por módulo e revisão de dependências. Proteger contra IDOR/BOLA, injection, XSS, CSRF, SSRF, path traversal, upload malicioso, abuso de webhook, brute force, credential stuffing, replay, sequestro de conta, prompt injection e vazamento cross-tenant.

## 2. Senhas

- armazenar somente hash Argon2id com salt aleatório;
- política favorece comprimento e bloqueia senhas comprometidas quando possível;
- nunca logar senha, hash ou confirmação;
- troca de senha revoga sessões de acordo com política;
- mostrar/ocultar senha é controle local e acessível;
- confirmação de senha é comparação no cliente para UX e validação no servidor para contrato.

## 3. Sessão

- cookies `HttpOnly`, `Secure`, `SameSite` apropriado e domínio mínimo;
- sessão server-side ou token revogável conforme arquitetura aprovada;
- rotação após login e elevação de privilégio;
- idle timeout e absolute timeout;
- CSRF para operações autenticadas por cookie;
- proteção contra fixation;
- logout invalida servidor e cookie;
- alterações sensíveis podem exigir reautenticação.

## 4. Login e recuperação

- mensagem de credencial inválida deve ser genérica;
- recuperação de senha nunca revela existência do e-mail;
- envio de código/link tem rate limit por IP, identidade e device signal quando disponível;
- código de verificação é aleatório, uso único, expira em curto prazo e é armazenado de forma segura;
- limitar tentativas por desafio; após exceder, invalidar desafio e exigir novo;
- reenvio cria política clara: substituir/invalidar código anterior conforme implementação;
- após redefinição, invalidar tokens de recuperação e sessões conforme política;
- registrar auditoria sem guardar código, senha ou payload sensível.

## 5. MFA

MFA/WebAuthn é obrigatório para `platform_owner`. Para tenant admins, suportar ativação progressiva e política por organização/plano sem enfraquecer login básico.

## 6. Browser security

- CSP progressiva sem `unsafe-eval`;
- `frame-ancestors`/proteção contra clickjacking;
- `nosniff`, referrer policy e headers adequados;
- sanitização/escaping de conteúdo rico;
- URLs externas validadas;
- nunca inserir HTML arbitrário de tenant sem sanitização;
- source maps públicos somente com decisão explícita e sem segredo.

## 7. Segredos

- segredo nunca em frontend, Git, URL, log ou mensagem de erro;
- produção usa secret manager/infra equivalente;
- tokens recuperáveis de provider usam envelope encryption AES-256-GCM ou mecanismo aprovado;
- chaves emitidas pelo BipeSend preferem armazenamento por hash quando só precisam ser validadas;
- rotação e revogação fazem parte do contrato.

## 8. API

- validar schema, tamanho, content-type, enum e limites;
- autorização por ação e recurso;
- rate limit por risco;
- paginação limitada;
- idempotency key em operações apropriadas;
- respostas de erro seguras com `requestId`;
- não retornar stack, SQL, segredo ou payload bruto de provider.

## 9. Webhooks

Validar assinatura, timestamp, janela de replay e idempotência sobre raw body quando provider exigir. Responder rápido e enfileirar processamento pesado.

## 10. Uploads

Quarentena, limite de tamanho, allowlist de tipo, nome gerado pelo sistema, scan quando aplicável, storage privado, autorização por tenant e URL assinada curta.

## 11. Segurança de UX

- não usar mensagem que confirme conta existente em recuperação;
- não esconder ação destrutiva apenas por CSS;
- ações críticas têm contexto e confirmação proporcional;
- clipboard não deve copiar segredo automaticamente sem intenção do usuário;
- campos sensíveis não devem usar autocomplete inadequado;
- UI não exibe token completo depois do momento de criação quando o contrato for "show once".

## 12. Auditoria

Auditar login relevante, falhas suspeitas, mudança de senha, MFA, alteração de permissão, exportação, integração, API key, billing e suporte. Auditoria é append-only lógico e protegida contra edição comum.

## Revisão de fundação — 2026-09-13

Usar @bipesend/security para CSPRNG, HMAC, comparação constante, AEAD e redaction allowlist. Assinatura de webhook exige bytes originais e janela; deduplicação persistida continua obrigatória. Rate limit de identidade é server-side e falha fechado; limite IP global no edge/API continua necessário.
