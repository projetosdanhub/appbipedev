"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, List as ListIcon, Funnel } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  SearchField,
  SegmentedControl,
} from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { PipelineBoard } from "./board/pipeline-board";
import { DealEditorModal } from "./deal-editor-modal";
import type { CrmMembershipOption } from "../types";
import "./crm.css";

interface CRMClientProps {
  tenantId: string;
  initialPipelines: CrmPipeline[];
  initialStages: Record<string, CrmPipelineStage[]>;
  initialDeals: Record<string, CrmDeal[]>;
  initialContacts: CrmContact[];
  memberships?: CrmMembershipOption[];
  sessionToken?: string;
}

export function CRMClient({ tenantId, initialPipelines, initialStages, initialDeals, initialContacts, memberships = [], sessionToken }: CRMClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    initialPipelines.length > 0 ? initialPipelines[0].id : null
  );

  const selectedPipeline = initialPipelines.find(p => p.id === selectedPipelineId);
  const stages = selectedPipelineId ? (initialStages[selectedPipelineId] || []) : [];
  let deals = selectedPipelineId ? (initialDeals[selectedPipelineId] || []) : [];

  if (appliedSearch) {
    const lowerSearch = appliedSearch.toLowerCase();
    deals = deals.filter(deal => deal.title.toLowerCase().includes(lowerSearch));
  }

  return (
    <div className="crm-shell">
      <div className="crm-heading">
        <PageHeader
          title="CRM"
          description="Acompanhe oportunidades, responsáveis e próximas ações em um só lugar."
          actions={
          <Button 
            size="md"
            disabled={!selectedPipeline || stages.length === 0}
            onClick={() => setIsNewDealOpen(true)}
          >
            <Plus aria-hidden="true" />
            Novo Lead
          </Button>
          }
        />
      </div>

      <div className="crm-toolbar">
        <div className="crm-pipeline-control">
          <Funnel aria-hidden="true" />
          <label htmlFor="crm-pipeline">Funil</label>
          {initialPipelines.length > 0 ? (
            <select
              id="crm-pipeline"
              value={selectedPipelineId || ""}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
            >
              {initialPipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <span className="crm-pipeline-empty">Nenhum funil criado</span>
          )}

          <Button 
            variant="ghost"
            size="compact"
            onClick={() => router.push("/settings/crm/pipelines")}
          >
            <Plus aria-hidden="true" /> Criar funil
          </Button>
        </div>

        <div className="crm-toolbar-actions">
          <SearchField
            label="Buscar leads"
            placeholder="Nome do lead"
            value={searchTerm}
            onValueChange={setSearchTerm}
            onSearch={setAppliedSearch}
          />
          <SegmentedControl
            label="Formato de visualização"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "kanban" | "list")}
            items={[
              { value: "kanban", label: "Quadro", icon: <LayoutGrid aria-hidden="true" /> },
              { value: "list", label: "Lista", icon: <ListIcon aria-hidden="true" /> },
            ]}
          />
        </div>
      </div>

      <div className="crm-content">
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
          <EmptyState
            title="Crie seu primeiro funil"
            description="Organize as etapas comerciais antes de adicionar oportunidades ao CRM."
            action={
              <Button size="md" onClick={() => router.push("/settings/crm/pipelines")}>
                <Plus aria-hidden="true" /> Criar funil
              </Button>
            }
          />
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
          onSuccess={() => {
            setIsNewDealOpen(false);
            router.refresh(); // Fetch new deals from server
          }}
        />
      )}
    </div>
  );
}
