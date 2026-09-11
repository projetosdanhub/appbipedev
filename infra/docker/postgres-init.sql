CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- O usuario da aplicacao nao deve ser o dono das tabelas em ambientes reais.
-- RLS e migracoes de seguranca serao aplicadas pela camada de banco.
