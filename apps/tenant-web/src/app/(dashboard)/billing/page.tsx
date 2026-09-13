"use client";

import { CreditCard, Download, Receipt, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@bipesend/ui";

export default function BillingPage() {
  return (
    <div className="flex flex-col space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Faturamento</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Gerencie sua assinatura, formas de pagamento e notas fiscais.</p>
        </div>
        <Button className="bg-[#0A74FF] text-white shadow-sm hover:bg-[#0A74FF]/90">
          Atualizar Plano
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Plan Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">Plano Pro</h3>
                <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">R$ 149,90 / mês</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[13px] font-medium rounded-full">Ativo</span>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2 text-[14px] text-[#475569] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Até 5 Atendentes
              </div>
              <div className="flex items-center gap-2 text-[14px] text-[#475569] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> WhatsApp Oficial
              </div>
              <div className="flex items-center gap-2 text-[14px] text-[#475569] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> CRM Completo
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-4">Método de Pagamento</h3>
            <div className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-[#F1F5F9] dark:bg-[#1E293B] rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#0F172A] dark:text-white">Cartão final 4242</p>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Expira em 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[13px]">Editar</Button>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-4">Faturas Recentes</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-md">
                      <Receipt className="w-4 h-4 text-[#64748B]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#0F172A] dark:text-white">Setembro 2026</p>
                      <p className="text-[12px] text-[#10B981] dark:text-[#34D399]">Pago • R$ 149,90</p>
                    </div>
                  </div>
                  <button className="text-[#64748B] hover:text-[#0A74FF] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
