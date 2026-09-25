"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Puzzle,
  Sparkles,
  Bot,
  Globe,
  Settings,
  LogOut,
} from "lucide-react";
import { AdminProfileModal } from "@/features/profile/components/admin-profile-modal";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: Home,
    description: "Visão geral, métricas de crescimento e ecossistema",
  },
  {
    id: "plans",
    label: "Planos & Assinaturas",
    href: "/plans",
    icon: CreditCard,
    badge: "CRM",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
    description: "Precificação, limites de consumo e assinantes",
  },
  {
    id: "integrations",
    label: "Integrações & APIs",
    href: "/integrations",
    icon: Puzzle,
    badge: "APIs",
    badgeColor: "bg-blue-500/20 text-blue-300",
    description: "Meta Cloud, Evolution, Cloudflare R2 e Webhooks",
  },
  {
    id: "ai",
    label: "IA & Síntese de Voz",
    href: "/ai",
    icon: Sparkles,
    badge: "Voz",
    badgeColor: "bg-violet-500/20 text-violet-300",
    description: "Modelos neurais globais e clonagem de voz XTTS",
  },
  {
    id: "germani",
    label: "Germani Copilot",
    href: "/germani",
    icon: Bot,
    badge: "IA",
    badgeColor: "bg-indigo-500/20 text-indigo-300",
    description: "Assessora executiva pessoal e governança",
  },
  {
    id: "site-editor",
    label: "Editor do Site",
    href: "/site-editor",
    icon: Globe,
    badge: "Live",
    badgeColor: "bg-amber-500/20 text-amber-300",
    description: "Editor visual Elementor em tempo real",
  },
  {
    id: "settings",
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    badge: "Geral",
    badgeColor: "bg-slate-500/20 text-slate-300",
    description: "Favicon, título da aba, identidade e acessibilidade",
  },
];

interface SuperadminCurvedSidebarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => Promise<void>;
}

