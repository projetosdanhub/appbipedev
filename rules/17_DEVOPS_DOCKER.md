# DevOps e Docker

## 1. Ambientes

Local, staging e produção devem ter configurações separadas. Nunca reutilizar segredo de produção em desenvolvimento.

## 2. Containers

- imagens mínimas;
- processo não-root quando possível;
- filesystem somente leitura quando viável;
- healthcheck;
- recursos limitados;
- dependências fixadas;
- scan de imagem/dependências.

## 3. Rede

Banco, Redis, storage e serviços internos não são expostos publicamente. Proxy publica apenas superfícies aprovadas.

## 4. Deploy

Build imutável, migração controlada, health/readiness, rollback e observabilidade. Assets com hash.

## 5. Logs

Estruturados, com request/correlation ID e sem segredo. PII minimizada.

## 6. Backups

Backup e restore precisam ser testados. Criptografia, retenção e controle de acesso seguem governança.

## Revisão de fundação — 2026-09-13

CI da fundação deve instalar lockfile, gerar Prisma, buildar packages, rodar checks reais e build dos apps. Proteção de branch exige configuração no GitHub; arquivo de workflow sozinho não prova proteção ativa. Nenhuma migration/seed/bootstrap roda automaticamente neste gate.
