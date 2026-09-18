"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCrmPipelineSchema, CreateCrmPipeline, CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";
import { createPipelineAction } from "../actions/pipeline.actions";
import { createPipelineStageAction } from "../actions/stage.actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  Button, 
  Input, 
  Label 
} from "@bipesend/ui";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onPipelineCreated: (pipeline: CrmPipeline, initialStages?: CrmPipelineStage[]) => void;
}

const DEFAULT_STAGES = [
  { name: "Primeiro Contato", colorToken: "blue-500", category: "open" as const },
  { name: "Qualificação", colorToken: "indigo-500", category: "open" as const },
  { name: "Negociação", colorToken: "amber-500", category: "open" as const },
  { name: "Fechamento", colorToken: "emerald-500", category: "won" as const },
];

export function CreatePipelineModal({
  isOpen,
  onClose,
  tenantId,
  onPipelineCreated,
}: CreatePipelineModalProps) {
  const [loading, setLoading] = useState(false);
  const [includeDefaultStages, setIncludeDefaultStages] = useState(true);

  const form = useForm<CreateCrmPipeline>({
    resolver: zodResolver(createCrmPipelineSchema) as Resolver<CreateCrmPipeline>,
    defaultValues: {
      name: "",
      description: "",
      defaultCurrency: "BRL",
    },
  });

  const handleSubmit = async (data: CreateCrmPipeline) => {
    setLoading(true);
    try {
      const res = await createPipelineAction(tenantId, data);
      if (!res.success || !res.data) {
        toast.error(res.message || "Erro ao criar funil");
        return;
      }

      const newPipeline = res.data as CrmPipeline;
      const createdStages: CrmPipelineStage[] = [];

      // Opcionalmente inicializa com fluxos padrão
      if (includeDefaultStages) {
        for (let i = 0; i < DEFAULT_STAGES.length; i++) {
          const s = DEFAULT_STAGES[i];
          const stageRes = await createPipelineStageAction(tenantId, newPipeline.id, {
            pipelineId: newPipeline.id,
            name: s.name,
            colorToken: s.colorToken,
            category: s.category,
            position: i,
            requiredFieldRules: { version: 1, rules: [] },
          });
          if (stageRes.success && stageRes.data) {
            createdStages.push(stageRes.data as CrmPipelineStage);
          }
        }
      }

      toast.success(`Funil "${newPipeline.name}" criado com sucesso!`);
      form.reset();
      onPipelineCreated(newPipeline, createdStages);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado ao criar funil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="w-5 h-5 text-[#007BFF]" />
            Criar Novo Funil
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Crie um funil comercial para gerenciar seus fluxos de atendimento e oportunidades de venda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="pipeline-name" className="text-sm font-medium text-slate-700">
              Nome do Funil <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pipeline-name"
              placeholder="Ex.: Funil Comercial, Pós-Venda, Prospecção B2B"
              {...form.register("name")}
              disabled={loading}
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pipeline-desc" className="text-sm font-medium text-slate-700">
              Descrição (opcional)
            </Label>
            <Input
              id="pipeline-desc"
              placeholder="Breve descrição da finalidade deste funil"
              {...form.register("description")}
              disabled={loading}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeDefaultStages}
                onChange={(e) => setIncludeDefaultStages(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#007BFF] focus:ring-[#007BFF]"
                disabled={loading}
              />
              <span>Criar fluxos padrão automaticamente (Contato, Qualificação, etc.)</span>
            </label>
          </div>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando funil...
                </>
              ) : (
                "Criar Funil"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
