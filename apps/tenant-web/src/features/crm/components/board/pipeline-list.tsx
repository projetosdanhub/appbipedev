"use client";

import { CrmPipeline, CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { stageColor } from "./stage-colors";

interface PipelineListProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  onEdit: (deal: CrmDeal) => void;
}

export function PipelineList({ stages, deals, onEdit }: PipelineListProps) {
  // Opcional: ordenar deals por etapa e depois por data de fechamento
  const sortedDeals = [...deals].sort((a, b) => {
    const stageA = stages.find(s => s.id === a.stageId)?.position || 0;
    const stageB = stages.find(s => s.id === b.stageId)?.position || 0;
    if (stageA !== stageB) return stageA - stageB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="crm-list-wrap">
      <div className="crm-list-surface">
        <div className="ui-desktop-table overflow-x-auto">
          <table className="crm-table">
            <caption className="sr-only">Negócios do funil selecionado</caption>
            <thead>
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Fechamento Esperado</th>
                <th className="px-4 py-3">Data de Criação</th>
                <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-muted)]">
                    Nenhum lead encontrado neste funil.
                  </td>
                </tr>
              ) : (
                sortedDeals.map((deal) => {
                  const stage = stages.find(s => s.id === deal.stageId);
                  return (
                    <tr key={deal.id}>
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                        {deal.title}
                      </td>
                      <td className="px-4 py-3">
                        {stage ? (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{ 
                              backgroundColor: `color-mix(in srgb, ${stageColor(stage.colorToken)} 10%, white)`,
                              color: stageColor(stage.colorToken),
                              borderColor: `color-mix(in srgb, ${stageColor(stage.colorToken)} 28%, white)`,
                            }}
                          >
                            {stage.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                        {deal.amount 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: deal.currency || 'BRL' }).format(Number(deal.amount))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {deal.expectedCloseDate 
                          ? format(new Date(deal.expectedCloseDate), "dd 'de' MMM, yyyy", { locale: ptBR })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {format(new Date(deal.createdAt), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" className="crm-list-action" onClick={() => onEdit(deal)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="ui-mobile-cards crm-mobile-deals">
          {sortedDeals.length === 0 ? (
            <p className="ui-help">Nenhum lead encontrado neste funil.</p>
          ) : (
            sortedDeals.map((deal) => {
              const stage = stages.find((item) => item.id === deal.stageId);
              return (
                <button key={deal.id} type="button" className="crm-mobile-deal" onClick={() => onEdit(deal)}>
                  <span className="crm-mobile-deal-heading">
                    <strong>{deal.title}</strong>
                    <span>{deal.amount
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: deal.currency || "BRL" }).format(Number(deal.amount))
                      : "—"}</span>
                  </span>
                  <span className="ui-help">{stage?.name ?? "Etapa não disponível"}</span>
                  <span className="ui-help">Fechamento: {deal.expectedCloseDate
                    ? format(new Date(deal.expectedCloseDate), "dd 'de' MMM", { locale: ptBR })
                    : "não informado"}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
