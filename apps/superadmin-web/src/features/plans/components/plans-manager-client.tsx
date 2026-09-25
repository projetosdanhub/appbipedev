"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CustomPlan,
  PlanColorScheme,
  savePlanAction,
  togglePlanStatusAction,
  togglePlanLandingVisibilityAction,
  deletePlanAction,
  getPlatformPlansAction
} from "../actions/plans.actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Users,
  Bot,
  MessageSquare,
  Sparkles,
  Smartphone,
  Shield,
  Layers,
  X,
  Check,
  Zap,
  Tag,
  Globe,
  Eye,
  EyeOff
} from "lucide-react";
import { WaterGlassDeleteModal } from "./water-glass-delete-modal";

/**
 * Selo de Confirmação/Inclusão Oficial BipeSend em Verde Esmeralda (#10B981 -> #059669)
 * Geometria de estrela de 16 pontas com checkmark nítido, exclusivo para recursos inclusos nos planos comerciais.
 */
export function BipeCheckBadge({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-label="Recurso Incluso"
    >
      <defs>
        <linearGradient id="bipeCheckBadgeGradPlansGreen" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.2L14.23 3.69L17.4 2.65L18.08 5.92L21.35 6.6L20.31 9.77L22.8 12L20.31 14.23L21.35 17.4L18.08 18.08L17.4 21.35L14.23 20.31L12 22.8L9.77 20.31L6.6 21.35L5.92 18.08L2.65 17.4L3.69 14.23L1.2 12L3.69 9.77L2.65 6.6L5.92 5.92L6.6 2.65L9.77 3.69Z"
        fill="url(#bipeCheckBadgeGradPlansGreen)"
      />
      <path
        d="M8.2 12.2L10.8 14.8L16.2 9.2"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Selo de Verificação Oficial BipeSend com gradiente azul #007BFF -> violeta #6366F1
 * Geometria de estrela de 16 pontas com checkmark nítido, sem ser o modelo do Instagram.
 */
export function BipeVerifiedBadge({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-label="Selo Verificado BipeSend"
    >
      <defs>
        <linearGradient id="bipeStarBadgeGradPlans" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007BFF" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.2L14.23 3.69L17.4 2.65L18.08 5.92L21.35 6.6L20.31 9.77L22.8 12L20.31 14.23L21.35 17.4L18.08 18.08L17.4 21.35L14.23 20.31L12 22.8L9.77 20.31L6.6 21.35L5.92 18.08L2.65 17.4L3.69 14.23L1.2 12L3.69 9.77L2.65 6.6L5.92 5.92L6.6 2.65L9.77 3.69Z"
        fill="url(#bipeStarBadgeGradPlans)"
      />
      <path
        d="M8.2 12.2L10.8 14.8L16.2 9.2"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-3.5 h-3.5 text-emerald-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-3.5 h-3.5 text-pink-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = "w-3.5 h-3.5 text-cyan-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const COLOR_PALETTES: {
  id: PlanColorScheme;
  label: string;
  dotColor: string;
  gradientClass: string;
  borderClass: string;
  ringColor: string;
  hoverBg: string;
}[] = [
  { id: "blue", label: "Azul Bipe", dotColor: "#007BFF", gradientClass: "from-[#007BFF] to-[#38BDF8]", borderClass: "border-[#007BFF]", ringColor: "ring-[#007BFF]/30", hoverBg: "hover:bg-blue-50/50" },
  { id: "emerald", label: "Esmeralda", dotColor: "#10B981", gradientClass: "from-[#10B981] to-[#34D399]", borderClass: "border-[#10B981]", ringColor: "ring-[#10B981]/30", hoverBg: "hover:bg-emerald-50/50" },
  { id: "violet", label: "Violeta IA", dotColor: "#6366F1", gradientClass: "from-[#6366F1] to-[#A855F7]", borderClass: "border-[#6366F1]", ringColor: "ring-[#6366F1]/30", hoverBg: "hover:bg-violet-50/50" },
  { id: "amber", label: "Âmbar VIP", dotColor: "#F59E0B", gradientClass: "from-[#F59E0B] to-[#FBBF24]", borderClass: "border-[#F59E0B]", ringColor: "ring-[#F59E0B]/30", hoverBg: "hover:bg-amber-50/50" },
  { id: "rose", label: "Rosa Choque", dotColor: "#F43F5E", gradientClass: "from-[#F43F5E] to-[#FB7185]", borderClass: "border-[#F43F5E]", ringColor: "ring-[#F43F5E]/30", hoverBg: "hover:bg-rose-50/50" },
  { id: "cyan", label: "Ciano Tech", dotColor: "#06B6D4", gradientClass: "from-[#06B6D4] to-[#22D3EE]", borderClass: "border-[#06B6D4]", ringColor: "ring-[#06B6D4]/30", hoverBg: "hover:bg-cyan-50/50" },
  { id: "indigo", label: "Índigo Profundo", dotColor: "#4F46E5", gradientClass: "from-[#4F46E5] to-[#818CF8]", borderClass: "border-[#4F46E5]", ringColor: "ring-[#4F46E5]/30", hoverBg: "hover:bg-indigo-50/50" },
];

const COLOR_CLASSES: Record<PlanColorScheme, {
  borderHover: string;
  pill: string;
  accent: string;
}> = {
  blue: {
    borderHover: "hover:border-[#007BFF] hover:shadow-[0_12px_28px_rgba(0,123,255,0.12)]",
    pill: "bg-blue-50 text-[#007BFF] border-blue-200",
    accent: "from-[#007BFF] to-[#38BDF8]",
  },
  emerald: {
    borderHover: "hover:border-[#10B981] hover:shadow-[0_12px_28px_rgba(16,185,129,0.12)]",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "from-[#10B981] to-[#34D399]",
  },
  violet: {
    borderHover: "hover:border-[#6366F1] hover:shadow-[0_12px_28px_rgba(99,102,241,0.12)]",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-[#6366F1] to-[#A855F7]",
  },
  amber: {
    borderHover: "hover:border-[#F59E0B] hover:shadow-[0_12px_28px_rgba(245,158,11,0.12)]",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "from-[#F59E0B] to-[#FBBF24]",
  },
  rose: {
    borderHover: "hover:border-[#F43F5E] hover:shadow-[0_12px_28px_rgba(244,63,94,0.12)]",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    accent: "from-[#F43F5E] to-[#FB7185]",
  },
  cyan: {
    borderHover: "hover:border-[#06B6D4] hover:shadow-[0_12px_28px_rgba(6,182,212,0.12)]",
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
    accent: "from-[#06B6D4] to-[#22D3EE]",
  },
  indigo: {
    borderHover: "hover:border-[#4F46E5] hover:shadow-[0_12px_28px_rgba(79,70,229,0.12)]",
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    accent: "from-[#4F46E5] to-[#818CF8]",
  },
};

interface PlansManagerClientProps {
  initialPlans: CustomPlan[];
}

export function PlansManagerClient({ initialPlans }: PlansManagerClientProps) {
  const [plans, setPlans] = useState<CustomPlan[]>(initialPlans);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  React.useEffect(() => {
    const handleUpdate = () => {
      getPlatformPlansAction().then((freshPlans) => {
        if (freshPlans && Array.isArray(freshPlans)) {
          setPlans([...freshPlans]);
        }
      });
    };
    window.addEventListener("bipesend:realtime-update", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener("bipesend:realtime-update", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CustomPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceMonthly, setPriceMonthly] = useState(297);
  const [priceYearly, setPriceYearly] = useState(2970);
  const [colorScheme, setColorScheme] = useState<PlanColorScheme>("blue");
  const [badge, setBadge] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showOnLandingPage, setShowOnLandingPage] = useState(true);

  // Limits
  const [contacts, setContacts] = useState(10000);
  const [contactsUnlimited, setContactsUnlimited] = useState(false);
  const [crmPipelines, setCrmPipelines] = useState(3);
  const [crmPipelinesUnlimited, setCrmPipelinesUnlimited] = useState(false);
  const [aiAgents, setAiAgents] = useState(3);
  const [aiAgentsUnlimited, setAiAgentsUnlimited] = useState(false);
  const [whatsappConnections, setWhatsappConnections] = useState(2);
  const [instagramConnections, setInstagramConnections] = useState(2);
  const [tiktokConnections, setTiktokConnections] = useState(2);
  const [automations, setAutomations] = useState(15);
  const [automationsUnlimited, setAutomationsUnlimited] = useState(false);
  const [transparentCheckout, setTransparentCheckout] = useState(true);
  const [teamMembers, setTeamMembers] = useState(6);
  const [teamMembersUnlimited, setTeamMembersUnlimited] = useState(false);
  const [monthlyAiMessages, setMonthlyAiMessages] = useState(8000);
  const [monthlyAiMessagesUnlimited, setMonthlyAiMessagesUnlimited] = useState(false);

  // Features list
  const [features, setFeatures] = useState<string[]>([
    "Agentes de IA com voz humanizada",
    "BipeSend WhatsApp API Oficial",
    "Conexão Instagram Direct integrada",
    "Conexão TikTok Direct integrada",
    "Funil CRM Kanban com automações",
    "Checkout Transparente incluso",
    "Simulação de digitação em tempo real",
  ]);
  const [newFeatureText, setNewFeatureText] = useState("");

  const builderRef = React.useRef<HTMLDivElement>(null);

  const handleOpenCreateModal = () => {
    if (isModalOpen && !editingPlan) {
      setIsModalOpen(false);
      return;
    }
    setEditingPlan(null);
    setName("");
    setDescription("");
    setPriceMonthly(297);
    setPriceYearly(2970);
    setColorScheme("emerald");
    setBadge("");
    setIsPopular(false);
    setIsActive(true);
    setShowOnLandingPage(true);
    setContacts(10000);
    setContactsUnlimited(false);
    setCrmPipelines(1);
    setCrmPipelinesUnlimited(false);
    setAiAgents(3);
    setAiAgentsUnlimited(false);
    setWhatsappConnections(2);
    setInstagramConnections(2);
    setTiktokConnections(1);
    setAutomations(5);
    setAutomationsUnlimited(false);
    setTransparentCheckout(true);
    setTeamMembers(5);
    setTeamMembersUnlimited(false);
    setMonthlyAiMessages(8000);
    setMonthlyAiMessagesUnlimited(false);
    setFeatures([
      "Agentes de IA com voz humanizada",
      "BipeSend WhatsApp API Oficial",
      "Conexão Instagram Direct integrada",
      "Conexão TikTok Direct integrada",
      "Funil CRM Kanban com automações",
      "Checkout Transparente incluso",
      "Simulação de digitação em tempo real",
    ]);
    setIsModalOpen(true);
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleOpenEditModal = (plan: CustomPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setPriceMonthly(plan.priceMonthly);
    setPriceYearly(plan.priceYearly);
    setColorScheme(plan.colorScheme || "blue");
    setBadge(plan.badge || "");
    setIsPopular(!!plan.isPopular);
    setIsActive(plan.isActive);
    setShowOnLandingPage(plan.showOnLandingPage !== false);

    setContacts(plan.limits.contacts === -1 ? 10000 : plan.limits.contacts);
    setContactsUnlimited(plan.limits.contacts === -1);

    setCrmPipelines(plan.limits.crmPipelines === -1 ? 3 : (plan.limits.crmPipelines ?? 1));
    setCrmPipelinesUnlimited(plan.limits.crmPipelines === -1);

    setAiAgents(plan.limits.aiAgents === -1 ? 5 : plan.limits.aiAgents);
    setAiAgentsUnlimited(plan.limits.aiAgents === -1);

    setWhatsappConnections(plan.limits.whatsappConnections);
    setInstagramConnections(plan.limits.instagramConnections);
    setTiktokConnections(plan.limits.tiktokConnections ?? 1);

    setAutomations(plan.limits.automations === -1 ? 15 : (plan.limits.automations ?? 5));
    setAutomationsUnlimited(plan.limits.automations === -1);

    setTransparentCheckout(plan.limits.transparentCheckout !== false);

    setTeamMembers(plan.limits.teamMembers === -1 ? 10 : plan.limits.teamMembers);
    setTeamMembersUnlimited(plan.limits.teamMembers === -1);

    setMonthlyAiMessages(plan.limits.monthlyAiMessages === -1 ? 10000 : plan.limits.monthlyAiMessages);
    setMonthlyAiMessagesUnlimited(plan.limits.monthlyAiMessages === -1);

    setFeatures(plan.features || []);
    setIsModalOpen(true);
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleToggleStatus = async (planId: string) => {
    setTogglingPlanId(planId);
    try {
      const res = await togglePlanStatusAction(planId);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, isActive: res.isActive } : p))
        );
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao alterar status do plano.");
    } finally {
      setTogglingPlanId(null);
    }
  };

  const handleToggleLandingVisibility = async (planId: string) => {
    try {
      const res = await togglePlanLandingVisibilityAction(planId);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, showOnLandingPage: res.showOnLandingPage } : p))
        );
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao alterar visibilidade na Landing Page.");
    }
  };

  const handleExecuteDelete = async (planId: string) => {
    try {
      const res = await deletePlanAction(planId);
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao excluir o plano.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Digite o nome do plano.");
      return;
    }

    setIsSubmitting(true);
    try {
      const planPayload = {
        id: editingPlan?.id,
        name: name.trim(),
        description: description.trim(),
        priceMonthly: Number(priceMonthly),
        priceYearly: Number(priceYearly),
        colorScheme,
        badge: badge.trim() || undefined,
        isPopular,
        isActive,
        showOnLandingPage,
        limits: {
          contacts: contactsUnlimited ? -1 : Number(contacts),
          crmPipelines: crmPipelinesUnlimited ? -1 : Number(crmPipelines),
          aiAgents: aiAgentsUnlimited ? -1 : Number(aiAgents),
          whatsappConnections: Number(whatsappConnections),
          instagramConnections: Number(instagramConnections),
          tiktokConnections: Number(tiktokConnections),
          automations: automationsUnlimited ? -1 : Number(automations),
          transparentCheckout: Boolean(transparentCheckout),
          teamMembers: teamMembersUnlimited ? -1 : Number(teamMembers),
          monthlyAiMessages: monthlyAiMessagesUnlimited ? -1 : Number(monthlyAiMessages),
        },
        features,
      };

      const res = await savePlanAction(planPayload);
      if (res.success && res.plan) {
        toast.success(res.message);
        if (editingPlan) {
          setPlans((prev) => prev.map((p) => (p.id === res.plan!.id ? res.plan! : p)));
        } else {
          setPlans((prev) => [...prev, res.plan!]);
        }
        setIsModalOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Falha ao salvar plano.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Conteúdo Central da Página (Apenas 1 Cabeçalho Principal no Topo) ── */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 font-sans">
        
        {/* ── Barra Secundária de Ações da Página (Card Branco Alinhado) ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 transition-all">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-[#007BFF] shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900 tracking-tight font-inter">
                Catálogo de Planos Comerciais
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200/70 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {plans.length} modelos de assinatura configurados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className={`group relative inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md active:scale-95 ${
                isModalOpen && !editingPlan
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                  : "bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white hover:shadow-[#007BFF]/25 hover:-translate-y-0.5"
              }`}
              title={isModalOpen && !editingPlan ? "Fechar área de criação" : "Criar novo plano"}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-xs ${
                  isModalOpen && !editingPlan
                    ? "bg-slate-200 text-slate-700 rotate-90"
                    : "bg-white text-[#007BFF] group-hover:rotate-90 group-hover:scale-110"
                }`}
              >
                {isModalOpen && !editingPlan ? (
                  <X className="w-4 h-4 transition-transform duration-300" />
                ) : (
                  <Plus className="w-4 h-4 transition-transform duration-300 stroke-[2.5]" />
                )}
              </span>

              <span className="font-inter tracking-wide font-bold">
                {isModalOpen && !editingPlan ? "Fechar" : "+ Criar"}
              </span>
            </button>
          </div>
        </div>
        
        {/* ── Construtor / Editor Expansível de Planos (In-Page Studio, Sem Popup Genérico) ── */}
        {isModalOpen && (
          <div
            ref={builderRef}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-300 relative"
          >
            {/* Barra de Acento Gradiente no Topo com base na cor selecionada */}
            <div
              className={`h-1.5 w-full bg-gradient-to-r ${COLOR_CLASSES[colorScheme]?.accent || "from-[#007BFF] to-[#38BDF8]"}`}
            />

            {/* Header do Construtor */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 font-inter">
                      {editingPlan ? `Editando Plano: ${editingPlan.name}` : "Construtor de Plano Comercial"}
                    </h2>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200/80">
                      {editingPlan ? "Modo de Edição" : "Novo Modelo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Defina precificação, limites de infraestrutura e conexões omnichannel com pré-visualização ao vivo.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Grid: 2 Colunas (Formulário à Esquerda + Live Preview à Direita) */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Coluna 1: Campos do Formulário */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  
                  {/* Seção 1: Identidade do Plano */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-[#007BFF]" />
                      <span>1. Identidade & Visual do Plano</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nome do Plano *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Bipe Scale VIP"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/10 focus:outline-hidden transition-all bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Badge de Destaque (Opcional)</label>
                        <input
                          type="text"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="Ex: Mais Vendido, Exclusivo"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/10 focus:outline-hidden transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Descrição Comercial Curta</label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Para operações consolidadas com alto volume de tráfego, múltiplos números e times..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/10 focus:outline-hidden transition-all bg-white resize-none"
                      />
                    </div>

                    {/* Seletor Visual da Paleta de Cores de Acento */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>Paleta de Cor de Acento</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Define a cor da barra superior, selos e realces do plano)
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: COLOR_PALETTES.find((c) => c.id === colorScheme)?.dotColor || "#007BFF",
                            }}
                          />
                          {COLOR_PALETTES.find((c) => c.id === colorScheme)?.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {COLOR_PALETTES.map((c) => {
                          const isSelected = colorScheme === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setColorScheme(c.id)}
                              className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer relative group ${
                                isSelected
                                  ? `${c.borderClass} ${c.ringColor} ring-2 bg-white shadow-xs scale-[1.02]`
                                  : `border-slate-200/90 text-slate-600 bg-white ${c.hoverBg} hover:border-slate-300`
                              }`}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                                style={{ backgroundColor: c.dotColor }}
                              >
                                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                              </div>
                              <span className="text-[11px] font-bold truncate max-w-full text-slate-700">
                                {c.label}
                              </span>
                              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${c.gradientClass}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Seção 2: Precificação */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. Precificação & Faturamento</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Preço Mensal (R$/mês) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            min={0}
                            required
                            value={priceMonthly}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPriceMonthly(val);
                              if (!editingPlan) {
                                setPriceYearly(val * 10);
                              }
                            }}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/10 focus:outline-hidden transition-all bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Preço Anual (R$/ano) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            min={0}
                            required
                            value={priceYearly}
                            onChange={(e) => setPriceYearly(Number(e.target.value))}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/10 focus:outline-hidden transition-all bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 3: Cotas & Limites de Infraestrutura */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>3. Cotas & Limites de Infraestrutura</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {/* WhatsApp */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp API</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={whatsappConnections}
                          onChange={(e) => setWhatsappConnections(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                        />
                        <span className="text-[10px] text-slate-400">Número(s) conectados</span>
                      </div>

                      {/* Instagram Direct */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-pink-500" />
                          <span>Instagram Direct</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={instagramConnections}
                          onChange={(e) => setInstagramConnections(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                        />
                        <span className="text-[10px] text-slate-400">Perfis conectados</span>
                      </div>

                      {/* TikTok Direct */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#007BFF]" />
                          <span>TikTok Direct</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={tiktokConnections}
                          onChange={(e) => setTiktokConnections(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                        />
                        <span className="text-[10px] text-slate-400">Perfis TikTok integrados</span>
                      </div>

                      {/* Agentes de IA */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-[#6366F1]" />
                            <span>Agentes IA</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={aiAgentsUnlimited}
                              onChange={(e) => setAiAgentsUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={aiAgentsUnlimited}
                          min={1}
                          value={aiAgents}
                          onChange={(e) => setAiAgents(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Atendentes robóticos</span>
                      </div>

                      {/* Funil CRM */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Funil CRM</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={crmPipelinesUnlimited}
                              onChange={(e) => setCrmPipelinesUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={crmPipelinesUnlimited}
                          min={1}
                          value={crmPipelines}
                          onChange={(e) => setCrmPipelines(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Funis adicionais (+1 Principal gratuito do sistema)</span>
                      </div>

                      {/* Contatos (sem o sufixo CRM) */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#007BFF]" />
                            <span>Contatos</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={contactsUnlimited}
                              onChange={(e) => setContactsUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={contactsUnlimited}
                          min={100}
                          value={contacts}
                          onChange={(e) => setContacts(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Capacidade de leads</span>
                      </div>

                      {/* Automações */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Automações</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={automationsUnlimited}
                              onChange={(e) => setAutomationsUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={automationsUnlimited}
                          min={1}
                          value={automations}
                          onChange={(e) => setAutomations(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Fluxos automáticos ativos</span>
                      </div>

                      {/* Checkout Transparente */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Checkout Transparente</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={transparentCheckout}
                            onChange={(e) => setTransparentCheckout(e.target.checked)}
                            className="rounded text-[#007BFF]"
                          />
                          <span className="text-xs font-semibold text-slate-800">Incluso no plano</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Venda direta com Pix e Cartão</span>
                      </div>

                      {/* Membros de Equipe */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-600" />
                            <span>Membros de Equipe</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={teamMembersUnlimited}
                              onChange={(e) => setTeamMembersUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={teamMembersUnlimited}
                          min={1}
                          value={teamMembers}
                          onChange={(e) => setTeamMembers(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Operadores no chat</span>
                      </div>

                      {/* Mensagens IA/mês */}
                      <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            <span>Mensagens IA</span>
                          </label>
                          <label className="text-[10.5px] text-[#007BFF] font-semibold flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={monthlyAiMessagesUnlimited}
                              onChange={(e) => setMonthlyAiMessagesUnlimited(e.target.checked)}
                              className="rounded"
                            />
                            Ilimitado
                          </label>
                        </div>
                        <input
                          type="number"
                          disabled={monthlyAiMessagesUnlimited}
                          min={100}
                          value={monthlyAiMessages}
                          onChange={(e) => setMonthlyAiMessages(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white disabled:bg-slate-100"
                        />
                        <span className="text-[10px] text-slate-400">Por mês faturado</span>
                      </div>
                    </div>
                  </div>

                  {/* Seção 4: Recursos & Benefícios */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <BipeCheckBadge size={16} />
                      <span>4. Lista de Recursos Inclusos</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        placeholder="Ex: Treinamento com arquivos PDF e base de conhecimento..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#007BFF] focus:outline-hidden bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs text-slate-700 border border-slate-200/80 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BipeCheckBadge size={14} className="shrink-0" />
                            <span className="truncate" title={feat}>{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seção 5: Chaves de Ativação */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded text-[#007BFF]"
                      />
                      <span className="text-xs font-bold text-slate-800">Plano Ativo no Sistema</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={showOnLandingPage}
                        onChange={(e) => setShowOnLandingPage(e.target.checked)}
                        className="rounded text-[#007BFF]"
                      />
                      <span className="text-xs font-bold text-slate-800">Visível no Site Público</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="rounded text-[#007BFF]"
                      />
                      <span className="text-xs font-bold text-slate-800">Destaque "Mais Vendido"</span>
                    </label>
                  </div>

                </div>

                {/* Coluna 2: Live Preview do Card em Tempo Real */}
                <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#007BFF]" />
                        Pré-visualização do Card
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Tempo Real
                      </span>
                    </div>

                    {/* O Card Renderizado ao Vivo! */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 relative overflow-hidden shadow-md">
                      {/* Barra de Acento Dinâmica */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${COLOR_CLASSES[colorScheme]?.accent || "from-[#007BFF] to-[#38BDF8]"}`}
                      />

                      {/* Badge & Tags */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        {badge ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white">
                            {badge}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                            {name ? name.replace(/^Bipe\s+/i, "") : "Plano"}
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-[#007BFF] border-blue-200">
                            {showOnLandingPage ? "No Site" : "Oculto"}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            {isActive ? "Ativo" : "Pausado"}
                          </span>
                        </div>
                      </div>

                      {/* Título & Descrição */}
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                        {name || "Nome do Plano"}
                      </h4>
                      <p className="text-[12px] text-slate-500 leading-snug mt-1 h-[34px] line-clamp-2">
                        {description || "Descrição comercial resumida do plano..."}
                      </p>

                      {/* Bloco de Preço */}
                      <div className="my-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100/90">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-slate-400">R$</span>
                          <span className="text-[26px] font-black text-slate-900 tracking-tight leading-none">
                            {priceMonthly.toLocaleString("pt-BR")}
                          </span>
                          <span className="text-xs font-medium text-slate-500">/mês</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-1.5">
                          <span>R$ {priceYearly.toLocaleString("pt-BR")}/ano</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 font-normal">Faturamento anual</span>
                        </div>
                      </div>

                      {/* Limites de Infraestrutura com Divisões Limpas (Estilo Site) */}
                      <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 divide-y divide-slate-100 text-xs text-left">
                        {/* WhatsApp API */}
                        <div className="flex items-center justify-between pb-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
                            <span>WhatsApp</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {whatsappConnections === -1 ? "Ilimitado" : `${whatsappConnections}x`}
                          </strong>
                        </div>

                        {/* Instagram Direct */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                            <span>Instagram</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {instagramConnections === -1 ? "Ilimitado" : `${instagramConnections}x`}
                          </strong>
                        </div>

                        {/* TikTok Direct */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <TikTokIcon className="w-3.5 h-3.5 text-cyan-500" />
                            <span>TikTok</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {tiktokConnections === -1 ? "Ilimitado" : `${tiktokConnections}x`}
                          </strong>
                        </div>

                        {/* Funil CRM */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Funil CRM</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {crmPipelinesUnlimited ? "Ilimitados (+1 Principal)" : `${crmPipelines} ${crmPipelines === 1 ? "adicional" : "adicionais"} (+1 Principal)`}
                          </strong>
                        </div>

                        {/* Contatos */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Users className="w-3.5 h-3.5 text-[#007BFF]" />
                            <span>Contatos</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {contactsUnlimited ? "Ilimitados" : contacts.toLocaleString("pt-BR")}
                          </strong>
                        </div>

                        {/* Automações */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Automações</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {automationsUnlimited ? "Ilimitadas" : `${automations} ativas`}
                          </strong>
                        </div>

                        {/* Checkout Transparente */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Checkout Transparente</span>
                          </span>
                          <strong className="text-emerald-600 font-semibold">
                            {transparentCheckout ? "Incluso" : "Opcional"}
                          </strong>
                        </div>

                        {/* Membros de Equipe */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Membros de Equipe</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {teamMembersUnlimited ? "Ilimitados" : `${teamMembers} operadores`}
                          </strong>
                        </div>

                        {/* Agentes IA */}
                        <div className="flex items-center justify-between py-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Bot className="w-3.5 h-3.5 text-[#6366F1]" />
                            <span>Agentes IA</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {aiAgentsUnlimited ? "Ilimitados" : `${aiAgents} agente(s)`}
                          </strong>
                        </div>

                        {/* Mensagens IA/mês */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            <span>Mensagens IA/mês</span>
                          </span>
                          <strong className="text-slate-900 font-semibold">
                            {monthlyAiMessagesUnlimited ? "Ilimitadas" : monthlyAiMessages.toLocaleString("pt-BR")}
                          </strong>
                        </div>
                      </div>

                      {/* Recursos Inclusos com Divisões Limpas e Check Verde */}
                      <div className="pt-3.5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            Recursos Inclusos:
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {features.length} {features.length === 1 ? "recurso" : "recursos"}
                          </span>
                        </div>
                        <ul className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                          {features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug py-1.5 first:pt-0.5 last:pb-0">
                              <BipeCheckBadge size={13} className="shrink-0 mt-0.5" />
                              <span className="break-words">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Botões de Ação do Construtor */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007BFF] to-[#6366F1] shadow-md hover:shadow-lg transition-all cursor-pointer text-center disabled:opacity-50"
                      >
                        {isSubmitting ? "Salvando..." : editingPlan ? "Salvar Alterações" : "Publicar Novo Plano"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* ── Grid de Cards de Planos Perfeitamente Alinhados ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const isToggling = togglingPlanId === plan.id;
            const currentColorScheme = plan.colorScheme || "blue";
            const colorClasses = COLOR_CLASSES[currentColorScheme] || COLOR_CLASSES.blue;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col p-5 relative overflow-hidden group shadow-xs ${
                  plan.isPopular ? "border-[#007BFF] shadow-sm ring-1 ring-[#007BFF]/25" : "border-[#E2E8F0]"
                } ${colorClasses.borderHover}`}
              >
                {/* Barra de Acento Superior no Topo do Card */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.accent}`} />

                {/* 1. Header do Card: Badges de Destaque, Visibilidade e Status */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div className="min-w-0">
                    {plan.badge ? (
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-2xs truncate">
                        {plan.badge}
                      </span>
                    ) : (
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border truncate ${colorClasses.pill}`}>
                        {plan.name.replace(/^Bipe\s+/i, "")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botão de Visibilidade na Landing Page */}
                    <button
                      type="button"
                      onClick={() => handleToggleLandingVisibility(plan.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border transition-all cursor-pointer ${
                        plan.showOnLandingPage !== false
                          ? "bg-blue-50 text-[#007BFF] border-blue-200 hover:bg-blue-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={
                        plan.showOnLandingPage !== false
                          ? "Visível no site público (Clique para ocultar)"
                          : "Oculto no site público (Clique para exibir)"
                      }
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span>{plan.showOnLandingPage !== false ? "No Site" : "Oculto"}</span>
                    </button>

                    {/* Botão de Status Ativo/Pausado */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(plan.id)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                        plan.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                      title={plan.isActive ? "Clique para pausar este plano" : "Clique para ativar este plano"}
                    >
                      {plan.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Pausado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Nome do Plano e Descrição com Altura Fixada para Alinhamento Perfeito */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-[#007BFF] transition-colors truncate" title={plan.name}>
                  {plan.name}
                </h3>
                <p className="text-[12px] text-slate-500 leading-snug mt-1 h-[34px] line-clamp-2" title={plan.description}>
                  {plan.description}
                </p>

                {/* 3. Bloco Estruturado de Preço Mensal & Anual (Sem menção de 2 meses grátis) */}
                <div className="my-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100/90 flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-400">R$</span>
                    <span className="text-[26px] font-black text-slate-900 tracking-tight leading-none">
                      {plan.priceMonthly.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/mês</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-1.5">
                    <span>R$ {plan.priceYearly.toLocaleString("pt-BR")}/ano</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 font-normal">Faturamento anual</span>
                  </div>
                </div>

                {/* 4. Limites de Infraestrutura com Divisões Limpas (Estilo Site) */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 divide-y divide-slate-100 text-xs text-left">
                  {/* WhatsApp */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>WhatsApp</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.whatsappConnections === -1 ? "Ilimitado" : `${plan.limits.whatsappConnections}x`}
                    </strong>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span>Instagram</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.instagramConnections === -1 ? "Ilimitado" : `${plan.limits.instagramConnections}x`}
                    </strong>
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <TikTokIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>TikTok</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {(plan.limits.tiktokConnections ?? 1) === -1 ? "Ilimitado" : `${plan.limits.tiktokConnections ?? 1}x`}
                    </strong>
                  </div>

                  {/* Funil CRM */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Funil CRM</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {(plan.limits.crmPipelines ?? 1) === -1
                        ? "Ilimitados (+1 Principal)"
                        : `${plan.limits.crmPipelines ?? 1} ${(plan.limits.crmPipelines ?? 1) === 1 ? "adicional (+1 Principal)" : "adicionais (+1 Principal)"}`}
                    </strong>
                  </div>

                  {/* Contatos */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <Users className="w-3.5 h-3.5 text-[#007BFF] shrink-0" />
                      <span>Contatos</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.contacts === -1
                        ? "Ilimitados"
                        : plan.limits.contacts.toLocaleString("pt-BR")}
                    </strong>
                  </div>

                  {/* Automações */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Automações</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {(plan.limits.automations ?? 5) === -1
                        ? "Ilimitadas"
                        : `${plan.limits.automations ?? 5} ativas`}
                    </strong>
                  </div>

                  {/* Checkout Transparente */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Checkout Transparente</span>
                    </span>
                    <strong className="text-emerald-600 font-semibold shrink-0 text-right">
                      {plan.limits.transparentCheckout !== false ? "Incluso" : "Opcional"}
                    </strong>
                  </div>

                  {/* Membros de Equipe */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Membros de Equipe</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.teamMembers === -1
                        ? "Ilimitados"
                        : `${plan.limits.teamMembers} ${plan.limits.teamMembers === 1 ? "membro" : "membros"}`}
                    </strong>
                  </div>

                  {/* Agentes IA */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <Bot className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                      <span>Agentes de IA</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.aiAgents === -1
                        ? "Ilimitados"
                        : `${plan.limits.aiAgents} ${plan.limits.aiAgents === 1 ? "agente" : "agentes"}`}
                    </strong>
                  </div>

                  {/* Mensagens IA/mês */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Mensagens IA/mês</span>
                    </span>
                    <strong className="text-slate-900 font-semibold shrink-0 text-right">
                      {plan.limits.monthlyAiMessages === -1
                        ? "Ilimitadas"
                        : plan.limits.monthlyAiMessages.toLocaleString("pt-BR")}
                    </strong>
                  </div>
                </div>

                {/* 5. Lista de Recursos Inclusos (Com Selo BipeCheckBadge Verde Oficial) */}
                <div className="pt-3.5 border-t border-slate-100 flex-1 flex flex-col justify-start">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                      Recursos Inclusos:
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {plan.features.length} {plan.features.length === 1 ? "recurso" : "recursos"}
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug py-2 first:pt-0.5 last:pb-0"
                        title={feat}
                      >
                        <BipeCheckBadge size={14} className="shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 6. Ações de Edição e Exclusão no Rodapé (Fixadas na Base) */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-[#007BFF] border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Plano</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanToDelete({ id: plan.id, name: plan.name })}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                    title="Excluir Plano"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modal Interativo com Animação de Copo de Água Enchendo + Salto & Chacoalho ── */}
        <WaterGlassDeleteModal
          isOpen={!!planToDelete}
          planId={planToDelete?.id || ""}
          planName={planToDelete?.name || ""}
          onClose={() => setPlanToDelete(null)}
          onConfirmDelete={handleExecuteDelete}
        />
      </main>
    </>
  );
}
