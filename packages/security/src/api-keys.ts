import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

/**
 * Generates a new API Key and its SHA-256 hash for secure storage.
 * The key includes a prefix to identify its environment and purpose.
 */
export function generateApiKey(prefix = "bip_live"): { key: string; hash: string } {
  // Generate 32 random bytes of entropy, base64url encoded
  const entropy = randomBytes(32).toString("base64url");
  const key = `${prefix}_${entropy}`;
  const hash = hashApiKey(key);
  return { key, hash };
}

/**
 * Hashes an API key using SHA-256.
 * The hash is stored in the database instead of the plaintext key.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Verifies if an API key matches its stored hash in a timing-safe manner.
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const computedHash = hashApiKey(key);
  // Ensure both buffers have the same length to avoid timing leaks on length checks
  if (computedHash.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}
