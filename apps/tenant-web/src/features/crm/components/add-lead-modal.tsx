"use client";

import { useState, useMemo } from "react";
import { 
  CrmContact, 
  CrmDeal, 
  CrmPipelineStage, 
  CreateCrmContact, 
  CreateCrmDeal 
} from "@bipesend/contracts";
import { createDealFromContactAction, createDealAction } from "../actions/deal.actions";
import { createContactAction } from "../actions/contact.actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  Button, 
  Input, 
  Label 
} from "@bipesend/ui";
import { 
  Search, 
  User, 
  MessageCircle, 
  Camera, 
  Music2, 
  Plus, 
  Check, 
  Loader2, 
  Sparkles, 
  Globe, 
  ExternalLink,
  CheckSquare,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { stageColor } from "./board/stage-colors";

export interface ConnectedAccount {
  id: string;
  name: string;
  provider: string; // 'evolution_api' | 'instagram' | 'tiktok'
  status: string;
  instanceName?: string;
  username?: string;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  pipelineId: string;
  stage: CrmPipelineStage;
  allContacts: CrmContact[];
  connectedAccounts?: ConnectedAccount[];
  onDealsCreated: (newDeals: CrmDeal[], newContacts?: CrmContact[]) => void;
}

type TabType = "search_system" | "import_instagram" | "import_tiktok" | "create_new";

export function AddLeadModal({
  isOpen,
  onClose,
  tenantId,
  pipelineId,
  stage,
  allContacts,
  connectedAccounts = [],
  onDealsCreated,
}: AddLeadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("search_system");
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seleção de conta conectada para Instagram e TikTok
  const instagramAccounts = connectedAccounts.filter(a => a.provider === "instagram");
  const tiktokAccounts = connectedAccounts.filter(a => a.provider === "tiktok");
  const [selectedInstaAccount, setSelectedInstaAccount] = useState<string>(instagramAccounts[0]?.id || "");
  const [selectedTiktokAccount, setSelectedTiktokAccount] = useState<string>(tiktokAccounts[0]?.id || "");

  // Estado do formulário de criação rápida
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadCpf, setNewLeadCpf] = useState("");
  const [newLeadSocial, setNewLeadSocial] = useState("");
  const [newLeadAmount, setNewLeadAmount] = useState("");
  const [newLeadChannel, setNewLeadChannel] = useState("whatsapp");

  const stageThemeColor = stageColor(stage.colorToken);

  // Helper para identificar o canal de um contato existente
  const getContactChannel = (c: CrmContact): { key: string; label: string; icon: typeof MessageCircle } => {
    const custom = (c.customFields || {}) as Record<string, unknown>;
    if (custom.channel === "instagram" || custom.instagram || custom.instagramHandle) {
      return { key: "instagram", label: "Instagram", icon: Camera };
    }
    if (custom.channel === "tiktok" || custom.tiktok || custom.tiktokHandle) {
      return { key: "tiktok", label: "TikTok", icon: Music2 };
    }
    if (c.phone || c.phoneE164 || custom.channel === "whatsapp") {
      return { key: "whatsapp", label: "WhatsApp", icon: MessageCircle };
    }
    return { key: "manual", label: "CRM", icon: Globe };
  };

  // Filtra os contatos do sistema de acordo com a busca e canal selecionado
  const filteredSystemContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const digitsOnly = term.replace(/\D/g, "");

    return allContacts.filter((contact) => {
      const channel = getContactChannel(contact);
      if (channelFilter !== "all" && channel.key !== channelFilter) {
        return false;
      }

      if (!term) return true;

      // 1. Nome
      if (contact.name.toLowerCase().includes(term)) return true;

      // 2. Email
      if (contact.email && contact.email.toLowerCase().includes(term)) return true;

      // 3. Telefone / WhatsApp
      const phoneDigits = (contact.phone || contact.phoneE164 || "").replace(/\D/g, "");
      if (digitsOnly.length >= 3 && phoneDigits.includes(digitsOnly)) return true;

      // 4. Custom fields: CPF, Instagram, TikTok
      if (contact.customFields) {
        const custom = contact.customFields as Record<string, unknown>;
        // CPF / Documento
        const cpf = String(custom.cpf || custom.document || "");
        const cpfDigits = cpf.replace(/\D/g, "");
        if (digitsOnly.length >= 3 && cpfDigits.includes(digitsOnly)) return true;
        if (cpf.toLowerCase().includes(term)) return true;

        // @ Instagram
        const insta = String(custom.instagram || custom.instagramHandle || custom.handle || "");
        if (insta.toLowerCase().includes(term)) return true;

        // @ TikTok
        const tiktok = String(custom.tiktok || custom.tiktokHandle || "");
        if (tiktok.toLowerCase().includes(term)) return true;

        // Qualquer outro campo
        const customStr = JSON.stringify(custom).toLowerCase();
        if (customStr.includes(term)) return true;
      }

      return false;
    });
  }, [allContacts, searchTerm, channelFilter]);

  // Helper para identificar e formatar o dado específico que bateu com a busca
  const getMatchedDetail = (contact: CrmContact) => {
    const term = searchTerm.trim().toLowerCase();
    const digitsOnly = term.replace(/\D/g, "");
    const custom = (contact.customFields || {}) as Record<string, unknown>;

    if (term) {
      // Se buscou CPF
      const cpf = String(custom.cpf || custom.document || "");
      const cpfDigits = cpf.replace(/\D/g, "");
      if ((digitsOnly.length >= 3 && cpfDigits.includes(digitsOnly)) || cpf.toLowerCase().includes(term)) {
        return { label: "CPF", value: cpf, highlight: true };
      }

      // Se buscou @ Instagram
      const insta = String(custom.instagram || custom.instagramHandle || "");
      if (insta.toLowerCase().includes(term)) {
        return { label: "Instagram", value: insta.startsWith("@") ? insta : `@${insta}`, highlight: true };
      }

      // Se buscou @ TikTok
      const tiktok = String(custom.tiktok || custom.tiktokHandle || "");
      if (tiktok.toLowerCase().includes(term)) {
        return { label: "TikTok", value: tiktok.startsWith("@") ? tiktok : `@${tiktok}`, highlight: true };
      }

      // Se buscou telefone
      const phone = contact.phone || contact.phoneE164 || "";
      const phoneDigits = phone.replace(/\D/g, "");
      if (digitsOnly.length >= 3 && phoneDigits.includes(digitsOnly)) {
        return { label: "WhatsApp", value: phone, highlight: true };
      }

      // Se buscou email
      if (contact.email && contact.email.toLowerCase().includes(term)) {
        return { label: "E-mail", value: contact.email, highlight: true };
      }
    }

    // Default quando não há termo de busca específico ou bateu pelo nome:
    // mostra o identificador mais relevante do contato
    if (custom.cpf) return { label: "CPF", value: String(custom.cpf), highlight: false };
    if (contact.phone || contact.phoneE164) return { label: "WhatsApp", value: contact.phone || contact.phoneE164 || "", highlight: false };
    if (custom.instagram || custom.instagramHandle) return { label: "Instagram", value: String(custom.instagram || custom.instagramHandle), highlight: false };
    if (contact.email) return { label: "E-mail", value: contact.email, highlight: false };
    return { label: "Identificador", value: "Cliente sem contato adicional", highlight: false };
  };

  // Toggle de seleção de um contato
  const toggleContactSelection = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Selecionar todos / Limpar seleção
  const handleSelectAll = () => {
    if (selectedContactIds.size === filteredSystemContacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(filteredSystemContacts.map(c => c.id)));
    }
  };

  // Ação de adicionar os selecionados ao fluxo
  const handleAddSelectedToStage = async () => {
    if (selectedContactIds.size === 0) return;
    setIsSubmitting(true);

    try {
      const createdDeals: CrmDeal[] = [];
      const selectedList = allContacts.filter(c => selectedContactIds.has(c.id));

      for (const contact of selectedList) {
        const res = await createDealFromContactAction(
          tenantId,
          pipelineId,
          stage.id,
          contact.id,
          contact.name
        );
        if (res.success && res.data) {
          createdDeals.push(res.data as CrmDeal);
        }
      }

      toast.success(`${createdDeals.length} lead(s) adicionado(s) ao fluxo "${stage.name}"!`);
      onDealsCreated(createdDeals);
      setSelectedContactIds(new Set());
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar leads ao fluxo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ação de criação rápida de novo lead
  const handleCreateFastLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) {
      toast.error("Informe o nome do lead.");
      return;
    }
    setIsSubmitting(true);

    try {
      const customFields: Record<string, unknown> = {
        channel: newLeadChannel,
      };
      if (newLeadCpf.trim()) customFields.cpf = newLeadCpf.trim();
      if (newLeadSocial.trim()) {
        if (newLeadChannel === "instagram") customFields.instagram = newLeadSocial.trim();
        else if (newLeadChannel === "tiktok") customFields.tiktok = newLeadSocial.trim();
        else customFields.socialHandle = newLeadSocial.trim();
      }

      const contactPayload: CreateCrmContact = {
        name: newLeadName.trim(),
        phone: newLeadPhone.trim() || null,
        email: newLeadEmail.trim() || null,
        source: "manual",
        customFields,
        status: "active",
        departmentId: null,
        routingRoleId: null,
        assignedMembershipId: null,
      };

      const contactRes = await createContactAction(tenantId, contactPayload);
      if (!contactRes.success || !contactRes.data) {
        toast.error(contactRes.message || "Erro ao cadastrar lead.");
        return;
      }

      const createdContact = contactRes.data as CrmContact;

      // Cria a oportunidade vinculada a este contato no fluxo atual
      const parsedAmount = newLeadAmount.trim() ? parseFloat(newLeadAmount.replace(",", ".")) : 0;
      const amountStr = isNaN(parsedAmount) || parsedAmount <= 0 ? "0.00" : parsedAmount.toFixed(2);

      const dealPayload: CreateCrmDeal = {
        pipelineId,
        stageId: stage.id,
        contactId: createdContact.id,
        title: `Negócio de ${createdContact.name}`,
        amount: amountStr,
        currency: "BRL",
      };

      const dealRes = await createDealAction(tenantId, pipelineId, dealPayload);
      if (!dealRes.success || !dealRes.data) {
        toast.error(dealRes.message || "Contato criado, mas houve erro ao gerar o negócio.");
        onDealsCreated([], [createdContact]);
        onClose();
        return;
      }

      const createdDeal = dealRes.data as CrmDeal;
      toast.success(`Lead "${createdContact.name}" adicionado com sucesso a "${stage.name}"!`);
      onDealsCreated([createdDeal], [createdContact]);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado ao criar lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header com badge de destino */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stageThemeColor }} 
                aria-hidden="true" 
              />
              <DialogTitle className="text-lg font-bold text-slate-900">
                Adicionar Leads ao Fluxo
              </DialogTitle>
            </div>
            <span 
              className="text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs"
              style={{ 
                borderColor: `${stageThemeColor}50`, 
                backgroundColor: `${stageThemeColor}15`, 
                color: stageThemeColor 
              }}
            >
              {stage.name}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Selecione clientes já existentes no sistema (WhatsApp, Instagram, TikTok), importe de canais integrados ou cadastre um novo lead.
          </DialogDescription>

          {/* Abas de Modo */}
          <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("search_system")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "search_system"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#007BFF]" />
              <span>Buscar Leads no Sistema</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("import_instagram")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "import_instagram"
                  ? "bg-white text-pink-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-pink-600" />
              <span>Importar do Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("import_tiktok")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "import_tiktok"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Music2 className="w-3.5 h-3.5 text-slate-900" />
              <span>Importar do TikTok</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("create_new")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "create_new"
                  ? "bg-white text-[#007BFF] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#007BFF]" />
              <span>Criar Novo Lead</span>
            </button>
          </div>
        </div>

        {/* ── ABA 1: BUSCAR LEADS NO SISTEMA (OMNICHANNEL) ── */}
        {activeTab === "search_system" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Barra de Busca e Filtro de Canais */}
            <div className="p-4 border-b border-slate-100 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Buscar por nome, WhatsApp/telefone, @insta/@tiktok, CPF ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#007BFF]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Filtrar:</span>
                  {[
                    { key: "all", label: "Todos" },
                    { key: "whatsapp", label: "WhatsApp" },
                    { key: "instagram", label: "Instagram" },
                    { key: "tiktok", label: "TikTok" },
                    { key: "manual", label: "Outros" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setChannelFilter(f.key)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] transition-colors ${
                        channelFilter === f.key
                          ? "bg-slate-900 text-white border-slate-900 font-medium"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredSystemContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#007BFF] hover:underline font-medium flex items-center gap-1"
                  >
                    {selectedContactIds.size === filteredSystemContacts.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        Desmarcar todos
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        Selecionar todos ({filteredSystemContacts.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Contatos com Checkboxes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSystemContacts.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <User className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-medium text-slate-600">Nenhum lead encontrado no sistema</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm ? "Tente pesquisar com outro termo ou limpe os filtros." : "Cadastre seu primeiro lead ou sincronize contatos."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={() => setActiveTab("create_new")}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1 text-[#007BFF]" />
                    Cadastrar novo lead agora
                  </Button>
                </div>
              ) : (
                filteredSystemContacts.map((contact) => {
                  const isSelected = selectedContactIds.has(contact.id);
                  const channel = getContactChannel(contact);
                  const ChannelIcon = channel.icon;
                  const detail = getMatchedDetail(contact);

                  // Iniciais para avatar
                  const initials = contact.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(n => n[0])
                    .join("")
                    .toUpperCase() || "L";

                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleContactSelection(contact.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected 
                          ? "border-[#007BFF] bg-blue-50/40 shadow-xs" 
                          : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Avatar, Nome e Detalhe correspondente à pesquisa */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {contact.name}
                            </h4>
                            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 shrink-0">
                              <ChannelIcon className="w-3 h-3 text-slate-500" />
                              {channel.label}
                            </span>
                          </div>

                          {/* Campo identificado na busca destacado */}
                          <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <span className={detail.highlight ? "font-semibold text-[#007BFF]" : "text-slate-500"}>
                              {detail.label}:
                            </span>
                            <span className={detail.highlight ? "font-semibold text-slate-900 bg-amber-100/70 px-1 rounded" : "text-slate-600"}>
                              {detail.value}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="ml-3 shrink-0">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-[#007BFF] border-[#007BFF] text-white shadow-2xs" 
                            : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Barra Inferior com Contador e Ação */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                {selectedContactIds.size === 0 
                  ? "Nenhum lead selecionado" 
                  : `${selectedContactIds.size} lead(s) selecionado(s)`}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  disabled={selectedContactIds.size === 0 || isSubmitting}
                  onClick={handleAddSelectedToStage}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    `Adicionar ao fluxo "${stage.name}"`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 2: IMPORTAR DO INSTAGRAM ── */}
        {activeTab === "import_instagram" && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-pink-50 border border-pink-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-pink-950">Importar Leads do Instagram Direct & Comentários</h4>
                <p className="text-xs text-pink-700 mt-0.5">
                  Conecte sua conta do Instagram para puxar os clientes e conversas direto para este fluxo.
                </p>
              </div>
            </div>

            {instagramAccounts.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-semibold text-slate-800">Nenhuma conta do Instagram conectada</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Para importar leads pelo @ do Instagram, acesse o painel de integrações e conecte sua conta comercial ou de criador de conteúdo.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.href = "/integrations";
                  }}
                  className="text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#007BFF]" />
                  Conectar Instagram em Integrações
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Selecione a conta do Instagram:</Label>
                  <select
                    value={selectedInstaAccount}
                    onChange={(e) => setSelectedInstaAccount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    {instagramAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.username || `@${acc.instanceName || "instagram"}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar clientes no inbox pelo @usuario, nome, telefone ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                  Pronto para importar mensagens e leads da conta selecionada.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* ── ABA 3: IMPORTAR DO TIKTOK ── */}
        {activeTab === "import_tiktok" && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Importar Leads do TikTok</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Importe oportunidades e contatos gerados a partir de vídeos, anúncios e comentários do TikTok.
                </p>
              </div>
            </div>

            {tiktokAccounts.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <Music2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-semibold text-slate-800">Nenhuma conta do TikTok conectada</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Acesse o menu de integrações para conectar sua conta do TikTok for Business ou perfil de criador.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.href = "/integrations";
                  }}
                  className="text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#007BFF]" />
                  Conectar TikTok em Integrações
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Selecione a conta do TikTok:</Label>
                  <select
                    value={selectedTiktokAccount}
                    onChange={(e) => setSelectedTiktokAccount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    {tiktokAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.username || `@${acc.instanceName || "tiktok"}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar leads no TikTok pelo @, telefone, CPF ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                  Pronto para importar leads e formulários instantâneos da conta TikTok.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* ── ABA 4: CRIAR NOVO LEAD (CADASTRO RÁPIDO) ── */}
        {activeTab === "create_new" && (
          <form onSubmit={handleCreateFastLead} className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="new-lead-name" className="text-xs font-semibold text-slate-700">
                  Nome do Lead / Cliente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-lead-name"
                  placeholder="Ex.: Mariana Silva Santos"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-phone" className="text-xs font-semibold text-slate-700">
                  WhatsApp / Telefone
                </Label>
                <Input
                  id="new-lead-phone"
                  placeholder="(11) 98765-4321"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-email" className="text-xs font-semibold text-slate-700">
                  E-mail
                </Label>
                <Input
                  id="new-lead-email"
                  type="email"
                  placeholder="mariana@exemplo.com.br"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-cpf" className="text-xs font-semibold text-slate-700">
                  CPF
                </Label>
                <Input
                  id="new-lead-cpf"
                  placeholder="000.000.000-00"
                  value={newLeadCpf}
                  onChange={(e) => setNewLeadCpf(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-social" className="text-xs font-semibold text-slate-700">
                  @ Instagram / TikTok
                </Label>
                <Input
                  id="new-lead-social"
                  placeholder="@perfil.do.cliente"
                  value={newLeadSocial}
                  onChange={(e) => setNewLeadSocial(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-amount" className="text-xs font-semibold text-slate-700">
                  Valor da Oportunidade (R$)
                </Label>
                <Input
                  id="new-lead-amount"
                  placeholder="1500,00"
                  value={newLeadAmount}
                  onChange={(e) => setNewLeadAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-lead-channel" className="text-xs font-semibold text-slate-700">
                  Canal de Origem
                </Label>
                <select
                  id="new-lead-channel"
                  value={newLeadChannel}
                  onChange={(e) => setNewLeadChannel(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="website">Site / Landing Page</option>
                  <option value="indication">Indicação</option>
                  <option value="manual">Manual / Outros</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  `Cadastrar e Adicionar a "${stage.name}"`
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
