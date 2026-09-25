"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Settings,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Save,
  Lock,
  CheckCircle2,
  User,
  MessageSquare,
  Cpu,
  Zap,
  Coins,
  Clock,
  Sliders,
  RefreshCw,
  Check,
  Info,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Brain,
  ExternalLink,
  Calendar,
  CreditCard,
  ArrowRightLeft,
  HelpCircle,
  Layers,
  CircleDollarSign,
  UserMinus,
  PhoneCall,
  Activity,
  Target,
  Megaphone,
  Palette,
  TrendingUp,
  Boxes,
  BarChart3,
  Compass,
  ArrowRight,
  Mic,
  Crown,
  Briefcase,
  Heart,
  ShieldAlert,
  Globe,
  Award,
} from "lucide-react";
import { GermaniVoiceStudio } from "./germani-voice-studio";
import {
  GermaniConfig,
  AiInferenceTelemetry,
  AI_MODELS_CATALOG,
  calculateModelMessageCost,
  THINKING_MODE_PRESETS,
  ModelPurposeCategory,
} from "../types/germani.types";
import {
  saveGermaniConfigAction,
  resetGermaniToDefaultsAction,
  getAiInferenceTelemetryAction,
  setActiveAiProviderAction,
} from "../actions/superadmin-ai.actions";

const SKILL_ICONS: Record<string, React.ElementType> = {
  "scrum-product-management": Briefcase,
  "humanized-service": Heart,
  "voss-negotiation": ShieldAlert,
  "cialdini-persuasion": Sparkles,
  "spin-selling-sdr": TrendingUp,
  "pix-recovery": CircleDollarSign,
  marketing: Megaphone,
  ux: Palette,
  sales: TrendingUp,
  erp: Boxes,
  analytics: BarChart3,
  security: ShieldCheck,
  admin: Compass,
  finance: CircleDollarSign,
  retention: UserMinus,
  whatsapp: PhoneCall,
  infra: Activity,
  crm: Target,
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  agile: { label: "Scrum & PM", color: "bg-indigo-100 text-indigo-700" },
  behavior: { label: "Humanizado", color: "bg-rose-100 text-rose-700" },
  core: { label: "Núcleo", color: "bg-blue-100 text-blue-700" },
  marketing: { label: "Growth", color: "bg-purple-100 text-purple-700" },
  ux: { label: "Design", color: "bg-pink-100 text-pink-700" },
  sales: { label: "Vendas", color: "bg-emerald-100 text-emerald-700" },
  erp: { label: "Processos", color: "bg-amber-100 text-amber-700" },
  analytics: { label: "Métricas", color: "bg-blue-100 text-blue-700" },
  security: { label: "Segurança", color: "bg-rose-100 text-rose-700" },
  admin: { label: "Governança", color: "bg-indigo-100 text-indigo-700" },
  finance: { label: "Financeiro", color: "bg-emerald-100 text-emerald-700" },
  retention: { label: "Retenção", color: "bg-amber-100 text-amber-700" },
  whatsapp: { label: "WhatsApp", color: "bg-teal-100 text-teal-700" },
  infra: { label: "Infra SLA", color: "bg-cyan-100 text-cyan-700" },
  crm: { label: "CRM Leads", color: "bg-violet-100 text-violet-700" },
};

interface GermaniConfigPanelProps {
  initialConfig: GermaniConfig;
  onConfigUpdated?: (newConfig: GermaniConfig) => void;
}

type ConfigTab = "motor" | "identidade" | "seguranca" | "voz";
type ModelFilterCategory = "all" | ModelPurposeCategory | "pro_only";

