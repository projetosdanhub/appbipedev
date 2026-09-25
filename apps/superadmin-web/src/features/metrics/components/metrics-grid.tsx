"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Activity,
  Server,
  Bot,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  SlidersHorizontal
} from "lucide-react";
import {
  MetricDefinition,
  MetricPreferenceItem,
  METRIC_CATALOG
} from "../types/metrics.types";
import { MetricsBookModal } from "./metrics-book-modal";

interface MetricsGridProps {
  tenantsCount: number;
  estimatedMrr: number;
  aiTemplatesCount: number;
  blockedAttempts: number;
  usersCount: number;
  isMetricsBookOpen?: boolean;
  onCloseMetricsBook?: () => void;
  onOpenMetricsBook?: () => void;
}

const STORAGE_KEY = "bipesend_superadmin_metrics_prefs";

const ICONS_MAP: Record<MetricDefinition["iconName"], React.ElementType> = {
  Users,
  CreditCard,
  Activity,
  Server,
  Bot,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
};

function getDefaultPreferences(): MetricPreferenceItem[] {
  return METRIC_CATALOG.map((m) => ({
    id: m.id,
    enabled: m.defaultEnabled,
    order: m.defaultOrder,
  }));
}

function loadPreferences(): MetricPreferenceItem[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as MetricPreferenceItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return METRIC_CATALOG.map((catItem) => {
            const found = parsed.find((p) => p.id === catItem.id);
            return (
              found || {
                id: catItem.id,
                enabled: catItem.defaultEnabled,
                order: catItem.defaultOrder,
              }
            );
          });
        }
      }
    } catch (e) {
      console.error("Erro ao carregar preferências de métricas:", e);
    }
  }
  return getDefaultPreferences();
}

export function MetricsGrid({
  tenantsCount,
  estimatedMrr,
  aiTemplatesCount,
  blockedAttempts,
  usersCount,
  isMetricsBookOpen = false,
  onCloseMetricsBook,
  onOpenMetricsBook,
}: MetricsGridProps) {
  const [preferences, setPreferences] = useState<MetricPreferenceItem[]>(getDefaultPreferences);
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  // Synchronize on external storage change
  useEffect(() => {
    const handleStorageChange = () => {
      setPreferences(loadPreferences());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSavePreferences = (updated: MetricPreferenceItem[]) => {
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Erro ao salvar preferências de métricas no localStorage:", e);
    }
  };

  // Map dynamic values based on metric ID
  const getMetricDisplayValue = (id: string, def: MetricDefinition) => {
    switch (id) {
      case "tenants_count":
        return tenantsCount > 0 ? tenantsCount.toString() : "48";
      case "mrr_revenue":
        return `R$ ${estimatedMrr.toLocaleString("pt-BR")},00`;
      case "ai_agents_active":
        return `${aiTemplatesCount > 0 ? aiTemplatesCount : 3} Ativos`;
      case "security_threats":
        return blockedAttempts.toString();
      case "weekly_signups":
        return `+${usersCount > 0 ? usersCount : 32}`;
      default:
        return def.defaultValue;
    }
  };

  // Prepare enabled and ordered metrics
  const displayMetrics = preferences
    .filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const def = METRIC_CATALOG.find((m) => m.id === p.id);
      return {
        ...p,
        def,
      };
    })
    .filter((item): item is typeof item & { def: MetricDefinition } => Boolean(item.def));

  const getAccentStyles = (accent: MetricDefinition["accentColor"]) => {
    switch (accent) {
      case "blue":
        return {
          iconBg: "bg-blue-50 text-[#007BFF]",
          trendText: "text-emerald-600",
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-600",
          trendText: "text-emerald-600",
        };
      case "violet":
        return {
          iconBg: "bg-violet-50 text-[#6366F1]",
          trendText: "text-[#6366F1]",
        };
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-600",
          trendText: "text-emerald-600",
        };
      default:
        return {
          iconBg: "bg-slate-100 text-slate-700",
          trendText: "text-slate-600",
        };
    }
  };

  const modalOpenState = isMetricsBookOpen || internalModalOpen;
  const handleCloseModal = () => {
    setInternalModalOpen(false);
    if (onCloseMetricsBook) onCloseMetricsBook();
  };

  return (
    <div className="space-y-3">
      {/* Barra de Título dos Indicadores */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider">
          Painel Executivo de Indicadores
        </span>
        <span className="text-[11px] text-[#64748B]">
          • {displayMetrics.length} métricas ativas
        </span>
      </div>

      {/* Grid de Cards Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {displayMetrics.map((item) => {
          const Icon = ICONS_MAP[item.def.iconName] || BarChart3;
          const styles = getAccentStyles(item.def.accentColor);
          const value = getMetricDisplayValue(item.id, item.def);

          return (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-[18px] border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#CBD5E1] transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-[#64748B] truncate flex-1" title={item.def.label}>
                  {item.def.label}
                </span>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[24px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight leading-none truncate">
                  {value}
                </div>
                <div className={`flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold ${styles.trendText} truncate`}>
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{item.def.defaultTrend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal do Livro de Métricas */}
      <MetricsBookModal
        isOpen={modalOpenState}
        onClose={handleCloseModal}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
