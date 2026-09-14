"use server";

import { prisma } from "@bipesend/db";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { departmentSchema, DepartmentInput } from "@/lib/validations/team";
import { revalidatePath } from "next/cache";

export async function createDepartmentAction(data: DepartmentInput) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem criar setores." };
  }

  const parsed = departmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    await prisma.department.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        tenantId: user.activeTenant.id,
      },
    });

    revalidatePath("/settings/team");
    return { success: true, message: "Setor criado com sucesso." };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Já existe um setor com este nome neste workspace." };
    }
    return { success: false, message: "Erro ao criar setor." };
  }
}

export async function updateDepartmentAction(id: string, data: DepartmentInput) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem editar setores." };
  }

  const parsed = departmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== user.activeTenant.id) {
      return { success: false, message: "Setor não encontrado." };
    }

    await prisma.department.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
      },
    });

    revalidatePath("/settings/team");
    return { success: true, message: "Setor atualizado com sucesso." };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Já existe um setor com este nome neste workspace." };
    }
    return { success: false, message: "Erro ao editar setor." };
  }
}

export async function deleteDepartmentAction(id: string) {
  const user = await getWorkspaceUser();
  const isAdmin = ["OWNER", "ADMIN", "owner", "admin", "tenant_admin"].includes(user.activeTenant.role);
  if (!isAdmin) {
    return { success: false, message: "Apenas administradores podem excluir setores." };
  }

  try {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== user.activeTenant.id) {
      return { success: false, message: "Setor não encontrado." };
    }

    await prisma.department.delete({
      where: { id },
    });

    revalidatePath("/settings/team");
    return { success: true, message: "Setor excluído com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro ao excluir setor." };
  }
}

export async function getDepartmentsAction() {
  const user = await getWorkspaceUser();
  return prisma.department.findMany({
    where: { tenantId: user.activeTenant.id },
    orderBy: { name: "asc" },
  });
}
