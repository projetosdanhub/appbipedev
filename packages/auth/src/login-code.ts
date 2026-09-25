import { prisma } from "@bipesend/db";
import { emailSchema } from "@bipesend/contracts";
import { generateOtp, hashSecret } from "@bipesend/security";
import { authSecret, checkAuthRateLimit } from "./rate-limit";

const loginCodeId = (email: string) => `login-code:${email}`;
const digest = (value: string, purpose: string) =>
  hashSecret(value, authSecret(), purpose);

/**
 * Solicita código de acesso temporário (OTP) para login sem senha.
 * Verifica se a conta existe para a respectiva superfície antes de gerar e disparar o e-mail.
 */
export async function requestLoginCode(
  rawEmail: string,
  send: (email: string, code: string) => Promise<void | boolean>,
  surface: "tenant" | "platform" = "tenant"
): Promise<{ success: boolean; message?: string }> {
  const email = emailSchema.parse(rawEmail.trim().toLowerCase());

  // Rate limits
  try {
    await checkAuthRateLimit(`login-code-send:${surface}`, email, 1, 45_000);
    await checkAuthRateLimit(`login-code-hour:${surface}`, email, 5, 3_600_000);
  } catch (err: any) {
    if (err?.message !== "AUTH_UNAVAILABLE" || process.env.NODE_ENV === "production") {
      throw err;
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isSuperadmin: true, status: true },
  });

  if (!user || user.status === "suspended" || user.status === "deactivated") {
    return { success: false, message: "USER_NOT_FOUND" };
  }

  // Validação de superfície: na plataforma superadmin só superadmin pode pedir código
  if (surface === "platform" && !user.isSuperadmin) {
    return { success: false, message: "USER_NOT_FOUND" };
  }

  const code = generateOtp();
  const identifier = loginCodeId(email);
  const token = digest(code, identifier);

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: { identifier },
    });
    await tx.verificationToken.create({
      data: {
        identifier,
        token,
        expires: new Date(Date.now() + 600_000), // 10 minutos
      },
    });
  });

  await send(email, code);
  return { success: true };
}
