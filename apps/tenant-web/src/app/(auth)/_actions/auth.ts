"use server";

import { cookies } from "next/headers";

import { signIn } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { AuthError } from "next-auth";

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyCodeInput,
} from "@/lib/validations/auth";
import { z } from "zod";

export async function loginAction(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const cookieStore = await cookies();
  const attemptsCookie = cookieStore.get("bipesend_auth_attempts")?.value;
  const lockoutCookie = cookieStore.get("bipesend_auth_lockout")?.value;

  // Verifica se está bloqueado
  if (lockoutCookie) {
    const lockoutUntil = parseInt(lockoutCookie, 10);
    if (Date.now() < lockoutUntil) {
      return { 
        success: false, 
        message: "Muitas tentativas.", 
        lockoutUntil 
      };
    } else {
      // Bloqueio expirou, limpa os cookies
      cookieStore.delete("bipesend_auth_attempts");
      cookieStore.delete("bipesend_auth_lockout");
    }
  }

  // Logica real de login via NextAuth Credentials
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // We handle redirection on the client
    });

    // Se sucesso, reseta as tentativas
    cookieStore.delete("bipesend_auth_attempts");
    cookieStore.delete("bipesend_auth_lockout");
    
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    if (error instanceof AuthError) {
      let attempts = attemptsCookie ? parseInt(attemptsCookie, 10) : 0;
      attempts += 1;

      if (attempts >= 3) {
        const lockoutTime = Date.now() + 5 * 60 * 1000;
        cookieStore.set("bipesend_auth_lockout", lockoutTime.toString(), { httpOnly: true, secure: true, maxAge: 5 * 60 });
        cookieStore.delete("bipesend_auth_attempts");
        return { 
          success: false, 
          message: "Muitas tentativas.", 
          lockoutUntil: lockoutTime 
        };
      } else {
        cookieStore.set("bipesend_auth_attempts", attempts.toString(), { httpOnly: true, secure: true, maxAge: 60 * 60 });
        return { success: false, message: `Senha ou e-mail incorretos. Tentativa ${attempts} de 3.` };
      }
    }
    throw error; // Rethrow next/navigation errors
  }
}

export async function registerAction(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, message: "Este e-mail já está em uso." };
    }

    const hashedPassword = await argon2.hash(data.password);

    await prisma.user.create({
      data: {
        name: data.name,
        companyName: data.companyName,
        email: data.email,
        password: hashedPassword,
      }
    });

    return { success: true, message: "Conta criada com sucesso!" };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "Ocorreu um erro ao criar a conta." };
  }
}

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      // Retornar sucesso de qualquer maneira para não vazar emails cadastrados
      return { success: true, message: "Se o e-mail existir, um código será enviado." };
    }

    // Gerar código de 6 dígitos numéricos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Remover tokens antigos do usuário e criar novo
    await prisma.verificationToken.deleteMany({
      where: { identifier: data.email }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token: code,
        expires
      }
    });

    const { sendPasswordResetEmail } = await import("@/lib/mailer");
    await sendPasswordResetEmail(data.email, code);

    return { success: true, message: "Se o e-mail existir, um código será enviado." };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { success: false, message: "Ocorreu um erro ao solicitar a recuperação." };
  }
}

const resetPasswordServerSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  password: z.string().min(8)
});

export async function resetPasswordAction(data: ResetPasswordInput & { email: string; code: string }) {
  const parsed = resetPasswordServerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: data.email,
        token: data.code,
      }
    });

    if (!tokenRecord) {
      return { success: false, message: "Código inválido." };
    }

    if (tokenRecord.expires < new Date()) {
      return { success: false, message: "O código expirou. Solicite um novo." };
    }

    const hashedPassword = await argon2.hash(data.password);

    await prisma.user.update({
      where: { email: data.email },
      data: { password: hashedPassword }
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: data.email }
    });

    return { success: true, message: "Senha redefinida com sucesso." };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { success: false, message: "Ocorreu um erro ao redefinir a senha." };
  }
}

const verifyCodeServerSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6)
});

export async function verifyAction(data: VerifyCodeInput) {
  const parsed = verifyCodeServerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: data.email,
        token: data.code,
      }
    });

    if (!tokenRecord) {
      return { success: false, message: "Código inválido." };
    }

    if (tokenRecord.expires < new Date()) {
      return { success: false, message: "O código expirou. Solicite um novo." };
    }

    return { success: true, message: "Código verificado com sucesso." };
  } catch (error) {
    console.error("Verify Code Error:", error);
    return { success: false, message: "Erro ao verificar o código." };
  }
}
