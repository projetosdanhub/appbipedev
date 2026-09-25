import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { getPlatformPlansAction } from "@/features/plans/actions/plans.actions";
import { PlansManagerClient } from "@/features/plans/components/plans-manager-client";

export const metadata = {
  title: "Planos & Assinaturas | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function PlansPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const plans = await getPlatformPlansAction();

  return <PlansManagerClient initialPlans={plans} />;
}
