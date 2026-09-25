"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Check,
  Save,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
  Mic,
  Calculator,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Palette,
  FileText,
  Sliders,
  Search,
  Globe,
  Link2,
  Plus,
  Trash2,
  Heart,
  Building2,
  UserCheck,
  Star,
  Scale,
  Rocket,
  ShieldCheck,
  Puzzle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SiteContent,
  TestimonialItem,
  FaqItem,
  BacklinkItem,
  AboutPillar,
} from "../types/site-content.types";
import { CustomPlan } from "../../plans/actions/plans.actions";
import { saveSiteContentAction, resetSiteContentAction } from "../actions/site-content.actions";
import { LandingPageView } from "./landing-page-view";

interface SiteEditorClientProps {
  initialContent: SiteContent;
  plans: CustomPlan[];
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function SiteEditorClient({ initialContent, plans }: SiteEditorClientProps) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");

  // Handler for deep nested state update
  const updateSection = <K extends keyof SiteContent>(section: K, updates: Partial<SiteContent[K]>) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
  };

  // Testimonial helpers
  const updateTestimonialItem = (index: number, updates: Partial<TestimonialItem>) => {
    const newItems = [...(content.testimonials?.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    updateSection("testimonials", { items: newItems });
  };

  const addTestimonialItem = () => {
    const newItem: TestimonialItem = {
      id: `test-${Date.now()}`,
      name: "Novo Cliente",
      role: "Proprietário(a)",
      company: "Minha Empresa",
      segment: "Comércio",
      avatarUrl: "/testimonials/dra-camila.jpg",
      metric: "+35% de Conversão",
      quote: "O atendimento 24/7 aumentou significativamente a conversão da nossa loja.",
      stars: 5,
    };
    updateSection("testimonials", { items: [...(content.testimonials?.items || []), newItem] });
  };

  const removeTestimonialItem = (index: number) => {
    const newItems = (content.testimonials?.items || []).filter((_, i) => i !== index);
    updateSection("testimonials", { items: newItems });
  };

  // FAQ helpers
  const updateFaqItem = (index: number, updates: Partial<FaqItem>) => {
    const newItems = [...(content.faq?.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    updateSection("faq", { items: newItems });
  };

  const addFaqItem = () => {
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: "Nova dúvida frequente?",
      answer: "Resposta detalhada explicando como a funcionalidade do BipeSend resolve esse problema com agilidade.",
    };
    updateSection("faq", { items: [...(content.faq?.items || []), newItem] });
  };

  const removeFaqItem = (index: number) => {
    const newItems = (content.faq?.items || []).filter((_, i) => i !== index);
    updateSection("faq", { items: newItems });
  };

  // Pillar helpers
  const updatePillarItem = (index: number, updates: Partial<AboutPillar>) => {
    const newPillars = [...(content.aboutUs?.pillars || [])];
    newPillars[index] = { ...newPillars[index], ...updates };
    updateSection("aboutUs", { pillars: newPillars });
  };

  // Stat helpers
  const updateStatItem = (index: number, updates: { label?: string; value?: string }) => {
    const newStats = [...(content.aboutUs?.stats || [])];
    newStats[index] = { ...newStats[index], ...updates };
    updateSection("aboutUs", { stats: newStats });
  };

  // Backlink helpers
  const updateBacklinkItem = (index: number, updates: Partial<BacklinkItem>) => {
    const newLinks = [...(content.seo?.backlinks || [])];
    newLinks[index] = { ...newLinks[index], ...updates };
    updateSection("seo", { backlinks: newLinks });
  };

  const addBacklinkItem = () => {
    const newLink: BacklinkItem = {
      id: `link-${Date.now()}`,
      title: "Novo Parceiro / Diretório",
      url: "https://bipesend.com.br",
    };
    updateSection("seo", { backlinks: [...(content.seo?.backlinks || []), newLink] });
  };

  const removeBacklinkItem = (index: number) => {
    const newLinks = (content.seo?.backlinks || []).filter((_, i) => i !== index);
    updateSection("seo", { backlinks: newLinks });
  };

  const updateDomainSeo = (
    domainKey: "landing" | "app" | "admin",
    field: "tabTitle" | "metaDescription",
    value: string
  ) => {
    const currentDomains = content.seo?.domains || {};
    const defaultDomains = {
      landing: {
        domain: "bipesend.com.br",
        tabTitle: "Venda Mais com sua Própria Agente de IA e Ferramentas Integradas | BipeSend",
        metaDescription: "A plataforma completa que une atendimento omnichannel, agente de IA com personalidade própria, respostas inteligentes e envio de áudios com voz natural.",
      },
      app: {
        domain: "app.bipesend.com.br",
        tabTitle: "BipeSend | Painel do Cliente • Agentes de IA, CRM Plus & WhatsApp",
        metaDescription: "Acesse seu workspace BipeSend — Plataforma Oficial de Agentes de IA, CRM Plus e WhatsApp Multicanal.",
      },
      admin: {
        domain: "admin.bipesend.com.br",
        tabTitle: "BipeSend SuperAdmin | Painel Master & Gestão da Plataforma",
        metaDescription: "Painel de controle master da plataforma BipeSend — Gestão global de tenants e planos.",
      },
    };
    const currentTarget = currentDomains[domainKey] || defaultDomains[domainKey];

    updateSection("seo", {
      domains: {
        ...currentDomains,
        [domainKey]: {
          ...currentTarget,
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveSiteContentAction(content);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao publicar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Deseja realmente restaurar todos os textos e seções para o padrão de fábrica?")) return;
    setIsResetting(true);
    try {
      const res = await resetSiteContentAction();
      if (res.success && res.content) {
        setContent(res.content);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao resetar dados.");
    } finally {
      setIsResetting(false);
    }
  };

  const sectionBlocks = [
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "socialProof", label: "Carrossel", icon: Building2 },
    { id: "features", label: "Recursos", icon: Layers },
    { id: "voiceDemo", label: "Voz & Áudio", icon: Mic },
    { id: "comparison", label: "Comparativo", icon: Scale },
    { id: "aboutUs", label: "Sobre Nós", icon: Heart },
    { id: "testimonials", label: "Depoimentos", icon: UserCheck },
    { id: "roiCalculator", label: "ROI", icon: Calculator },
    { id: "pricing", label: "Planos", icon: CreditCard },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "finalCta", label: "CTA Final", icon: Rocket },
    { id: "footer", label: "Rodapé", icon: FileText },
    { id: "seo", label: "SEO Google", icon: Search },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#0F172A] font-poppins overflow-hidden">
      
      {/* ── Top Bar de Controle e Dispositivos (Header do Editor) ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 shadow-2xs">
        
        {/* Esquerda: Voltar e Identificação */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-[#0F172A] font-inter flex items-center gap-1.5">
              <Puzzle className="w-4 h-4 text-[#007BFF]" />
              Construtor Modular de Landing Page
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold bg-blue-50 text-[#007BFF] px-2 py-0.5 rounded-full border border-blue-200/80">
              100% Flexbox & Editável
            </span>
          </div>
        </div>

        {/* Centro: Controles de Viewport (Desktop / Tablet / Celular) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "desktop"
                ? "bg-white text-[#007BFF] shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Visualizar em Desktop (1440px)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "tablet"
                ? "bg-white text-[#007BFF] shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Visualizar em Tablet (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "mobile"
                ? "bg-white text-[#007BFF] shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Visualizar em Celular iPhone (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Direita: Ações de Publicar e Resetar */}
        <div className="flex items-center gap-2">
          <a
            href="/landing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#007BFF] text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Abrir a Landing Page em uma nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ver Site Ativo</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            title="Restaurar textos e blocos para o padrão original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Restaurar</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Salvando..." : "Publicar Site"}</span>
          </button>
        </div>

      </header>

      {/* ── Corpo Dividido: Painel Lateral de Edição + Canvas de Visualização ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── PAINEL ESQUERDO: SIDEBAR DE EDIÇÃO MODULAR (ESTILO ELEMENTOR PRO) ── */}
        <aside className="w-[390px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-md">
          
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Blocos do Quebra-Cabeça
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                100% Editável
              </span>
            </div>

            {/* Atalhos Rápidos Flexbox (Navegação Instantânea entre Seções) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {sectionBlocks.map((block) => {
                const Icon = block.icon;
                const isActive = activeTab === block.id;
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setActiveTab(block.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 font-bold transition-all ${
                      isActive
                        ? "bg-[#007BFF] text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{block.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Acordeões com Rolagem Suave */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            
            {/* 1. Barra de Anúncio / Topo */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "announcement" ? "" : "announcement")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  <span>Aviso de Topo (Announcement)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "announcement" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "announcement" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.announcement.enabled}
                      onChange={(e) => updateSection("announcement", { enabled: e.target.checked })}
                      className="rounded text-[#007BFF]"
                    />
                    <span className="font-semibold text-slate-700">Ativar Barra de Aviso no Topo</span>
                  </label>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge do Aviso</label>
                    <input
                      type="text"
                      value={content.announcement.badge}
                      onChange={(e) => updateSection("announcement", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#007BFF] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Texto do Anúncio</label>
                    <textarea
                      rows={2}
                      value={content.announcement.text}
                      onChange={(e) => updateSection("announcement", { text: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#007BFF] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Texto do Link</label>
                      <input
                        type="text"
                        value={content.announcement.linkText}
                        onChange={(e) => updateSection("announcement", { linkText: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Destino (URL)</label>
                      <input
                        type="text"
                        value={content.announcement.linkUrl}
                        onChange={(e) => updateSection("announcement", { linkUrl: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Hero Section */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "hero" ? "" : "hero")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#007BFF]" />
                  <span>Hero Section (Headline & CTAs)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "hero" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "hero" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge Superior</label>
                    <input
                      type="text"
                      value={content.hero.badge}
                      onChange={(e) => updateSection("hero", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título - Linha 1</label>
                    <input
                      type="text"
                      value={content.hero.titleLine1}
                      onChange={(e) => updateSection("hero", { titleLine1: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-blue-600">Palavra em Destaque (Gradiente)</label>
                    <input
                      type="text"
                      value={content.hero.titleHighlight}
                      onChange={(e) => updateSection("hero", { titleHighlight: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-blue-300 text-xs font-bold text-blue-700 bg-blue-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título - Linha 2</label>
                    <input
                      type="text"
                      value={content.hero.titleLine2}
                      onChange={(e) => updateSection("hero", { titleLine2: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo (Benefício & ROI)</label>
                    <textarea
                      rows={3}
                      value={content.hero.subtitle}
                      onChange={(e) => updateSection("hero", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Texto Botão 1</label>
                      <input
                        type="text"
                        value={content.hero.primaryCtaText}
                        onChange={(e) => updateSection("hero", { primaryCtaText: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Texto Botão 2</label>
                      <input
                        type="text"
                        value={content.hero.secondaryCtaText}
                        onChange={(e) => updateSection("hero", { secondaryCtaText: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Carrossel & Marquee de Marcas */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "socialProof" ? "" : "socialProof")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>Carrossel & Marquee (+10k Empresas)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "socialProof" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "socialProof" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge Superior</label>
                    <input
                      type="text"
                      value={content.socialProof?.badge || "RESULTADOS REAIS"}
                      onChange={(e) => updateSection("socialProof", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Contador de Empresas</label>
                    <input
                      type="text"
                      value={content.socialProof?.companiesCount || "+10.000"}
                      onChange={(e) => updateSection("socialProof", { companiesCount: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Headline Social Proof</label>
                    <textarea
                      rows={2}
                      value={content.socialProof?.title || "Quem não usa fica para trás: +de 10.000 empresas automatizam seus processos"}
                      onChange={(e) => updateSection("socialProof", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1 text-slate-600 text-[11px]">
                    <span className="font-bold text-[#007BFF] block">12 Segmentos Minimalistas Ativos:</span>
                    <p>Academia, Hamburgueria, Pizzaria, Odonto, Estética, Buffet, Sorveteria, Tecnologia, Conserto de Celulares, Decoração, Artesanato e Papelaria exibidos com ícone vetorial e tipografia limpa.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Recursos & Diferenciais */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "features" ? "" : "features")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Diferenciais & Recursos</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "features" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "features" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge da Seção</label>
                    <input
                      type="text"
                      value={content.features.badge}
                      onChange={(e) => updateSection("features", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título da Seção</label>
                    <input
                      type="text"
                      value={content.features.title}
                      onChange={(e) => updateSection("features", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.features.subtitle}
                      onChange={(e) => updateSection("features", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Demonstração de Voz & Áudio */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "voiceDemo" ? "" : "voiceDemo")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-500" />
                  <span>Envio de Áudio & Voz Humanizada</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "voiceDemo" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "voiceDemo" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge</label>
                    <input
                      type="text"
                      value={content.voiceDemo.badge}
                      onChange={(e) => updateSection("voiceDemo", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título</label>
                    <input
                      type="text"
                      value={content.voiceDemo.title}
                      onChange={(e) => updateSection("voiceDemo", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Frase da Amostra Falada</label>
                    <textarea
                      rows={3}
                      value={content.voiceDemo.sampleText}
                      onChange={(e) => updateSection("voiceDemo", { sampleText: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Comparativo Sem Bipe vs Com Bipe */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "comparison" ? "" : "comparison")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Comparativo (Sem Bipe vs Com Bipe)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "comparison" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "comparison" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge</label>
                    <input
                      type="text"
                      value={content.comparison?.badge || "COMPARATIVO DIRETO"}
                      onChange={(e) => updateSection("comparison", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título</label>
                    <input
                      type="text"
                      value={content.comparison?.title || "Por que empresas que migram para o BipeSend faturam mais?"}
                      onChange={(e) => updateSection("comparison", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.comparison?.subtitle || "Veja o abismo entre o atendimento manual e a máquina de vendas da BipeSend."}
                      onChange={(e) => updateSection("comparison", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Sobre Nós & Propósito */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "aboutUs" ? "" : "aboutUs")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Sobre Nós & Propósito (#sobre)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "aboutUs" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "aboutUs" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge</label>
                    <input
                      type="text"
                      value={content.aboutUs?.badge || ""}
                      onChange={(e) => updateSection("aboutUs", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título da Seção</label>
                    <input
                      type="text"
                      value={content.aboutUs?.title || ""}
                      onChange={(e) => updateSection("aboutUs", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.aboutUs?.subtitle || ""}
                      onChange={(e) => updateSection("aboutUs", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">História da BipeSend</label>
                    <textarea
                      rows={4}
                      value={content.aboutUs?.story || ""}
                      onChange={(e) => updateSection("aboutUs", { story: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs leading-relaxed"
                    />
                  </div>

                  {/* 3 Pilares Modulares */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">3 Pilares Modulares:</span>
                    {content.aboutUs?.pillars?.map((pillar, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-600">Pilar 0{pIdx + 1}</span>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => updatePillarItem(pIdx, { title: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-semibold"
                          placeholder="Título do pilar"
                        />
                        <textarea
                          rows={2}
                          value={pillar.description}
                          onChange={(e) => updatePillarItem(pIdx, { description: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                          placeholder="Descrição do pilar"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Card do Fundador Germani Rodrigues */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Card do Fundador:</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-500 text-[11px]">Nome</label>
                        <input
                          type="text"
                          value={content.aboutUs?.founderName || ""}
                          onChange={(e) => updateSection("aboutUs", { founderName: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-500 text-[11px]">Cargo</label>
                        <input
                          type="text"
                          value={content.aboutUs?.founderRole || ""}
                          onChange={(e) => updateSection("aboutUs", { founderRole: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-500 text-[11px]">URL da Foto</label>
                      <input
                        type="text"
                        value={content.aboutUs?.founderPhotoUrl || ""}
                        onChange={(e) => updateSection("aboutUs", { founderPhotoUrl: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-500 text-[11px]">Citação (Quote)</label>
                      <textarea
                        rows={3}
                        value={content.aboutUs?.founderQuote || ""}
                        onChange={(e) => updateSection("aboutUs", { founderQuote: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs italic"
                      />
                    </div>
                  </div>

                  {/* 4 Métricas de Impacto */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">4 Métricas de Impacto:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {content.aboutUs?.stats?.map((st, sIdx) => (
                        <div key={sIdx} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => updateStatItem(sIdx, { value: e.target.value })}
                            className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs font-extrabold text-blue-600"
                            placeholder="Valor"
                          />
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => updateStatItem(sIdx, { label: e.target.value })}
                            className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-[11px] text-slate-500"
                            placeholder="Label"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 8. Depoimentos & Casos Reais dos 13 Segmentos */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "testimonials" ? "" : "testimonials")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Depoimentos Reais ({content.testimonials?.items?.length || 0} Segmentos)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "testimonials" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "testimonials" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge da Seção</label>
                    <input
                      type="text"
                      value={content.testimonials?.badge || ""}
                      onChange={(e) => updateSection("testimonials", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título</label>
                    <input
                      type="text"
                      value={content.testimonials?.title || ""}
                      onChange={(e) => updateSection("testimonials", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.testimonials?.subtitle || ""}
                      onChange={(e) => updateSection("testimonials", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  {/* Gerenciador de Cards de Depoimento */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Cards de Avaliação:</span>
                      <button
                        type="button"
                        onClick={addTestimonialItem}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007BFF] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Card</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {content.testimonials?.items?.map((item, tIdx) => (
                        <div key={item.id || tIdx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px]">
                              #{tIdx + 1} • {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {item.segment}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeTestimonialItem(tIdx)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Remover este depoimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateTestimonialItem(tIdx, { name: e.target.value })}
                              placeholder="Nome da pessoa"
                              className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={item.company}
                              onChange={(e) => updateTestimonialItem(tIdx, { company: e.target.value })}
                              placeholder="Nome da empresa"
                              className="px-2 py-1 rounded border border-slate-200 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => updateTestimonialItem(tIdx, { role: e.target.value })}
                              placeholder="Cargo"
                              className="px-2 py-1 rounded border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={item.metric}
                              onChange={(e) => updateTestimonialItem(tIdx, { metric: e.target.value })}
                              placeholder="Métrica (+40% vendas)"
                              className="px-2 py-1 rounded border border-slate-200 text-xs font-bold text-emerald-600"
                            />
                          </div>

                          <input
                            type="text"
                            value={item.avatarUrl}
                            onChange={(e) => updateTestimonialItem(tIdx, { avatarUrl: e.target.value })}
                            placeholder="URL da foto/logo"
                            className="w-full px-2 py-1 rounded border border-slate-200 text-[11px] font-mono"
                          />

                          <textarea
                            rows={2}
                            value={item.quote}
                            onChange={(e) => updateTestimonialItem(tIdx, { quote: e.target.value })}
                            placeholder="Texto do depoimento..."
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs italic"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 9. Calculadora de ROI */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "roiCalculator" ? "" : "roiCalculator")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Calculadora de ROI & Economia</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "roiCalculator" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "roiCalculator" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Custo Médio de Atendente Humano (R$/mês)</label>
                    <input
                      type="number"
                      value={content.roiCalculator.costPerHumanAgentMonth}
                      onChange={(e) => updateSection("roiCalculator", { costPerHumanAgentMonth: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Ticket Médio Estimado por Lead (R$)</label>
                    <input
                      type="number"
                      value={content.roiCalculator.avgLeadValue}
                      onChange={(e) => updateSection("roiCalculator", { avgLeadValue: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 10. Planos & Preços */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "pricing" ? "" : "pricing")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Planos & Preços (#planos)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "pricing" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "pricing" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-slate-700">
                    <span className="font-bold text-[#007BFF] block">Planos Conectados:</span>
                    <p className="text-[11px] text-slate-600">
                      Os valores e limites dos planos são integrados com a aba oficial de Planos.
                    </p>
                    <Link
                      href="/plans"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007BFF] hover:underline mt-1"
                    >
                      <span>Gerenciar catálogo de planos</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge de Desconto Anual</label>
                    <input
                      type="text"
                      value={content.pricing.yearlyDiscountBadge}
                      onChange={(e) => updateSection("pricing", { yearlyDiscountBadge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título da Garantia</label>
                    <input
                      type="text"
                      value={content.pricing.guaranteeTitle}
                      onChange={(e) => updateSection("pricing", { guaranteeTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Descrição da Garantia</label>
                    <textarea
                      rows={2}
                      value={content.pricing.guaranteeDescription}
                      onChange={(e) => updateSection("pricing", { guaranteeDescription: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 11. Perguntas Frequentes (FAQ) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "faq" ? "" : "faq")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Dúvidas Frequentes ({content.faq?.items?.length || 0} Perguntas)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "faq" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "faq" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título do FAQ</label>
                    <input
                      type="text"
                      value={content.faq.title}
                      onChange={(e) => updateSection("faq", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.faq.subtitle}
                      onChange={(e) => updateSection("faq", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Perguntas & Respostas:</span>
                      <button
                        type="button"
                        onClick={addFaqItem}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007BFF] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar FAQ</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {content.faq?.items?.map((faqItem, fIdx) => (
                        <div key={faqItem.id || fIdx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px]">
                              0{fIdx + 1}. Pergunta
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFaqItem(fIdx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Remover pergunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faqItem.question}
                            onChange={(e) => updateFaqItem(fIdx, { question: e.target.value })}
                            placeholder="Pergunta..."
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-semibold"
                          />
                          <textarea
                            rows={3}
                            value={faqItem.answer}
                            onChange={(e) => updateFaqItem(fIdx, { answer: e.target.value })}
                            placeholder="Resposta detalhada..."
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 12. CTA Final */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "finalCta" ? "" : "finalCta")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-600" />
                  <span>Chamada Final para Ação (CTA)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "finalCta" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "finalCta" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Badge</label>
                    <input
                      type="text"
                      value={content.finalCta?.badge || "COMECE HOJE MESMO"}
                      onChange={(e) => updateSection("finalCta", { badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Título</label>
                    <input
                      type="text"
                      value={content.finalCta?.title || "Pronto para colocar sua empresa no piloto automático?"}
                      onChange={(e) => updateSection("finalCta", { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Subtítulo</label>
                    <textarea
                      rows={2}
                      value={content.finalCta?.subtitle || "Junte-se a mais de 10.000 empresas ativas. Crie sua conta em 2 minutos."}
                      onChange={(e) => updateSection("finalCta", { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Texto do Botão CTA</label>
                    <input
                      type="text"
                      value={content.finalCta?.ctaButtonText || "Criar Minha Conta Grátis"}
                      onChange={(e) => updateSection("finalCta", { ctaButtonText: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 13. Rodapé & Contatos */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "footer" ? "" : "footer")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Rodapé & Contato</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "footer" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "footer" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Tagline</label>
                    <input
                      type="text"
                      value={content.footer.tagline}
                      onChange={(e) => updateSection("footer", { tagline: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">E-mail de Suporte</label>
                    <input
                      type="text"
                      value={content.footer.supportEmail}
                      onChange={(e) => updateSection("footer", { supportEmail: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Texto de Copyright</label>
                    <textarea
                      rows={2}
                      value={content.footer.copyright}
                      onChange={(e) => updateSection("footer", { copyright: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 14. SEO, Google SERP Preview & Backlinks */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "seo" ? "" : "seo")}
                className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-2 font-bold text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>SEO, Google SERP & Backlinks</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeTab === "seo" ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {activeTab === "seo" && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-4 text-xs">
                  
                  {/* Google SERP Live Preview Snippet */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Preview no Google (SERP Snippet):
                    </span>
                    <div className="space-y-0.5 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{content.seo?.canonicalUrl || "https://bipesend.com.br"}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                        {content.seo?.metaTitle || "BipeSend | Plataforma de Vendas e Atendimento"}
                      </h4>
                      <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                        {content.seo?.metaDescription || "Atenda seus clientes 24/7 com inteligência artificial, voz ultra-humana e CRM integrado."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-600">Meta Title Padrão (Google)</label>
                      <span className={`text-[10px] ${((content.seo?.metaTitle?.length || 0) > 65) ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                        {content.seo?.metaTitle?.length || 0}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={content.seo?.metaTitle || ""}
                      onChange={(e) => updateSection("seo", { metaTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-600">Meta Description Padrão</label>
                      <span className={`text-[10px] ${((content.seo?.metaDescription?.length || 0) > 160) ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                        {content.seo?.metaDescription?.length || 0}/155 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={content.seo?.metaDescription || ""}
                      onChange={(e) => updateSection("seo", { metaDescription: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Configuração de Título da Aba & SEO por Domínio */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#007BFF]" />
                        Títulos na Aba &amp; SEO por Domínio:
                      </span>
                    </div>

                    {/* Domínio 1: bipesend.com.br (Landing Page) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          bipesend.com.br (Landing)
                        </span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Título da Aba</label>
                        <input
                          type="text"
                          value={content.seo?.domains?.landing?.tabTitle ?? content.seo?.metaTitle ?? ""}
                          onChange={(e) => updateDomainSeo("landing", "tabTitle", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Meta Description</label>
                        <textarea
                          rows={2}
                          value={content.seo?.domains?.landing?.metaDescription ?? content.seo?.metaDescription ?? ""}
                          onChange={(e) => updateDomainSeo("landing", "metaDescription", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Domínio 2: app.bipesend.com.br (Painel do Cliente) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          app.bipesend.com.br (Painel do Cliente)
                        </span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Título da Aba</label>
                        <input
                          type="text"
                          value={content.seo?.domains?.app?.tabTitle ?? "BipeSend | Painel do Cliente • Agentes de IA, CRM Plus & WhatsApp"}
                          onChange={(e) => updateDomainSeo("app", "tabTitle", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Meta Description</label>
                        <textarea
                          rows={2}
                          value={content.seo?.domains?.app?.metaDescription ?? "Acesse seu workspace BipeSend — Plataforma Oficial de Agentes de IA, CRM Plus e WhatsApp Multicanal."}
                          onChange={(e) => updateDomainSeo("app", "metaDescription", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Domínio 3: admin.bipesend.com.br (SuperAdmin) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          admin.bipesend.com.br (SuperAdmin)
                        </span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Título da Aba</label>
                        <input
                          type="text"
                          value={content.seo?.domains?.admin?.tabTitle ?? "BipeSend SuperAdmin | Painel Master & Gestão da Plataforma"}
                          onChange={(e) => updateDomainSeo("admin", "tabTitle", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Meta Description</label>
                        <textarea
                          rows={2}
                          value={content.seo?.domains?.admin?.metaDescription ?? "Painel de controle master da plataforma BipeSend — Gestão global de tenants e planos."}
                          onChange={(e) => updateDomainSeo("admin", "metaDescription", e.target.value)}
                          className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">URL Canônica</label>
                    <input
                      type="text"
                      value={content.seo?.canonicalUrl || ""}
                      onChange={(e) => updateSection("seo", { canonicalUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">OG Image (Redes Sociais)</label>
                    <input
                      type="text"
                      value={content.seo?.ogImage || ""}
                      onChange={(e) => updateSection("seo", { ogImage: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  {/* Gerenciador de Backlinks / Parceiros */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Backlinks Parceiros no Rodapé:</span>
                      <button
                        type="button"
                        onClick={addBacklinkItem}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007BFF] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Link</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {content.seo?.backlinks?.map((linkItem, lIdx) => (
                        <div key={linkItem.id || lIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">#{lIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeBacklinkItem(lIdx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={linkItem.title}
                            onChange={(e) => updateBacklinkItem(lIdx, { title: e.target.value })}
                            placeholder="Texto âncora do link"
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-medium"
                          />
                          <input
                            type="text"
                            value={linkItem.url}
                            onChange={(e) => updateBacklinkItem(lIdx, { url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Rodapé da Barra de Edição */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Modo Modular Ativo • Visualização em Tempo Real
            </span>
          </div>

        </aside>

        {/* ── PAINEL DIREITO: CANVAS DE VISUALIZAÇÃO RESPONSIVO AO VIVO ── */}
        <main className="flex-1 overflow-y-auto bg-[#F1F5F9] p-2 sm:p-6 flex justify-center items-start">
          
          {/* Container Responsivo de Acordo com o Viewport Selecionado */}
          <div
            className={`transition-all duration-300 bg-white ${
              viewport === "desktop"
                ? "w-full max-w-[1440px] shadow-lg rounded-2xl border border-slate-200/80 overflow-hidden"
                : viewport === "tablet"
                ? "w-[768px] shadow-2xl rounded-3xl border-8 border-slate-800 overflow-hidden my-4"
                : "w-[375px] shadow-2xl rounded-[40px] border-[10px] border-slate-900 overflow-hidden my-4 relative"
            }`}
          >
            {/* Se estiver no modo celular, adiciona uma ilha dinâmica/notch no topo */}
            {viewport === "mobile" && (
              <div className="w-full bg-slate-900 h-6 flex items-center justify-center">
                <div className="w-24 h-3.5 bg-black rounded-full" />
              </div>
            )}

            <LandingPageView content={content} plans={plans} />
          </div>

        </main>

      </div>

    </div>
  );
}
