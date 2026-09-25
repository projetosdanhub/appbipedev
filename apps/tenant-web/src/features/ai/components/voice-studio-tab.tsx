"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TtsVoice,
  fetchTtsVoicesAction,
  synthesizeSpeechAction,
  cloneVoiceAction,
  deleteVoiceAction,
  SynthesizeSpeechResponse,
} from "../actions/ai.actions";

interface VoiceStudioTabProps {
  onSelectVoiceForAgent?: (voice: TtsVoice) => void;
}

export function VoiceStudioTab({ onSelectVoiceForAgent }: VoiceStudioTabProps) {
  // Estado das vozes
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<TtsVoice | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "female" | "male" | "child" | "cloned">("all");
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);

  // Player de amostra de referência
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Estado de Síntese
  const [synthesisText, setSynthesisText] = useState(
    "Olá Camila! Temos sim o Kit Duo Floral a pronta entrega com frete grátis hoje. Você já pode finalizar com segurança no botão abaixo pelo Pix com aprovação imediata."
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<SynthesizeSpeechResponse | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const synthAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [maxAudioSeconds, setMaxAudioSeconds] = useState(0); // 0 = sem limite

  // Estado de Clonagem
  const [cloneName, setCloneName] = useState("");
  const [cloneGender, setCloneGender] = useState<"female" | "male" | "child">("female");
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneMessage, setCloneMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Carregar vozes ao montar
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const res = await fetchTtsVoicesAction();
      setVoices(res.voices);
      if (res.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(res.voices[0]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // Tocar prévia de voz
  const handlePlaySample = (voice: TtsVoice) => {
    if (playingVoiceId === voice.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    // Usar sample_url ou áudio estático
    const src = voice.id === "germani" ? "/assets/germani.wav" : voice.sample_url || "";
    if (!src) return;

    const audio = new Audio(src);
    audio.onended = () => setPlayingVoiceId(null);
    audio.onerror = () => {
      console.warn("Erro ao reproduzir amostra da voz:", voice.id);
      setPlayingVoiceId(null);
    };

    audioPreviewRef.current = audio;
    setPlayingVoiceId(voice.id);
    audio.play().catch(() => setPlayingVoiceId(null));
  };

  // Executar Síntese
  const handleSynthesize = async () => {
    if (!selectedVoice || !synthesisText.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    setSynthesisError(null);
    setSynthesisResult(null);

    try {
      const res = await synthesizeSpeechAction(synthesisText.trim(), selectedVoice.id, "pt", maxAudioSeconds);
      if (res.success && res.data) {
        setSynthesisResult(res.data);
      } else {
        setSynthesisError(res.error || "Erro ao sintetizar fala.");
      }
    } catch (err: any) {
      setSynthesisError(err.message || "Erro inesperado.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Tocar áudio sintetizado
  const handlePlaySynthesized = () => {
    if (!synthesisResult) return;

    if (synthAudioRef.current) {
      if (isPlayingSynth) {
        synthAudioRef.current.pause();
        setIsPlayingSynth(false);
        return;
      }
      synthAudioRef.current.play();
      setIsPlayingSynth(true);
      return;
    }

    const audio = new Audio(`data:audio/wav;base64,${synthesisResult.audio_base64}`);
    audio.onended = () => setIsPlayingSynth(false);
    audio.onerror = () => setIsPlayingSynth(false);
    synthAudioRef.current = audio;
    setIsPlayingSynth(true);
    audio.play().catch(() => setIsPlayingSynth(false));
  };

  // Clonar nova voz
  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneFile || !cloneName.trim() || isCloning) return;

    setIsCloning(true);
    setCloneMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", cloneFile);
      formData.append("name", cloneName.trim());
      formData.append("gender", cloneGender);

      const res = await cloneVoiceAction(formData);
      if (res.success) {
        setCloneMessage({
          type: "success",
          text: `Voz "${cloneName}" clonada com sucesso! (${res.duration_seconds}s de áudio processado).`,
        });
        setCloneName("");
        setCloneFile(null);
        await loadVoices();
      } else {
        setCloneMessage({
          type: "error",
          text: res.error || "Falha ao clonar voz.",
        });
      }
    } catch (err: any) {
      setCloneMessage({
        type: "error",
        text: err.message || "Erro ao conectar com o serviço de clonagem.",
      });
    } finally {
      setIsCloning(false);
    }
  };

  // Excluir voz clonada
  const handleDeleteVoice = async (voiceId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta voz clonada?")) return;

    try {
      const res = await deleteVoiceAction(voiceId);
      if (res.success) {
        await loadVoices();
        if (selectedVoice?.id === voiceId) {
          setSelectedVoice(voices.find((v) => v.id !== voiceId) || null);
        }
      } else {
        alert(res.error || "Erro ao excluir voz.");
      }
    } catch {
      alert("Erro ao excluir voz.");
    }
  };

  // Filtragem de vozes
  const filteredVoices = voices.filter((v) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "cloned") return v.type === "cloned";
    return v.category === activeCategory;
  });

  const quickSamples = [
    {
      label: "🌸 Demonstração da Landing Page",
      text: "Olá Camila! Temos sim o Kit Duo Floral a pronta entrega com frete grátis hoje. Você já pode finalizar com segurança no botão abaixo pelo Pix com aprovação imediata.",
    },
    {
      label: "🛍️ Qualificação SDR / Vendas",
      text: "Olá! Aqui é da equipe comercial da BipeSend. Identifiquei que você busca automatizar suas vendas pelo WhatsApp e Instagram com IA. Podemos conversar 5 minutos?",
    },
    {
      label: "📞 Atendimento & Suporte Acolhedor",
      text: "Com certeza, posso te ajudar com isso agora mesmo! Já localizei o seu pedido no sistema e seu código de rastreamento foi enviado diretamente ao seu e-mail.",
    },
    {
      label: "🧸 Mensagem Expressiva / Infantil",
      text: "Oi amiguinho! Que bom falar com você! Hoje vamos aprender muitas coisas divertidas juntos. Está preparado para começar?",
    },
  ];

  return (
    <div className="voice-studio-container" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Banner Informativo */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0, 123, 255, 0.06) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #007bff 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              boxShadow: "0 4px 12px rgba(0, 123, 255, 0.25)",
            }}
          >
            🎙️
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>
              Motor Neural XTTSv2 — Clonagem Vocal Ultrarrealista
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
              Vozes pré-definidas em português (Feminina, Masculina, Infantil) e clonagem neural instantânea com upload de áudio e sincronização Cloudflare R2.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "#dcfce7",
              color: "#166534",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            Motor TTS Ativo (17 Idiomas)
          </span>
        </div>
      </div>

      {/* Grid Principal: 2 Colunas */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
        {/* Coluna 1: Biblioteca de Vozes e Testador de Síntese */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Caixa de Seleção de Vozes */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                1. Selecione a Voz para Falar
              </h4>

              {/* Filtros de Categoria */}
              <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
                {(
                  [
                    { id: "all", label: "Todas" },
                    { id: "female", label: "👩 Feminina" },
                    { id: "male", label: "👨 Masculina" },
                    { id: "child", label: "👧 Infantil" },
                    { id: "cloned", label: "✨ Minhas Clonadas" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: activeCategory === cat.id ? "600" : "500",
                      background: activeCategory === cat.id ? "#ffffff" : "transparent",
                      color: activeCategory === cat.id ? "#007bff" : "#64748b",
                      border: "none",
                      boxShadow: activeCategory === cat.id ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Vozes em Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              {isLoadingVoices ? (
                <div style={{ gridColumn: "1 / -1", padding: "30px", textAlign: "center", color: "#64748b" }}>
                  Carregando vozes disponíveis...
                </div>
              ) : filteredVoices.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "30px", textAlign: "center", color: "#64748b" }}>
                  Nenhuma voz encontrada nesta categoria.
                </div>
              ) : (
                filteredVoices.map((voice) => {
                  const isSelected = selectedVoice?.id === voice.id;
                  const isPlaying = playingVoiceId === voice.id;

                  const icon =
                    voice.category === "female"
                      ? "👩"
                      : voice.category === "male"
                      ? "👨"
                      : voice.category === "child"
                      ? "👧"
                      : "🎙️";

                  return (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: isSelected ? "2px solid #007bff" : "1px solid #e2e8f0",
                        background: isSelected ? "#f0f7ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "24px" }}>{icon}</span>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
                              {voice.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {voice.category === "female"
                                ? "Feminina"
                                : voice.category === "male"
                                ? "Masculina"
                                : voice.category === "child"
                                ? "Infantil / Jovem"
                                : "Clonada"}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            background: voice.type === "builtin" ? "#e0f2fe" : "#fef3c7",
                            color: voice.type === "builtin" ? "#0369a1" : "#b45309",
                          }}
                        >
                          {voice.type === "builtin" ? "Oficial" : "Clonada"}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.4 }}>
                        {voice.description || "Voz neural otimizada para atendimento de alta conversão."}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySample(voice);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: isPlaying ? "#007bff" : "#f8fafc",
                            color: isPlaying ? "#ffffff" : "#0f172a",
                            border: "1px solid #cbd5e1",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          {isPlaying ? "⏸️ Pausar" : "▶️ Ouvir Voz"}
                        </button>

                        {voice.type === "cloned" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVoice(voice.id);
                            }}
                            title="Excluir voz clonada"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "12px",
                              cursor: "pointer",
                              padding: "4px 8px",
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Área de Digitação de Texto e Síntese */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                2. Escreva o Texto que a Voz Deve Falar
              </h4>
              {selectedVoice && (
                <span style={{ fontSize: "13px", color: "#007bff", fontWeight: "600" }}>
                  Falando com: {selectedVoice.name} ({selectedVoice.category})
                </span>
              )}
            </div>

            {/* Sugestões Rápidas de Texto */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {quickSamples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSynthesisText(s.text)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#334155",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#007bff")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Campo de Texto */}
            <div style={{ position: "relative" }}>
              <textarea
                rows={4}
                value={synthesisText}
                onChange={(e) => setSynthesisText(e.target.value)}
                maxLength={1500}
                placeholder="Digite o texto que você deseja que a voz clonada pronuncie..."
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", bottom: "10px", right: "12px", fontSize: "11px", color: "#94a3b8" }}>
                {synthesisText.length}/1500 caracteres
              </span>
            </div>

            {/* Limite de Duração do Áudio */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "#f1f5f9",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#475569",
            }}>
              <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>⏱️ Duração máxima:</span>
              <select
                value={maxAudioSeconds}
                onChange={(e) => setMaxAudioSeconds(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#fff",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value={0}>Sem limite</option>
                <option value={10}>10 segundos</option>
                <option value={15}>15 segundos</option>
                <option value={20}>20 segundos (recomendado)</option>
                <option value={30}>30 segundos</option>
                <option value={45}>45 segundos</option>
                <option value={60}>60 segundos</option>
              </select>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {maxAudioSeconds > 0
                  ? `Texto será limitado a ~${Math.round(maxAudioSeconds * 2.2)} palavras`
                  : "O áudio terá a duração natural do texto"}
              </span>
            </div>

            {/* Botão de Ação para Gerar Fala */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleSynthesize}
                disabled={isSynthesizing || !selectedVoice || !synthesisText.trim()}
                style={{
                  background: "linear-gradient(135deg, #007bff 0%, #6366f1 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isSynthesizing ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0, 123, 255, 0.25)",
                  opacity: isSynthesizing ? 0.7 : 1,
                }}
              >
                {isSynthesizing ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                    Sintetizando com XTTSv2... (Aguarde alguns segundos)
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Gerar Áudio com Esta Voz
                  </>
                )}
              </button>

              {onSelectVoiceForAgent && selectedVoice && (
                <button
                  type="button"
                  onClick={() => onSelectVoiceForAgent(selectedVoice)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#0f172a",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🔗 Vincular a um Agente IA
                </button>
              )}
            </div>

            {/* Feedback de Erro */}
            {synthesisError && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", fontSize: "13px" }}>
                ⚠️ {synthesisError}
              </div>
            )}

            {/* Resultado da Síntese e Player de Áudio */}
            {synthesisResult && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "18px",
                  borderRadius: "14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px" }}>🎉</span>
                    <strong style={{ color: "#166534", fontSize: "14px" }}>
                      Áudio Gerado com Sucesso!
                    </strong>
                  </div>
                  <span style={{ fontSize: "12px", color: "#15803d" }}>
                    Latência: {(synthesisResult.latency_ms / 1000).toFixed(1)}s • Taxa: {synthesisResult.sample_rate}Hz
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={handlePlaySynthesized}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isPlayingSynth ? "⏸️ Pausar Áudio" : "▶️ Ouvir Áudio Gerado"}
                  </button>

                  <a
                    href={`data:audio/wav;base64,${synthesisResult.audio_base64}`}
                    download={`bipesend_voz_${synthesisResult.voice_id}.wav`}
                    style={{
                      textDecoration: "none",
                      background: "#ffffff",
                      border: "1px solid #86efac",
                      color: "#166534",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ⬇️ Baixar WAV
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Formulário de Clonagem de Nova Voz */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>✨</span>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                Clonar uma Nova Voz
              </h4>
            </div>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
              Envie um arquivo de áudio de 5 a 20 segundos de uma pessoa falando de forma clara. O XTTSv2 criará a matriz de clonagem instantaneamente.
            </p>

            <form onSubmit={handleCloneSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Nome da Voz */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Nome da Voz / Identificador
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mariana Consultora, Lucas Vendas..."
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Categoria / Gênero */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Perfil Vocal
                </label>
                <select
                  value={cloneGender}
                  onChange={(e) => setCloneGender(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    background: "#ffffff",
                  }}
                >
                  <option value="female">👩 Feminina</option>
                  <option value="male">👨 Masculina</option>
                  <option value="child">👧 Infantil / Jovem</option>
                </select>
              </div>

              {/* Upload de Arquivo de Áudio */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Arquivo de Áudio de Referência (.mp3, .wav, .ogg, .m4a)
                </label>
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                  onClick={() => document.getElementById("voice-file-input")?.click()}
                >
                  <input
                    id="voice-file-input"
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,.webm"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setCloneFile(e.target.files[0]);
                      }
                    }}
                  />
                  {cloneFile ? (
                    <div>
                      <span style={{ fontSize: "24px" }}>🎵</span>
                      <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a", marginTop: "4px" }}>
                        {cloneFile.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {(cloneFile.size / 1024).toFixed(0)} KB • Clique para trocar
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: "24px" }}>📁</span>
                      <div style={{ fontWeight: "600", fontSize: "13px", color: "#007bff", marginTop: "4px" }}>
                        Selecione um arquivo de voz
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Formatos suportados: MP3, WAV, OGG, M4A
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info de Armazenamento Cloudflare R2 / Local */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#64748b",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: "600", color: "#334155" }}>
                  ☁️ Armazenamento Híbrido:
                </div>
                <div>
                  • <strong>Local:</strong> Salvo imediatamente em <code>app/speakers/</code> para inferência ultra-rápida.
                </div>
                <div>
                  • <strong>Nuvem:</strong> Suporte configurável para <strong>Cloudflare R2</strong> via variáveis de ambiente.
                </div>
              </div>

              {/* Mensagem de Feedback */}
              {cloneMessage && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    background: cloneMessage.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color: cloneMessage.type === "success" ? "#166534" : "#991b1b",
                    border: `1px solid ${cloneMessage.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                  }}
                >
                  {cloneMessage.text}
                </div>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isCloning || !cloneFile || !cloneName.trim()}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isCloning ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: isCloning ? 0.7 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {isCloning ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                    Convertendo e Clonando Voz...
                  </>
                ) : (
                  <>
                    <span>🎙️</span>
                    Clonar Esta Voz
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
