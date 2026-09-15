"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button } from "@bipesend/ui";
import { createImportPreviewAction, commitImportAction } from "../actions/import.actions";
import { ContactImportBatch } from "@bipesend/contracts";
import { toast } from "sonner";

export function ContactImportModal({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [batch, setBatch] = useState<ContactImportBatch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimulateUpload = async () => {
    setIsSubmitting(true);
    
    // Simulate reading a CSV
    const simulatedRows = [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", phone: "123456789" },
    ];
    
    const requestKey = Math.random().toString(36).substring(7);
    const payloadHash = "hash123";

    const { data, message } = await createImportPreviewAction(tenantId, {
      requestKey,
      payloadHash,
      mapping: { name: "name", email: "email", phone: "phone" },
      stagedRows: simulatedRows
    });

    if (message || !data) {
      toast.error(message || "Erro ao processar arquivo");
    } else {
      setBatch(data);
      setStep("preview");
    }
    setIsSubmitting(false);
  };

  const handleCommit = async () => {
    if (!batch) return;
    setIsSubmitting(true);
    const { data, message } = await commitImportAction(tenantId, batch.id, {
      confirmationKey: Math.random().toString(36).substring(7)
    });

    if (message || !data) {
      toast.error(message || "Erro ao confirmar importação");
    } else {
      toast.success("Importação concluída com sucesso!");
      setStep("done");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => {
      setOpen(v);
      if (!v) { setTimeout(() => { setStep("upload"); setBatch(null); }, 200); }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">Importar CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Contatos</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm text-slate-500">
              Para este MVP (Slice 2), a importação aceita até 500 linhas. 
              Clique abaixo para simular o upload de um CSV com 2 contatos.
            </p>
            <Button onClick={handleSimulateUpload} disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Simular Upload CSV"}
            </Button>
          </div>
        )}

        {step === "preview" && batch && (
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-md border text-sm">
              <p><strong>Total de linhas:</strong> {batch.stagedRows?.length ?? 0}</p>
              <p><strong>Erros:</strong> {batch.rowIssues?.length ?? 0}</p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>Cancelar</Button>
              <Button onClick={handleCommit} disabled={isSubmitting}>
                {isSubmitting ? "Importando..." : "Confirmar Importação"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <div className="text-green-600 font-medium mb-4">Importação Finalizada!</div>
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
