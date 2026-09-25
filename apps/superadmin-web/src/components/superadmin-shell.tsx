import React from "react";
import { auth, signOut } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { SuperadminCurvedSidebar } from "./superadmin-curved-sidebar";
import { SuperadminTopNavbar } from "./superadmin-top-navbar";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export async function SuperadminShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex font-sans antialiased text-[#0F172A]">
      {/* Menu Lateral Estilo Dock com Curvas Orgânicas e Animação */}
      <SuperadminCurvedSidebar
        userName={session.user.name || "SuperAdmin"}
        userEmail={session.user.email || "admin@bipesend.com.br"}
        onLogout={logoutAction}
      />

      {/* Área Central / Canvas de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <SuperadminTopNavbar
          userName={session.user.name || "SuperAdmin"}
          userEmail={session.user.email || "admin@bipesend.com.br"}
          onLogout={logoutAction}
        />
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
