"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  BookOpen
} from "lucide-react";
import { MetricsBookModal } from "@/features/metrics/components/metrics-book-modal";
import { MetricPreferenceItem, METRIC_CATALOG } from "@/features/metrics/types/metrics.types";

interface DashboardSecondaryHeaderProps {
  userName: string;
}

const STORAGE_KEY = "bipesend_superadmin_metrics_prefs";

export function DashboardSecondaryHeader({ userName }: DashboardSecondaryHeaderProps) {
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<MetricPreferenceItem[]>(() => {
    return METRIC_CATALOG.map((m) => ({
      id: m.id,
      enabled: m.defaultEnabled,
      order: m.defaultOrder,
    }));
  });

  const handleSavePreferences = (updated: MetricPreferenceItem[]) => {
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom storage event so MetricsGrid updates instantly
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Erro ao salvar preferências de métricas:", e);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        {/* Saudação e Contexto da Página */}
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-inter">
            Olá, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Centro de comando global, governança unificada e métricas da plataforma BipeSend.
          </p>
        </div>

        {/* Ações Rápidas & Livro de Métricas */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsMetricsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#007BFF] hover:text-[#007BFF] px-3.5 py-2 rounded-xl text-xs sm:text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer"
            title="Personalizar quais métricas exibir e a ordem de prioridade"
          >
            <BookOpen className="w-4 h-4 text-[#007BFF]" />
            <span>Livro de Métricas</span>
          </button>

          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-[12.5px] font-semibold shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Criar Novo Plano</span>
          </Link>

          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-[12.5px] font-semibold transition-all hover:border-[#007BFF] hover:text-[#007BFF] shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#6366F1]" />
            <span>Estúdio de IA</span>
          </Link>
        </div>
      </div>

      <MetricsBookModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />
    </>
  );
}

export { DashboardSecondaryHeader as DashboardActionBar };
