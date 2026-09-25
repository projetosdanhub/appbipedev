import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { getPanelSettingsAction } from "@/features/settings/actions/panel-settings.actions";
import { PanelSettingsClient } from "@/features/settings/components/panel-settings-client";

export const metadata = {
  title: "Configurações & Identidade do Painel | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const settings = await getPanelSettingsAction();

  return <PanelSettingsClient initialSettings={settings} />;
}
