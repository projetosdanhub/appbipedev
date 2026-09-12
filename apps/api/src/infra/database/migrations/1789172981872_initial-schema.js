/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Create application user if not exists
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'api_user') THEN
        CREATE USER api_user WITH PASSWORD 'api_pass';
      END IF;
    END
    $$;
  `);

  // Config: allow setting tenant_id context
  pgm.sql(`
    CREATE OR REPLACE FUNCTION get_current_tenant() RETURNS uuid AS $$
    BEGIN
      RETURN current_setting('app.current_tenant_id', true)::uuid;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // 1. Tenants
  pgm.createTable('tenants', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });

  // 2. Users (Global)
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });

  // 3. Memberships (Tenant-owned)
  pgm.createTable('memberships', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    tenant_id: { type: 'uuid', notNull: true, references: 'tenants', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    role: { type: 'varchar(50)', notNull: true, default: 'member' },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });
  
  pgm.addConstraint('memberships', 'memberships_tenant_user_unique', {
    unique: ['tenant_id', 'user_id']
  });

  // 4. Roles (Tenant-owned)
  pgm.createTable('roles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    tenant_id: { type: 'uuid', notNull: true, references: 'tenants', onDelete: 'CASCADE' },
    name: { type: 'varchar(100)', notNull: true },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });

  // 5. Permissions (Global lookup or Tenant-owned? Usually global lookup, but let's do global for simplicity unless dictated. Rules say: roles, permissions, role_permissions. Let's make permissions global dictionary)
  pgm.createTable('permissions', {
    id: { type: 'varchar(100)', primaryKey: true }, // e.g. 'users:read'
    description: { type: 'text' }
  });

  // 6. Role Permissions (Tenant-owned by proxy of role)
  pgm.createTable('role_permissions', {
    role_id: { type: 'uuid', notNull: true, references: 'roles', onDelete: 'CASCADE' },
    permission_id: { type: 'varchar(100)', notNull: true, references: 'permissions', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });
  pgm.addConstraint('role_permissions', 'role_permissions_pkey', {
    primaryKey: ['role_id', 'permission_id']
  });

  // 7. Sessions (Global)
  pgm.createTable('sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(255)', notNull: true, unique: true },
    expires_at: { type: 'timestamp with time zone', notNull: true },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('now()') }
  });

  // Enable RLS on tenant-owned tables
  const tenantTables = ['memberships', 'roles'];
  for (const table of tenantTables) {
    pgm.alterTable(table, { levelSecurity: 'ENABLE' });
    
    // Create policy for all operations
    pgm.createPolicy(table, `tenant_isolation_policy`, {
      command: 'ALL',
      using: `tenant_id = get_current_tenant()`,
      check: `tenant_id = get_current_tenant()`
    });
  }

  // Grant privileges to api_user
  pgm.sql(`
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO api_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO api_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO api_user;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('sessions');
  pgm.dropTable('role_permissions');
  pgm.dropTable('permissions');
  pgm.dropTable('roles');
  pgm.dropTable('memberships');
  pgm.dropTable('users');
  pgm.dropTable('tenants');
  pgm.sql(`DROP FUNCTION IF EXISTS get_current_tenant;`);
};
