import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { redirect } from "next/navigation";
import { SecurityClient } from "./client";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { buttonVariants } from "@bipesend/ui";
import { normalizeTenantRole, rolePermissions } from "@bipesend/auth/policies";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  if (!user) {
    redirect("/login");
  }

  const workspaceUser = await getWorkspaceUser();
  const role = normalizeTenantRole(workspaceUser.activeTenant.role);
  const hasAuditPermission = rolePermissions[role]?.includes("audit.read") ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-[28px] font-bold leading-[36px]">Segurança</h1>
      <p className="text-[15px] text-[var(--color-ink-500)]">
        Gerencie as configurações de segurança da sua conta e ative a autenticação em duas etapas (2FA).
      </p>

      {hasAuditPermission && (
        <div className="bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[12px] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink-900)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-ink-500)]" />
              Logs de Auditoria
            </h3>
            <p className="text-[14px] text-[var(--color-ink-500)]">
              Acompanhe o histórico de ações críticas realizadas no workspace.
            </p>
          </div>
          <Link href="/settings/security/audit" className={buttonVariants({ variant: "outline" })}>
            Ver Logs
          </Link>
        </div>
      )}

      <div className="bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[12px] p-6 space-y-6">
        <SecurityClient isTwoFactorEnabled={user.twoFactorEnabled} />
      </div>
    </div>
  );
}
