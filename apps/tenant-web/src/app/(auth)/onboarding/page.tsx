import { Metadata } from "next";
import { auth } from "@bipesend/auth";
import { prisma } from "@bipesend/db";
import { redirect } from "next/navigation";
import OnboardingPage from "./onboarding-client";

export const metadata: Metadata = {
  title: "Configure seu Workspace - BipeSend",
  description: "Configure sua área de trabalho no BipeSend",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (membership) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyName: true },
  });

  return <OnboardingPage initialWorkspaceName={user?.companyName || ""} />;
}

