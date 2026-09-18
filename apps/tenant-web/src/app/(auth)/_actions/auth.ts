"use server";
import { cookies } from "next/headers";
import { signIn } from "@bipesend/auth";
import { checkAuthRateLimit } from "@bipesend/auth/rate-limit";
import {
  requestRecovery,
  verifyRecovery,
  redeemRecovery,
} from "@bipesend/auth/recovery";
import { requestEmailVerification } from "@bipesend/auth/verification";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { AuthError } from "next-auth";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyCodeSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyCodeInput,
} from "@/lib/validations/auth";

const recoveryCookie = "bipesend.tenant.recovery";
const unavailable = {
  success: false,
  message:
    "Não foi possível concluir. Confira os dados ou tente novamente em alguns instantes.",
};
export async function loginAction(data: LoginInput & { code?: string }) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };
  try {
    const signInData: Record<string, any> = {
      ...parsed.data,
      rememberMe: String(parsed.data.rememberMe ?? false),
      redirect: false,
    };
    if (data.code) {
      signInData.code = data.code;
    }
    
    await signIn("credentials", signInData);
    const store = await cookies();
    const secure = process.env.NODE_ENV === "production";
    const name = `${secure ? "__Secure-" : ""}bipesend.tenant.session-token`;
    const token = store.get(name);
    if (token && !parsed.data.rememberMe)
      store.set(name, token.value, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
      });
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    const err = error as any;
    const isAuthError = err instanceof AuthError || (err && typeof err.type === "string");
    
    if (isAuthError) {
      const code = err.code || err.cause?.err?.code;
      const name = err.name || err.cause?.err?.name;

      if (code === "2FA_REQUIRED" || name === "AuthError2FA") {
        return { success: false, message: "2FA_REQUIRED" };
      }
      if (code === "2FA_SETUP_REQUIRED" || name === "AuthErrorSetup2FA") {
        return { success: false, message: "Configuração de 2FA obrigatória." };
      }
      if (code === "INVALID_2FA_CODE" || name === "AuthErrorInvalid2FA") {
        return { success: false, message: "Código 2FA inválido." };
      }
      
      // Fallback
      if (err.type === "CredentialsSignin") {
        return { success: false, message: "Credenciais inválidas." };
      }
    }
    return unavailable;
  }
}
export async function registerAction(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };
  try {
    const input = parsed.data;
    const normalizedEmail = input.email.toLowerCase();
    await checkAuthRateLimit("register", normalizedEmail, 5, 3_600_000);
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { emailNormalized: normalizedEmail }
        ]
      }
    });
    if (existing)
      return {
        success: false,
        message: "Este e-mail já está em uso. Faça login para continuar.",
      };
    const password = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    const user = await prisma.user.create({
      data: {
        name: input.name,
        companyName: input.companyName,
        email: normalizedEmail,
        emailNormalized: normalizedEmail,
        password,
      },
    });

    try {
      const { sendEmailVerificationEmail } = await import("@/lib/mailer");
      await requestEmailVerification(input.email, async (to, code) => {
        await sendEmailVerificationEmail(to, code);
      });
    } catch {
      // Ignora erro de envio de e-mail para não falhar o cadastro
    }

    return { 
      success: true, 
      message: "Se o e-mail não estiver em uso, sua conta foi criada com sucesso! Verifique sua caixa de entrada." 
    };
  } catch {
    return unavailable;
  }
}
export async function forgotPasswordAction(data: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };
  try {
    const { sendPasswordResetEmail } = await import("@/lib/mailer");
    await requestRecovery(parsed.data.email, async (to, code) => {
      if (!(await sendPasswordResetEmail(to, code)))
        throw new Error("MAIL_UNAVAILABLE");
    });
  } catch {
    /* Same response for missing account, throttling and mail failure. */
  }
  return {
    success: true,
    message: "Se o e-mail existir, um código será enviado.",
  };
}
export async function verifyAction(data: VerifyCodeInput & { email: string }) {
  const code = verifyCodeSchema.safeParse(data),
    email = forgotPasswordSchema.safeParse(data);
  if (!code.success || !email.success)
    return { success: false, message: "Dados inválidos." };
  try {
    const proof = await verifyRecovery(email.data.email, code.data.code);
    (await cookies()).set(recoveryCookie, proof, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/forgot-password",
      maxAge: 600,
    });
    return { success: true, message: "Código verificado com sucesso." };
  } catch {
    return {
      success: false,
      message: "Código inválido ou expirado. Solicite um novo código.",
    };
  }
}
export async function resetPasswordAction(
  data: ResetPasswordInput & { email: string; code?: string },
) {
  const parsed = resetPasswordSchema.safeParse(data),
    email = forgotPasswordSchema.safeParse(data);
  if (!parsed.success || !email.success)
    return { success: false, message: "Dados inválidos." };
  try {
    const store = await cookies(),
      proof = store.get(recoveryCookie)?.value;
    if (!proof)
      return {
        success: false,
        message: "Verifique o código novamente para continuar.",
      };
    await redeemRecovery(email.data.email, proof, parsed.data.password);
    store.set(recoveryCookie, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/forgot-password",
      maxAge: 0,
    });
    return { success: true, message: "Senha redefinida com sucesso." };
  } catch {
    return unavailable;
  }
}
