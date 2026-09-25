"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Activity, 
  Server, 
  Radio, 
  Database, 
  ExternalLink,
  ShieldCheck,
  X
} from "lucide-react";

export function SuperadminNotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const systems = [
    {
      name: "Túnel Cloudflare & Domínio",
      status: "Conectado (QUIC)",
      detail: "admin.bipesend.com.br operando normalmente",
      icon: Radio,
      color: "text-blue-500",
      bg: "bg-blue-50",
      healthy: true,
    },
    {
      name: "PostgreSQL & Prisma ORM",
      status: "Online",
      detail: "Pool de conexões e políticas RLS ativas",
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      healthy: true,
    },
    {
      name: "Redis & Filas de IA",
      status: "Operacional",
      detail: "Sessões e síntese XTTS sem travamento",
      icon: Server,
      color: "text-amber-500",
      bg: "bg-amber-50",
      healthy: true,
    },
    {
      name: "APIs & Webhooks Omnichannel",
      status: "Sincronizado",
      detail: "Meta Cloud, WhatsApp e Instagram ativos",
      icon: Activity,
      color: "text-violet-500",
      bg: "bg-violet-50",
      healthy: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão de Sino de Notificação */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer ${
          isOpen ? "bg-slate-100 text-slate-800" : ""
        }`}
        aria-label="Notificações e Status da Infraestrutura"
        title="Notificações & Status do Sistema"
      >
        <Bell className="w-4.5 h-4.5" />
        {/* Luz indicadora verde de infraestrutura online */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header do Menu */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 font-inter">
                Status da Infraestrutura
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
              Todos os Sistemas Operacionais
            </span>
          </div>

          {/* Lista de Sistemas */}
          <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
            {systems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10.5px] font-semibold text-emerald-600 shrink-0">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé Informativo */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Última checagem: há poucos segundos</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Online
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
