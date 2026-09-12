import { Database } from "../../00-shared/infrastructure/database.js";

export interface UserVerification {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export class VerificationRepository {
  constructor(private readonly db: Database) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<UserVerification> {
    const rows = await this.db.query<UserVerification>(
      `INSERT INTO user_verifications (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  }

  async findByTokenHash(tokenHash: string): Promise<UserVerification | null> {
    const rows = await this.db.query<UserVerification>(
      `SELECT * FROM user_verifications WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      `DELETE FROM user_verifications WHERE id = $1`,
      [id]
    );
  }
}

export class PasswordResetRepository {
  constructor(private readonly db: Database) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<UserVerification> {
    const rows = await this.db.query<UserVerification>(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  }

  async findByTokenHash(tokenHash: string): Promise<UserVerification | null> {
    const rows = await this.db.query<UserVerification>(
      `SELECT * FROM password_resets WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      `DELETE FROM password_resets WHERE id = $1`,
      [id]
    );
  }
}
