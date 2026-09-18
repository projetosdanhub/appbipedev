"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Globe, Link2, CreditCard, Box, Webhook, Plus, Loader2, Check } from "lucide-react";
import { Button } from "@bipesend/ui";
import { useRealtime } from "@/lib/useRealtime";
import { createWhatsAppConnectionAction, deleteConnectionAction } from "@/features/integrations/actions/connection.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MOCK_INTEGRATIONS = [
  { id: 2, provider: "instagram", name: "Instagram", desc: "Direct e Comentários", icon: <Globe className="w-8 h-8 text-pink-500" />, status: "disconnected" },
  { id: 3, provider: "mercadopago", name: "Mercado Pago", desc: "Geração de Pix e Boletos", icon: <CreditCard className="w-8 h-8 text-blue-500" />, status: "disconnected" },
  { id: 4, provider: "stripe", name: "Stripe", desc: "Cartão de Crédito", icon: <CreditCard className="w-8 h-8 text-indigo-500" />, status: "disconnected" },
  { id: 5, provider: "webhooks", name: "Webhooks", desc: "Integrações customizadas", icon: <Webhook className="w-8 h-8 text-slate-500" />, status: "available" },
  { id: 6, provider: "shopify", name: "Shopify", desc: "E-commerce", icon: <Box className="w-8 h-8 text-green-600" />, status: "available" },
];

export function IntegrationsClient({ tenantId, initialConnections, sessionToken }: { tenantId: string, initialConnections: any[], sessionToken?: string }) {
  const router = useRouter();
  const [connections, setConnections] = useState<any[]>(initialConnections);
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    setConnections(initialConnections);
  }, [initialConnections]);

  const whatsappConn = connections.find(c => c.provider === "evolution_api" || c.name === "WhatsApp");
  const isWhatsappConnected = whatsappConn?.status === "connected";
  const isWhatsappConnecting = whatsappConn?.status === "connecting";

  useEffect(() => {
    if (isWhatsappConnected && showQrModal) {
      const timer = setTimeout(() => {
        setShowQrModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isWhatsappConnected, showQrModal]);

  useRealtime({
    tenantId,
    token: sessionToken,
    onEvent: (event, payload) => {
      if (event === "connection.changed") {
        router.refresh();
      } else if (event === "connection.qrcode") {
        if (payload.qrcode) {
          setQrCodeData(payload.qrcode);
        }
      }
    }
  });

  const handleConnectWhatsApp = async () => {
    setIsLoading(true);
    setQrCodeData(null);
    setShowQrModal(true);
    
    const res = await createWhatsAppConnectionAction("WhatsApp");
    if (res.success) {
      if (res.data.qrcode) {
        setQrCodeData(res.data.qrcode);
      }
      toast.success("Gerando QR Code...");
      router.refresh();
    } else {
      toast.error(res.message);
      setShowQrModal(false);
    }
    setIsLoading(false);
  };

  const handleDisconnect = async (instanceName: string) => {
    setIsLoading(true);
    const res = await deleteConnectionAction(instanceName);
    if (res.success) {
      toast.success("Desconectado com sucesso");
      router.refresh();
    } else {
      toast.error(res.message || "Erro ao desconectar");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Integrações</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Conecte seus canais de atendimento, pagamentos e outras ferramentas.</p>
        </div>
        <Button className="bg-white border border-[#E2E8F0] dark:bg-[#0F172A] dark:border-[#334155] text-[#0F172A] dark:text-white shadow-sm hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]">
          <Link2 className="w-4 h-4 mr-2" /> API Access
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[180px]">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-emerald-500" />
            </div>
            {isWhatsappConnected && (
              <span className="px-2 py-1 text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md">Conectado</span>
            )}
            {isWhatsappConnecting && (
              <span className="px-2 py-1 text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-md animate-pulse">Conectando...</span>
            )}
            {!isWhatsappConnected && !isWhatsappConnecting && (
              <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">Desconectado</span>
            )}
          </div>
          
          <div>
            <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-white">WhatsApp</h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">Conexão via QR Code</p>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] mt-3">
            {isWhatsappConnected ? (
              <Button onClick={() => whatsappConn?.instanceName && handleDisconnect(whatsappConn.instanceName)} disabled={isLoading} variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 h-8">
                Desconectar
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnectWhatsApp} disabled={isLoading || isWhatsappConnecting} className="w-full bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] hover:bg-white dark:bg-[#1E293B] dark:text-white dark:border-[#334155] dark:hover:bg-[#334155] h-8 shadow-none">
                {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} 
                {isWhatsappConnecting ? "Conectando..." : "Conectar"}
              </Button>
            )}
          </div>
        </div>

        {MOCK_INTEGRATIONS.map((int) => (
          <div key={int.id} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[180px]">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center">
                {int.icon}
              </div>
              {int.status === "connected" && (
                <span className="px-2 py-1 text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md">Conectado</span>
              )}
              {int.status === "disconnected" && (
                <span className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">Desconectado</span>
              )}
            </div>
            
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-white">{int.name}</h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">{int.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] mt-3">
              {int.status === "connected" ? (
                <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 h-8">
                  Desconectar
                </Button>
              ) : (
                <Button size="sm" className="w-full bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] hover:bg-white dark:bg-[#1E293B] dark:text-white dark:border-[#334155] dark:hover:bg-[#334155] h-8 shadow-none">
                  <Plus className="w-4 h-4 mr-1" /> Conectar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg w-[400px] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Conectar WhatsApp</h3>
              <button onClick={() => setShowQrModal(false)} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              {qrCodeData ? (
                <>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-4 text-center">
                    Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.
                  </p>
                  <img src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`} alt="QR Code" className="w-64 h-64 border-4 border-white rounded-lg shadow-sm" />
                </>
              ) : isWhatsappConnected ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <p className="text-emerald-600 font-medium text-lg">Conectado com sucesso!</p>
                  <Button className="mt-6" onClick={() => setShowQrModal(false)}>Fechar</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-10 h-10 text-[#0A74FF] animate-spin" />
                  <p className="text-[#64748B] dark:text-[#94A3B8]">Aguardando QR Code...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
