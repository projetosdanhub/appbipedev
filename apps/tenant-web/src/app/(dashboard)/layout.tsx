"use client";

import { useState, useEffect } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsFullscreen(window.location.search.includes("fullscreen=true"));
    }
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--color-surface-50)] text-[var(--color-ink-900)]">
      
      {/* Desktop Sidebar */}
      {!isFullscreen && (
        <Sidebar 
          navigation={navigation}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          tenantName="Minha Empresa"
        />
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out md:pb-0 pb-[64px] ${
          isFullscreen ? "md:pl-0" : (collapsed ? "md:pl-[72px]" : "md:pl-[256px]")
        }`}
      >
        {!isFullscreen && <Header />}

        <div className="flex-1 overflow-hidden">
          <div className="w-full h-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isFullscreen && <BottomNav navigation={navigation.slice(0, 5)} />}
    </div>
  );
}
