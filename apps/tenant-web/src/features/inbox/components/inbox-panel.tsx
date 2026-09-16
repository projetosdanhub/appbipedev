"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Input, Textarea } from "@bipesend/ui";
import { Conversation, Message } from "@bipesend/contracts";
import { 
  getConversationsByContactAction, 
  getMessagesAction, 
  addInternalNoteAction,
  createConversationAction 
} from "../actions/inbox.actions";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface InboxPanelProps {
  tenantId: string;
  contactId: string;
}

export function InboxPanel({ tenantId, contactId }: InboxPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadConversations() {
      setIsLoadingConversations(true);
      const res = await getConversationsByContactAction(tenantId, contactId);
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0) {
          setActiveConversationId(res.data[0].id);
        }
      }
      setIsLoadingConversations(false);
    }
    loadConversations();
  }, [tenantId, contactId]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) return;
      setIsLoadingMessages(true);
      const res = await getMessagesAction(tenantId, activeConversationId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
      setIsLoadingMessages(false);
    }
    loadMessages();
  }, [tenantId, activeConversationId]);

  const handleCreateConversation = async () => {
    startTransition(async () => {
      const res = await createConversationAction(tenantId, { contactId });
      if (res.success && res.data) {
        setConversations(prev => [res.data, ...prev]);
        setActiveConversationId(res.data.id);
        toast.success("Nova conversa iniciada.");
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !noteContent.trim()) return;

    startTransition(async () => {
      const res = await addInternalNoteAction(tenantId, activeConversationId, { text: noteContent });
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        setNoteContent("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  if (isLoadingConversations) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Histrico de Atendimento
        </h3>
        <Button variant="outline" size="sm" onClick={handleCreateConversation} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Nova Conversa"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Lista de Conversas */}
        <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 text-center">Nenhuma conversa encontrada.</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                  activeConversationId === conv.id ? "bg-blue-50 text-blue-700 border border-blue-100" : "hover:bg-slate-50 text-slate-600 border border-transparent"
                }`}
              >
                <div className="font-medium truncate">Atendimento #{conv.id.substring(0,6)}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Content: Mensagens */}
        <div className="w-2/3 flex flex-col bg-slate-50">
          {!activeConversationId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Selecione uma conversa ao lado.
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm p-4">Nenhuma mensagem nesta conversa.</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="flex flex-col">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg shadow-sm w-11/12 ml-auto">
                        <div className="text-xs text-yellow-600 font-semibold mb-1 flex justify-between">
                          <span>Nota Interna</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={handleAddNote} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label htmlFor="note" className="sr-only">Adicionar Nota Interna</label>
                    <Textarea 
                      id="note"
                      placeholder="Escreva uma nota interna..."
                      className="min-h-[80px] text-sm resize-none"
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <Button type="submit" size="icon" disabled={isPending || !noteContent.trim()}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
