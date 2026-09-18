import { Metadata } from "next";
import { IntegrationsClient } from "./integrations-client";
import { getConnectionsAction } from "@/features/integrations/actions/connection.actions";
import { getWorkspaceUser } from "@/features/workspace/server/session";

export const metadata: Metadata = {
  title: "Loja de integrações",
};

export default async function IntegrationsPage() {
  const user = await getWorkspaceUser();
  const res = await getConnectionsAction();
  const initialConnections = res.success ? res.data : [];

  return (
    <IntegrationsClient 
      tenantId={user.activeTenant.id}
      initialConnections={initialConnections} 
    />
  );
}
