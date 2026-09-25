"use client";

import { useState } from "react";
import { CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";
import { updatePipelineAction } from "../actions/pipeline.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@bipesend/ui";
import { 
  Archive, 
  AlertTriangle, 
  Star, 
  ArrowRight, 
  Check, 
  Loader2, 
  Layers, 
  History,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

export interface ArchivePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  pipeline: CrmPipeline | null;
  activePipelines: CrmPipeline[];
  defaultPipelineId: string | null;
  dealsCount: number;
  stagesMap: Record<string, CrmPipelineStage[]>;
  onPipelineArchived: (archivedPipelineId: string) => void;
}

export function ArchivePipelineModal({
  isOpen,
  onClose,
  tenantId,
  pipeline,
  activePipelines,
  defaultPipelineId,
  dealsCount,
  onPipelineArchived,
}: ArchivePipelineModalProps) {
  const [loading, setLoading] = useState(false);
  const [dealStrategy, setDealStrategy] = useState<"keep" | "transfer">("keep");
  const [selectedTargetPipelineId, setSelectedTargetPipelineId] = useState<string>("");

  if (!pipeline) return null;

  const isDefault = pipeline.id === defaultPipelineId || Boolean(pipeline.isDefault);
  const isLastActive = activePipelines.length <= 1;
  const hasDeals = dealsCount > 0;
  const otherPipelines = activePipelines.filter((p) => p.id !== pipeline.id);

  // Não pode arquivar se for o funil principal/padrão ou se for o último funil ativo da conta
  const canArchive = !isDefault && !isLastActive;

  const handleArchive = async () => {
    if (!canArchive) return;

    setLoading(true);
    try {
      const res = await updatePipelineAction(tenantId, pipeline.id, {
        status: "archived",
      });

      if (!res.success) {
        const errorMsg =
          typeof res.message === "string"
            ? res.message
            : (res.message as any)?.message || "Erro ao arquivar funil.";
        toast.error(errorMsg);
        return;
      }

      toast.success(
        `Funil "${pipeline.name}" arquivado com sucesso! Todos os dados e métricas foram preservados.`
      );
      onPipelineArchived(pipeline.id);
      onClose();
    } catch {
      toast.error("Erro inesperado ao arquivar funil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-title">
                Arquivar Funil Comercial
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                O funil sairá da visualização diária, mas seus dados permanecerão seguros.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Card do Funil Selecionado */}
          <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#007BFF] font-semibold text-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  {pipeline.name}
                </span>
                {pipeline.description && (
                  <span className="text-xs text-slate-500 line-clamp-1">
                    {pipeline.description}
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                hasDeals ? "bg-amber-100 text-amber-800" : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {dealsCount} {dealsCount === 1 ? "card" : "cards"}
            </span>
          </div>

          {/* ── Trava 1: Funil Padrão ── */}
          {isDefault && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Este é o Funil Padrão do CRM.</strong>
                <br />
                Para arquivá-lo com segurança, selecione outro funil como padrão no menu de funis antes de realizar esta ação.
              </div>
            </div>
          )}

          {/* ── Trava 2: Último Funil Ativo ── */}
          {!isDefault && isLastActive && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Não é possível arquivar o único funil ativo da conta.</strong>
                <br />
                Sua empresa precisa ter ao menos um funil ativo para receber e gerenciar oportunidades comerciais. Crie um novo funil antes de arquivar este.
              </div>
            </div>
          )}

          {/* ── Comportamento Permitido com Cards ── */}
          {canArchive && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed">
                <History className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Preservação total de dados:</strong> Todos os contatos, notas, tarefas e métricas financeiras passadas deste funil continuarão salvos. Você poderá <strong>restaurar este funil</strong> a qualquer momento.
                </div>
              </div>

              {hasDeals && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    O que fazer com os {dealsCount} card(s) ativo(s)?
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    <label
                      onClick={() => setDealStrategy("keep")}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        dealStrategy === "keep"
                          ? "border-[#007BFF] bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dealStrategy"
                        checked={dealStrategy === "keep"}
                        onChange={() => setDealStrategy("keep")}
                        className="mt-0.5 text-[#007BFF] focus:ring-[#007BFF]"
                      />
                      <div className="text-xs">
                        <strong className="text-slate-800 block">
                          Manter cards salvos no funil arquivado (Recomendado)
                        </strong>
                        <span className="text-slate-500">
                          Os cards ficam guardados em suas respectivas etapas e voltam intactos caso o funil seja restaurado.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-slate-100 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {canArchive ? "Cancelar" : "Fechar"}
          </Button>

          {canArchive && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleArchive}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Arquivando...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-1.5" />
                  Arquivar Funil
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
