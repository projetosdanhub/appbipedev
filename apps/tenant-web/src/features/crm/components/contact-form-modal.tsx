"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCrmContactSchema, CreateCrmContact, CrmContact } from "@bipesend/contracts";
import { createContactAction, updateContactAction } from "../actions/contact.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Button } from "@bipesend/ui";

interface ContactFormModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  tenantId: string;
  initialData: CrmContact | null;
  onSuccess: (contact: CrmContact) => void;
}

export function ContactFormModal({ isOpen, setIsOpen, tenantId, initialData, onSuccess }: ContactFormModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCrmContact>({
    resolver: zodResolver(createCrmContactSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || null,
      phone: initialData?.phone || null,
      customFields: initialData?.customFields || {},
      departmentId: initialData?.departmentId || null,
      routingRoleId: initialData?.routingRoleId || null,
      assignedMembershipId: initialData?.assignedMembershipId || null,
      status: initialData?.status || "active",
      source: initialData?.source || "manual",
    },
  });

  async function onSubmit(data: CreateCrmContact) {
    setLoading(true);
    try {
      const sanitizedData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      };

      if (initialData) {
        const res = await updateContactAction(tenantId, initialData.id, sanitizedData);
        if (res.success) {
          toast.success(res.message);
          onSuccess(res.data);
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createContactAction(tenantId, sanitizedData);
        if (res.success) {
          toast.success(res.message);
          onSuccess(res.data);
        } else {
          toast.error(res.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Contato" : "Novo Contato"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="mr-2">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
