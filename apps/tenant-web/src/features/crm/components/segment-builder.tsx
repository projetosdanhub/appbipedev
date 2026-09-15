"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash, Save } from "lucide-react";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@bipesend/ui";
import { createSegmentAction, updateSegmentAction } from "../actions/segment.actions";
import { CrmSegment, CreateCrmSegment, FilterGroup, FilterCondition } from "@bipesend/contracts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCrmSegmentSchema } from "@bipesend/contracts";

interface SegmentBuilderProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  tenantId: string;
  initialSegment?: CrmSegment | null;
  onSuccess: (segment: CrmSegment) => void;
}

const FIELD_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "tagId", label: "Tag (ID)" },
  { value: "email", label: "E-mail" },
  { value: "name", label: "Nome" },
];

const OPERATOR_OPTIONS = [
  { value: "eq", label: "Igual a" },
  { value: "ne", label: "Diferente de" },
  { value: "in", label: "Contém um dos" },
  { value: "not_in", label: "Não contém" },
  { value: "is_empty", label: "Está vazio" },
];

export function SegmentBuilderModal({ isOpen, setIsOpen, tenantId, initialSegment, onSuccess }: SegmentBuilderProps) {
  const [loading, setLoading] = useState(false);
  
  const extractConditions = (): any[] => {
    if (initialSegment?.filterAst && initialSegment.filterAst.type === "group") {
      return initialSegment.filterAst.conditions as any[];
    }
    return [{ field: "status", operator: "eq", value: "" }];
  };

  const [conditions, setConditions] = useState<any[]>(extractConditions());
  
  const form = useForm<any>({
    resolver: zodResolver(createCrmSegmentSchema),
    defaultValues: {
      name: initialSegment?.name || "",
      description: initialSegment?.description || "",
      visibility: "tenant",
      status: "active",
      filterAst: initialSegment?.filterAst || { type: "group", logic: "and", conditions: [] },
      schemaVersion: 1
    },
  });

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "status", operator: "eq", value: "" }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, key: string, val: any) => {
    const newConds = [...conditions];
    newConds[index] = { ...newConds[index], [key]: val };
    setConditions(newConds);
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    
    const filterAst: FilterGroup = {
      type: "group",
      logic: "and",
      conditions: conditions.map(c => ({
        type: "condition",
        field: c.field,
        operator: c.operator,
        value: c.value
      }))
    };
    
    values.filterAst = filterAst;

    if (initialSegment) {
      const { data, message } = await updateSegmentAction(tenantId, initialSegment.id, values);
      if (data) {
        toast.success("Segmento atualizado");
        onSuccess(data);
        setIsOpen(false);
      } else {
        toast.error(message || "Erro ao atualizar");
      }
    } else {
      const { data, message } = await createSegmentAction(tenantId, values as CreateCrmSegment);
      if (data) {
        toast.success("Segmento criado");
        onSuccess(data);
        setIsOpen(false);
      } else {
        toast.error(message || "Erro ao criar");
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialSegment ? "Editar" : "Novo"} Segmento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Segmento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Clientes VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">Filtros (E / AND)</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCondition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {conditions.map((cond, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={cond.field} onChange={(e) => updateCondition(i, "field", e.target.value)}
                  >
                    {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={cond.operator} onChange={(e) => updateCondition(i, "operator", e.target.value)}
                  >
                    {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <Input 
                    placeholder="Valor" 
                    value={cond.value} 
                    onChange={(e) => updateCondition(i, "value", e.target.value)}
                  />

                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveCondition(i)}>
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              
              {conditions.length === 0 && (
                <p className="text-sm text-slate-500 italic">Nenhuma condição. Todos os contatos serão incluídos.</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Segmento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
