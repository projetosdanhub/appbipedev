"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Settings2, 
  Power, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Bot, 
  MessageSquare, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  CheckCheck, 
  Layers,
  ArrowRight,
  ArrowLeft,
  Cloud,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";
import { CloudflareLogo } from "@bipesend/ui";
import { 
  saveAiProviderConfigAction, 
  setActiveAiProviderAction, 
  testAiProviderConnectionAction 
} from "../actions/superadmin-ai.actions";
import {
  saveCredentialAction,
  getCredentialStatusAction,
  toggleCredentialStatusAction,
  type CredentialProvider,
} from "../../integrations/actions/credentials.actions";

interface AiIntegrationsAppStoreProps {
  initialConfig: {
    geminiConfigured: boolean;
    openaiConfigured: boolean;
    geminiMasked: string;
    openaiMasked: string;
    defaultProvider: "gemini" | "openai";
    activeProvider?: "gemini" | "openai";
    geminiModel?: string;
    openaiModel?: string;
    ttsEnabled: boolean;
  };
  onConfigUpdated?: () => void;
}

export function AiIntegrationsAppStore({ initialConfig, onConfigUpdated }: AiIntegrationsAppStoreProps) {
  const [activeProvider, setActiveProvider] = useState<"gemini" | "openai">(
    initialConfig.activeProvider || initialConfig.defaultProvider || "gemini"
  );
  const [geminiConfigured, setGeminiConfigured] = useState(initialConfig.geminiConfigured);
  const [openaiConfigured, setOpenaiConfigured] = useState(initialConfig.openaiConfigured);
  const [geminiMasked, setGeminiMasked] = useState(initialConfig.geminiMasked);
  const [openaiMasked, setOpenaiMasked] = useState(initialConfig.openaiMasked);
  const [geminiModel, setGeminiModel] = useState(initialConfig.geminiModel || "gemini-3.8-flash");
  const [openaiModel, setOpenaiModel] = useState(initialConfig.openaiModel || "gpt-4.5-instant");

  // Estados de modal de configuração/instalação
  const [activeModalProvider, setActiveModalProvider] = useState<"gemini" | "openai" | null>(null);
  const [modalApiKey, setModalApiKey] = useState("");
  const [modalModel, setModalModel] = useState("");
  const [modalShowKey, setModalShowKey] = useState(false);
  const [modalSetActive, setModalSetActive] = useState(true);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado de animação de instalação rápida
  const [switchingToProvider, setSwitchingToProvider] = useState<"gemini" | "openai" | null>(null);

  // Categoria de filtro
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ai" | "channels" | "storage">("ai");

  // ── Estado dos canais omnichannel & nuvem (credenciais) ──
  const [channelConfigOpen, setChannelConfigOpen] = useState<CredentialProvider | null>(null);
  const [channelSaving, setChannelSaving] = useState(false);
  const [channelStatuses, setChannelStatuses] = useState<Record<string, string>>({
    evolution_api: "not_configured",
    meta: "not_configured",
    tiktok: "not_configured",
    cloudflare_r2: "not_configured",
  });
  // Formulário Evolution API
  const [evoUrl, setEvoUrl] = useState("");
  const [evoKey, setEvoKey] = useState("");
  const [evoShowKey, setEvoShowKey] = useState(false);
  // Formulário Meta
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [metaVerifyToken, setMetaVerifyToken] = useState("");
  const [metaShowSecret, setMetaShowSecret] = useState(false);
  // Formulário TikTok
  const [ttClientKey, setTtClientKey] = useState("");
  const [ttClientSecret, setTtClientSecret] = useState("");
  const [ttShowSecret, setTtShowSecret] = useState(false);
  // Formulário Cloudflare R2
  const [r2AccountId, setR2AccountId] = useState("");
  const [r2Bucket, setR2Bucket] = useState("bipesend-media");
  const [r2AccessKey, setR2AccessKey] = useState("");
  const [r2SecretKey, setR2SecretKey] = useState("");
  const [r2PublicUrl, setR2PublicUrl] = useState("");
  const [r2ShowSecret, setR2ShowSecret] = useState(false);

  // Carregar status ao trocar de categoria
  React.useEffect(() => {
    if (selectedCategory === "channels" || selectedCategory === "storage" || selectedCategory === "all") {
      (async () => {
        const providers: CredentialProvider[] = ["evolution_api", "meta", "tiktok", "cloudflare_r2"];
        const results = await Promise.all(
          providers.map((p) => getCredentialStatusAction(p))
        );
        const map: Record<string, string> = {};
        for (const r of results) map[r.provider] = r.status;
        setChannelStatuses((prev) => ({ ...prev, ...map }));
      })();
    }
  }, [selectedCategory]);

  // Handler de salvar credenciais
  const handleSaveChannelCredentials = async (provider: CredentialProvider) => {
    setChannelSaving(true);
    let creds: Record<string, string> = {};

    if (provider === "evolution_api") {
      if (!evoUrl.trim() || !evoKey.trim()) {
        toast.error("Preencha a URL e a API Key da Evolution.");
        setChannelSaving(false);
        return;
      }
      creds = { url: evoUrl.trim(), apiKey: evoKey.trim() };
    } else if (provider === "meta") {
      if (!metaAppId.trim() || !metaAppSecret.trim()) {
        toast.error("Preencha o App ID e o App Secret da Meta.");
        setChannelSaving(false);
        return;
      }
      creds = {
        appId: metaAppId.trim(),
        appSecret: metaAppSecret.trim(),
        verifyToken: metaVerifyToken.trim(),
      };
    } else if (provider === "tiktok") {
      if (!ttClientKey.trim() || !ttClientSecret.trim()) {
        toast.error("Preencha o Client Key e o Client Secret do TikTok.");
        setChannelSaving(false);
        return;
      }
      creds = { clientKey: ttClientKey.trim(), clientSecret: ttClientSecret.trim() };
    } else if (provider === "cloudflare_r2") {
      if (!r2AccessKey.trim() || !r2SecretKey.trim() || !r2Bucket.trim()) {
        toast.error("Preencha o Access Key ID, Secret Access Key e o Nome do Bucket.");
        setChannelSaving(false);
        return;
      }
      creds = {
        accountId: r2AccountId.trim(),
        bucket: r2Bucket.trim(),
        accessKeyId: r2AccessKey.trim(),
        secretAccessKey: r2SecretKey.trim(),
        publicUrl: r2PublicUrl.trim(),
      };
    }

    try {
      const res = await saveCredentialAction(provider, creds);
      if (res.success) {
        toast.success(res.message);
        setChannelStatuses((prev) => ({ ...prev, [provider]: res.status }));
        setChannelConfigOpen(null);
        // Limpa campos
        setEvoUrl(""); setEvoKey("");
        setMetaAppId(""); setMetaAppSecret(""); setMetaVerifyToken("");
        setTtClientKey(""); setTtClientSecret("");
        setR2AccessKey(""); setR2SecretKey("");
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao salvar credenciais.");
    } finally {
      setChannelSaving(false);
    }
  };

  // Alternar status (ex: ativar R2 ou voltar para localhost)
  const handleToggleStatus = async (provider: CredentialProvider, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setChannelSaving(true);
    try {
      const res = await toggleCredentialStatusAction(provider, nextStatus);
      if (res.success) {
        setChannelStatuses((prev) => ({ ...prev, [provider]: nextStatus }));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao alternar status.");
    } finally {
      setChannelSaving(false);
    }
  };

  // Alternância rápida de motor ativo exclusivo
  const handleQuickActivate = async (provider: "gemini" | "openai") => {
    if (activeProvider === provider) {
      toast.info(`O ${provider === "gemini" ? "Google Gemini AI" : "OpenAI GPT"} já é o motor ativo da plataforma.`);
      return;
    }

    const isConfigured = provider === "gemini" ? geminiConfigured : openaiConfigured;
    if (!isConfigured) {
      toast.warning(`Configure a chave de API do ${provider === "gemini" ? "Google Gemini" : "OpenAI"} antes de ativá-lo.`);
      openModal(provider);
      return;
    }

    setSwitchingToProvider(provider);
    try {
      // Pequeno delay para animação de ativação
      await new Promise(r => setTimeout(r, 600));
      const res = await setActiveAiProviderAction(provider);
      if (res.success) {
        setActiveProvider(provider);
        toast.success(res.message);
        if (onConfigUpdated) onConfigUpdated();
      } else {
        toast.error("Erro ao ativar integração.");
      }
    } catch {
      toast.error("Falha ao comunicar com o servidor.");
    } finally {
      setSwitchingToProvider(null);
    }
  };

  // Abrir modal de instalação/configuração
  const openModal = (provider: "gemini" | "openai") => {
    setActiveModalProvider(provider);
    setModalApiKey("");
    setModalShowKey(false);
    setModalModel(provider === "gemini" ? geminiModel : openaiModel);
    setModalSetActive(activeProvider === provider ? true : false);
  };

  // Fechar modal
  const closeModal = () => {
    setActiveModalProvider(null);
    setModalApiKey("");
    setIsValidatingKey(false);
  };

  // Testar conexão
  const handleTestConnection = async () => {
    if (!activeModalProvider) return;
    setIsValidatingKey(true);
    try {
      const res = await testAiProviderConnectionAction(activeModalProvider, modalApiKey || undefined);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao testar conexão.");
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Salvar configuração do app
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProvider) return;

    setIsSaving(true);
    try {
      const res = await saveAiProviderConfigAction({
        provider: activeModalProvider,
        apiKey: modalApiKey.trim() || undefined,
        model: modalModel,
        setActive: modalSetActive,
      });

      if (res.success) {
        toast.success(res.message);
        if (activeModalProvider === "gemini") {
          if (modalApiKey.trim()) {
            setGeminiConfigured(true);
            setGeminiMasked(`${modalApiKey.trim().slice(0, 6)}••••••••${modalApiKey.trim().slice(-4)}`);
          }
          setGeminiModel(modalModel);
        } else {
          if (modalApiKey.trim()) {
            setOpenaiConfigured(true);
            setOpenaiMasked(`${modalApiKey.trim().slice(0, 7)}••••••••${modalApiKey.trim().slice(-4)}`);
          }
          setOpenaiModel(modalModel);
        }

        if (modalSetActive) {
          setActiveProvider(activeModalProvider);
        }

        closeModal();
        if (onConfigUpdated) onConfigUpdated();
      } else {
        toast.error("Falha ao salvar aplicativo.");
      }
    } catch {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Barra de Filtro de Categorias & Indicador do Motor Ativo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedCategory("ai")}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: selectedCategory === "ai" ? "#007BFF" : "#F1F5F9",
            color: selectedCategory === "ai" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <Bot className="w-4 h-4" /> Inteligência Artificial (2)
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("channels")}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: selectedCategory === "channels" ? "#007BFF" : "#F1F5F9",
            color: selectedCategory === "channels" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <MessageSquare className="w-4 h-4" /> Canais Omnichannel (3)
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("storage")}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: selectedCategory === "storage" ? "#007BFF" : "#F1F5F9",
            color: selectedCategory === "storage" ? "#FFFFFF" : "#64748B",
            transition: "all 0.15s ease"
          }}
        >
          <Cloud className="w-4 h-4" /> Armazenamento & Nuvem (1)
        </button>
            </div>

            {/* Indicador do Motor Ativo */}
            <div className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-2xs shrink-0 self-start sm:self-auto">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${activeProvider === "gemini" ? "bg-gradient-to-tr from-[#1E88E5] to-[#7C4DFF]" : "bg-gradient-to-tr from-[#10A37F] to-[#0D8C6C]"}`}>
                {activeProvider === "gemini" ? <Sparkles className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-0.5">Motor Ativo</span>
                <strong className="text-xs text-slate-800 flex items-center gap-1.5 leading-none">
                  {activeProvider === "gemini" ? "Google Gemini" : "OpenAI GPT"}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </strong>
              </div>
            </div>
          </div>

      {/* ── SEÇÃO 1: MOTORES DE INTELIGÊNCIA ARTIFICIAL (EXCLUSIVOS) ── */}
      {selectedCategory === "ai" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
          
          {/* ── CARD 1: GOOGLE GEMINI AI ── */}
          <div style={{
            background: "#ffffff",
            border: activeProvider === "gemini" ? "2px solid #007BFF" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: activeProvider === "gemini" ? "0 8px 24px rgba(0, 123, 255, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s ease"
          }}>
            {/* Faixa de Ativo */}
            {activeProvider === "gemini" && (
              <div style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "#ECFDF5",
                color: "#065F46",
                border: "1px solid #A7F3D0",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                MOTOR PRINCIPAL ATIVO
              </div>
            )}

            <div>
              {/* Header do App Card */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #1E88E5 0%, #7C4DFF 50%, #00E5FF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(30, 136, 229, 0.35)",
                  flexShrink: 0
                }}>
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px 0" }}>
                    Google Gemini AI
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                    Google DeepMind • Versão {geminiModel}
                  </span>
                </div>
              </div>

              {/* Tags do App */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#1D4ED8", background: "#EFF6FF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                  Ultra Rápido
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#5B21B6", background: "#F5F3FF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #DDD6FE" }}>
                  Multimodal
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#047857", background: "#ECFDF5", padding: "3px 8px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                  Econômico
                </span>
              </div>

              {/* Descrição */}
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.55", marginBottom: "18px" }}>
                Inteligência de alto desempenho para processamento de conversas, análise de intenções de compra no CRM e respostas rápidas com voz natural.
              </p>

              {/* Credenciais / Status */}
              <div style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                fontSize: "12px"
              }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Chave de API:</span>
                {geminiConfigured ? (
                  <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#059669", background: "#ECFDF5", padding: "2px 6px", borderRadius: "4px" }}>
                    {geminiMasked}
                  </span>
                ) : (
                  <span style={{ color: "#D97706", fontWeight: "600" }}>Não configurada</span>
                )}
              </div>
            </div>

            {/* Ações do Card */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => openModal("gemini")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> Configurar
              </button>

              {activeProvider === "gemini" ? (
                <button
                  type="button"
                  disabled
                  style={{
                    flex: 1.2,
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    background: "#E0F2FE",
                    color: "#0369A1",
                    cursor: "default",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <CheckCheck className="w-4 h-4 text-[#0284C7]" /> Motor Ativo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickActivate("gemini")}
                  disabled={switchingToProvider === "gemini"}
                  style={{
                    flex: 1.2,
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    background: "linear-gradient(135deg, #007BFF 0%, #6366F1 100%)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(0, 123, 255, 0.25)",
                    transition: "transform 0.1s ease"
                  }}
                >
                  {switchingToProvider === "gemini" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Ativando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Ativar no Sistema
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── CARD 2: OPENAI GPT ── */}
          <div style={{
            background: "#ffffff",
            border: activeProvider === "openai" ? "2px solid #10A37F" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: activeProvider === "openai" ? "0 8px 24px rgba(16, 163, 127, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s ease"
          }}>
            {/* Faixa de Ativo */}
            {activeProvider === "openai" && (
              <div style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "#ECFDF5",
                color: "#065F46",
                border: "1px solid #A7F3D0",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                MOTOR PRINCIPAL ATIVO
              </div>
            )}

            <div>
              {/* Header do App Card */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #10A37F 0%, #0D8C6C 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(16, 163, 127, 0.35)",
                  flexShrink: 0
                }}>
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px 0" }}>
                    OpenAI GPT
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                    OpenAI Inc. • Versão {openaiModel}
                  </span>
                </div>
              </div>

              {/* Tags do App */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#065F46", background: "#ECFDF5", padding: "3px 8px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                  Raciocínio Apurado
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#1D4ED8", background: "#EFF6FF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                  Persuasivo
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#374151", background: "#F3F4F6", padding: "3px 8px", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                  Alta Precisão
                </span>
              </div>

              {/* Descrição */}
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.55", marginBottom: "18px" }}>
                Modelos de linguagem consagrados para estruturação de dados, contorno de objeções complexas em negociações comerciais e suporte consultivo de alta fidelidade.
              </p>

              {/* Credenciais / Status */}
              <div style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                fontSize: "12px"
              }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Chave de API:</span>
                {openaiConfigured ? (
                  <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#059669", background: "#ECFDF5", padding: "2px 6px", borderRadius: "4px" }}>
                    {openaiMasked}
                  </span>
                ) : (
                  <span style={{ color: "#D97706", fontWeight: "600" }}>Não configurada</span>
                )}
              </div>
            </div>

            {/* Ações do Card */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => openModal("openai")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> Configurar
              </button>

              {activeProvider === "openai" ? (
                <button
                  type="button"
                  disabled
                  style={{
                    flex: 1.2,
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    background: "#ECFDF5",
                    color: "#047857",
                    cursor: "default",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <CheckCheck className="w-4 h-4 text-[#10A37F]" /> Motor Ativo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickActivate("openai")}
                  disabled={switchingToProvider === "openai"}
                  style={{
                    flex: 1.2,
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    background: "linear-gradient(135deg, #10A37F 0%, #0D8C6C 100%)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(16, 163, 127, 0.25)",
                    transition: "transform 0.1s ease"
                  }}
                >
                  {switchingToProvider === "openai" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Ativando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Ativar no Sistema
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── SEÇÃO 2: CANAIS OMNICHANNEL — CARDS INTERATIVOS COM CREDENCIAIS ── */}
      {selectedCategory === "channels" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
          
          {/* ── CARD: WhatsApp (Evolution API) ── */}
          <div style={{
            background: "#ffffff",
            border: channelStatuses.evolution_api === "active" ? "2px solid #25D366" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: channelStatuses.evolution_api === "active" ? "0 8px 24px rgba(37, 211, 102, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            position: "relative" as const,
            transition: "all 0.25s ease",
          }}>
            {channelStatuses.evolution_api === "active" && (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                MOTOR ATIVO
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                    BipeSend WhatsApp API
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>Evolution API • Multi-atendimento</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", marginBottom: "14px" }}>
                Motor oficial de conexão WhatsApp via QR Code, Webhook e processamento de mensagens em tempo real.
              </p>

              {/* Status badge */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12px" }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Status:</span>
                {channelStatuses.evolution_api === "active" ? (
                  <span style={{ fontWeight: "600", color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "4px" }}>Configurado ✓</span>
                ) : channelStatuses.evolution_api === "invalid" ? (
                  <span style={{ fontWeight: "600", color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: "4px" }}>Inválido ✗</span>
                ) : (
                  <span style={{ color: "#D97706", fontWeight: "600" }}>Não configurado</span>
                )}
              </div>

              {/* Formulário expandível */}
              {channelConfigOpen === "evolution_api" && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>URL da Evolution API</label>
                    <input
                      type="text"
                      value={evoUrl}
                      onChange={(e) => setEvoUrl(e.target.value)}
                      placeholder="http://127.0.0.1:8080"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>API Key</label>
                    <div style={{ position: "relative" as const }}>
                      <input
                        type={evoShowKey ? "text" : "password"}
                        value={evoKey}
                        onChange={(e) => setEvoKey(e.target.value)}
                        placeholder="Sua API Key forte"
                        style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }}
                      />
                      <button type="button" onClick={() => setEvoShowKey(!evoShowKey)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                        {evoShowKey ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={channelSaving}
                    onClick={() => handleSaveChannelCredentials("evolution_api")}
                    style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", border: "none", background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 12px rgba(37, 211, 102, 0.25)" }}
                  >
                    {channelSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Validando...</> : <><ShieldCheck className="w-4 h-4" /> Salvar e Sincronizar</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setChannelConfigOpen(channelConfigOpen === "evolution_api" ? null : "evolution_api")}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> {channelConfigOpen === "evolution_api" ? "Fechar" : "Configurar"}
              </button>
            </div>
          </div>

          {/* ── CARD: Instagram (Meta Graph API) ── */}
          <div style={{
            background: "#ffffff",
            border: channelStatuses.meta === "active" ? "2px solid #E1306C" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: channelStatuses.meta === "active" ? "0 8px 24px rgba(225, 48, 108, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            position: "relative" as const,
            transition: "all 0.25s ease",
          }}>
            {channelStatuses.meta === "active" && (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                ATIVO
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                    Instagram Direct Graph API
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>Meta for Developers • DMs Oficiais</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", marginBottom: "14px" }}>
                Integração homologada com OAuth para responder mensagens diretas e menções em stories.
              </p>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12px" }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Status:</span>
                {channelStatuses.meta === "active" ? (
                  <span style={{ fontWeight: "600", color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "4px" }}>Configurado ✓</span>
                ) : (
                  <span style={{ color: "#D97706", fontWeight: "600" }}>Não configurado</span>
                )}
              </div>

              {channelConfigOpen === "meta" && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>Meta App ID</label>
                    <input type="text" value={metaAppId} onChange={(e) => setMetaAppId(e.target.value)} placeholder="123456789012345" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>App Secret</label>
                    <div style={{ position: "relative" as const }}>
                      <input type={metaShowSecret ? "text" : "password"} value={metaAppSecret} onChange={(e) => setMetaAppSecret(e.target.value)} placeholder="Seu App Secret" style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
                      <button type="button" onClick={() => setMetaShowSecret(!metaShowSecret)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                        {metaShowSecret ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>Verify Token (Webhook)</label>
                    <input type="text" value={metaVerifyToken} onChange={(e) => setMetaVerifyToken(e.target.value)} placeholder="Token personalizado" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
                  </div>
                  <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#007BFF", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Meta for Developers
                  </a>
                  <button
                    type="button"
                    disabled={channelSaving}
                    onClick={() => handleSaveChannelCredentials("meta")}
                    style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", border: "none", background: "linear-gradient(135deg, #E1306C 0%, #833AB4 100%)", color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 12px rgba(225, 48, 108, 0.25)" }}
                  >
                    {channelSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Validando...</> : <><ShieldCheck className="w-4 h-4" /> Salvar e Sincronizar</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setChannelConfigOpen(channelConfigOpen === "meta" ? null : "meta")}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> {channelConfigOpen === "meta" ? "Fechar" : "Configurar"}
              </button>
            </div>
          </div>

          {/* ── CARD: TikTok Business ── */}
          <div style={{
            background: "#ffffff",
            border: channelStatuses.tiktok === "active" ? "2px solid #000000" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: channelStatuses.tiktok === "active" ? "0 8px 24px rgba(0, 0, 0, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            position: "relative" as const,
            transition: "all 0.25s ease",
          }}>
            {channelStatuses.tiktok === "active" && (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                ATIVO
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", color: "#00F2FE" }}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                    TikTok Business Messaging
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>TikTok for Business • DMs</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", marginBottom: "14px" }}>
                Recepção e resposta a leads comerciais diretamente do TikTok com conformidade total.
              </p>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12px" }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Status:</span>
                {channelStatuses.tiktok === "active" ? (
                  <span style={{ fontWeight: "600", color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "4px" }}>Configurado ✓</span>
                ) : (
                  <span style={{ color: "#D97706", fontWeight: "600" }}>Não configurado</span>
                )}
              </div>

              {channelConfigOpen === "tiktok" && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>Client Key</label>
                    <input type="text" value={ttClientKey} onChange={(e) => setTtClientKey(e.target.value)} placeholder="Seu Client Key" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>Client Secret</label>
                    <div style={{ position: "relative" as const }}>
                      <input type={ttShowSecret ? "text" : "password"} value={ttClientSecret} onChange={(e) => setTtClientSecret(e.target.value)} placeholder="Seu Client Secret" style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
                      <button type="button" onClick={() => setTtShowSecret(!ttShowSecret)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                        {ttShowSecret ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#007BFF", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir TikTok Developer Portal
                  </a>
                  <button
                    type="button"
                    disabled={channelSaving}
                    onClick={() => handleSaveChannelCredentials("tiktok")}
                    style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", border: "none", background: "linear-gradient(135deg, #000000 0%, #25F4EE 100%)", color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)" }}
                  >
                    {channelSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Validando...</> : <><ShieldCheck className="w-4 h-4" /> Salvar e Sincronizar</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setChannelConfigOpen(channelConfigOpen === "tiktok" ? null : "tiktok")}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> {channelConfigOpen === "tiktok" ? "Fechar" : "Configurar"}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── SEÇÃO 3: ARMAZENAMENTO & NUVEM (CLOUDFLARE R2) ── */}
      {selectedCategory === "storage" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
          
          {/* ── CARD: Cloudflare R2 Object Storage ── */}
          <div style={{
            background: "#ffffff",
            border: channelStatuses.cloudflare_r2 === "active" ? "2px solid #F6821F" : "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: channelStatuses.cloudflare_r2 === "active" ? "0 8px 24px rgba(246, 130, 31, 0.15)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            position: "relative" as const,
            transition: "all 0.25s ease",
          }}>
            {channelStatuses.cloudflare_r2 === "active" ? (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#FFF7ED", color: "#C2410C", border: "1px solid #FFEDD5", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#F97316" }} />
                NUVEM R2 ATIVA
              </div>
            ) : channelStatuses.cloudflare_r2 === "inactive" ? (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#64748B" }} />
                MODO LOCALHOST (R2 PAUSADO)
              </div>
            ) : (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                MODO LOCALHOST
              </div>
            )}

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #F6821F 0%, #FAAD3F 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 4px 14px rgba(246, 130, 31, 0.35)", flexShrink: 0 }}>
                  <CloudflareLogo size={34} className="w-8 h-8" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "17px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
                    Cloudflare R2 Object Storage
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                    Cloudflare • S3-Compatible • Zero Taxa de Egress
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#C2410C", background: "#FFF7ED", padding: "3px 8px", borderRadius: "6px", border: "1px solid #FFEDD5" }}>
                  Zero Egress Fee
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#0369A1", background: "#F0F9FF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #BAE6FD" }}>
                  CDN Global Rápida
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#047857", background: "#ECFDF5", padding: "3px 8px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                  Áudios PTT, Fotos e Vídeos
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", marginBottom: "16px" }}>
                Armazenamento de mídia em nuvem de escala ilimitada para o BipeSend. Salva mensagens de voz (PTT do WhatsApp), imagens de catálogos e vídeos de campanhas sem custo de tráfego de saída.
              </p>

              {/* Status do Storage */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12.5px" }}>
                <span style={{ color: "#64748B", fontWeight: "500" }}>Modo de Armazenamento Atual:</span>
                {channelStatuses.cloudflare_r2 === "active" ? (
                  <span style={{ fontWeight: "700", color: "#C2410C", background: "#FFF7ED", padding: "3px 10px", borderRadius: "6px", border: "1px solid #FFEDD5", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Cloud className="w-3.5 h-3.5" /> Nuvem Cloudflare R2
                  </span>
                ) : (
                  <span style={{ fontWeight: "700", color: "#0284C7", background: "#F0F9FF", padding: "3px 10px", borderRadius: "6px", border: "1px solid #BAE6FD", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <HardDrive className="w-3.5 h-3.5" /> Localhost (/uploads)
                  </span>
                )}
              </div>

              {/* Formulário expandível */}
              {channelConfigOpen === "cloudflare_r2" && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "18px", marginBottom: "16px", display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>
                      Account ID da Cloudflare (opcional se preencher Endpoint completo)
                    </label>
                    <input
                      type="text"
                      value={r2AccountId}
                      onChange={(e) => setR2AccountId(e.target.value)}
                      placeholder="Ex: a1b2c3d4e5f67890abcdef..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>
                      Nome do Bucket R2 <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={r2Bucket}
                      onChange={(e) => setR2Bucket(e.target.value)}
                      placeholder="bipesend-media"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>
                      Access Key ID <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={r2AccessKey}
                      onChange={(e) => setR2AccessKey(e.target.value)}
                      placeholder="Ex: 284857291a0..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>
                      Secret Access Key <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" as const }}>
                      <input
                        type={r2ShowSecret ? "text" : "password"}
                        value={r2SecretKey}
                        onChange={(e) => setR2SecretKey(e.target.value)}
                        placeholder="Chave secreta do R2"
                        style={{ width: "100%", padding: "8px 36px 8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                      />
                      <button type="button" onClick={() => setR2ShowSecret(!r2ShowSecret)} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                        {r2ShowSecret ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px", display: "block" }}>
                      URL Pública de Visualização (R2.dev ou Subdomínio Customizado)
                    </label>
                    <input
                      type="text"
                      value={r2PublicUrl}
                      onChange={(e) => setR2PublicUrl(e.target.value)}
                      placeholder="https://pub-xxxxxx.r2.dev ou https://media.bipesend.com.br"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                    />
                  </div>

                  <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#F6821F", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Painel Cloudflare (R2 Object Storage)
                  </a>

                  <button
                    type="button"
                    disabled={channelSaving}
                    onClick={() => handleSaveChannelCredentials("cloudflare_r2")}
                    style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", border: "none", background: "linear-gradient(135deg, #F6821F 0%, #EA580C 100%)", color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 12px rgba(246, 130, 31, 0.25)" }}
                  >
                    {channelSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando e Validando...</> : <><ShieldCheck className="w-4 h-4" /> Salvar Credenciais com Criptografia</>}
                  </button>
                </div>
              )}
            </div>

            {/* Ações inferiores */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setChannelConfigOpen(channelConfigOpen === "cloudflare_r2" ? null : "cloudflare_r2")}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Settings2 className="w-4 h-4 text-[#64748B]" /> {channelConfigOpen === "cloudflare_r2" ? "Fechar Configuração" : "Configurar Credenciais"}
              </button>

              {/* Botão de Alternância Ativo / Localhost */}
              {channelStatuses.cloudflare_r2 === "active" ? (
                <button
                  type="button"
                  disabled={channelSaving}
                  onClick={() => handleToggleStatus("cloudflare_r2", "active")}
                  style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#475569", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  title="Pausa a nuvem R2 e volta a usar o disco local (localhost)"
                >
                  <HardDrive className="w-4 h-4 text-[#64748B]" /> Voltar p/ Localhost
                </button>
              ) : channelStatuses.cloudflare_r2 === "inactive" ? (
                <button
                  type="button"
                  disabled={channelSaving}
                  onClick={() => handleToggleStatus("cloudflare_r2", "inactive")}
                  style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", border: "none", background: "linear-gradient(135deg, #F6821F 0%, #EA580C 100%)", color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(246, 130, 31, 0.25)" }}
                >
                  <Zap className="w-4 h-4" /> Ativar Nuvem R2
                </button>
              ) : null}
            </div>

          </div>

        </div>
      )}

      {/* ── MODAL / GAVETA DE INSTALAÇÃO & CONFIGURAÇÃO ESTILO APP STORE ── */}
      {activeModalProvider && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "540px",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            animation: "ui-fade 0.2s ease"
          }}>
            {/* Header do Modal */}
            <div style={{
              background: activeModalProvider === "gemini" 
                ? "linear-gradient(135deg, #1E88E5 0%, #7C4DFF 100%)" 
                : "linear-gradient(135deg, #10A37F 0%, #0D8C6C 100%)",
              padding: "24px 28px",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  color: activeModalProvider === "gemini" ? "#1E88E5" : "#10A37F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                  {activeModalProvider === "gemini" ? <Sparkles className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "19px", fontWeight: "700", margin: "0 0 2px 0" }}>
                    Instalar & Configurar {activeModalProvider === "gemini" ? "Google Gemini AI" : "OpenAI GPT"}
                  </h3>
                  <span style={{ fontSize: "12px", opacity: 0.9 }}>
                    {activeModalProvider === "gemini" ? "Google DeepMind API Integration" : "OpenAI Platform API Integration"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "700"
                }}
              >
                ✕
              </button>
            </div>

            {/* Formulário do App Sheet */}
            <form onSubmit={handleSaveModal} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              
              {/* Campo de Chave de API */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span>Chave de API Oficial (API Key)</span>
                  <a
                    href={activeModalProvider === "gemini" ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#007BFF", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}
                  >
                    Obter Chave <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={modalShowKey ? "text" : "password"}
                    placeholder={
                      activeModalProvider === "gemini"
                        ? geminiConfigured ? "Manter chave atual salva (" + geminiMasked + ")" : "Cole sua chave AIzaSy..."
                        : openaiConfigured ? "Manter chave atual salva (" + openaiMasked + ")" : "Cole sua chave sk-..."
                    }
                    value={modalApiKey}
                    onChange={(e) => setModalApiKey(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      background: "#F8FAFC",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setModalShowKey(!modalShowKey)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94A3B8",
                      cursor: "pointer"
                    }}
                  >
                    {modalShowKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Seleção do Modelo Padrão */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", display: "block", marginBottom: "6px" }}>
                  Modelo Padrão Recomendado
                </label>
                <select
                  value={modalModel}
                  onChange={(e) => setModalModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    background: "#F8FAFC",
                    outline: "none"
                  }}
                >
                  {activeModalProvider === "gemini" ? (
                    <>
                      <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Última Geração 3.8 & Ultrarrápido — Recomendado)</option>
                      <option value="gemini-3.8-pro">Google Gemini 3.8 Pro (Máxima Capacidade Cognitiva & Governança)</option>
                      <option value="gemini-3.5-flash">Google Gemini 3.5 Flash (Veloz, Escalável & Assistência a Clientes)</option>
                      <option value="gemini-3.1-pro">Google Gemini 3.1 Pro (Raciocínio Lógico & Síntese de Regras)</option>
                      <option value="gemini-3.0-flash">Google Gemini 3.0 Flash (Geração 3.0 Ágil & Estável)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4.5-instant">OpenAI GPT-4.5 Instant (Conversação Instantânea em Tempo Real — Recomendado)</option>
                      <option value="gpt-4.5">OpenAI GPT-4.5 Flagship (Máxima Inteligência Geral & Negócios)</option>
                      <option value="o3-mini">OpenAI o3-mini (Raciocínio Acelerado & Chain-of-Thought)</option>
                      <option value="o1">OpenAI o1 (Raciocínio Profundo para Alta Complexidade)</option>
                      <option value="gpt-4o-instant">OpenAI GPT-4o Instant (Streaming Multimodal em Tempo Real)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Botão de Testar Conexão Instantâneo */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F1F5F9", padding: "10px 14px", borderRadius: "10px" }}>
                <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                  Validar credenciais antes de ativar:
                </span>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isValidatingKey}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0F172A",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isValidatingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#007BFF]" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  Testar Conexão
                </button>
              </div>

              {/* Switch de Ativação Exclusiva */}
              <div style={{
                background: modalSetActive ? "#EFF6FF" : "#F8FAFC",
                border: modalSetActive ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <strong style={{ fontSize: "13px", color: "#0F172A", display: "block" }}>
                    Definir como Motor Ativo Exclusivo
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                    Ao marcar, o outro provedor ({activeModalProvider === "gemini" ? "OpenAI" : "Gemini"}) ficará em espera.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={modalSetActive}
                  onChange={(e) => setModalSetActive(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#007BFF", cursor: "pointer" }}
                />
              </div>

              {/* Botões de Rodapé do Modal */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: "1px solid #CBD5E1",
                    background: "#F8FAFC",
                    color: "#475569",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1.6,
                    padding: "11px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    background: activeModalProvider === "gemini" 
                      ? "linear-gradient(135deg, #007BFF 0%, #6366F1 100%)" 
                      : "linear-gradient(135deg, #10A37F 0%, #0D8C6C 100%)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar & Conectar Aplicativo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

        </div>
      </main>
    </>
  );
}
