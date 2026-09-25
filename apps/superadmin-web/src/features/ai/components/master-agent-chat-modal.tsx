"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Bot,
  User,
  Radio,
  Sliders,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { AiAgentTemplate, ClonedVoiceRecord } from "@bipesend/contracts";
import { chatWithMasterAgentAction, synthesizeSpeechAction } from "../actions/superadmin-ai.actions";
import { VoiceProfileService } from "../services/voice-profile.service";

interface MasterAgentChatModalProps {
  template: AiAgentTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onEditVoice?: (template: AiAgentTemplate) => void;
  clonedVoice?: ClonedVoiceRecord | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

export function MasterAgentChatModal({
  template,
  isOpen,
  onClose,
  onEditVoice,
  clonedVoice,
}: MasterAgentChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentlyPlayingMsgId, setCurrentlyPlayingMsgId] = useState<string | null>(null);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.05);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa o chat quando o modal abre com o agente
  useEffect(() => {
    if (!isOpen || !template) return;

    // Calibração de tom/pitch baseada na voz clonada ou no gênero da IA mestre
    if (clonedVoice) {
      const isFemale = clonedVoice.gender === "female";
      const isMale = clonedVoice.gender === "male";
      setVoicePitch(isFemale ? 1.15 : isMale ? 0.88 : 1.0);
      setVoiceRate(Math.min(1.25, Math.max(0.85, Math.round((clonedVoice.acoustics.cadenceWpm / 150) * 100) / 100)));
    } else {
      const isFemale = template.gender?.toLowerCase().includes("fem") || template.voice?.includes("sofia") || template.voice?.includes("maya");
      setVoicePitch(isFemale ? 1.15 : 0.9);
      setVoiceRate(1.02);
    }

    const initialGreeting =
      template.name === "Sofia"
        ? "Olá! Sou a Sofia, consultora de vendas da BipeSend. Me conte: como funciona o seu processo comercial hoje e quantos contatos você recebe no WhatsApp?"
        : template.name === "Lucas"
        ? "Olá! Aqui é o Lucas da qualificação comercial. Para entender se a BipeSend é o melhor encaixe para o seu momento, qual o tamanho atual da sua equipe de vendas?"
        : template.name === "Maya"
        ? "Olá! Sou a Maya do time de suporte e sucesso do cliente. Estou à disposição para tirar qualquer dúvida técnica ou apoiar sua operação!"
        : template.name === "Gabriel"
        ? "Olá! Sou o Gabriel, especialista em consultoria e negócios de alto padrão. Como posso te auxiliar a elevar o nível dos seus atendimentos?"
        : `Olá! Sou ${template.name}, ${template.role}. Como posso te ajudar hoje?`;

    setMessages([
      {
        id: "msg-init",
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [isOpen, template, clonedVoice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Função para falar a resposta da IA com voz humanizada brasileira e fonética normalizada
  const playSpeech = async (text: string, msgId: string) => {
    // Se já estiver tocando essa mensagem, pausa
    if (isPlayingVoice && currentlyPlayingMsgId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingVoice(false);
      setCurrentlyPlayingMsgId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsPlayingVoice(true);
    setCurrentlyPlayingMsgId(msgId);

    // Aplica o normalizador fonético da BipeSend (ex: BipeSend -> Báipi Send, PIX -> píquis)
    const normalizedText = VoiceProfileService.normalizeTextForSpeech(text);
    
    // Obter ID da voz
    const voiceId = clonedVoice?.id || template?.voice || "default";

    try {
      const res = await synthesizeSpeechAction(normalizedText, voiceId);
      if (res.success && res.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingVoice(false);
          setCurrentlyPlayingMsgId(null);
        };
        
        audio.onerror = () => {
          setIsPlayingVoice(false);
          setCurrentlyPlayingMsgId(null);
        };

        await audio.play();
      } else {
        setIsPlayingVoice(false);
        setCurrentlyPlayingMsgId(null);
      }
    } catch (e) {
      setIsPlayingVoice(false);
      setCurrentlyPlayingMsgId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !template || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatWithMasterAgentAction(template.id, userText, historyPayload);

      const agentReplyMsg: Message = {
        id: `agent-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentReplyMsg]);

      // Toca o áudio automaticamente se o usuário desejar simulação live
      playSpeech(res.reply, agentReplyMsg.id);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "assistant",
          content: "Desculpe, tive uma oscilação na resposta. Pode me enviar novamente?",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingVoice(false);
    setCurrentlyPlayingMsgId(null);

    if (!template) return;
    const initialGreeting =
      template.name === "Sofia"
        ? "Olá! Sou a Sofia da BipeSend. Como posso ajudar a impulsionar as conversões da sua empresa hoje?"
        : `Olá! Sou ${template.name}, ${template.role}. Como posso te ajudar hoje?`;

    setMessages([
      {
        id: "msg-reset",
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isOpen || !template) return null;

  const voiceNameClean = template.voice?.replace("pt-BR-natural-", "").toUpperCase() || "PADRÃO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col overflow-hidden">
        {/* Header do Agente */}
        <div className="p-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-base shadow-xs font-inter">
              {template.name ? template.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-inter text-base font-bold text-slate-900">
                  {template.name}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-[#007BFF]">
                  {template.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  {clonedVoice ? `Voz Clonada: ${clonedVoice.name}` : `Voz ${voiceNameClean} Ativa`}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[320px]">
                {template.role} • {template.gender}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              title="Ajustar Tom e Velocidade da Voz"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showVoiceSettings
                  ? "bg-blue-50 text-[#007BFF] border-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetChat}
              title="Reiniciar Conversa"
              className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                onClose();
              }}
              title="Fechar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gaveta de Calibração da Voz */}
        {showVoiceSettings && (
          <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Tom (Pitch):</span>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-24 accent-[#007BFF]"
              />
              <span className="text-slate-500 font-mono">{voicePitch.toFixed(2)}x</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Cadência (Velocidade):</span>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-24 accent-[#007BFF]"
              />
              <span className="text-slate-500 font-mono">{voiceRate.toFixed(2)}x</span>
            </div>

            <button
              type="button"
              onClick={() => playSpeech(`Olá, sou a voz calibrada de ${template.name}. Estou pronta para atender seus clientes no WhatsApp!`, "test-voice")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#007BFF] text-white font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Testar Áudio da Voz</span>
            </button>
          </div>
        )}

        {/* Feed de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isPlayingThis = isPlayingVoice && currentlyPlayingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                    {template.name.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#007BFF] text-white rounded-br-xs"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Barra de controle de áudio se for resposta da IA */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => playSpeech(msg.content, msg.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isPlayingThis
                              ? "bg-blue-600 text-white animate-pulse"
                              : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#007BFF]"
                          }`}
                        >
                          {isPlayingThis ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Pausar Voz</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Ouvir Voz da {template.name}</span>
                            </>
                          )}
                        </button>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {template.name.charAt(0)}
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">{template.name} está digitando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              disabled={isLoading}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Converse com ${template.name} (${template.role})...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#007BFF] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Testando modelo mestre oficial • Respostas humanizadas em tempo real</span>
            <span>Voz configurada: {template.voice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
