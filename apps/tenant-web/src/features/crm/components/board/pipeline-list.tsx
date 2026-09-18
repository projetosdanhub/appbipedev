"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, User as UserIcon, Phone, Mail, ChevronRight } from "lucide-react";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { stageColor } from "./stage-colors";
import type { CrmMembershipOption } from "../../types";

interface PipelineListProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  contacts?: CrmContact[];
  memberships?: CrmMembershipOption[];
  onEdit: (deal: CrmDeal) => void;
  onCreateStage?: (stageId: string) => void;
}

export function PipelineList({ stages, deals, contacts, memberships, onEdit, onCreateStage }: PipelineListProps) {
  const contactsMap = useMemo(() => new Map(contacts?.map(c => [c.id, c]) || []), [contacts]);
  const membershipsMap = useMemo(() => new Map(memberships?.map(m => [m.id, m]) || []), [memberships]);

  const totalPipelineAmount = useMemo(() => {
    return deals.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  }, [deals]);

  const currency = deals[0]?.currency || "BRL";
  const formattedGrandTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(totalPipelineAmount);

  return (
    <div className="crm-list-wrap p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* ── Summary Banner ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Total em Negócios</span>
            <p className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight">{formattedGrandTotal}</p>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <div>
            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Oportunidades</span>
            <p className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight">{deals.length}</p>
          </div>
          <div className="h-9 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Etapas Ativas</span>
            <p className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight">{stages.length}</p>
          </div>
        </div>
      </div>

      {/* ── Grouped Stages List ── */}
      <div className="space-y-6">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stageId === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
          const color = stageColor(stage.colorToken);

          const formattedStageTotal = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(stageTotal);

          return (
            <div key={stage.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              {/* Stage Header */}
              <div 
                className="flex items-center justify-between px-4 py-3.5 bg-slate-50/80 border-b border-slate-200/80"
                style={{ borderLeft: `5px solid ${color}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                    {stage.name}
                  </h3>
                  <span className="bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                    {stageDeals.length} {stageDeals.length === 1 ? "lead" : "leads"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {stageTotal > 0 && (
                    <span className="text-[14px] font-bold text-slate-800 tabular-nums">
                      {formattedStageTotal}
                    </span>
                  )}
                  {onCreateStage && (
                    <button
                      type="button"
                      onClick={() => onCreateStage(stage.id)}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#007BFF] hover:text-[#0056D2] bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors"
                      title={`Adicionar lead em ${stage.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+ {stage.name}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Deals in Stage */}
              <div className="divide-y divide-slate-100">
                {stageDeals.length === 0 ? (
                  <div className="py-6 px-4 text-center text-slate-400 text-[13px]">
                    Nenhum lead nesta etapa.{" "}
                    {onCreateStage && (
                      <button
                        type="button"
                        onClick={() => onCreateStage(stage.id)}
                        className="text-[#007BFF] font-medium hover:underline ml-1"
                      >
                        Criar card
                      </button>
                    )}
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const contact = deal.contactId ? contactsMap.get(deal.contactId) : null;
                    const assignee = deal.assignedMembershipId ? membershipsMap.get(deal.assignedMembershipId) : null;
                    const formattedValue = new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: deal.currency || "BRL",
                    }).format(parseFloat(deal.amount));

                    const dateStr = deal.expectedCloseDate
                      ? format(new Date(deal.expectedCloseDate), "dd 'de' MMM, yyyy", { locale: ptBR })
                      : null;

                    return (
                      <div
                        key={deal.id}
                        onClick={() => onEdit(deal)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 md:px-5 hover:bg-slate-50/70 transition-colors cursor-pointer gap-3"
                      >
                        {/* Title & Contact */}
                        <div className="flex items-start gap-3 min-w-[280px]">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[12px] flex-shrink-0 mt-0.5">
                            {contact?.name ? contact.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div>
                            <h4 className="text-[14px] font-semibold text-slate-900 group-hover:text-[#007BFF] transition-colors leading-snug">
                              {deal.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500 mt-0.5">
                              {contact?.name && (
                                <span className="font-medium text-slate-700">{contact.name}</span>
                              )}
                              {contact?.email && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                              {contact?.phone && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Value & Info */}
                        <div className="flex items-center justify-between md:justify-end gap-5 pl-11 md:pl-0">
                          {/* Value */}
                          <div className="inline-flex items-center font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-[13px] tabular-nums">
                            {formattedValue}
                          </div>

                          {/* Close Date */}
                          {dateStr && (
                            <div className="hidden lg:flex items-center gap-1 text-slate-400 text-[12px]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{dateStr}</span>
                            </div>
                          )}

                          {/* Assignee */}
                          {assignee ? (
                            <div 
                              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[11px] font-semibold"
                              title={`Responsável: ${assignee.name || assignee.email}`}
                            >
                              {(assignee.name || assignee.email).charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-dashed border-slate-300" title="Sem responsável" />
                          )}

                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
