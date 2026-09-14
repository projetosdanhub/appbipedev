-- Read-only inventory. Does not read customer rows, credentials or migration log contents.
BEGIN READ ONLY;
SELECT current_database() AS database_name, current_user AS runtime_role, version();
SELECT rolname, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb
FROM pg_roles WHERE rolname IN (current_user, 'api_user');
SELECT to_regclass('public.pgmigrations') AS node_pg_history,
       to_regclass('public._prisma_migrations') AS prisma_history;
SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN
('users','accounts','sessions','verification_tokens','tenants','memberships','roles','role_permissions','invitations','user_verifications','password_resets')
ORDER BY table_name, ordinal_position;
SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname;
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;
SELECT conrelid::regclass AS table_name, conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conrelid::regclass::text, conname;
SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN (current_user, 'api_user','PUBLIC') ORDER BY table_name,grantee;
ROLLBACK;
