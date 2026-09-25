"use server";

import { auth } from "@bipesend/auth/superadmin";
import { prisma } from "@bipesend/db";
import * as argon2 from "argon2";
import { revalidatePath } from "next/cache";

export interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  twoFactorEnabled: boolean;
  isSuperadmin: boolean;
}

export async function getAdminProfileDataAction(): Promise<{
  success: boolean;
  data?: AdminProfileData;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        twoFactorEnabled: true,
        isSuperadmin: true,
      },
    });

    if (!user) {
      return { success: false, error: "Administrador não encontrado." };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name || "SuperAdmin",
        email: user.email || "",
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        twoFactorEnabled: user.twoFactorEnabled,
        isSuperadmin: user.isSuperadmin,
      },
    };
  } catch (err: unknown) {
    console.error("[getAdminProfileDataAction] Erro:", err);
    return { success: false, error: "Erro ao carregar dados do perfil." };
  }
}

export async function updateAdminProfileAction(data: {
  name: string;
  image?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const trimmedName = data.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "O nome deve ter pelo menos 2 caracteres." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: trimmedName,
        image: data.image || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateAdminProfileAction] Erro:", err);
    return { success: false, error: "Falha ao atualizar dados do perfil." };
  }
}

export async function changeAdminPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const { currentPassword, newPassword, confirmPassword } = data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "Preencha todos os campos de senha." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "A nova senha e a confirmação não coincidem." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "A nova senha deve ter no mínimo 8 caracteres." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return { success: false, error: "Usuário inválido ou sem senha cadastrada." };
    }

    // Valida senha atual com Argon2
    const isCurrentValid = await argon2.verify(user.password, currentPassword);
    if (!isCurrentValid) {
      return { success: false, error: "A senha atual informada está incorreta." };
    }

    // Gera novo hash Argon2id
    const newPasswordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: newPasswordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("[changeAdminPasswordAction] Erro:", err);
    return { success: false, error: "Erro ao processar alteração de senha." };
  }
}
