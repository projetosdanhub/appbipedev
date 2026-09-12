import { Database } from "../../00-shared/infrastructure/database.js";

export interface Invitation {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export class InvitationRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, email: string, role: string, tokenHash: string, expiresAt: Date): Promise<Invitation> {
    const rows = await this.db.query<Invitation>(
      `INSERT INTO invitations (tenant_id, email, role, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id, email) DO UPDATE
       SET role = EXCLUDED.role, token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at
       RETURNING *`,
      [tenantId, email, role, tokenHash, expiresAt]
    );
    return rows[0];
  }

  async findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    const rows = await this.db.query<Invitation>(
      `SELECT * FROM invitations WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      `DELETE FROM invitations WHERE id = $1`,
      [id]
    );
  }

  async findAllByTenant(tenantId: string): Promise<Invitation[]> {
    const rows = await this.db.query<Invitation>(
      `SELECT * FROM invitations WHERE tenant_id = $1`,
      [tenantId]
    );
    return rows;
  }
}
