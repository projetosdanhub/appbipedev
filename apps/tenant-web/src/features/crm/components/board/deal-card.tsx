"use client";

/* eslint-disable react-hooks/refs -- @hello-pangea/dnd exposes callback refs and style props through its provided object. */

import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Calendar, MoreHorizontal, User as UserIcon, Phone } from "lucide-react";
import { CrmDeal, CrmPipelineStage, CrmContact } from "@bipesend/contracts";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@bipesend/ui";
import { stageColor } from "./stage-colors";
import type { CrmMembershipOption } from "../../types";

interface DealCardProps {
  deal: CrmDeal;
  stages: CrmPipelineStage[];
  contacts?: CrmContact[];
  memberships?: CrmMembershipOption[];
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onEdit: () => void;
  onMoveStage: (stageId: string) => void;
  onAssign: (membershipId: string | null) => void;
}

export function DealCard({ deal, stages, contacts, memberships, provided, snapshot, onEdit, onMoveStage, onAssign }: DealCardProps) {
  const formattedValue = new Intl.NumberFormat("pt-BR", { 
    style: "currency", 
    currency: deal.currency || "BRL" 
  }).format(parseFloat(deal.amount));

  const dateStr = deal.expectedCloseDate 
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(deal.expectedCloseDate)) 
    : "--";

  const stage = stages.find(s => s.id === deal.stageId);
  const color = stageColor(stage?.colorToken || "blue-500");
  const contact = contacts?.find(c => c.id === deal.contactId);
  const assignee = memberships?.find(m => m.id === deal.assignedMembershipId);

  return (
    <div 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="crm-deal-card"
      data-dragging={snapshot.isDragging}
      style={{
        ...provided.draggableProps.style,
        borderLeftColor: color,
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="text-[14px] font-semibold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer" onClick={onEdit}>
          {deal.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="crm-card-menu -mr-1 -mt-1"
              aria-label={`Ações de ${deal.title}`}
            >
              <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-slate-600" />
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
                    className={deal.assignedMembershipId === mem.id ? "font-bold text-[#007BFF]" : ""}
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
            {stages.map(s => (
              <DropdownMenuItem 
                key={s.id} 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onMoveStage(s.id); }}
                disabled={s.id === deal.stageId}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: stageColor(s.colorToken) }} 
                />
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Contato Vinculado */}
      <div className="flex items-center gap-2 text-slate-600 text-[12px] mb-2.5">
        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
          {contact?.name ? contact.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 text-slate-400" />}
        </div>
        <span className="truncate font-medium text-slate-700">
          {contact?.name || "Sem contato vinculado"}
        </span>
        {contact?.phone && (
          <span className="ml-auto text-slate-400 flex items-center gap-1 text-[11px]" title={contact.phone}>
            <Phone className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="h-px w-full bg-slate-100 mb-2.5" />

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[12px] tabular-nums">
          {formattedValue}
        </div>
        
        <div className="flex items-center gap-2">
          {dateStr !== "--" && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{dateStr}</span>
            </div>
          )}

          {assignee && (
            <div 
              className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] font-semibold"
              title={`Responsável: ${assignee.name || assignee.email}`}
            >
              {(assignee.name || assignee.email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
