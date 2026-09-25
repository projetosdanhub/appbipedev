"use client";

import { useState, useEffect } from "react";
import { CrmPipelineStage } from "@bipesend/contracts";
import { deletePipelineStageAction } from "../actions/stage.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@bipesend/ui";
import { AlertTriangle, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { stageColor } from "./board/stage-colors";

interface DeleteStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  pipelineId: string;
  stage: CrmPipelineStage | null;
  allStages: CrmPipelineStage[];
  dealsCount: number;
  onStageDeleted: (deletedStageId: string, transferToStageId?: string) => void;
}

export function DeleteStageModal({
  isOpen,
  onClose,
  tenantId,
  pipelineId,
  stage,
  allStages,
  dealsCount,
  onStageDeleted,
}: DeleteStageModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTargetStageId, setSelectedTargetStageId] = useState<string>("");

  // Filtra outros fluxos disponíveis no mesmo funil
  const otherStages = allStages.filter((s) => s.id !== stage?.id);

  // Inicializa o fluxo de destino com o primeiro fluxo disponível
  useEffect(() => {
    if (otherStages.length > 0) {
      setSelectedTargetStageId(otherStages[0].id);
    } else {
      setSelectedTargetStageId("");
    }
  }, [stage?.id, allStages]);

  if (!stage) return null;

  const isOnlyStage = allStages.length <= 1;
  const hasDeals = dealsCount > 0;
  const canTransfer = otherStages.length > 0;
  const currentColor = stageColor(stage.colorToken);

  const handleDelete = async () => {
    if (isOnlyStage) {
      toast.error("Um funil comercial ativo precisa ter no mínimo 1 fluxo.");
      return;
    }

    if (hasDeals && !selectedTargetStageId) {
      toast.error("Selecione um fluxo de destino para transferir os cards.");
      return;
    }

    setLoading(true);
    try {
      const res = await deletePipelineStageAction(
        tenantId,
        pipelineId,
        stage.id,
        hasDeals ? selectedTargetStageId : undefined
      );

      if (!res.success) {
        const errorMsg = typeof res.message === "string" ? res.message : (res.message as any)?.message || "Erro ao excluir fluxo.";
        toast.error(errorMsg);
        return;
      }

      toast.success(
        hasDeals
          ? `Fluxo "${stage.name}" excluído e ${dealsCount} card(s) transferidos com sucesso!`
          : `Fluxo "${stage.name}" excluído com sucesso!`
      );
      onStageDeleted(stage.id, hasDeals ? selectedTargetStageId : undefined);
      onClose();
    } catch {
      toast.error("Erro inesperado ao excluir fluxo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-title">
                {isOnlyStage ? "Fluxo Obrigatório" : "Excluir Fluxo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {isOnlyStage
                  ? "Todo funil precisa ter ao menos um fluxo ativo."
                  : "Esta ação removerá a etapa do funil."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Card do Fluxo Selecionado */}
          <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-sm font-semibold text-slate-800">{stage.name}</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                hasDeals ? "bg-amber-100 text-amber-800" : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {dealsCount} {dealsCount === 1 ? "card" : "cards"}
            </span>
          </div>

          {/* Cenário 0: É o único fluxo restante no funil */}
          {isOnlyStage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Não é possível excluir o único fluxo deste funil.</strong>
                <br />
                Um funil comercial ativo precisa ter no mínimo 1 fluxo para funcionar e receber oportunidades.
                <br /><br />
                Para remover este funil por completo, utilize a opção de arquivar ou excluir o funil.
              </div>
            </div>
          )}

          {/* Cenário 1: Sem cards no fluxo e existem outros fluxos */}
          {!isOnlyStage && !hasDeals && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Este fluxo está vazio. Tem certeza de que deseja excluí-lo permanentemente deste funil?
            </p>
          )}

          {/* Cenário 2: Com cards e existem outros fluxos para transferir */}
          {!isOnlyStage && hasDeals && canTransfer && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Este fluxo possui <strong>{dealsCount} {dealsCount === 1 ? "card" : "cards"} ativo(s)</strong>.
                  Para não perder nenhuma negociação, selecione para onde deseja movê-los antes de excluir:
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Mover cards para o fluxo de destino:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {otherStages.map((other) => {
                    const isSelected = selectedTargetStageId === other.id;
                    const otherColor = stageColor(other.colorToken);
                    return (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => setSelectedTargetStageId(other.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-[#007BFF] bg-blue-50/60 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: otherColor }}
                          />
                          <span className="text-xs font-semibold text-slate-800">{other.name}</span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#007BFF]">
                            <span>Destino</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
            {isOnlyStage ? "Fechar" : "Cancelar"}
          </Button>

          {!isOnlyStage && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading || (hasDeals && !selectedTargetStageId)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Excluindo...
                </>
              ) : hasDeals ? (
                "Transferir Cards e Excluir"
              ) : (
                "Excluir Fluxo"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
