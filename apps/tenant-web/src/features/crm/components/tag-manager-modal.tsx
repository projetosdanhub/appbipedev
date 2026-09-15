"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCrmTagSchema, CreateCrmTag, CrmTag, UpdateCrmTag } from "@bipesend/contracts";
import { getTagsAction, createTagAction, updateTagAction, deleteTagAction } from "../actions/tag.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bipesend/ui";
import { Plus, Pencil, Trash, X } from "lucide-react";

interface TagManagerModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  tenantId: string;
}

const COLOR_OPTIONS = [
  { value: "bg-blue-100 text-blue-800", label: "Azul" },
  { value: "bg-green-100 text-green-800", label: "Verde" },
  { value: "bg-red-100 text-red-800", label: "Vermelho" },
  { value: "bg-yellow-100 text-yellow-800", label: "Amarelo" },
  { value: "bg-purple-100 text-purple-800", label: "Roxo" },
  { value: "bg-gray-100 text-gray-800", label: "Cinza" },
];

export function TagManagerModal({ isOpen, setIsOpen, tenantId }: TagManagerModalProps) {
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<CrmTag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    const res = await getTagsAction(tenantId);
    if (res.success && res.data) {
      setTags(res.data);
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  }, [tenantId]);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, fetchTags]);

  const handleDelete = async (tag: CrmTag) => {
    if (!confirm(`Deseja excluir a tag "${tag.name}"?`)) return;
    const res = await deleteTagAction(tenantId, tag.id);
    if (res.success) {
      toast.success(res.message);
      setTags(tags.filter((t) => t.id !== tag.id));
    } else {
      toast.error(res.message);
    }
  };

  const handleEdit = (tag: CrmTag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {!isFormOpen && (
            <div className="flex justify-end">
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" /> Nova Tag
              </Button>
            </div>
          )}

          {isFormOpen ? (
            <TagForm 
              tenantId={tenantId}
              initialData={editingTag}
              onCancel={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                fetchTags();
              }}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">Carregando...</TableCell>
                    </TableRow>
                  ) : tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhuma tag encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tag.colorToken || "bg-gray-100 text-gray-800"}`}>
                            {tag.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(tag)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TagForm({ tenantId, initialData, onCancel, onSuccess }: { tenantId: string, initialData: CrmTag | null, onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCrmTag>({
    resolver: zodResolver(createCrmTagSchema),
    defaultValues: {
      name: initialData?.name || "",
      colorToken: initialData?.colorToken || COLOR_OPTIONS[0].value,
      status: initialData?.status || "active",
    },
  });

  async function onSubmit(data: CreateCrmTag) {
    setLoading(true);
    try {
      if (initialData) {
        const res = await updateTagAction(tenantId, initialData.id, data as UpdateCrmTag);
        if (res.success) {
          toast.success(res.message);
          onSuccess();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createTagAction(tenantId, data);
        if (res.success) {
          toast.success(res.message);
          onSuccess();
        } else {
          toast.error(res.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{initialData ? "Editar Tag" : "Criar Nova Tag"}</h3>
          <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Tag</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Cliente VIP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="colorToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${field.value === color.value ? 'border-primary' : 'border-transparent'} ${color.value}`}
                      onClick={() => field.onChange(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
