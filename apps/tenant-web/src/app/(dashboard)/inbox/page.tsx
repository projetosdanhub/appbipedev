import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import { cookies } from "next/headers";
import InboxClient from "./inbox-client";
import { getAllConversationsAction } from "@/features/inbox/actions/inbox.actions";
import { fetchApi } from "@/lib/api-client";
import { CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
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

  const { success, data } = await getAllConversationsAction(membership.tenantId);
  const initialConversations = success && data ? data : [];
  
  const isFullscreen = resolvedSearchParams.fullscreen === "true";
  const chatId = typeof resolvedSearchParams.chatId === "string" ? resolvedSearchParams.chatId : undefined;

  const memberships = (await prisma.membership.findMany({
    where: { tenantId: membership.tenantId, active: true },
    include: { user: true }
  })).map(m => ({
    id: m.id,
    userId: m.userId,
    user: {
      name: m.user.name,
      email: m.user.email ?? ""
    }
  }));

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bipesend.tenant.session-token")?.value || cookieStore.get("__Secure-bipesend.tenant.session-token")?.value || "";

  // Fetch pipelines for "Criar Negócio" modal
  const pipelinesRes = await fetchApi(`/api/v1/tenants/${membership.tenantId}/pipelines`);
  const pipelinesData = await pipelinesRes.json();
  const pipelines: CrmPipeline[] = pipelinesRes.ok ? pipelinesData.data : [];

  const stagesMap: Record<string, CrmPipelineStage[]> = {};
  await Promise.all(
    pipelines.map(async (pipeline) => {
      const stagesRes = await fetchApi(`/api/v1/tenants/${membership.tenantId}/pipelines/${pipeline.id}/stages`);
      if (stagesRes.ok) {
        const sData = await stagesRes.json();
        stagesMap[pipeline.id] = (sData.data as CrmPipelineStage[]).sort((a, b) => a.position - b.position);
      }
    })
  );

  return (
    <InboxClient 
      tenantId={membership.tenantId} 
      membershipId={membership.id} 
      initialConversations={initialConversations}
      isFullscreen={isFullscreen}
      initialChatId={chatId}
      memberships={memberships}
      sessionToken={sessionToken}
      pipelines={pipelines}
      stagesMap={stagesMap}
    />
  );
}
