"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Settings, MessageSquare, Briefcase, Zap, Boxes, Link as LinkIcon, CreditCard } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { BottomNav } from "@/components/dashboard/bottom-nav";

// Toda a estrutura de menu (esqueleto) mapeando funcionalidades do SaaS
const navigation = [
  { name: "Visão Geral", href: "/", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: MessageSquare },
  { name: "CRM", href: "/crm", icon: Briefcase },
  { name: "Campanhas", href: "/campaigns", icon: Zap },
  { name: "Catálogo", href: "/catalog", icon: Boxes },
  { name: "Automações", href: "/automations", icon: Zap },
  { name: "Contatos", href: "/users", icon: Users },
  { name: "Integrações", href: "/integrations", icon: LinkIcon },
  { name: "Faturamento", href: "/billing", icon: CreditCard },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--color-surface-50)] text-[var(--color-ink-900)]">
      
      {/* Desktop Sidebar */}
      <Sidebar 
        navigation={navigation}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        tenantName="Minha Empresa"
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out md:pb-0 pb-[64px] ${
          collapsed ? "md:pl-[72px]" : "md:pl-[256px]"
        }`}
      >
        <Header />

        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="mx-auto max-w-6xl w-full h-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Visible only on md:hidden) */}
      <BottomNav navigation={navigation.slice(0, 5)} /> {/* Mostramos apenas 5 icones principais no mobile */}
    </div>
  );
}
