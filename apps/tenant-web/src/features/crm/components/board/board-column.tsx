"use client";

import { useState, type CSSProperties } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, PlusCircle, Tags, Tag, Palette, Trash2 } from "lucide-react";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
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
import { EditStageColorCard } from "./edit-stage-color-card";
import { isProtectedStage } from "../../utils/omnichannel";
import type { CrmMembershipOption } from "../../types";

interface BoardColumnProps {
  stage: CrmPipelineStage;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  tags?: CrmTag[];
  memberships?: CrmMembershipOption[];
  tenantId?: string;
  pipelineId?: string;
  pipeline?: CrmPipeline;
  onEdit: (deal: CrmDeal) => void;
  onMoveStage: (deal: CrmDeal, stageId: string) => void;
  onAssignDeal: (deal: CrmDeal, membershipId: string | null) => void;
  onAddCards: (stage: CrmPipelineStage) => void;
  onConfigureTags: () => void;
  onApplyTags: (stage: CrmPipelineStage) => void;
  onCreatePipeline?: () => void;
  onEditStageColor?: (stage: CrmPipelineStage) => void;
  onStageSaved?: (stage: CrmPipelineStage, isEdit: boolean) => void;
  onDeleteStage?: (stage: CrmPipelineStage) => void;
}

export function BoardColumn({ 
  stage, 
  stages, 
  deals, 
  contacts, 
  tags,
  memberships, 
  tenantId,
  pipelineId,
  pipeline,
  onEdit, 
  onMoveStage, 
  onAssignDeal, 
  onAddCards,
  onConfigureTags,
  onApplyTags,
  onCreatePipeline,
  onEditStageColor,
  onStageSaved,
  onDeleteStage,
}: BoardColumnProps) {
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  const isProtected = isProtectedStage(stage, pipeline);
  const currentStageColor = previewColor || stageColor(stage.colorToken);

  const handleTriggerColorEdit = () => {
    if (tenantId && pipelineId && onStageSaved) {
      setIsEditingColor((prev) => !prev);
    } else if (onEditStageColor) {
      onEditStageColor(stage);
    }
  };

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
      style={{ "--stage-color": currentStageColor } as CSSProperties}
    >
      <div className="crm-column-header">
        <div className="crm-column-title">
          <span 
            className="crm-stage-dot cursor-pointer" 
            title="Alterar cor do fluxo"
            onClick={handleTriggerColorEdit}
            aria-hidden="true" 
          />
          <h3 id={`crm-stage-${stage.id}`}>{stage.name}</h3>
          {isProtected && (
            <span className="crm-stage-fixed-badge" title="Fluxo primário fixo do Omnichannel">
              Fixo
            </span>
          )}
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

          {/* Menu Dropdown com as opções do fluxo */}
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
            <DropdownMenuContent align="end" className="min-w-[220px] w-auto p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg">
              <DropdownMenuLabel className="text-[11px] text-slate-400 font-medium px-3 py-1.5 uppercase tracking-wider">
                Opções do Fluxo
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => onAddCards(stage)} 
                className="cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100/80 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[#007BFF] shrink-0" />
                <span>Adicionar cards</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onConfigureTags} 
                className="cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100/80 transition-colors"
              >
                <Tags className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Configurar etiquetas</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onApplyTags(stage)} 
                className="cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100/80 transition-colors"
              >
                <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Adicionar etiquetas</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleTriggerColorEdit} 
                className="cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100/80 transition-colors"
              >
                <Palette className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Alterar cor do fluxo</span>
              </DropdownMenuItem>
              {onDeleteStage && (
                <>
                  <DropdownMenuSeparator />
                  {isProtected ? (
                    <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 bg-slate-50/70 rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                      <span>🔒 Fluxo primário fixo</span>
                    </div>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => onDeleteStage(stage)} 
                      className="cursor-pointer whitespace-nowrap flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Excluir fluxo</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card inline para editar cor do fluxo */}
      {isEditingColor && tenantId && pipelineId && onStageSaved && (
        <EditStageColorCard
          tenantId={tenantId}
          pipelineId={pipelineId}
          stage={stage}
          onClose={() => {
            setIsEditingColor(false);
            setPreviewColor(null);
          }}
          onStageSaved={(updatedStage, isEdit) => {
            setIsEditingColor(false);
            setPreviewColor(null);
            onStageSaved(updatedStage, isEdit);
          }}
          onColorChangePreview={(color) => setPreviewColor(color)}
        />
      )}

      {/* Divisória Estilizada do Fluxo */}
      <div className="crm-flow-divider">
        <div className="crm-flow-divider-accent" />
        <span className="crm-flow-divider-badge">
          {deals.length === 0 ? "Fluxo Vazio" : `${deals.length} ${deals.length === 1 ? "Lead" : "Leads"}`}
        </span>
        <div className="crm-flow-divider-line" />
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
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="crm-stage-empty-state">
                <span className="crm-stage-empty-text">Nenhum card neste fluxo</span>
              </div>
            )}
            {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </section>
  );
}
