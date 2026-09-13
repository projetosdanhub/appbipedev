"use server";

import { signIn } from "@bipesend/auth";


export async function loginAction(data: { email: string; password: string; code?: string; rememberMe?: boolean }) {
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
    if (error && typeof error === 'object' && ('type' in error || 'message' in error)) {
      const errorMsg = (error as any).cause?.err?.message || (error as any).type || (error as any).message;
      if (errorMsg === "2FA_REQUIRED") {
        return { success: false, message: "2FA_REQUIRED" };
      }
      if (errorMsg === "INVALID_2FA_CODE") {
        return { success: false, message: "Código inválido." };
      }
      if (errorMsg === "CredentialsSignin") {
        return { success: false, message: "Senha ou e-mail incorretos." };
      }
    }
    throw error;
  }
}
