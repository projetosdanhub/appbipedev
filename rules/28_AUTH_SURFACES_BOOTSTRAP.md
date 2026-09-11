# Superficies de autenticacao e bootstrap do administrador da plataforma

## Objetivo

Separar identidade humana, acesso de tenant, acesso do superadmin e acesso
maquina-a-maquina. Cada superficie tem um contrato proprio; nao criar um
login universal que misture tenant, superadmin, API e webhook.

## Matriz de acesso

| Superficie | Dominio | Acesso humano | Protecao obrigatoria |
| --- | --- | --- | --- |
| Landing | www.bipesend.com.br | nao autenticado | HTTPS, SEO, rate limit e nenhuma sessao administrativa |
| Painel do tenant | app.bipesend.com.br | tenant_admin, manager, agent, viewer | login proprio, e-mail verificado, sessao server-side, RBAC/ABAC, CSRF e MFA progressivo |
| Superpainel | admin.bipesend.com.br | platform_owner e suporte autorizado | login separado, MFA/WebAuthn, cookies separados, allowlist, auditoria e acesso temporario |
| API | api.bipesend.com.br | nao possui pagina de login | sessao/API key escopada nos endpoints de negocio; permissao, tenant context, rate limit e idempotencia |
| Webhooks | hooks.bipesend.com.br | nao possui pagina de login | assinatura HMAC/provider, timestamp, replay protection, idempotencia e fila |
| Servicos internos | rede privada | nao autenticado por browser | mTLS ou JWT assinado com rotacao, audience, scopes, timeout e allowlist |

Health liveness pode ser minimalista. Readiness e diagnostico detalhado ficam
restritos ao ambiente/proxy confiavel e nunca devem retornar URL de banco,
stack trace, segredo ou mensagem bruta de provider.

## Regras de login

- tenant e superadmin usam rotas, cookies, audiences e contextos separados;
- nao existe link de superadmin no login do tenant;
- registro publico cria somente conta/tenant conforme o fluxo comercial; nunca
  cria platform_owner;
- verificacao de e-mail, recuperacao de senha, logout server-side, revogacao de
  sessoes e rate limit sao obrigatorios;
- senha e armazenada como hash Argon2id com salt aleatorio, nunca como texto ou
  cifra reversivel. Criptografia de envelope fica reservada a segredos de
  provider que precisam ser recuperados;
- cookies sao HttpOnly, Secure, SameSite e com dominio minimo. CSRF usa token
  ou Origin check quando a sessao usa cookie;
- MFA/WebAuthn e obrigatorio para platform_owner e recomendado ou condicionado
  ao plano/politica para administradores de tenant;
- erros de login sao genericos e auditam tentativa sem registrar senha, token,
  cookie ou payload bruto.

## Bootstrap do platform_owner

O primeiro administrador da plataforma e criado por uma CLI executada no VPS,
com acesso SSH/OS autorizado, e nao por endpoint HTTP, seed publico, formulario
de registro ou valor fixo no codigo.

Contrato de comando a ser implementado em AUTH-013:

    pnpm --filter @bipesend/api admin:bootstrap --email owner@dominio-controlado.tld --password-stdin --confirm-production

Regras do comando:

- senha entra por stdin interativo/pipe seguro; nunca por argumento, URL,
  .env, historico do shell ou log;
- execucao permitida somente no ambiente de controle do VPS, com identidade do
  usuario de servico e autorizacao de bootstrap em secret manager;
- dominio/e-mail ajudam na validacao, mas nao sao a barreira de seguranca. A
  barreira e acesso ao VPS, secret manager, janela de bootstrap e transacao;
- adquirir advisory lock e verificar atomicamente que nao existe owner ativo;
- gravar hash Argon2id, e-mail normalizado, estado pendente de MFA, auditoria e
  versao do bootstrap na mesma transacao;
- consumir nonce/janela de bootstrap uma unica vez e fechar o modo apos sucesso;
- se ja existir owner, falhar fechado. Recuperacao e procedimento break-glass
  separado, com aprovacao dupla e auditoria;
- CLI nao expoe senha, hash, token, conexao ou stack trace no terminal;
- nenhuma credencial inicial entra em migration, seed, Docker Compose ou Git.

## API keys e integracoes

Chaves emitidas pelo BipeSend para API sao exibidas uma unica vez, armazenadas
como hash para validacao, tem escopo, tenant, expiracao/rotacao e revogacao.
Tokens de providers que precisam ser usados novamente usam envelope encryption
com chave mestra fora do banco. Nenhum segredo retorna para o frontend.

## Criterios de aceite

- login tenant e superadmin nao compartilham cookie nem rota;
- platform_owner nao pode ser criado por registro, API publica ou seed;
- bootstrap sem TTY/nonce/janela/confirmacao falha fechado;
- segunda execucao nao cria owner duplicado;
- senha nunca aparece em logs, argumentos, banco ou resposta;
- readiness e webhooks nao expoem diagnosticos sensiveis;
- testes cobrem brute force, CSRF, sessao revogada, cross-tenant, assinatura
  invalida, replay, idempotencia e tentativa de escalada.
