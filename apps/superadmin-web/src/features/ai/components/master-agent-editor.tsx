"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Bot,
  Volume2,
  Layers,
  ShieldCheck,
  Cpu,
  Zap,
  Coins,
  Sliders,
  Plus,
  Trash2,
  Play,
  VolumeX,
  HelpCircle,
  Info,
  CheckCircle2,
  User,
  Tag,
  MessageSquare,
  Flame,
  Brain,
  Scale,
  Rocket,
  FileText,
  X,
  Upload,
  ChevronRight,
  TrendingDown,
  Search,
  BookOpen,
  HeartHandshake,
  CheckCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { AiAgentTemplate, ClonedVoiceRecord } from "@bipesend/contracts";
import {
  AI_MODELS_CATALOG,
  calculateModelMessageCost,
  THINKING_MODE_PRESETS,
  AiModelCatalogItem,
} from "../types/germani.types";
import { MASTER_AGENT_ELIGIBLE_SKILLS } from "../skills";

interface MasterAgentEditorProps {
  initialTemplate: AiAgentTemplate;
  clonedVoices: ClonedVoiceRecord[];
  onSave: (template: AiAgentTemplate) => Promise<void> | void;
  onCancel: () => void;
  onPlayVoiceSample?: (template: AiAgentTemplate) => void;
  isSaving?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "Vendas", label: "Vendas & Fechamento", color: "from-blue-500 to-indigo-600" },
  { value: "Qualificação", label: "SDR & Qualificação", color: "from-purple-500 to-violet-600" },
  { value: "Suporte", label: "Suporte & SAC", color: "from-emerald-500 to-teal-600" },
  { value: "Cobrança", label: "Cobrança Amigável", color: "from-amber-500 to-orange-600" },
  { value: "Onboarding", label: "Onboarding de Clientes", color: "from-cyan-500 to-blue-600" },
  { value: "Imobiliário", label: "Mercado Imobiliário", color: "from-rose-500 to-pink-600" },
  { value: "Saúde", label: "Clínicas & Saúde", color: "from-teal-500 to-emerald-600" },
  { value: "Geral", label: "Assistência Geral", color: "from-slate-600 to-slate-800" },
];

const GENDER_OPTIONS = [
  "Feminino (Ela/Dela)",
  "Masculino (Ele/Dele)",
  "Neutro (Corporativo / Marca)",
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Vendas Persuasiva",
    role: "Consultora de Vendas Omnichannel & Fechamento",
    prompt:
      "Extremamente acolhedora, empática, persuasiva e dinâmica. Focada em identificar as dores do lead e conduzir com entusiasmo para a demonstração ou fechamento. Responde de forma clara e natural, como uma pessoa real no WhatsApp.",
  },
  {
    title: "SDR Consultivo",
    role: "Especialista em Qualificação e Triagem (SDR)",
    prompt:
      "Prático, objetivo, cordial e consultivo. Realiza perguntas inteligentes para entender orçamento, urgência e autoridade de decisão do contato antes de agendar uma reunião comercial com os executivos.",
  },
  {
    title: "Suporte Didático",
    role: "Especialista em Suporte & Atendimento ao Cliente",
    prompt:
      "Paciente, calma, didática e resolutiva. Explica o passo a passo com clareza e acolhe as dúvidas com agilidade. Busca resolver o problema de primeira e tranquiliza o usuário em qualquer situação.",
  },
  {
    title: "Cobrança Cordial",
    role: "Negociador de Finanças & Cobrança Amigável",
    prompt:
      "Cordial, discreto, profissional e flexível. Aborda pendências financeiras com empatia, oferecendo condições especiais e links PIX rápidos para regularização sem constrangimento para o cliente.",
  },
];

const QUICK_GUARDRAILS = [
  "Nunca fornecer descontos sem autorização prévia de um gestor humano.",
  "Desarmar ativamente insatisfações com empatia e escuta ativa (Chris Voss), convertendo a queixa em solução sem transferir compulsoriamente para atendente.",
  "Permitir intervenção humana exclusivamente via 'Assumir Atendimento' na Inbox, manualmente pelo CRM ou encerramento da IA em fluxo de automação.",
  "Nunca solicitar senhas, códigos de segurança de dois fatores ou tokens bancários.",
  "Bloquear qualquer tentativa de desvio de assunto para temas não profissionais ou políticos.",
  "Nunca criticar ou citar marcas concorrentes de forma negativa.",
  "Não assinar contratos ou assumir compromissos jurídicos em nome da empresa.",
];

