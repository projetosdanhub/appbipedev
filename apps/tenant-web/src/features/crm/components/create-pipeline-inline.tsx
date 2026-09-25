"use client";

import React, { useState, useId, useRef, useEffect } from "react";
import { CrmPipeline, CrmPipelineStage, GeneratedStageProposal } from "@bipesend/contracts";
import { createPipelineAction } from "../actions/pipeline.actions";
import { createPipelineStageAction } from "../actions/stage.actions";
import { generateCrmPipelineWithBipeAiAction } from "@/features/ai/actions/ai.actions";
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  Star,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  HeartHandshake,
  CheckCircle2,
  Bot,
  Wand2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export interface StrategicStageDefinition {
  name: string;
  category: "open" | "won" | "lost";
  color: string;
  phase: "conversion" | "rescue" | "retention" | "closing";
  phaseLabel: string;
  description: string;
}

export const STRATEGIC_MARKET_STAGES: StrategicStageDefinition[] = [
  // ── Alta Conversão ──
  {
    name: "Entrada de Leads",
    category: "open",
    color: "#007BFF",
    phase: "conversion",
    phaseLabel: "Conversão",
    description: "Recepção rápida de novas mensagens e contatos",
  },
  {
    name: "Qualificação & ICP",
    category: "open",
    color: "#6366F1",
    phase: "conversion",
    phaseLabel: "Conversão",
    description: "Mapeamento de perfil, dor e poder de compra",
  },
  {
    name: "Apresentação & Proposta",
    category: "open",
    color: "#8B5CF6",
    phase: "conversion",
    phaseLabel: "Conversão",
    description: "Demonstração de valor e proposta comercial",
  },
  {
    name: "Negociação & Objeções",
    category: "open",
    color: "#F59E0B",
    phase: "conversion",
    phaseLabel: "Conversão",
    description: "Superação de dúvidas, ajuste de termos e contrato",
  },
  {
    name: "Venda Concluída",
    category: "won",
    color: "#10B981",
    phase: "conversion",
    phaseLabel: "Ganho",
    description: "Fechamento comercial realizado com sucesso",
  },

  // ── Resgate Estratégico ──
  {
    name: "Resgate de Oportunidades",
    category: "open",
    color: "#EC4899",
    phase: "rescue",
    phaseLabel: "Resgate",
    description: "Recuperação ativa de contatos que pausaram o atendimento",
  },

  // ── Pós-Venda & Retenção ──
  {
    name: "Pós-Venda & Fidelização",
    category: "open",
    color: "#06B6D4",
    phase: "retention",
    phaseLabel: "Pós-Venda",
    description: "Onboarding, satisfação (NPS) e recompra",
  },

  // ── Fechamento / Auditoria ──
  {
    name: "Perdido / Sem Perfil",
    category: "lost",
    color: "#64748B",
    phase: "closing",
    phaseLabel: "Perdido",
    description: "Arquivamento para auditoria de motivos",
  },
];

const AI_STEPS = [
  { text: "Bipe AI analisando mercado e arquitetura de vendas...", progress: 20 },
  { text: "Estruturando etapas de Alta Conversão...", progress: 50 },
  { text: "Ativando fluxos de Resgate e Pós-Venda...", progress: 80 },
  { text: "Finalizando funil comercial sob medida...", progress: 100 },
];

export interface CreatePipelineInlineProps {
  tenantId: string;
  existingPipelines: CrmPipeline[];
  defaultPipelineId: string | null;
  onClose: () => void;
  onPipelineCreated: (pipeline: CrmPipeline, initialStages?: CrmPipelineStage[]) => void;
  onSetDefaultPipeline: (pipelineId: string) => void;
}

