import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { getSuperadminAiConfigAction } from "@/features/ai/actions/superadmin-ai.actions";
import { AiIntegrationsAppStore } from "@/features/ai/components/ai-integrations-app-store";

export const metadata = {
  title: "Loja de Integrações & APIs | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const config = await getSuperadminAiConfigAction();

  return (
    <>
      <AiIntegrationsAppStore initialConfig={config} />
    </>
  );
}
