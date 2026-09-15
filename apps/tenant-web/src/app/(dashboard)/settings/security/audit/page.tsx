import { auth } from "@bipesend/auth";
import { redirect } from "next/navigation";
import { AuditClient } from "./audit-client";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@bipesend/ui";
import { normalizeTenantRole, rolePermissions } from "@bipesend/auth/policies";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getWorkspaceUser();
  const role = normalizeTenantRole(user.activeTenant.role);
  const hasAuditPermission = rolePermissions[role]?.includes("audit.read") ?? false;
  
  if (!hasAuditPermission) {
    redirect("/settings/security");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/settings/security" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Voltar para Segurança</span>
        </Link>
        <div>
          <h1 className="text-[28px] font-bold leading-[36px]">Auditoria</h1>
          <p className="text-[15px] text-[var(--color-ink-500)]">
            Acompanhe o histórico de ações críticas realizadas no workspace.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[12px] p-6">
        <AuditClient tenantId={user.activeTenant.id} />
      </div>
    </div>
  );
}
