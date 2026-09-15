"use server";

import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";

export async function acceptInviteAction(token: string, alias?: string) {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        where: { role: { in: ["contratante", "socio"] } }
      }
    }
  });

  if (user?.isSuperadmin || (user?.memberships && user.memberships.length > 0)) {
    return { success: false, message: "Contas de administração ou sócio não podem aceitar convites para evitar conflitos." };
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
          active: true,
          alias: alias || null
        },
        create: {
          userId: session.user!.id!,
          tenantId: invitation.tenantId,
          role: invitation.role,
          active: true,
          alias: alias || null
        }
      });

      // Delete invitation
      await tx.invitation.delete({
        where: { id: invitation.id }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: session.user!.id!,
          tenantId: invitation.tenantId,
          action: "INVITE_ACCEPTED",
          details: { email: invitation.email, role: invitation.role }
        }
      });
    });

    return { success: true, message: "Convite aceito com sucesso." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao aceitar convite." };
  }
}
