"use server";
import { auth, signOut } from "@bipesend/auth";
import { revokeSession } from "@bipesend/auth/session";

export async function logout() {
  const session = await auth();
  if ((session as any)?.sessionId) {
    await revokeSession((session as any).sessionId);
  }
  await signOut({ redirectTo: "/login" });
}

export async function switchTenantAction(tenantId: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("bipesend.tenant.active", tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function inviteMemberAction(data: import("@/lib/validations/workspace").InviteMemberInput & { tenantId: string }) {
  const { inviteMemberSchema } = await import("@/lib/validations/workspace");
  const parsed = inviteMemberSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };

  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado." };

  const { prisma } = await import("@bipesend/db");

  // Verify caller's permission in the tenant
  const { resolveTenantContext, canGrantRole, normalizeTenantRole } = await import("@bipesend/auth/policies");

  const lookup = {
    async findMembership(userId: string, tenantId: string) {
      const mem = await prisma.membership.findFirst({
        where: { userId, tenantId, active: true },
        select: { id: true, userId: true, tenantId: true, role: true, active: true }
      });
      return mem;
    }
  };

  let context;
  try {
    context = await resolveTenantContext(lookup, {
      userId: session.user.id,
      tenantId: data.tenantId,
      requestId: "invite-member"
    });
  } catch (error) {
    return { success: false, message: "Acesso negado ao tenant." };
  }

  const normalizedRole = normalizeTenantRole(parsed.data.role);
  if (!canGrantRole(context, normalizedRole)) {
    return { success: false, message: "Permissão negada para conceder este cargo." };
  }

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existingUser) {
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: existingUser.id, tenantId: data.tenantId }
    });
    if (existingMembership) {
      return { success: false, message: "Usuário já é membro deste workspace." };
    }
  }

  const { randomBytes, createHash } = await import("node:crypto");
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  
  // Expiration: 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    // Save to DB
    await prisma.invitation.upsert({
      where: {
        tenantId_email: {
          tenantId: data.tenantId,
          email: parsed.data.email,
        }
      },
      update: {
        tokenHash,
        role: parsed.data.role,
        expiresAt,
      },
      create: {
        tenantId: data.tenantId,
        email: parsed.data.email,
        role: parsed.data.role,
        tokenHash,
        expiresAt,
      }
    });

    // Send email using Resend
    const { Resend } = await import("resend");
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    const fromEmail = process.env.MAIL_FROM || "onboarding@resend.dev";
    
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite?token=${rawToken}`;
    const subject = "Você foi convidado para um Workspace - Bipe";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007BFF;">Bipesend</h2>
        <p>Você foi convidado para participar de um Workspace.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Aceitar Convite</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Este link expira em 7 dias.</p>
        <p style="color: #64748b; font-size: 14px;">Se não esperava por isso, ignore este e-mail.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: `Bipesend Auth <${fromEmail}>`,
        to: parsed.data.email,
        subject,
        html,
      });
    } else {
      const { transporter } = await import("@/lib/mailer");
      await transporter.sendMail({
        from: `"Bipesend Auth" <${fromEmail}>`,
        to: parsed.data.email,
        subject,
        html,
      });
      console.log(`[MAILPIT FALLBACK] Invite sent to ${parsed.data.email} with token: ${rawToken}`);
    }

    return { success: true, message: "Convite enviado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao criar convite." };
  }
}




export async function disconnectMemberAction(tenantId: string, userIdToDisconnect: string, reason?: string) {
  const { prisma } = await import("@bipesend/db");
  const { resolveTenantContext, hasPermission } = await import("@bipesend/auth/policies");
  const { getWorkspaceUser } = await import("@/features/workspace/server/session");
  try {
    const user = await getWorkspaceUser();
    const lookup = {
      async findMembership(userId: string, tId: string) {
        return prisma.membership.findFirst({
          where: { userId, tenantId: tId, active: true },
          select: { id: true, userId: true, tenantId: true, role: true, active: true }
        }) as any;
      }
    };
    const context = await resolveTenantContext(lookup, { userId: user.id, tenantId, requestId: "disconnect-member" });
    if (!hasPermission(context, "team.members.manage", tenantId)) {
      return { success: false, message: "Permissão negada." };
    }
    const targetMembership = await prisma.membership.findFirst({
      where: { userId: userIdToDisconnect, tenantId, active: true }
    });
    if (!targetMembership) {
      return { success: false, message: "Membro não encontrado." };
    }
    
    await prisma.membership.update({
      where: { id: targetMembership.id },
      data: { active: false }
    });
    return { success: true, message: "Membro desconectado com sucesso." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao desconectar membro." };
  }
}

export async function approveDisconnectionAction(requestId: string, approve: boolean) {
  const { resolveTenantContext } = await import("@bipesend/auth/policies");
  const { getWorkspaceUser } = await import("@/features/workspace/server/session");
  const { prisma } = await import("@bipesend/db");
  
  try {
    const user = await getWorkspaceUser();
    const lookup = {
      async findMembership(userId: string, tId: string) {
        return prisma.membership.findFirst({
          where: { userId, tenantId: tId, active: true },
          select: { id: true, userId: true, tenantId: true, role: true, active: true }
        }) as any;
      }
    };
    // getWorkspaceUser already returns activeTenant info but let's use the standard resolution:
    const context = await resolveTenantContext(lookup, { userId: user.id, tenantId: user.activeTenant.id, requestId: "approve-disconnection" });
    if (context.role !== "tenant_admin") {
      return { success: false, message: "Permissão negada." };
    }
    
    const req = await prisma.disconnectionRequest.findUnique({ where: { id: requestId } });
    if (!req) return { success: false, message: "Solicitação não encontrada" };
    
    await prisma.disconnectionRequest.update({
      where: { id: requestId },
      data: { status: approve ? "APPROVED" : "REJECTED" }
    });
    
    if (approve) {
      await prisma.membership.update({
        where: { id: req.membershipId },
        data: { active: false }
      });
    }
    
    return { success: true, message: approve ? "Desconexão aprovada." : "Desconexão rejeitada." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao processar solicitação." };
  }
}
