/**
 * CredentialsRepository — CRUD para platform_credentials com criptografia AES-256-GCM.
 *
 * Responsabilidades:
 * - Salvar credenciais cifradas (UPSERT)
 * - Ler credenciais decifradas (apenas no backend)
 * - Consultar status sem expor secrets
 */

import type { Database } from "../../00-shared/infrastructure/database.js";
import {
  encryptCredentials,
  decryptCredentials,
  type EncryptedPayload,
} from "../../00-shared/infrastructure/crypto-vault.js";

export interface CredentialStatus {
  provider: string;
  status: string;
  lastValidatedAt: string | null;
  updatedAt: string;
}

export interface DecryptedCredentials {
  [key: string]: string;
}

interface CredentialRow {
  id: string;
  provider: string;
  credentials: Record<string, EncryptedPayload>;
  status: string;
  lastValidatedAt: string | null;
  updatedAt: string;
}

export class CredentialsRepository {
  constructor(private readonly db: Database) {}

  /** Retorna credenciais decifradas para uso interno no backend. NUNCA expor ao frontend. */
  async getByProvider(provider: string): Promise<DecryptedCredentials | null> {
    const rows = await this.db.query<CredentialRow>(
      `SELECT credentials, status FROM platform_credentials WHERE provider = $1 LIMIT 1`,
      [provider],
    );
    if (!rows.length || rows[0].status === "inactive") return null;

    try {
      return decryptCredentials(rows[0].credentials);
    } catch {
      // Chave mestra errada ou dados corrompidos
      return null;
    }
  }

  /** Retorna APENAS o status (sem secrets) — seguro para enviar ao frontend. */
  async getStatus(provider: string): Promise<CredentialStatus | null> {
    const rows = await this.db.query<CredentialStatus>(
      `SELECT provider, status, 
              last_validated_at AS "lastValidatedAt",
              updated_at AS "updatedAt"
       FROM platform_credentials 
       WHERE provider = $1 LIMIT 1`,
      [provider],
    );
    return rows[0] ?? null;
  }

  /** Retorna status de TODOS os providers. */
  async getAllStatuses(): Promise<CredentialStatus[]> {
    return this.db.query<CredentialStatus>(
      `SELECT provider, status,
              last_validated_at AS "lastValidatedAt",
              updated_at AS "updatedAt"
       FROM platform_credentials
       ORDER BY provider`,
    );
  }

  /** UPSERT — cifra e salva as credenciais. */
  async upsert(
    provider: string,
    credentials: Record<string, string>,
    userId: string,
  ): Promise<void> {
    const encrypted = encryptCredentials(credentials);

    await this.db.query(
      `INSERT INTO platform_credentials (provider, credentials, status, updated_by, updated_at)
       VALUES ($1, $2, 'inactive', $3, NOW())
       ON CONFLICT (provider)
       DO UPDATE SET 
         credentials = $2,
         status = 'inactive',
         updated_by = $3,
         updated_at = NOW()`,
      [provider, JSON.stringify(encrypted), userId],
    );
  }

  /** Marca status como active/inactive/invalid e registra data de validação. */
  async setStatus(
    provider: string,
    status: "active" | "inactive" | "invalid",
  ): Promise<void> {
    const validatedClause =
      status === "active" ? ", last_validated_at = NOW()" : "";

    await this.db.query(
      `UPDATE platform_credentials 
       SET status = $1${validatedClause}, updated_at = NOW()
       WHERE provider = $2`,
      [status, provider],
    );
  }

  /** Remove credenciais de um provider. */
  async delete(provider: string): Promise<void> {
    await this.db.query(
      `DELETE FROM platform_credentials WHERE provider = $1`,
      [provider],
    );
  }
}
