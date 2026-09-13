"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, MessageCircle, Globe, Check, CheckCheck, Paperclip, Mic, Send, Phone, Video, Info, Tag, Clock, User, ChevronDown, Reply, Plus, X, Maximize2 } from "lucide-react";
import { Button, Input } from "@bipesend/ui";
import { toast } from "sonner";

// Mock Avatar Components for Inbox
const Avatar = ({ className, children }: any) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ className, children }: any) => <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>;
const AvatarImage = ({ src, alt, className }: any) => <img src={src} alt={alt} className={`aspect-square h-full w-full ${className}`} />;

const CHANNELS = [
  { id: "all", name: "Todas as Caixas", icon: <MessageCircle className="w-4 h-4" /> },
  { id: "whatsapp", name: "WhatsApp Principal", icon: <MessageCircle className="w-4 h-4 text-emerald-500" /> },
  { id: "instagram", name: "Instagram @bipesend", icon: <Globe className="w-4 h-4 text-pink-500" /> },
];

const MOCK_CHATS = [
  { id: "1", name: "João Silva", lastMsg: "Podemos fechar negócio amanhã?", time: "10:45", unread: 2, channel: "whatsapp", avatar: "" },
  { id: "2", name: "Maria Oliveira", lastMsg: "Quais os planos disponíveis?", time: "09:20", unread: 0, channel: "instagram", avatar: "" },
  { id: "3", name: "Carlos Santos", lastMsg: "Obrigado pelo suporte!", time: "Ontem", unread: 0, channel: "whatsapp", avatar: "" },
  { id: "4", name: "Ana Costa", lastMsg: "Estou com uma dúvida no CRM.", time: "Ontem", unread: 1, channel: "whatsapp", avatar: "" },
  { id: "5", name: "Tech Solutions", lastMsg: "Vocês emitem nota fiscal?", time: "Segunda", unread: 0, channel: "instagram", avatar: "" },
];

const MOCK_MESSAGES = [
  { id: "m1", text: "Olá! Gostaria de saber mais sobre a plataforma.", sender: "user", time: "10:30", status: "read" },
  { id: "m2", text: "Claro! A BipeSend é uma plataforma completa de CRM e automações.", sender: "agent", time: "10:32", status: "read" },
  { id: "m3", text: "Isso inclui integrações com WhatsApp?", sender: "user", time: "10:35", status: "read" },
  { id: "m4", text: "Sim, integração oficial! E também Instagram e Messenger.", sender: "agent", time: "10:40", status: "read" },
  { id: "m5", text: "Podemos fechar negócio amanhã?", sender: "user", time: "10:45", status: "delivered" },
];

export default function InboxPage() {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
  const [showRightPanel, setShowRightPanel] = useState(true);

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

  return (
    <div className="flex h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
      
      {/* ── Left Sidebar (Chat List) ── */}
      <div className="flex flex-col w-full md:w-[320px] lg:w-[340px] bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-[14px] font-semibold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] rounded-[8px] transition-colors mb-3">
            {selectedChannel.icon}
            {selectedChannel.name}
            <ChevronDown className="w-4 h-4 ml-auto text-[#64748B]" />
          </button>
          
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
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`flex gap-3 p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]/50 cursor-pointer transition-colors ${activeChat.id === chat.id ? "bg-[#F0F7FF] dark:bg-[#0F172A] border-l-4 border-l-[#0A74FF]" : "hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 border-l-4 border-l-transparent"}`}
            >
              <div className="relative">
                <Avatar className="w-11 h-11 border border-[#E2E8F0] dark:border-[#334155]">
                  <AvatarFallback className="bg-[#E2E8F0] dark:bg-[#334155] text-[#475569] dark:text-[#94A3B8] font-semibold">
                    {chat.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Channel Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#0F172A] bg-white dark:bg-[#0F172A] flex items-center justify-center">
                  {chat.channel === "whatsapp" ? <MessageCircle className="w-3 h-3 text-emerald-500 fill-emerald-500" /> : <Globe className="w-3 h-3 text-pink-500" />}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-white truncate pr-2">
                    {chat.name}
                  </h4>
                  <span className={`text-[11px] whitespace-nowrap ${chat.unread > 0 ? "text-[#0A74FF] font-medium" : "text-[#94A3B8]"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[13px] truncate ${chat.unread > 0 ? "text-[#0F172A] dark:text-[#E2E8F0] font-medium" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                    {chat.lastMsg}
                  </p>
                  {chat.unread > 0 && (
                    <div className="w-4 h-4 rounded-full bg-[#0A74FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Center (Chat Area) ── */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] min-w-0">
        
        {/* Chat Header */}
        <div className="h-[64px] flex items-center justify-between px-5 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#0A74FF]/10 text-[#0A74FF] font-semibold text-[13px]">
                {activeChat.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                {activeChat.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Online agora</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-md transition-colors">
              <Reply className="w-4 h-4" /> Transferir
            </button>
            <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white rounded-md transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white rounded-md transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <a 
              href="/inbox?fullscreen=true" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-white rounded-md transition-colors"
              title="Isolar Aba"
            >
              <Maximize2 className="w-4 h-4" />
            </a>
            <div className="w-[1px] h-6 bg-[#E2E8F0] dark:bg-[#334155] mx-1" />
            <button 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-md transition-colors ${showRightPanel ? "bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"}`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" style={{ backgroundImage: "url('/chat-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundBlendMode: "overlay", backgroundColor: "rgba(248, 250, 252, 0.95)" }}>
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] backdrop-blur-sm">
              Hoje
            </span>
          </div>
          
          {MOCK_MESSAGES.map(msg => {
            const isAgent = msg.sender === "agent";
            return (
              <div key={msg.id} className={`flex flex-col max-w-[75%] ${isAgent ? "ml-auto items-end" : "mr-auto items-start"}`}>
                <div 
                  className={`p-3 rounded-[12px] shadow-sm text-[14px] leading-relaxed relative ${
                    isAgent 
                      ? "bg-[#0A74FF] text-white rounded-tr-sm" 
                      : "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#E2E8F0] border border-[#E2E8F0] dark:border-[#334155] rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-[#94A3B8] font-medium">{msg.time}</span>
                  {isAgent && (
                    msg.status === "read" ? <CheckCheck className="w-3 h-3 text-[#0A74FF]" /> : <Check className="w-3 h-3 text-[#94A3B8]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          <div className="flex items-end gap-2 bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] rounded-[14px] p-2 focus-within:border-[#0A74FF] transition-colors">
            <button className="p-2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              placeholder="Digite sua mensagem..." 
              className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none resize-none focus:outline-none py-2 text-[14px] text-[#0F172A] dark:text-white custom-scrollbar"
              rows={1}
            />
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white rounded-full transition-transform active:scale-95 shadow-sm">
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
                {activeChat.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-white">{activeChat.name}</h3>
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
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-0.5">Fase do Funil</span>
                  <span className="text-[13.5px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">Novo Lead (Vendas B2B)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-0.5">Valor Estimado</span>
                  <span className="text-[13.5px] font-bold text-[#10B981] dark:text-[#34D399]">R$ 15.000,00</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-0.5">Responsável</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center text-[10px] font-bold text-[#475569] dark:text-[#94A3B8]">
                      EU
                    </div>
                    <span className="text-[13px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">Você</span>
                  </div>
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
