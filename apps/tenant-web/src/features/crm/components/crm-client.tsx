"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { 
  Plus, 
  LayoutGrid, 
  List as ListIcon, 
  Funnel, 
  Search, 
  X, 
  Maximize2, 
  Sparkles, 
  Palette,
  ChevronsUpDown,
  Check
} from "lucide-react";
import {
  Button,
  EmptyState,
  SegmentedControl,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
import { PipelineBoard } from "./board/pipeline-board";
import { CreatePipelineModal } from "./create-pipeline-modal";
import { CreateStageModal } from "./create-stage-modal";
import { AddLeadModal, ConnectedAccount } from "./add-lead-modal";
import { ApplyTagsModal } from "./apply-tags-modal";
import { TagManagerModal } from "./tag-manager-modal";
import { getTagsAction } from "../actions/tag.actions";
import { getConnectionsAction } from "@/features/integrations/actions/connection.actions";
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

export function CRMClient({ 
  tenantId, 
  initialPipelines, 
  initialStages, 
  initialDeals, 
  initialContacts, 
  memberships = [], 
  sessionToken 
}: CRMClientProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados locais sincronizados
  const [pipelines, setPipelines] = useState<CrmPipeline[]>(initialPipelines);
  const [stagesMap, setStagesMap] = useState<Record<string, CrmPipelineStage[]>>(initialStages);
  const [dealsMap, setDealsMap] = useState<Record<string, CrmDeal[]>>(initialDeals);
  const [contactsList, setContactsList] = useState<CrmContact[]>(initialContacts);
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const storageKey = `bipesend_crm_last_pipeline_${tenantId}`;

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && initialPipelines.some(p => p.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return initialPipelines.length > 0 ? initialPipelines[0].id : null;
  });

  const handleSelectPipeline = useCallback((pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, pipelineId);
      } catch {}
    }
  }, [storageKey]);

  // Estados dos modais
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [stageToEdit, setStageToEdit] = useState<CrmPipelineStage | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeStageForLead, setActiveStageForLead] = useState<CrmPipelineStage | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isApplyTagsOpen, setIsApplyTagsOpen] = useState(false);
  const [activeStageForTags, setActiveStageForTags] = useState<CrmPipelineStage | null>(null);

  // Carrega tags do workspace
  const fetchTags = useCallback(async () => {
    const res = await getTagsAction(tenantId);
    if (res.success && res.data) {
      setTags(res.data);
    }
  }, [tenantId]);

  // Carrega conexões para os seletores de Instagram / TikTok no AddLeadModal
  const fetchConnections = useCallback(async () => {
    const res = await getConnectionsAction();
    if (res.success && Array.isArray(res.data)) {
      setConnectedAccounts(res.data);
    }
  }, []);

  useEffect(() => {
    fetchTags();
    fetchConnections();
  }, [fetchTags, fetchConnections]);

  const contactsMap = useMemo(() => {
    return new Map(contactsList.map(c => [c.id, c]));
  }, [contactsList]);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const stages = selectedPipelineId ? (stagesMap[selectedPipelineId] || []) : [];
  const baseDeals = selectedPipelineId ? (dealsMap[selectedPipelineId] || []) : [];

  // Busca em tempo real por: Nome do cliente, Título, E-mail, CPF ou Telefone
  const filteredDeals = useMemo(() => {
    if (!searchTerm.trim()) return baseDeals;

    const term = searchTerm.toLowerCase().trim();
    const digitsOnly = term.replace(/\D/g, "");

    return baseDeals.filter((deal) => {
      // 1. Título da oportunidade
      if (deal.title.toLowerCase().includes(term)) return true;

      // 2. Contato vinculado (nome, email, telefone, cpf em customFields)
      const contact = deal.contactId ? contactsMap.get(deal.contactId) : null;
      if (contact) {
        if (contact.name.toLowerCase().includes(term)) return true;
        if (contact.email && contact.email.toLowerCase().includes(term)) return true;

        if (digitsOnly && digitsOnly.length >= 3) {
          const phoneClean = (contact.phone || contact.phoneE164 || "").replace(/\D/g, "");
          if (phoneClean.includes(digitsOnly)) return true;
        }

        if (contact.customFields) {
          const custom = contact.customFields as Record<string, unknown>;
          const customStr = JSON.stringify(custom).toLowerCase();
          if (customStr.includes(term)) return true;
          if (digitsOnly && digitsOnly.length >= 3) {
            const customDigits = customStr.replace(/\D/g, "");
            if (customDigits.includes(digitsOnly)) return true;
          }
        }
      }

      return false;
    });
  }, [baseDeals, searchTerm, contactsMap]);

  const handleOpenFocusMode = () => {
    if (typeof window !== "undefined") {
      window.open(`${window.location.pathname}?focus=true`, "_blank");
    }
  };

  // Callbacks de modais
  const handlePipelineCreated = (newPipeline: CrmPipeline, initialStagesList?: CrmPipelineStage[]) => {
    setPipelines(prev => [...prev, newPipeline]);
    if (initialStagesList && initialStagesList.length > 0) {
      setStagesMap(prev => ({
        ...prev,
        [newPipeline.id]: initialStagesList,
      }));
    } else {
      setStagesMap(prev => ({
        ...prev,
        [newPipeline.id]: [],
      }));
    }
    setDealsMap(prev => ({
      ...prev,
      [newPipeline.id]: [],
    }));
    setSelectedPipelineId(newPipeline.id);
  };

  const handleStageSaved = (savedStage: CrmPipelineStage, isEdit: boolean) => {
    if (!selectedPipelineId) return;
    setStagesMap(prev => {
      const currentList = prev[selectedPipelineId] || [];
      if (isEdit) {
        return {
          ...prev,
          [selectedPipelineId]: currentList.map(s => s.id === savedStage.id ? savedStage : s),
        };
      }
      return {
        ...prev,
        [selectedPipelineId]: [...currentList, savedStage],
      };
    });
  };

  const handleDealsCreated = (newDeals: CrmDeal[], newContacts?: CrmContact[]) => {
    if (!selectedPipelineId) return;
    if (newDeals.length > 0) {
      setDealsMap(prev => ({
        ...prev,
        [selectedPipelineId]: [...(prev[selectedPipelineId] || []), ...newDeals],
      }));
    }
    if (newContacts && newContacts.length > 0) {
      setContactsList(prev => [...prev, ...newContacts]);
    }
  };

  const handleOpenAddLead = (stage: CrmPipelineStage) => {
    setActiveStageForLead(stage);
    setIsAddLeadOpen(true);
  };

  const handleOpenApplyTags = (stage: CrmPipelineStage) => {
    setActiveStageForTags(stage);
    setIsApplyTagsOpen(true);
  };

  const handleOpenEditStageColor = (stage: CrmPipelineStage) => {
    setStageToEdit(stage);
    setIsCreateStageOpen(true);
  };

  const handleOpenCreateStage = () => {
    setStageToEdit(null);
    setIsCreateStageOpen(true);
  };

  return (
    <div className="crm-shell">
      {/* ── Compact Header & Toolbar ── */}
      <div className="crm-top-bar">
        {/* Left: Funnel control, animated Create Funnel button, Add Flow */}
        <div className="crm-top-start">
          {/* Seletor de Funil no Estilo Workspace com Menu e Criar Funil no Topo */}
          <DropdownMenu>
            <DropdownMenuTrigger className="crm-funnel-trigger" aria-label="Selecionar funil">
              <div className="crm-funnel-trigger-icon" title="Funil comercial">
                <Funnel className="w-4 h-4 text-[#007BFF]" aria-hidden="true" />
              </div>
              <div className="crm-funnel-copy">
                <span>Funil</span>
                <strong>{selectedPipeline ? selectedPipeline.name : "Nenhum funil"}</strong>
              </div>
              <ChevronsUpDown className="crm-funnel-chevrons" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="crm-funnel-menu">
              {/* Botão de criar pipeline no topo */}
              <DropdownMenuItem
                onSelect={() => setIsCreatePipelineOpen(true)}
                className="crm-funnel-menu-create-item group"
              >
                <div className="crm-funnel-menu-create-icon">
                  <Plus className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div className="crm-funnel-menu-create-copy">
                  <strong>Criar novo funil</strong>
                  <span>Adicionar novo fluxo de vendas</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="crm-funnel-menu-label">
                Funis disponíveis ({pipelines.length})
              </DropdownMenuLabel>

              {/* Lista de pipelines com scroll interno após 5 itens */}
              <div className="crm-funnel-menu-list">
                {pipelines.length > 0 ? (
                  pipelines.map((p) => {
                    const isSelected = p.id === selectedPipelineId;
                    const stageCount = stagesMap[p.id]?.length || 0;
                    return (
                      <DropdownMenuItem
                        key={p.id}
                        onSelect={() => handleSelectPipeline(p.id)}
                        className={`crm-funnel-menu-item ${isSelected ? "is-selected" : ""}`}
                      >
                        <div className="crm-funnel-item-left">
                          <div className="crm-funnel-item-icon">
                            <Funnel className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>
                          <div className="crm-funnel-item-copy">
                            <strong>{p.name}</strong>
                            <span>{stageCount} {stageCount === 1 ? "etapa" : "etapas"}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#007BFF] shrink-0 crm-check-icon" aria-hidden="true" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="crm-funnel-menu-empty">
                    Nenhum funil cadastrado
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Expandable Search, View Switcher & Focus Mode */}
        <div className="crm-top-end">
          {/* Animated Expandable Search */}
          <div className={`crm-search-box ${isSearchExpanded || searchTerm ? "is-expanded" : ""}`}>
            <button
              type="button"
              className="crm-search-trigger"
              onClick={() => {
                setIsSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              title="Pesquisar por cliente, e-mail, CPF ou telefone"
              aria-label="Pesquisar por cliente, e-mail, CPF ou telefone"
            >
              <Search className="w-4 h-4 text-slate-500" />
            </button>

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, e-mail, CPF ou fone..."
              className="crm-search-input"
              onBlur={() => {
                if (!searchTerm) setIsSearchExpanded(false);
              }}
            />

            {searchTerm && (
              <button
                type="button"
                className="crm-search-clear"
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <SegmentedControl
            label="Visualização do CRM"
            value={viewMode}
            onValueChange={(val) => setViewMode(val)}
            items={[
              {
                value: "kanban",
                label: "Quadro",
                icon: <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />,
              },
              {
                value: "list",
                label: "Lista",
                icon: <ListIcon className="w-3.5 h-3.5" aria-hidden="true" />,
              },
            ]}
          />

          {/* Expand to focus mode in new tab */}
          <button
            type="button"
            className="crm-focus-btn"
            onClick={handleOpenFocusMode}
            title="Modo Foco em nova guia (tela cheia sem cabeçalhos)"
            aria-label="Modo Foco em nova guia"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* ── CRM Main Content ── */}
      <div className="crm-content">
        {selectedPipeline ? (
          <PipelineBoard 
            key={selectedPipeline.id}
            tenantId={tenantId} 
            pipeline={selectedPipeline} 
            stages={stages} 
            deals={filteredDeals} 
            contacts={contactsList}
            tags={tags}
            memberships={memberships}
            viewMode={viewMode}
            sessionToken={sessionToken}
            onAddCards={handleOpenAddLead}
            onConfigureTags={() => setIsTagManagerOpen(true)}
            onApplyTags={handleOpenApplyTags}
            onCreatePipeline={() => setIsCreatePipelineOpen(true)}
            onEditStageColor={handleOpenEditStageColor}
            onCreateStage={handleOpenCreateStage}
          />
        ) : (
          <EmptyState
            title="Crie seu primeiro funil"
            description="Organize as etapas comerciais antes de adicionar oportunidades ao CRM."
            action={
              <Button size="md" onClick={() => setIsCreatePipelineOpen(true)}>
                <Plus aria-hidden="true" /> Criar funil
              </Button>
            }
          />
        )}
      </div>

      {/* ── Modais do CRM ── */}
      {/* 1. Modal Inline de Criar Funil */}
      <CreatePipelineModal
        isOpen={isCreatePipelineOpen}
        onClose={() => setIsCreatePipelineOpen(false)}
        tenantId={tenantId}
        onPipelineCreated={handlePipelineCreated}
      />

      {/* 2. Modal Inline de Criar / Editar Fluxo (Etapa) com Cores */}
      {selectedPipeline && (
        <CreateStageModal
          isOpen={isCreateStageOpen}
          onClose={() => {
            setIsCreateStageOpen(false);
            setStageToEdit(null);
          }}
          tenantId={tenantId}
          pipelineId={selectedPipeline.id}
          stageToEdit={stageToEdit}
          existingCount={stages.length}
          onStageSaved={handleStageSaved}
        />
      )}

      {/* 3. Modal Inteligente de Adicionar Leads (Omnichannel) */}
      {selectedPipeline && activeStageForLead && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => {
            setIsAddLeadOpen(false);
            setActiveStageForLead(null);
          }}
          tenantId={tenantId}
          pipelineId={selectedPipeline.id}
          stage={activeStageForLead}
          allContacts={contactsList}
          connectedAccounts={connectedAccounts}
          onDealsCreated={handleDealsCreated}
        />
      )}

      {/* 4. Modal de Configurar Etiquetas (Workspace / Funil) */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        setIsOpen={setIsTagManagerOpen}
        tenantId={tenantId}
      />

      {/* 5. Modal de Aplicar Etiquetas aos Cards do Fluxo */}
      {selectedPipeline && activeStageForTags && (
        <ApplyTagsModal
          isOpen={isApplyTagsOpen}
          onClose={() => {
            setIsApplyTagsOpen(false);
            setActiveStageForTags(null);
          }}
          tenantId={tenantId}
          stageName={activeStageForTags.name}
          deals={baseDeals.filter(d => d.stageId === activeStageForTags.id)}
          contacts={contactsList}
          availableTags={tags}
          onOpenTagManager={() => setIsTagManagerOpen(true)}
          onTagsApplied={fetchTags}
        />
      )}
    </div>
  );
}
