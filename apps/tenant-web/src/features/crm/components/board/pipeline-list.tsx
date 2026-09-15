"use client";

import { CrmPipeline, CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Maps design-system color tokens to hex values for inline styles */
const COLOR_MAP: Record<string, string> = {
  "blue-500": "#3B82F6",
  "green-500": "#22C55E",
  "red-500": "#EF4444",
  "yellow-500": "#EAB308",
  "purple-500": "#A855F7",
  "pink-500": "#EC4899",
  "indigo-500": "#6366F1",
  "teal-500": "#14B8A6",
  "orange-500": "#F97316",
  "gray-500": "#6B7280",
  "slate-500": "#64748B",
  "cyan-500": "#06B6D4",
};
function tokenToHex(token: string): string {
  return COLOR_MAP[token] ?? "#6B7280";
}

interface PipelineListProps {
  tenantId: string;
  pipeline: CrmPipeline;
  stages: CrmPipelineStage[];
  deals: CrmDeal[];
  onEdit: (deal: CrmDeal) => void;
}

export function PipelineList({ tenantId, pipeline, stages, deals, onEdit }: PipelineListProps) {
  // Opcional: ordenar deals por etapa e depois por data de fechamento
  const sortedDeals = [...deals].sort((a, b) => {
    const stageA = stages.find(s => s.id === a.stageId)?.position || 0;
    const stageB = stages.find(s => s.id === b.stageId)?.position || 0;
    if (stageA !== stageB) return stageA - stageB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-medium border-b border-[#E2E8F0] dark:border-[#334155]">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Fechamento Esperado</th>
                <th className="px-4 py-3">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {sortedDeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nenhum deal encontrado.
                  </td>
                </tr>
              ) : (
                sortedDeals.map((deal) => {
                  const stage = stages.find(s => s.id === deal.stageId);
                  return (
                    <tr 
                      key={deal.id} 
                      className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer group"
                      onClick={() => onEdit(deal)}
                    >
                      <td className="px-4 py-3 font-medium text-[#0F172A] dark:text-white">
                        {deal.title}
                      </td>
                      <td className="px-4 py-3">
                        {stage ? (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{ 
                              backgroundColor: `${tokenToHex(stage.colorToken)}15`, 
                              color: tokenToHex(stage.colorToken),
                              borderColor: `${tokenToHex(stage.colorToken)}30` 
                            }}
                          >
                            {stage.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#0F172A] dark:text-white">
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
