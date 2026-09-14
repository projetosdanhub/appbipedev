"use server";

import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";

export async function acceptInviteAction(token: string) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, message: "Não autorizado." };
  }

  const { createHash } = await import("node:crypto");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash }
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return { success: false, message: "Convite inválido ou expirado." };
  }

  if (session.user.email !== invitation.email) {
    return { success: false, message: "Este convite foi enviado para outro endereço de e-mail." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create membership
      await tx.membership.upsert({
        where: {
          tenantId_userId: {
            userId: session.user!.id!,
            tenantId: invitation.tenantId
          }
        },
        update: {
          role: invitation.role,
          active: true
        },
        create: {
          userId: session.user!.id!,
          tenantId: invitation.tenantId,
          role: invitation.role,
          active: true
        }
      });

      // Delete invitation
      await tx.invitation.delete({
        where: { id: invitation.id }
      });
    });

    return { success: true, message: "Convite aceito com sucesso." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao aceitar convite." };
  }
}
