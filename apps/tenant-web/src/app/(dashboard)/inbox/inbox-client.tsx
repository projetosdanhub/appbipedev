"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageCircle, 
  Globe, 
  Check, 
  CheckCheck, 
  Paperclip, 
  Mic, 
  Send, 
  Phone, 
  Video, 
  Info, 
  Tag, 
  Clock, 
  User, 
  ChevronDown, 
  Reply, 
  Plus, 
  X, 
  Maximize2, 
  FileText, 
  Image as ImageIcon, 
  StopCircle, 
  Bot, 
  Play, 
  Pause, 
  UserCheck, 
  Sparkles 
} from "lucide-react";
import { 
  Button, 
  Input, 
  Popover, 
  PopoverContent, 
  PopoverTrigger, 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger, 
  Badge, 
  Card 
} from "@bipesend/ui";
import { toast } from "sonner";
import { 
  getMessagesAction, 
  addInternalNoteAction, 
  updateConversationAction, 
  getConversationsByContactAction, 
  sendOutboundMessageAction, 
  uploadMediaAction 
} from "@/features/inbox/actions/inbox.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtime } from "@/lib/useRealtime";
import { useRouter } from "next/navigation";
import { CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";
import { createDealFromContactAction } from "../../../features/crm/actions/deal.actions";
import { calculateTypingDelayMs, calculateAudioRecordingDelayMs } from "@/features/ai/utils/humanization";

// Avatar Components adaptados ao tema claro canônico
const Avatar = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarFallback = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full ${className}`}>{children}</div>
);
const AvatarImage = ({ src, alt, className = "" }: { src: string; alt?: string; className?: string }) => (
  <img src={src} alt={alt || "Avatar"} className={`aspect-square h-full w-full object-cover ${className}`} />
);

// Player de Mensagem de Áudio refinado para o tema claro único
function AudioMessagePlayer({
  mediaUrl,
  durationText = "0:14",
  isAi = false,
  agentName = "Sofia",
  isAgent = false
}: {
  mediaUrl?: string;
  durationText?: string;
  isAi?: boolean;
  agentName?: string;
  isAgent?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current && mediaUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speed;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 5000 / speed);
          });
      }
    } else {
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        setTimeout(() => setIsPlaying(false), 4500 / speed);
      }
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-[230px] max-w-[290px]">
      {isAi && (
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold mb-0.5 ${
          isAgent ? "text-white/95" : "text-amber-800"
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>🎙️ Áudio Gerado por IA ({agentName})</span>
        </div>
      )}
      <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
        isAgent 
          ? "bg-white/20 border border-white/25" 
          : "bg-[#F1F5F9] border border-[#E2E8F0]"
      }`}>
        <button
          type="button"
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 ${
            isAgent 
              ? "bg-white text-[#007BFF] hover:bg-white/95" 
              : "bg-[#007BFF] text-white hover:bg-[#0069D9]"
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Waveform Bars */}
        <div className="flex-1 flex items-center gap-0.5 h-6">
          {[35, 60, 90, 45, 100, 70, 40, 80, 55, 95, 30, 85, 65, 45, 75, 90, 40, 60].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full transition-all duration-150"
              style={{
                height: `${h}%`,
                background: isPlaying 
                  ? (isAgent ? "#ffffff" : "#007BFF") 
                  : (isAgent ? "rgba(255,255,255,0.45)" : "#CBD5E1")
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[11px] font-mono ${isAgent ? "text-white/95" : "text-[#64748B]"}`}>
            {durationText}
          </span>
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
              isAgent 
                ? "bg-white/20 hover:bg-white/30 text-white" 
                : "bg-slate-200/80 hover:bg-slate-300 text-[#0F172A]"
            }`}
          >
            {speed}x
          </button>
        </div>
      </div>
      {mediaUrl && (
        <audio
          ref={audioRef}
          src={mediaUrl}
          className="hidden"
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}

const CHANNELS = [
  { id: "all", name: "Todas as Caixas", icon: <MessageCircle className="w-4 h-4 text-[#007BFF]" /> },
  { id: "whatsapp", name: "WhatsApp Principal", icon: <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /> },
  { id: "instagram", name: "Instagram @bipesend", icon: <Globe className="w-4 h-4 text-pink-500" /> },
];

interface InboxClientProps {
  tenantId: string;
  membershipId: string;
  initialConversations: any[];
  isFullscreen?: boolean;
  initialChatId?: string;
  memberships?: { id: string; userId: string; user: { name: string | null; email: string; } }[];
  sessionToken?: string;
  pipelines?: CrmPipeline[];
  stagesMap?: Record<string, CrmPipelineStage[]>;
}

export default function InboxClient({ 
  tenantId, 
  membershipId, 
  initialConversations, 
  isFullscreen = false,
  initialChatId,
  memberships = [],
  sessionToken,
  pipelines = [],
  stagesMap = {}
}: InboxClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>(initialConversations);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const fetchConversations = async () => {
    router.refresh();
  };

  // Escutar eventos realtime
  useRealtime({
    tenantId,
    token: sessionToken,
    onEvent: (event, payload) => {
      if (event === "inbox.changed" || event === "connected") {
        fetchConversations();
        if (payload && payload.conversationId === activeChat?.id || event === "connected") {
          if (activeChat?.id) {
            getMessagesAction(tenantId, activeChat.id).then((res) => {
              if (res.success) setMessages(res.data);
            });
          }
        }
      }
    }
  });

  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [activeChat, setActiveChat] = useState<any>(initialConversations.find(c => c.id === initialChatId) || initialConversations[0] || null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [internalNoteMode, setInternalNoteMode] = useState(false);
  
  // Controle em Tempo Real de Agentes IA por Conversa
  const [aiConversationStates, setAiConversationStates] = useState<Record<string, "active" | "paused" | "stopped">>({});

  const activeAiState = activeChat?.id ? (aiConversationStates[activeChat.id] || "active") : "active";

  const handleSetAiState = (newState: "active" | "paused" | "stopped") => {
    if (!activeChat?.id) return;
    setAiConversationStates(prev => ({
      ...prev,
      [activeChat.id]: newState
    }));

    if (newState === "paused") {
      toast.warning("IA Pausada nesta conversa. O atendente humano assumiu o controle.");
    } else if (newState === "active") {
      toast.success("IA Retomada com sucesso. O agente virtual continuará o atendimento.");
    } else if (newState === "stopped") {
      toast.error("Bot Parado permanentemente nesta conversa.");
    }
  };
  
  // Filtro de Fila Omnichannel
  const [queueFilter, setQueueFilter] = useState<"all" | "my" | "unassigned">("all");

  // Simulação Humanizada em Tempo Real da IA
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isAiRecordingAudio, setIsAiRecordingAudio] = useState(false);

  // Assumir Atendimento da Conversa
  const handleAssumeChat = async () => {
    if (!activeChat) return;
    try {
      const res = await updateConversationAction(tenantId, activeChat.id, {
        assignedMembershipId: membershipId,
        expectedVersion: activeChat.version,
      });
      if (res.success) {
        toast.success("Você assumiu esta conversa com sucesso!");
        const updatedChat = { ...activeChat, assignedMembershipId: membershipId, version: activeChat.version + 1 };
        setActiveChat(updatedChat);
        setConversations(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao assumir atendimento.");
    }
  };

  // Simulação de Resposta Humanizada
  const handleSimulateAiResponse = (mode: "text" | "audio") => {
    if (!activeChat) return;
    if (activeAiState !== "active") {
      toast.warning("A IA está pausada ou desativada nesta conversa. Reative a IA para simular.");
      return;
    }

    if (mode === "text") {
      const sampleText = "Olá! Compreendo perfeitamente o seu ponto. Estou analisando as melhores opções para o seu caso e já retorno com uma proposta sob medida.";
      const delayMs = calculateTypingDelayMs(sampleText);
      setIsAiTyping(true);
      toast.info(`Sofia começou a digitar... (Delay humanizado: ${(delayMs / 1000).toFixed(1)}s)`);

      setTimeout(() => {
        setIsAiTyping(false);
        const newMsg = {
          id: `sim_txt_${Date.now()}`,
          tenantId,
          conversationId: activeChat.id,
          direction: "outbound",
          kind: "message",
          text: sampleText,
          state: "delivered",
          createdAt: new Date().toISOString(),
          isAi: true,
          senderName: "Sofia (Bipe AI)",
        };
        setMessages(prev => [...prev, newMsg]);
        toast.success("Mensagem de texto da IA enviada com sucesso!");
      }, delayMs);
    } else {
      const audioScript = "Olá! Tudo ótimo por aqui. Estou gravando este áudio rápido para esclarecer suas dúvidas sobre a nossa plataforma e te apresentar as melhores condições exclusivas.";
      const delayMs = calculateAudioRecordingDelayMs(audioScript);
      setIsAiRecordingAudio(true);
      toast.info(`Sofia está gravando um áudio... (Delay humanizado: ${(delayMs / 1000).toFixed(1)}s)`);

      setTimeout(() => {
        setIsAiRecordingAudio(false);
        const newMsg = {
          id: `sim_aud_${Date.now()}`,
          tenantId,
          conversationId: activeChat.id,
          direction: "outbound",
          kind: "message",
          hasMedia: true,
          mediaType: "audio/mp3",
          mediaUrl: "",
          isAiAudio: true,
          durationText: "0:18",
          state: "delivered",
          createdAt: new Date().toISOString(),
          isAi: true,
          senderName: "Sofia (Bipe AI)",
        };
        setMessages(prev => [...prev, newMsg]);
        toast.success("Mensagem de áudio da IA enviada com sucesso!");
      }, delayMs);
    }
  };

  // Media Preview State
  const [previewMedia, setPreviewMedia] = useState<{ file: File, url: string, type: 'image' | 'video' | 'audio' | 'document' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioFile);
        setPreviewMedia({ file: audioFile, url, type: 'audio' });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("Erro ao acessar microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setPreviewMedia(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    let type: 'image' | 'video' | 'audio' | 'document' = 'document';
    
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    setPreviewMedia({ file, url, type });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    if (!activeChat) return;
    if (!messageInput.trim() && !previewMedia) return;
    
    setIsSending(true);
    try {
      let mediaData = null;
      if (previewMedia) {
        const formData = new FormData();
        formData.append("file", previewMedia.file);
        const uploadRes = await uploadMediaAction(formData);
        if (!uploadRes.success) {
          toast.error(uploadRes.message);
          setIsSending(false);
          return;
        }
        mediaData = uploadRes.data;
      }

      let res;
      if (internalNoteMode && !previewMedia) {
        res = await addInternalNoteAction(tenantId, activeChat.id, { text: messageInput.trim() });
      } else {
        res = await sendOutboundMessageAction(tenantId, activeChat.id, { 
          text: messageInput.trim(),
          mediaUrl: mediaData?.url,
          mediaType: mediaData?.mimetype,
          mediaName: mediaData?.filename,
        });
      }

      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setMessageInput("");
        if (previewMedia) {
          URL.revokeObjectURL(previewMedia.url);
          setPreviewMedia(null);
        }
        if (res.data.state === "failed") {
          toast.error(res.data.errorReason || "Falha ao enviar mensagem.");
        }
      } else {
        const errorMsg = res.details && typeof res.details === 'string' ? `${res.message}: ${res.details}` : 
                         res.details && typeof res.details === 'object' ? `${res.message}: ${JSON.stringify(res.details)}` : res.message;
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async (selectedMembershipId: string) => {
    if (!activeChat) return;
    setIsTransferring(true);
    try {
      const res = await updateConversationAction(tenantId, activeChat.id, {
        assignedMembershipId: selectedMembershipId,
        expectedVersion: activeChat.version,
      });
      if (res.success) {
        toast.success("Conversa transferida com sucesso!");
        setActiveChat({ ...activeChat, assignedMembershipId: selectedMembershipId, version: activeChat.version + 1 });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Erro ao transferir conversa");
    } finally {
      setIsTransferring(false);
    }
  };

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      setIsLoadingMessages(true);
      getMessagesAction(tenantId, activeChat.id)
        .then((res) => {
          if (res.success) setMessages(res.data);
          else toast.error(res.message);
        })
        .finally(() => setIsLoadingMessages(false));
    } else {
      setMessages([]);
    }
  }, [activeChat, tenantId]);

  const contactName = activeChat?.contactId || activeChat?.subject || "Contato";

  // Live Tags State
  const [activeTags, setActiveTags] = useState([
    { id: 1, name: "Urgente", type: "global", color: "red" },
    { id: 2, name: "VIP", type: "global", color: "blue" },
    { id: 3, name: "Negociação", type: "local", color: "amber" },
  ]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const colorMap: Record<string, string> = {
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    const localTagsCount = activeTags.filter(t => t.type === "local").length;
    if (localTagsCount >= 3) {
      toast.error("Limite atingido", { description: "Você só pode ter até 3 tags locais (pessoais) por cliente." });
      return;
    }

    const newTag = {
      id: Date.now(),
      name: newTagName.trim(),
      type: "local",
      color: "slate",
    };
    
    setActiveTags([...activeTags, newTag]);
    setNewTagName("");
    setShowTagInput(false);
    toast.success("Etiqueta adicionada");
  };

  const removeTag = (id: number) => {
    setActiveTags(activeTags.filter(t => t.id !== id));
  };

  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0]?.id || "");
  const [selectedStageId, setSelectedStageId] = useState("");

  const handleCreateDeal = async () => {
    if (!activeChat || !selectedPipelineId || !selectedStageId) return;
    
    if (!activeChat.contactId) {
       toast.error("O lead ainda não foi vinculado a um contato.");
       return;
    }

    setIsCreatingDeal(true);
    try {
      const result = await createDealFromContactAction(
        tenantId, 
        selectedPipelineId, 
        selectedStageId, 
        activeChat.contactId, 
        contactName
      );
      if (result.success) {
        toast.success("Negócio criado com sucesso no CRM!");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao criar negócio");
    } finally {
      setIsCreatingDeal(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#F4F7FC] overflow-hidden text-[#0F172A] font-sans">
      
      {/* ── Coluna Esquerda: Filas e Conversas Omnichannel ── */}
      {!isFullscreen && (
      <div className="flex flex-col w-full md:w-[320px] lg:w-[350px] bg-white border-r border-[#DBE4F0] shrink-0 z-10 shadow-xs">
        
        {/* Cabeçalho do Inbox */}
        <div className="p-4 border-b border-[#DBE4F0] bg-white">
          <div className="flex items-center justify-between mb-3 gap-2">
            <button className="flex-1 flex items-center gap-2.5 px-3.5 py-2 text-[13.5px] font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#EEF4FF] hover:text-[#007BFF] border border-[#DBE4F0] hover:border-[#BFDBFE] rounded-xl transition-all shadow-xs">
              {selectedChannel.icon}
              <span className="truncate">{selectedChannel.name}</span>
              <ChevronDown className="w-4 h-4 ml-auto text-[#64748B]" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Buscar conversas..." 
                className="w-full h-[38px] pl-9 pr-4 text-[13px] bg-[#F8FAFC] border border-[#DBE4F0] focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 rounded-xl focus:outline-none focus:bg-white text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
              />
            </div>
            <button className="w-[38px] h-[38px] flex items-center justify-center bg-[#F8FAFC] border border-[#DBE4F0] hover:border-[#94A3B8] text-[#64748B] hover:text-[#0F172A] rounded-xl transition-colors shadow-xs">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Abas de Fila Omnichannel (Controle Segmentado Claro) */}
          <div className="flex gap-1 p-1 bg-[#EEF3FA] rounded-xl mt-3 border border-[#DBE4F0]/70">
            <button
              onClick={() => setQueueFilter("all")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                queueFilter === "all" 
                  ? "bg-white text-[#007BFF] shadow-xs" 
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Todas <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${queueFilter === "all" ? "bg-blue-100 text-blue-700" : "bg-[#DBE4F0] text-[#64748B]"}`}>{conversations.length}</span>
            </button>
            <button
              onClick={() => setQueueFilter("my")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                queueFilter === "my" 
                  ? "bg-white text-[#007BFF] shadow-xs" 
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Minhas <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${queueFilter === "my" ? "bg-blue-100 text-blue-700" : "bg-[#DBE4F0] text-[#64748B]"}`}>{conversations.filter(c => c.assignedMembershipId === membershipId).length}</span>
            </button>
            <button
              onClick={() => setQueueFilter("unassigned")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11.5px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                queueFilter === "unassigned" 
                  ? "bg-white text-amber-800 shadow-xs" 
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Fila Geral <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{conversations.filter(c => !c.assignedMembershipId).length}</span>
            </button>
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {conversations
            .filter(c => {
              if (queueFilter === "my") return c.assignedMembershipId === membershipId;
              if (queueFilter === "unassigned") return !c.assignedMembershipId;
              return true;
            })
            .map(chat => {
            const chatName = chat.contactId || chat.subject || chat.name || "Contato";
            const chatLastMsg = chat.subject || "...";
            const chatTime = chat.lastActivityAt ? format(new Date(chat.lastActivityAt), "HH:mm") : "";
            const chatUnread = chat.status === "open" ? 1 : 0;
            const isSelected = activeChat?.id === chat.id;

            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`flex gap-3 p-3.5 border-b border-[#E2E8F0]/70 cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-[#EFF6FF] border-l-4 border-l-[#007BFF] shadow-xs" 
                    : "hover:bg-[#F8FAFC] border-l-4 border-l-transparent bg-white"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-11 h-11 border border-[#DBE4F0] shadow-xs">
                    <AvatarFallback className="bg-gradient-to-br from-[#EEF4FF] to-[#E0E7FF] text-[#007BFF] font-bold text-[13px]">
                      {chatName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Indicador de Canal Omnichannel */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-[13.5px] font-semibold truncate pr-2 ${
                      isSelected ? "text-[#007BFF]" : "text-[#0F172A]"
                    }`}>
                      {chatName}
                    </h4>
                    <span className={`text-[11px] whitespace-nowrap ${chatUnread > 0 ? "text-[#007BFF] font-bold" : "text-[#94A3B8]"}`}>
                      {chatTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[12.5px] truncate ${chatUnread > 0 ? "text-[#0F172A] font-semibold" : "text-[#64748B]"}`}>
                      {chatLastMsg}
                    </p>
                    {chatUnread > 0 && (
                      <div className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#007BFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                        1
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ── Coluna Central: Chat Ativo & Controle de IA ── */}
      <div className="flex-1 flex flex-col bg-[#F4F7FC] min-w-0">
        
        {/* Barra Superior do Chat */}
        <div className="h-[64px] flex items-center justify-between px-5 bg-white border-b border-[#DBE4F0] shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-[#DBE4F0] shadow-xs">
              <AvatarFallback className="bg-gradient-to-br from-[#007BFF]/10 to-[#6366F1]/10 text-[#007BFF] font-bold text-[14px]">
                {contactName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight font-heading">
                {contactName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-medium text-emerald-700">Online agora</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status de Atendimento / Assumir */}
            {!activeChat?.assignedMembershipId ? (
              <button
                type="button"
                onClick={handleAssumeChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-semibold shadow-xs transition-all active:scale-95"
                title="Vincular este atendimento a você"
              >
                <UserCheck className="w-3.5 h-3.5" /> Assumir Atendimento
              </button>
            ) : activeChat.assignedMembershipId === membershipId ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11.5px] font-semibold rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Atendido por você
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[11.5px] font-semibold rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-500" /> Atribuído
              </span>
            )}

            {/* Menu Popover de Transferência */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  disabled={isTransferring}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#475569] hover:text-[#007BFF] hover:bg-[#EEF4FF] border border-[#DBE4F0] rounded-xl transition-all shadow-xs"
                >
                  <Reply className="w-3.5 h-3.5" /> Transferir
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-white border border-[#DBE4F0] shadow-md rounded-2xl flex flex-col gap-2 z-50">
                <h4 className="text-[13px] font-bold text-[#0F172A] px-2">Transferir Conversa</h4>
                <div className="flex flex-col gap-1 mt-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {memberships?.map((mem) => (
                    <button
                      key={mem.id}
                      onClick={() => handleTransfer(mem.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-left transition-colors ${
                        activeChat?.assignedMembershipId === mem.id 
                          ? "bg-[#EFF6FF] text-[#007BFF] font-semibold"
                          : "text-[#475569] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <Avatar className="w-6 h-6 border border-[#DBE4F0]">
                        <AvatarFallback className="bg-[#EEF4FF] text-[10px] text-[#007BFF] font-bold">
                          {mem.user.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="truncate">{mem.user.name}</span>
                      </div>
                      {activeChat?.assignedMembershipId === mem.id && <Check className="w-3.5 h-3.5 text-[#007BFF]" />}
                    </button>
                  ))}
                  <div className="w-full h-[1px] bg-[#E2E8F0] my-1" />
                  <button
                    onClick={() => handleTransfer("")}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remover Responsável</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <button className="p-2 text-[#64748B] hover:text-[#007BFF] hover:bg-[#EEF4FF] border border-[#DBE4F0] rounded-xl transition-all shadow-xs">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#64748B] hover:text-[#007BFF] hover:bg-[#EEF4FF] border border-[#DBE4F0] rounded-xl transition-all shadow-xs">
              <Video className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-xl border transition-all shadow-xs ${
                showRightPanel 
                  ? "bg-[#007BFF] text-white border-[#007BFF]" 
                  : "bg-white text-[#64748B] border-[#DBE4F0] hover:text-[#007BFF] hover:bg-[#EEF4FF]"
              }`}
              title="Informações do contato e CRM"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Barra de Controle de Inteligência Artificial em Tempo Real ── */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F8FAFC] border-b border-[#DBE4F0] shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs ${
              activeAiState === "active"
                ? "bg-gradient-to-r from-[#007BFF] to-[#6366F1]"
                : activeAiState === "paused"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}>
              <Bot className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#0F172A]">
                Agente IA:
              </span>
              {activeAiState === "active" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sofia (IA Ativa no Omnichannel)
                </span>
              ) : activeAiState === "paused" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  IA Pausada (Atendente Humano)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Bot Desativado (100% Manual)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gatilhos de Simulação Humanizada */}
            {activeAiState === "active" && (
              <div className="hidden lg:flex items-center gap-1.5 mr-2 pr-2 border-r border-[#DBE4F0]">
                <button
                  type="button"
                  disabled={isAiTyping || isAiRecordingAudio}
                  onClick={() => handleSimulateAiResponse("text")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#007BFF] border border-blue-200 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                  title="Simular resposta de texto com delay de digitação proporcional"
                >
                  <Bot className="w-3.5 h-3.5" /> Simular Texto IA
                </button>
                <button
                  type="button"
                  disabled={isAiTyping || isAiRecordingAudio}
                  onClick={() => handleSimulateAiResponse("audio")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                  title="Simular resposta por áudio humanizado com delay de gravação"
                >
                  <Mic className="w-3.5 h-3.5" /> Simular Áudio IA
                </button>
              </div>
            )}

            {/* Ações de Estado da IA */}
            {activeAiState === "active" && (
              <>
                <button
                  type="button"
                  onClick={() => handleSetAiState("paused")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-xs"
                >
                  <Pause className="w-3.5 h-3.5" /> Pausar IA
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAiState("stopped")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
                >
                  <StopCircle className="w-3.5 h-3.5" /> Parar Bot
                </button>
              </>
            )}

            {activeAiState === "paused" && (
              <>
                <button
                  type="button"
                  onClick={() => handleSetAiState("active")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" /> Retomar IA
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAiState("stopped")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
                >
                  <StopCircle className="w-3.5 h-3.5" /> Parar Bot
                </button>
              </>
            )}

            {activeAiState === "stopped" && (
              <button
                type="button"
                onClick={() => handleSetAiState("active")}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-[#007BFF] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" /> Reativar IA
              </button>
            )}
          </div>
        </div>

        {/* Feed de Mensagens do Chat */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F4F7FC] relative">
          <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-center mb-2">
              <span className="px-3 py-1 bg-slate-200/70 border border-slate-300/40 rounded-full text-[11px] font-semibold text-slate-600 shadow-xs">
                Hoje
              </span>
            </div>
            
            {messages.length === 0 && !isLoadingMessages && (
              <div className="flex flex-col items-center justify-center h-48 text-sm text-[#64748B]">
                <Bot className="w-8 h-8 text-[#94A3B8] mb-2" />
                <span>Nenhuma mensagem nesta conversa ainda.</span>
              </div>
            )}
            
            {messages.map(msg => {
              const isAgent = msg.direction === "outbound" || msg.kind === "internal_note";
              return (
                <div key={msg.id} className={`flex flex-col max-w-[78%] ${isAgent ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  <div 
                    className={`p-3.5 rounded-2xl shadow-xs text-[14px] leading-relaxed relative flex flex-col gap-2 ${
                      isAgent 
                        ? msg.kind === "internal_note" 
                          ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-tr-sm" 
                          : "bg-gradient-to-r from-[#007BFF] to-[#0062CC] text-white rounded-tr-sm" 
                        : "bg-white text-[#0F172A] border border-[#DBE4F0] rounded-tl-sm"
                    }`}
                  >
                    {msg.kind === "internal_note" && (
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-0.5">
                        <span>🔒 Nota Interna (visível apenas para a equipe)</span>
                      </div>
                    )}

                    {msg.hasMedia && (msg.mediaUrl || msg.isAiAudio || msg.mediaType?.startsWith('audio/')) && (
                      <div className="max-w-full overflow-hidden rounded-xl">
                        {msg.mediaType?.startsWith('image/') ? (
                          <img src={msg.mediaUrl} alt="Imagem enviada" className="max-w-[260px] max-h-[320px] object-cover rounded-xl border border-black/5" />
                        ) : msg.mediaType?.startsWith('audio/') || msg.isAiAudio ? (
                          <AudioMessagePlayer 
                            mediaUrl={msg.mediaUrl} 
                            durationText={msg.durationText || "0:14"}
                            isAi={msg.isAiAudio || msg.isAi || msg.senderName?.includes("Sofia") || msg.senderName?.includes("IA")}
                            agentName="Sofia"
                            isAgent={isAgent}
                          />
                        ) : msg.mediaType?.startsWith('video/') ? (
                          <video src={msg.mediaUrl} controls className="max-w-[260px] max-h-[320px] rounded-xl border border-black/5" />
                        ) : (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
                            <Paperclip className="w-4 h-4" />
                            <span className="truncate max-w-[200px] font-medium">{msg.mediaName || 'Anexo para download'}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && <span>{msg.text}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-[#64748B] px-1 font-medium">
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                    {isAgent && msg.kind !== "internal_note" && (
                      msg.state === "failed" ? (
                        <span className="text-red-600 font-semibold ml-1">Falhou</span>
                      ) : msg.state === "read" ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#007BFF]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-[#94A3B8]" />
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Indicador Visual de Digitação da IA (Humanização) ── */}
            {isAiTyping && (
              <div className="flex items-center gap-2 mr-auto bg-white border border-[#DBE4F0] px-3.5 py-2.5 rounded-2xl rounded-tl-sm shadow-xs text-xs text-[#0F172A] animate-in fade-in">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#007BFF]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[#007BFF]">Sofia</span>
                <span className="text-[#64748B]">está digitando</span>
                <span className="flex gap-1 ml-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}

            {/* ── Indicador Visual de Gravação de Áudio da IA (Humanização) ── */}
            {isAiRecordingAudio && (
              <div className="flex items-center gap-2 mr-auto bg-purple-50 border border-purple-200 px-3.5 py-2.5 rounded-2xl rounded-tl-sm shadow-xs text-xs text-purple-800 animate-in fade-in">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-700">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="font-bold text-purple-700">Sofia</span>
                <span className="text-purple-600">está gravando áudio...</span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-2.5 bg-purple-600 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                  <span className="w-1 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Digitação e Envio (Bottom Dock) */}
        <div className="p-4 bg-white border-t border-[#DBE4F0] shrink-0">
          
          {/* Prévia de Mídia Anexada */}
          {previewMedia && (
            <div className="mb-3 p-3 bg-[#F8FAFC] rounded-2xl border border-[#DBE4F0] relative">
              <button 
                onClick={() => {
                  URL.revokeObjectURL(previewMedia.url);
                  setPreviewMedia(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white text-[#0F172A] border border-[#DBE4F0] rounded-full hover:bg-slate-100 transition-colors z-10 shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex justify-center items-center h-32 overflow-hidden rounded-xl bg-slate-100">
                {previewMedia.type === 'image' && (
                  <img src={previewMedia.url} alt="Preview" className="h-full object-contain" />
                )}
                {previewMedia.type === 'video' && (
                  <video src={previewMedia.url} controls className="h-full" />
                )}
                {previewMedia.type === 'audio' && (
                  <audio src={previewMedia.url} controls className="w-full px-4" />
                )}
                {previewMedia.type === 'document' && (
                  <div className="flex flex-col items-center gap-2 text-[#64748B]">
                    <FileText className="w-8 h-8 text-[#007BFF]" />
                    <span className="text-sm font-medium truncate max-w-[220px]">{previewMedia.file.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interface de Gravação de Áudio ao Vivo */}
          {isRecording && (
            <div className="mb-3 p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-rose-700 font-mono text-sm font-bold">
                  {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-rose-700/90">Gravando áudio...</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={cancelRecording} className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={stopRecording} className="p-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors shadow-xs">
                  <StopCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Container de Input */}
          <div className={`flex items-end gap-2 p-2 rounded-2xl border transition-all shadow-xs ${
            internalNoteMode 
              ? "bg-[#FFFDF5] border-amber-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200" 
              : "bg-[#F8FAFC] border-[#DBE4F0] focus-within:border-[#007BFF] focus-within:ring-2 focus-within:ring-[#007BFF]/15"
          }`}>
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#94A3B8] hover:text-[#007BFF] transition-colors rounded-xl"
              title="Anexar arquivo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea 
              placeholder={internalNoteMode ? "Digite uma nota interna (não enviada ao cliente)..." : "Digite sua mensagem..."} 
              className={`flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none resize-none focus:outline-none py-2 text-[14px] custom-scrollbar ${
                internalNoteMode 
                  ? "text-amber-900 placeholder:text-amber-700/60" 
                  : "text-[#0F172A] placeholder:text-[#94A3B8]"
              }`}
              rows={1}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={isRecording}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setInternalNoteMode(!internalNoteMode)}
                      className={`p-2 transition-all rounded-xl ${
                        internalNoteMode 
                          ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs" 
                          : "text-[#94A3B8] hover:text-[#0F172A]"
                      }`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{internalNoteMode ? 'Modo Mensagem Normal' : 'Ativar Modo Nota Interna'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isRecording && (
                <button 
                  onClick={startRecording} 
                  className="p-2 text-[#94A3B8] hover:text-[#007BFF] transition-colors rounded-xl"
                  title="Gravar áudio"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}

              <button 
                onClick={handleSendMessage}
                disabled={isSending || (!messageInput.trim() && !previewMedia)}
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:brightness-105 active:scale-95 disabled:opacity-50 text-white rounded-xl shadow-xs transition-transform"
                title="Enviar"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Coluna Direita: Dados do Contato & CRM ── */}
      {showRightPanel && (
        <div className="hidden xl:flex flex-col w-[310px] bg-white border-l border-[#DBE4F0] shrink-0 shadow-xs">
          
          {/* Perfil do Contato */}
          <div className="flex flex-col items-center p-6 border-b border-[#DBE4F0]">
            <Avatar className="w-20 h-20 mb-3 border-2 border-white shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-[#007BFF]/10 to-[#6366F1]/10 text-[#007BFF] font-bold text-[24px]">
                {contactName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-[17px] font-bold text-[#0F172A] font-heading">{contactName}</h3>
            <p className="text-[13px] text-[#64748B] mt-0.5 font-medium">+55 11 99999-9999</p>
            
            <div className="flex gap-2 mt-4 w-full">
              <Button variant="outline" className="flex-1 h-9 text-[13px] border-[#DBE4F0] bg-[#F8FAFC] hover:bg-[#EEF4FF] hover:text-[#007BFF]">
                <User className="w-3.5 h-3.5 mr-1.5" /> Ver Contato
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Etiquetas (Tags) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider font-heading">Etiquetas</h4>
                <button className="text-[#007BFF] text-[12px] font-semibold hover:underline">Editar</button>
              </div>
              <div className="flex flex-wrap gap-1.5 relative">
                {activeTags.map((tag) => (
                  <div key={tag.id} className={`group flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold rounded-lg border ${colorMap[tag.color]}`}>
                    {tag.name}
                    {tag.type === "local" && (
                      <button onClick={() => removeTag(tag.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:bg-black/10 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="relative">
                  <button 
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="flex items-center justify-center w-[28px] h-[28px] bg-[#F1F5F9] text-[#64748B] rounded-lg hover:bg-[#EEF4FF] hover:text-[#007BFF] transition-colors border border-[#DBE4F0]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Add Tag Popover */}
                  {showTagInput && (
                    <div className="absolute top-8 left-0 z-20 w-[210px] p-3 bg-white border border-[#DBE4F0] rounded-2xl shadow-lg">
                      <form onSubmit={handleAddTag}>
                        <label className="text-[11px] font-bold text-[#64748B] mb-1.5 block">
                          NOVA ETIQUETA LOCAL
                        </label>
                        <input
                          autoFocus
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Ex: Reunião agendada"
                          className="w-full h-8 px-2.5 text-[12px] bg-[#F8FAFC] border border-[#DBE4F0] rounded-lg focus:outline-none focus:border-[#007BFF] mb-2 text-[#0F172A]"
                        />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowTagInput(false)} className="h-7 text-[11px] flex-1">
                            Cancelar
                          </Button>
                          <Button type="submit" size="sm" className="h-7 text-[11px] flex-1 bg-[#007BFF] text-white">
                            Criar
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informações CRM */}
            <div>
              <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3 font-heading">Funil de Vendas & CRM</h4>
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-9 text-[13px] border-[#007BFF] text-[#007BFF] hover:bg-[#EEF4FF] transition-colors font-semibold">
                      + Criar Negócio
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-white border border-[#DBE4F0] shadow-xl rounded-2xl z-50">
                    <h4 className="text-[14px] font-bold text-[#0F172A] mb-3 font-heading">Criar Negócio no Funil</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[12px] font-semibold text-[#64748B] mb-1.5 block">Selecione o Funil</label>
                        <select 
                          className="w-full h-9 px-3 text-[13px] bg-[#F8FAFC] border border-[#DBE4F0] rounded-xl focus:outline-none focus:border-[#007BFF] text-[#0F172A]"
                          value={selectedPipelineId}
                          onChange={(e) => {
                            setSelectedPipelineId(e.target.value);
                            setSelectedStageId("");
                          }}
                        >
                          <option value="" disabled>Escolha um funil</option>
                          {pipelines.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {selectedPipelineId && stagesMap[selectedPipelineId] && (
                        <div>
                          <label className="text-[12px] font-semibold text-[#64748B] mb-1.5 block">Selecione a Etapa</label>
                          <select 
                            className="w-full h-9 px-3 text-[13px] bg-[#F8FAFC] border border-[#DBE4F0] rounded-xl focus:outline-none focus:border-[#007BFF] text-[#0F172A]"
                            value={selectedStageId}
                            onChange={(e) => setSelectedStageId(e.target.value)}
                          >
                            <option value="" disabled>Escolha uma etapa</option>
                            {stagesMap[selectedPipelineId].map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <Button 
                        onClick={handleCreateDeal}
                        disabled={!selectedPipelineId || !selectedStageId || isCreatingDeal}
                        className="w-full h-9 bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white mt-2 font-semibold shadow-xs"
                      >
                        {isCreatingDeal ? "Criando..." : "Confirmar Criação"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-col p-3 bg-[#F8FAFC] border border-[#DBE4F0] rounded-xl">
                  <span className="text-[11px] font-semibold text-[#64748B] mb-0.5">Status no CRM</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">Em Atendimento Inicial</span>
                </div>
              </div>
            </div>

            {/* Anotações Rápidas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider font-heading">Anotações da Equipe</h4>
                <button className="text-[#007BFF] text-[12px] font-semibold hover:underline">Nova</button>
              </div>
              <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl shadow-xs">
                <p className="text-[12.5px] text-amber-900 leading-relaxed font-medium">
                  O cliente pediu retorno amanhã na parte da manhã para fechar os detalhes do contrato.
                </p>
                <span className="text-[10.5px] text-amber-700/80 block mt-1.5 font-medium">Ontem às 18:30 • Por Você</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
