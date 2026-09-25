/**
 * CryptoVault — Cofre de criptografia AES-256-GCM para credenciais da plataforma.
 *
 * A única variável de ambiente necessária é CREDENTIALS_ENCRYPTION_KEY (base64, 32 bytes).
 * Todos os valores sensíveis são cifrados antes de irem para o PostgreSQL e
 * decifrados somente no backend quando necessários.
 */

import crypto from "node:crypto";

export interface EncryptedPayload {
  iv: string;       // hex, 12 bytes
  tag: string;      // hex, 16 bytes (GCM auth tag)
  ciphertext: string; // hex
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "[CryptoVault] CREDENTIALS_ENCRYPTION_KEY não configurada. " +
      "Gere com: openssl rand -base64 32"
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `[CryptoVault] CREDENTIALS_ENCRYPTION_KEY deve ter 32 bytes (atual: ${key.length}).`
    );
  }
  return key;
}

/** Cifra um valor string com AES-256-GCM. */
export function encrypt(plaintext: string): EncryptedPayload {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

/** Decifra um payload AES-256-GCM. */
export function decrypt(payload: EncryptedPayload): string {
  const key = getMasterKey();
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");
  const ciphertext = Buffer.from(payload.ciphertext, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/** Cifra todos os campos de um objeto key-value. */
export function encryptCredentials(
  creds: Record<string, string>,
): Record<string, EncryptedPayload> {
  const result: Record<string, EncryptedPayload> = {};
  for (const [field, value] of Object.entries(creds)) {
    if (value && value.trim()) {
      result[field] = encrypt(value.trim());
    }
  }
  return result;
}

/** Decifra todos os campos de um objeto cifrado. */
export function decryptCredentials(
  creds: Record<string, EncryptedPayload>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, payload] of Object.entries(creds)) {
    if (payload?.iv && payload?.tag && payload?.ciphertext) {
      result[field] = decrypt(payload);
    }
  }
  return result;
}
