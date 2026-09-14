"use server";
import { prisma, withTenantCreationTransaction } from "@bipesend/db";
import { randomUUID } from "node:crypto";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth";
import { auth as getAuth } from "@bipesend/auth";
import { revalidatePath } from "next/cache";

export async function onboardingAction(data: OnboardingInput) {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };

  const session = await getAuth();
  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    const input = parsed.data;

    // Verificar se o usuário já tem algum membership
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id }
    });

    if (memberships.length > 0) {
      return { success: true, message: "Você já está em um workspace." };
    }

    // Verificar se slug está em uso
    const existingSlug = await prisma.tenant.findUnique({
      where: { slug: input.slug }
    });

    if (existingSlug) {
      return { success: false, message: "Este slug já está em uso." };
    }

    const tenantId = randomUUID();
    await withTenantCreationTransaction(prisma, tenantId, async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          id: tenantId,
          name: input.companyName,
          slug: input.slug,
        },
      });
      await tx.membership.create({
        data: {
          userId: session.user!.id!,
          tenantId: tenant.id,
          role: "tenant_admin",
        },
      });
    });

    revalidatePath("/", "layout");
    
    return { 
      success: true, 
      message: "Workspace criado com sucesso!" 
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Não foi possível criar o workspace. Tente novamente mais tarde.",
    };
  }
}
