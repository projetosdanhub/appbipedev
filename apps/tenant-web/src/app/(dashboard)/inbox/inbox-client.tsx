"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Filter, MoreVertical, MessageCircle, Globe, Check, CheckCheck, Paperclip, Mic, Send, Phone, Video, Info, Tag, Clock, User, ChevronDown, Reply, Plus, X, Maximize2, FileText, Image as ImageIcon, StopCircle } from "lucide-react";
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge, Card } from "@bipesend/ui";

import { toast } from "sonner";
import { getMessagesAction, addInternalNoteAction, updateConversationAction, getConversationsByContactAction, sendOutboundMessageAction, uploadMediaAction } from "@/features/inbox/actions/inbox.actions";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtime } from "@/lib/useRealtime";
import { useRouter } from "next/navigation";
import { CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";
import { createDealFromContactAction } from "../../../features/crm/actions/deal.actions";

// Mock Avatar Components for Inbox
const Avatar = ({ className, children }: any) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ className, children }: any) => <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>;
const AvatarImage = ({ src, alt, className }: any) => <img src={src} alt={alt} className={`aspect-square h-full w-full ${className}`} />;

const CHANNELS = [
  { id: "all", name: "Todas as Caixas", icon: <MessageCircle className="w-4 h-4" /> },
  { id: "whatsapp", name: "WhatsApp Principal", icon: <MessageCircle className="w-4 h-4 text-emerald-500" /> },
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
    } catch (err) {
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
        mediaData = uploadRes.data; // { url, mimetype, filename }
      }

      let res;
      if (internalNoteMode && !previewMedia) {
        // Internal notes for now only text
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
    } catch (error) {
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
    } catch (e) {
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
    red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    emerald: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    slate: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    // Check local tag limit
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
    
    // We assume the contactId is in activeChat.contactId
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
        // Close popover logic would be handled by Radix if we had controlled state,
        // for now just show success.
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error("Erro ao criar negócio");
    } finally {
      setIsCreatingDeal(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
      
      {/* ── Left Sidebar (Chat List) ── */}
      {!isFullscreen && (
      <div className="flex flex-col w-full md:w-[320px] lg:w-[340px] bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center justify-between mb-3 gap-2">
            <button className="flex-1 flex items-center gap-2 px-3 py-2 text-[14px] font-semibold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[8px] transition-colors">
              {selectedChannel.icon}
              {selectedChannel.name}
              <ChevronDown className="w-4 h-4 ml-auto text-[#64748B]" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Buscar conversas..." 
                className="w-full h-[36px] pl-9 pr-4 text-[13px] bg-[#F1F5F9] dark:bg-[#1E293B]/50 border border-transparent focus:border-[#E2E8F0] dark:focus:border-[#334155] rounded-[8px] focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] text-[#0F172A] dark:text-white transition-all"
              />
            </div>
            <button className="w-[36px] h-[36px] flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1E293B]/50 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-[8px] transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {initialConversations.map(chat => {
            const chatName = chat.contactId || chat.subject || chat.name || "Contato";
            const chatLastMsg = chat.subject || "...";
            const chatTime = chat.lastActivityAt ? format(new Date(chat.lastActivityAt), "HH:mm") : "";
            const chatUnread = chat.status === "open" ? 1 : 0;
            const isSelected = activeChat?.id === chat.id;

            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`flex gap-3 p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]/50 cursor-pointer transition-colors ${isSelected ? "bg-[#F0F7FF] dark:bg-[#0F172A] border-l-4 border-l-[#0A74FF]" : "hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 border-l-4 border-l-transparent"}`}
              >
                <div className="relative">
                  <Avatar className="w-11 h-11 border border-[#E2E8F0] dark:border-[#334155]">
                    <AvatarFallback className="bg-[#E2E8F0] dark:bg-[#334155] text-[#475569] dark:text-[#94A3B8] font-semibold">
                      {chatName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Channel Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#0F172A] bg-white dark:bg-[#0F172A] flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-white truncate pr-2">
                      {chatName}
                    </h4>
                    <span className={`text-[11px] whitespace-nowrap ${chatUnread > 0 ? "text-[#0A74FF] font-medium" : "text-[#94A3B8]"}`}>
                      {chatTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[13px] truncate ${chatUnread > 0 ? "text-[#0F172A] dark:text-[#E2E8F0] font-medium" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                      {chatLastMsg}
                    </p>
                    {chatUnread > 0 && (
                      <div className="w-4 h-4 rounded-full bg-[#0A74FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        !
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

      {/* ── Center (Chat Area) ── */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] min-w-0">
        
        {/* Chat Header */}
        <div className="h-[64px] flex items-center justify-between px-5 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#0A74FF]/10 text-[#0A74FF] font-semibold text-[13px]">
                {contactName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                {contactName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Online agora</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  disabled={isTransferring}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-md transition-colors"
                >
                  <Reply className="w-4 h-4" /> Transferir
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#1E293B] shadow-lg rounded-xl flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold text-[#0F172A] dark:text-white px-2">Transferir Conversa</h4>
                <div className="flex flex-col gap-1 mt-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {memberships?.map((mem) => (
                    <button
                      key={mem.id}
                      onClick={() => handleTransfer(mem.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-left transition-colors ${
                        activeChat?.assignedMembershipId === mem.id 
                          ? "bg-[#F0F7FF] dark:bg-[#1E293B] text-[#0A74FF] font-medium"
                          : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
                      }`}
                    >
                      <Avatar className="w-6 h-6 border border-[#E2E8F0] dark:border-[#334155]">
                        <AvatarFallback className="bg-[#F1F5F9] dark:bg-[#334155] text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          {mem.user.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="truncate">{mem.user.name}</span>
                      </div>
                      {activeChat?.assignedMembershipId === mem.id && <Check className="w-3 h-3 text-[#0A74FF]" />}
                    </button>
                  ))}
                  <div className="w-full h-[1px] bg-[#E2E8F0] dark:bg-[#1E293B] my-1" />
                  <button
                    onClick={() => handleTransfer("")}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Remover Responsável</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white rounded-md transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white rounded-md transition-colors">
              <Video className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-md transition-colors ${showRightPanel ? "bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"}`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-[#0B1120] relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] backdrop-blur-sm">
                Hoje
              </span>
            </div>
            
            {messages.length === 0 && !isLoadingMessages && (
              <div className="flex items-center justify-center h-full text-sm text-[#64748B]">Nenhuma mensagem nesta conversa.</div>
            )}
            
            {messages.map(msg => {
              const isAgent = msg.direction === "outbound" || msg.kind === "internal_note";
              return (
                <div key={msg.id} className={`flex flex-col max-w-[75%] ${isAgent ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  <div 
                    className={`p-3 rounded-[12px] shadow-sm text-[14px] leading-relaxed relative flex flex-col gap-2 ${
                      isAgent 
                        ? msg.kind === "internal_note" 
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 rounded-tr-none" 
                          : "bg-[#0A74FF] text-white rounded-tr-none" 
                        : "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] rounded-tl-none"
                    }`}
                  >
                    {msg.hasMedia && msg.mediaUrl && (
                      <div className="max-w-full overflow-hidden rounded-lg">
                        {msg.mediaType?.startsWith('image/') ? (
                          <img src={msg.mediaUrl} alt="Imagem enviada" className="max-w-[240px] max-h-[300px] object-cover rounded-md" />
                        ) : msg.mediaType?.startsWith('audio/') ? (
                          <audio src={msg.mediaUrl} controls className="max-w-[240px]" />
                        ) : msg.mediaType?.startsWith('video/') ? (
                          <video src={msg.mediaUrl} controls className="max-w-[240px] max-h-[300px] rounded-md" />
                        ) : (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <Paperclip className="w-4 h-4" />
                            <span className="truncate max-w-[180px]">{msg.mediaName || 'Anexo'}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && <span>{msg.text}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                    {isAgent && msg.kind !== "internal_note" && (
                      msg.state === "failed" ? (
                        <span className="text-red-500 font-medium ml-1">Falhou</span>
                      ) : msg.state === "read" ? (
                        <CheckCheck className="w-3 h-3 text-[#0A74FF]" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          
          {/* Media Preview Area */}
          {previewMedia && (
            <div className="mb-3 p-3 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] relative">
              <button 
                onClick={() => {
                  URL.revokeObjectURL(previewMedia.url);
                  setPreviewMedia(null);
                }}
                className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/50 text-[#0F172A] dark:text-white rounded-full hover:bg-white dark:hover:bg-black transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex justify-center items-center h-32 overflow-hidden rounded-lg bg-black/5 dark:bg-black/20">
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
                  <div className="flex flex-col items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
                    <FileText className="w-8 h-8" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{previewMedia.file.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recording UI */}
          {isRecording && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 dark:text-red-400 font-mono text-sm">
                  {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-red-600/80 dark:text-red-400/80">Gravando áudio...</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={cancelRecording} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors">
                  Cancelar
                </button>
                <button onClick={stopRecording} className="p-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-md transition-colors">
                  <StopCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] rounded-[14px] p-2 focus-within:border-[#0A74FF] transition-colors">
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              placeholder={internalNoteMode ? "Digite uma nota interna..." : "Digite sua mensagem..."} 
              className={`flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none resize-none focus:outline-none py-2 text-[14px] custom-scrollbar ${internalNoteMode ? 'text-amber-700 dark:text-amber-500 placeholder:text-amber-700/50' : 'text-[#0F172A] dark:text-white'}`}
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
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setInternalNoteMode(!internalNoteMode)}
                      className={`p-2 transition-colors rounded-md ${internalNoteMode ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{internalNoteMode ? 'Modo Mensagem' : 'Modo Nota Interna'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isRecording && (
                <button onClick={startRecording} className="p-2 text-[#94A3B8] hover:text-[#0A74FF] dark:hover:text-[#0A74FF] transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleSendMessage}
                disabled={isSending || (!messageInput.trim() && !previewMedia)}
                className="w-10 h-10 flex items-center justify-center bg-[#0A74FF] hover:bg-[#0A74FF]/90 disabled:opacity-50 text-white rounded-full transition-transform active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar (Contact Info) ── */}
      {showRightPanel && (
        <div className="hidden xl:flex flex-col w-[300px] bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          {/* Contact Header */}
          <div className="flex flex-col items-center p-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <Avatar className="w-20 h-20 mb-3 border-2 border-white dark:border-[#0F172A] shadow-md">
              <AvatarFallback className="bg-[#0A74FF]/10 text-[#0A74FF] font-bold text-[24px]">
                {contactName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white">{contactName}</h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">+55 11 99999-9999</p>
            
            <div className="flex gap-2 mt-4 w-full">
              <Button variant="outline" className="flex-1 h-9 text-[13px] border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50">
                <User className="w-4 h-4 mr-1.5" /> Perfil
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Etiquetas (Tags) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Etiquetas</h4>
                <button className="text-[#0A74FF] text-[12px] font-semibold hover:underline">Editar</button>
              </div>
              <div className="flex flex-wrap gap-1.5 relative">
                {activeTags.map((tag) => (
                  <div key={tag.id} className={`group flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium rounded-md border ${colorMap[tag.color]}`}>
                    {tag.name}
                    {tag.type === "local" && (
                      <button onClick={() => removeTag(tag.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="relative">
                  <button 
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="flex items-center justify-center w-[26px] h-[26px] bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] rounded-md hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors border border-[#E2E8F0] dark:border-[#334155]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Add Tag Popover */}
                  {showTagInput && (
                    <div className="absolute top-8 left-0 z-10 w-[200px] p-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg">
                      <form onSubmit={handleAddTag}>
                        <label className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1.5 block">
                          NOVA ETIQUETA LOCAL
                        </label>
                        <input
                          autoFocus
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Ex: Ligação agendada"
                          className="w-full h-8 px-2.5 text-[12px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md focus:outline-none focus:border-[#0A74FF] mb-2 text-[#0F172A] dark:text-white"
                        />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowTagInput(false)} className="h-7 text-[11px] flex-1">
                            Cancelar
                          </Button>
                          <Button type="submit" size="sm" className="h-7 text-[11px] flex-1 bg-[#0A74FF] text-white">
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
              <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-3">Dados do CRM</h4>
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-9 text-[13px] border-[#0A74FF] text-[#0A74FF] hover:bg-[#0A74FF]/10 transition-colors">
                      + Criar Negócio
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#1E293B] shadow-lg rounded-xl">
                    <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-white mb-3">Criar Negócio no Funil</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[12px] font-semibold text-[#64748B] mb-1.5 block">Selecione o Funil</label>
                        <select 
                          className="w-full h-9 px-3 text-[13px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md focus:outline-none focus:border-[#0A74FF] text-[#0F172A] dark:text-white"
                          value={selectedPipelineId}
                          onChange={(e) => {
                            setSelectedPipelineId(e.target.value);
                            setSelectedStageId(""); // reset stage
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
                            className="w-full h-9 px-3 text-[13px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md focus:outline-none focus:border-[#0A74FF] text-[#0F172A] dark:text-white"
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
                        className="w-full h-9 bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white mt-2"
                      >
                        {isCreatingDeal ? "Criando..." : "Confirmar Criação"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-col mt-4">
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-0.5">Última Fase do Funil</span>
                  <span className="text-[13.5px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">-</span>
                </div>
              </div>
            </div>

            {/* Notas Rápidas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Anotações</h4>
                <button className="text-[#0A74FF] text-[12px] font-semibold hover:underline">Nova</button>
              </div>
              <div className="p-3 bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
                <p className="text-[12.5px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  O cliente pediu retorno amanhã na parte da manhã para fechar os detalhes do contrato.
                </p>
                <span className="text-[10px] text-amber-700/60 dark:text-amber-400/60 block mt-1.5">Ontem às 18:30</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
