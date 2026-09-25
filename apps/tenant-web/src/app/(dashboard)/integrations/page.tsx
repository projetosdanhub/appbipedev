import { Metadata } from "next";
import { cookies } from "next/headers";
import { IntegrationsClient } from "./integrations-client";
import { getConnectionsAction } from "@/features/integrations/actions/connection.actions";
import { getWorkspaceUser } from "@/features/workspace/server/session";

export const metadata: Metadata = {
  title: "Canais e Integrações Oficiais | BipeSend",
  description: "Conecte WhatsApp Oficial, Instagram Direct e TikTok for Business ao seu CRM Kanban e Inbox da BipeSend com sincronização em tempo real.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IntegrationsPage() {
  const user = await getWorkspaceUser();
  const res = await getConnectionsAction();
  const initialConnections = res.success ? res.data : [];

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bipesend.tenant.session-token")?.value || cookieStore.get("__Secure-bipesend.tenant.session-token")?.value || "";

  return (
    <IntegrationsClient 
      tenantId={user.activeTenant.id}
      initialConnections={initialConnections} 
      sessionToken={sessionToken}
    />
  );
}
