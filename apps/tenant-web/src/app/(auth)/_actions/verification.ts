"use server";
import { verifyCodeSchema, type VerifyCodeInput } from "@/lib/validations/auth";
import { requestEmailVerification, verifyEmail } from "@bipesend/auth/verification";
import { z } from "zod";

const emailOnlySchema = z.object({
  email: z.string().email(),
});

export async function resendVerificationAction(data: { email: string }) {
  const parsed = emailOnlySchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "E-mail inválido." };

  try {
    const { sendEmailVerificationEmail } = await import("@/lib/mailer");
    await requestEmailVerification(parsed.data.email, async (to, code) => {
      if (!(await sendEmailVerificationEmail(to, code))) {
        throw new Error("MAIL_UNAVAILABLE");
      }
    });
  } catch {
    // Mesma resposta para proteger enumeração
  }

  return {
    success: true,
    message: "Se o e-mail não estiver verificado, um novo código será enviado.",
  };
}

export async function verifyEmailAction(data: VerifyCodeInput & { email: string }) {
  const code = verifyCodeSchema.safeParse(data);
  const email = emailOnlySchema.safeParse(data);

  if (!code.success || !email.success)
    return { success: false, message: "Dados inválidos." };

  try {
    await verifyEmail(email.data.email, code.data.code);
    return { success: true, message: "E-mail verificado com sucesso." };
  } catch {
    return {
      success: false,
      message: "Código inválido ou expirado. Solicite um novo código.",
    };
  }
}
