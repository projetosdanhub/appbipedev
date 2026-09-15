import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import { CRMClient } from "@/features/crm/components/crm-client";
import { fetchApi } from "@/lib/api-client";
import { CrmPipeline, CrmPipelineStage, CrmDeal } from "@bipesend/contracts";

export default async function CRMPage() {
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

  // Fetch pipelines
  const pipelinesRes = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines`);
  const pipelinesData = await pipelinesRes.json();
  const pipelines: CrmPipeline[] = pipelinesRes.ok ? pipelinesData.data : [];

  // Fetch stages and deals for all pipelines in parallel
  const stagesMap: Record<string, CrmPipelineStage[]> = {};
  const dealsMap: Record<string, CrmDeal[]> = {};

  await Promise.all(
    pipelines.map(async (pipeline) => {
      const [stagesRes, dealsRes] = await Promise.all([
        fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipeline.id}/stages`),
        fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipeline.id}/deals`)
      ]);
      if (stagesRes.ok) {
        const sData = await stagesRes.json();
        // Ordena pela posição
        stagesMap[pipeline.id] = (sData.data as CrmPipelineStage[]).sort((a, b) => a.position - b.position);
      }
      if (dealsRes.ok) {
        const dData = await dealsRes.json();
        dealsMap[pipeline.id] = dData.data as CrmDeal[];
      }
    })
  );

  return (
    <CRMClient 
      tenantId={tenantId}
      initialPipelines={pipelines}
      initialStages={stagesMap}
      initialDeals={dealsMap}
    />
  );
}
