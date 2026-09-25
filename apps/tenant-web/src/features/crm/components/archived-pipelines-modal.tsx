"use client";

import { useState } from "react";
import { CrmPipeline, CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
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
  RotateCcw, 
  Layers, 
  Loader2, 
  Calendar, 
  Sparkles,
  CheckCircle2,
  FolderArchive
} from "lucide-react";
import { toast } from "sonner";

export interface ArchivedPipelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  archivedPipelines: CrmPipeline[];
  stagesMap: Record<string, CrmPipelineStage[]>;
  dealsMap: Record<string, CrmDeal[]>;
  onPipelineRestored: (pipelineId: string) => void;
}

export function ArchivedPipelinesModal({
  isOpen,
  onClose,
  tenantId,
  archivedPipelines,
  stagesMap,
  dealsMap,
  onPipelineRestored,
}: ArchivedPipelinesModalProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (pipeline: CrmPipeline) => {
    setRestoringId(pipeline.id);
    try {
      const res = await updatePipelineAction(tenantId, pipeline.id, {
        status: "active",
      });

      if (!res.success) {
        const errorMsg =
          typeof res.message === "string"
            ? res.message
            : (res.message as any)?.message || "Erro ao restaurar funil.";
        toast.error(errorMsg);
        return;
      }

      toast.success(`Funil "${pipeline.name}" restaurado e ativo novamente!`);
      onPipelineRestored(pipeline.id);
      if (archivedPipelines.length <= 1) {
        onClose();
      }
    } catch {
      toast.error("Erro inesperado ao restaurar funil.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !restoringId && !open && onClose()}>
      <DialogContent className="max-w-lg w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-title">
                Funis Arquivados ({archivedPipelines.length})
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Restaure funis anteriores com todas as suas etapas e negociações preservadas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {archivedPipelines.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Nenhum funil arquivado</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Quando você arquivar um funil comercial, ele aparecerá aqui para ser resgatado quando quiser.
              </p>
            </div>
          ) : (
            archivedPipelines.map((pipeline) => {
              const stages = stagesMap[pipeline.id] || [];
              const deals = dealsMap[pipeline.id] || [];
              const isRestoring = restoringId === pipeline.id;

              return (
                <div
                  key={pipeline.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-width-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-semibold text-slate-800 truncate block">
                          {pipeline.name}
                        </strong>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
                          Arquivado
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span>{stages.length} {stages.length === 1 ? "etapa" : "etapas"}</span>
                        <span>•</span>
                        <span>{deals.length} {deals.length === 1 ? "card" : "cards"}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(pipeline)}
                    disabled={restoringId !== null}
                    className="shrink-0 border-blue-200 text-[#007BFF] hover:bg-blue-50 font-semibold text-xs h-8 px-3 rounded-lg"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Restaurando...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Restaurar
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={restoringId !== null}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
