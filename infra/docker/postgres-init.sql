CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create test database for E2E and integration tests
CREATE DATABASE bipesend_test;

-- O usuario da aplicacao nao deve ser o dono das tabelas em ambientes reais.
-- RLS e migracoes de seguranca serao aplicadas pela camada de banco.
