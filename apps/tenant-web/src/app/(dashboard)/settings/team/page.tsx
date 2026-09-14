import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { TeamClient } from "./team-client";
import { DepartmentClient } from "./department-client";
import { prisma } from "@bipesend/db";

export default async function TeamSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getWorkspaceUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, active: true },
    include: { tenant: true }
  });

  if (!membership || !membership.tenant) {
    redirect("/onboarding");
  }

  const tenant = membership.tenant;
  const isAdmin = ["tenant_admin", "owner", "admin", "OWNER", "ADMIN"].includes(membership.role);

  if (!membership || !isAdmin) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
        <p className="text-muted-foreground">Você não tem permissão para gerenciar a equipe.</p>
      </div>
    );
  }

  const params = await searchParams;
  const activeTab = params?.tab === "departments" ? "departments" : "members";

  const members = await prisma.membership.findMany({
    where: { tenantId: tenant.id },
    include: { user: true, department: true },
    orderBy: { createdAt: 'asc' }
  });

  const invitations = await prisma.invitation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { expiresAt: 'desc' }
  });

  const departments = await prisma.department.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
        <p className="text-muted-foreground">Gerencie os membros e setores do seu workspace.</p>
      </div>

      <div className="flex border-b">
        <a 
          href="?tab=members" 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'members' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Membros
        </a>
        <a 
          href="?tab=departments" 
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'departments' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Setores
        </a>
      </div>
      
      {activeTab === 'members' ? (
        <TeamClient 
          tenantId={tenant.id} 
          members={members.map(m => ({ 
            id: m.id, 
            email: m.user.email, 
            name: m.user.name, 
            role: m.role,
            department: m.department?.name,
            active: m.active
          }))} 
          invitations={invitations.map(i => ({
            id: i.id,
            email: i.email,
            role: i.role,
            expiresAt: i.expiresAt,
            status: i.expiresAt < new Date() ? 'expired' : 'pending'
          }))}
        />
      ) : (
        <DepartmentClient departments={departments} tenantId={tenant.id} />
      )}
    </div>
  );
}
