"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellDot, CheckCircle2, Loader2 } from "lucide-react";
import { IconButton, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@bipesend/ui";
import { getNotificationsAction, markNotificationAsReadAction } from "../actions/notification.actions";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/useRealtime";
import { toast } from "sonner";

export function NotificationBell({ tenantId, sessionToken }: { tenantId?: string, sessionToken?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const unreadCount = notifications.filter(n => !n.read).length;

  useRealtime({
    tenantId: tenantId || "",
    token: sessionToken,
    onEvent: (event, payload) => {
      if (event === "connection.changed") {
        if (payload.status === "disconnected") {
          toast.error(`WhatsApp Desconectado (${payload.instanceName})`, {
            description: "Sua conexão com o WhatsApp caiu. Vá em Configurações > Integrações para reconectar."
          });
          // Opcionalmente recarregar os dados da página atual
          router.refresh();
        } else if (payload.status === "connected") {
          toast.success(`WhatsApp Conectado (${payload.instanceName})`);
          router.refresh();
        }
      }
    }
  });

  useEffect(() => {
    if (!tenantId) return;

    let mounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await getNotificationsAction(tenantId);
        if (mounted && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();

    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tenantId]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tenantId) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    try {
      await markNotificationAsReadAction(tenantId, id);
    } catch (err) {
      console.error(err);
      // Fallback
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read && tenantId) {
      void markNotificationAsReadAction(tenantId, notification.id).catch(console.error);
    }
    
    if (notification.type === 'crm.deal.assigned' && notification.content?.dealId) {
      startTransition(() => {
        router.push(`/${tenantId}/crm/${notification.content.dealId}`);
      });
    } else if (notification.type === 'inbox.conversation.assigned' && notification.content?.conversationId) {
      startTransition(() => {
        router.push(`/${tenantId}/inbox?c=${notification.content.conversationId}`);
      });
    }
  };

  if (!tenantId) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton label="Notificações" className="relative">
          {unreadCount > 0 ? (
            <div className="relative">
              <BellDot aria-hidden="true" className="text-violet-500" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          ) : (
            <Bell aria-hidden="true" />
          )}
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 && !loading && (
            <div className="p-4 text-center text-sm text-slate-500">
              Nenhuma notificação
            </div>
          )}
          {notifications.map(n => (
            <DropdownMenuItem 
              key={n.id} 
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${n.read ? 'opacity-60' : 'bg-violet-50/50 dark:bg-violet-500/10'}`}
              onSelect={(e) => {
                e.preventDefault();
                handleNotificationClick(n);
                setIsOpen(false);
              }}
            >
              <div className="flex w-full items-start justify-between">
                <span className="font-semibold text-sm">{n.title}</span>
                {!n.read && (
                  <button 
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                    className="text-slate-400 hover:text-violet-500 rounded p-1"
                    title="Marcar como lido"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {n.type === 'crm.deal.assigned' ? n.content?.dealTitle : n.content?.contactName}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
