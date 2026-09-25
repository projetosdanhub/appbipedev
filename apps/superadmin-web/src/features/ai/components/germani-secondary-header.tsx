"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";

export function GermaniSecondaryHeader() {
  return (
    <div className="w-full bg-white border-b border-[#E2E8F0] shadow-2xs font-sans">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Identidade, Status da Assessora & Breadcrumb com Tipografia Refinada */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#007BFF] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SuperAdmin</span>
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs text-slate-400 font-normal">Inteligência Artificial</span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Assessora Executiva C-Level Ativa
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-2xs">
              <img
                src="/assets/brand/germani-avatar.jpg"
                alt="Germani"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[21px] font-semibold text-slate-800 font-inter tracking-tight">
                Assessoria Executiva & Governança — Germani
              </h1>
              <p className="text-[12px] sm:text-[12.5px] text-slate-500 font-normal">
                Calibração em tempo real de habilidades especialistas, cotas de tokens, motor de inferência e guardrails constitucionais.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Governança & Ações Rápidas com Fontes Mais Leves */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div
            className="inline-flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-medium"
            title="Guardrails constitucionais ativos: blindagem de código, zero SQL injection e anti-conflito de interesses"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>5 Guardrails Ativos</span>
          </div>

          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-2xs"
            title="Acessar o catálogo de Modelos Mestres globais de IA para os clientes"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Modelos Mestres</span>
          </Link>

          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-2xs"
            title="Acessar Loja de Integrações & Conexão de APIs (Google Gemini, OpenAI, WhatsApp)"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Chaves de API & Integrações</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
