"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash, Tags, Filter, Database, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bipesend/ui";
import { CrmContact, CrmSegment, CustomField } from "@bipesend/contracts";
import { deleteContactAction, getContactsAction } from "../actions/contact.actions";
import { getSegmentsAction, previewSegmentAction } from "../actions/segment.actions";
import { getCustomFieldsAction } from "../actions/custom-field.actions";
import { ContactFormModal } from "./contact-form-modal";
import { TagManagerModal } from "./tag-manager-modal";
import { SegmentBuilderModal } from "./segment-builder";
import { CustomFieldsManagerModal } from "./custom-fields-manager";
import { ContactImportModal } from "./contact-import-modal";

interface ContactListClientProps {
  tenantId: string;
  initialContacts: CrmContact[];
}

export function ContactListClient({ tenantId, initialContacts }: ContactListClientProps) {
  const [contacts, setContacts] = useState<CrmContact[]>(initialContacts);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);

  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  
  const [isSegmentBuilderOpen, setIsSegmentBuilderOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CrmSegment | null>(null);

  const fetchData = async () => {
    const resSeg = await getSegmentsAction(tenantId);
    if (resSeg.success && resSeg.data) {
      setSegments(resSeg.data);
    }
    const resFields = await getCustomFieldsAction(tenantId, "contact");
    if (resFields.success && resFields.data) {
      setCustomFields(resFields.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  useEffect(() => {
    async function applySegment() {
      if (!selectedSegmentId) {
        const res = await getContactsAction(tenantId);
        if (res.success && res.data) {
          setContacts(res.data);
        }
        return;
      }

      const segment = segments.find(s => s.id === selectedSegmentId);
      if (!segment) return;
      
      const res = await previewSegmentAction(tenantId, segment.filterAst);
      if (res.success && res.data) {
        setContacts(res.data);
      } else {
        toast.error("Erro ao aplicar segmento");
      }
    }
    applySegment();
  }, [selectedSegmentId, tenantId]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    
    const res = await deleteContactAction(tenantId, id);
    if (res.success) {
      toast.success(res.message);
      setContacts(contacts.filter(c => c.id !== id));
    } else {
      toast.error(res.message);
    }
  };

  const handleEdit = (contact: CrmContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleCreateSegment = () => {
    setEditingSegment(null);
    setIsSegmentBuilderOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">Contatos (Aba de Clientes)</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            Gerencie sua base de clientes, importe e exporte contatos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ContactImportModal tenantId={tenantId} />
          <CustomFieldsManagerModal tenantId={tenantId} initialFields={customFields} />
          
          <Button variant="outline" onClick={() => setIsTagManagerOpen(true)} className="h-[38px] text-[14px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
            <Tags className="w-4 h-4 mr-2" />
            Tags
          </Button>

          <Button variant="outline" onClick={handleCreateSegment} className="h-[38px] text-[14px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Segmentos
          </Button>
          
          <Button onClick={handleCreate} className="h-[38px] text-[14px] font-medium bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white shadow-sm transition-all rounded-[10px]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between px-6 py-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="relative flex-1 min-w-[250px] sm:max-w-[400px] flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Buscar contatos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[34px] pl-9 pr-4 text-[13px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[8px] focus:outline-none focus:border-[#0A74FF] dark:focus:border-[#0A74FF] text-[#0F172A] dark:text-white w-full transition-all"
            />
          </div>
          <select 
            className="h-[34px] text-[13px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[8px] focus:outline-none focus:border-[#0A74FF] text-[#0F172A] dark:text-white px-3"
            value={selectedSegmentId}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
          >
            <option value="">Todos os Contatos</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        <Button variant="outline" className="h-[34px] text-[13px] border-[#E2E8F0] dark:border-[#334155]">
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto p-6 bg-[#F8FAFC] dark:bg-[#0B1120]">
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E293B]/50 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Nome</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Telefone</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">E-mail</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Tags (Etiquetas)</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Origem</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Status</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground text-[14px]">
                      Nenhum contato encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(user => (
                    <tr key={user.id} className="border-b border-[#E2E8F0] dark:border-[#334155] last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0A74FF]/10 text-[#0A74FF] flex items-center justify-center font-bold text-[12px]">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#475569] dark:text-[#CBD5E1] font-medium">{user.phone || "-"}</td>
                      <td className="px-5 py-4 text-[13px] text-[#475569] dark:text-[#CBD5E1]">{user.email || "-"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(user as any).tags && (user as any).tags.length > 0 ? (user as any).tags.map((t: string) => (
                            <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]">{t}</span>
                          )) : (
                            <span className="text-[11px] text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#64748B] dark:text-[#94A3B8] capitalize">{user.source || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 text-[11px] font-medium rounded-md ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {user.status === "active" ? "Ativo" : "Arquivado"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors rounded-md hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ContactFormModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          tenantId={tenantId}
          initialData={editingContact}
          onSuccess={(savedContact) => {
            if (editingContact) {
              setContacts(contacts.map(c => c.id === savedContact.id ? savedContact : c));
            } else {
              setContacts([savedContact, ...contacts]);
            }
            setIsModalOpen(false);
          }}
        />
      )}

      {isTagManagerOpen && (
        <TagManagerModal 
          isOpen={isTagManagerOpen}
          setIsOpen={setIsTagManagerOpen}
          tenantId={tenantId}
        />
      )}

      {isSegmentBuilderOpen && (
        <SegmentBuilderModal 
          isOpen={isSegmentBuilderOpen}
          setIsOpen={setIsSegmentBuilderOpen}
          tenantId={tenantId}
          initialSegment={editingSegment}
          onSuccess={(segment) => {
            setIsSegmentBuilderOpen(false);
            fetchData();
            setSelectedSegmentId(segment.id);
          }}
        />
      )}
    </div>
  );
}
