import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import { PipelineSettings } from "@/features/crm/components/pipeline-settings";
import { getPipelinesAction } from "@/features/crm/actions/pipeline.actions";
import { CrmPipeline } from "@bipesend/contracts";

export default async function CrmPipelinesSettingsPage() {
  const user = await getWorkspaceUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, active: true },
    include: { tenant: true }
  });

  if (!membership) {
    redirect("/login");
  }

  const tenantId = membership.tenantId;

  // Fetch initial pipelines on the server
  const response = await getPipelinesAction(tenantId);
  const initialPipelines = (response.success && response.data) ? (response.data as CrmPipeline[]) : [];

  return (
    <div className="container mx-auto py-6">
      <PipelineSettings tenantId={tenantId} initialPipelines={initialPipelines} />
    </div>
  );
}
