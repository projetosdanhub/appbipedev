import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import { fetchAiTemplatesAction } from "@/features/ai/actions/ai.actions";
import { AiAgentsClient } from "@/features/ai/components/ai-agents-client";

export const metadata = {
  title: "Agentes de Inteligência Artificial | BipeSend Omnichannel",
  description: "Gerencie e configure seus agentes de inteligência artificial com personalidade e segurança.",
};

export default async function AiAgentsPage() {
  const user = await getWorkspaceUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, active: true },
    include: { tenant: true },
  });

  if (!membership) {
    redirect("/login");
  }

  const templates = await fetchAiTemplatesAction();

  return <AiAgentsClient initialTemplates={templates} />;
}
