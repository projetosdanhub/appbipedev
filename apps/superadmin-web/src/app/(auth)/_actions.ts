"use server";

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

import { prisma } from "@bipesend/db";
import { generateTotpSecret, generateTotpUri } from "@bipesend/auth";
import qrcode from "qrcode";

export async function getSuperadminSetupQrAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, twoFactorSecret: true, isSuperadmin: true },
    });

    if (!user || !user.isSuperadmin) {
      return { success: false, message: "Superadministrador não encontrado." };
    }

    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = generateTotpSecret();
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret },
      });
    }

    const otpauthUri = generateTotpUri({
      issuer: "Bipesend Admin",
      label: email,
      secret,
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUri, {
      width: 280,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    return {
      success: true,
      qrCodeUrl,
      secret,
    };
  } catch {
    return { success: false, message: "Erro ao gerar QR Code do autenticador." };
  }
}

interface AuthErrorShape {
  code?: string;
  type?: string;
  name?: string;
  message?: string;
  cause?: {
    err?: { code?: string; name?: string; message?: string };
    code?: string;
    name?: string;
    message?: string;
  };
}

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
      loginType: "password",
      rememberMe: data.rememberMe?.toString() || "false",
      redirect: false,
    });
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    const err = error as AuthErrorShape;
    const code = err?.code || err?.cause?.err?.code || err?.cause?.code || err?.type;
    const name = err?.name || err?.cause?.err?.name || err?.cause?.name;
    const msg = err?.message || err?.cause?.err?.message || err?.cause?.message || String(err);

    if (code === "2FA_SETUP_REQUIRED" || name === "AuthErrorSetup2FA" || msg.includes("2FA_SETUP_REQUIRED")) {
      const qrRes = await getSuperadminSetupQrAction(data.email);
      return {
        success: false,
        message: "2FA_SETUP_REQUIRED",
        qrCodeUrl: qrRes.success ? qrRes.qrCodeUrl : undefined,
        secret: qrRes.success ? qrRes.secret : undefined,
      };
    }

    if (code === "2FA_REQUIRED" || name === "AuthError2FA" || msg.includes("2FA_REQUIRED")) {
      return { success: false, message: "2FA_REQUIRED" };
    }

    if (code === "INVALID_2FA_CODE" || name === "AuthErrorInvalid2FA" || msg.includes("INVALID_2FA_CODE")) {
      return { success: false, message: "Código de autenticação inválido. Confira e tente novamente." };
    }

    if (code === "CredentialsSignin" || msg.includes("CredentialsSignin")) {
      return {
        success: false,
        message: "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      };
    }

    return {
      success: false,
      message: "Não foi possível entrar. Confira os dados e tente novamente.",
    };
  }
}

export async function sendLoginCodeAction(data: { email: string }) {
  try {
    const { requestLoginCode } = await import("@bipesend/auth/login-code");
    const { sendLoginCodeEmail } = await import("@/lib/mailer");

    const res = await requestLoginCode(
      data.email,
      async (to, code) => {
        await sendLoginCodeEmail(to, code);
      },
      "platform"
    );

    if (!res.success) {
      return {
        success: false,
        message: "Nenhuma conta de superadministrador encontrada com este e-mail.",
      };
    }

    return {
      success: true,
      message: "Código de acesso enviado com sucesso para seu e-mail.",
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "AUTH_RATE_LIMITED") {
      return {
        success: false,
        message: "Muitas tentativas em pouco tempo. Aguarde alguns instantes.",
      };
    }
    return {
      success: false,
      message: "Não foi possível enviar o código. Tente novamente em instantes.",
    };
  }
}

export async function loginWithCodeAction(data: {
  email: string;
  code: string;
  rememberMe?: boolean;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      code: data.code,
      loginType: "code",
      rememberMe: data.rememberMe?.toString() || "false",
      redirect: false,
    });
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    const err = error as AuthErrorShape;
    const code = err?.code || err?.cause?.err?.code || err?.cause?.code || err?.type;
    const name = err?.name || err?.cause?.err?.name || err?.cause?.name;
    const msg = err?.message || err?.cause?.err?.message || err?.cause?.message || String(err);

    if (code === "INVALID_LOGIN_CODE" || name === "AuthErrorInvalidCode" || msg.includes("INVALID_LOGIN_CODE")) {
      return {
        success: false,
        message: "Código de acesso inválido ou expirado. Confira no app autenticador e tente novamente.",
      };
    }

    if (code === "CredentialsSignin" || msg.includes("CredentialsSignin")) {
      return {
        success: false,
        message: "Código incorreto ou expirado. Verifique o aplicativo autenticador.",
      };
    }

    return {
      success: false,
      message: "Não foi possível autenticar com este código. Confira os dados digitados.",
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
