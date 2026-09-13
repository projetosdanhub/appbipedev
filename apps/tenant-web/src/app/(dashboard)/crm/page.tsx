"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List as ListIcon, MoreHorizontal, Filter, Search, ChevronDown, Calendar, Phone, Mail, DollarSign } from "lucide-react";
import { Button } from "@bipesend/ui";

const MOCK_FUNNELS = [
  { id: "1", name: "Vendas - Produto A" },
  { id: "2", name: "Vendas - B2B Corporate" },
];

const MOCK_COLUMNS = [
  { id: "new", title: "Novo Lead", color: "bg-blue-500", count: 12 },
  { id: "contacted", title: "Contatado", color: "bg-amber-500", count: 8 },
  { id: "negotiation", title: "Em Negociação", color: "bg-purple-500", count: 3 },
  { id: "won", title: "Fechado Ganho", color: "bg-emerald-500", count: 24 },
  { id: "lost", title: "Fechado Perdido", color: "bg-red-500", count: 15 },
];

const MOCK_CARDS = [
  { id: "c1", colId: "new", name: "Acme Corp", contact: "João Silva", value: "R$ 15.000", tags: ["Urgente", "B2B"], date: "12 Set" },
  { id: "c2", colId: "new", name: "Tech Solutions", contact: "Maria Oliveira", value: "R$ 8.500", tags: ["Inbound"], date: "13 Set" },
  { id: "c3", colId: "contacted", name: "Global Industries", contact: "Carlos Santos", value: "R$ 45.000", tags: ["Enterprise"], date: "10 Set" },
  { id: "c4", colId: "negotiation", name: "StartupX", contact: "Ana Costa", value: "R$ 5.000", tags: ["SaaS"], date: "05 Set" },
  { id: "c5", colId: "won", name: "Mega Store", contact: "Roberto Alves", value: "R$ 120.000", tags: ["Vip"], date: "01 Set" },
];

export default function CRMPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedFunnel, setSelectedFunnel] = useState(MOCK_FUNNELS[0].id);

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">CRM</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            Gerencie seus funis de venda e automações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "kanban" ? "bg-white dark:bg-[#0F172A] text-[#0A74FF] shadow-sm" : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-[#0F172A] text-[#0A74FF] shadow-sm" : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" className="h-[38px] text-[14px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>

          <Button className="h-[38px] text-[14px] font-medium bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white shadow-sm transition-all rounded-[10px]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </header>

      {/* ── Funnel / Pipeline Selector ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between px-6 py-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">Funil:</span>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-semibold text-[#0F172A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-md transition-colors">
            {MOCK_FUNNELS.find(f => f.id === selectedFunnel)?.name}
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Buscar leads..." 
            className="h-[34px] pl-9 pr-4 text-[13px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[8px] focus:outline-none focus:border-[#0A74FF] dark:focus:border-[#0A74FF] text-[#0F172A] dark:text-white w-full sm:w-[220px] transition-all"
          />
        </div>
      </div>

      {/* ── Board Content ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {viewMode === "kanban" ? (
          <div className="flex h-full w-max p-6 gap-6 items-start">
            {MOCK_COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col w-[320px] max-h-full bg-[#F1F5F9] dark:bg-[#1E293B]/50 rounded-[12px] border border-[#E2E8F0] dark:border-[#334155]/50 overflow-hidden shrink-0">
                
                {/* Column Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-[#E2E8F0] dark:border-[#334155]/50 bg-white/50 dark:bg-[#0F172A]/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h3 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{col.title}</h3>
                    <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-medium bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-full">
                      {col.count}
                    </span>
                  </div>
                  <button className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {MOCK_CARDS.filter(c => c.colId === col.id).map(card => (
                    <div key={card.id} className="group flex flex-col p-4 bg-white dark:bg-[#0F172A] rounded-[10px] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                      
                      {/* Card Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {card.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[11px] font-medium bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] rounded-md border border-[#E2E8F0] dark:border-[#334155]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Card Content */}
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                          {card.name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8] text-[13px] mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#0A74FF]/10 text-[#0A74FF] flex items-center justify-center font-bold text-[10px]">
                          {card.contact.charAt(0)}
                        </div>
                        {card.contact}
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] w-full bg-[#F1F5F9] dark:bg-[#1E293B] mb-3" />

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                        <div className="flex items-center gap-1 text-[#10B981] dark:text-[#34D399] font-semibold bg-[#10B981]/10 px-2 py-1 rounded-md">
                          {card.value}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {card.date}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State Add Button */}
                  <button className="flex items-center justify-center w-full py-2.5 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0]/50 dark:hover:bg-[#1E293B] border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-[10px] transition-all">
                    <Plus className="w-4 h-4 mr-1" />
                    Novo card
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <div className="w-full bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-[#1E293B]/50 border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Lead / Empresa</th>
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Contato</th>
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Etapa (Status)</th>
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Valor</th>
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Data</th>
                      <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_CARDS.map(card => {
                      const col = MOCK_COLUMNS.find(c => c.id === card.colId);
                      return (
                        <tr key={card.id} className="border-b border-[#E2E8F0] dark:border-[#334155] last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{card.name}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {card.tags.map(t => (
                                  <span key={t} className="text-[11px] px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">{t}</span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#0A74FF]/10 text-[#0A74FF] flex items-center justify-center font-bold text-[11px]">
                                {card.contact.charAt(0)}
                              </div>
                              <span className="text-[13px] text-[#475569] dark:text-[#CBD5E1] font-medium">{card.contact}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1]`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${col?.color}`} />
                              {col?.title}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#10B981] dark:text-[#34D399]">
                            {card.value}
                          </td>
                          <td className="px-5 py-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                            {card.date}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors rounded-md hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
