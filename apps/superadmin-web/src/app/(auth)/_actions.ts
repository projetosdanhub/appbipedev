"use server";

import { AuthError } from "next-auth";
import { signIn } from "@bipesend/auth/superadmin";

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
