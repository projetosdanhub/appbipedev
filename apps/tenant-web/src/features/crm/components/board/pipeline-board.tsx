"use client";

import { useState, useTransition, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { CrmPipeline, CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { BoardColumn } from "./board-column";
import { PipelineList } from "./pipeline-list";
import { DealEditorModal } from "../deal-editor-modal";
import { moveDealAction } from "../../actions/deal.actions";
import { toast } from "sonner";

interface PipelineBoardProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  viewMode: "kanban" | "list";
}

export function PipelineBoard({ tenantId, pipeline, stages, deals: initialDeals, viewMode }: PipelineBoardProps) {
  const [deals, setDeals] = useState<CrmDeal[]>(initialDeals);
  
  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

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

    const draggedDeal = deals.find(d => d.id === draggableId);
    if (!draggedDeal) return;

    const fromStageId = source.droppableId;
    const toStageId = destination.droppableId;

    if (fromStageId === toStageId) {
       // Apenas reordenação na mesma coluna. No CRM atual não temos ordem de deals na coluna salva no banco
       // Mas podemos atualizar a UI otimisticamente
       const columnDeals = deals.filter(d => d.stageId === fromStageId);
       const otherDeals = deals.filter(d => d.stageId !== fromStageId);
       const [reordered] = columnDeals.splice(source.index, 1);
       columnDeals.splice(destination.index, 0, reordered);
       setDeals([...otherDeals, ...columnDeals]);
       return;
    }

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
            stages.map(stage => (
              <BoardColumn 
                key={stage.id} 
                stage={stage} 
                deals={deals.filter(d => d.stageId === stage.id)}
                onEdit={handleEdit}
              />
            ))
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
