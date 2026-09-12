"use server";

import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyCodeInput,
} from "@/lib/validations/auth";

export async function loginAction(data: LoginInput) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Here you would validate against your DB/auth provider
  console.log("Login payload:", data);
  
  // Return success or error to be handled by the UI
  return { success: true, message: "Login realizado com sucesso!" };
}

export async function registerAction(data: RegisterInput) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Register payload:", data);
  return { success: true, message: "Conta criada com sucesso!" };
}

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Forgot password payload:", data);
  return { success: true, message: "Se o e-mail existir, um código será enviado." };
}

export async function resetPasswordAction(data: ResetPasswordInput) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Reset password payload:", data);
  return { success: true, message: "Senha redefinida com sucesso." };
}

export async function verifyAction(data: VerifyCodeInput) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Verify code payload:", data);
  return { success: true, message: "Código verificado com sucesso." };
}
