import { generateTotpSecret, generateTotpUri, verifyTotp } from "./totp";
import { randomBytes } from "node:crypto";
import { prisma } from "@bipesend/db";

/**
 * Initiates MFA setup by generating a secret and provisioning URI.
 */
export async function setupMfa(userId: string, email: string) {
  const secret = generateTotpSecret();
  const uri = generateTotpUri({ issuer: "Bipesend", label: email, secret });
  return { secret, uri };
}

/**
 * Generates an array of random backup codes.
 */
function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 10-character alphanumeric codes
    codes.push(randomBytes(5).toString("hex").toUpperCase());
  }
  return codes;
}

/**
 * Verifies the first MFA code during setup and activates MFA if successful.
 * Generates and returns backup codes.
 */
export async function verifyMfaSetup(userId: string, secret: string, code: string) {
  const isValid = verifyTotp({ token: code, secret });
  if (!isValid) {
    throw new Error("INVALID_2FA_CODE");
  }

  const backupCodes = generateBackupCodes();

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
    },
  });

  return backupCodes;
}

/**
 * Disables MFA for a user.
 */
export async function disableMfa(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });
}
