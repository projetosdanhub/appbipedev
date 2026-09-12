import { Database } from "../../00-shared/infrastructure/database.js";
import { User } from "../domain/user.entity.js";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async create(email: string, passwordHash: string, name: string): Promise<User> {
    const rows = await this.db.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, password_hash as "passwordHash", name, created_at as "createdAt", updated_at as "updatedAt"`,
      [email, passwordHash, name]
    );
    return rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.query(
      `SELECT id, email, password_hash as "passwordHash", name, created_at as "createdAt", updated_at as "updatedAt" 
       FROM users WHERE id = $1`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.query(
      `SELECT id, email, password_hash as "passwordHash", name, created_at as "createdAt", updated_at as "updatedAt" 
       FROM users WHERE email = $1`,
      [email]
    );
    return rows.length ? rows[0] : null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, id]
    );
  }
}
