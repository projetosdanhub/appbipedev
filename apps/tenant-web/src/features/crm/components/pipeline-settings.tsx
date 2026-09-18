"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@bipesend/ui";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCrmPipelineSchema, CreateCrmPipeline, CrmPipeline } from "@bipesend/contracts";
import { createPipelineAction, deletePipelineAction } from "../actions/pipeline.actions";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import { StageManager } from "./stage-manager";

interface PipelineSettingsProps {
  tenantId: string;
  initialPipelines: CrmPipeline[];
}

export function PipelineSettings({ tenantId, initialPipelines }: PipelineSettingsProps) {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>(initialPipelines);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<CrmPipeline | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCrmPipeline>({
    resolver: zodResolver(createCrmPipelineSchema) as Resolver<CreateCrmPipeline>,
    defaultValues: {
      name: "",
      description: "",
      defaultCurrency: "BRL",
    },
  });

  const onSubmit = (data: CreateCrmPipeline) => {
    startTransition(async () => {
      const result = await createPipelineAction(tenantId, data);
      if (result.success) {
        toast.success(result.message);
        setPipelines([...pipelines, result.data as CrmPipeline]);
        setIsCreateOpen(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pipeline? Todos os negócios e etapas serão perdidos.")) return;
    
    startTransition(async () => {
      const result = await deletePipelineAction(tenantId, id);
      if (result.success) {
        toast.success(result.message);
        setPipelines(pipelines.filter((p) => p.id !== id));
        if (selectedPipeline?.id === id) setSelectedPipeline(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Pipelines de Negócios</h2>
          <p className="text-sm text-slate-500">Gerencie seus funis de vendas e etapas.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Pipelines */}
        <div className="md:col-span-1 space-y-4">
          {pipelines.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-slate-500">
                Nenhum pipeline criado.
              </CardContent>
            </Card>
          ) : (
            pipelines.map((pipeline) => (
              <Card 
                key={pipeline.id} 
                className={`cursor-pointer transition-colors hover:border-blue-500 ${selectedPipeline?.id === pipeline.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                onClick={() => setSelectedPipeline(pipeline)}
              >
                <CardHeader className="p-4 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{pipeline.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-1">{pipeline.description || 'Sem descrição'}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(pipeline.id); }} disabled={isPending}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Gerenciador de Etapas */}
        <div className="md:col-span-2">
          {selectedPipeline ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Etapas: {selectedPipeline.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StageManager tenantId={tenantId} pipeline={selectedPipeline} />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-slate-500 flex flex-col items-center">
                <Settings2 className="w-10 h-10 mb-2 opacity-20" />
                <p>Selecione um pipeline para gerenciar suas etapas.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pipeline</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pipeline</Label>
              <Input id="name" {...form.register("name")} placeholder="Ex: Vendas B2B" disabled={isPending} />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input id="description" {...form.register("description")} placeholder="Ex: Processo de vendas enterprise" disabled={isPending} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
