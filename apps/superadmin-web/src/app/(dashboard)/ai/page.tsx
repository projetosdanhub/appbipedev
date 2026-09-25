import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import {
  getSuperadminAiConfigAction,
  getSuperadminTemplatesAction,
  getSuperadminSecurityAuditAction,
} from "@/features/ai/actions/superadmin-ai.actions";
import { SuperadminAiClient } from "@/features/ai/components/superadmin-ai-client";

export const metadata = {
  title: "Inteligência Artificial & Agentes Mestres | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function SuperadminAiPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const config = await getSuperadminAiConfigAction();
  const templates = await getSuperadminTemplatesAction();
  const securityStats = await getSuperadminSecurityAuditAction();

  return (
    <>
      <SuperadminAiClient
        initialConfig={config}
        initialTemplates={templates}
        securityStats={securityStats}
      />
    </>
  );
}
