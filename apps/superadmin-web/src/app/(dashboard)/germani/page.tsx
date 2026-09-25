import React from "react";
import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { getGermaniConfigAction } from "@/features/ai/actions/superadmin-ai.actions";
import { GermaniConfigPanel } from "@/features/ai/components/germani-config-panel";

export const metadata = {
  title: "Assessora Germani — Configurações & Governança | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function GermaniConfigPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const germaniConfig = await getGermaniConfigAction();

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      <GermaniConfigPanel initialConfig={germaniConfig} />
    </main>
  );
}
