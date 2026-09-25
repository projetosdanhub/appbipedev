"use client";

import React, { useState, useEffect } from "react";
import { AiAgent, CreateAiAgent, AiAgentTemplate } from "@bipesend/contracts";
import { TtsVoice } from "../actions/ai.actions";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: CreateAiAgent) => void;
  initialData?: AiAgentTemplate | null;
  initialVoice?: TtsVoice | null;
}

export function CreateAgentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialVoice,
}: CreateAgentModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [gender, setGender] = useState<"feminine" | "masculine" | "neutral">(
    initialData?.gender.includes("Masc") ? "masculine" : "feminine"
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    initialVoice?.id || "germani"
  );
  const [role, setRole] = useState(initialData?.role || "");
  const [personality, setPersonality] = useState(initialData?.personality || "");
  const [limitationsText, setLimitationsText] = useState(
    initialData?.limitations?.join("\n") || 
    "- Nunca conceder descontos acima de 10% sem autorização.\n- Nunca falar mal de empresas ou concorrentes.\n- Direcionar para atendimento humano se o cliente solicitar."
  );
  const [knowledgeContext, setKnowledgeContext] = useState("");
  const [channel, setChannel] = useState<"all" | "whatsapp" | "instagram" | "tiktok" | "web">("all");
  const [maxAudioSeconds, setMaxAudioSeconds] = useState<number>(20);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setRole(initialData.role);
        setPersonality(initialData.personality);
        setLimitationsText(initialData.limitations.join("\n"));
        setGender(initialData.gender.includes("Masc") ? "masculine" : "feminine");
      }
      if (initialVoice) {
        setSelectedVoiceId(initialVoice.id);
        if (initialVoice.category === "male") setGender("masculine");
        else if (initialVoice.category === "female") setGender("feminine");
      }
    }
  }, [isOpen, initialData, initialVoice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const limitations = limitationsText
      .split("\n")
      .map((l) => l.trim().replace(/^-\s*/, ""))
      .filter((l) => l.length > 0);

    const voiceName =
      selectedVoiceId === "germani"
        ? "Germani (Feminina Oficial)"
        : initialVoice?.name || "Voz Personalizada";

    onSave({
      name: name.trim(),
      gender,
      role: role.trim(),
      personality: personality.trim() || "Profissional, empático, objetivo e acolhedor.",
      limitations,
      knowledgeContext: knowledgeContext.trim(),
      channel,
      status: "active",
      isMasterTemplate: false,
      voiceConfig: {
        voiceId: selectedVoiceId,
        voiceName,
        provider: "gemini",
        speed: 1.0,
        pitch: 0,
        sendAudioMode: "hybrid",
        cloningScript: "Olá, que bom falar com você! Aqui é da equipe de atendimento.",
        maxAudioSeconds,
      },
    });
    onClose();
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-head">
          <h3 className="ai-modal-title">
            <span>🤖</span> {initialData ? `Configurar Agente: ${initialData.name}` : "Criar Novo Agente de IA"}
          </h3>
          <button className="ai-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div className="ai-modal-body">
            {/* Aviso de Segurança Nativa */}
            <div className="ai-guardrail-notice">
              <span style={{ fontSize: "16px" }}>🛡️</span>
              <div>
                <strong>Guarda-Corpos de Segurança Ativos:</strong> Esta IA possui proteção rigorosa contra injeção de scripts (XSS), manipulação de banco de dados (SQL), vazamento de senhas e difamação corporativa.
              </div>
            </div>

            {/* Nome e Gênero */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group-ai">
                <label className="form-label-ai">
                  Nome do Agente
                  <span className="form-hint-ai">Ex: Sofia, Lucas</span>
                </label>
                <input
                  type="text"
                  className="form-input-ai"
                  placeholder="Como o agente vai se chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  required
                />
              </div>

              <div className="form-group-ai">
                <label className="form-label-ai">Gênero / Pronome</label>
                <select
                  className="form-select-ai"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="feminine">Feminino (Ela / Dela)</option>
                  <option value="masculine">Masculino (Ele / Dele)</option>
                  <option value="neutral">Neutro (Equipe / Bot)</option>
                </select>
              </div>
            </div>

            {/* Papel e Canal */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
              <div className="form-group-ai">
                <label className="form-label-ai">
                  Função / Especialidade
                  <span className="form-hint-ai">Ex: Vendas B2B, Suporte</span>
                </label>
                <input
                  type="text"
                  className="form-input-ai"
                  placeholder="Qual o papel deste agente?"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              <div className="form-group-ai">
                <label className="form-label-ai">Canal Omnichannel</label>
                <select
                  className="form-select-ai"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                >
                  <option value="all">Todos os Canais</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="tiktok">TikTok Mensagens</option>
                  <option value="web">Web Chat</option>
                </select>
              </div>
            </div>

            {/* Voz Neural do Agente (XTTSv2) */}
            <div className="form-group-ai">
              <label className="form-label-ai">
                Voz Neural do Agente (XTTSv2)
                <span className="form-hint-ai">Voz que falará mensagens de áudio no WhatsApp/Omnichannel</span>
              </label>
              <select
                className="form-select-ai"
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
              >
                <option value="germani">👩 Germani — Feminina Oficial BipeSend (Calorosa & Consultiva)</option>
                {initialVoice && initialVoice.id !== "germani" && (
                  <option value={initialVoice.id}>✨ {initialVoice.name} (Voz Clonada Personalizada)</option>
                )}
              </select>
            </div>

            {/* Limite de Duração por Mensagem de Áudio */}
            <div className="form-group-ai">
              <label className="form-label-ai">
                Limite de Duração do Áudio (por Resposta)
                <span className="form-hint-ai">Evita áudios longos, acelera a entrega e economiza processamento</span>
              </label>
              <select
                className="form-select-ai"
                value={maxAudioSeconds}
                onChange={(e) => setMaxAudioSeconds(Number(e.target.value))}
              >
                <option value={10}>⚡ 10 segundos (Respostas ultra-rápidas e curtas)</option>
                <option value={15}>⏱️ 15 segundos (Ideal para WhatsApp dinâmico)</option>
                <option value={20}>🎯 20 segundos (Padrão recomendado BipeSend)</option>
                <option value={30}>💬 30 segundos (Consultivo e detalhado)</option>
                <option value={45}>📢 45 segundos (Apresentações e instruções)</option>
                <option value={60}>🎙️ 60 segundos (Máximo permitido por áudio)</option>
              </select>
            </div>

            {/* Personalidade */}
            <div className="form-group-ai">
              <label className="form-label-ai">
                Personalidade e Tom de Voz
                <span className="form-hint-ai">Como o agente deve se expressar?</span>
              </label>
              <textarea
                className="form-textarea-ai"
                rows={3}
                placeholder="Ex: Empática, prestativa, confiante, dinâmica. Usa emojis de forma moderada e conduz com foco em solucionar dúvidas com rapidez."
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </div>

            {/* Limitações */}
            <div className="form-group-ai">
              <label className="form-label-ai">
                Limitações e Regras de Negócio (Uma por linha)
                <span className="form-hint-ai">O que a IA NÃO pode fazer</span>
              </label>
              <textarea
                className="form-textarea-ai"
                rows={4}
                placeholder="- Não prometer prazos sem confirmação&#10;- Não dar descontos acima de 10%&#10;- Não transferir sem avisar o cliente"
                value={limitationsText}
                onChange={(e) => setLimitationsText(e.target.value)}
              />
            </div>

            {/* Conhecimento da Empresa */}
            <div className="form-group-ai">
              <label className="form-label-ai">
                Contexto Adicional da Empresa & Produtos
                <span className="form-hint-ai">Opcional</span>
              </label>
              <textarea
                className="form-textarea-ai"
                rows={3}
                placeholder="Insira detalhes sobre planos, horários de funcionamento, regras de entrega ou diferenciais da sua marca..."
                value={knowledgeContext}
                onChange={(e) => setKnowledgeContext(e.target.value)}
              />
            </div>
          </div>

          <div className="ai-modal-foot">
            <button type="button" className="btn-ai-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-ai-primary">
              Salvar e Ativar Agente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
