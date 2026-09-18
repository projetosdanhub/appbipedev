"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, List as ListIcon, Filter, Search, ChevronDown, Maximize2 } from "lucide-react";
import { Button } from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { PipelineBoard } from "./board/pipeline-board";
import { DealEditorModal } from "./deal-editor-modal";

interface CRMClientProps {
  tenantId: string;
  initialPipelines: CrmPipeline[];
  initialStages: Record<string, CrmPipelineStage[]>;
  initialDeals: Record<string, CrmDeal[]>;
  initialContacts: CrmContact[];
  memberships?: { id: string; userId: string; name: string | null; email: string; }[];
  sessionToken?: string;
}

export function CRMClient({ tenantId, initialPipelines, initialStages, initialDeals, initialContacts, memberships = [], sessionToken }: CRMClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    initialPipelines.length > 0 ? initialPipelines[0].id : null
  );

  const selectedPipeline = initialPipelines.find(p => p.id === selectedPipelineId);
  const stages = selectedPipelineId ? (initialStages[selectedPipelineId] || []) : [];
  let deals = selectedPipelineId ? (initialDeals[selectedPipelineId] || []) : [];

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    deals = deals.filter(deal => deal.title.toLowerCase().includes(lowerSearch));
  }

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

          <Button 
            variant="outline" 
            className="h-[38px] px-3 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0A74FF] hover:border-[#0A74FF]/30 hover:bg-[#0A74FF]/5 transition-all shadow-sm rounded-lg text-[13px] font-medium"
            onClick={() => window.open("/crm?focus=true", "_blank")}
            title="Modo Foco"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Foco
          </Button>

          <Button 
            className="h-[38px] text-[14px] font-medium bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white shadow-sm transition-all rounded-[10px]" 
            disabled={!selectedPipeline || stages.length === 0}
            onClick={() => setIsNewDealOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </header>

      {/* ── Funnel / Pipeline Selector ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between px-6 py-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">Funil:</span>
          {initialPipelines.length > 0 ? (
            <select
              className="bg-transparent border-none text-[14px] font-semibold text-[#0F172A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-md px-2 py-1 outline-none cursor-pointer"
              value={selectedPipelineId || ""}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
            >
              {initialPipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-[14px] text-slate-500">Nenhum pipeline criado</span>
          )}
          
          <Button 
            variant="outline" 
            className="h-[30px] ml-2 text-[12px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white"
            onClick={() => router.push("/settings/crm/pipelines")}
          >
            <Plus className="w-3 h-3 mr-1" /> Criar Funil
          </Button>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Buscar leads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[34px] pl-9 pr-4 text-[13px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[8px] focus:outline-none focus:border-[#0A74FF] dark:focus:border-[#0A74FF] text-[#0F172A] dark:text-white w-full sm:w-[220px] transition-all"
          />
        </div>
      </div>

      {/* ── Board Content ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {selectedPipeline ? (
          <PipelineBoard 
            key={selectedPipeline.id}
            tenantId={tenantId} 
            pipeline={selectedPipeline} 
            stages={stages} 
            deals={deals} 
            contacts={initialContacts}
            memberships={memberships}
            viewMode={viewMode}
            sessionToken={sessionToken}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Crie um Pipeline nas Configurações para começar.
          </div>
        )}
      </div>
      
      {/* Create New Deal Modal */}
      {selectedPipeline && (
        <DealEditorModal
          isOpen={isNewDealOpen}
          onOpenChange={setIsNewDealOpen}
          tenantId={tenantId}
          pipelineId={selectedPipeline.id}
          stage={stages[0]} // Always create in the first stage
          onSuccess={(deal) => {
            setIsNewDealOpen(false);
            router.refresh(); // Fetch new deals from server
          }}
        />
      )}
    </div>
  );
}
