# @bipesend/config

Configuração validada e defaults explícitos, sem conexão com serviços. O módulo valida quando a função é chamada; importar o pacote não lê segredos do processo.

## API

`parseApiEnv(process.env)` valida NODE_ENV, APP_NAME, API_HOST/PORT, DATABASE_URL, REDIS_URL, AUTH_SESSION_SECRET e INTERNAL_API_KEY. Campos críticos não têm defaults secretos. Falha informa somente nomes de campos, sem DSN ou valor recebido. `apiEnvSchema` e tipo ApiEnv permitem inspeção/testes.

`parsePublicOrigin(value, production)` aceita origem HTTP(S) sem credenciais, path, query ou hash; produção exige HTTPS. Não transforma header Host/x-forwarded-host recebido em URL confiável. Uma origem validada ainda precisa estar na allowlist do ambiente.

`performanceBudgets`: LCP ≤2500 ms, INP ≤200 ms, CLS ≤0,1 e queryLimit=100. São alvos, não resultados medidos. Configuração de cache/CDN/proxy, CSP e coleta de métricas fica nos apps/infra.

## Ambiente e fronteiras

`.env.example` documenta nomes. Next recebe AUTH_SECRET e SUPERADMIN_AUTH_SECRET distintos, ambos server-only, validados por auth. DATABASE_URL e REDIS_URL são secretos mesmo que locais. SMTP aceita MAIL_FROM como nome canônico e SMTP_FROM como compatibilidade. `NEXT_PUBLIC_*` só para origens e dados publicáveis; nunca prefixar credencial para corrigir erro de build.

`tsconfig.base.json` fornece NodeNext, strict, noUncheckedIndexedAccess e declarações para novos pacotes de servidor. Next mantém sua configuração de bundler própria; não forçar NodeNext sobre app que depende do compilador Next.

## Verificação

`pnpm --filter @bipesend/config build` e `test`. Casos negativos cobrem segredo ausente/placeholder, protocolo e porta inválidos. O pacote não fornece secret manager, rotação automática ou conectividade; eles exigem configuração operacional separada.
