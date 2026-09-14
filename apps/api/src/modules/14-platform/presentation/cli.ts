import { timingSafeEqual } from "node:crypto";
import * as argon2 from "argon2";
import { emailSchema, passwordSchema } from "@bipesend/contracts";
import { env } from "../../../config/env.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";

/** Privileged preparation only: enrollment/audit/one-shot secret lifecycle remain AUTH-013. */
async function bootstrap() {
  const args = process.argv.slice(2),
    emailIndex = args.indexOf("--email");
  if (
    !args.includes("--confirm-production") ||
    !args.includes("--password-stdin") ||
    emailIndex < 0 ||
    process.stdin.isTTY
  )
    throw new Error("BOOTSTRAP_INPUT_REQUIRED");
  const email = emailSchema.parse(args[emailIndex + 1]);
  // JSON piped by a secret manager: never echo, accept password on argv, or trim password.
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk.toString();
    if (Buffer.byteLength(input) > 4096)
      throw new Error("BOOTSTRAP_INPUT_INVALID");
  }
  const payload = JSON.parse(input) as { password?: unknown; nonce?: unknown };
  const password = passwordSchema.parse(payload.password);
  const expected = process.env.PLATFORM_BOOTSTRAP_NONCE;
  if (!expected || expected.length < 32 || typeof payload.nonce !== "string")
    throw new Error("BOOTSTRAP_CLOSED");
  const left = Buffer.from(expected),
    right = Buffer.from(payload.nonce);
  if (left.length !== right.length || !timingSafeEqual(left, right))
    throw new Error("BOOTSTRAP_CLOSED");
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const db = new Database(env.DATABASE_URL);
  try {
    await db.withTransaction(async (tx) => {
      const lock = await tx.query<{ locked: boolean }>(
        "SELECT pg_try_advisory_xact_lock(12345) AS locked",
      );
      if (!lock[0]?.locked) throw new Error("BOOTSTRAP_BUSY");
      const users = new UserRepository(tx);
      if (await users.hasSuperadmin())
        throw new Error("BOOTSTRAP_ALREADY_USED");
      await users.createSuperadmin(email, passwordHash, "Platform Owner");
    });
    console.log(
      "Platform owner prepared. Privileged MFA enrollment is required before login. Disable the bootstrap nonce in the secret manager.",
    );
  } finally {
    await db.close();
  }
}
bootstrap().catch(() => {
  console.error(
    "Bootstrap failed. Check the controlled procedure; no credential was logged.",
  );
  process.exitCode = 1;
});
