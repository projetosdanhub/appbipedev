import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/features/workspace/dashboard-shell";
import { getWorkspaceUser } from "@/features/workspace/server/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: "Workspace | BipeSend", template: "%s | BipeSend" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getWorkspaceUser();
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </Suspense>
  );
}
