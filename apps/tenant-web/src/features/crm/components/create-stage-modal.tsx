"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CrmPipelineStage, CreateCrmPipelineStage, UpdateCrmPipelineStage } from "@bipesend/contracts";
import { createPipelineStageAction, updatePipelineStageAction } from "../actions/stage.actions";
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
import { Loader2, Palette, Check } from "lucide-react";
import { toast } from "sonner";
import { stageColor } from "./board/stage-colors";

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  pipelineId: string;
  stageToEdit?: CrmPipelineStage | null;
  existingCount?: number;
  onStageSaved: (stage: CrmPipelineStage, isEdit: boolean) => void;
}

const AVAILABLE_COLORS = [
  { token: "blue-500", name: "Azul Bipe", hex: "#2f7ff7" },
  { token: "indigo-500", name: "Índigo", hex: "#5c63dc" },
  { token: "purple-500", name: "Violeta", hex: "#7067e8" },
  { token: "pink-500", name: "Rosa", hex: "#db5790" },
  { token: "green-500", name: "Verde Esmeralda", hex: "#0e9f6e" },
  { token: "teal-500", name: "Verde Água", hex: "#10968c" },
  { token: "cyan-500", name: "Ciano", hex: "#0891b2" },
  { token: "yellow-500", name: "Amarelo Âmbar", hex: "#d98b16" },
  { token: "orange-500", name: "Laranja", hex: "#dc7626" },
  { token: "red-500", name: "Vermelho Carmim", hex: "#df4c6c" },
  { token: "slate-500", name: "Cinza Ardósia", hex: "#64748b" },
];

export function CreateStageModal({
  isOpen,
  onClose,
  tenantId,
  pipelineId,
  stageToEdit,
  existingCount = 0,
  onStageSaved,
}: CreateStageModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("blue-500");

  const isEdit = Boolean(stageToEdit);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{ name: string; category: "open" | "won" | "lost" }>({
    defaultValues: {
      name: "",
      category: "open",
    },
  });

  useEffect(() => {
    if (stageToEdit) {
      setValue("name", stageToEdit.name);
      setValue("category", stageToEdit.category);
      setSelectedColor(stageToEdit.colorToken || "blue-500");
    } else {
      reset({ name: "", category: "open" });
      // Escolhe uma cor diferente com base na posição
      const colorIndex = existingCount % AVAILABLE_COLORS.length;
      setSelectedColor(AVAILABLE_COLORS[colorIndex].token);
    }
  }, [stageToEdit, existingCount, reset, setValue]);

  const onSubmit = async (data: { name: string; category: "open" | "won" | "lost" }) => {
    if (!data.name.trim()) return;
    setLoading(true);

    try {
      if (isEdit && stageToEdit) {
        const payload: UpdateCrmPipelineStage = {
          name: data.name.trim(),
          colorToken: selectedColor,
          category: data.category,
        };
        const res = await updatePipelineStageAction(tenantId, pipelineId, stageToEdit.id, payload);
        if (!res.success || !res.data) {
          toast.error(res.message || "Erro ao atualizar etapa.");
          return;
        }
        toast.success(`Fluxo "${data.name}" atualizado com sucesso!`);
        onStageSaved(res.data as CrmPipelineStage, true);
        onClose();
      } else {
        const payload: CreateCrmPipelineStage = {
          pipelineId,
          name: data.name.trim(),
          colorToken: selectedColor,
          category: data.category,
          position: existingCount,
          requiredFieldRules: { version: 1, rules: [] },
        };
        const res = await createPipelineStageAction(tenantId, pipelineId, payload);
        if (!res.success || !res.data) {
          toast.error(res.message || "Erro ao criar etapa.");
          return;
        }
        toast.success(`Fluxo "${data.name}" adicionado com sucesso!`);
        onStageSaved(res.data as CrmPipelineStage, false);
        onClose();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado ao salvar fluxo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Palette className="w-5 h-5 text-[#007BFF]" />
            {isEdit ? "Editar Fluxo do Funil" : "Adicionar Novo Fluxo ao Funil"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Os fluxos são as etapas onde ficam organizados os cards e oportunidades dos clientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="stage-name" className="text-sm font-medium text-slate-700">
              Nome do Fluxo (Etapa) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stage-name"
              placeholder="Ex.: Primeiro Contato, Em Qualificação, Negociação, Fechamento"
              {...register("name", { required: "Nome do fluxo é obrigatório" })}
              disabled={loading}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Seleção de Cor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Cor do Fluxo
            </Label>
            <p className="text-xs text-slate-500">
              A cor identifica a coluna no Kanban e colore a borda lateral dos cards deste fluxo.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {AVAILABLE_COLORS.map((c) => {
                const isSelected = selectedColor === c.token;
                return (
                  <button
                    key={c.token}
                    type="button"
                    onClick={() => setSelectedColor(c.token)}
                    className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      isSelected 
                        ? "border-slate-800 bg-slate-50 shadow-sm ring-2 ring-slate-400/40" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                    title={c.name}
                  >
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </span>
                    <span className="text-[10px] text-slate-600 mt-1 truncate max-w-full text-center">
                      {c.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria do Fluxo */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <Label htmlFor="stage-category" className="text-sm font-medium text-slate-700">
              Tipo do Fluxo
            </Label>
            <select
              id="stage-category"
              {...register("category")}
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF]"
            >
              <option value="open">Aberto (Em andamento / negociação)</option>
              <option value="won">Ganho (Negócio fechado com sucesso)</option>
              <option value="lost">Perdido (Negócio cancelado ou arquivado)</option>
            </select>
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
                  Salvando...
                </>
              ) : isEdit ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Fluxo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
