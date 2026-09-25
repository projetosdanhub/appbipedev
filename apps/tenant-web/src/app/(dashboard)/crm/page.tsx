import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import { cookies } from "next/headers";
import { CRMClient } from "@/features/crm/components/crm-client";
import { fetchApi } from "@/lib/api-client";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { 
  OMNICHANNEL_PIPELINE_NAME, 
  DEFAULT_OMNICHANNEL_STAGES, 
  isOmnichannelPipeline 
} from "@/features/crm/utils/omnichannel";

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
  let pipelines: CrmPipeline[] = pipelinesRes.ok ? pipelinesData.data : [];

  // Garantir a existência do Funil Fixo Omnichannel
  const hasOmnichannel = pipelines.some(p => isOmnichannelPipeline(p));
  if (!hasOmnichannel) {
    try {
      const createRes = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines`, {
        method: "POST",
        body: JSON.stringify({
          name: OMNICHANNEL_PIPELINE_NAME,
          description: "Funil nativo e centralizador de todas as interações e conexões omnichannel (WhatsApp, Instagram, TikTok, Telegram).",
          defaultCurrency: "BRL",
          isDefault: true,
        })
      });
      if (createRes.ok) {
        const createdPipelineData = await createRes.json();
        const newPipeline: CrmPipeline = createdPipelineData.data;
        if (newPipeline && newPipeline.id) {
          // Cria os fluxos padrão sequencialmente
          for (const stg of DEFAULT_OMNICHANNEL_STAGES) {
            await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${newPipeline.id}/stages`, {
              method: "POST",
              body: JSON.stringify({
                pipelineId: newPipeline.id,
                name: stg.name,
                colorToken: stg.colorToken,
                category: stg.category,
                position: stg.position,
                requiredFieldRules: { version: 1, rules: [] }
              })
            });
          }
          pipelines = [newPipeline, ...pipelines];
        }
      }
    } catch (e) {
      console.error("Erro ao provisionar funil omnichannel:", e);
    }
  }

  // Ordena para que o Funil Principal Omnichannel do sistema seja sempre prioritário
  pipelines.sort((a, b) => {
    if (a.isDefault || isOmnichannelPipeline(a)) return -1;
    if (b.isDefault || isOmnichannelPipeline(b)) return 1;
    return 0;
  });

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

  // Fetch contacts for the "Contatos / Entrada" column
  const contactsRes = await fetchApi(`/api/v1/tenants/${tenantId}/contacts?limit=50`);
  const contactsData = await contactsRes.json();
  const contacts: CrmContact[] = contactsRes.ok ? contactsData.data : [];

  // Fetch memberships for assignment
  const memberships = await prisma.membership.findMany({
    where: { tenantId, active: true },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  const formattedMemberships = memberships.map(m => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email ?? ""
  }));
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bipesend.tenant.session-token")?.value || cookieStore.get("__Secure-bipesend.tenant.session-token")?.value || "";

  return (
    <CRMClient 
      tenantId={tenantId}
      initialPipelines={pipelines}
      initialStages={stagesMap}
      initialDeals={dealsMap}
      initialContacts={contacts}
      memberships={formattedMemberships}
      sessionToken={sessionToken}
    />
  );
}
