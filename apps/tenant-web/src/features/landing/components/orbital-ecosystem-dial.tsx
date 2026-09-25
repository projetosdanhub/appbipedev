"use client";

import React from "react";
import {
  Kanban,
  MessageSquare,
  Bot,
  Send,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

export type EcosystemModuleId = "crm_plus" | "inbox" | "ai_train" | "campaigns" | "mobile";

interface ModuleDefinition {
  id: EcosystemModuleId;
  label: string;
  shortLabel: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  angleDeg: number;
}

const MODULES: ModuleDefinition[] = [
  {
    id: "crm_plus",
    label: "CRM Bipe Plus",
    shortLabel: "CRM Plus",
    tagline: "Funil de Vendas & VGV",
    icon: Kanban,
    color: "#007BFF",
    glowColor: "rgba(0, 123, 255, 0.4)",
    angleDeg: 270, // Top
  },
  {
    id: "inbox",
    label: "Inbox Omnichannel",
    shortLabel: "Inbox",
    tagline: "WhatsApp, Insta & TikTok",
    icon: MessageSquare,
    color: "#6366F1",
    glowColor: "rgba(99, 102, 241, 0.4)",
    angleDeg: 342, // Top-Right
  },
  {
    id: "ai_train",
    label: "Sua Agente de IA",
    shortLabel: "Agente IA",
    tagline: "Voz Real & Áudios 24/7",
    icon: Bot,
    color: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 0.4)",
    angleDeg: 54, // Bottom-Right
  },
  {
    id: "campaigns",
    label: "Disparos em Massa",
    shortLabel: "Disparos",
    tagline: "Anti-bloqueio Seguro",
    icon: Send,
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    angleDeg: 126, // Bottom-Left
  },
  {
    id: "mobile",
    label: "App Mobile",
    shortLabel: "App Mobile",
    tagline: "Notificações & Push",
    icon: Smartphone,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.4)",
    angleDeg: 198, // Top-Left
  },
];

interface OrbitalEcosystemDialProps {
  activeModule: EcosystemModuleId;
  onSelectModule: (id: EcosystemModuleId) => void;
}

export function OrbitalEcosystemDial({ activeModule, onSelectModule }: OrbitalEcosystemDialProps) {
  const currentModule = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <div className="w-full flex flex-col items-center mb-8">
      
      {/* ── CÍRCULO GIRATÓRIO ORBITAL GEOMÉTRICO (Desktop & Tablet) ── */}
      <div className="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] hidden md:flex items-center justify-center my-4 select-none">
        
        {/* Anel de Órbita Externo com Efeito Tracejado */}
        <div className="absolute inset-0 rounded-full border border-slate-300/80 [border-dasharray:6_6] pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-blue-500/15 pointer-events-none animate-spin [animation-duration:60s] [border-style:dashed]" />
        <div className="absolute inset-10 rounded-full border border-indigo-500/20 pointer-events-none" />

        {/* Linhas Geométricas Sutis em Cruz */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none" />
        <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-slate-300/60 to-transparent pointer-events-none" />

        {/* Feixe Conector Dinâmico para o Módulo Ativo */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 380 380">
          <defs>
            <linearGradient id="beamGradient" x1="190" y1="190" x2={190 + 130 * Math.cos((currentModule.angleDeg * Math.PI) / 180)} y2={190 + 130 * Math.sin((currentModule.angleDeg * Math.PI) / 180)} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#007BFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line
            x1="190"
            y1="190"
            x2={190 + 130 * Math.cos((currentModule.angleDeg * Math.PI) / 180)}
            y2={190 + 130 * Math.sin((currentModule.angleDeg * Math.PI) / 180)}
            stroke="url(#beamGradient)"
            strokeWidth="3"
            strokeDasharray="4 3"
            className="animate-pulse"
          />
          <circle
            cx={190 + 130 * Math.cos((currentModule.angleDeg * Math.PI) / 180)}
            cy={190 + 130 * Math.sin((currentModule.angleDeg * Math.PI) / 180)}
            r="6"
            fill="#6366F1"
            className="animate-ping"
          />
        </svg>

        {/* NÚCLEO CENTRAL: HUB DE OPERAÇÕES BIPESEND */}
        <div className="relative z-20 w-28 h-28 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-2 border-slate-700/80 shadow-[0_10px_35px_rgba(15,23,42,0.35)] flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white mb-1 shadow-md shadow-blue-500/30">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[10px] font-extrabold text-white font-inter tracking-tight uppercase leading-tight">
            Bipe Core
          </span>
          <span className="text-[8.5px] text-blue-300 font-mono">
            Hub 24 Horas
          </span>
        </div>

        {/* NÓS ORBITAIS (5 Módulos Interativos) */}
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = mod.id === activeModule;
          const radius = 130; // Raio em pixels
          const angleRad = (mod.angleDeg * Math.PI) / 180;
          const x = 190 + radius * Math.cos(angleRad) - 30; // Centro do nó (60px largura / 2 = 30)
          const y = 190 + radius * Math.sin(angleRad) - 30; // Centro do nó (60px altura / 2 = 30)

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`absolute z-30 w-15 h-15 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${
                isActive
                  ? "bg-white border-2 scale-110 shadow-lg"
                  : "bg-white/95 hover:bg-white border border-slate-200/90 shadow-sm hover:scale-105"
              }`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                borderColor: isActive ? mod.color : undefined,
                boxShadow: isActive ? `0 8px 25px ${mod.glowColor}` : undefined,
              }}
              title={`Selecionar ${mod.label}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                }`}
                style={{
                  backgroundColor: isActive ? mod.color : "#F1F5F9",
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[8.5px] font-bold mt-1 font-inter truncate max-w-[54px] ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}>
                {mod.shortLabel}
              </span>
            </button>
          );
        })}

      </div>

      {/* ── BARRA FACETADA GEOMÉTRICA DE CONTROLE (Mobile & Desktop Acessível) ── */}
      <div
        role="tablist"
        aria-label="Módulos do Ecossistema BipeSend"
        className="w-full max-w-4xl bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 flex items-center justify-start sm:justify-between gap-1.5 shadow-2xs overflow-x-auto scrollbar-none"
      >
        {MODULES.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onSelectModule(tab.id)}
              className={`flex-1 shrink-0 sm:shrink min-w-[125px] sm:min-w-0 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0 ${
                  isActive ? "text-white" : "text-slate-500"
                }`}
                style={{
                  backgroundColor: isActive ? tab.color : "transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{tab.label}</span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
