"use client";

import type { CSSProperties } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { DealCard } from "./deal-card";
import { stageColor } from "./stage-colors";
import type { CrmMembershipOption } from "../../types";

interface BoardColumnProps {
  stage: CrmPipelineStage;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  memberships?: CrmMembershipOption[];
  onEdit: (deal: CrmDeal) => void;
  onMoveStage: (deal: CrmDeal, stageId: string) => void;
  onAssignDeal: (deal: CrmDeal, membershipId: string | null) => void;
  onCreate: () => void;
}

export function BoardColumn({ stage, stages, deals, contacts, memberships, onEdit, onMoveStage, onAssignDeal, onCreate }: BoardColumnProps) {
  const totalAmount = deals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const currency = deals[0]?.currency || "BRL";
  const formattedTotal = new Intl.NumberFormat("pt-BR", { 
    style: "currency", 
    currency, 
    maximumFractionDigits: 0 
  }).format(totalAmount);

  return (
    <section
      className="crm-column"
      aria-labelledby={`crm-stage-${stage.id}`}
      style={{ "--stage-color": stageColor(stage.colorToken) } as CSSProperties}
    >
      <div className="crm-column-header">
        <div className="crm-column-title">
          <span className="crm-stage-dot" aria-hidden="true" />
          <h3 id={`crm-stage-${stage.id}`}>{stage.name}</h3>
          <span className="crm-column-count" aria-label={`${deals.length} negócios`}>
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalAmount > 0 && (
            <span className="crm-column-total-amount" title={`Total em ${stage.name}`}>
              {formattedTotal}
            </span>
          )}
          <button
            type="button"
            className="crm-column-header-add"
            onClick={onCreate}
            aria-label={`Criar card em ${stage.name}`}
            title={`Adicionar card em ${stage.name}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            className="crm-column-body"
            data-dragging-over={snapshot.isDraggingOver}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div className="crm-column-stack">
              {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(provided, snapshot) => (
                  <DealCard 
                    deal={deal} 
                    stages={stages}
                    contacts={contacts}
                    memberships={memberships}
                    provided={provided} 
                    snapshot={snapshot}
                    onEdit={() => onEdit(deal)}
                    onMoveStage={(stageId) => onMoveStage(deal, stageId)}
                    onAssign={(membershipId) => onAssignDeal(deal, membershipId)}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            </div>
            <button 
              type="button" 
              className="crm-add-card-stage group" 
              onClick={onCreate}
              aria-label={`Criar card em ${stage.name}`}
            >
              <Plus aria-hidden="true" className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>+ {stage.name}</span>
            </button>
          </div>
        )}
      </Droppable>
    </section>
  );
}
