import { prisma } from "@bipesend/db";
import { emailSchema, otpSchema } from "@bipesend/contracts";
import { generateOtp, hashSecret } from "@bipesend/security";
import { authSecret, checkAuthRateLimit } from "./rate-limit";

const digest = (value: string, purpose: string) =>
  hashSecret(value, authSecret(), purpose);

/**
 * Solicita a verificação de e-mail.
 * Exclui tokens de verificação anteriores do usuário, gera um novo OTP numérico,
 * salva o hash e envia por e-mail através da função `send`.
 */
export async function requestEmailVerification(
  rawEmail: string,
  send: (email: string, code: string) => Promise<void>,
): Promise<void> {
  const email = emailSchema.parse(rawEmail);
  
  // Rate limits
  await checkAuthRateLimit("verification-send", email, 1, 45_000);
  await checkAuthRateLimit("verification-hour", email, 5, 3_600_000);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user || user.emailVerified) return;

  const code = generateOtp();
  const purpose = `verify:${user.id}`;
  const tokenHash = digest(code, purpose);

  await prisma.$transaction(async (tx) => {
    // Delete any existing unexpired verification tokens for this user
    await tx.userVerification.deleteMany({
      where: { userId: user.id },
    });

    await tx.userVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 600_000), // 10 minutes
      },
    });
  });

  await send(email, code);
}

/**
 * Verifica o código recebido por e-mail.
 * Valida o código, atualiza o status de `emailVerified` do usuário e remove o token.
 */
export async function verifyEmail(
  rawEmail: string,
  rawCode: string,
): Promise<void> {
  const email = emailSchema.parse(rawEmail),
    code = otpSchema.parse(rawCode);

  await checkAuthRateLimit("verification-verify", email, 5, 600_000);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user || user.emailVerified) {
    throw new Error("AUTH_CODE_INVALID");
  }

  const purpose = `verify:${user.id}`;
  const tokenHash = digest(code, purpose);

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.userVerification.deleteMany({
      where: {
        userId: user.id,
        tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (consumed.count !== 1) {
      throw new Error("AUTH_CODE_INVALID");
    }

    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  });
}