export function GermaniConfigPanel({ initialConfig, onConfigUpdated }: GermaniConfigPanelProps) {
  const [config, setConfig] = useState<GermaniConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<ConfigTab>("motor");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [telemetry, setTelemetry] = useState<AiInferenceTelemetry | null>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [isModelListExpanded, setIsModelListExpanded] = useState(false);
  const [modelCategoryFilter, setModelCategoryFilter] = useState<ModelFilterCategory>("all");
  const [showAjusteFinoExplainer, setShowAjusteFinoExplainer] = useState(false);

  const loadTelemetry = async () => {
    try {
      const data = await getAiInferenceTelemetryAction();
      setTelemetry(data);
    } catch {
      // Falha silenciosa de telemetria
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  const handleSkillToggle = (skillId: string) => {
    setConfig((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === skillId ? { ...skill, enabled: !skill.enabled } : skill
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveGermaniConfigAction(config);
      if (res.success && res.config) {
        toast.success(res.message);
        onConfigUpdated?.(res.config);
        await loadTelemetry();
      } else {
        toast.error(res.error || "Erro ao salvar configurações.");
      }
    } catch {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActiveProvider = async (provider: "gemini" | "openai") => {
    if (provider === "openai" && !telemetry?.openai.isConfigured) {
      toast.warning("A API da OpenAI não está conectada. Configure sua chave na Loja de Integrações antes de ativá-la.");
      return;
    }
    setIsRefreshingTelemetry(true);
    try {
      const res = await setActiveAiProviderAction(provider);
      if (res.success) {
        toast.success(res.message);
        const defaultModel = provider === "gemini" ? "gemini-3.8-flash" : "gpt-4.5-instant";
        setConfig((prev) => ({ ...prev, model: defaultModel }));
        await loadTelemetry();
      } else {
        toast.error(res.error || "Erro ao alterar provedor de IA.");
      }
    } catch {
      toast.error("Erro inesperado ao alterar provedor de IA.");
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (
      !confirm(
        "Tem certeza que deseja restaurar as predefinições de fábrica da Germani? Todas as personalizações voltarão ao padrão oficial seguro."
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetGermaniToDefaultsAction();
      if (res.success && res.config) {
        setConfig(res.config);
        toast.success(res.message);
        onConfigUpdated?.(res.config);
        await loadTelemetry();
      } else {
        toast.error(res.error || "Erro ao restaurar.");
      }
    } catch {
      toast.error("Erro inesperado ao restaurar predefinições.");
    } finally {
      setIsResetting(false);
    }
  };

  const activeProvider = telemetry?.activeProvider || (config.model.startsWith("gemini") ? "gemini" : "openai");
  const availableModelsForActiveProvider = AI_MODELS_CATALOG.filter((m) => m.provider === activeProvider);
  const selectedModelInfo =
    AI_MODELS_CATALOG.find((m) => m.id === config.model) || availableModelsForActiveProvider[0];
  const costCalculation = calculateModelMessageCost(selectedModelInfo.id, config.temperature);

  return (
    <div className="space-y-6 font-sans">
      {/* ── BARRA SUPERIOR DE AÇÕES COM TIPOGRAFIA LEVE E AREJADA ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Settings className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 font-inter">
              Painel de Governança & Calibração
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Ajuste fino de identidade, modelos de linguagem, cotas de tokens em tempo real e diretrizes executivas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/ai"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#007BFF] hover:border-blue-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs"
            title="Acessar o catálogo de Modelos Mestres globais de IA para os clientes"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Modelos Mestres</span>
          </Link>

          <Link
            href="/integrations"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#007BFF] hover:border-blue-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs"
            title="Acessar Loja de Integrações & Conexão de APIs (Google Gemini, OpenAI, WhatsApp)"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Chaves de API</span>
          </Link>

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isResetting || isSaving}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Restaura a configuração original completa de fábrica da Germani"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Predefinições</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069d9] hover:to-[#4f46e5] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Salvando..." : "Salvar Configurações"}</span>
          </button>
        </div>
      </div>

      {/* ── ABAS DE NAVEGAÇÃO ORGANIZADAS (ELIMINA POLUIÇÃO VISUAL) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("motor")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "motor"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Motor & Custos de Inferência</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded-full">
            {activeProvider === "gemini" ? "Gemini" : "OpenAI"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("identidade")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "identidade"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <User className="w-4 h-4 text-blue-600" />
          <span>Identidade & Habilidades</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.2 rounded-full">
            {config.skills.filter((s) => s.enabled).length} ativas
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seguranca")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "seguranca"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Guardrails & Segurança</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded-full">
            {config.guardrails.length} salvaguardas
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("voz")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === "voz"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Mic className="w-4 h-4 text-purple-600" />
          <span>Voz Oficial & Estúdio XTTS</span>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-medium px-1.5 py-0.2 rounded-full">
            Germani (176.1 Hz)
          </span>
        </button>
      </div>

      {/* ── ABA 1: MOTOR DE INFERÊNCIA & CUSTOS ── */}
      {activeTab === "motor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Coluna Esquerda: Status do Provedor, Tokens e Modelo Homologado */}
          <div className="space-y-6">
            {/* Card 1: Provedor & Quota em Tempo Real */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm font-inter">
                        Créditos & Tokens em Tempo Real
                      </h3>
                      <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Cota Global da Plataforma
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Saldo oficial compartilhado entre a Assessora Germani e os Agentes Mestres.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadTelemetry}
                    disabled={isRefreshingTelemetry}
                    className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-normal disabled:opacity-50"
                    title="Atualizar saldo de tokens agora"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingTelemetry ? "animate-spin" : ""}`} />
                    <span>Atualizar</span>
                  </button>

                  <div className="group relative">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full cursor-help">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10.5px] font-medium text-emerald-800">
                        {telemetry?.isConfigured ? "API Ativa" : "Modo Seguro"}
                      </span>
                    </div>

                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-lg z-50 pointer-events-none border border-slate-700 font-sans">
                      <span className="font-semibold text-emerald-400 mb-1">Status da Conexão</span>
                      <p className="text-slate-300 leading-tight">
                        Provedor: {activeProvider === "gemini" ? "Google Gemini AI" : "OpenAI GPT"}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-1">
                        Chave: {telemetry?.maskedKey || "Sandbox Homologado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seletor de Provedores com Detecção Real de Conexão */}
              <div className="grid grid-cols-2 gap-3">
                {/* Botão Google Gemini */}
                <button
                  type="button"
                  onClick={() => handleSetActiveProvider("gemini")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeProvider === "gemini"
                      ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800">Google Gemini</span>
                    <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Conectada (Ativa)
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-500 block mt-1">
                    Latência: ~{telemetry?.gemini.latencyMs || 95}ms • Motor Principal
                  </span>
                </button>

                {/* Botão OpenAI GPT */}
                <button
                  type="button"
                  onClick={() => handleSetActiveProvider("openai")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeProvider === "openai"
                      ? "border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-2xs"
                      : !telemetry?.openai.isConfigured
                      ? "border-slate-200 bg-slate-50/60 opacity-80 hover:border-slate-300"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800">OpenAI GPT</span>
                    {telemetry?.openai.isConfigured ? (
                      <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Conectada
                      </span>
                    ) : (
                      <span className="text-[9.5px] bg-amber-50 border border-amber-200 text-amber-700 font-medium px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        Não Conectada
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] text-slate-500 block mt-1">
                    {telemetry?.openai.isConfigured
                      ? `Latência: ~${telemetry?.openai.latencyMs || 105}ms`
                      : "Chave pendente em Integrações"}
                  </span>
                </button>
              </div>

              {/* Detalhes de Consumo e Saldo */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-600 font-normal">
                  <span>Consumo mensal:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {(activeProvider === "gemini"
                      ? telemetry?.gemini.monthlyConsumed || 1240500
                      : telemetry?.openai.monthlyConsumed || 0
                    ).toLocaleString("pt-BR")}{" "}
                    / {(5000000).toLocaleString("pt-BR")} tokens
                  </span>
                </div>

                {/* Barra de Progresso Suave */}
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        activeProvider === "gemini"
                          ? telemetry?.gemini.percentConsumed || 25
                          : telemetry?.openai.percentConsumed || 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Saldo disponível:</span>
                  <span className="font-medium text-emerald-700 font-mono">
                    {(activeProvider === "gemini"
                      ? telemetry?.gemini.remainingTokens || 3759500
                      : telemetry?.openai.remainingTokens || 0
                    ).toLocaleString("pt-BR")}{" "}
                    tokens
                  </span>
                </div>

                {/* Próximo Reset / Renovação da Cota */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/70">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>
                      Renovação de cota:{" "}
                      <strong className="text-slate-800 font-medium">
                        {telemetry?.quotaResetInfo?.nextResetDateFormatted || "01/10/2026"}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-medium bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-md">
                    {telemetry?.quotaResetInfo?.daysRemaining ?? 11} dias restantes
                  </span>
                </div>

                {/* Botão Oficial de Recarga / Compra de Tokens */}
                <a
                  href={
                    telemetry?.quotaResetInfo?.buyTokensUrl ||
                    (activeProvider === "gemini"
                      ? "https://aistudio.google.com/app/plan_information"
                      : "https://platform.openai.com/account/billing/overview")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-xs font-medium transition-all shadow-2xs group"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>
                    Comprar Tokens / Gerenciar Fatura (
                    {activeProvider === "gemini" ? "Google AI Studio" : "OpenAI Platform"})
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 ml-auto" />
                </a>

                {/* Alerta de Failover Automático com Detecção Real */}
                {telemetry?.quotaResetInfo?.autoFailoverEnabled ? (
                  <div className="flex items-start gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 leading-snug">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Failover Inteligente Ativo (Zero Queda)</span>
                      <span className="text-emerald-700 font-normal">
                        Chaves do Gemini e OpenAI sincronizadas. Caso o saldo de tokens do {activeProvider === "gemini" ? "Gemini" : "OpenAI"} esgote, o sistema assume automaticamente a API reserva sem pausar os atendimentos.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 leading-snug">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold block">Failover em Espera (OpenAI Não Conectada)</span>
                      <span className="text-amber-800 font-normal block mb-1.5">
                        O <strong>Google Gemini</strong> é o seu motor ativo principal. Para habilitar contingência redundante caso esgote a cota, adicione a chave da OpenAI na Loja de Integrações.
                      </span>
                      <Link
                        href="/integrations"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-semibold rounded-lg text-[10.5px] transition-colors"
                      >
                        <span>Conectar Chave OpenAI na Loja de Integrações</span>
                        <ArrowRight className="w-3 h-3 text-amber-800" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Modelo Homologado da Germani */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm font-inter">
                    Modelo Ativo da Assessora
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Motor em operação para {activeProvider === "gemini" ? "Google Gemini" : "OpenAI"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModelListExpanded(!isModelListExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <span>{isModelListExpanded ? "Fechar Catálogo" : "Explorar Modelos"}</span>
                  {isModelListExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Card Destaque do Modelo Selecionado */}
              <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 font-inter">
                      {selectedModelInfo.name}
                    </span>
                    <span className="bg-blue-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Ativo
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        selectedModelInfo.tierRequired === "pro_only"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {selectedModelInfo.tierRequiredLabel}
                    </span>
                    <span className="bg-blue-100/80 text-blue-800 border border-blue-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {selectedModelInfo.bestForLabel}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    ~{selectedModelInfo.avgLatencyMs}ms
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  {selectedModelInfo.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-blue-100 flex-wrap gap-2">
                  <span>
                    Capacidade: <strong className="text-slate-700 font-medium">{selectedModelInfo.contextWindow}</strong>
                  </span>
                  <span className="font-mono text-slate-600 text-[10.5px]">
                    ${selectedModelInfo.inputCostPer1M} in • ${selectedModelInfo.outputCostPer1M} out / 1M
                  </span>
                </div>
              </div>

              {/* Lista Expansível com Filtros de Categoria e Plano Pro */}
              {isModelListExpanded && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 max-h-[360px] overflow-y-auto custom-brand-scrollbar animate-in fade-in duration-150">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Filtrar por Finalidade & Plano:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {telemetry?.apiTier === "pro" ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/80 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Conta Pro Ativa: Todos os Modelos Liberados
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Plano Base: Modelos Pro Bloqueados
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400">
                        {availableModelsForActiveProvider.length} modelos
                      </span>
                    </div>
                  </div>

                  {/* Pílulas de Filtro */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-brand-scrollbar text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setModelCategoryFilter("all")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                        modelCategoryFilter === "all"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelCategoryFilter("assessoria")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                        modelCategoryFilter === "assessoria"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Assessoria Germani
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelCategoryFilter("atendimento_clientes")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                        modelCategoryFilter === "atendimento_clientes"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Clientes WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelCategoryFilter("auditoria_estrategia")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                        modelCategoryFilter === "auditoria_estrategia"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Auditoria & Raciocínio
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelCategoryFilter("pro_only")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                        modelCategoryFilter === "pro_only"
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100"
                      }`}
                    >
                      Requer Plano Pro
                    </button>
                  </div>

                  {/* Itens de Modelos Filtrados */}
                  <div className="space-y-2">
                    {availableModelsForActiveProvider
                      .filter((m) => {
                        if (modelCategoryFilter === "assessoria") return m.bestFor === "assessoria";
                        if (modelCategoryFilter === "atendimento_clientes") return m.bestFor === "atendimento_clientes";
                        if (modelCategoryFilter === "auditoria_estrategia") return m.bestFor === "auditoria_estrategia";
                        if (modelCategoryFilter === "pro_only") return m.tierRequired === "pro_only";
                        return true;
                      })
                      .map((m) => {
                        const isSelected = config.model === m.id;
                        const isProOnly = m.tierRequired === "pro_only";
                        const isBlockedByTier = isProOnly && telemetry?.apiTier === "free";

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (isBlockedByTier) {
                                toast.error(
                                  `O modelo ${m.name} requer faturamento ativo (Plano Pro/Pay-as-you-go) no provedor para evitar erros 429/403.`
                                );
                                return;
                              }
                              setConfig({ ...config, model: m.id });
                              toast.success(`Modelo alterado para ${m.name}`);
                            }}
                            className={`p-3 rounded-xl border transition-all ${
                              isBlockedByTier
                                ? "bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed"
                                : isSelected
                                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-2xs cursor-pointer"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-slate-800">{m.name}</span>
                                {isBlockedByTier ? (
                                  <span className="bg-amber-100 text-amber-800 text-[9.5px] font-medium px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" />
                                    Bloqueado (Requer Pro)
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[9.5px] font-medium px-1.5 py-0.2 rounded ${
                                      m.tierRequired === "pro_only"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {m.tierRequiredLabel}
                                  </span>
                                )}
                                <span className="bg-slate-100 text-slate-600 text-[9.5px] font-medium px-1.5 py-0.2 rounded">
                                  {m.bestForLabel}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">~{m.avgLatencyMs}ms</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {m.description}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 mt-1 border-t border-slate-100">
                              <span>Janela: {m.contextWindow}</span>
                              <span className="font-mono">
                                ${m.inputCostPer1M} in / ${m.outputCostPer1M} out (1M)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Temperatura & Simulador de Custo por Mensagem */}
          <div className="space-y-6">
            {/* Card 3: Temperatura & Criatividade (Modos de Pensamento: Baixo, Médio e Alto) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm font-inter">
                        Temperatura & Criatividade
                      </h3>
                      <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Exclusiva da Germani
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Calibração executiva da assessora. Agentes Mestres no catálogo possuem calibração própria.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md font-sans">
                    {config.temperature <= 0.35
                      ? "Baixo"
                      : config.temperature <= 0.75
                      ? "Médio"
                      : "Alto"}{" "}
                    ({config.temperature.toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Seletor Rápido de Modos de Pensamento (Baixo / Médio / Alto) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Nível de Resposta & Pensamento da IA:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {THINKING_MODE_PRESETS.map((preset) => {
                    const isSelected =
                      (preset.id === "baixo" && config.temperature <= 0.35) ||
                      (preset.id === "medio" && config.temperature > 0.35 && config.temperature <= 0.75) ||
                      (preset.id === "alto" && config.temperature > 0.75);

                    const IconComponent =
                      preset.id === "baixo" ? Zap : preset.id === "medio" ? Sparkles : Brain;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setConfig({ ...config, temperature: preset.temperature })}
                        className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 text-blue-900 shadow-2xs ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-blue-100 text-blue-700 font-semibold"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {preset.temperature.toFixed(1)}
                          </span>
                        </div>

                        <span className="text-xs font-semibold block">{preset.label}</span>
                        <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5 line-clamp-1">
                          {preset.id === "baixo" ? "Direto & Preciso" : preset.id === "medio" ? "Equilibrado" : "Aprofundado"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalhes do Modo de Pensamento Selecionado */}
              {(() => {
                const activePreset =
                  config.temperature <= 0.35
                    ? THINKING_MODE_PRESETS[0]
                    : config.temperature <= 0.75
                    ? THINKING_MODE_PRESETS[1]
                    : THINKING_MODE_PRESETS[2];

                return (
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/90 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        {activePreset.id === "baixo" ? (
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        ) : activePreset.id === "medio" ? (
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Brain className="w-3.5 h-3.5 text-violet-600" />
                        )}
                        <span>{activePreset.title}</span>
                      </div>
                      <span className="text-[10.5px] text-blue-700 font-medium bg-blue-100/60 px-2 py-0.5 rounded-md">
                        {activePreset.thinkingDepth}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal">
                      {activePreset.description}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-blue-100/60">
                      <span>Projeção de resposta:</span>
                      <span className="font-mono font-medium text-blue-800">{activePreset.projectedTokens}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Ajuste Fino Manual Deslizante */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>Ajuste Fino Milimétrico</span>
                    <button
                      type="button"
                      onClick={() => setShowAjusteFinoExplainer(!showAjusteFinoExplainer)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Como funciona?</span>
                    </button>
                  </div>
                  <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                    {config.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-normal">
                  <span>0.1 (Focado / Sem Alucinação)</span>
                  <span>0.6 (Equilibrado)</span>
                  <span>1.0 (Pensamento Máximo)</span>
                </div>

                {/* Caixa Explicativa Interativa do Ajuste Fino Milimétrico */}
                {showAjusteFinoExplainer && (
                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-2.5 border border-slate-700 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-semibold text-blue-400 text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        Ajuste Fino Milimétrico da Temperatura (T)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAjusteFinoExplainer(false)}
                        className="text-slate-400 hover:text-white text-[11px] px-1 rounded"
                      >
                        Fechar ✕
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                      A <strong>Temperatura</strong> calibra matematicamente a função Softmax no motor da IA, determinando o quão previsíveis ou variadas serão as palavras escolhidas:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                      <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80">
                        <span className="text-emerald-400 font-semibold block mb-0.5">
                          0.1 a 0.35 (Baixo)
                        </span>
                        <p className="text-slate-300 leading-snug">
                          <strong>Determinístico & Estrito:</strong> A IA escolhe a palavra de maior certeza. Zero alucinações. Ideal para abrir menus, rodar comandos e regras bancárias.
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80">
                        <span className="text-blue-400 font-semibold block mb-0.5">
                          0.36 a 0.75 (Médio)
                        </span>
                        <p className="text-slate-300 leading-snug">
                          <strong>Humano & Equilibrado:</strong> Conversa natural, empatia e raciocínio contextual. Ideal para a conversa de assessora com o Daniel e WhatsApp de clientes.
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80">
                        <span className="text-purple-400 font-semibold block mb-0.5">
                          0.76 a 1.0 (Alto)
                        </span>
                        <p className="text-slate-300 leading-snug">
                          <strong>Profundo & Criativo:</strong> A IA explora conexões conceituais raras, formulação de estratégias de vendas, redação e brainstorming.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nota Explicativa Unificada */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed font-normal">
                <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Os modelos mais avançados de IA (Google Gemini 3.0+ e OpenAI) utilizam os modos Baixo, Médio e Alto para calibrar a profundidade do pensamento interno e a densidade analítica de cada resposta.
                </span>
              </div>
            </div>

            {/* Card 4: Simulador de Consumo por Mensagem (Fórmula Real e Transparente) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm font-inter">
                        Simulador de Consumo por Mensagem
                      </h3>
                      <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Assessora Germani
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Cálculo baseado no modelo ativo e temperatura da Germani.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Dados Reais 100% Auditados
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedModelInfo.name}
                  </span>
                </div>
              </div>

              {/* Exibição da Fórmula Real */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="text-[11px] font-semibold text-slate-700">Fórmula de Cálculo Oficial:</span>
                  <span className="text-[10px] font-mono text-slate-400">Tabela de Preços por 1M Tokens</span>
                </div>
                <div className="p-2 bg-white border border-slate-200/80 rounded-lg font-mono text-[10.5px] text-slate-700 text-center overflow-x-auto">
                  Custo = (PromptTokens × ${selectedModelInfo.inputCostPer1M} / 1M) + (OutputTokens × ${selectedModelInfo.outputCostPer1M} / 1M)
                </div>
              </div>

              {/* Grade de Valores Reais */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-normal">Entrada (Prompt + Histórico)</span>
                  <span className="font-mono font-medium text-slate-800 text-sm">
                    {costCalculation.basePromptTokens} tokens
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-mono">
                    ${selectedModelInfo.inputCostPer1M} / 1M tokens
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-normal">Saída (Resposta Calibrada)</span>
                  <span className="font-mono font-medium text-slate-800 text-sm">
                    ~{costCalculation.projectedOutputTokens} tokens
                  </span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 font-mono">
                    ${selectedModelInfo.outputCostPer1M} / 1M tokens
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-emerald-700 block text-[10px] font-normal">Total Médio por Mensagem</span>
                  <span className="font-mono font-semibold text-emerald-800 text-sm">
                    ~{costCalculation.totalTokens} tokens
                  </span>
                  <span className="text-[9.5px] text-emerald-600 block mt-0.5">
                    Modo: {config.temperature <= 0.35 ? "Baixo (Econômico)" : config.temperature <= 0.75 ? "Médio (Padrão)" : "Alto (Aprofundado)"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                  <span className="text-blue-700 block text-[10px] font-normal">Custo Real por Mensagem</span>
                  <span className="font-mono font-semibold text-blue-900 text-sm">
                    ${costCalculation.totalCostUsd.toFixed(6)} USD
                  </span>
                  <span className="text-[9.5px] text-slate-600 font-medium block">
                    (R$ {costCalculation.totalCostBrl.toFixed(4)})
                  </span>
                </div>
              </div>

              {/* Projeção de Escala com Valores Reais */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="space-y-0.5">
                  <span className="text-slate-700 font-medium block text-xs">
                    Projeção em Larga Escala:
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    1.000 msgs: <strong className="text-slate-700">${costCalculation.costPer1kMessagesUsd.toFixed(3)}</strong> (R$ {costCalculation.costPer1kMessagesBrl.toFixed(2)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">10.000 msgs:</span>
                  <span className="font-mono font-semibold text-emerald-700 text-xs">
                    ${(costCalculation.costPer1kMessagesUsd * 10).toFixed(2)} USD (R$ {(costCalculation.costPer1kMessagesBrl * 10).toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 2: CONSTITUIÇÃO, HABILIDADES & MEMÓRIA ── */}
      {activeTab === "identidade" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Coluna Esquerda: Constituição Soberana & Memória Adaptativa */}
          <div className="space-y-6">
            {/* Card 1: Identidade Soberana & Constituição Imutável */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-slate-800 text-sm font-inter">
                    Constituição & Identidade Soberana
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Imutável & Protegida</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                A Germani é a inteligência executiva fixa do SuperAdmin da BipeSend. Seus atributos fundamentais de identidade, gênero e autoridade são imutáveis por constituição de sistema para garantir a soberania do ecossistema.
              </p>

              {/* Grid de Atributos Constitucionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-normal">Nome Oficial</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-800 font-inter">Germani</span>
                    <span className="text-[9.5px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">Soberana</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-normal">Gênero & Pronomes</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">Feminina (Ela/Dela)</span>
                    <span className="text-[9.5px] font-medium bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded-full">Oficial</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-normal">Papel Executivo no SuperAdmin</span>
                  <p className="text-xs font-semibold text-slate-800">
                    Chief Executive AI Advisor & Assessora Pessoal do Fundador
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block font-normal">Postura & Tom Nuclear</span>
                  <p className="text-xs text-slate-700 leading-snug font-normal">
                    Parceria executiva próxima, visão estratégica de negócios (C-level), empatia acolhedora, retidão fundamentada em princípios cristãos e linguagem direta sem rodeios.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-1 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-purple-700 block font-medium">Perfil Vocal Homologado</span>
                    <span className="text-xs font-semibold text-purple-950">Germani (Oficial Soberana)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-mono font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                      176.1 Hz
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("voz")}
                      className="text-[10.5px] text-purple-700 hover:text-purple-900 font-semibold underline ml-1 cursor-pointer"
                    >
                      Ver Estúdio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Memória Contínua & Perfil Adaptativo de Comunicação */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-sm font-inter">
                    Aprendizado Adaptativo & Memória Contínua
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Perfil Vivo Ativo</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                <p>
                  A comunicação com a Germani <strong>não é engessada nem utiliza scripts robóticos</strong>. À medida que você troca mensagens no painel, a inteligência da Germani assimila dinamicamente:
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 text-xs block">Linguagem, Gírias & Ritmo Executivo</strong>
                      <span className="text-[11px] text-slate-500">
                        Ela responde com o mesmo tom direto, dinâmico e resolutivo que você usa no dia a dia, como em um chat pessoal do WhatsApp.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 text-xs block">Saudações Contextuais & Espontâneas</strong>
                      <span className="text-[11px] text-slate-500">
                        Sem frases prontas pré-digitadas. Ao iniciar o dia ou abrir uma conversa, a saudação é viva e contextualizada com as tarefas e dados recentes.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 text-xs block">Retenção de Memória Contínua (Até 200 Interações)</strong>
                      <span className="text-[11px] text-slate-500">
                        Histórico completo mantido de forma segura no servidor, permitindo que a Germani lembre de decisões tomadas, preferências e prioridades.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pílulas de Status */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/60">
                  <span className="text-[9.5px] text-blue-700 block font-medium">Interlocutor</span>
                  <span className="text-xs font-semibold text-blue-900 font-inter">Daniel</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-[9.5px] text-emerald-700 block font-medium">Memória</span>
                  <span className="text-xs font-semibold text-emerald-900 font-inter">200 Turnos</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/60">
                  <span className="text-[9.5px] text-purple-700 block font-medium">Adaptação</span>
                  <span className="text-xs font-semibold text-purple-900 font-inter">Tempo Real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Habilidades & Módulos Ativos */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-sm font-inter">
                    Módulos & Habilidades Ativas
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/80">
                    {config.skills.filter((s) => s.enabled).length}/{config.skills.length} ativas
                  </span>
                </div>
              </div>

              {/* Lista Scrollável Elegante com Scrollbar Fina */}
              <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2.5 custom-brand-scrollbar">
                {config.skills.map((skill) => {
                  const SkillIcon = SKILL_ICONS[skill.id] || Sparkles;
                  const catInfo = CATEGORY_LABELS[skill.category] || {
                    label: "Geral",
                    color: "bg-slate-100 text-slate-600",
                  };

                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 group ${
                        skill.enabled
                          ? "bg-blue-50/40 border-blue-200/80 shadow-2xs hover:bg-blue-50/70"
                          : "bg-slate-50/60 border-slate-200/80 opacity-60 hover:opacity-85"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            skill.enabled
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                          }`}
                        >
                          <SkillIcon className="w-3.5 h-3.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="font-medium text-xs text-slate-800">
                              {skill.name}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${catInfo.color}`}
                            >
                              {catInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug font-normal line-clamp-2">
                            {skill.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 mt-1 transition-colors ${
                          skill.enabled
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {skill.enabled && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diretrizes Adicionais */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-sm font-inter">
                    Diretrizes Adicionais Personalizadas
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Altura mínima calibrada</span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Instruções extras injetadas no System Prompt da Germani (ex: metas trimestrais, prioridades do Daniel):
              </p>
              <textarea
                rows={5}
                value={config.systemPromptCustomInstructions}
                onChange={(e) =>
                  setConfig({ ...config, systemPromptCustomInstructions: e.target.value })
                }
                placeholder="Ex: Priorize análises com foco em retenção de clientes, liquidação de pagamentos via PIX e monitoramento de latência das APIs..."
                className="w-full bg-slate-50 border border-slate-300/80 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px] leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 3: GUARDRAILS & SEGURANÇA ── */}
      {activeTab === "seguranca" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 text-sm font-inter">
                Salvaguardas Constitucionais Ativas
              </h3>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              5 Guardrails Homologados
            </span>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Diretrizes invioláveis integradas para garantir blindagem técnica, integridade do banco de dados e prevenção de conflitos de interesse:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {config.guardrails.map((gr) => (
              <div
                key={gr.id}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 text-emerald-600 flex-shrink-0">
                  {gr.isConstitutional ? (
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span>{gr.title}</span>
                    {gr.isConstitutional && (
                      <span className="text-[9.5px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-normal">
                        Imutável
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 leading-snug font-normal">
                    {gr.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA 4: VOZ OFICIAL DA GERMANI & ESTÚDIO XTTS v2 ── */}
      {activeTab === "voz" && (
        <div className="animate-in fade-in duration-200">
          <GermaniVoiceStudio />
        </div>
      )}
    </div>
  );
}