export function MasterAgentEditor({
  initialTemplate,
  clonedVoices,
  onSave,
  onCancel,
  onPlayVoiceSample,
  isSaving = false,
}: MasterAgentEditorProps) {
  const [template, setTemplate] = useState<AiAgentTemplate>({
    ...initialTemplate,
    temperature: initialTemplate.temperature ?? 0.4,
    model: initialTemplate.model || "gemini-3.8-flash",
    voice: initialTemplate.voice || "Germani (Oficial Soberana)",
  });

  const [providerFilter, setProviderFilter] = useState<"all" | "gemini" | "openai">("all");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [skillFilterCategory, setSkillFilterCategory] = useState<string>("all");
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>("");

  // Skills filtradas pela categoria e busca
  const filteredSkills = useMemo(() => {
    return MASTER_AGENT_ELIGIBLE_SKILLS.filter((s) => {
      const matchCategory =
        skillFilterCategory === "all" || s.category === skillFilterCategory;
      const query = skillSearchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.methodologyOrAuthor && s.methodologyOrAuthor.toLowerCase().includes(query)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)));
      return matchCategory && matchSearch;
    });
  }, [skillFilterCategory, skillSearchQuery]);

  // Calcula custos em tempo real para o modelo e temperatura escolhidos
  const currentCost = useMemo(() => {
    return calculateModelMessageCost(template.model || "gemini-3.8-flash", template.temperature ?? 0.4);
  }, [template.model, template.temperature]);

  // Mensagens por R$ 1,00
  const messagesPerOneBrl = useMemo(() => {
    if (currentCost.totalCostBrl <= 0) return 0;
    return Math.floor(1 / currentCost.totalCostBrl);
  }, [currentCost.totalCostBrl]);

  // Modelos filtrados
  const filteredModels = useMemo(() => {
    if (providerFilter === "all") return AI_MODELS_CATALOG;
    return AI_MODELS_CATALOG.filter((m) => m.provider === providerFilter);
  }, [providerFilter]);

  const selectedModel = useMemo(() => {
    return AI_MODELS_CATALOG.find((m) => m.id === template.model) || AI_MODELS_CATALOG[0];
  }, [template.model]);

  // Adicionar limitação
  const handleAddLimitation = (ruleText: string) => {
    const trimmed = ruleText.trim();
    if (!trimmed) return;
    if (template.limitations.includes(trimmed)) {
      toast.info("Essa regra já está adicionada.");
      return;
    }
    setTemplate((prev) => ({
      ...prev,
      limitations: [...prev.limitations, trimmed],
    }));
  };

  const handleRemoveLimitation = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      limitations: prev.limitations.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLimitation = (index: number, val: string) => {
    setTemplate((prev) => {
      const copy = [...prev.limitations];
      copy[index] = val;
      return { ...prev, limitations: copy };
    });
  };

  // Salvar com validação
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template.name.trim()) {
      toast.error("Informe o Nome do Modelo Mestre.");
      return;
    }
    if (!template.role.trim()) {
      toast.error("Informe o Papel / Especialidade do Agente.");
      return;
    }
    if (!template.personality.trim()) {
      toast.error("Informe as instruções de personalidade (System Prompt).");
      return;
    }
    onSave(template);
  };

  const handlePlayVoice = () => {
    if (onPlayVoiceSample) {
      setIsPlayingAudio(true);
      onPlayVoiceSample(template);
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      {/* ── BARRA SUPERIOR DE CABEÇALHO & AÇÕES DIRETAS NA TELA ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Voltar para a Biblioteca de Modelos Mestres"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200/60">
                Estúdio de Criação de IA Mestre
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Sem Pop-up • Configuração Direta
              </span>
            </div>
            <h2 className="font-inter text-lg sm:text-xl font-bold text-slate-900">
              {template.id && !template.id.startsWith("tpl-new-") && initialTemplate.name
                ? `Editar Modelo Mestre: ${template.name}`
                : "Criar Novo Modelo Mestre Oficial"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Configure identidade, motor neural, criatividade dedicada, voz, guardrails éticos e simule os custos em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Modelo Mestre"}</span>
          </button>
        </div>
      </div>

      {/* ── WORKSPACE EM 2 COLUNAS: FORMULÁRIO COMPLETO + PREVIEW & SIMULADOR AO VIVO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES PASSO A PASSO (7 COLUNAS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SEÇÃO 1: IDENTIDADE & PERSONA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007BFF] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-inter">
                  1. Identidade & Persona Oficial
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  Nome público, papel no negócio, gênero e diretrizes de atendimento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nome do Agente Mestre *
                </label>
                <input
                  type="text"
                  required
                  value={template.name}
                  onChange={(e) => setTemplate((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Sofia, Lucas, Maya, Roberto"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Pronome & Gênero
                </label>
                <select
                  value={template.gender}
                  onChange={(e) => setTemplate((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all cursor-pointer"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Categoria de Negócio
                </label>
                <select
                  value={template.category}
                  onChange={(e) => setTemplate((p) => ({ ...p, category: e.target.value }))}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all cursor-pointer font-medium"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Papel Principal (Especialidade) *
                </label>
                <input
                  type="text"
                  required
                  value={template.role}
                  onChange={(e) => setTemplate((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Ex: Consultora de Vendas Omnichannel & SDR"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all"
                />
              </div>
            </div>

            {/* Prompt de Personalidade com templates rápidos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Instruções de Personalidade (System Prompt) *
                </label>
                <span className="text-[11px] text-slate-400">
                  {template.personality.length} caracteres
                </span>
              </div>

              {/* Chips de Sugestão de Prompt */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Modelos rápidos:
                </span>
                {PROMPT_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.title}
                    type="button"
                    onClick={() => {
                      setTemplate((p) => ({
                        ...p,
                        role: sug.role,
                        personality: sug.prompt,
                      }));
                      toast.success(`Modelo "${sug.title}" aplicado!`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-[#007BFF] text-slate-600 transition-colors cursor-pointer"
                  >
                    {sug.title}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                required
                value={template.personality}
                onChange={(e) => setTemplate((p) => ({ ...p, personality: e.target.value }))}
                placeholder="Descreva detalhadamente como o agente deve agir, o tom de voz, estilo de argumentação, tratamento de objeções..."
                className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* SEÇÃO 2: MOTOR DE IA & SELETOR DE MODELO ATIVO */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-inter">
                    2. Motor de Inteligência & Modelo Ativo
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Defina o modelo LLM oficial que processará as interações deste agente.
                  </p>
                </div>
              </div>

              {/* Filtro de Provedor */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setProviderFilter("all")}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    providerFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setProviderFilter("gemini")}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    providerFilter === "gemini" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setProviderFilter("openai")}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    providerFilter === "openai" ? "bg-white text-purple-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  OpenAI GPT
                </button>
              </div>
            </div>

            {/* Grid de Cards de Modelos de IA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredModels.map((model) => {
                const isSelected = (template.model || "gemini-3.8-flash") === model.id;
                const isGemini = model.provider === "gemini";

                return (
                  <div
                    key={model.id}
                    onClick={() => setTemplate((p) => ({ ...p, model: model.id }))}
                    className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? isGemini
                          ? "border-[#007BFF] bg-blue-50/70 ring-2 ring-[#007BFF]/20 shadow-xs"
                          : "border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isGemini ? "bg-[#007BFF]" : "bg-purple-600"
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-800 font-inter">
                          {model.name}
                        </h4>
                      </div>

                      {model.isRecommended && (
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {model.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-[10.5px]">
                      <span className="text-slate-500 font-mono">
                        Janela: {model.contextWindow}
                      </span>
                      <span className="font-semibold text-slate-700">
                        ~{model.avgLatencyMs}ms
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 text-[#007BFF]">
                        <CheckCircle2 className="w-4 h-4 fill-[#007BFF] text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 3: TEMPERATURA & CRIATIVIDADE ESPECÍFICA DESTE AGENTE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 font-inter">
                    3. Temperatura & Criatividade Deste Agente
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Calibração Individual
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500">
                  Define o equilíbrio entre exatidão factual e expressividade persuasiva exclusiva deste modelo mestre.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 leading-relaxed">
              <Info className="w-4 h-4 text-[#007BFF] shrink-0 mt-0.5" />
              <span>
                <strong>Isolamento Garantido:</strong> Esta calibração governa exclusivamente este Agente Mestre (ex: Sofia, Lucas). Ela não altera a temperatura executiva da Germani e nem de outros modelos.
              </span>
            </div>

            {/* Presets de Raciocínio & Temperatura */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THINKING_MODE_PRESETS.map((preset) => {
                const isActive = Math.abs((template.temperature ?? 0.4) - preset.temperature) < 0.15;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTemplate((p) => ({ ...p, temperature: preset.temperature }))}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#007BFF] bg-blue-50/80 ring-2 ring-[#007BFF]/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 font-inter">
                        {preset.title}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                        {preset.temperature}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                      {preset.description}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {preset.projectedTokens}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slider de Ajuste Fino */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Ajuste Fino Contínuo:{" "}
                  <strong className="text-[#007BFF] font-mono text-sm">
                    {(template.temperature ?? 0.4).toFixed(2)}
                  </strong>
                </span>
                <span className="text-slate-500 text-[11px]">
                  {(template.temperature ?? 0.4) <= 0.3
                    ? "🎯 Rigoroso & Conciso (0.0 - 0.3)"
                    : (template.temperature ?? 0.4) <= 0.7
                    ? "⚖️ Equilibrado & Comercial (0.4 - 0.7)"
                    : "✨ Criativo & Persuasivo (0.8 - 1.0)"}
                </span>
              </div>

              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={template.temperature ?? 0.4}
                onChange={(e) => setTemplate((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                className="w-full accent-[#007BFF] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0.0 (Factual / Foco)</span>
                <span>0.5 (Comercial / Médio)</span>
                <span>1.0 (Máxima Expressão)</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: SÍNTESE VOCAL & EXPRESSÃO ACÚSTICA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 font-inter">
                  4. Síntese Vocal & Identidade Acústica
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  Selecione a voz para mensagens de áudio no WhatsApp e ligações WebRTC.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Voz Atribuída a Este Agente
                </label>
                <select
                  value={template.voice || "Germani (Oficial Soberana)"}
                  onChange={(e) => setTemplate((p) => ({ ...p, voice: e.target.value }))}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all cursor-pointer font-medium"
                >
                  <optgroup label="Voz Oficial da Plataforma">
                    <option value="Germani (Oficial Soberana)">Germani (Oficial Soberana)</option>
                  </optgroup>

                  {clonedVoices.length > 0 && (
                    <optgroup label="Vozes Aprovadas no Estúdio Vocal">
                      {clonedVoices.map((cv) => (
                        <option key={cv.id} value={cv.name}>
                          {cv.name} ({cv.gender === "female" ? "Feminina" : "Masculina"})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Vozes clonadas aprovadas no Estúdio Vocal aparecem automaticamente nesta lista.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Demonstração da Voz
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#007BFF] flex items-center justify-center">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {template.voice || "Germani"}
                      </span>
                      <span className="text-[10.5px] text-slate-400">
                        Síntese neural de alta fidelidade
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayVoice}
                    disabled={isPlayingAudio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-[#007BFF] hover:border-blue-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPlayingAudio ? "Ouvindo..." : "Ouvir Amostra"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: LIMITAÇÕES ÉTICAS & GUARDRAILS INEGOVCIÁVEIS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 font-inter">
                  5. Limitações Éticas & Guardrails Inegociáveis
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  Regras de segurança invioláveis que o agente NUNCA poderá quebrar nas conversas.
                </p>
              </div>
            </div>

            {/* Chips de Adição Rápida */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                Sugestões de Segurança (Clique para Adicionar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_GUARDRAILS.map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => handleAddLimitation(rule)}
                    className="text-[11px] text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    <span>{rule}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Ativa de Regras */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Regras Ativas ({template.limitations.length})
              </label>

              {template.limitations.map((lim, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={lim}
                    onChange={(e) => handleUpdateLimitation(idx, e.target.value)}
                    placeholder="Descreva a regra de segurança ou limite..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#007BFF] outline-none text-slate-800 bg-white transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLimitation(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remover regra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddLimitation("Nova diretriz de conduta para o agente...")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Outra Regra
              </button>
            </div>
          </div>

          {/* SEÇÃO 6: HABILIDADES MODULARES DE ALTA PERFORMANCE (LIVRARIA DE SKILLS) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 font-inter">
                      6. Livraria Modular de Habilidades & Metodologias
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#007BFF]">
                      {(template.skills || []).length} selecionada{((template.skills || []).length) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500">
                    Acople inteligência especializada de Scrum, vendas consultivas, persuasão e encantamento humanizado.
                  </p>
                </div>
              </div>

              {/* Botão de Limpar Seleção ou Selecionar Padrões */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    const defaults = MASTER_AGENT_ELIGIBLE_SKILLS.filter((s) => s.isDefaultEnabled).map((s) => s.id);
                    setTemplate((p) => ({ ...p, skills: defaults }));
                    toast.success("Habilidades recomendadas aplicadas!");
                  }}
                  className="text-[11px] font-semibold text-slate-600 hover:text-[#007BFF] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Restaurar Recomendadas
                </button>
              </div>
            </div>

            {/* Barra de Filtro por Categoria & Campo de Busca */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                {/* Categorias Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "agile", label: "Gestão Ágil & Scrum" },
                    { id: "behavior", label: "Comportamento & Humanização" },
                    { id: "sales", label: "Vendas & Negociação" },
                    { id: "core", label: "Inteligência & Pesquisa" },
                    { id: "verticals", label: "Especialistas" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSkillFilterCategory(cat.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                        skillFilterCategory === cat.id
                          ? "bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-2xs font-semibold"
                          : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Campo de Busca Rápida */}
                <div className="relative shrink-0 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Buscar habilidade ou autor..."
                    className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] outline-none transition-all"
                  />
                  {skillSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSkillSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid de Cards de Alta Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const activeSkills = (template.skills || []) as string[];
                const isChecked = activeSkills.includes(skill.id);

                // Estilo temático por categoria
                const categoryStyle = (() => {
                  switch (skill.category) {
                    case "agile":
                      return {
                        badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
                        activeBorder: "border-purple-500 ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50/50 to-white",
                        iconBg: "bg-purple-100 text-purple-600",
                      };
                    case "behavior":
                      return {
                        badgeBg: "bg-pink-50 text-pink-700 border-pink-200/80",
                        activeBorder: "border-pink-500 ring-2 ring-pink-500/20 bg-gradient-to-br from-pink-50/50 to-white",
                        iconBg: "bg-pink-100 text-pink-600",
                      };
                    case "sales":
                      return {
                        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                        activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-white",
                        iconBg: "bg-emerald-100 text-emerald-600",
                      };
                    case "core":
                      return {
                        badgeBg: "bg-blue-50 text-[#007BFF] border-blue-200/80",
                        activeBorder: "border-[#007BFF] ring-2 ring-[#007BFF]/20 bg-gradient-to-br from-blue-50/50 to-white",
                        iconBg: "bg-blue-100 text-[#007BFF]",
                      };
                    default:
                      return {
                        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
                        activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-gradient-to-br from-amber-50/50 to-white",
                        iconBg: "bg-amber-100 text-amber-600",
                      };
                  }
                })();

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      setTemplate((prev) => {
                        const current = (prev.skills || []) as string[];
                        const next = isChecked
                          ? current.filter((sId: string) => sId !== skill.id)
                          : [...current, skill.id];
                        return { ...prev, skills: next };
                      });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isChecked
                        ? categoryStyle.activeBorder + " shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/40"
                    }`}
                  >
                    <div>
                      {/* Topo do Card: Badge de Categoria + Switch Animado */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryStyle.badgeBg}`}
                        >
                          {skill.category === "agile"
                            ? "Gestão Ágil & Scrum"
                            : skill.category === "behavior"
                            ? "Comportamento & Empatia"
                            : skill.category === "sales"
                            ? "Vendas & Conversão"
                            : skill.category === "core"
                            ? "Inteligência Soberana"
                            : "Especialista Setorial"}
                        </span>

                        {/* Switch de Ativação Estilizado */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10.5px] font-semibold transition-colors ${
                              isChecked ? "text-[#007BFF]" : "text-slate-400"
                            }`}
                          >
                            {isChecked ? "Ativa" : "Inativa"}
                          </span>
                          <div
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                              isChecked
                                ? "bg-gradient-to-r from-[#007BFF] to-[#6366F1]"
                                : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${
                                isChecked ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Nome da Habilidade & Metodologia */}
                      <div className="mb-1.5">
                        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 font-inter leading-snug">
                          {skill.name}
                        </h4>
                        {skill.methodologyOrAuthor && (
                          <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 mt-0.5">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{skill.methodologyOrAuthor}</span>
                          </div>
                        )}
                      </div>

                      {/* Descrição Didática */}
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                        {skill.description}
                      </p>
                    </div>

                    {/* Rodapé do Card: Tags / Palavras-chave */}
                    {skill.tags && skill.tags.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 mt-auto">
                        {skill.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded-md ${
                              isChecked
                                ? "bg-blue-50/80 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Alerta de Governança e Herança de Inteligência */}
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 p-3.5 rounded-xl border border-blue-200/60 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#007BFF] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Herança Inteligente em Tempo Real:</strong> As habilidades ativas acima injetam frameworks de alta precisão (Scrum, SPIN Selling, Cialdini, Chris Voss e Padrão Disney) no motor do Agente Mestre, garantindo respostas de nível sênior em qualquer interação.
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW DO CARD + SIMULADOR DE CUSTO AO VIVO (5 COLUNAS - STICKY) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* CARD 1: PREVIEW REAL NA BIBLIOTECA DO SAAS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 font-inter flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#007BFF]" />
                Preview: Como os Clientes Verão
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Catálogo Oficial
              </span>
            </div>

            {/* Mock do Card Oficial da Biblioteca */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {template.name ? template.name.slice(0, 2).toUpperCase() : "IA"}
                  </div>
                  <div>
                    <h4 className="font-inter text-base font-bold text-slate-900 leading-tight">
                      {template.name || "Novo Agente Mestre"}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {template.role || "Especialidade do Agente"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200/60">
                  {template.category || "Vendas"}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 italic">
                &ldquo;{template.personality || "Instruções de personalidade e conduta do agente..."}&rdquo;
              </p>

              {/* Badges de Motor, Voz e Raciocínio */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-200/80 mb-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{selectedModel.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Volume2 className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span className="truncate">{template.voice || "Germani"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Sliders className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Temp: {(template.temperature ?? 0.4).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{template.limitations.length} guardrails</span>
                </div>
              </div>

              {/* Habilidades Especializadas Ativas no Preview */}
              {(template.skills && template.skills.length > 0) && (
                <div className="pt-2.5 border-t border-slate-200/80 mb-3">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#007BFF]" />
                    <span>Habilidades Ativas ({template.skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.skills.map((sId) => {
                      const sk = MASTER_AGENT_ELIGIBLE_SKILLS.find((x) => x.id === sId);
                      return (
                        <span
                          key={sId}
                          className="text-[9.5px] font-medium bg-blue-50 text-[#007BFF] border border-blue-200/60 px-2 py-0.5 rounded-md"
                        >
                          {sk?.name || sId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="w-full py-2 rounded-xl text-xs font-semibold text-center bg-slate-100 text-slate-700">
                Visualização de Exibição no Painel
              </div>
            </div>
          </div>

          {/* CARD 2: SIMULADOR DE CONSUMO POR MENSAGEM (EXCLUSIVO DESTE AGENTE) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-inter">
                  Simulador de Consumo por Mensagem
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Câmbio: R$ 5,60/USD
              </span>
            </div>

            {/* Bloco de Custo Estimado */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-emerald-800">
                  Custo por Mensagem:
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-700 font-mono">
                    R$ {currentCost.totalCostBrl.toFixed(5)}
                  </span>
                  <span className="text-[10.5px] text-emerald-600 block font-mono">
                    (${currentCost.totalCostUsd.toFixed(6)} USD)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Rendimento por R$ 1,00:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  ~{messagesPerOneBrl.toLocaleString("pt-BR")} mensagens
                </span>
              </div>
            </div>

            {/* Projeção de Volume Mensal */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">
                Projeção de Custos por Volume:
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">500 msgs</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    R$ {(currentCost.totalCostBrl * 500).toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">2.000 msgs</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    R$ {(currentCost.totalCostBrl * 2000).toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block">10.000 msgs</span>
                  <span className="font-bold text-emerald-600 font-mono text-xs">
                    R$ {(currentCost.totalCostBrl * 10000).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalhamento de Tokens Estimados */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Prompt Base (Contexto):</span>
                <span>{currentCost.basePromptTokens} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Resposta Estimada (Temp):</span>
                <span>~{currentCost.projectedOutputTokens} tokens</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-800">
                <span>Total Estimado / Turno:</span>
                <span>~{currentCost.totalTokens} tokens</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              💡 <strong>Margem BipeSend:</strong> Em planos como Bipe Start (R$ 97) ou Pro (R$ 297), o custo real de inferência deste agente representa menos de 2% do valor cobrado da mensalidade.
            </p>
          </div>

          {/* BOTÕES DE AÇÃO RÁPIDA INLINE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-1/2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? "Salvando..." : "Salvar Agente"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
