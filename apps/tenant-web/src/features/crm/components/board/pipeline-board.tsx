"use client";

import { useState, useTransition, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
import { Button } from "@bipesend/ui";
import { BoardColumn } from "./board-column";
import { ContactsColumn } from "./contacts-column";
import { PipelineList } from "./pipeline-list";
import { DealEditorModal } from "../deal-editor-modal";
import { moveDealAction, createDealFromContactAction, updateDealAction } from "../../actions/deal.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/useRealtime";
import type { CrmMembershipOption } from "../../types";

interface PipelineBoardProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  tags?: CrmTag[];
  memberships?: CrmMembershipOption[];
  viewMode: "kanban" | "list";
  sessionToken?: string;
  onAddCards?: (stage: CrmPipelineStage) => void;
  onConfigureTags?: () => void;
  onApplyTags?: (stage: CrmPipelineStage) => void;
  onCreatePipeline?: () => void;
  onEditStageColor?: (stage: CrmPipelineStage) => void;
  onCreateStage?: () => void;
}

export function PipelineBoard({ 
  tenantId, 
  pipeline, 
  stages, 
  deals: initialDeals, 
  contacts, 
  tags = [],
  memberships, 
  viewMode, 
  sessionToken,
  onAddCards,
  onConfigureTags,
  onApplyTags,
  onCreatePipeline,
  onEditStageColor,
  onCreateStage,
}: PipelineBoardProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<CrmDeal[]>(initialDeals);
  const [contactsState, setContactsState] = useState<CrmContact[]>(contacts || []);
  
  useRealtime({
    tenantId: tenantId,
    token: sessionToken || "",
    onEvent: (event) => {
      if (event === "crm.deal.changed") {
        router.refresh();
      }
    }
  });
  
  useEffect(() => {
    // The server component owns the canonical snapshot after refresh/realtime.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeals(initialDeals);
  }, [initialDeals]);

  useEffect(() => {
    // Keep the draggable inbox aligned with the latest server snapshot.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (contacts) setContactsState(contacts);
  }, [contacts]);

  const [, startTransition] = useTransition();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CrmDeal | null>(null);
  
  // Para lidar com o modal de regras quando falta algum requiredField ao arrastar
  const [pendingMove, setPendingMove] = useState<{ deal: CrmDeal, toStageId: string } | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const fromStageId = source.droppableId;
    const toStageId = destination.droppableId;

    if (fromStageId === 'contacts-inbox') {
      const contactId = draggableId.replace('contact-', '');
      if (toStageId === 'contacts-inbox') return;

      const contact = contactsState.find(c => c.id === contactId);
      if (!contact) return;

      // Otimisticamente cria o deal e remove o contact da lista
      const tempDeal: CrmDeal = {
        id: `temp-${contactId}-${toStageId}`,
        tenantId,
        contactId,
        pipelineId: pipeline.id,
        stageId: toStageId,
        title: `Negócio de ${contact.name}`,
        amount: "0.00",
        currency: pipeline.defaultCurrency,
        expectedCloseDate: null,
        closedAt: null,
        lostReason: null,
        departmentId: null,
        routingRoleId: null,
        assignedMembershipId: null,
        createdByMembershipId: "temp",
        updatedByMembershipId: "temp",
        version: 1,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDeals([...deals, tempDeal]);
      setContactsState(current => current.filter(c => c.id !== contactId));

      startTransition(async () => {
        const result = await createDealFromContactAction(tenantId, pipeline.id, toStageId, contactId, contact.name);
        if (result.success) {
          toast.success("Negócio criado com sucesso");
          setDeals(current => current.map(d => d.id === tempDeal.id ? result.data as CrmDeal : d));
        } else {
          toast.error(result.message);
          setDeals(current => current.filter(d => d.id !== tempDeal.id));
          setContactsState(current => [contact, ...current]);
        }
      });
      return;
    }

    const draggedDeal = deals.find(d => d.id === draggableId);
    if (!draggedDeal) return;

    // Checar regras de transição de estágio
    const destStage = stages.find(s => s.id === toStageId);
    const rules = destStage?.requiredFieldRules?.rules || [];
    
    // Se a etapa destino tem regras obrigatórias, verifica antes de mover
    if (rules.length > 0) {
      setPendingMove({ deal: draggedDeal, toStageId });
      setIsEditorOpen(true);
      return;
    }

    // Se não tem regras, move direto otimisticamente
    const updatedDeals = deals.map(d => 
      d.id === draggedDeal.id ? { ...d, stageId: toStageId } : d
    );
    setDeals(updatedDeals);

    startTransition(async () => {
      const result = await moveDealAction(tenantId, pipeline.id, draggedDeal.id, {
        expectedVersion: draggedDeal.version,
        toStageId: toStageId,
      });

      if (!result.success) {
        toast.error(result.message);
        setDeals(deals); // Reverte optimismo
      } else {
        toast.success(result.message);
        setDeals(currentDeals => 
          currentDeals.map(d => d.id === draggedDeal.id ? { ...d, ...result.data } as CrmDeal : d)
        );
      }
    });
  };

  const handleMoveStage = (deal: CrmDeal, toStageId: string) => {
    const destStage = stages.find(s => s.id === toStageId);
    const rules = destStage?.requiredFieldRules?.rules || [];
    if (rules.length > 0) {
      setPendingMove({ deal, toStageId });
      setIsEditorOpen(true);
      return;
    }

    const updatedDeals = deals.map(d => d.id === deal.id ? { ...d, stageId: toStageId } : d);
    setDeals(updatedDeals);

    startTransition(async () => {
      const result = await moveDealAction(tenantId, pipeline.id, deal.id, {
        expectedVersion: deal.version,
        toStageId,
      });
      if (!result.success) {
        toast.error(result.message);
        setDeals(deals);
      } else {
        toast.success(result.message);
        setDeals(currentDeals => 
          currentDeals.map(d => d.id === deal.id ? { ...d, ...result.data } as CrmDeal : d)
        );
      }
    });
  };

  const handleAssignDeal = (deal: CrmDeal, membershipId: string | null) => {
    const updatedDeals = deals.map(d => 
      d.id === deal.id ? { ...d, assignedMembershipId: membershipId } : d
    );
    setDeals(updatedDeals);

    startTransition(async () => {
      const result = await updateDealAction(tenantId, pipeline.id, deal.id, {
        assignedMembershipId: membershipId,
      });

      if (!result.success) {
        toast.error(result.message);
        setDeals(deals); // Reverte optimismo
      } else {
        toast.success("Responsável atualizado");
        setDeals(currentDeals => 
          currentDeals.map(d => d.id === deal.id ? { ...d, ...result.data } as CrmDeal : d)
        );
      }
    });
  };

  const handleEdit = (deal: CrmDeal) => {
    setEditingDeal(deal);
    setPendingMove(null);
    setIsEditorOpen(true);
  };

  const handleCreate = (stageId: string) => {
    const st = stages.find(s => s.id === stageId);
    if (st && onAddCards) {
      onAddCards(st);
    } else {
      setPendingMove(null);
      setEditingDeal(null);
      setIsEditorOpen(true);
      setCreateStageId(stageId);
    }
  };

  const [createStageId, setCreateStageId] = useState<string | null>(null);

  if (viewMode === "list") {
    return (
      <>
        <PipelineList 
          tenantId={tenantId}
          pipeline={pipeline}
          stages={stages}
          deals={deals}
          contacts={contactsState}
          memberships={memberships}
          onEdit={handleEdit}
          onCreateStage={(stageId) => handleCreate(stageId)}
        />
        
        {/* Editor Modal is shared between Kanban and List view */}
        <DealEditorModal 
          isOpen={isEditorOpen}
          onOpenChange={(open) => {
              setIsEditorOpen(open);
              if (!open) {
                 setPendingMove(null);
                 setEditingDeal(null);
                 setCreateStageId(null);
              }
          }}
          tenantId={tenantId}
          pipelineId={pipeline.id}
          stage={pendingMove ? stages.find(s => s.id === pendingMove.toStageId) : stages.find(s => s.id === editingDeal?.stageId)}
          existingDeal={editingDeal}
          isMoveMode={!!pendingMove}
          memberships={memberships}
          onSuccess={(updatedDeal) => {
              if (pendingMove) {
                 setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
              } else if (editingDeal) {
                 setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
              } else {
                 setDeals([...deals, updatedDeal]);
              }
              setIsEditorOpen(false);
              setEditingDeal(null);
              setPendingMove(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="crm-board">
          {stages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 w-full px-12 py-16 text-center">
               <p className="text-sm font-medium text-slate-700 mb-1">Este funil ainda não possui fluxos de atendimento.</p>
               <p className="text-xs text-slate-400 mb-4 max-w-sm">Adicione os fluxos (etapas) onde seus cards e clientes serão organizados.</p>
               {onCreateStage && (
                 <Button onClick={onCreateStage} variant="primary" size="sm">
                   <Plus className="w-4 h-4 mr-1.5" /> Adicionar Primeiro Fluxo
                 </Button>
               )}
             </div>
          ) : (
            <>
              {contactsState && contactsState.length > 0 && viewMode === "kanban" && (
                <ContactsColumn contacts={contactsState} />
              )}
              {stages.map(stage => (
                <BoardColumn 
                  key={stage.id} 
                  stage={stage} 
                  stages={stages} 
                  deals={deals.filter(d => d.stageId === stage.id)}
                  contacts={contactsState}
                  tags={tags}
                  memberships={memberships}
                  onEdit={handleEdit}
                  onMoveStage={handleMoveStage}
                  onAssignDeal={handleAssignDeal}
                  onAddCards={onAddCards ? onAddCards : () => handleCreate(stage.id)}
                  onConfigureTags={onConfigureTags || (() => {})}
                  onApplyTags={onApplyTags ? onApplyTags : () => {}}
                  onCreatePipeline={onCreatePipeline || (() => {})}
                  onEditStageColor={onEditStageColor || (() => {})}
                />
              ))}

              {/* Botão de adicionar novo fluxo no final do Kanban */}
              {onCreateStage && (
                <div className="crm-add-column-card">
                  <button
                    type="button"
                    onClick={onCreateStage}
                    className="crm-btn-add-column group"
                    title="Adicionar novo fluxo ao funil"
                    aria-label="Adicionar novo fluxo ao funil"
                  >
                    <Plus className="w-5 h-5 text-[#007BFF] transition-transform group-hover:scale-110" />
                    <span>Adicionar Fluxo</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DragDropContext>

      {/* Editor Modal */}
      <DealEditorModal 
        isOpen={isEditorOpen}
        onOpenChange={(open) => {
            setIsEditorOpen(open);
            if (!open) {
               setPendingMove(null);
               setEditingDeal(null);
               setCreateStageId(null);
            }
        }}
        tenantId={tenantId}
        pipelineId={pipeline.id}
        stage={pendingMove
          ? stages.find(s => s.id === pendingMove.toStageId)
          : stages.find(s => s.id === (editingDeal?.stageId ?? createStageId))}
        existingDeal={editingDeal}
        isMoveMode={!!pendingMove}
        memberships={memberships}
        onSuccess={(updatedDeal) => {
            if (pendingMove) {
               setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
            } else if (editingDeal) {
               setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
            } else {
               setDeals([...deals, updatedDeal]);
            }
            setIsEditorOpen(false);
            setEditingDeal(null);
            setPendingMove(null);
            setCreateStageId(null);
        }}
      />
    </>
  );
}
