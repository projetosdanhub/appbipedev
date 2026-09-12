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
