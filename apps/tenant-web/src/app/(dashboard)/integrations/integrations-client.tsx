"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FilterChip,
  PageContainer,
  PageHeader,
  SearchField,
  StatusBadge,
  Toolbar,
  Input,
  Label,
} from "@bipesend/ui";
import {
  Check,
  Camera,
  Loader2,
  MessageCircle,
  Music2,
  SearchX,
  ShieldCheck,
  Store,
  Plus,
  Trash2,
  QrCode,
  AlertTriangle,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/lib/useRealtime";
import { 
  createWhatsAppConnectionAction, 
  createSocialConnectionAction, 
  deleteConnectionAction 
} from "@/features/integrations/actions/connection.actions";
import "./integrations.css";

type StoreCategory = "all" | "messaging" | "social";

export interface ConnectionRecord {
  id: string;
  name: string;
  provider: string;
  status: string;
  instanceName?: string;
  phone?: string | null;
  qrcode?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

const MAX_CONNECTIONS_PER_CHANNEL = 3;

export function IntegrationsClient({
  tenantId,
  initialConnections,
  sessionToken,
}: {
  tenantId: string;
  initialConnections: ConnectionRecord[];
  sessionToken?: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<StoreCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Modais de Criação
  const [showNewWhatsModal, setShowNewWhatsModal] = useState(false);
  const [whatsName, setWhatsName] = useState("");
  const [isCreatingWhats, setIsCreatingWhats] = useState(false);

  const [showNewSocialModal, setShowNewSocialModal] = useState<"instagram" | "tiktok" | null>(null);
  const [socialName, setSocialName] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [isCreatingSocial, setIsCreatingSocial] = useState(false);

  // Modal de QR Code
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeQrData, setActiveQrData] = useState<{ qrcode: string | null; name: string; instanceName: string; isConnected: boolean }>({
    qrcode: null,
    name: "",
    instanceName: "",
    isConnected: false,
  });

  const [deletingInstance, setDeletingInstance] = useState<string | null>(null);

  useRealtime({
    tenantId,
    token: sessionToken,
    onEvent: (event, payload) => {
      if (event === "connection.changed") {
        router.refresh();
      } else if (event === "connection.qrcode" && typeof payload.qrcode === "string") {
        setActiveQrData(prev => ({
          ...prev,
          qrcode: payload.qrcode,
          instanceName: payload.instanceName || prev.instanceName,
        }));
        setShowQrModal(true);
        router.refresh();
      }
    },
  });

  // Filtra conexões por tipo
  const whatsappConnections = useMemo(() => {
    return initialConnections.filter(c => c.provider === "evolution_api" || !c.provider);
  }, [initialConnections]);

  const instagramConnections = useMemo(() => {
    return initialConnections.filter(c => c.provider === "instagram");
  }, [initialConnections]);

  const tiktokConnections = useMemo(() => {
    return initialConnections.filter(c => c.provider === "tiktok");
  }, [initialConnections]);

  // Ação: Criar nova instância do WhatsApp
  const handleCreateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsName.trim()) {
      toast.error("Informe um nome para identificar este número de WhatsApp.");
      return;
    }

    if (whatsappConnections.length >= MAX_CONNECTIONS_PER_CHANNEL) {
      toast.error(`Limite do plano atingido: máximo de ${MAX_CONNECTIONS_PER_CHANNEL} números.`);
      return;
    }

    setIsCreatingWhats(true);
    try {
      const res = await createWhatsAppConnectionAction(whatsName.trim());
      if (res.success && res.data) {
        const data = res.data as { qrcode?: string; instanceName?: string };
        toast.success("Instância criada com sucesso! Escaneie o QR Code.");
        setShowNewWhatsModal(false);
        setWhatsName("");

        // Abre o modal de QR Code
        setActiveQrData({
          qrcode: data.qrcode || null,
          name: whatsName.trim(),
          instanceName: data.instanceName || "",
          isConnected: false,
        });
        setShowQrModal(true);
        router.refresh();
      } else {
        toast.error(res.message || "Erro ao criar conexão de WhatsApp.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao conectar WhatsApp.");
    } finally {
      setIsCreatingWhats(false);
    }
  };

  // Ação: Conectar Instagram ou TikTok
  const handleCreateSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNewSocialModal || !socialName.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const provider = showNewSocialModal;
    const currentCount = provider === "instagram" ? instagramConnections.length : tiktokConnections.length;
    if (currentCount >= MAX_CONNECTIONS_PER_CHANNEL) {
      toast.error(`Limite do plano atingido: máximo de ${MAX_CONNECTIONS_PER_CHANNEL} contas.`);
      return;
    }

    setIsCreatingSocial(true);
    try {
      const res = await createSocialConnectionAction(provider, socialName.trim(), socialHandle.trim());
      if (res.success) {
        toast.success(`Conta ${provider === "instagram" ? "Instagram" : "TikTok"} conectada com sucesso!`);
        setShowNewSocialModal(null);
        setSocialName("");
        setSocialHandle("");
        router.refresh();
      } else {
        toast.error(res.message || `Erro ao conectar ${provider}.`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Erro ao conectar ${provider}.`);
    } finally {
      setIsCreatingSocial(false);
    }
  };

  // Ação: Excluir / Desconectar conexão
  const handleDeleteConnection = async (instanceName?: string) => {
    if (!instanceName) return;
    if (!confirm("Deseja realmente desconectar este canal? O atendimento deste número/conta será pausado.")) {
      return;
    }

    setDeletingInstance(instanceName);
    try {
      const res = await deleteConnectionAction(instanceName);
      if (res.success) {
        toast.success("Canal desconectado com sucesso.");
        if (activeQrData.instanceName === instanceName) {
          setShowQrModal(false);
        }
        router.refresh();
      } else {
        toast.error(res.message || "Erro ao desconectar canal.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao desconectar canal.");
    } finally {
      setDeletingInstance(null);
    }
  };

  // Ação: Abrir QR Code de uma conexão existente
  const handleOpenQrCode = (conn: ConnectionRecord) => {
    setActiveQrData({
      qrcode: conn.qrcode || null,
      name: conn.name,
      instanceName: conn.instanceName || "",
      isConnected: conn.status === "connected",
    });
    setShowQrModal(true);
  };

  const categories = [
    { value: "all" as const, label: "Todas", count: 3 },
    { value: "messaging" as const, label: "Mensageria (WhatsApp)", count: 1 },
    { value: "social" as const, label: "Redes Sociais", count: 2 },
  ];

  const totalActive = initialConnections.filter(c => c.status === "connected").length;

  return (
    <PageContainer className="integrations-page">
      <PageHeader
        title="Canais de Atendimento & Integrações"
        description="Conecte até 3 números de WhatsApp (Evolution API), 3 perfis do Instagram e 3 perfis do TikTok para alimentar o Inbox e o CRM."
        actions={
          <Badge variant="info" className="integrations-native-badge">
            <Store aria-hidden="true" className="ui-icon" />
            Loja Oficial BipeSend
          </Badge>
        }
      />

      {/* ── Banner de Limite por Plano e Métricas ── */}
      <section className="integrations-summary" aria-label="Resumo das integrações">
        <div>
          <span>WhatsApp (Evolution API)</span>
          <strong>{whatsappConnections.length} / {MAX_CONNECTIONS_PER_CHANNEL}</strong>
          <small>{whatsappConnections.filter(c => c.status === "connected").length} número(s) ativo(s)</small>
        </div>
        <div>
          <span>Redes Sociais (Insta & TikTok)</span>
          <strong>{instagramConnections.length + tiktokConnections.length} / {MAX_CONNECTIONS_PER_CHANNEL * 2}</strong>
          <small>{instagramConnections.length} Instagram · {tiktokConnections.length} TikTok</small>
        </div>
        <div>
          <span>Canais Ativos no Inbox</span>
          <strong>{totalActive}</strong>
          <small>Prontos para atendimento</small>
        </div>
      </section>

      <Toolbar className="integrations-toolbar">
        <div className="integrations-filters" aria-label="Filtrar integrações por categoria">
          {categories.map((item) => (
            <FilterChip
              key={item.value}
              selected={category === item.value}
              count={item.count}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
        <SearchField
          label="Buscar integração"
          placeholder="WhatsApp, Instagram, TikTok..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          onSearch={setAppliedSearch}
        />
      </Toolbar>

      {/* ── SEÇÃO 1: WHATSAPP (EVOLUTION API - ATÉ 3 NÚMEROS) ── */}
      {(category === "all" || category === "messaging") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-emerald-950">WhatsApp Oficial (Evolution API)</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                    {whatsappConnections.length} de {MAX_CONNECTIONS_PER_CHANNEL} números
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  Conecte até 3 números distintos com QR Code seguro e isolamento de instâncias.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={whatsappConnections.length >= MAX_CONNECTIONS_PER_CHANNEL}
              onClick={() => setShowNewWhatsModal(true)}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {whatsappConnections.length >= MAX_CONNECTIONS_PER_CHANNEL 
                ? "Limite de 3 números atingido" 
                : "Conectar Novo WhatsApp"}
            </Button>
          </div>

          {/* Cards das Instâncias do WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whatsappConnections.map((conn) => {
              const isConnected = conn.status === "connected";
              const isConnecting = conn.status === "connecting";

              return (
                <div 
                  key={conn.id || conn.instanceName} 
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          isConnected ? "bg-emerald-600" : isConnecting ? "bg-amber-500 animate-pulse" : "bg-slate-400"
                        }`}>
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{conn.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[150px]">
                            {conn.instanceName}
                          </span>
                        </div>
                      </div>

                      {isConnected ? (
                        <StatusBadge status="success">Conectado</StatusBadge>
                      ) : isConnecting ? (
                        <StatusBadge status="warning">Aguardando QR</StatusBadge>
                      ) : (
                        <StatusBadge status="info">Desconectado</StatusBadge>
                      )}
                    </div>

                    {conn.phone && (
                      <div className="mt-3 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 font-mono">
                        📱 {conn.phone}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenQrCode(conn)}
                      className="text-xs flex-1"
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1 text-[#007BFF]" />
                      {isConnected ? "Ver Conexão" : "Escanear QR Code"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteConnection(conn.instanceName)}
                      disabled={deletingInstance === conn.instanceName}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 shrink-0"
                      title="Desconectar este número"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {whatsappConnections.length === 0 && (
              <div className="col-span-3 p-8 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">Nenhum número de WhatsApp conectado</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Cadastre seu primeiro número para receber e enviar mensagens pelo Inbox e gerenciar leads no CRM.
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowNewWhatsModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Cadastrar Número Agora
                </Button>
              </div>
            )}
          </div>

          {/* Diretrizes e Boas Práticas Anti-Banimento */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Diretrizes e Boas Práticas de Segurança Anti-Bloqueio Ativas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong>Delays Humanizados</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Intervalos randômicos de envio configurados para evitar detecção de disparos automáticos.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong>Rejeição de Chamadas</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Chamadas recebidas no WhatsApp são rejeitadas suavemente com mensagem de texto para não travar a conexão.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong>Webhooks Autenticados</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cada evento de mensagem e QR Code passa por validação segura de tenant no backend.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEÇÃO 2: INSTAGRAM (ATÉ 3 CONTAS) ── */}
      {(category === "all" || category === "social") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-pink-50/60 border border-pink-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-pink-950">Instagram Direct & Comentários</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-200/80 text-pink-800">
                    {instagramConnections.length} de {MAX_CONNECTIONS_PER_CHANNEL} contas
                  </span>
                </div>
                <p className="text-xs text-pink-800/80 mt-0.5">
                  Conecte até 3 perfis comerciais ou de criadores para centralizar mensagens do Direct e leads.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={instagramConnections.length >= MAX_CONNECTIONS_PER_CHANNEL}
              onClick={() => {
                setShowNewSocialModal("instagram");
                setSocialName("");
                setSocialHandle("");
              }}
              className="shrink-0 text-pink-700 border-pink-300 hover:bg-pink-100/50"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {instagramConnections.length >= MAX_CONNECTIONS_PER_CHANNEL 
                ? "Limite de 3 contas atingido" 
                : "Conectar Conta Instagram"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instagramConnections.map((conn) => (
              <div key={conn.id || conn.instanceName} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        IG
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{conn.name}</h4>
                        <span className="text-xs text-pink-600 font-medium">
                          {(conn.metadata as any)?.username || `@${conn.instanceName?.replace("instagram-", "")}`}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status="success">Ativo</StatusBadge>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(conn.instanceName)}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>
              </div>
            ))}

            {instagramConnections.length === 0 && (
              <div className="col-span-3 p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/40 text-xs text-slate-500">
                Nenhuma conta do Instagram conectada ainda. Clique em "Conectar Conta Instagram" para iniciar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SEÇÃO 3: TIKTOK (ATÉ 3 CONTAS) ── */}
      {(category === "all" || category === "social") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-100 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">TikTok Leads & Relacionamento</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {tiktokConnections.length} de {MAX_CONNECTIONS_PER_CHANNEL} contas
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Conecte até 3 contas de criador ou TikTok for Business para capturar leads de campanhas e comentários.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={tiktokConnections.length >= MAX_CONNECTIONS_PER_CHANNEL}
              onClick={() => {
                setShowNewSocialModal("tiktok");
                setSocialName("");
                setSocialHandle("");
              }}
              className="shrink-0 text-slate-800 border-slate-300 hover:bg-slate-200/50"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {tiktokConnections.length >= MAX_CONNECTIONS_PER_CHANNEL 
                ? "Limite de 3 contas atingido" 
                : "Conectar Conta TikTok"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiktokConnections.map((conn) => (
              <div key={conn.id || conn.instanceName} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                        TT
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{conn.name}</h4>
                        <span className="text-xs text-slate-600 font-medium">
                          {(conn.metadata as any)?.username || `@${conn.instanceName?.replace("tiktok-", "")}`}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status="success">Ativo</StatusBadge>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(conn.instanceName)}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>
              </div>
            ))}

            {tiktokConnections.length === 0 && (
              <div className="col-span-3 p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/40 text-xs text-slate-500">
                Nenhuma conta do TikTok conectada ainda. Clique em "Conectar Conta TikTok" para iniciar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: CADASTRAR NOVO WHATSAPP ── */}
      <Dialog open={showNewWhatsModal} onOpenChange={setShowNewWhatsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              Conectar Novo Número de WhatsApp
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Informe um nome identificador para este número (ex.: "WhatsApp Vendas", "Suporte Nível 1"). Em seguida, o QR Code será gerado em tempo real.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWhatsApp} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="whats-name" className="text-xs font-semibold text-slate-700">
                Nome da Conexão <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whats-name"
                placeholder="Ex.: WhatsApp Principal, Loja Centro, Atendimento VIP"
                value={whatsName}
                onChange={(e) => setWhatsName(e.target.value)}
                disabled={isCreatingWhats}
                autoFocus
                required
              />
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Você poderá conectar até 3 números simultâneos neste workspace com total separação de conversas e leads no CRM.</span>
            </div>

            <DialogFooter className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewWhatsModal(false)} disabled={isCreatingWhats}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isCreatingWhats || !whatsName.trim()}>
                {isCreatingWhats ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Criando instância...
                  </>
                ) : (
                  "Gerar QR Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CONECTAR REDE SOCIAL (INSTAGRAM / TIKTOK) ── */}
      <Dialog open={Boolean(showNewSocialModal)} onOpenChange={(val) => { if (!val) setShowNewSocialModal(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              {showNewSocialModal === "instagram" ? (
                <>
                  <Camera className="w-5 h-5 text-pink-600" />
                  Conectar Conta do Instagram
                </>
              ) : (
                <>
                  <Music2 className="w-5 h-5 text-slate-900" />
                  Conectar Conta do TikTok
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Informe o nome de identificação e o @ do perfil para conectar com as filas do Inbox e importações do CRM.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSocial} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="social-name" className="text-xs font-semibold text-slate-700">
                Nome da Conta / Identificador <span className="text-red-500">*</span>
              </Label>
              <Input
                id="social-name"
                placeholder="Ex.: Loja Principal, Perfil Criador"
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                disabled={isCreatingSocial}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="social-handle" className="text-xs font-semibold text-slate-700">
                Nome de Usuário (@handle)
              </Label>
              <Input
                id="social-handle"
                placeholder="@seuperfil"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                disabled={isCreatingSocial}
              />
            </div>

            <DialogFooter className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewSocialModal(null)} disabled={isCreatingSocial}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isCreatingSocial || !socialName.trim()}>
                {isCreatingSocial ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar Canal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EXIBIR QR CODE DO WHATSAPP ── */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="integration-qr-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              {activeQrData.name ? `Conectar ${activeQrData.name}` : "Conectar WhatsApp"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Escaneie o código com seu WhatsApp para ativar a conexão em tempo real neste workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="integration-qr-content" aria-live="polite">
            {activeQrData.qrcode ? (
              <>
                <p className="text-xs text-slate-600">
                  Abra o WhatsApp no celular, toque nos 3 pontinhos ou Configurações &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong> e aponte para a tela.
                </p>
                <div className="integration-qr-frame bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <Image
                    src={activeQrData.qrcode.startsWith("data:image/") ? activeQrData.qrcode : `data:image/png;base64,${activeQrData.qrcode}`}
                    alt="QR Code para conectar o WhatsApp"
                    width={256}
                    height={256}
                    unoptimized
                    className="rounded-lg"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Instância: {activeQrData.instanceName}
                </span>
              </>
            ) : activeQrData.isConnected ? (
              <div className="integration-connected-state py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <strong className="text-base text-slate-900 block font-bold">WhatsApp Conectado!</strong>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A conexão está ativa e pronta para uso nas conversas do Inbox e geração de leads do CRM.
                </p>
              </div>
            ) : (
              <div className="integration-loading-state py-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <strong className="text-sm text-slate-800 block font-bold">Gerando QR Code Seguro...</strong>
                <p className="text-xs text-slate-400 mt-1">
                  Aguardando resposta da Evolution API para renderizar o código.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowQrModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
