"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@bipesend/ui";
import { CrmPipelineStage, CrmDeal } from "@bipesend/contracts";
import { createDealAction, updateDealAction, moveDealAction } from "../actions/deal.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { InboxPanel } from "../../inbox/components/inbox-panel";
// Aqui usamos um schema mais frouxo no client e dependemos do Backend, 
// pois as regras dinâmicas estão lá, mas poderíamos checar client-side também.

interface DealEditorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  pipelineId: string;
  stage?: CrmPipelineStage; // Etapa destino se for move, ou etapa atual
  existingDeal?: CrmDeal | null;
  isMoveMode?: boolean; // Se verdadeiro, estamos movendo e atualizando campos faltantes
  onSuccess: (deal: CrmDeal) => void;
}

export function DealEditorModal({ 
  isOpen, 
  onOpenChange, 
  tenantId, 
  pipelineId,
  stage,
  existingDeal,
  isMoveMode,
  onSuccess 
}: DealEditorModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<any>({
    defaultValues: {
      title: "",
      amount: "0.00",
      currency: "BRL",
      expectedCloseDate: "",
      contactId: ""
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (existingDeal) {
        form.reset({
          title: existingDeal.title,
          amount: existingDeal.amount,
          currency: existingDeal.currency,
          expectedCloseDate: existingDeal.expectedCloseDate ? new Date(existingDeal.expectedCloseDate).toISOString().split('T')[0] : "",
          contactId: existingDeal.contactId,
        });
      } else {
        form.reset({
          title: "",
          amount: "0.00",
          currency: "BRL",
          expectedCloseDate: "",
          contactId: "" // Para fins de teste, um input simples, na real usariamos um Combobox de Contatos
        });
      }
    }
  }, [isOpen, existingDeal, form]);

  const isFieldRequired = (entity: string, field: string) => {
    if (!stage || !stage.requiredFieldRules?.rules) return false;
    return stage.requiredFieldRules.rules.some(
      (r: any) => r.entity === entity && r.field === field
    );
  };

  const isAmountRequired = isFieldRequired("deal", "amount");
  const isExpectedCloseDateRequired = isFieldRequired("deal", "expectedCloseDate");

  const onSubmit = (data: any) => {
    startTransition(async () => {
      // Ajusta payload
      const payload: any = { ...data };
      if (payload.expectedCloseDate) {
        payload.expectedCloseDate = new Date(payload.expectedCloseDate).toISOString();
      } else {
        payload.expectedCloseDate = null;
      }

      if (isMoveMode && existingDeal && stage) {
        // Estamos movendo e preenchendo o que faltava
        const result = await moveDealAction(tenantId, pipelineId, existingDeal.id, {
          expectedVersion: existingDeal.version,
          toStageId: stage.id,
          payload: payload // Backend deve suportar receber payload no move para atualizar e mover numa só transação
        });
        if (result.success) {
          toast.success(result.message);
          onSuccess(result.data as CrmDeal);
        } else {
          toast.error(result.message);
        }
      } else if (existingDeal) {
        // Update normal
        const result = await updateDealAction(tenantId, pipelineId, existingDeal.id, payload);
        if (result.success) {
          toast.success(result.message);
          onSuccess(result.data as CrmDeal);
        } else {
          toast.error(result.message);
        }
      } else {
        // Criar novo
        payload.stageId = stage?.id;
        const result = await createDealAction(tenantId, pipelineId, payload);
        if (result.success) {
          toast.success(result.message);
          onSuccess(result.data as CrmDeal);
        } else {
          toast.error(result.message);
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isMoveMode ? `Preencha os campos para mover para ${stage?.name}` : (existingDeal ? "Editar Negócio" : "Novo Negócio")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Negócio *</Label>
            <Input id="title" {...form.register("title")} disabled={isPending} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactId">ID do Contato *</Label>
            <Input id="contactId" {...form.register("contactId")} placeholder="ex: 12345..." disabled={isPending} required />
            <p className="text-xs text-slate-500">Temporário: Insira o ID real de um contato existente do tenant.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor {isAmountRequired ? "*" : ""}</Label>
              <Input id="amount" type="number" step="0.01" {...form.register("amount")} disabled={isPending} required={isAmountRequired} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Previsão {isExpectedCloseDateRequired ? "*" : ""}</Label>
              <Input id="expectedCloseDate" type="date" {...form.register("expectedCloseDate")} disabled={isPending} required={isExpectedCloseDateRequired} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isMoveMode ? "Salvar e Mover" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>

        {existingDeal && existingDeal.contactId && !isMoveMode && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-800 mb-4">Atendimento ao Contato</h4>
            <InboxPanel tenantId={tenantId} contactId={existingDeal.contactId} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
