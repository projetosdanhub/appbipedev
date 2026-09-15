"use server";

import { prisma } from "@bipesend/db";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { setImpersonationCookie } from "@bipesend/auth/impersonate";
import { revalidatePath } from "next/cache";
import * as argon2 from "argon2";

export async function impersonateTeamMemberAction(targetUserId: string) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem acessar contas da equipe." };
  }

  try {
    // Verifies if target user is in the same tenant
    const targetMembership = await prisma.membership.findFirst({
      where: {
        userId: targetUserId,
        tenantId: user.activeTenant.id,
      },
    });

    if (!targetMembership) {
      return { success: false, message: "Membro não encontrado neste workspace." };
    }

    // Set impersonation cookie
    await setImpersonationCookie(targetUserId, user.id, "tenant");

    // Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: user.activeTenant.id,
        actorId: user.id,
        targetId: targetUserId,
        action: "impersonate_user",
        details: { reason: "Admin Godmode impersonation" },
      },
    });

    return { success: true, message: "Acessando conta..." };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao tentar acessar a conta." };
  }
}

export async function resetTeamMemberPasswordAction(targetUserId: string, newPassword?: string) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem redefinir senhas." };
  }

  try {
    // Verifies if target user is in the same tenant and is a managed account
    const targetMembership = await prisma.membership.findFirst({
      where: {
        userId: targetUserId,
        tenantId: user.activeTenant.id,
      },
      include: {
        user: true,
      }
    });

    if (!targetMembership) {
      return { success: false, message: "Membro não encontrado neste workspace." };
    }

    if (!targetMembership.user.isManagedAccount) {
      return { success: false, message: "Não é possível redefinir a senha de uma conta não gerenciada (Externa)." };
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
        tenantId: user.activeTenant.id,
        actorId: user.id,
        targetId: targetUserId,
        action: "reset_password",
        details: { description: "Password was forcefully reset by tenant admin" },
      },
    });

    revalidatePath("/settings/team");
    return { success: true, message: "Senha redefinida com sucesso.", newPassword: newPass };
  } catch (error: any) {
    return { success: false, message: "Erro ao tentar redefinir a senha da conta." };
  }
}
