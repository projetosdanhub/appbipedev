"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PanelLeft, 
  X, 
  ShieldCheck, 
  LayoutDashboard, 
  CreditCard, 
  Puzzle, 
  Sparkles, 
  Bot, 
  Globe,
  Settings,
  LogOut,
} from "lucide-react";
import { BrandLogo } from "@bipesend/ui";
import { GermaniCopilotDrawer } from "@/features/ai/components/germani-copilot-drawer";
import { SuperadminNotificationsMenu } from "./superadmin-notifications-menu";

interface SuperadminTopNavbarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => Promise<void>;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Planos & Assinaturas",
    href: "/plans",
    icon: CreditCard,
  },
  {
    label: "Integrações & APIs",
    href: "/integrations",
    icon: Puzzle,
  },
  {
    label: "IA & Síntese de Voz",
    href: "/ai",
    icon: Sparkles,
  },
  {
    label: "Germani Copilot",
    href: "/germani",
    icon: Bot,
  },
  {
    label: "Editor do Site",
    href: "/site-editor",
    icon: Globe,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function SuperadminTopNavbar({
  userName = "SuperAdmin",
  userEmail = "admin@bipesend.com.br",
  onLogout,
}: SuperadminTopNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mapear o título atual da página e contexto de navegação
  const { title, category } = React.useMemo(() => {
    if (pathname === "/") return { title: "Visão Geral da Plataforma", category: "Dashboard" };
    if (pathname.startsWith("/plans")) return { title: "Planos & Assinaturas", category: "Comercial" };
    if (pathname.startsWith("/integrations")) return { title: "Loja de Integrações & Conectores", category: "APIs & Conexões" };
    if (pathname.startsWith("/ai")) return { title: "Estúdio de IA & Agentes Mestres", category: "Inteligência Artificial" };
    if (pathname.startsWith("/germani")) return { title: "Assessora Executiva Germani", category: "Inteligência Artificial" };
    if (pathname.startsWith("/site-editor")) return { title: "Editor da Landing Page", category: "Marketing" };
    if (pathname.startsWith("/settings")) return { title: "Configurações & Identidade do Painel", category: "Sistema & Identidade" };
    return { title: "SuperAdmin", category: "Painel" };
  }, [pathname]);

  return (
    <>
      <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
        
        {/* LADO ESQUERDO: Mobile Toggle + Título da Página / Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Botão de menu exclusivo para telas mobile (< md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#007BFF] hover:border-[#007BFF] transition-all shadow-xs cursor-pointer"
            aria-label="Abrir Menu Mobile"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Logo visível em telas mobile */}
          <div className="md:hidden flex items-center gap-2">
            <BrandLogo width={110} />
          </div>

          {/* Breadcrumb e Título no Desktop */}
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 font-inter">
              <span>BipeSend</span>
              <span>/</span>
              <span className="text-slate-500 font-medium">SuperAdmin</span>
              <span>/</span>
              <span className="text-[#007BFF] font-semibold">{category}</span>
            </div>
            <h2 className="text-base font-black text-[#0F172A] tracking-tight font-inter">
              {title}
            </h2>
          </div>
        </div>

        {/* LADO DIREITO: Sino de Notificações/Status + Divisor + Germani Copilot Integrada */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sino de Notificações com Status Interativo dos Sistemas */}
          <SuperadminNotificationsMenu />

          {/* Divisor vertical sutil */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Germani Copilot Integrada Organicamente */}
          <GermaniCopilotDrawer />
        </div>
      </header>

      {/* GAVETA / DRAWER MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#0F172A] text-white p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <BrandLogo width={120} />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-5 space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[#007BFF] text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white font-bold text-xs">
                  {userName ? userName.slice(0, 2).toUpperCase() : "SA"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{userName}</span>
                  <span className="text-[10px] text-slate-400">SuperAdmin</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
