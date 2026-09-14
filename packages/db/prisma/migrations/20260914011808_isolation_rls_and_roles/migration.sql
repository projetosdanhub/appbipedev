-- Criação do usuário de runtime restrito (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'api_user') THEN
    CREATE ROLE api_user WITH LOGIN PASSWORD 'api_pass';
  END IF;
END
$$;

-- Permissões mínimas para api_user
GRANT CONNECT ON DATABASE bipesend TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;

-- Permite DML nas tabelas atuais e futuras
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_user;

-- Função auxiliar para o RLS
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- RLS: Habilitar em tabelas de Tenant
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY tenant_isolation_policy ON tenants
  AS PERMISSIVE FOR ALL
  TO api_user
  USING (id = current_tenant_id())
  WITH CHECK (id = current_tenant_id());

CREATE POLICY membership_isolation_policy ON memberships
  AS PERMISSIVE FOR ALL
  TO api_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Política para Descoberta de Membership pelo usuário (sem contexto de tenant logado)
CREATE POLICY membership_discovery_policy ON memberships
  AS PERMISSIVE FOR SELECT
  TO api_user
  USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

CREATE POLICY role_isolation_policy ON roles
  AS PERMISSIVE FOR ALL
  TO api_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY role_permission_isolation_policy ON role_permissions
  AS PERMISSIVE FOR ALL
  TO api_user
  USING (
    EXISTS (
      SELECT 1 FROM roles r WHERE r.id = role_permissions.role_id AND r.tenant_id = current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles r WHERE r.id = role_permissions.role_id AND r.tenant_id = current_tenant_id()
    )
  );

CREATE POLICY invitation_isolation_policy ON invitations
  AS PERMISSIVE FOR ALL
  TO api_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Política para Descoberta/Aceite de Convite (usando token_hash)
CREATE POLICY invitation_discovery_policy ON invitations
  AS PERMISSIVE FOR SELECT
  TO api_user
  USING (token_hash = NULLIF(current_setting('app.current_invitation_token', true), ''));

-- Fim do script de isolamento