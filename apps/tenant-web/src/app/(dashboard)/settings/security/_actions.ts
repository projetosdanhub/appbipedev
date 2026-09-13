"use server";

import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import * as argon2 from "argon2";

export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Usuário não encontrado");
  if (user.twoFactorEnabled) throw new Error("2FA já está ativado");

  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(user.email || "user@bipesend.com", "BipeSend", secret);
  const qrCodeUrl = await QRCode.toDataURL(uri);

  return { secret, qrCodeUrl };
}

export async function enable2FA(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const isValid = authenticator.verify({ token: code, secret });
  if (!isValid) {
    throw new Error("Código inválido");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });

  return { success: true };
}

export async function disable2FA(password: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) throw new Error("Usuário não encontrado");

  const isValidPassword = await argon2.verify(user.password, password);
  if (!isValidPassword) {
    throw new Error("Senha incorreta");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return { success: true };
}
