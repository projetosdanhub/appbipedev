"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus } from "lucide-react";
import { CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { DealCard } from "./deal-card";

interface BoardColumnProps {
  stage: CrmPipelineStage;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  memberships?: any[];
  onEdit: (deal: CrmDeal) => void;
  onMoveStage: (deal: CrmDeal, stageId: string) => void;
  onAssignDeal: (deal: CrmDeal, membershipId: string | null) => void;
}

export function BoardColumn({ stage, stages, deals, memberships, onEdit, onMoveStage, onAssignDeal }: BoardColumnProps) {
  return (
    <div className="flex flex-col w-[320px] max-h-full bg-[#F1F5F9] dark:bg-[#1E293B]/50 rounded-[12px] border border-[#E2E8F0] dark:border-[#334155]/50 overflow-hidden shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#E2E8F0] dark:border-[#334155]/50 bg-white/50 dark:bg-[#0F172A]/50">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${stage.colorToken}`} />
          <h3 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{stage.name}</h3>
          <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-medium bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-full">
            {deals.length}
          </span>
        </div>
        <button className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div 
            className={`flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/50' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
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
            
            {/* Empty State Add Button */}
            <button className="flex items-center justify-center w-full py-2.5 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0]/50 dark:hover:bg-[#1E293B] border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-[10px] transition-all mt-2">
              <Plus className="w-4 h-4 mr-1" />
              Novo card
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}
