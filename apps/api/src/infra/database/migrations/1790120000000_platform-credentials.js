/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('platform_credentials', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    provider: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
      comment: 'evolution_api | meta | tiktok | gemini | openai',
    },
    credentials: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
      comment: 'Each value is AES-256-GCM encrypted: { iv, tag, ciphertext }',
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'inactive',
      comment: 'active | inactive | invalid',
    },
    last_validated_at: {
      type: 'timestamptz',
    },
    updated_by: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('platform_credentials', 'provider');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('platform_credentials');
};
