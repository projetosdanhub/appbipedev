# Seguranca

## Baseline

Usar OWASP ASVS como checklist tecnico, threat model por modulo e revisao de dependencias. O objetivo de acessibilidade e WCAG 2.2 AA; o objetivo de seguranca inclui defesa contra IDOR, SQL injection, XSS, CSRF, SSRF, upload malicioso, abuso de webhooks, prompt injection e sequestro de conta.

## Segredos e chaves

- nenhum segredo em frontend, Git, fixture, URL, log ou erro;
- env local apenas para desenvolvimento;
- producao deve usar secret manager e rotacao;
- chaves armazenadas no banco usam envelope encryption, chave mestra fora do banco, AES-256-GCM, nonce/tag separados e versao de chave;
- tokens de provedor sao mascarados na interface e nunca retornam em APIs de leitura;
- acesso a segredo exige permissao, motivo e auditoria.

## Autenticacao

Argon2id para senhas; cookies HttpOnly, Secure e SameSite; sessao curta com rotacao; invalidacao apos troca de senha; verificacao de e-mail; rate limit e deteccao de tentativas; MFA/WebAuthn como prioridade apos o MVP.

## API e webhooks

Validar schema, tamanho e content-type; usar idempotency key; timeout; limite de pagina; resposta generica para credenciais invalidas; assinatura e timestamp em webhooks; raw body quando o provedor exigir; nunca confiar no redirect de pagamento como confirmacao.

## Uploads

Quarentena, limite de tamanho, allowlist de MIME/extensao, nome gerado pelo sistema, scan antimalware, storage privado e URL assinada curta. PDF, texto, imagem e video entram em pipelines diferentes.

## Mensageria

Opt-in, opt-out e lista de supressao. Limites por tenant, numero e contato. Nao prometer que o envio em massa evita bloqueio de plataforma. Mensagens fora de politica devem ser bloqueadas ou encaminhadas para revisao.
