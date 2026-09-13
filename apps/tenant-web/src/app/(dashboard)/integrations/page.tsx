"use client";

import { MessageCircle, Globe, Link2, CreditCard, Box, Webhook, Plus } from "lucide-react";
import { Button } from "@bipesend/ui";

const MOCK_INTEGRATIONS = [
  { id: 1, name: "WhatsApp Oficial", desc: "API Oficial da Meta", icon: <MessageCircle className="w-8 h-8 text-emerald-500" />, status: "connected" },
  { id: 2, name: "Instagram", desc: "Direct e Comentários", icon: <Globe className="w-8 h-8 text-pink-500" />, status: "connected" },
  { id: 3, name: "Mercado Pago", desc: "Geração de Pix e Boletos", icon: <CreditCard className="w-8 h-8 text-blue-500" />, status: "disconnected" },
  { id: 4, name: "Stripe", desc: "Cartão de Crédito", icon: <CreditCard className="w-8 h-8 text-indigo-500" />, status: "disconnected" },
  { id: 5, name: "Webhooks", desc: "Integrações customizadas", icon: <Webhook className="w-8 h-8 text-slate-500" />, status: "available" },
  { id: 6, name: "Shopify", desc: "E-commerce", icon: <Box className="w-8 h-8 text-green-600" />, status: "available" },
];

export default function IntegrationsPage() {
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
    </div>
  );
}
