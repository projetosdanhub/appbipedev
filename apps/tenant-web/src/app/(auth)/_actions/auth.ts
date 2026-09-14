"use server";
import { cookies } from "next/headers";
import { signIn } from "@bipesend/auth";
import { checkAuthRateLimit } from "@bipesend/auth/rate-limit";
import {
  requestRecovery,
  verifyRecovery,
  redeemRecovery,
} from "@bipesend/auth/recovery";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
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
    await signIn("credentials", {
      ...parsed.data,
      code: data.code,
      rememberMe: String(parsed.data.rememberMe ?? false),
      redirect: false,
    });
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
    if (error instanceof AuthError) {
      const cause = error.cause?.err;
      if (cause instanceof Error && cause.message === "2FA_REQUIRED")
        return { success: false, message: "2FA_REQUIRED" };
      return {
        success: false,
        message: "Confira os dados informados ou tente novamente mais tarde.",
      };
    }
    return unavailable;
  }
}
export async function registerAction(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };
  try {
    const input = parsed.data;
    await checkAuthRateLimit("register", input.email, 5, 3_600_000);
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing)
      return {
        success: false,
        message:
          "Não foi possível criar a conta. Tente entrar ou recuperar seu acesso.",
      };
    const password = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    await prisma.user.create({
      data: {
        name: input.name,
        companyName: input.companyName,
        email: input.email,
        password,
      },
    });
    return { success: true, message: "Conta criada com sucesso!" };
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
