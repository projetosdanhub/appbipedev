"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Settings,
  Compass,
  CheckCircle2,
  Clock,
  X,
  FastForward,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Mic,
  Film,
  Trash2,
  Volume2,
  Square,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import {
  GermaniConfig,
  GermaniChatMessage,
  GermaniActionProposal,
  GermaniAttachment,
  AudioQualityAnalysis,
} from "../types/germani.types";
import {
  sendGermaniChatMessageAction,
  executeGermaniActionProposalAction,
  getGermaniChatHistoryAction,
  saveGermaniChatHistoryAction,
  clearGermaniChatHistoryAction,
  uploadGermaniAttachmentAction,
  analyzeAudioQualityAction,
  transcribeVoiceDictationAction,
  auditFinancialFileAction,
  synthesizeSpeechAction,
} from "../actions/superadmin-ai.actions";
import { PdfExportService } from "../services/pdf-export.service";
import { FinancialAuditReport } from "../services/financial-audit.service";
import { VoiceProfileService } from "../services/voice-profile.service";

interface GermaniChatPlaygroundProps {
  config: GermaniConfig;
  hideHeader?: boolean;
  isOpen?: boolean;
  onNewMessageDelivered?: (message: GermaniChatMessage) => void;
}

const STORAGE_CHAT_KEY = "bipesend_superadmin_germani_chat_history";

const THINKING_MESSAGES = [
  "Germani está pensando...",
  "Analisando contexto de Daniel...",
  "Organizando resposta...",
];