export function SuperadminCurvedSidebar({
  userName = "SuperAdmin",
  userEmail = "admin@bipesend.com.br",
  onLogout,
}: SuperadminCurvedSidebarProps) {
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  // Efeito de iluminação dinâmica (Spotlight Cursor)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!asideRef.current) return;
    const rect = asideRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Determinar qual item está ativo baseado no pathname
  const activeIndex = useMemo(() => {
    const idx = NAV_ITEMS.findIndex((item) => {
      if (item.href === "/") {
        return pathname === "/";
      }
      return pathname === item.href || pathname.startsWith(item.href + "/");
    });
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  const ITEM_HEIGHT = 58;

  return (
    <>
      <aside
        ref={asideRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="hidden md:flex flex-col items-center justify-between sticky top-0 left-0 h-screen min-h-screen w-[74px] rounded-none bg-[#0F172A] border-r border-slate-800/80 shadow-[6px_0_30px_rgba(0,0,0,0.25)] py-6 z-40 select-none flex-shrink-0 relative overflow-hidden transition-all duration-300"
        aria-label="Menu Lateral do SuperAdmin"
      >
        {/* ── SPOTLIGHT RADIAL DINÂMICO QUE SEGUE O PONTEIRO DO MOUSE (FEIXE DE LUZ) ── */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 123, 255, 0.28) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)`,
          }}
          aria-hidden="true"
        />

        {/* ── TOP: Logo Avatar Oficial BipeSend com Luz de Fundo Especular ── */}
        <div className="relative z-20 flex flex-col items-center">
          <Link
            href="/"
            className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            title="BipeSend SuperAdmin"
          >
            {/* Luz de fundo radial idêntica ao feixe do menu (Halo Especular com Glow) */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500 blur-md group-hover:blur-xl group-hover:scale-110"
              style={{
                background: "radial-gradient(circle, rgba(0, 123, 255, 0.42) 0%, rgba(99, 102, 241, 0.22) 48%, transparent 75%)",
              }}
              aria-hidden="true"
            />

            {/* Cápsula de brilho sutil com borda iluminada idêntica aos itens do menu */}
            <div
              className="pointer-events-none absolute inset-0.5 rounded-2xl bg-gradient-to-br from-[#007BFF]/20 via-[#6366F1]/15 to-transparent border border-[#007BFF]/30 shadow-[0_0_18px_rgba(0,123,255,0.25)] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(0,123,255,0.45)] group-hover:border-[#007BFF]/50"
              aria-hidden="true"
            />

            {/* Logo Avatar Oficial BipeSend com Chat Branco */}
            <img
              src="/favicon.svg"
              alt="BipeSend Logo Avatar"
              className="relative z-10 w-9 h-9 object-contain rounded-xl drop-shadow-[0_2px_10px_rgba(0,123,255,0.4)] transition-transform duration-300 group-hover:scale-105"
            />

            {/* Tooltip moderno no hover */}
            <div className="absolute left-[84px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-[#0F172A]/95 backdrop-blur-md text-white border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap text-xs font-semibold z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] shadow-[0_0_8px_#007BFF]" />
              <span>BipeSend SuperAdmin</span>
            </div>
          </Link>
        </div>

        {/* ── MIDDLE: Navegação com Cápsula Luminosa Deslizante & Efeito Spotlight ── */}
        <div className="relative z-20 w-full my-auto flex flex-col items-center">
          
          {/* CÁPSULA ATIVA DESLIZANTE COM BRILHO NEON SUTIL */}
          <div
            className="absolute left-2.5 right-2.5 h-[48px] rounded-2xl bg-gradient-to-r from-[#007BFF]/22 via-[#6366F1]/16 to-transparent border border-[#007BFF]/35 shadow-[0_0_20px_rgba(0,123,255,0.2)] pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              transform: `translateY(${activeIndex * ITEM_HEIGHT + (ITEM_HEIGHT - 48) / 2}px)`,
            }}
          >
            {/* Feixe de luz indicador lateral na borda esquerda */}
            <span className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-[#007BFF] to-[#6366F1] shadow-[0_0_12px_#007BFF]" />
          </div>

          {/* LISTA DOS ÍCONES DE NAVEGAÇÃO RIGOROSAMENTE ALINHADOS */}
          <nav className="relative z-20 w-full flex flex-col items-center">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;

              return (
                <div
                  key={item.id}
                  className="relative group w-full flex items-center justify-center"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.06] hover:shadow-[0_0_16px_rgba(0,123,255,0.18)]"
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={`w-[21px] h-[21px] transition-all duration-200 ${
                        isActive
                          ? "stroke-[1.85px] text-[#007BFF] filter drop-shadow-[0_0_8px_rgba(0,123,255,0.7)]"
                          : "stroke-[1.35px] group-hover:stroke-[1.65px] group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                      }`}
                    />
                  </Link>

                  {/* TOOLTIP FLUTUANTE LATERAL NO HOVER */}
                  <div className="absolute left-[84px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-[#0F172A]/95 backdrop-blur-md text-white border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-inter text-white">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || "bg-blue-500/20 text-blue-300"}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans max-w-[200px] truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── BOTTOM: Avatar do Administrador & Botão de Logout ── */}
        <div className="relative z-20 flex flex-col items-center gap-3">
          {/* Avatar do Administrador (Abre Modal de Perfil) */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            title="Perfil do Administrador"
            aria-label="Perfil do Administrador"
          >
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white font-extrabold text-xs shadow-md border-2 border-slate-700 group-hover:border-[#007BFF] group-hover:shadow-[0_0_12px_rgba(0,123,255,0.5)] transition-all">
              {userName ? userName.slice(0, 2).toUpperCase() : "SA"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
            </div>

            {/* Tooltip do Perfil */}
            <div className="absolute left-[80px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-[#0F172A]/95 backdrop-blur-md text-white border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap text-xs font-semibold z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <span>{userName} (SuperAdmin)</span>
            </div>
          </button>

          {/* Botão de Logout */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onLogout();
              }
            }}
            className="group relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] transition-all duration-200"
            title="Encerrar Sessão"
            aria-label="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4 stroke-[1.4px] transition-transform duration-200 group-hover:translate-x-0.5" />

            {/* Tooltip do Logout */}
            <div className="absolute left-[80px] top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-[#0F172A]/95 backdrop-blur-md text-rose-300 border border-rose-900/60 px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap text-xs font-semibold z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <span>Sair da Plataforma</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Modal de Perfil e 2FA do SuperAdmin */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout}
        currentUserName={userName}
        currentUserEmail={userEmail}
      />
    </>
  );
}
