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
  IntegrationCard,
  PageContainer,
  PageHeader,
  SearchField,
  StatusBadge,
  Toolbar,
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
} from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/lib/useRealtime";
import { createWhatsAppConnectionAction, deleteConnectionAction } from "@/features/integrations/actions/connection.actions";
import "./integrations.css";

type StoreCategory = "all" | "messaging" | "social";

interface ConnectionRecord {
  id: string;
  name: string;
  provider: string;
  status: string;
  qrcode?: string | null;
  created_at?: string;
}

const storeCatalog = [
  {
    provider: "evolution_api",
    name: "WhatsApp",
    search: "whatsapp evolution api mensagens atendimento qr code",
    category: "messaging" as const,
  },
  {
    provider: "instagram",
    name: "Instagram",
    search: "instagram direct comentários social meta",
    category: "social" as const,
  },
  {
    provider: "tiktok",
    name: "TikTok",
    search: "tiktok comentários social vídeos leads",
    category: "social" as const,
  },
];

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
  const [isInstalling, setIsInstalling] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);


  useRealtime({
    tenantId,
    token: sessionToken,
    onEvent: (event, payload) => {
      if (event === "connection.changed") {
        router.refresh();
      } else if (event === "connection.qrcode" && typeof payload.qrcode === "string") {
        setQrCodeData(payload.qrcode);
        setShowQrModal(true);
      }
    },
  });

  const whatsappConnection = initialConnections.find(
    (connection) => connection.provider === "evolution_api",
  );
  const isWhatsappConnected = whatsappConnection?.status === "connected";
  const isWhatsappConnecting = whatsappConnection?.status === "connecting";

  const visibleProviders = useMemo(() => {
    const query = appliedSearch.trim().toLocaleLowerCase("pt-BR");
    return storeCatalog.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!query || item.search.includes(query) || item.name.toLocaleLowerCase("pt-BR").includes(query)),
    );
  }, [appliedSearch, category]);

  const handleInstallWhatsApp = async () => {
    setIsInstalling(true);
    setQrCodeData(null);
    setShowQrModal(true);
    const result = await createWhatsAppConnectionAction("WhatsApp");
    if (result.success) {
      const data = result.data as { qrcode?: unknown };
      if (typeof data.qrcode === "string") setQrCodeData(data.qrcode);
      toast.success("Instalação iniciada. Escaneie o QR Code para concluir.");
      router.refresh();
    } else {
      toast.error(result.message);
      setShowQrModal(false);
    }
    setIsInstalling(false);
  };

  const categories = [
    { value: "all" as const, label: "Todas", count: storeCatalog.length },
    { value: "messaging" as const, label: "Mensageria", count: 1 },
    { value: "social" as const, label: "Redes sociais", count: 2 },
  ];

  return (
    <PageContainer className="integrations-page">
      <PageHeader
        title="Loja de integrações"
        description="Instale canais nativos e acompanhe o estado das conexões do seu workspace."
        actions={
          <Badge variant="info" className="integrations-native-badge">
            <Store aria-hidden="true" className="ui-icon" />
            Loja nativa BipeSend
          </Badge>
        }
      />

      <section className="integrations-summary" aria-label="Resumo das integrações">
        <div>
          <span>Disponíveis agora</span>
          <strong>1</strong>
          <small>WhatsApp via Evolution API</small>
        </div>
        <div>
          <span>Em preparação</span>
          <strong>2</strong>
          <small>Instagram e TikTok</small>
        </div>
        </div>
        <div>
          <span>Conexões ativas</span>
          <strong>{initialConnections.filter((item) => item.status === "connected").length}</strong>
          <small>Neste workspace</small>
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
          label="Buscar na loja"
          placeholder="WhatsApp, Instagram, TikTok..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          onSearch={setAppliedSearch}
        />
      </Toolbar>

      {visibleProviders.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title="Nenhuma integração encontrada"
          description="Tente outro termo ou remova o filtro de categoria."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setAppliedSearch("");
                setCategory("all");
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <section className="integrations-grid" aria-label="Integrações disponíveis">
          {visibleProviders.some((item) => item.provider === "evolution_api") && (
            <IntegrationCard
              name="WhatsApp"
              provider="Evolution API · não oficial"
              description="Centralize conversas do WhatsApp usando uma instância conectada por QR Code."
              icon={<MessageCircle />}
              badge={
                isWhatsappConnecting ? (
                  <StatusBadge status="warning">Conectando</StatusBadge>
                ) : isWhatsappConnected ? (
                  <StatusBadge status="success">Instalado</StatusBadge>
                ) : (
                  <StatusBadge status="info">Disponível</StatusBadge>
                )
              }
              tags={["Mensageria", "QR Code", "Tempo real"]}
              features={["Inbox compartilhado", "Envio e recebimento de mensagens", "Eventos de conexão em tempo real"]}
              action={
                <Button
                  variant={isWhatsappConnected ? "outline" : "primary"}
                  isLoading={isInstalling}
                  disabled={isWhatsappConnecting}
                  onClick={() => {
                    if (isWhatsappConnected) setShowQrModal(true);
                    else void handleInstallWhatsApp();
                  }}
                >
                  {isWhatsappConnected ? <ShieldCheck aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
                  {isWhatsappConnected
                    ? "Ver conexão"
                    : isWhatsappConnecting
                      ? "Aguardando conexão"
                      : "Instalar WhatsApp"}
                </Button>
              }
            />
          )}

          {visibleProviders.some((item) => item.provider === "instagram") && (
            <IntegrationCard
              name="Instagram"
              provider="Meta · canal social"
              description="Prepare o atendimento de Direct e comentários em uma única fila de relacionamento."
              icon={<Camera />}
              badge={<Badge variant="info">Em preparação</Badge>}
              tags={["Rede social", "Direct", "Comentários"]}
              features={["Arquitetura da loja pronta", "Fluxo OAuth será implementado no backend", "Permissões da Meta serão validadas antes da ativação"]}
              action={<Button variant="secondary" disabled>Instalação ainda indisponível</Button>}
            />
          )}

          {visibleProviders.some((item) => item.provider === "tiktok") && (
            <IntegrationCard
              name="TikTok"
              provider="TikTok · canal social"
              description="Estruture futuros fluxos de comentários, leads e relacionamento originados no TikTok."
              icon={<Music2 />}
              badge={<Badge variant="info">Em preparação</Badge>}
              tags={["Rede social", "Comentários", "Leads"]}
              features={["Entrada prevista na loja nativa", "Escopos oficiais serão revisados", "Nenhuma credencial é solicitada nesta etapa"]}
              action={<Button variant="secondary" disabled>Instalação ainda indisponível</Button>}
            />
          )}
        </section>
      )}

      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="integration-qr-dialog">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Integração não oficial por Evolution API. A disponibilidade depende da instância configurada pelo seu workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="integration-qr-content" aria-live="polite">
            {qrCodeData ? (
              <>
                <p>Abra o WhatsApp no celular, acesse <strong>Aparelhos conectados</strong> e escaneie o código.</p>
                <div className="integration-qr-frame">
                  <Image
                    src={qrCodeData.startsWith("data:image/") ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                    alt="QR Code para conectar o WhatsApp"
                    width={256}
                    height={256}
                    unoptimized
                  />
                </div>
              </>
            ) : isWhatsappConnected ? (
              <div className="integration-connected-state">
                <span aria-hidden="true"><Check /></span>
                <strong>WhatsApp conectado</strong>
                <p>A conexão está ativa e pronta para uso no Inbox.</p>
              </div>
            ) : (
              <div className="integration-loading-state">
                <Loader2 aria-hidden="true" />
                <strong>Preparando a conexão</strong>
                <p>O QR Code aparecerá aqui assim que a Evolution API responder.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
