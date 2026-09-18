"use client";

import type { CSSProperties } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { DealCard } from "./deal-card";
import { stageColor } from "./stage-colors";
import type { CrmMembershipOption } from "../../types";

interface BoardColumnProps {
  stage: CrmPipelineStage;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  memberships?: CrmMembershipOption[];
  onEdit: (deal: CrmDeal) => void;
  onMoveStage: (deal: CrmDeal, stageId: string) => void;
  onAssignDeal: (deal: CrmDeal, membershipId: string | null) => void;
  onCreate: () => void;
}

export function BoardColumn({ stage, stages, deals, memberships, onEdit, onMoveStage, onAssignDeal, onCreate }: BoardColumnProps) {
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
            <button type="button" className="crm-add-card" onClick={onCreate}>
              <Plus aria-hidden="true" className="ui-icon" />
              Novo lead
            </button>
          </div>
        )}
      </Droppable>
    </section>
  );
}
