"use client";

import React, { useState, useEffect } from "react";
import { AiAgent, CreateAiAgent, AiAgentTemplate } from "@bipesend/contracts";
import { CreateAgentModal } from "./create-agent-modal";
import { TemplatePickerModal } from "./template-picker-modal";
import { VoiceStudioTab } from "./voice-studio-tab";
import { chatWithAgentAction, TtsVoice } from "../actions/ai.actions";
import "./ai-agents.css";

const STORAGE_KEY = "bipesend_ai_agents_v1";

const INITIAL_DEMO_AGENTS: AiAgent[] = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    tenantId: "t1t2t3t4-0000-0000-0000-000000000001",
    name: "Sofia",
    gender: "feminine",
    role: "Consultora de Vendas Omnichannel",
    personality: "Acolhedora, empática, persuasiva e dinâmica. Focada em identificar as dores do lead e conduzir com entusiasmo para o fechamento.",
    limitations: [
      "Nunca conceder descontos acima de 10% sem autorização prévia de um gestor humano.",
      "Não enviar links externos não homologados na base da empresa.",
      "Direcionar para atendimento humano se o cliente demonstrar insatisfação.",
      "Nunca criticar marcas concorrentes de forma negativa."
    ],
    knowledgeContext: "A BipeSend é uma plataforma Omnichannel completa unificando WhatsApp, Instagram, TikTok e CRM com IA.",
    channel: "all",
    status: "active",
    isMasterTemplate: false,
    voiceConfig: {
      voiceId: "germani",
      voiceName: "Germani (Feminina Oficial)",
      provider: "gemini",
      speed: 1.0,
      pitch: 0,
      sendAudioMode: "hybrid",
      cloningScript: "Olá, que bom falar com você! Aqui é da equipe de atendimento.",
      maxAudioSeconds: 20,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    tenantId: "t1t2t3t4-0000-0000-0000-000000000001",
    name: "Lucas",
    gender: "masculine",
    role: "Especialista em Triagem & SDR",
    personality: "Prático, objetivo, consultivo e focado em qualificação de novos leads antes de enviar para os corretores/vendedores.",
    limitations: [
      "Manter o foco exclusivamente na qualificação de contatos.",
      "Não assinar propostas ou prometer prazos de entrega.",
      "Agendar reunião diretamente no CRM assim que o lead for qualificado."
    ],
    knowledgeContext: "Foco em qualificar orçamento, prazos de compra e perfil de interesse.",
    channel: "whatsapp",
    status: "active",
    isMasterTemplate: false,
    voiceConfig: {
      voiceId: "lucas",
      voiceName: "Lucas Confiante (Masculino SDR)",
      provider: "gemini",
      speed: 1.05,
      pitch: 0,
      sendAudioMode: "hybrid",
      cloningScript: "Olá! Aqui é o Lucas da triagem comercial. Gostaria de entender melhor suas necessidades.",
      maxAudioSeconds: 20,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

interface AiAgentsClientProps {
  initialTemplates: AiAgentTemplate[];
}

export function AiAgentsClient({ initialTemplates }: AiAgentsClientProps) {
  const [activeTab, setActiveTab] = useState<"agents" | "voice_studio">("agents");
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AiAgentTemplate | null>(null);
  const [preselectedVoice, setPreselectedVoice] = useState<TtsVoice | null>(null);

  // Chat de teste rápido com o Agente
  const [testingAgent, setTestingAgent] = useState<AiAgent | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "assistant"; content: string; blocked?: boolean }[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAgents(JSON.parse(saved));
      } else {
        setAgents(INITIAL_DEMO_AGENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_AGENTS));
      }
    } catch {
      setAgents(INITIAL_DEMO_AGENTS);
    }
  }, []);

  const saveAgents = (newAgents: AiAgent[]) => {
    setAgents(newAgents);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgents));
    } catch {
      // Ignora erro de storage
    }
  };

  const handleCreateAgent = (data: CreateAiAgent) => {
    const newAgent: AiAgent = {
      id: crypto.randomUUID(),
      tenantId: "t1t2t3t4-0000-0000-0000-000000000001",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveAgents([newAgent, ...agents]);
  };

  const handleToggleStatus = (id: string, newStatus: "active" | "paused" | "stopped") => {
    const updated = agents.map((ag) => (ag.id === id ? { ...ag, status: newStatus } : ag));
    saveAgents(updated);
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este Agente IA?")) {
      const updated = agents.filter((ag) => ag.id !== id);
      saveAgents(updated);
      if (testingAgent?.id === id) setTestingAgent(null);
    }
  };

  const handleSelectTemplate = (tpl: AiAgentTemplate) => {
    setSelectedTemplate(tpl);
    setIsCreateOpen(true);
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim() || !testingAgent || isSending) return;

    const userMsg = testMessage.trim();
    setChatLog((prev) => [...prev, { role: "user", content: userMsg }]);
    setTestMessage("");
    setIsSending(true);

    try {
      const response = await chatWithAgentAction({
        agentId: testingAgent.id,
        agentConfig: {
          name: testingAgent.name,
          gender: testingAgent.gender,
          role: testingAgent.role,
          personality: testingAgent.personality,
          limitations: testingAgent.limitations,
          knowledgeContext: testingAgent.knowledgeContext,
          channel: testingAgent.channel,
          status: testingAgent.status,
          isMasterTemplate: false,
          voiceConfig: testingAgent.voiceConfig || {
            voiceId: "pt-BR-natural-sofia",
            voiceName: "Sofia Natural",
            provider: "gemini",
            speed: 1.0,
            pitch: 0,
            sendAudioMode: "hybrid",
            cloningScript: "Olá, que bom falar com você! Aqui é da equipe de atendimento."
          },
        },
        message: userMsg,
        history: chatLog.map((m) => ({ role: m.role, content: m.content })),
        channel: testingAgent.channel,
      });

      setChatLog((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, blocked: response.blocked },
      ]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao comunicar com o agente de IA." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const totalActive = agents.filter((a) => a.status === "active").length;
  const totalPaused = agents.filter((a) => a.status === "paused").length;

  return (
    <div className="ai-agents-page">
      {/* Header */}
      <div className="ai-agents-header">
        <div>
          <h1 className="ai-agents-header-title">
            <span>✨</span> Agentes de Inteligência Artificial Omnichannel
          </h1>
          <p className="ai-agents-header-desc">
            Crie e ensine seus agentes IA com personalidade própria, tom de voz, limitações comerciais e segurança nativa com proteção total contra vazamento de senhas, scripts e manipulação de banco de dados.
          </p>
        </div>

        <div className="ai-agents-actions">
          <button
            type="button"
            className="btn-ai-secondary"
            onClick={() => setIsTemplatePickerOpen(true)}
          >
            <span>📋</span> Modelos Prontos
          </button>
          <button
            type="button"
            className="btn-ai-primary"
            onClick={() => {
              setSelectedTemplate(null);
              setPreselectedVoice(null);
              setIsCreateOpen(true);
            }}
          >
            <span>+</span> Criar Agente IA
          </button>
        </div>
      </div>

      {/* Tabs de Navegação: Agentes vs Estúdio de Voz & Clonagem */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "#ffffff",
          padding: "6px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s ease",
            background: activeTab === "agents" ? "linear-gradient(135deg, #007bff 0%, #6366f1 100%)" : "transparent",
            color: activeTab === "agents" ? "#ffffff" : "#64748b",
            boxShadow: activeTab === "agents" ? "0 2px 8px rgba(0, 123, 255, 0.25)" : "none",
          }}
        >
          <span>🤖</span> Agentes Omnichannel ({agents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("voice_studio")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s ease",
            background: activeTab === "voice_studio" ? "linear-gradient(135deg, #007bff 0%, #6366f1 100%)" : "transparent",
            color: activeTab === "voice_studio" ? "#ffffff" : "#64748b",
            boxShadow: activeTab === "voice_studio" ? "0 2px 8px rgba(0, 123, 255, 0.25)" : "none",
          }}
        >
          <span>🎙️</span> Estúdio de Voz & Clonagem Neural (XTTSv2)
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "10px",
              background: activeTab === "voice_studio" ? "rgba(255,255,255,0.25)" : "#eff6ff",
              color: activeTab === "voice_studio" ? "#ffffff" : "#007bff",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            AO VIVO
          </span>
        </button>
      </div>

      {activeTab === "agents" ? (
        <>
          {/* Estatísticas */}
      <div className="ai-overview-grid">
        <div className="ai-overview-card">
          <div className="ai-overview-icon">🤖</div>
          <div className="ai-overview-info">
            <span className="ai-overview-num">{agents.length}</span>
            <span className="ai-overview-label">Agentes Configurados</span>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon green">⚡</div>
          <div className="ai-overview-info">
            <span className="ai-overview-num">{totalActive}</span>
            <span className="ai-overview-label">Ativos no Omnichannel</span>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon amber">⏸️</div>
          <div className="ai-overview-info">
            <span className="ai-overview-num">{totalPaused}</span>
            <span className="ai-overview-label">Pausados / Em Treino</span>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon purple">🛡️</div>
          <div className="ai-overview-info">
            <span className="ai-overview-num">100%</span>
            <span className="ai-overview-label">Guarda-Corpos de Segurança</span>
          </div>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="ai-agents-section">
        <div className="ai-agents-section-head">
          <h2 className="ai-agents-section-title">Seus Agentes de Atendimento & Vendas</h2>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            {agents.length} {agents.length === 1 ? "agente" : "agentes"}
          </span>
        </div>

        <div className="ai-agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="ai-agent-card">
              <div>
                <div className="ai-agent-card-header">
                  <div className="ai-agent-avatar">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="ai-agent-main-meta">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 className="ai-agent-name">{agent.name}</h3>
                      <span className={`ai-agent-status-badge ${agent.status}`}>
                        {agent.status === "active" ? "Ativo" : agent.status === "paused" ? "Pausado" : "Parado"}
                      </span>
                    </div>
                    <p className="ai-agent-role">{agent.role}</p>
                  </div>
                </div>

                <div className="ai-agent-body">
                  <div className="ai-agent-tags">
                    <span className="ai-agent-tag channel">
                      {agent.channel === "all" ? "🌐 Todos os Canais" : `📱 ${agent.channel.toUpperCase()}`}
                    </span>
                    <span className="ai-agent-tag">
                      {agent.gender === "feminine" ? "Ela/Dela" : agent.gender === "masculine" ? "Ele/Dele" : "Neutro"}
                    </span>
                  </div>

                  <p style={{ margin: "0", fontSize: "13px", color: "#475569" }}>
                    {agent.personality}
                  </p>

                  {agent.limitations.length > 0 && (
                    <div className="ai-agent-limitations-summary">
                      <strong>Limitações ativas:</strong> {agent.limitations.length} regras rígidas aplicadas
                    </div>
                  )}
                </div>
              </div>

              <div className="ai-agent-card-footer">
                <button
                  type="button"
                  className="btn-ai-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => {
                    setTestingAgent(agent);
                    setChatLog([
                      {
                        role: "assistant",
                        content: `Olá! Eu sou ${agent.name}, ${agent.role}. Como posso te ajudar hoje?`,
                      },
                    ]);
                  }}
                >
                  💬 Testar Diálogo
                </button>

                <div className="ai-agent-controls">
                  {agent.status === "active" ? (
                    <button
                      type="button"
                      className="btn-ai-icon pause"
                      title="Pausar Agente"
                      onClick={() => handleToggleStatus(agent.id, "paused")}
                    >
                      ⏸️ Pausar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-ai-icon play"
                      title="Ativar Agente"
                      onClick={() => handleToggleStatus(agent.id, "active")}
                    >
                      ▶️ Ativar
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-ai-icon"
                    title="Excluir Agente"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gaveta de Teste do Agente */}
      {testingAgent && (
        <div className="ai-modal-overlay" onClick={() => setTestingAgent(null)}>
          <div
            className="ai-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px", height: "650px" }}
          >
            <div className="ai-modal-head">
              <h3 className="ai-modal-title">
                <span>💬</span> Testar Diálogo: {testingAgent.name} ({testingAgent.role})
              </h3>
              <button className="ai-modal-close" onClick={() => setTestingAgent(null)}>
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "#f8fafc",
              }}
            >
              {chatLog.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    background:
                      item.role === "user"
                        ? "#007bff"
                        : item.blocked
                        ? "#fef2f2"
                        : "#ffffff",
                    color:
                      item.role === "user"
                        ? "#ffffff"
                        : item.blocked
                        ? "#dc2626"
                        : "#0f172a",
                    border: item.blocked
                      ? "1px solid #fecaca"
                      : item.role === "user"
                      ? "none"
                      : "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {item.blocked && <strong style={{ display: "block", marginBottom: "4px" }}>🛡️ Bloqueio de Segurança:</strong>}
                  {item.content}
                </div>
              ))}
              {isSending && (
                <div style={{ alignSelf: "flex-start", fontSize: "12px", color: "#64748b" }}>
                  {testingAgent.name} está digitando...
                </div>
              )}
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", background: "#ffffff", display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="form-input-ai"
                placeholder="Envie uma mensagem ou teste um comando..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTestMessage()}
                disabled={isSending}
              />
              <button
                type="button"
                className="btn-ai-primary"
                onClick={handleSendTestMessage}
                disabled={isSending}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    ) : (
      <VoiceStudioTab
        onSelectVoiceForAgent={(voice) => {
          setPreselectedVoice(voice);
          setSelectedTemplate(null);
          setIsCreateOpen(true);
        }}
      />
    )}

      {/* Modal de Criação */}
      <CreateAgentModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setPreselectedVoice(null);
        }}
        onSave={handleCreateAgent}
        initialData={selectedTemplate}
        initialVoice={preselectedVoice}
      />

      {/* Modal de Escolha de Templates Mestres */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        templates={initialTemplates}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
