"use client";

import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Calendar, MoreHorizontal } from "lucide-react";
import { CrmDeal, CrmPipelineStage } from "@bipesend/contracts";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@bipesend/ui/components/overlays";

interface DealCardProps {
  deal: CrmDeal;
  stages: CrmPipelineStage[];
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onEdit: () => void;
  onMoveStage: (stageId: string) => void;
}

export function DealCard({ deal, stages, provided, snapshot, onEdit, onMoveStage }: DealCardProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency }).format(parseFloat(deal.amount));
  const dateStr = deal.expectedCloseDate ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(deal.expectedCloseDate)) : "--";

  // Na API nós temos contactId, mas na UI real a query retornaria o objeto de contact (join). 
  // Para fins deste componente, vamos exibir o title. 
  // TODO: Buscar o contact object na listagem.

  return (
    <div 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group flex flex-col p-4 bg-white dark:bg-[#0F172A] rounded-[10px] border border-[#E2E8F0] dark:border-[#334155] shadow-sm transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#0A74FF]' : 'hover:shadow-md'}`}
      style={provided.draggableProps.style}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-white leading-tight">
          {deal.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-opacity rounded-md hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              Editar lead
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Mover para...</DropdownMenuLabel>
            {stages.map(stage => (
              <DropdownMenuItem 
                key={stage.id} 
                onClick={(e) => { e.stopPropagation(); onMoveStage(stage.id); }}
                disabled={stage.id === deal.stageId}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${stage.colorToken}`} />
                {stage.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8] text-[13px] mb-3">
        <div className="w-5 h-5 rounded-full bg-[#0A74FF]/10 text-[#0A74FF] flex items-center justify-center font-bold text-[10px]">
          C
        </div>
        Contato Vinculado
      </div>

      <div className="h-[1px] w-full bg-[#F1F5F9] dark:bg-[#1E293B] mb-3" />

      <div className="flex items-center justify-between text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">
        <div className="flex items-center gap-1 text-[#10B981] dark:text-[#34D399] font-semibold bg-[#10B981]/10 px-2 py-1 rounded-md">
          {formattedValue}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {dateStr}
        </div>
      </div>
    </div>
  );
}
