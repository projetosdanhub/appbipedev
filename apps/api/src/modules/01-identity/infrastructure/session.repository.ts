import { Database } from "../../00-shared/infrastructure/database.js";

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export class SessionRepository {
  constructor(private readonly db: Database) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<Session> {
    const rows = await this.db.query<Session>(
      `INSERT INTO sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const rows = await this.db.query<Session>(
      `SELECT * FROM sessions WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM sessions WHERE user_id = $1`,
      [userId]
    );
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.db.query(
      `DELETE FROM sessions WHERE token_hash = $1`,
      [tokenHash]
    );
  }
}
