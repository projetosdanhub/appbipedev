"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button, Input, Label } from "@bipesend/ui";
import { CustomField } from "@bipesend/contracts";
import { createCustomFieldAction, deleteCustomFieldAction } from "../actions/custom-field.actions";

export function CustomFieldsManagerModal({ tenantId, initialFields = [] }: { tenantId: string, initialFields?: CustomField[] }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<CustomField[]>(initialFields);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<CustomField["type"]>("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!key || !label) return;
    setIsSubmitting(true);
    const { data, message } = await createCustomFieldAction(tenantId, {
      entityType: "contact",
      key,
      label,
      type,
      options: null,
      status: "active"
    });
    if (data) {
      setFields([...fields, data]);
      setKey("");
      setLabel("");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { success } = await deleteCustomFieldAction(tenantId, id);
    if (success) {
      setFields(fields.filter(f => f.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gerenciar Campos</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Campos Customizados</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-2 border-b pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Chave (key)</Label>
                <Input value={key} onChange={(e: any) => setKey(e.target.value)} placeholder="ex: cargo" />
              </div>
              <div>
                <Label>Rótulo (label)</Label>
                <Input value={label} onChange={(e: any) => setLabel(e.target.value)} placeholder="ex: Cargo atual" />
              </div>
              <div>
                <Label>Tipo</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={type} 
                  onChange={(e: any) => setType(e.target.value)}
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Data</option>
                  <option value="boolean">Verdadeiro/Falso</option>
                </select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={isSubmitting || !key || !label}>
              Adicionar Campo
            </Button>
          </div>

          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded">
                <div>
                  <span className="font-medium">{f.label}</span>
                  <span className="text-sm text-slate-500 ml-2">({f.key}) - {f.type}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(f.id)}>Remover</Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum campo customizado</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
