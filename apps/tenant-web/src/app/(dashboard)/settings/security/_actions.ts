"use server";

import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { setupMfa, verifyMfaSetup, disableMfa as authDisableMfa } from "@bipesend/auth/mfa";
import QRCode from "qrcode";
import * as argon2 from "argon2";

export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Usuário não encontrado");
  if (user.twoFactorEnabled) throw new Error("2FA já está ativado");

  const { secret, uri } = await setupMfa(user.id, user.email || "user@bipesend.com");
  const qrCodeUrl = await QRCode.toDataURL(uri);

  return { secret, qrCodeUrl };
}

export async function enable2FA(secret: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  try {
    const backupCodes = await verifyMfaSetup(session.user.id, secret, code);
    return { success: true, backupCodes };
  } catch (error: any) {
    throw new Error("Código inválido");
  }
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

  await authDisableMfa(session.user.id);
  return { success: true };
}
