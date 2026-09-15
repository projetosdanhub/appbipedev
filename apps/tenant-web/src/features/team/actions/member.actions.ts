"use server";

import { prisma } from "@bipesend/db";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { setImpersonationCookie } from "@bipesend/auth/impersonate";
import { revalidatePath } from "next/cache";
import * as argon2 from "argon2";
import { fetchApi } from "@/lib/api-client";

// --- NOVAS ACTIONS (CHAMANDO A API BIF) ---

export async function inviteMemberAction(tenantId: string, email: string, role: string) {
  try {
    const response = await fetchApi(`/tenants/${tenantId}/invitations`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao convidar membro." };
    
    revalidatePath("/settings/team");
    return { success: true, message: "Convite enviado com sucesso!" };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao convidar." };
  }
}

export async function updateMemberRoleAction(tenantId: string, membershipId: string, role: string) {
  try {
    const response = await fetchApi(`/tenants/${tenantId}/team/members/${membershipId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar cargo." };
    
    revalidatePath("/settings/team");
    return { success: true, message: "Cargo atualizado com sucesso!" };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar cargo." };
  }
}

export async function suspendMemberAction(tenantId: string, membershipId: string) {
  try {
    const response = await fetchApi(`/tenants/${tenantId}/team/members/${membershipId}/suspend`, {
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao suspender membro." };
    
    revalidatePath("/settings/team");
    return { success: true, message: "Membro suspenso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao suspender membro." };
  }
}

export async function reactivateMemberAction(tenantId: string, membershipId: string) {
  try {
    const response = await fetchApi(`/tenants/${tenantId}/team/members/${membershipId}/reactivate`, {
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao reativar membro." };
    
    revalidatePath("/settings/team");
    return { success: true, message: "Membro reativado." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao reativar membro." };
  }
}

// --- ACTIONS ANTIGAS (AINDA USAM PRISMA - PENDENTE DE MIGRAÇÃO TOTAL PARA API CASO PRECISE) ---

export async function impersonateTeamMemberAction(targetUserId: string) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem acessar contas da equipe." };
  }

  try {
    const targetMembership = await prisma.membership.findFirst({
      where: {
        userId: targetUserId,
        tenantId: user.activeTenant.id,
      },
    });

    if (!targetMembership) {
      return { success: false, message: "Membro não encontrado neste workspace." };
    }

    await setImpersonationCookie(targetUserId, user.id, "tenant");

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
