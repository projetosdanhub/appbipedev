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
  Check,
  Archive,
  FolderArchive
} from "lucide-react";
import {
  Button,
  EmptyState,
  SegmentedControl,
} from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
import { PipelineBoard } from "./board/pipeline-board";
import { CreatePipelineInline } from "./create-pipeline-inline";
import { CreateStageModal } from "./create-stage-modal";
import { AddLeadModal, ConnectedAccount } from "./add-lead-modal";
import { ApplyTagsModal } from "./apply-tags-modal";
import { TagManagerModal } from "./tag-manager-modal";
import { DeleteStageModal } from "./delete-stage-modal";
import { ArchivePipelineModal } from "./archive-pipeline-modal";
import { ArchivedPipelinesModal } from "./archived-pipelines-modal";
import { OmnichannelFilter } from "./omnichannel-filter";
import { isOmnichannelPipeline } from "../utils/omnichannel";
import { getTagsAction } from "../actions/tag.actions";
import { deletePipelineStageAction } from "../actions/stage.actions";
import { getConnectionsAction } from "@/features/integrations/actions/connection.actions";
import { toast } from "sonner";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtro de conexões omnichannel ativas
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);

  // Controle de estado do seletor de funil
  const [isFunnelOpen, setIsFunnelOpen] = useState(false);
  const funnelContainerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown do funil ao clicar fora do container do seletor
  useEffect(() => {
    if (!isFunnelOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        funnelContainerRef.current &&
        !funnelContainerRef.current.contains(e.target as Node)
      ) {
        setIsFunnelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isFunnelOpen]);

  // Estados locais sincronizados
  const [pipelines, setPipelines] = useState<CrmPipeline[]>(initialPipelines);
  const [stagesMap, setStagesMap] = useState<Record<string, CrmPipelineStage[]>>(initialStages);
  const [dealsMap, setDealsMap] = useState<Record<string, CrmDeal[]>>(initialDeals);
  const [contactsList, setContactsList] = useState<CrmContact[]>(initialContacts);
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const storageKey = `bipesend_crm_last_pipeline_${tenantId}`;
  const defaultPipelineStorageKey = `bipesend_crm_default_pipeline_${tenantId}`;

  const [defaultPipelineId, setDefaultPipelineId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(defaultPipelineStorageKey);
      } catch {}
    }
    return initialPipelines.length > 0 ? initialPipelines[0].id : null;
  });

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    () => (initialPipelines.length > 0 ? initialPipelines[0].id : null)
  );

  // Sincroniza com o último funil acessado e com o funil padrão
  useEffect(() => {
    try {
      const savedDefault = localStorage.getItem(defaultPipelineStorageKey);
      if (savedDefault && initialPipelines.some((p) => p.id === savedDefault)) {
        setDefaultPipelineId(savedDefault);
      } else if (initialPipelines.length > 0) {
        setDefaultPipelineId(initialPipelines[0].id);
      }

      const savedSelected = localStorage.getItem(storageKey);
      if (savedSelected && initialPipelines.some((p) => p.id === savedSelected)) {
        setSelectedPipelineId(savedSelected);
      } else if (savedDefault && initialPipelines.some((p) => p.id === savedDefault)) {
        setSelectedPipelineId(savedDefault);
      }
    } catch {}
  }, [storageKey, defaultPipelineStorageKey, initialPipelines]);

  const handleSelectPipeline = useCallback((pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, pipelineId);
      } catch {}
    }
  }, [storageKey]);

  const handleSetDefaultPipeline = useCallback((pipelineId: string) => {
    setDefaultPipelineId(pipelineId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(defaultPipelineStorageKey, pipelineId);
      } catch {}
    }
  }, [defaultPipelineStorageKey]);

  // Estados dos modais
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [stageToEdit, setStageToEdit] = useState<CrmPipelineStage | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeStageForLead, setActiveStageForLead] = useState<CrmPipelineStage | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isApplyTagsOpen, setIsApplyTagsOpen] = useState(false);
  const [activeStageForTags, setActiveStageForTags] = useState<CrmPipelineStage | null>(null);
  const [isDeleteStageOpen, setIsDeleteStageOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<CrmPipelineStage | null>(null);

  // Estados para arquivamento e recuperação de funis comerciais
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [pipelineToArchive, setPipelineToArchive] = useState<CrmPipeline | null>(null);
  const [isArchivedListOpen, setIsArchivedListOpen] = useState(false);

  // Filtra pipelines ativos e arquivados
  const activePipelines = useMemo(
    () => pipelines.filter((p) => p.status !== "archived"),
    [pipelines]
  );
  const archivedPipelines = useMemo(
    () => pipelines.filter((p) => p.status === "archived"),
    [pipelines]
  );

  // Sincroniza o funil selecionado garantindo que seja um funil ativo
  const selectedPipeline = useMemo(() => {
    return activePipelines.find((p) => p.id === selectedPipelineId) || activePipelines[0] || null;
  }, [activePipelines, selectedPipelineId]);

  useEffect(() => {
    if (activePipelines.length > 0) {
      if (!selectedPipelineId || !activePipelines.some((p) => p.id === selectedPipelineId)) {
        const nextId =
          defaultPipelineId && activePipelines.some((p) => p.id === defaultPipelineId)
            ? defaultPipelineId
            : activePipelines[0].id;
        setSelectedPipelineId(nextId);
      }
    } else {
      setSelectedPipelineId(null);
    }
  }, [activePipelines, selectedPipelineId, defaultPipelineId]);

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

  const stages = selectedPipelineId ? (stagesMap[selectedPipelineId] || []) : [];
  const baseDeals = selectedPipelineId ? (dealsMap[selectedPipelineId] || []) : [];

  // Filtro de deals por conexões omnichannel e busca em tempo real
  const filteredDeals = useMemo(() => {
    let deals = baseDeals;

    // 1. Filtragem por Conexões Omnichannel selecionadas
    if (selectedConnectionIds.length > 0) {
      const selectedConns = connectedAccounts.filter(c => selectedConnectionIds.includes(c.id));
      const selectedProviders = new Set(selectedConns.map(c => c.provider.toLowerCase()));
      const selectedInstanceNames = new Set(selectedConns.map(c => (c.instanceName || "").toLowerCase()).filter(Boolean));
      const selectedUsernames = new Set(selectedConns.map(c => (c.username || "").toLowerCase()).filter(Boolean));
      const selectedPhones = new Set(selectedConns.map(c => (c.phone || "").replace(/\D/g, "")).filter(Boolean));

      deals = deals.filter(deal => {
        const contact = deal.contactId ? contactsMap.get(deal.contactId) : null;
        if (!contact) return false;

        const custom = (contact.customFields as Record<string, unknown>) || {};
        const contactSource = (contact.source || custom.channel || "").toString().toLowerCase();
        const contactConnId = (custom.connectionId || "").toString();
        const contactInstance = (custom.instanceName || "").toString().toLowerCase();
        const contactUsername = (custom.instagram || custom.tiktok || custom.socialHandle || "").toString().toLowerCase();
        const contactPhone = (contact.phone || "").replace(/\D/g, "");

        // Match direto por ID de conexão
        if (contactConnId && selectedConnectionIds.includes(contactConnId)) return true;

        // Match por provider/canal
        if (contactSource) {
          if (selectedProviders.has(contactSource)) return true;
          if (contactSource === "whatsapp" && selectedProviders.has("evolution_api")) return true;
        }

        // Match por nome da instância, @handle ou telefone
        if (contactInstance && selectedInstanceNames.has(contactInstance)) return true;
        if (contactUsername && selectedUsernames.has(contactUsername)) return true;
        if (contactPhone && selectedPhones.has(contactPhone)) return true;

        return false;
      });
    }

    // 2. Filtragem por Termo de Busca (Nome, Título, E-mail, CPF, Fone)
    if (!searchTerm.trim()) return deals;

    const term = searchTerm.toLowerCase().trim();
    const digitsOnly = term.replace(/\D/g, "");

    return deals.filter((deal) => {
      // Título da oportunidade
      if (deal.title.toLowerCase().includes(term)) return true;

      // Contato vinculado (nome, email, telefone, cpf em customFields)
      const contact = deal.contactId ? contactsMap.get(deal.contactId) : null;
      if (contact) {
        if (contact.name.toLowerCase().includes(term)) return true;
        if (contact.email && contact.email.toLowerCase().includes(term)) return true;

        if (digitsOnly && digitsOnly.length >= 3) {
          const phoneClean = (contact.phone || "").replace(/\D/g, "");
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
  }, [baseDeals, selectedConnectionIds, connectedAccounts, searchTerm, contactsMap]);

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

  // Callbacks de arquivamento e restauração de funis
  const handlePipelineArchived = useCallback((archivedId: string) => {
    setPipelines((prev) =>
      prev.map((p) => (p.id === archivedId ? { ...p, status: "archived" as const } : p))
    );
  }, []);

  const handlePipelineRestored = useCallback((restoredId: string) => {
    setPipelines((prev) =>
      prev.map((p) => (p.id === restoredId ? { ...p, status: "active" as const } : p))
    );
    setSelectedPipelineId(restoredId);
  }, []);

  const handleOpenDeleteStage = async (stage: CrmPipelineStage) => {
    if (!selectedPipelineId) return;

    const currentStages = stagesMap[selectedPipelineId] || [];
    // Se for o único fluxo do funil, abre o modal que avisa que não pode ser excluído
    if (currentStages.length <= 1) {
      setStageToDelete(stage);
      setIsDeleteStageOpen(true);
      return;
    }

    const currentDeals = dealsMap[selectedPipelineId] || [];
    const dealsCount = currentDeals.filter(d => d.stageId === stage.id).length;

    // Se NÃO tiver nenhum card, exclui diretamente sem popup
    if (dealsCount === 0) {
      const toastId = toast.loading(`Excluindo fluxo "${stage.name}"...`);
      try {
        const res = await deletePipelineStageAction(tenantId, selectedPipelineId, stage.id);
        if (!res.success) {
          const errMsg = typeof res.message === "string" ? res.message : (res.message as any)?.message || "Erro ao excluir fluxo.";
          toast.error(errMsg, { id: toastId });
          return;
        }
        toast.success(`Fluxo "${stage.name}" excluído com sucesso!`, { id: toastId });
        handleStageDeleted(stage.id);
      } catch {
        toast.error("Erro inesperado ao excluir fluxo.", { id: toastId });
      }
      return;
    }

    // Se TIVER cards, abre o modal de transferência obrigatória
    setStageToDelete(stage);
    setIsDeleteStageOpen(true);
  };

  const handleStageDeleted = (deletedStageId: string, transferToStageId?: string) => {
    if (!selectedPipelineId) return;

    // Remove o fluxo excluído da lista de etapas ativas
    setStagesMap(prev => ({
      ...prev,
      [selectedPipelineId]: (prev[selectedPipelineId] || []).filter(s => s.id !== deletedStageId),
    }));

    // Se houve transferência para outro fluxo, atualiza os deals no estado local imediatamente
    if (transferToStageId) {
      setDealsMap(prev => {
        const currentDeals = prev[selectedPipelineId] || [];
        return {
          ...prev,
          [selectedPipelineId]: currentDeals.map(d =>
            d.stageId === deletedStageId ? { ...d, stageId: transferToStageId } : d
          ),
        };
      });
    }
  };

  return (
    <div className="crm-shell">
      {/* ── Compact Header & Toolbar com Gaveta de Funil ── */}
      <div className="crm-top-bar-wrapper">
        <div className="crm-top-bar">
          {/* Left: Funnel control, animated Create Funnel button, Add Flow */}
          <div className="crm-top-start">
            {/* Seletor de Funil no Estilo Workspace com Menu e Criar Funil no Topo */}
            <div className="relative" ref={funnelContainerRef}>
              <button
                type="button"
                className={`crm-funnel-trigger ${isFunnelOpen && !isCreatePipelineOpen ? "is-open" : ""}`} 
                onClick={() => setIsFunnelOpen((prev) => !prev)}
                aria-expanded={isFunnelOpen && !isCreatePipelineOpen}
                aria-label="Selecionar funil"
                title={selectedPipeline ? `Funil: ${selectedPipeline.name}` : "Selecionar funil"}
              >
                <div 
                  className={`crm-funnel-trigger-icon ${isFunnelOpen && !isCreatePipelineOpen ? "is-spinning" : ""}`} 
                  title="Funil comercial"
                >
                  <Funnel className="w-4 h-4 text-[#007BFF]" aria-hidden="true" />
                </div>
                <div className="crm-funnel-copy">
                  <div className="flex items-center gap-1.5">
                    <span>Funil</span>
                    {isOmnichannelPipeline(selectedPipeline) && (
                      <span className="crm-funnel-omnichannel-badge">Omnichannel</span>
                    )}
                  </div>
                  <strong title={selectedPipeline ? selectedPipeline.name : "Nenhum funil"}>
                    {selectedPipeline ? selectedPipeline.name : "Nenhum funil"}
                  </strong>
                </div>
              </button>

              {isFunnelOpen && !isCreatePipelineOpen && (
                <div className="crm-funnel-menu-dropdown">
                  <div className="crm-funnel-menu" role="menu">
                    {/* Botão de criar pipeline no topo */}
                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => {
                        setIsFunnelOpen(false);
                        setIsCreatePipelineOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setIsFunnelOpen(false);
                          setIsCreatePipelineOpen(true);
                        }
                      }}
                      className="crm-funnel-menu-create-item group"
                    >
                      <div className="crm-funnel-menu-create-icon">
                        <Plus className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      <div className="crm-funnel-menu-create-copy">
                        <strong>Criar novo funil</strong>
                        <span>Adicionar novo fluxo de vendas</span>
                      </div>
                    </div>

                    <div className="crm-funnel-menu-separator" />

                    <div className="crm-funnel-menu-label flex items-center justify-between">
                      <span>Funis ({activePipelines.length})</span>
                      <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        1 Principal + {Math.max(0, activePipelines.length - 1)} adicionais
                      </span>
                    </div>

                    {/* Lista de pipelines com scroll interno após 5 itens */}
                    <div className="crm-funnel-menu-list">
                      {activePipelines.length > 0 ? (
                        activePipelines.map((p) => {
                          const isSelected = p.id === (selectedPipeline ? selectedPipeline.id : selectedPipelineId);
                          const stageCount = stagesMap[p.id]?.length || 0;
                          const isOmni = isOmnichannelPipeline(p) || Boolean(p.isDefault);
                          const canArchiveThis = p.id !== defaultPipelineId && activePipelines.length > 1 && !isOmni && !p.isDefault;
                          return (
                            <div
                              key={p.id}
                              role="menuitem"
                              tabIndex={0}
                              onClick={() => {
                                handleSelectPipeline(p.id);
                                setIsFunnelOpen(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleSelectPipeline(p.id);
                                  setIsFunnelOpen(false);
                                }
                              }}
                              className={`crm-funnel-menu-item ${isSelected ? "is-selected" : ""}`}
                            >
                              <div className="crm-funnel-item-left">
                                <div className="crm-funnel-item-icon">
                                  <Funnel className="w-3.5 h-3.5" aria-hidden="true" />
                                </div>
                                <div className="crm-funnel-item-copy">
                                  <div className="flex items-center gap-1.5">
                                    <strong>{p.name}</strong>
                                    {isOmni ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Funil Principal do Sistema (Incluso e Gratuito)">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Principal Gratuito
                                      </span>
                                    ) : p.id === defaultPipelineId ? (
                                      <span className="crm-funnel-default-badge" title="Funil Padrão do CRM">
                                        Padrão
                                      </span>
                                    ) : null}
                                  </div>
                                  <span>{stageCount} {stageCount === 1 ? "etapa" : "etapas"}</span>
                                </div>
                              </div>

                              <div className="crm-funnel-item-actions">
                                {canArchiveThis && (
                                  <button
                                    type="button"
                                    className="crm-funnel-item-archive-btn"
                                    title={`Arquivar funil "${p.name}"`}
                                    aria-label={`Arquivar funil "${p.name}"`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPipelineToArchive(p);
                                      setIsArchiveModalOpen(true);
                                      setIsFunnelOpen(false);
                                    }}
                                  >
                                    <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                )}
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#007BFF] shrink-0 crm-check-icon" aria-hidden="true" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="crm-funnel-menu-empty">
                          Nenhum funil encontrado
                        </div>
                      )}
                    </div>

                    {/* Se houver funis arquivados, exibe o botão para abrir a lista de recuperação */}
                    {archivedPipelines.length > 0 && (
                      <>
                        <div className="crm-funnel-menu-separator" />
                        <button
                          type="button"
                          className="crm-funnel-menu-archived-btn"
                          onClick={() => {
                            setIsFunnelOpen(false);
                            setIsArchivedListOpen(true);
                          }}
                        >
                          <FolderArchive className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          <span>Funis Arquivados ({archivedPipelines.length})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Center: View Switcher (Kanban e Lista no meio) */}
        <div className="crm-top-center">
          <SegmentedControl
            label="Visualização do CRM"
            value={viewMode}
            onValueChange={(val) => setViewMode(val)}
            items={[
              {
                value: "kanban",
                label: "Kanban",
                icon: <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />,
              },
              {
                value: "list",
                label: "Lista",
                icon: <ListIcon className="w-3.5 h-3.5" aria-hidden="true" />,
              },
            ]}
          />
        </div>

        {/* Right: Omnichannel Filter + Search Box */}
        <div className="crm-top-end">
          <OmnichannelFilter
            connections={connectedAccounts}
            selectedConnectionIds={selectedConnectionIds}
            onChange={setSelectedConnectionIds}
          />

          <div className="crm-search-box">
            <div className="crm-search-trigger" aria-hidden="true">
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, e-mail, CPF ou fone..."
              className="crm-search-input"
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
        </div>
      </div>

        {/* ── Aba Expansível do Cabeçalho: Criar Novo Funil Comercial ── */}
        {isCreatePipelineOpen && (
          <CreatePipelineInline
            tenantId={tenantId}
            existingPipelines={pipelines}
            defaultPipelineId={defaultPipelineId}
            onClose={() => setIsCreatePipelineOpen(false)}
            onPipelineCreated={handlePipelineCreated}
            onSetDefaultPipeline={handleSetDefaultPipeline}
          />
        )}
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
            onStageSaved={handleStageSaved}
            onDeleteStage={handleOpenDeleteStage}
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
      {/* Modal Inline de Criar / Editar Fluxo (Etapa) com Cores */}
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

      {/* 6. Modal de Exclusão de Fluxo com Transferência Obrigatória de Cards */}
      {selectedPipeline && stageToDelete && (
        <DeleteStageModal
          isOpen={isDeleteStageOpen}
          onClose={() => {
            setIsDeleteStageOpen(false);
            setStageToDelete(null);
          }}
          tenantId={tenantId}
          pipelineId={selectedPipeline.id}
          stage={stageToDelete}
          allStages={stages}
          dealsCount={(dealsMap[selectedPipeline.id] || []).filter(d => d.stageId === stageToDelete.id).length}
          onStageDeleted={handleStageDeleted}
        />
      )}

      {/* 7. Modal de Arquivar Funil Comercial (Preservação Total de Dados) */}
      <ArchivePipelineModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setPipelineToArchive(null);
        }}
        tenantId={tenantId}
        pipeline={pipelineToArchive}
        activePipelines={activePipelines}
        defaultPipelineId={defaultPipelineId}
        dealsCount={pipelineToArchive ? (dealsMap[pipelineToArchive.id] || []).length : 0}
        stagesMap={stagesMap}
        onPipelineArchived={handlePipelineArchived}
      />

      {/* 8. Modal de Funis Arquivados (Restauração e Recuperação) */}
      <ArchivedPipelinesModal
        isOpen={isArchivedListOpen}
        onClose={() => setIsArchivedListOpen(false)}
        tenantId={tenantId}
        archivedPipelines={archivedPipelines}
        stagesMap={stagesMap}
        dealsMap={dealsMap}
        onPipelineRestored={handlePipelineRestored}
      />
    </div>
  );
}
