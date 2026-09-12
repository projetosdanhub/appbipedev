# BipeSend Rules — 33_ENVIRONMENT_VARIABLES_GUIDELINES

Versão: 1.0.0
Status: oficial

## 1. Variáveis Base para Aplicações
Para garantir consistência e evitar problemas de proxy (como Ngrok mascarando `x-forwarded-host`), todas as aplicações Next.js na arquitetura devem respeitar as variáveis de ambiente canônicas e não depender de cabeçalhos de requisição não confiáveis ao construir URLs absolutas.

Variáveis mandatórias no desenvolvimento (e produção):
- `NEXT_PUBLIC_APP_URL`: URL base absoluta da aplicação (ex: `http://localhost:3000` ou a URL do ngrok).
- `NEXT_PUBLIC_SUPERADMIN_URL`: URL base absoluta do painel Superadmin.
- `NEXT_PUBLIC_MARKETING_URL`: URL base do site institucional/marketing.

## 2. Server Actions e Cabeçalhos
Ao lidar com `Server Actions` que efetuam redirecionamentos ou validam origens, deve-se usar as variáveis de ambiente acima para formar as URLs seguras.
- O uso de `headers().get("host")` ou `x-forwarded-host` pode causar comportamentos inesperados ao usar túneis reversos no desenvolvimento.
- Substitua a construção baseada em Host pela variável estática injetada pelo ambiente (`process.env.NEXT_PUBLIC_APP_URL`).

## 3. Segurança de Segredos
Nenhuma variável de ambiente de banco de dados, API key externa (como SendGrid, Stripe) ou JWT Secret deve ser exposta com `NEXT_PUBLIC_`.
- `DATABASE_URL`: Exclusivo do Server.
- `AUTH_SECRET`: Usado pela camada de criptografia de senhas / sessões e Auth.js.

## 4. UI e Pacotes Padrões (`packages/ui`)
Sempre que novos componentes forem criados, devem respeitar a biblioteca padrão instalada no `packages/ui` e serem importados pelos apps a partir de lá. Não deve haver lógica de UI essencial duplicada nas aplicações isoladamente, preservando a diretriz de não duplicação lógica.
