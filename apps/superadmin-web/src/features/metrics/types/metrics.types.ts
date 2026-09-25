export type MetricCategory = "essential" | "important" | "optional";

export interface MetricDefinition {
  id: string;
  category: MetricCategory;
  categoryLabel: string;
  label: string;
  description: string;
  defaultValue: string;
  defaultTrend: string;
  iconName: "Users" | "CreditCard" | "Activity" | "Server" | "Bot" | "ShieldCheck" | "Zap" | "TrendingUp" | "Cpu" | "Layers" | "Sparkles" | "BarChart3";
  accentColor: "blue" | "emerald" | "violet" | "amber" | "slate";
  defaultEnabled: boolean;
  defaultOrder: number;
}

export interface MetricPreferenceItem {
  id: string;
  enabled: boolean;
  order: number;
}

export const METRIC_CATALOG: MetricDefinition[] = [
  // ── ESSENCIAIS ──
  {
    id: "tenants_count",
    category: "essential",
    categoryLabel: "Essenciais",
    label: "Empresas Clientes (Workspaces)",
    description: "Total de empresas com workspaces ativos e cadastrados na plataforma.",
    defaultValue: "48",
    defaultTrend: "+14% novos este mês",
    iconName: "Users",
    accentColor: "blue",
    defaultEnabled: true,
    defaultOrder: 1,
  },
  {
    id: "mrr_revenue",
    category: "essential",
    categoryLabel: "Essenciais",
    label: "Faturamento Mensal (MRR)",
    description: "Receita Recorrente Mensal acumulada de todos os planos contratados.",
    defaultValue: "R$ 14.850,00",
    defaultTrend: "Planos ativos e faturando",
    iconName: "CreditCard",
    accentColor: "emerald",
    defaultEnabled: true,
    defaultOrder: 2,
  },
  {
    id: "messages_volume",
    category: "essential",
    categoryLabel: "Essenciais",
    label: "Volume de Mensagens Trafegadas",
    description: "Total de mensagens enviadas e recebidas via WhatsApp, Instagram e canais.",
    defaultValue: "1.428.910",
    defaultTrend: "+28% de engajamento global",
    iconName: "Activity",
    accentColor: "violet",
    defaultEnabled: true,
    defaultOrder: 3,
  },
  {
    id: "system_uptime",
    category: "essential",
    categoryLabel: "Essenciais",
    label: "Disponibilidade Global (Uptime)",
    description: "Índice de disponibilidade de todos os microserviços e APIs da plataforma.",
    defaultValue: "99.98%",
    defaultTrend: "SLA corporativo atendido",
    iconName: "Server",
    accentColor: "emerald",
    defaultEnabled: true,
    defaultOrder: 4,
  },

  // ── IMPORTANTES ──
  {
    id: "ai_agents_active",
    category: "important",
    categoryLabel: "Importantes",
    label: "Agentes Mestres em Execução",
    description: "Templates e instâncias de agentes de IA respondendo ativamente.",
    defaultValue: "3 Ativos",
    defaultTrend: "Sofia, Lucas, Maya oficiais",
    iconName: "Bot",
    accentColor: "violet",
    defaultEnabled: true,
    defaultOrder: 5,
  },
  {
    id: "security_threats",
    category: "important",
    categoryLabel: "Importantes",
    label: "Ataques & Ameaças Bloqueadas",
    description: "Tentativas de injeção SQL, XSS e requisições suspeitas neutralizadas pelo WAF.",
    defaultValue: "142",
    defaultTrend: "100% neutralizados",
    iconName: "ShieldCheck",
    accentColor: "amber",
    defaultEnabled: true,
    defaultOrder: 6,
  },
  {
    id: "ai_avg_latency",
    category: "important",
    categoryLabel: "Importantes",
    label: "Latência Média da IA",
    description: "Tempo médio de resposta do streaming do modelo de linguagem dos agentes.",
    defaultValue: "385 ms",
    defaultTrend: "Processamento em alta velocidade",
    iconName: "Zap",
    accentColor: "blue",
    defaultEnabled: false,
    defaultOrder: 7,
  },
  {
    id: "weekly_signups",
    category: "important",
    categoryLabel: "Importantes",
    label: "Novos Cadastros da Semana",
    description: "Novos operadores e usuários cadastrados nos últimos 7 dias.",
    defaultValue: "+32",
    defaultTrend: "Crescimento contínuo de usuários",
    iconName: "TrendingUp",
    accentColor: "emerald",
    defaultEnabled: false,
    defaultOrder: 8,
  },

  // ── OPCIONAIS ──
  {
    id: "cpu_ram_usage",
    category: "optional",
    categoryLabel: "Opcionais",
    label: "Carga de Servidores (CPU & RAM)",
    description: "Média de consumo de CPU e memória dos clusters e nós de processamento.",
    defaultValue: "34% CPU / 48% RAM",
    defaultTrend: "Operando em faixa ideal",
    iconName: "Cpu",
    accentColor: "slate",
    defaultEnabled: false,
    defaultOrder: 9,
  },
  {
    id: "webhook_delivery_rate",
    category: "optional",
    categoryLabel: "Opcionais",
    label: "Taxa de Entrega de Webhooks",
    description: "Percentual de webhooks de parceiros entregues com sucesso.",
    defaultValue: "99.82%",
    defaultTrend: "Sem perdas na fila BullMQ",
    iconName: "Layers",
    accentColor: "blue",
    defaultEnabled: false,
    defaultOrder: 10,
  },
  {
    id: "ai_tokens_cost",
    category: "optional",
    categoryLabel: "Opcionais",
    label: "Custo Estimado de Tokens de IA",
    description: "Estimativa de custo de consumo das APIs da OpenAI/Google no mês.",
    defaultValue: "US$ 142.30",
    defaultTrend: "Dentro da cota orçada",
    iconName: "Sparkles",
    accentColor: "amber",
    defaultEnabled: false,
    defaultOrder: 11,
  },
  {
    id: "active_plans_distribution",
    category: "optional",
    categoryLabel: "Opcionais",
    label: "Distribuição de Planos",
    description: "Divisão proporcional entre planos Starter, Pro e Enterprise.",
    defaultValue: "42% Pro / 38% Ent.",
    defaultTrend: "Ticket médio saudável",
    iconName: "BarChart3",
    accentColor: "violet",
    defaultEnabled: false,
    defaultOrder: 12,
  },
];
