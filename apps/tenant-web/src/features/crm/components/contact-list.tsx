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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar contatos..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={selectedSegmentId}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
          >
            <option value="">Todos os Contatos</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <ContactImportModal tenantId={tenantId} />
          <CustomFieldsManagerModal tenantId={tenantId} initialFields={customFields} />
          <Button variant="outline" onClick={() => setIsTagManagerOpen(true)}>
            <Tags className="mr-2 h-4 w-4" /> Tags
          </Button>
          <Button variant="outline" onClick={handleCreateSegment}>
            <Filter className="mr-2 h-4 w-4" /> Segmentos
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Contato
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>{contact.phone || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
