"use client";

import type { CSSProperties } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, PlusCircle, Tags, Tag, Sparkles, Palette } from "lucide-react";
import { CrmPipelineStage, CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel 
} from "@bipesend/ui";
import { DealCard } from "./deal-card";
import { stageColor } from "./stage-colors";
import type { CrmMembershipOption } from "../../types";

interface BoardColumnProps {
  stage: CrmPipelineStage;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  tags?: CrmTag[];
  memberships?: CrmMembershipOption[];
  onEdit: (deal: CrmDeal) => void;
  onMoveStage: (deal: CrmDeal, stageId: string) => void;
  onAssignDeal: (deal: CrmDeal, membershipId: string | null) => void;
  onAddCards: (stage: CrmPipelineStage) => void;
  onConfigureTags: () => void;
  onApplyTags: (stage: CrmPipelineStage) => void;
  onCreatePipeline: () => void;
  onEditStageColor: (stage: CrmPipelineStage) => void;
}

export function BoardColumn({ 
  stage, 
  stages, 
  deals, 
  contacts, 
  tags,
  memberships, 
  onEdit, 
  onMoveStage, 
  onAssignDeal, 
  onAddCards,
  onConfigureTags,
  onApplyTags,
  onCreatePipeline,
  onEditStageColor
}: BoardColumnProps) {
  const totalAmount = deals.reduce((acc, deal) => acc + (deal.amount ? Number(deal.amount) : 0), 0);
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
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
          <span 
            className="crm-stage-dot cursor-pointer" 
            title="Alterar cor do fluxo"
            onClick={() => onEditStageColor(stage)}
            aria-hidden="true" 
          />
          <h3 id={`crm-stage-${stage.id}`}>{stage.name}</h3>
          <span className="crm-column-count" aria-label={`${deals.length} negócios`}>
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {totalAmount > 0 && (
            <span className="crm-column-total-amount" title={`Total em ${stage.name}`}>
              {formattedTotal}
            </span>
          )}

          {/* Menu Dropdown com as 4 opções obrigatórias do fluxo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="crm-column-header-add-btn"
                aria-label={`Opções e adicionar no fluxo ${stage.name}`}
                title="Opções do fluxo"
              >
                <Plus className="crm-column-add-icon" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[210px]">
              <DropdownMenuLabel className="text-[11px] text-slate-400 font-normal px-2 py-1">
                Opções do Fluxo
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddCards(stage)} className="cursor-pointer">
                <PlusCircle className="w-4 h-4 mr-2 text-[#007BFF]" />
                Adicionar cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onConfigureTags} className="cursor-pointer">
                <Tags className="w-4 h-4 mr-2 text-indigo-500" />
                Configurar etiquetas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onApplyTags(stage)} className="cursor-pointer">
                <Tag className="w-4 h-4 mr-2 text-emerald-500" />
                Adicionar etiquetas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreatePipeline} className="cursor-pointer">
                <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                Criar funil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEditStageColor(stage)} className="cursor-pointer">
                <Palette className="w-4 h-4 mr-2 text-purple-500" />
                Alterar cor do fluxo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    tags={tags}
                    memberships={memberships}
                    provided={provided} 
                    snapshot={snapshot}
                    onEdit={() => onEdit(deal)}
                    onMoveStage={(stageId) => onMoveStage(deal, stageId)}
                    onAssign={(membershipId) => onAssignDeal(deal, membershipId)}
                    onManageTags={onConfigureTags}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </section>
  );
}
