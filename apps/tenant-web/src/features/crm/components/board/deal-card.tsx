"use client";

/* eslint-disable react-hooks/refs -- @hello-pangea/dnd exposes callback refs and style props through its provided object. */

import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Calendar, MoreHorizontal } from "lucide-react";
import { CrmDeal, CrmPipelineStage } from "@bipesend/contracts";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@bipesend/ui";
import type { CrmMembershipOption } from "../../types";

interface DealCardProps {
  deal: CrmDeal;
  stages: CrmPipelineStage[];
  memberships?: CrmMembershipOption[];
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onEdit: () => void;
  onMoveStage: (stageId: string) => void;
  onAssign: (membershipId: string | null) => void;
}

export function DealCard({ deal, stages, memberships, provided, snapshot, onEdit, onMoveStage, onAssign }: DealCardProps) {
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
      className="crm-deal-card"
      data-dragging={snapshot.isDragging}
      style={provided.draggableProps.style}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h4 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
          {deal.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="crm-card-menu"
              aria-label={`Ações de ${deal.title}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}>
              Editar lead
            </DropdownMenuItem>
            
            {memberships && memberships.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Atribuir a...</DropdownMenuLabel>
                {memberships.map((mem) => (
                  <DropdownMenuItem 
                    key={mem.id} 
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAssign(mem.id); }}
                    className={deal.assignedMembershipId === mem.id ? "font-bold text-[var(--action-primary)]" : ""}
                  >
                    {mem.name || mem.email}
                  </DropdownMenuItem>
                ))}
                {deal.assignedMembershipId && (
                  <DropdownMenuItem 
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAssign(null); }}
                    className="text-red-500"
                  >
                    Remover responsável
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Mover para...</DropdownMenuLabel>
            {stages.map(stage => (
              <DropdownMenuItem 
                key={stage.id} 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onMoveStage(stage.id); }}
                disabled={stage.id === deal.stageId}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${stage.colorToken}`} />
                {stage.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[13px] mb-3">
        <div className="w-6 h-6 rounded-full bg-[var(--bg-selected)] text-[var(--action-primary)] flex items-center justify-center font-bold text-[10px]">
          C
        </div>
        Contato Vinculado
      </div>

      <div className="h-px w-full bg-[var(--border-default)] mb-3" />

      <div className="flex items-center justify-between text-[12px] text-[var(--text-muted)] font-medium">
        <div className="flex items-center gap-1 text-[var(--status-success)] font-semibold bg-[var(--status-success-bg)] px-2 py-1 rounded-md">
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