export function CreatePipelineInline({
  tenantId,
  existingPipelines,
  defaultPipelineId,
  onClose,
  onPipelineCreated,
  onSetDefaultPipeline,
}: CreatePipelineInlineProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(existingPipelines.length === 0);
  const [useStrategicStages, setUseStrategicStages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);

  // Estados específicos da Bipe AI
  const [businessPrompt, setBusinessPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customAiStages, setCustomAiStages] = useState<GeneratedStageProposal[] | null>(null);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputId = useId();
  const descInputId = useId();

  const handleGenerateWithBipeAi = async () => {
    if (!businessPrompt.trim()) {
      toast.error("Descreva o seu nicho ou negócio para a Bipe AI gerar seu funil.");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await generateCrmPipelineWithBipeAiAction(businessPrompt.trim());
      if (!res.success || !res.data) {
        toast.error(res.error || "Não foi possível gerar com a Bipe AI.");
        return;
      }
      // Trava estrita de no máximo 10 fluxos no CRM
      const stages = res.data.stages.slice(0, 10);
      setName(res.data.name.slice(0, 40));
      if (res.data.description) {
        setDescription(res.data.description.slice(0, 120));
      }
      setCustomAiStages(stages);
      setUseStrategicStages(true);
      setAiGeneratedSuccess(true);
      toast.success(`✨ Bipe AI estruturou ${stages.length} fluxos sob medida para o seu negócio!`);
    } catch {
      toast.error("Erro ao consultar a Bipe AI.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Foco automático no input de nome ao expandir a aba
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fechamento automático ao clicar fora da aba ou pressionar Escape (exceto durante criação por IA)
  useEffect(() => {
    if (loading) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        const trigger = (event.target as HTMLElement)?.closest(".crm-funnel-trigger");
        if (!trigger) {
          onClose();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  const trimmedName = name.trim();
  const isDuplicate = existingPipelines.some(
    (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  // Identifica o funil padrão atual para aviso inteligente
  const currentDefaultPipeline =
    existingPipelines.find((p) => p.id === defaultPipelineId) ||
    (existingPipelines.length > 0 ? existingPipelines[0] : null);

  const willReplaceDefault =
    isDefault && currentDefaultPipeline && existingPipelines.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trimmedName) {
      toast.error("Por favor, digite o nome do funil.");
      return;
    }

    if (isDuplicate) {
      toast.error(`Já existe um funil com o nome "${trimmedName}". Escolha um nome exclusivo.`);
      return;
    }

    setLoading(true);
    setAiStepIndex(0);

    // Animação de progresso da IA com transições suaves a cada 550ms
    const aiInterval = setInterval(() => {
      setAiStepIndex((prev) => {
        if (prev < AI_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    const startTime = Date.now();

    try {
      const res = await createPipelineAction(tenantId, {
        name: trimmedName,
        description: description.trim() || null,
        defaultCurrency: "BRL",
      });

      if (!res.success || !res.data) {
        clearInterval(aiInterval);
        const errorMsg =
          typeof res.message === "string"
            ? res.message
            : (res.message as any)?.message || "Erro ao criar funil.";
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const newPipeline = res.data as CrmPipeline;
      const createdStages: CrmPipelineStage[] = [];

      if (useStrategicStages) {
        if (customAiStages && customAiStages.length > 0) {
          // Garante limite rígido de até 10 fluxos no CRM
          const stagesToCreate = customAiStages.slice(0, 10);
          for (let i = 0; i < stagesToCreate.length; i++) {
            const def = stagesToCreate[i];
            const stageRes = await createPipelineStageAction(tenantId, newPipeline.id, {
              pipelineId: newPipeline.id,
              name: def.name,
              position: i,
              category: def.category,
              colorToken: def.colorToken,
              requiredFieldRules: { version: 1, rules: [] },
            });
            if (stageRes.success && stageRes.data) {
              createdStages.push(stageRes.data as CrmPipelineStage);
            }
          }
        } else {
          for (let i = 0; i < STRATEGIC_MARKET_STAGES.length; i++) {
            const def = STRATEGIC_MARKET_STAGES[i];
            const stageRes = await createPipelineStageAction(tenantId, newPipeline.id, {
              pipelineId: newPipeline.id,
              name: def.name,
              position: i,
              category: def.category,
              colorToken: def.color,
              requiredFieldRules: { version: 1, rules: [] },
            });
            if (stageRes.success && stageRes.data) {
              createdStages.push(stageRes.data as CrmPipelineStage);
            }
          }
        }
      }

      // Garante que a animação da IA dure ao menos 2 segundos para sensação de valor e inteligência (em testes é instantâneo)
      const isTestEnv = process.env.NODE_ENV === "test";
      const minAiDuration = isTestEnv ? 50 : 2100;
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minAiDuration - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      clearInterval(aiInterval);
      setAiStepIndex(AI_STEPS.length - 1);

      if (isDefault) {
        onSetDefaultPipeline(newPipeline.id);
      }

      toast.success(
        useStrategicStages
          ? `Bipe AI gerou o funil "${newPipeline.name}" com 8 fluxos estratégicos!`
          : `Funil "${newPipeline.name}" criado com sucesso!`
      );

      // Pequena pausa para o usuário ver o 100% antes de fechar
      setTimeout(() => {
        onPipelineCreated(newPipeline, createdStages);
        onClose();
      }, 350);
    } catch (err: unknown) {
      clearInterval(aiInterval);
      const msg = err instanceof Error ? err.message : "Erro inesperado ao criar funil.";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div 
      ref={drawerRef}
      className="crm-create-pipeline-drawer" 
      data-testid="crm-create-pipeline-inline"
      role="region"
      aria-label="Aba de criação de funil"
    >
      {/* ── Overlay de Simulação de Criação por IA ── */}
      {loading && (
        <div className="crm-cpi-ai-overlay" role="status" aria-live="polite">
          <div className="crm-cpi-ai-card">
            <div className="crm-cpi-ai-icon-aura">
              <div className="crm-cpi-ai-icon-ring" />
              <div className="crm-cpi-ai-icon-inner">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>

            <div className="crm-cpi-ai-content">
              <div className="flex items-center justify-center gap-2">
                <Bot className="w-4 h-4 text-[#6366F1]" />
                <h4 className="crm-cpi-ai-title">Bipe AI criando seu funil</h4>
              </div>

              <p className="crm-cpi-ai-step-text">
                {AI_STEPS[aiStepIndex].text}
              </p>

              <div className="crm-cpi-ai-progress-track">
                <div 
                  className="crm-cpi-ai-progress-bar"
                  style={{ width: `${AI_STEPS[aiStepIndex].progress}%` }}
                />
              </div>

              <div className="crm-cpi-ai-indicators">
                {AI_STEPS.map((step, idx) => (
                  <span
                    key={step.text}
                    className={`crm-cpi-ai-dot ${
                      idx <= aiStepIndex ? "is-active" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header da Aba (Compacto e Refinado) ── */}
      <div className="crm-cpi-header">
        <div className="crm-cpi-title-box">
          <div className="crm-cpi-icon-wrapper" aria-hidden="true">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="crm-cpi-title">Criar Novo Funil</h3>
              <span className="crm-cpi-badge-header">Aba Rápida</span>
            </div>
            <p className="crm-cpi-subtitle">
              Ative os fluxos de alta conversão, resgate e pós-venda para sua operação comercial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="crm-cpi-close-btn"
          disabled={loading}
          aria-label="Fechar aba de criação de funil"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="crm-cpi-form">
        {/* ── Painel Bipe AI — Arquiteta Inteligente de CRM (Máximo 10 Fluxos) ── */}
        <div 
          className="crm-cpi-bipe-ai-card"
          style={{
            background: "linear-gradient(135deg, #f0f7ff 0%, #f5f3ff 100%)",
            border: "1px solid #c7d2fe",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div 
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "7px",
                  background: "linear-gradient(135deg, #007bff 0%, #6366f1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 2px 6px rgba(0, 123, 255, 0.25)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  Bipe AI — Arquiteta de Funil Comercial
                </span>
                <span 
                  style={{
                    fontSize: "10px",
                    background: "#e0e7ff",
                    color: "#4338ca",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginLeft: "8px",
                  }}
                >
                  Máximo 10 Fluxos
                </span>
              </div>
            </div>

            {aiGeneratedSuccess && (
              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Funil Arquitetado!
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ position: "relative" }}>
              <textarea
                className="crm-cpi-input"
                style={{
                  background: "#ffffff",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  resize: "vertical",
                  minHeight: "72px",
                  padding: "10px 14px",
                  width: "100%"
                }}
                placeholder="Conte um pouco da sua empresa, o que ela faz e o tipo de produto e/ou serviço oferecido (ex: Somos uma imobiliária de alto padrão focada em casas em condomínio fechado, com ciclo de visitas e análise de crédito)..."
                value={businessPrompt}
                onChange={(e) => setBusinessPrompt(e.target.value)}
                maxLength={500}
                disabled={loading || isGeneratingAi}
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "8px",
                  fontSize: "11px",
                  color: businessPrompt.length > 450 ? "#ef4444" : "#94a3b8",
                  fontWeight: "500",
                  pointerEvents: "none"
                }}
              >
                {businessPrompt.length}/500
              </span>
            </div>

            {/* Atalhos Rápidos de Nicho para Inspiração */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Sugestões:</span>
              {[
                { label: "🏥 Clínica Médica/Estética", text: "Clínica de estética avançada e odontologia com agendamento de consultas, triagem de procedimentos e retornos pós-atendimento." },
                { label: "🏡 Imobiliária", text: "Imobiliária de médio e alto padrão com captação de leads, qualificação financeira, agendamento de visitas e fechamento de contratos." },
                { label: "🚀 Agência de Marketing", text: "Agência de tráfego pago e automações B2B com reuniões de diagnóstico, proposta comercial e onboarding." },
                { label: "🛍️ Loja / Varejo", text: "E-commerce e loja física com catálogo de produtos, dúvidas sobre frete, recuperação de carrinho e pós-venda." }
              ].map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => setBusinessPrompt(sug.text)}
                  disabled={loading || isGeneratingAi}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#007bff";
                    e.currentTarget.style.color = "#007bff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  {sug.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                type="button"
                className="btn-ai-primary"
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onClick={handleGenerateWithBipeAi}
                disabled={loading || isGeneratingAi || !businessPrompt.trim()}
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Arquitetando Funil...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" /> Arquitetar com Bipe AI (Máx. 10 Fluxos)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Campos Principais: Nome e Descrição ── */}
        <div className="crm-cpi-fields-grid">
          {/* Nome */}
          <div className="crm-cpi-field-group">
            <div className="flex items-center justify-between">
              <label htmlFor={nameInputId} className="crm-cpi-label">
                Nome <span className="crm-cpi-required">*</span>
              </label>
              <span className="crm-cpi-char-counter" aria-live="polite">
                {name.length}/40
              </span>
            </div>
            <input
              id={nameInputId}
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Vendas WhatsApp, Inside Sales B2B"
              className={`crm-cpi-input ${
                isDuplicate ? "crm-cpi-input-error" : ""
              }`}
              disabled={loading}
              maxLength={40}
              required
            />

            {/* Alerta de Unicidade */}
            {isDuplicate && (
              <div className="crm-cpi-error-message" role="alert">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>
                  Já existe um funil com o nome <strong>&quot;{trimmedName}&quot;</strong>. Escolha um nome exclusivo.
                </span>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="crm-cpi-field-group">
            <div className="flex items-center justify-between">
              <label htmlFor={descInputId} className="crm-cpi-label">
                Descrição <span className="crm-cpi-optional">(opcional)</span>
              </label>
              <span className="crm-cpi-char-counter" aria-live="polite">
                {description.length}/120
              </span>
            </div>
            <input
              id={descInputId}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objetivo e escopo deste funil comercial"
              className="crm-cpi-input"
              disabled={loading}
              maxLength={120}
            />
          </div>
        </div>

        {/* ── Chave Estratégica: Alta Conversão, Resgate & Pós-Venda (Compacta) ── */}
        <div className="crm-cpi-strategy-card">
          <div className="crm-cpi-strategy-header">
            <div className="crm-cpi-strategy-copy">
              <div className="flex items-center gap-2">
                <div className="crm-cpi-strategy-icon-box" aria-hidden="true">
                  <Layers className="w-3.5 h-3.5 text-[#007BFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="crm-cpi-strategy-title">
                      Fluxo Estratégico de Mercado
                    </h4>
                    <span className="crm-cpi-strategy-badge">
                      Alta Conversão • Resgate • Pós-Venda
                    </span>
                  </div>
                  <p className="crm-cpi-strategy-desc">
                    8 fluxos recomendados pelo playbook de Inside Sales e WhatsApp CRM.
                  </p>
                </div>
              </div>
            </div>

            {/* Switch Tátil Redondo */}
            <label className="crm-cpi-switch-label" aria-label="Ativar fluxo estratégico de mercado">
              <input
                type="checkbox"
                checked={useStrategicStages}
                onChange={(e) => setUseStrategicStages(e.target.checked)}
                disabled={loading}
                className="crm-cpi-switch-input"
              />
              <span className="crm-cpi-switch-slider" />
            </label>
          </div>

          {/* Esteira Horizontal Unificada de Fluxos (Clean & Compact) */}
          {useStrategicStages ? (
            <div className="crm-cpi-flow-track">
              {customAiStages && customAiStages.length > 0 ? (
                customAiStages.slice(0, 10).map((stage, idx) => (
                  <React.Fragment key={stage.name}>
                    <div 
                      className="crm-cpi-flow-node"
                      title={`Fluxo ${idx + 1} gerado pela Bipe AI (${stage.category})`}
                    >
                      <span className="crm-cpi-flow-phase-tag">
                        {stage.category === "won" ? "Ganho" : stage.category === "lost" ? "Perdido" : "Bipe AI"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="crm-cpi-flow-dot" 
                          style={{ backgroundColor: stage.colorToken }} 
                          aria-hidden="true" 
                        />
                        <span className="crm-cpi-flow-node-name">{stage.name}</span>
                      </div>
                    </div>

                    {idx < Math.min(customAiStages.length, 10) - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0 crm-cpi-flow-arrow" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                STRATEGIC_MARKET_STAGES.map((stage, idx) => (
                  <React.Fragment key={stage.name}>
                    <div 
                      className={`crm-cpi-flow-node ${stage.phase === "rescue" ? "is-rescue" : ""} ${stage.phase === "retention" ? "is-retention" : ""}`}
                      title={stage.description}
                    >
                      <span className="crm-cpi-flow-phase-tag">{stage.phaseLabel}</span>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="crm-cpi-flow-dot" 
                          style={{ backgroundColor: stage.color }} 
                          aria-hidden="true" 
                        />
                        <span className="crm-cpi-flow-node-name">{stage.name}</span>
                      </div>
                    </div>

                    {idx < STRATEGIC_MARKET_STAGES.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0 crm-cpi-flow-arrow" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          ) : (
            <div className="crm-cpi-strategy-disabled-note">
              <span>O funil será criado em branco. Você poderá adicionar fluxos personalizados no quadro.</span>
            </div>
          )}
        </div>

        {/* ── Barra Inferior: Funil Padrão e Ações ── */}
        <div className="crm-cpi-footer-row">
          <div className="crm-cpi-default-box">
            <label className="crm-cpi-toggle-label">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={loading}
                className="crm-cpi-checkbox"
              />
              <div className="crm-cpi-toggle-text">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <strong>Definir como Funil Padrão</strong>
                </div>
                {willReplaceDefault && (
                  <span className="crm-cpi-replace-hint">
                    (Substituirá &quot;{currentDefaultPipeline.name}&quot;)
                  </span>
                )}
              </div>
            </label>
          </div>

          <div className="crm-cpi-actions">
            <button
              type="button"
              onClick={onClose}
              className="crm-cpi-btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="crm-cpi-btn-submit"
              disabled={loading || isDuplicate || !trimmedName}
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-white" />
              Criar Funil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
