# Mapa operacional de autenticacao BipeSend

Este mapa orienta o agente antes de criar telas, rotas ou migrations.

| Codigo | Superficie | Usuario | Pode fazer | Nao pode fazer |
| --- | --- | --- | --- | --- |
| SURFACE-TENANT | app.bipesend.com.br | administrador e equipe do tenant | entrar conforme membership, cargos, setores e plano | acessar outro tenant ou o superpainel |
| SURFACE-PLATFORM | admin.bipesend.com.br | owner da BipeSend e suporte autorizado | operar plataforma, planos, auditoria e suporte com escopo | agir como tenant sem suporte temporario auditado |
| SURFACE-API | api.bipesend.com.br | cliente de API ou sessao autorizada | consumir recursos permitidos e escopados | usar flag de tenant enviada pelo cliente para elevar contexto |
| SURFACE-HOOKS | hooks.bipesend.com.br | provider externo | entregar eventos assinados | fazer login, usar cookie ou reenviar sem idempotencia |
| SURFACE-INTERNAL | rede privada | worker/AI service | executar contrato interno minimo | consultar banco inteiro ou chamar ferramenta arbitraria |

## Fluxo de login do tenant

1. usuario acessa app por HTTPS;
2. API valida origem, credenciais e rate limit;
3. senha e comparada com Argon2id; nenhum token de provider participa;
4. sessao server-side e criada e cookie seguro e emitido;
5. membership ativa e tenant context sao carregados pelo servidor;
6. painel recebe somente permissoes e marca publicas;
7. logout revoga sessao e notifica as outras sessoes conforme politica.

## Fluxo de login do superadmin

1. owner e criado previamente pela CLI no VPS;
2. usuario acessa somente admin;
3. login exige credencial, MFA/WebAuthn e controles de tentativa;
4. sessao usa cookie/audience diferentes do tenant;
5. acoes globais e suporte geram auditoria com motivo;
6. acesso a dados de tenant exige escopo e prazo, nunca uma flag no frontend.

## Fluxo de API e webhook

API de negocio exige sessao ou API key escopada. Webhook nao possui tela de
login: valida assinatura, timestamp, replay protection, deduplicacao e enfileira
o evento. Configurar a integracao e uma acao administrativa no painel; receber
o callback e uma operacao de maquina.

## Entrega esperada do agente

Antes de implementar uma tarefa de autenticacao, o agente deve informar:

- superficie e audience afetadas;
- entidade, migration, RLS, policy e permissoes;
- cookie/token e ciclo de revogacao;
- eventos e auditoria;
- testes positivos, negativos e cross-tenant;
- arquivos criados/alterados e motivo de cada arquivo.
