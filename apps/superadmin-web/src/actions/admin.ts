"use server";

import { prisma } from "@bipesend/db";
import { setImpersonationCookie } from "@bipesend/auth/impersonate";
import { revalidatePath } from "next/cache";
import * as argon2 from "argon2";
import { auth } from "@bipesend/auth";

// Basic authentication check for Superadmin Action
async function requireSuperadmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperadmin: true },
  });
  
  if (!currentUser?.isSuperadmin) throw new Error("Forbidden");
  
  return session.user.id;
}

export async function superadminImpersonateUserAction(targetUserId: string) {
  try {
    const actorId = await requireSuperadmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, message: "Usuário não encontrado." };
    }

    // Set impersonation cookie
    await setImpersonationCookie(targetUserId, actorId, "tenant");

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId,
        targetId: targetUserId,
        action: "impersonate_user",
        details: { reason: "Platform Godmode impersonation" },
      },
    });

    return { success: true, message: "Acessando conta do usuário..." };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao tentar acessar a conta." };
  }
}

export async function superadminResetUserPasswordAction(targetUserId: string, newPassword?: string) {
  try {
    const actorId = await requireSuperadmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, message: "Usuário não encontrado." };
    }

    const newPass = newPassword || Math.random().toString(36).slice(-8) + "1@Ab";
    const hashedPassword = await argon2.hash(newPass);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId,
        targetId: targetUserId,
        action: "reset_password",
        details: { description: "Password was forcefully reset by platform superadmin" },
      },
    });

    revalidatePath("/users");
    return { success: true, message: "Senha redefinida com sucesso.", newPassword: newPass };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao tentar redefinir a senha da conta." };
  }
}
