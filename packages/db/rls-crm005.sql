-- Habilitar RLS em tabelas CRM-005 (Inbox)
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" FORCE ROW LEVEL SECURITY;

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" FORCE ROW LEVEL SECURITY;

ALTER TABLE "conversation_read_states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_read_states" FORCE ROW LEVEL SECURITY;

ALTER TABLE "conversation_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_status_history" FORCE ROW LEVEL SECURITY;

-- Políticas de RLS
DO $$
BEGIN
  -- Drop existing policies if they exist to allow re-running this script
  DROP POLICY IF EXISTS "conversations_isolation_policy" ON "conversations";
  DROP POLICY IF EXISTS "messages_isolation_policy" ON "messages";
  DROP POLICY IF EXISTS "conversation_read_states_isolation_policy" ON "conversation_read_states";
  DROP POLICY IF EXISTS "conversation_status_history_isolation_policy" ON "conversation_status_history";
END
$$;

CREATE POLICY "conversations_isolation_policy" ON "conversations"
  AS PERMISSIVE FOR ALL
  TO api_user
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY "messages_isolation_policy" ON "messages"
  AS PERMISSIVE FOR ALL
  TO api_user
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY "conversation_read_states_isolation_policy" ON "conversation_read_states"
  AS PERMISSIVE FOR ALL
  TO api_user
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY "conversation_status_history_isolation_policy" ON "conversation_status_history"
  AS PERMISSIVE FOR ALL
  TO api_user
  USING ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK ("tenant_id" = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
