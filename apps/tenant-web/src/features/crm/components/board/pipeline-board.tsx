"use client";

import { useState, useTransition, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { BoardColumn } from "./board-column";
import { ContactsColumn } from "./contacts-column";
import { PipelineList } from "./pipeline-list";
import { DealEditorModal } from "../deal-editor-modal";
import { moveDealAction, createDealFromContactAction, updateDealAction } from "../../actions/deal.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/useRealtime";

interface PipelineBoardProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  memberships?: { id: string; userId: string; name: string | null; email: string; }[];
  viewMode: "kanban" | "list";
  sessionToken?: string;
}

export function PipelineBoard({ tenantId, pipeline, stages, deals: initialDeals, contacts, memberships, viewMode, sessionToken }: PipelineBoardProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<CrmDeal[]>(initialDeals);
  const [contactsState, setContactsState] = useState<CrmContact[]>(contacts || []);
  
  useRealtime({
    tenantId: tenantId,
    token: sessionToken || "",
    onEvent: (event) => {
      if (event === "crm.deal.changed") {
        // Quando ocorre um evento no websocket, fazemos um router.refresh() 
        // para re-buscar os deals no Server Component e passá-los nas props `deals`.
        router.refresh();
      }
    }
  });
  
  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  useEffect(() => {
    if (contacts) setContactsState(contacts);
  }, [contacts]);

  const [isPending, startTransition] = useTransition();

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
        id: `temp-${Date.now()}`,
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

    if (source.droppableId === destination.droppableId) {
       // Apenas reordenação na mesma coluna. No CRM atual não temos ordem de deals na coluna salva no banco
       // Mas podemos atualizar a UI otimisticamente
       const columnDeals = deals.filter(d => d.stageId === fromStageId);
       const otherDeals = deals.filter(d => d.stageId !== fromStageId);
       const [reordered] = columnDeals.splice(source.index, 1);
       columnDeals.splice(destination.index, 0, reordered);
       setDeals([...otherDeals, ...columnDeals]);
       return;
    }

    handleMoveStage(draggedDeal, toStageId);
  };

  const handleMoveStage = (draggedDeal: CrmDeal, toStageId: string) => {
    // Movimentação entre colunas
    // Checar regras da coluna destino
    const toStage = stages.find(s => s.id === toStageId);
    if (toStage?.requiredFieldRules && toStage.requiredFieldRules.rules.length > 0) {
      // Tem regras. Precisamos verificar se o deal tem tudo preenchido
      // O Deal Editor Modal cuidará disso. Vamos abrir o modal em "modo movimento"
      setPendingMove({ deal: draggedDeal, toStageId });
      setEditingDeal(draggedDeal);
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
        // Atualiza a versão do deal
        setDeals(currentDeals => 
          currentDeals.map(d => d.id === draggedDeal.id ? { ...d, ...result.data } as CrmDeal : d)
        );
      }
    });
  };

  const handleAssignDeal = (deal: CrmDeal, membershipId: string | null) => {
    // Otimisticamente atualiza
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

  if (viewMode === "list") {
    return (
      <>
        <PipelineList 
          tenantId={tenantId}
          pipeline={pipeline}
          stages={stages}
          deals={deals}
          onEdit={handleEdit}
        />
        
        {/* Editor Modal is shared between Kanban and List view */}
        <DealEditorModal 
          isOpen={isEditorOpen}
          onOpenChange={(open) => {
              setIsEditorOpen(open);
              if (!open) {
                 setPendingMove(null);
                 setEditingDeal(null);
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
        <div className="flex h-full w-max p-6 gap-6 items-start">
          {stages.length === 0 ? (
             <div className="flex items-center justify-center h-full text-slate-500 w-full px-12">
               Este pipeline não possui etapas. Vá nas configurações para adicionar etapas.
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
                  memberships={memberships}
                  onEdit={handleEdit}
                  onMoveStage={handleMoveStage}
                  onAssignDeal={handleAssignDeal}
                />
              ))}
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
               // Atualizou o deal e moveu
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
