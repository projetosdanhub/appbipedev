"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Puzzle, 
  CreditCard, 
  ChevronDown,
  Bot,
  PanelLeft,
  X,
  ShieldCheck,
  ExternalLink,
  Globe,
} from "lucide-react";
import { BrandLogo } from "@bipesend/ui";
import { AdminProfileModal } from "@/features/profile/components/admin-profile-modal";
import { GermaniCopilotDrawer } from "@/features/ai/components/germani-copilot-drawer";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral, métricas de crescimento e saúde do ecossistema",
  },
  {
    label: "Planos",
    href: "/plans",
    icon: CreditCard,
    badge: "CRM",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description: "Gestão de planos, precificação, limites de uso e assinantes",
  },
  {
    label: "Integrações",
    href: "/integrations",
    icon: Puzzle,
    badge: "APIs",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Conexão de APIs oficiais (Gemini, OpenAI, BipeSend WhatsApp API)",
  },
  {
    label: "IA & Agentes",
    href: "/ai",
    icon: Sparkles,
    badge: "Voz",
    badgeColor: "bg-violet-100 text-violet-700",
    description: "Modelos globais de IA, síntese de voz e orquestração de agentes",
  },
  {
    label: "Germani",
    href: "/germani",
    icon: Bot,
    badge: "C-Level",
    badgeColor: "bg-indigo-100 text-indigo-700",
    description: "Assessora executiva pessoal, calibração, habilidades e governança",
  },
  {
    label: "Editor do Site",
    href: "/site-editor",
    icon: Globe,
    badge: "Live",
    badgeColor: "bg-amber-100 text-amber-700",
    description: "Personalização visual em tempo real estilo Elementor Pro e visualização mobile/desktop",
  },
];

interface SuperadminHeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => Promise<void>;
}

export function SuperadminHeader({
  userName = "SuperAdmin",
  userEmail = "admin@bipesend.com.br",
  onLogout,
}: SuperadminHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentName, setCurrentName] = useState(userName);
  const [currentAvatarBg, setCurrentAvatarBg] = useState("from-[#007BFF] to-[#6366F1]");

  // Fechar menu ao pressionar Escape ou clicar fora
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuPanelRef.current &&
        !menuPanelRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Fechar menu automaticamente ao navegar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-[64px] flex items-center justify-between gap-3 sm:gap-4 relative">
          
          {/* ── LADO ESQUERDO: Logotipo BipeSend + Badge SuperAdmin ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center transition-opacity hover:opacity-90 flex-shrink-0" 
              title="BipeSend Plataforma Central"
            >
              <BrandLogo width={124} />
            </Link>
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-wider uppercase bg-[#EBF3FF] text-[#007BFF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
              SuperAdmin
            </span>
          </div>

          {/* ── CENTRO: Navegação Principal Desktop (Visível em Telas Médias e Grandes) ── */}
          <nav className="hidden xl:flex items-center gap-1.5 flex-shrink-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#007BFF] text-white shadow-xs"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeColor || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── LADO DIREITO: Menu Mobile + Germani Assessora + Perfil do Administrador ── */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 z-10">
            {/* Botão de menu responsivo para telas menores */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Recolher menu de navegação" : "Expandir menu de navegação"}
              aria-expanded={isMenuOpen}
              className={`xl:hidden flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-300 ${
                isMenuOpen
                  ? "bg-blue-50/90 border-[#007BFF] text-[#007BFF] shadow-[0_0_0_2px_rgba(0,123,255,0.18)]"
                  : "bg-white border-[#E2E8F0] text-[#475569] hover:text-[#007BFF] hover:border-[#007BFF] hover:bg-[#F8FAFC] shadow-2xs"
              }`}
              title={isMenuOpen ? "Recolher menu de navegação" : "Expandir menu de navegação"}
            >
              <PanelLeft
                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                  isMenuOpen
                    ? "rotate-180 text-[#007BFF]"
                    : "text-[#64748B] hover:rotate-[25deg] hover:scale-105 hover:text-[#007BFF]"
                }`}
                aria-hidden="true"
              />
            </button>

            <GermaniCopilotDrawer />

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="group flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-transparent hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all text-left"
              title="Abrir Perfil e Configurações do Administrador"
              aria-label="Abrir Perfil do Administrador"
            >
              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr ${currentAvatarBg} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform`}>
                  {currentName ? currentName.slice(0, 2).toUpperCase() : "SA"}
                </div>
                <span 
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" 
                  title="Sessão ativa com 2FA" 
                />
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-[12.5px] font-bold text-[#0F172A] leading-tight flex items-center gap-1.5 group-hover:text-[#007BFF] transition-colors">
                  <span className="truncate max-w-[130px]">{currentName}</span>
                  <span className="text-[9.5px] bg-blue-50 text-[#007BFF] font-semibold px-1 py-0.2 rounded border border-blue-200">
                    2FA
                  </span>
                </span>
                <span className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                  {userEmail}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0F172A] transition-colors hidden sm:block" />
            </button>
          </div>

        </div>
      </header>

      {/* ── MENU DE NAVEGAÇÃO EXPANSÍVEL (RESPONSIVO PARA MOBILE / TABLET) ── */}
      {isMenuOpen && (
        <div
          ref={menuPanelRef}
          className="xl:hidden fixed top-[68px] right-3 sm:right-6 w-[320px] sm:w-[360px] bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          aria-label="Menu de navegação do SuperAdmin"
        >
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-inter">
                Módulos do Sistema
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                SuperAdmin
              </span>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#007BFF] to-[#1E60F8] text-white shadow-[0_2px_8px_rgba(0,123,255,0.22)]"
                        : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#007BFF]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? "bg-white/25 text-white"
                                : item.badgeColor || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className={`text-[11px] leading-tight line-clamp-1 ${
                            isActive ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
      )}

      {/* Modal Refinado de Perfil do Administrador */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout}
        currentUserName={currentName}
        currentUserEmail={userEmail}
        onProfileUpdated={(newName, newImage) => {
          setCurrentName(newName);
          if (newImage && newImage.startsWith("from-")) {
            setCurrentAvatarBg(newImage);
          }
        }}
      />
    </>
  );
}
