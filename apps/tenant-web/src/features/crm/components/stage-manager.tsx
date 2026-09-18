"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Card, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CreateCrmPipelineStage, UpdateCrmPipelineStage } from "@bipesend/contracts";
import { getPipelineStagesAction, createPipelineStageAction, updatePipelineStageAction, deletePipelineStageAction } from "../actions/stage.actions";
import { toast } from "sonner";
import { Loader2, Plus, GripVertical, Trash2, Edit2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const stageFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.enum(["open", "won", "lost"]),
  colorToken: z.string().min(1),
});

type StageFormData = z.infer<typeof stageFormSchema>;

interface StageManagerProps {
  tenantId: string;
  pipeline: CrmPipeline;
}

export function StageManager({ tenantId, pipeline }: StageManagerProps) {
  const [stages, setStages] = useState<CrmPipelineStage[]>([]);
  const [loadedPipelineId, setLoadedPipelineId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<CrmPipelineStage | null>(null);

  const form = useForm<StageFormData>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      name: "",
      category: "open",
      colorToken: "bg-slate-200",
    },
  });

  useEffect(() => {
    let mounted = true;
    getPipelineStagesAction(tenantId, pipeline.id).then((res) => {
      if (mounted) {
        if (res.success) {
          // Ordenar por position
          const sorted = (res.data as CrmPipelineStage[]).sort((a, b) => a.position - b.position);
          setStages(sorted);
        } else {
          toast.error(res.message);
        }
        setLoadedPipelineId(pipeline.id);
      }
    });
    return () => { mounted = false; };
  }, [tenantId, pipeline.id]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions optimistically
    const updatedItems = items.map((item, index) => ({ ...item, position: index }));
    setStages(updatedItems);

    // Persist changes
    startTransition(async () => {
      // We would ideally have a bulk update endpoint for reordering.
      // For now, we call update for the ones that changed position.
      // Assuming backend updates correctly. A real app might need a specific endpoint.
      for (const item of updatedItems) {
        const original = stages.find(s => s.id === item.id);
        if (original && original.position !== item.position) {
            await updatePipelineStageAction(tenantId, pipeline.id, item.id, { position: item.position });
        }
      }
    });
  };

  const onSubmit = (data: StageFormData) => {
    startTransition(async () => {
      if (editingStage) {
        const payload: UpdateCrmPipelineStage = { ...data };
        const result = await updatePipelineStageAction(tenantId, pipeline.id, editingStage.id, payload);
        if (result.success) {
          toast.success(result.message);
          setStages(stages.map(s => s.id === editingStage.id ? { ...s, ...data } as CrmPipelineStage : s));
          setIsModalOpen(false);
        } else {
          toast.error(result.message);
        }
      } else {
        const payload: CreateCrmPipelineStage = {
          ...data,
          pipelineId: pipeline.id,
          position: stages.length, // Põe no fim
          requiredFieldRules: { version: 1, rules: [] }
        };
        const result = await createPipelineStageAction(tenantId, pipeline.id, payload);
        if (result.success) {
          toast.success(result.message);
          setStages([...stages, result.data as CrmPipelineStage]);
          setIsModalOpen(false);
        } else {
          toast.error(result.message);
        }
      }
    });
  };

  const openCreateModal = () => {
    setEditingStage(null);
    form.reset({ name: "", category: "open", colorToken: "bg-slate-200" });
    setIsModalOpen(true);
  };

  const openEditModal = (stage: CrmPipelineStage) => {
    setEditingStage(stage);
    form.reset({ name: stage.name, category: stage.category, colorToken: stage.colorToken });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta etapa?")) return;
    startTransition(async () => {
      const result = await deletePipelineStageAction(tenantId, pipeline.id, id);
      if (result.success) {
        toast.success(result.message);
        setStages(stages.filter(s => s.id !== id));
      } else {
        toast.error(result.message);
      }
    });
  };

  if (loadedPipelineId !== pipeline.id) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Etapa
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stages-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {stages.length === 0 ? (
                <div className="text-center p-4 text-slate-500 text-sm border border-dashed rounded-lg">
                  Nenhuma etapa criada.
                </div>
              ) : (
                stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className={`w-3 h-3 rounded-full ${stage.colorToken}`} />
                          <div>
                            <p className="font-medium text-sm">{stage.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{stage.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(stage)}>
                            <Edit2 className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(stage.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Etapa" : "Nova Etapa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Etapa</Label>
              <Input id="name" {...form.register("name")} placeholder="Ex: Prospecção" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select 
                {...form.register("category")} 
                className="ui-input h-10"
                disabled={isPending}
              >
                <option value="open">Aberto (Open)</option>
                <option value="won">Ganho (Won)</option>
                <option value="lost">Perdido (Lost)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <select 
                {...form.register("colorToken")} 
                className="ui-input h-10"
                disabled={isPending}
              >
                <option value="bg-slate-200">Cinza</option>
                <option value="bg-blue-500">Azul</option>
                <option value="bg-green-500">Verde</option>
                <option value="bg-yellow-500">Amarelo</option>
                <option value="bg-red-500">Vermelho</option>
                <option value="bg-purple-500">Roxo</option>
              </select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
