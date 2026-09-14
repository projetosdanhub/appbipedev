"use server";

import { AuthError } from "next-auth";
import { signIn } from "@bipesend/auth/superadmin";
import {
  requestRecovery,
  verifyRecovery,
  redeemRecovery,
} from "@bipesend/auth/recovery";
import { cookies } from "next/headers";

const recoveryCookie = "bipesend.platform.recovery";
const unavailable = {
  success: false,
  message:
    "Não foi possível concluir. Confira os dados ou tente novamente em alguns instantes.",
};

export async function loginAction(data: {
  email: string;
  password: string;
  code?: string;
  rememberMe?: boolean;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      code: data.code,
      rememberMe: data.rememberMe?.toString() || "false",
      redirect: false,
    });
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    if (error instanceof AuthError && error.cause?.err instanceof Error) {
      if (error.cause.err.message === "2FA_REQUIRED")
        return { success: false, message: "2FA_REQUIRED" };
    }
    return {
      success: false,
      message: "Não foi possível entrar. Confira os dados e tente novamente.",
    };
  }
}

export async function forgotPasswordAction(data: { email: string }) {
  try {
    const { sendPasswordResetEmail } = await import("@/lib/mailer");
    await requestRecovery(
      data.email,
      async (to, code) => {
        if (!(await sendPasswordResetEmail(to, code)))
          throw new Error("MAIL_UNAVAILABLE");
      },
      "platform"
    );
  } catch {
    // Ignore error
  }
  return {
    success: true,
    message: "Se o e-mail existir, um código será enviado.",
  };
}

export async function verifyAction(data: { email: string; code: string }) {
  try {
    const proof = await verifyRecovery(data.email, data.code);
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

export async function resetPasswordAction(data: { email: string; password: string }) {
  try {
    const store = await cookies();
    const proof = store.get(recoveryCookie)?.value;
    if (!proof)
      return {
        success: false,
        message: "Verifique o código novamente para continuar.",
      };
    await redeemRecovery(data.email, proof, data.password, "platform");
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