export function GermaniChatPlayground({
  config,
  hideHeader = false,
  isOpen = true,
  onNewMessageDelivered,
}: GermaniChatPlaygroundProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<GermaniChatMessage[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        config.greetingMessage ||
        "Oi Daniel! O que vamos fazer hoje no painel? Só me dizer que eu abro as telas ou ajudo no que precisar.",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<GermaniAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── PUSH-TO-TALK STATE ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── AUDIO QUALITY ANALYSIS STATE ──
  const [audioAnalysis, setAudioAnalysis] = useState<AudioQualityAnalysis | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const audioAnalysisInputRef = useRef<HTMLInputElement>(null);

  // ── SÍNTESE DE VOZ GERMANI (TTS PLAYBACK) ──
  const [playingAudioMessageId, setPlayingAudioMessageId] = useState<string | null>(null);
  const [isSynthesizingAudioId, setIsSynthesizingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ── AUDITORIA FINANCEIRA DE PLANILHAS (CSV / EXTRATOS) ──
  const [financialReport, setFinancialReport] = useState<FinancialAuditReport | null>(null);
  const [isAuditingFinancial, setIsAuditingFinancial] = useState(false);
  const financialFileInputRef = useRef<HTMLInputElement>(null);

  // Controle de digitação humana progressiva
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingPendingMessage, setTypingPendingMessage] = useState<GermaniChatMessage | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega histórico salvo no localStorage para resposta instantânea e sincroniza com o servidor
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((m) => {
            const { quickActions, ...rest } = m;
            // Se houver navegação residual para tenants ou em mensagens de saudação, remove
            if (rest.navigationAction?.path === "/tenants" || /^(?:oi|ol[aá]|bom dia|boa tarde|boa noite|tudo bem)/i.test(rest.content || "")) {
              rest.navigationAction = undefined;
            }
            return rest;
          });
          setMessages(cleaned);
        }
      }
    } catch {
      // Ignora falha de leitura
    }

    // Sincroniza com a persistência segura do servidor (garante memória mesmo com cache do navegador limpo)
    getGermaniChatHistoryAction()
      .then((serverHistory) => {
        if (Array.isArray(serverHistory) && serverHistory.length > 0) {
          setMessages(serverHistory);
          try {
            localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(serverHistory));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Salva no localStorage e no servidor sempre que novas mensagens forem trocadas
  useEffect(() => {
    if (!typingMessageId && messages.length > 1) {
      try {
        localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
      } catch {
        // Ignora falha de escrita
      }
      // Persiste com segurança no servidor
      saveGermaniChatHistoryAction(messages).catch(() => {});
    }
  }, [messages, typingMessageId]);

  // Rotação suave do texto de pensamento
  useEffect(() => {
    if (!isLoading) {
      setThinkingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, [isLoading]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Finaliza a digitação imediatamente
  const finishTypingImmediately = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (typingPendingMessage) {
      setMessages((prev) =>
        prev.map((m) => (m.id === typingPendingMessage.id ? typingPendingMessage : m))
      );
      if (typingPendingMessage.navigationAction?.autoNavigate && typingPendingMessage.navigationAction?.path) {
        try {
          sessionStorage.setItem("bipesend_superadmin_germani_chat_open", "true");
        } catch {}
        if (typingPendingMessage.navigationAction.path === "back") {
          router.back();
        } else {
          router.push(typingPendingMessage.navigationAction.path);
        }
        toast.info(`Germani: ${typingPendingMessage.navigationAction.label}`);
      }
      onNewMessageDelivered?.(typingPendingMessage);
    }
    setTypingMessageId(null);
    setTypingPendingMessage(null);
  }, [typingPendingMessage, router, onNewMessageDelivered]);

  // Efeito de digitação humana progressiva (cadência natural)
  const startHumanTyping = useCallback(
    (fullMessage: GermaniChatMessage) => {
      const fullText = fullMessage.content;
      const words = fullText.split(" ");
      const totalWords = words.length;

      const wordsPerTick = totalWords > 120 ? 3 : totalWords > 50 ? 2 : 1;
      const tickIntervalMs = totalWords > 120 ? 20 : 28;

      let currentWordIndex = 0;
      setTypingMessageId(fullMessage.id);
      setTypingPendingMessage(fullMessage);

      // Inicia com primeira palavra
      setMessages((prev) => [
        ...prev,
        {
          ...fullMessage,
          content: words.slice(0, 1).join(" "),
          actionProposal: undefined,
          navigationAction: undefined,
        },
      ]);

      typingTimerRef.current = setInterval(() => {
        currentWordIndex += wordsPerTick;

        if (currentWordIndex >= totalWords) {
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setMessages((prev) =>
            prev.map((m) => (m.id === fullMessage.id ? fullMessage : m))
          );
          setTypingMessageId(null);
          setTypingPendingMessage(null);

          // Navegação em tempo real sem fechar o chat
          if (fullMessage.navigationAction?.autoNavigate && fullMessage.navigationAction?.path) {
            try {
              sessionStorage.setItem("bipesend_superadmin_germani_chat_open", "true");
            } catch {}
            if (fullMessage.navigationAction.path === "back") {
              router.back();
            } else {
              router.push(fullMessage.navigationAction.path);
            }
            router.refresh();
            try {
              window.dispatchEvent(new CustomEvent("bipesend:realtime-update", { detail: fullMessage }));
            } catch {}
            toast.info(`Germani: ${fullMessage.navigationAction.label}`);
          } else if (fullMessage.actionProposal?.status === "executed") {
            router.refresh();
            try {
              window.dispatchEvent(new CustomEvent("bipesend:realtime-update", { detail: fullMessage }));
            } catch {}
          }
          onNewMessageDelivered?.(fullMessage);
        } else {
          const partialText = words.slice(0, currentWordIndex).join(" ");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === fullMessage.id ? { ...m, content: partialText } : m
            )
          );
          scrollToBottom();
        }
      }, tickIntervalMs);
    },
    [router, scrollToBottom, onNewMessageDelivered]
  );

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if ((!text && pendingAttachments.length === 0) || isLoading) return;

    if (typingMessageId) {
      finishTypingImmediately();
    }

    const messageText = text || (pendingAttachments.length > 0
      ? `[${pendingAttachments.map(a => a.name).join(", ")}] — Analise ${pendingAttachments.length > 1 ? "estes arquivos" : "este arquivo"} para mim.`
      : "");

    const currentAttachments = [...pendingAttachments];

    const userMessage: GermaniChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      attachments: currentAttachments.length > 0 ? currentAttachments.map(a => ({ ...a, base64Data: undefined })) : undefined,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage("");
    setPendingAttachments([]);
    setIsLoading(true);

    const callStartTime = Date.now();

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await sendGermaniChatMessageAction(
        historyPayload,
        undefined,
        currentAttachments.length > 0 ? currentAttachments : undefined
      );

      // Pausa natural de reflexão ("pensa para responder")
      const elapsed = Date.now() - callStartTime;
      const minThinkingTime = 750;
      if (elapsed < minThinkingTime) {
        await new Promise((resolve) => setTimeout(resolve, minThinkingTime - elapsed));
      }

      setIsLoading(false);

      if (res.success && res.message) {
        if (res.message.guardrailTriggered) {
          toast.warning(`Salvaguarda de segurança ativada: ${res.message.guardrailTriggered}`);
        }
        startHumanTyping(res.message);
      } else {
        toast.error(res.error || "Erro ao consultar a Germani.");
      }
    } catch {
      setIsLoading(false);
      toast.error("Falha de conexão com o serviço de IA.");
    }
  };

  const handleApproveAction = async (messageId: string, proposal: GermaniActionProposal) => {
    try {
      const res = await executeGermaniActionProposalAction(proposal.id, proposal.parameters);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.actionProposal
              ? {
                  ...m,
                  actionProposal: {
                    ...m.actionProposal,
                    status: "approved",
                    executedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                  },
                }
              : m
          )
        );
        toast.success(res.message || "Ação aprovada e executada!");
      } else {
        toast.error(res.error || "Não foi possível executar a ação.");
      }
    } catch {
      toast.error("Falha ao comunicar com o servidor.");
    }
  };

  const handleRejectAction = (messageId: string, proposal: GermaniActionProposal) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, status: "rejected" } }
          : m
      )
    );
    toast.info(`Ação "${proposal.title}" cancelada.`);
  };

  const handleClearChat = () => {
    if (messages.length <= 1) return;
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingMessageId(null);
    setTypingPendingMessage(null);

    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
      clearGermaniChatHistoryAction().catch(() => {});
    } catch {}
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: "assistant",
        content:
          config.greetingMessage ||
          "Oi Daniel! O que vamos fazer hoje no painel? Só me dizer que eu abro as telas ou ajudo no que precisar.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.info("Histórico de conversa reiniciado.");
  };

  // ── HANDLERS DE UPLOAD DE ARQUIVO ──
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Limite de 5 arquivos por mensagem
    if (pendingAttachments.length + fileArray.length > 5) {
      toast.warning("Máximo de 5 arquivos por mensagem.");
      return;
    }

    setIsUploading(true);
    const newAttachments: GermaniAttachment[] = [];

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadGermaniAttachmentAction(formData);
        if (res.success && res.attachment) {
          newAttachments.push(res.attachment);
        } else {
          toast.error(res.error || `Erro ao processar ${file.name}`);
        }
      } catch {
        toast.error(`Falha ao enviar ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
    }
    setIsUploading(false);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getAttachmentIcon = (type: GermaniAttachment["type"]) => {
    switch (type) {
      case "image": return <ImageIcon className="w-3.5 h-3.5" />;
      case "audio": return <Mic className="w-3.5 h-3.5" />;
      case "video": return <Film className="w-3.5 h-3.5" />;
      case "document": return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── PUSH-TO-TALK HANDLERS ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingDuration(0);

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 500) {
          toast.warning("Gravação muito curta. Segure o botão por mais tempo.");
          setIsRecording(false);
          return;
        }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );

          const res = await transcribeVoiceDictationAction(base64, mimeType.split(";")[0]);
          if (res.success && res.transcript) {
            setInputMessage((prev) => {
              const separator = prev.trim() ? " " : "";
              return prev + separator + res.transcript;
            });
            toast.success("Voz transcrita!", { duration: 2000 });
          } else {
            toast.error(res.error || "Não foi possível transcrever.");
          }
        } catch {
          toast.error("Erro ao processar a gravação.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250); // Coleta chunks a cada 250ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Timer visual de duração
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Auto-stop após 60 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 60000);
    } catch (err) {
      console.error("[PTT] Microphone access error:", err);
      toast.error("Permissão de microfone negada. Libere o acesso nas configurações do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── AUDIO QUALITY ANALYSIS HANDLER ──
  const handleAnalyzeAudioQuality = async (file: File) => {
    setIsAnalyzingAudio(true);
    setAudioAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await analyzeAudioQualityAction(formData);
      if (res.success && res.analysis) {
        setAudioAnalysis(res.analysis);
      } else {
        toast.error(res.error || "Erro na análise do áudio.");
      }
    } catch {
      toast.error("Falha ao analisar o áudio.");
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  // ── SÍNTESE DE VOZ (TTS PLAYBACK) DA GERMANI ──
  const handlePlayMessageAudio = async (messageId: string, text: string) => {
    // Se a mesma mensagem já estiver tocando, interrompe
    if (playingAudioMessageId === messageId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioMessageId(null);
      return;
    }

    // Interrompe qualquer áudio anterior
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSynthesizingAudioId(messageId);

    // Normalização fonética da marca e limpeza de markdown
    const normalizedText = VoiceProfileService.normalizeTextForSpeech(
      text
        .replace(/[*_#`~[\]]/g, "") // Limpa marcadores de markdown
        .replace(/https?:\/\/\S+/g, "") // Remove URLs para pronúncia limpa
        .slice(0, 1000) // Limite de 1000 caracteres para áudio fluido
    );

    try {
      // 1. Tenta sintetizar via servidor XTTS / Germani oficial
      const res = await synthesizeSpeechAction(normalizedText, "germani");
      setIsSynthesizingAudioId(null);

      if (res.success && res.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
        audioPlayerRef.current = audio;
        setPlayingAudioMessageId(messageId);

        audio.onended = () => {
          setPlayingAudioMessageId(null);
          audioPlayerRef.current = null;
        };

        audio.onerror = () => {
          setPlayingAudioMessageId(null);
          audioPlayerRef.current = null;
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback gracioso
    }

    // 2. Fallback resiliente: Web Speech API do navegador com voz feminina pt-BR
    setIsSynthesizingAudioId(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(normalizedText);
      utterance.lang = "pt-BR";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Busca voz brasileira natural
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(
        (v) => (v.lang === "pt-BR" || v.lang === "pt_BR") && /luciana|francisca|maria|fem/i.test(v.name)
      ) || voices.find((v) => v.lang === "pt-BR" || v.lang === "pt_BR");

      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => setPlayingAudioMessageId(null);
      utterance.onerror = () => setPlayingAudioMessageId(null);

      setPlayingAudioMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Síntese de voz não suportada neste navegador.");
    }
  };

  // ── EXPORTAÇÃO EXECUTIVA EM PDF OFICIAL ──
  const handleExportExecutivePdf = () => {
    toast.info("Gerando relatório executivo diagramado em PDF...");
    PdfExportService.exportExecutiveReport({
      title: "Relatório Executivo de Inteligência Estratégica",
      messages,
      metrics: {
        mrrFormatted: "R$ 48.950,00",
        activeTenants: 142,
        platformHealth: "99.98%",
        p99LatencyMs: 240,
      },
    });
  };

  // ── AUDITORIA FINANCEIRA DE PLANILHAS (CSV/EXTRATOS) ──
  const handleFinancialFileUpload = async (file: File) => {
    setIsAuditingFinancial(true);
    setFinancialReport(null);
    toast.info(`Iniciando auditoria higienizada de ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await auditFinancialFileAction(formData);

      if (res.success && res.report) {
        setFinancialReport(res.report);
        toast.success(`Auditoria concluída! ${res.report.totalRecords} transações analisadas.`);

        // Injeta automaticamente no chat a mensagem da Germani apresentando a auditoria
        const auditMessage: GermaniChatMessage = {
          id: `audit-${Date.now()}`,
          role: "assistant",
          content: `📊 **Auditoria Financeira Concluída (${file.name})**\n\nAnalisei as ${res.report.totalRecords} transações da planilha com higienização profunda anti-injection.\n\n• **MRR Projetado:** R$ ${res.report.projectedMrrBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n• **Taxa de Inadimplência:** ${res.report.delinquencyRatePercent}% (R$ ${res.report.overdueVolumeBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})\n• **Taxa de Cancelamento (Churn):** ${res.report.churnRatePercent}%\n• **Volume Liquidado:** R$ ${res.report.settledVolumeBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n🛡️ **Diretriz de Retenção Aplicada:** Nenhuma transferência forçada para atendente. O card interativo abaixo traz o plano tático de desarmamento de objeções e recuperação amigável.`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, auditMessage]);
      } else {
        toast.error(res.error || "Erro ao processar auditoria da planilha.");
      }
    } catch {
      toast.error("Falha ao comunicar com o auditor financeiro.");
    } finally {
      setIsAuditingFinancial(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-2xl border shadow-xs overflow-hidden font-sans relative transition-colors ${
        isDragOver ? "border-blue-400 bg-blue-50/30" : "border-slate-200/80"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag-and-Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-50/80 backdrop-blur-xs border-2 border-dashed border-blue-400 rounded-2xl pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Paperclip className="w-8 h-8 animate-bounce" />
            <span className="text-sm font-semibold">Solte o arquivo aqui</span>
            <span className="text-xs text-blue-500">Imagens, áudios, documentos (até 20 MB)</span>
          </div>
        </div>
      )}

      {/* ── BARRA SUPERIOR DO CHAT (Opcional) ── */}
      {!hideHeader && (
        <div className="bg-white border-b border-slate-100 p-3.5 sm:p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                <img
                  src="/assets/brand/germani-avatar.jpg"
                  alt="Germani"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold text-slate-800 font-inter leading-tight">
                  {config.name}
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[9.5px] font-medium px-1.5 py-0.2 rounded-full border border-emerald-200/70">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Sua Assessora & Amiga Pessoal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {/* Botão de Exportação Executiva em PDF Oficial */}
            <button
              type="button"
              onClick={handleExportExecutivePdf}
              className="flex items-center gap-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-200 transition-all font-semibold text-[11px] shadow-2xs cursor-pointer"
              title="Gerar e imprimir relatório executivo diagramado em PDF oficial"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>

            <Link
              href="/germani"
              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors font-medium text-[11px]"
              title="Abrir página dedicada para gerenciar habilidades e parâmetros"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurações</span>
            </Link>

            <button
              type="button"
              onClick={handleClearChat}
              className="flex items-center gap-1 text-slate-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-xl transition-colors font-medium text-[11px]"
              title="Reiniciar histórico de conversa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      )}

      {/* ── ÁREA DE MENSAGENS NO ESTILO INSTAGRAM DIRECT ── */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 custom-brand-scrollbar bg-[#FAFAFC]"
      >
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          const isCurrentlyTyping = typingMessageId === msg.id;

          if (isAssistant) {
            // MENSAGEM DA GERMANI (Alinhada à Esquerda com Avatar)
            return (
              <div key={msg.id} className="flex items-end gap-2 justify-start max-w-[88%] sm:max-w-[84%]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs flex-shrink-0 mb-1">
                  <img
                    src="/assets/brand/germani-avatar.jpg"
                    alt="Germani"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-col items-start min-w-0">
                  <div
                    onClick={() => {
                      if (isCurrentlyTyping) finishTypingImmediately();
                    }}
                    className={`rounded-[22px] rounded-bl-[4px] px-4 py-2.5 text-[13px] sm:text-[13.5px] leading-relaxed shadow-2xs transition-all ${
                      msg.guardrailTriggered
                        ? "bg-amber-50/95 border border-amber-200 text-slate-800"
                        : "bg-[#F2F4F7] text-slate-800"
                    }`}
                  >
                    {/* Texto com Cursor Interativo */}
                    <div className="space-y-1.5 whitespace-pre-wrap break-words font-normal">
                      {msg.content}
                      {isCurrentlyTyping && (
                        <span
                          className="inline-block w-1.5 h-3.5 ml-1 bg-blue-600 rounded-xs animate-pulse align-middle"
                          title="Digitando..."
                        />
                      )}
                    </div>
                  </div>

                  {/* Linha Inferior com Horário e Botão de Ouvir Voz da Germani */}
                  <div className="flex items-center gap-2 mt-1 px-1.5">
                    <span className="text-[9.5px] text-slate-400 font-normal">
                      {msg.timestamp}
                    </span>

                    {/* Botão de Ouvir Áudio com Voz da Germani */}
                    <button
                      type="button"
                      onClick={() => handlePlayMessageAudio(msg.id, msg.content)}
                      disabled={isSynthesizingAudioId === msg.id}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        playingAudioMessageId === msg.id
                          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                          : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100"
                      }`}
                      title={
                        playingAudioMessageId === msg.id
                          ? "Parar reprodução de voz"
                          : "Ouvir esta resposta com a voz da Germani"
                      }
                    >
                      {isSynthesizingAudioId === msg.id ? (
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      ) : playingAudioMessageId === msg.id ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                          <span>Parar voz</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>Ouvir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // MENSAGEM DO USUÁRIO (DANIEL) — Alinhada à Direita com Avatar Estilo Instagram Direct
          return (
            <div key={msg.id} className="flex items-end gap-2 justify-end max-w-[88%] sm:max-w-[84%] ml-auto">
              <div className="flex flex-col items-end min-w-0">
                {/* Attachment previews acima do balão de texto */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5 justify-end">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 bg-blue-700/40 backdrop-blur-xs rounded-xl px-2.5 py-1.5 text-white/90 text-[11px] max-w-[200px] shadow-xs"
                        title={`${att.name} (${formatFileSize(att.sizeBytes)})`}
                      >
                        {getAttachmentIcon(att.type)}
                        <span className="truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gradient-to-r from-[#007BFF] to-[#1E60F8] text-white rounded-[22px] rounded-br-[4px] px-4 py-2.5 text-[13px] sm:text-[13.5px] leading-relaxed shadow-xs">
                  <div className="space-y-1.5 whitespace-pre-wrap break-words font-normal">
                    {msg.content}
                  </div>
                </div>
                <span className="text-[9.5px] text-slate-400 mt-1 px-1.5 font-normal">
                  {msg.timestamp}
                </span>
              </div>

              {/* Avatar do Daniel no Chat */}
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px] aspect-square rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs shadow-xs mb-1"
                title="Daniel (SuperAdmin)"
              >
                D
              </div>
            </div>
          );
        })}

        {/* ── ESTADO DE PENSAMENTO HUMANO ("pensa para responder") ── */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start max-w-[80%] animate-in fade-in duration-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs flex-shrink-0 mb-1">
              <img
                src="/assets/brand/germani-avatar.jpg"
                alt="Germani"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="bg-[#F2F4F7] rounded-[22px] rounded-bl-[4px] px-4 py-2.5 shadow-2xs flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.18s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.36s]" />
              </div>
              <span className="font-medium text-slate-600 transition-all duration-300">
                {THINKING_MESSAGES[thinkingIndex]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── BARRA INFERIOR DE DIGITAÇÃO ESTILO DIRECT ── */}
      <div className="bg-white border-t border-slate-200/80">
        {/* Resultado da Análise de Qualidade Acústica */}
        {audioAnalysis && (
          <div className="px-3 pt-3 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    audioAnalysis.clonabilityVerdict === "excelente" ? "bg-emerald-500" :
                    audioAnalysis.clonabilityVerdict === "bom" ? "bg-blue-500" :
                    audioAnalysis.clonabilityVerdict === "aceitavel" ? "bg-amber-500" : "bg-red-500"
                  }`}>
                    {audioAnalysis.clonabilityScore}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-800 block leading-tight">
                      Análise de Qualidade Acústica
                    </span>
                    <span className={`text-[10px] font-medium ${
                      audioAnalysis.clonabilityVerdict === "excelente" ? "text-emerald-600" :
                      audioAnalysis.clonabilityVerdict === "bom" ? "text-blue-600" :
                      audioAnalysis.clonabilityVerdict === "aceitavel" ? "text-amber-600" : "text-red-600"
                    }`}>
                      {audioAnalysis.clonabilityVerdict === "excelente" ? "✅ Excelente para Clonagem" :
                       audioAnalysis.clonabilityVerdict === "bom" ? "👍 Bom para Clonagem" :
                       audioAnalysis.clonabilityVerdict === "aceitavel" ? "⚠️ Aceitável (com ressalvas)" : "❌ Inadequado para Clonagem"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioAnalysis(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Fechar análise"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Freq. Fund.</span>
                  <span className="text-xs font-bold text-slate-800">{audioAnalysis.fundamentalFrequencyHz} Hz</span>
                  <span className="text-[9px] text-slate-400 capitalize block">{audioAnalysis.frequencyRange}</span>
                </div>
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Clareza</span>
                  <span className="text-xs font-bold text-slate-800">{audioAnalysis.clarityScore}/100</span>
                </div>
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Timbre</span>
                  <span className="text-xs font-bold text-slate-800">{audioAnalysis.timbreScore}/100</span>
                </div>
                <div className="bg-white rounded-lg px-2 py-1.5 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-500 block">SNR</span>
                  <span className="text-xs font-bold text-slate-800">{audioAnalysis.signalToNoiseRatio} dB</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-3">
                <span>⏱️ {audioAnalysis.durationSeconds}s</span>
                <span>🎧 {(audioAnalysis.sampleRateHz / 1000).toFixed(1)} kHz</span>
              </div>

              {audioAnalysis.recommendations.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {audioAnalysis.recommendations.map((rec, i) => (
                    <p key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                      <span className="flex-shrink-0">💡</span>
                      <span>{rec}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultado da Auditoria Financeira de Planilhas (CSV / Extratos) */}
        {financialReport && (
          <div className="px-3 pt-3 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    R$
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-800 block leading-tight">
                      Auditoria Financeira Higienizada ({financialReport.fileName})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      🛡️ Proteção Anti-Formula Injection Ativa • {financialReport.totalRecords} Transações Analisadas
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFinancialReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Fechar auditoria"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 block">MRR Projetado</span>
                  <span className="text-xs font-bold text-slate-900">
                    R$ {financialReport.projectedMrrBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Inadimplência</span>
                  <span className={`text-xs font-bold ${financialReport.delinquencyRatePercent > 10 ? "text-amber-600" : "text-slate-900"}`}>
                    {financialReport.delinquencyRatePercent}%
                  </span>
                </div>
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Churn Estimado</span>
                  <span className="text-xs font-bold text-slate-900">
                    {financialReport.churnRatePercent}%
                  </span>
                </div>
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 block">Liquidado</span>
                  <span className="text-xs font-bold text-emerald-700">
                    R$ {financialReport.settledVolumeBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-2">
                {financialReport.strategicInsights.map((insight, idx) => (
                  <p key={idx} className="text-[10.5px] text-slate-700 flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{insight}</span>
                  </p>
                ))}
              </div>

              <div className="bg-white/80 border border-emerald-200/60 rounded-lg p-2 text-[10px] text-slate-700 leading-relaxed">
                <strong className="text-emerald-800 block mb-0.5">Diretriz de Retenção Amigável (Chris Voss):</strong>
                <span>{financialReport.deescalationRetentionPlan}</span>
              </div>
            </div>
          </div>
        )}

        {/* Preview de Attachments Pendentes */}
        {pendingAttachments.length > 0 && (
          <div className="px-3 pt-2.5 pb-1 flex flex-wrap gap-2">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 max-w-[180px] transition-all hover:border-red-300 hover:bg-red-50/50"
              >
                {att.type === "image" && att.base64Data ? (
                  <img
                    src={`data:${att.mimeType};base64,${att.base64Data}`}
                    alt={att.name}
                    className="w-7 h-7 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="flex-shrink-0 text-slate-500">{getAttachmentIcon(att.type)}</span>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{att.name}</span>
                  <span className="text-[9px] text-slate-400">{formatFileSize(att.sizeBytes)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                  title="Remover anexo"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Indicador de upload em andamento */}
        {isUploading && (
          <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-blue-600">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span>Processando arquivo...</span>
          </div>
        )}

        {/* Indicador de transcrição */}
        {isTranscribing && (
          <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-violet-600">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
            <span>Transcrevendo áudio com Gemini...</span>
          </div>
        )}

        {/* Indicador de análise acústica */}
        {isAnalyzingAudio && (
          <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-amber-600">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span>Analisando qualidade acústica...</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-3 pt-1.5"
        >
          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,audio/*,video/mp4,video/webm,.pdf,.txt,.csv,.json,.docx,.xlsx"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
                e.target.value = "";
              }
            }}
          />

          {/* Input de áudio para análise acústica (oculto) */}
          <input
            ref={audioAnalysisInputRef}
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleAnalyzeAudioQuality(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />

          {/* Input de planilha para auditoria financeira (oculto) */}
          <input
            ref={financialFileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.txt"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFinancialFileUpload(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />

          {/* Botão de Anexo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading || isRecording}
            className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Anexar arquivo (imagem, áudio, documento)"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          {/* Botão de Auditoria Financeira de Planilhas */}
          <button
            type="button"
            onClick={() => financialFileInputRef.current?.click()}
            disabled={isLoading || isAuditingFinancial}
            className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Auditar Planilha / Extrato Financeiro (MRR, Churn, Inadimplência)"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Botão de Análise Acústica */}
          <button
            type="button"
            onClick={() => audioAnalysisInputRef.current?.click()}
            disabled={isLoading || isRecording || isAnalyzingAudio}
            className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Análise de Qualidade Acústica — Avaliar áudio para clonagem XTTS"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
            </svg>
          </button>

          {/* Campo de texto */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isRecording ? `🔴 Gravando... ${formatRecordingTime(recordingDuration)}` :
              isTranscribing ? "Transcrevendo..." :
              pendingAttachments.length > 0 ? "Adicione uma mensagem ou envie os arquivos..." :
              "Mensagem para Germani..."
            }
            disabled={isLoading || isRecording}
            className={`flex-1 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
              isRecording ? "!border-red-400 !bg-red-50/50 !ring-2 !ring-red-500/20 animate-pulse" : ""
            }`}
          />

          {/* Botão Push-to-Talk (Microfone) */}
          <button
            type="button"
            onMouseDown={() => !isRecording && startRecording()}
            onMouseUp={() => isRecording && stopRecording()}
            onMouseLeave={() => isRecording && stopRecording()}
            onTouchStart={(e) => { e.preventDefault(); !isRecording && startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); isRecording && stopRecording(); }}
            disabled={isLoading || isTranscribing}
            className={`w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full flex items-center justify-center transition-all flex-shrink-0 select-none ${
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110 animate-pulse"
                : isTranscribing
                ? "bg-violet-100 text-violet-500 cursor-wait"
                : "text-slate-500 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
            title={isRecording ? "Solte para parar a gravação" : "Segurar para ditar por voz (Push-to-Talk)"}
            aria-label="Push-to-Talk"
          >
            {isTranscribing ? (
              <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            ) : (
              <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
            )}
          </button>

          {/* Botão Enviar */}
          <button
            type="submit"
            disabled={(!inputMessage.trim() && pendingAttachments.length === 0) || isLoading || isRecording}
            className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full bg-[#007BFF] hover:bg-blue-600 text-white flex items-center justify-center shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
