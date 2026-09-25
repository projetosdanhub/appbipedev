"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Check,
  RotateCcw,
  Sparkles,
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
  BarChart3
} from "lucide-react";
import {
  MetricDefinition,
  MetricPreferenceItem,
  METRIC_CATALOG,
  MetricCategory
} from "../types/metrics.types";

interface MetricsBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: MetricPreferenceItem[];
  onSavePreferences: (updated: MetricPreferenceItem[]) => void;
}

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

export function MetricsBookModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}: MetricsBookModalProps) {
  const [localPreferences, setLocalPreferences] = useState<MetricPreferenceItem[]>(preferences);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"ALL" | MetricCategory>("ALL");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build sorted list of items combining catalog definition with local preference
  const itemsWithMeta = localPreferences
    .map((pref) => {
      const def = METRIC_CATALOG.find((m) => m.id === pref.id);
      return {
        ...pref,
        def,
      };
    })
    .filter((item): item is typeof item & { def: MetricDefinition } => Boolean(item.def))
    .sort((a, b) => a.order - b.order);

  const filteredItems = itemsWithMeta.filter((item) => {
    if (activeCategoryFilter === "ALL") return true;
    return item.def.category === activeCategoryFilter;
  });

  const handleToggle = (id: string) => {
    setLocalPreferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const currentIndex = itemsWithMeta.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itemsWithMeta.length) return;

    const newSorted = [...itemsWithMeta];
    const [movedItem] = newSorted.splice(currentIndex, 1);
    newSorted.splice(targetIndex, 0, movedItem);

    // Re-assign order based on new array index
    const updatedPreferences: MetricPreferenceItem[] = newSorted.map((item, idx) => ({
      id: item.id,
      enabled: item.enabled,
      order: idx + 1,
    }));

    setLocalPreferences(updatedPreferences);
  };

  const handleSave = () => {
    onSavePreferences(localPreferences);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    const defaultPrefs: MetricPreferenceItem[] = METRIC_CATALOG.map((m) => ({
      id: m.id,
      enabled: m.defaultEnabled,
      order: m.defaultOrder,
    }));
    setLocalPreferences(defaultPrefs);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-[28px] border border-[#CBD5E1] shadow-[0_28px_70px_rgba(0,123,255,0.18)] w-full max-w-[780px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="metrics-book-title"
      >
        {/* ── Topo do Modal ── */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="metrics-book-title" className="text-[17px] font-extrabold text-[#0F172A] leading-tight">
                Livro de Métricas da Plataforma
              </h2>
              <p className="text-[12.5px] text-[#64748B]">
                Escolha quais KPIs ativar no painel e ajuste a ordem de prioridade
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Filtros por Categoria ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#E2E8F0] bg-white gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {(["ALL", "essential", "important", "optional"] as const).map((cat) => {
              const label =
                cat === "ALL"
                  ? "Todas as Métricas"
                  : cat === "essential"
                  ? "Essenciais"
                  : cat === "important"
                  ? "Importantes"
                  : "Opcionais";

              const count =
                cat === "ALL"
                  ? itemsWithMeta.length
                  : itemsWithMeta.filter((i) => i.def.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${
                    activeCategoryFilter === cat
                      ? "bg-[#0F172A] text-white shadow-sm"
                      : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#007BFF] transition-colors"
            title="Restaurar configuração inicial padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
        </div>

        {/* ── Lista de Métricas ── */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-2.5 custom-brand-scrollbar pr-3">
          {filteredItems.map((item, index) => {
            const Icon = ICONS_MAP[item.def.iconName] || BarChart3;
            const isFirst = index === 0;
            const isLast = index === filteredItems.length - 1;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.enabled
                    ? "bg-white border-[#CBD5E1] shadow-xs hover:border-[#007BFF]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] opacity-60 hover:opacity-90"
                }`}
              >
                {/* Lado Esquerdo: Checkbox/Toggle + Ícone + Textos */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggle(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007BFF]" />
                  </label>

                  {/* Ícone */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#475569] flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Detalhes */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-bold text-[#0F172A] truncate">
                        {item.def.label}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.def.category === "essential"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.def.category === "important"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-200 text-slate-700"
                      }`}>
                        {item.def.categoryLabel}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#64748B] truncate mt-0.5 max-w-[420px]">
                      {item.def.description}
                    </p>
                  </div>
                </div>

                {/* Lado Direito: Botões de Reordenação (Subir/Descer) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-mono text-[#94A3B8] mr-1 hidden sm:inline">
                    #{item.order}
                  </span>

                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMove(item.id, "up")}
                    className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-[#475569] hover:text-[#007BFF] hover:border-[#007BFF] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                    title="Mover para cima (exibir antes)"
                    aria-label={`Mover ${item.def.label} para cima`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMove(item.id, "down")}
                    className="w-7 h-7 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-[#475569] hover:text-[#007BFF] hover:border-[#007BFF] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                    title="Mover para baixo (exibir depois)"
                    aria-label={`Mover ${item.def.label} para baixo`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Rodapé ── */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#64748B]">
            {itemsWithMeta.filter((i) => i.enabled).length} de {itemsWithMeta.length} métricas ativas no painel
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] text-[13px] font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo!
                </>
              ) : (
                "Aplicar e Salvar"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
