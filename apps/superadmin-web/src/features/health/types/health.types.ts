export type ServiceStatus = "healthy" | "degraded" | "down";

export interface KnownErrorCatalogItem {
  code: string;
  service: string;
  name: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  probableCause: string;
  remediation: string;
  suggestedAction: string;
}

export interface MonitoredService {
  id: string;
  name: string;
  category: "database" | "cache" | "gateway" | "ai" | "auth";
  status: ServiceStatus;
  latencyMs: number;
  uptime: string;
  lastChecked: string;
  endpoint: string;
  activeConnections: number;
  description: string;
  currentErrorCode?: string;
}

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: string;
  status: ServiceStatus;
  latencyMs: number;
  message: string;
  errorCode?: string;
  details?: string;
}

export const KNOWN_ERRORS_CATALOG: KnownErrorCatalogItem[] = [
  {
    code: "ERR_DB_POOL_TIMEOUT",
    service: "PostgreSQL Database",
    name: "Esgotamento do Pool de Conexões",
    severity: "CRITICAL",
    probableCause: "Pico elevado de conexões simultâneas ou transações longas sem fechamento no Prisma ORM.",
    remediation: "Aumentar o parâmetro ?connection_limit=25 no DATABASE_URL ou reiniciar o pooler PgBouncer.",
    suggestedAction: "Reiniciar Pooler & Inspecionar Consultas Lentas",
  },
  {
    code: "ERR_REDIS_CONN_REFUSED",
    service: "Redis Cache & Filas",
    name: "Conexão Recusada no Redis / BullMQ",
    severity: "CRITICAL",
    probableCause: "Serviço Redis indisponível, limite de memória maxmemory atingido ou porta 6379 bloqueada.",
    remediation: "Verificar se o processo Redis está ativo via 'systemctl status redis' ou inspecionar a memória do pod.",
    suggestedAction: "Verificar Serviço Redis & Limpar Memória",
  },
  {
    code: "ERR_WHATSAPP_GATEWAY_TIMEOUT",
    service: "BipeSend WhatsApp Gateway",
    name: "Instância de WhatsApp Inacessível",
    severity: "WARNING",
    probableCause: "O Gateway BipeSend WhatsApp não respondeu ao ping no endpoint dentro de 3000ms.",
    remediation: "Reiniciar o container do Gateway BipeSend WhatsApp e verificar se as credenciais estão corretas na Loja de Integrações.",
    suggestedAction: "Recarregar Container BipeSend WhatsApp Gateway",
  },
  {
    code: "ERR_AI_PROVIDER_RATE_LIMIT",
    service: "Gateway de IA (Gemini / OpenAI)",
    name: "Cota ou Limite de Requisições Excedido (HTTP 429)",
    severity: "WARNING",
    probableCause: "O provedor de IA ativo atingiu a cota de tokens por minuto da chave atual da plataforma.",
    remediation: "Alternar para o provedor secundário na aba Loja de Integrações ou vincular nova chave de faturamento.",
    suggestedAction: "Alternar Provedor de IA ou Atualizar Chave",
  },
  {
    code: "ERR_AUTH_DESYNC_2FA",
    service: "Autenticação & 2FA",
    name: "Dessincronização de Tokens TOTP",
    severity: "INFO",
    probableCause: "Diferença no relógio interno do servidor (drift de horário de mais de 30 segundos).",
    remediation: "Configurar sincronização periódica de horário via protocolo NTP (Network Time Protocol).",
    suggestedAction: "Sincronizar Relógio do Servidor com NTP",
  },
  {
    code: "ERR_WEBHOOK_QUEUE_BACKPRESSURE",
    service: "Workers & Filas BullMQ",
    name: "Backpressure em Processamento de Mensagens",
    severity: "WARNING",
    probableCause: "Volume massivo de webhooks externos de campanhas superando a capacidade de consumo dos workers.",
    remediation: "Escalar horizontalmente a quantidade de réplicas do processo worker ou aumentar concorrência.",
    suggestedAction: "Escalar Concorrência dos Workers",
  },
];
