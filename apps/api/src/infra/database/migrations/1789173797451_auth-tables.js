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
  pgm.createTable("user_verifications", {
    id: { type: "uuid", default: pgm.func("gen_random_uuid()"), primaryKey: true },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    token_hash: { type: "varchar(255)", notNull: true, unique: true },
    expires_at: { type: "timestamp with time zone", notNull: true },
    created_at: { type: "timestamp with time zone", notNull: true, default: pgm.func("now()") }
  });

  pgm.createTable("password_resets", {
    id: { type: "uuid", default: pgm.func("gen_random_uuid()"), primaryKey: true },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    token_hash: { type: "varchar(255)", notNull: true, unique: true },
    expires_at: { type: "timestamp with time zone", notNull: true },
    created_at: { type: "timestamp with time zone", notNull: true, default: pgm.func("now()") }
  });

  pgm.createTable("invitations", {
    id: { type: "uuid", default: pgm.func("gen_random_uuid()"), primaryKey: true },
    tenant_id: { type: "uuid", notNull: true, references: '"tenants"', onDelete: "CASCADE" },
    email: { type: "varchar(255)", notNull: true },
    role: { type: "varchar(50)", notNull: true },
    token_hash: { type: "varchar(255)", notNull: true, unique: true },
    expires_at: { type: "timestamp with time zone", notNull: true },
    created_at: { type: "timestamp with time zone", notNull: true, default: pgm.func("now()") }
  });

  pgm.addConstraint('invitations', 'invitations_tenant_email_unique', {
    unique: ['tenant_id', 'email']
  });

  // RLS para invitations
  pgm.alterTable('invitations', { levelSecurity: 'ENABLE' });
  pgm.createPolicy('invitations', 'tenant_isolation_policy', {
    command: 'ALL',
    role: 'PUBLIC',
    using: 'tenant_id = get_current_tenant()',
    check: 'tenant_id = get_current_tenant()'
  });
  
  // Grant permissions to api_user
  pgm.sql(`
    GRANT ALL PRIVILEGES ON TABLE user_verifications TO api_user;
    GRANT ALL PRIVILEGES ON TABLE password_resets TO api_user;
    GRANT ALL PRIVILEGES ON TABLE invitations TO api_user;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("invitations");
  pgm.dropTable("password_resets");
  pgm.dropTable("user_verifications");
};
