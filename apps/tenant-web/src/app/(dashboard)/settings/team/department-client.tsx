"use client";

import { useState } from "react";
import { Button, Input } from "@bipesend/ui";
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "@/features/team/actions/department.actions";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export function DepartmentClient({ departments, tenantId }: {
  departments: any[],
  tenantId: string
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    let res;
    if (editingId) {
      res = await updateDepartmentAction(editingId, { name, description });
    } else {
      res = await createDepartmentAction({ name, description });
    }
    
    setMessage(res.message);
    setLoading(false);
    
    if (res.success) {
      setName("");
      setDescription("");
      setEditingId(null);
      setShowForm(false);
      router.refresh();
    }
  }

  function handleEdit(dept: any) {
    setName(dept.name);
    setDescription(dept.description || "");
    setEditingId(dept.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este setor?")) return;
    
    setLoading(true);
    const res = await deleteDepartmentAction(id);
    if (!res.success) {
      setMessage(res.message);
    }
    setLoading(false);
    router.refresh();
  }

  function handleCancel() {
    setName("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
    setMessage("");
  }

  return (
    <div className="space-y-8">
      {!showForm && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Setores</h3>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Setor
          </Button>
        </div>
      )}

      {showForm && (
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-4">{editingId ? 'Editar Setor' : 'Novo Setor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do Setor</label>
              <Input 
                type="text" 
                placeholder="Ex: Comercial" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição (Opcional)</label>
              <Input 
                type="text" 
                placeholder="Descrição das atividades do setor" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Salvar Alterações' : 'Criar Setor'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </form>
          {message && <p className={`mt-4 text-sm ${message.includes('sucesso') ? 'text-green-600' : 'text-destructive'}`}>{message}</p>}
        </div>
      )}

      {!showForm && departments.length === 0 && (
        <div className="p-8 text-center border rounded-lg border-dashed">
          <p className="text-muted-foreground">Nenhum setor cadastrado neste workspace.</p>
        </div>
      )}

      {!showForm && departments.length > 0 && (
        <div className="border rounded-lg divide-y">
          {departments.map(dept => (
            <div key={dept.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{dept.name}</p>
                {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(dept.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
