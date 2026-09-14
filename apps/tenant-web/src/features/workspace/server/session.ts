import { cache } from "react";
import { auth } from "@bipesend/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@bipesend/db";

/** Every data loader/action must authorize again; a layout is only one entry point. */
export const getWorkspaceUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, active: true },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const activeTenantId = cookieStore.get("bipesend.tenant.active")?.value;
  
  let activeMembership = memberships.find((m) => m.tenantId === activeTenantId);
  if (!activeMembership) {
    activeMembership = memberships[0];
  }

  return { 
    id: session.user.id, 
    name: session.user.name ?? "Minha conta",
    email: session.user.email,
    activeTenant: {
      id: activeMembership.tenant.id,
      name: activeMembership.tenant.name,
      slug: activeMembership.tenant.slug,
      role: activeMembership.role,
    },
    availableTenants: memberships.map(m => ({
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      role: m.role,
    }))
  };
});
