export interface GermaniSkill {
  id: string;
  name: string;
  category:
    | "marketing"
    | "ux"
    | "sales"
    | "erp"
    | "analytics"
    | "security"
    | "admin"
    | "finance"
    | "retention"
    | "whatsapp"
    | "infra"
    | "crm"
    | "agile"
    | "behavior"
    | "core";
  description: string;
  icon: string;
  enabled: boolean;
  samplePrompts: string[];
}

export interface GermaniGuardrail {
  id: string;
  title: string;
  description: string;
  enforced: boolean;
  isConstitutional: boolean; // Cannot be disabled (e.g. anti-jailbreak, anti-admin-deletion, zero-sql)
}

export interface GermaniConfig {
  name: string;
  gender: string;
  role: string;
  personality: string;
  greetingMessage: string;
  systemPromptCustomInstructions: string;
  model: string;
  temperature: number;
  skills: GermaniSkill[];
  guardrails: GermaniGuardrail[];
  updatedAt?: string;
}

export interface TokenUsageDetails {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
  provider: "gemini" | "openai";
  model: string;
}

export interface AiInferenceTelemetry {
  activeProvider: "gemini" | "openai";
  activeModel: string;
  temperature: number;
  temperaturePresetLabel: string;
  isConfigured: boolean;
  maskedKey: string;
  gemini: {
    name: string;
    model: string;
    isConfigured: boolean;
    isActive: boolean;
    monthlyLimit: number;
    monthlyConsumed: number;
    remainingTokens: number;
    percentConsumed: number;
    latencyMs: number;
  };
  openai: {
    name: string;
    model: string;
    isConfigured: boolean;
    isActive: boolean;
    monthlyLimit: number;
    monthlyConsumed: number;
    remainingTokens: number;
    percentConsumed: number;
    latencyMs: number;
  };
  lastMessageTelemetry: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    executionTimeMs: number;
    provider: "gemini" | "openai";
    model: string;
    estimatedCostUsd: number;
    timestamp: string;
  };
  apiTier: "pro" | "free";
  apiTierLabel: string;
  quotaResetInfo: {
    nextResetDateFormatted: string;
    daysRemaining: number;
    billingPeriod: string;
    buyTokensUrl: string;
    autoFailoverEnabled: boolean;
    failoverStatus: string;
  };
}

export interface GermaniActionProposal {
  id: string;
  title: string;
  description: string;
  category: "tenant" | "notification" | "ai" | "settings" | "gateway";
  impactLevel: "low" | "medium" | "critical";
  parameters?: Record<string, string | number | boolean>;
  status: "pending" | "approved" | "rejected" | "executed";
  executedAt?: string;
}

export interface GermaniNavigationAction {
  path: string;
  label: string;
  autoNavigate?: boolean;
}

export interface GermaniAttachment {
  id: string;
  name: string;
  type: "image" | "audio" | "video" | "document";
  mimeType: string;
  sizeBytes: number;
  /** Base64-encoded content for inline preview and API submission */
  base64Data?: string;
  /** URL for stored files (R2 or localStorage fallback) */
  url?: string;
  /** Thumbnail/preview URL for images/videos */
  thumbnailUrl?: string;
}

/** Resultado da análise de qualidade acústica de um áudio para clonagem XTTS */
export interface AudioQualityAnalysis {
  /** Frequência fundamental estimada (F0) em Hz */
  fundamentalFrequencyHz: number;
  /** Classificação do range de frequência: grave, médio, agudo */
  frequencyRange: "grave" | "medio" | "agudo";
  /** Clareza da dicção e articulação (0-100) */
  clarityScore: number;
  /** Qualidade do timbre — riqueza harmônica (0-100) */
  timbreScore: number;
  /** Relação Sinal-Ruído estimada (dB) */
  signalToNoiseRatio: number;
  /** Score geral de adequação para clonagem XTTS (0-100) */
  clonabilityScore: number;
  /** Classificação de adequação */
  clonabilityVerdict: "excelente" | "bom" | "aceitavel" | "inadequado";
  /** Duração do áudio em segundos */
  durationSeconds: number;
  /** Taxa de amostragem detectada (Hz) */
  sampleRateHz: number;
  /** Recomendações de melhoria */
  recommendations: string[];
  /** Se o áudio passou no critério mínimo para clonagem */
  passedMinimumCriteria: boolean;
}

/** Resultado da transcrição por push-to-talk */
export interface VoiceDictationResult {
  /** Texto transcrito do áudio captado */
  transcript: string;
  /** Confiança da transcrição (0-1) */
  confidence: number;
  /** Idioma detectado */
  detectedLanguage: string;
  /** Duração da gravação em ms */
  durationMs: number;
}

export interface GermaniChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  activeSkill?: string;
  guardrailTriggered?: string;
  tokenDetails?: TokenUsageDetails;
  actionProposal?: GermaniActionProposal;
  navigationAction?: GermaniNavigationAction;
  /** Files attached to this message (images, audio, documents) */
  attachments?: GermaniAttachment[];
  quickActions?: {
    label: string;
    href?: string;
    actionType?: "navigate" | "open_modal" | "copy";
  }[];
}

export const GERMANI_DEFAULT_PRESET: GermaniConfig = {
  name: "Germani",
  gender: "Feminino (Ela/Dela)",
  role: "Chief Executive AI Advisor & Assessora Pessoal — SuperAdmin BipeSend",
  personality:
    "Amiga próxima, carismática, extremamente profissional, refinada, acolhedora, executiva e didática. Combina visão estratégica de negócios (C-level) com domínio profundo da arquitetura da plataforma BipeSend. Conversa com naturalidade, empatia e proatividade com o Daniel, executando navegações e preparando ações para aprovação humana.",
  greetingMessage:
    "Oi Daniel! Tudo bem? Qual a nossa missão hoje? Pode me pedir para abrir qualquer menu, analisar dados em tempo real ou preparar tarefas que eu cuido de tudo com você.",
  systemPromptCustomInstructions:
    "Você é a assessora e parceira executiva pessoal do Daniel no SuperAdmin BipeSend. Mantenha um tom acolhedor, profissional e direto. Ao indicar ou navegar para uma tela, oriente com clareza. Ao criar ou modificar algo, apresente sempre a proposta estruturada para aprovação explícita dele antes da execução.",
  model: "gemini-3.8-flash",
  temperature: 0.6,
  skills: [
    {
      id: "scrum-product-management",
      name: "Metodologias Ágeis, Scrum & Product Ownership (PO)",
      category: "agile",
      description: "Refinamento de backlog, quebra em user stories, critérios INVEST, definição de MVP e priorização ágil com métricas de entrega.",
      icon: "Briefcase",
      enabled: true,
      samplePrompts: [
        "Como quebrar a funcionalidade de automação em user stories com critérios de aceite?",
        "Ajude a priorizar o backlog de melhorias dos agentes mestre para o próximo sprint.",
        "Como definir o MVP da esteira de campanhas em massa?"
      ]
    },
    {
      id: "humanized-service",
      name: "Atendimento Humanizado, Empatia & Disney Quality Standards",
      category: "behavior",
      description: "Pilares de excelência Disney Institute (Segurança, Cortesia, Eficiência), escuta ativa, calor humano e personalização acolhedora.",
      icon: "Heart",
      enabled: true,
      samplePrompts: [
        "Como transformar uma dúvida técnica de um tenant em uma experiência acolhedora?",
        "Sugira respostas humanizadas para clientes inseguros durante o onboarding.",
        "Como aplicar o padrão Disney de atendimento em canais como WhatsApp e Instagram?"
      ]
    },
    {
      id: "voss-negotiation",
      name: "Desarmamento Amigável & Negociação Tática (Chris Voss / FBI)",
      category: "sales",
      description: "Rotulagem emocional (labeling), espelhamento (mirroring), silêncio dinâmico e busca pelo 'Isso mesmo!' para converter tensões em cooperação.",
      icon: "ShieldAlert",
      enabled: true,
      samplePrompts: [
        "Como responder a um cliente com insatisfação severa sem jogar para o atendente?",
        "Aplique a técnica de rotulagem emocional em um cliente reclamando de preço.",
        "Como conduzir uma negociação difícil de renovação anual usando o método Chris Voss?"
      ]
    },
    {
      id: "cialdini-persuasion",
      name: "Psicologia da Persuasão & Gatilhos Éticos (Robert Cialdini)",
      category: "sales",
      description: "Aplicação dos 7 princípios da influência (Reciprocidade, Prova Social, Autoridade, Escassez, Compromisso, Afeição e Unidade) de forma 100% ética.",
      icon: "Sparkles",
      enabled: true,
      samplePrompts: [
        "Como aplicar prova social e autoridade na página de planos da BipeSend?",
        "Qual o melhor gatilho de reciprocidade para oferecer um teste gratuito do recurso de IA?",
        "Como estruturar uma comunicação de urgência sem parecer apelativo?"
      ]
    },
    {
      id: "spin-selling-sdr",
      name: "Vendas Consultivas & Diagnóstico Avançado (SPIN Selling)",
      category: "sales",
      description: "Perguntas de Situação, Problema, Implicação e Necessidade de Solução (Neil Rackham) para demonstrar valor antes de falar de preço.",
      icon: "TrendingUp",
      enabled: true,
      samplePrompts: [
        "Como qualificar um lead B2B complexo com perguntas de implicação?",
        "Monte um roteiro SPIN para leads interessados no plano Bipe Scale VIP.",
        "Como fazer o cliente perceber o custo de oportunidade de não usar automação?"
      ]
    },
    {
      id: "pix-recovery",
      name: "Recuperação Inteligente de PIX & Cobrança Amigável",
      category: "finance",
      description: "Abordagem rápida, empática e prestativa para resgatar PIX pendentes antes do vencimento do QR Code, sem parecer invasivo.",
      icon: "CircleDollarSign",
      enabled: true,
      samplePrompts: [
        "Como abordar um cliente cujo PIX gerado no checkout ainda não foi pago?",
        "Qual o timing ideal para enviar o lembrete de PIX com código copia-e-cola?",
        "Sugira uma mensagem que ajude o cliente com dúvidas sobre a chave PIX."
      ]
    },
    {
      id: "marketing",
      name: "Marketing & Growth",
      category: "marketing",
      description: "Estratégias de expansão da base, ativação de novos tenants, retenção e posicionamento da marca BipeSend.",
      icon: "Megaphone",
      enabled: true,
      samplePrompts: [
        "Como criar uma régua de onboarding atrativa para novos tenants?",
        "Sugira uma estratégia para divulgar nossos recursos de IA para os clientes da base.",
        "Rascunhe um comunicado de novidades da plataforma com tom profissional e moderno."
      ]
    },
    {
      id: "ux",
      name: "UI & UX Design",
      category: "ux",
      description: "Ergonomia de interface, heurísticas de usabilidade, fluxo do usuário no painel e consistência estética.",
      icon: "Palette",
      enabled: true,
      samplePrompts: [
        "Avalie a hierarquia visual do nosso painel de controle e sugira refinamentos.",
        "Como melhorar a clareza visual dos cards de saúde de infraestrutura?",
        "Quais boas práticas de micro-interações podemos adotar nas tabelas de dados?"
      ]
    },
    {
      id: "sales",
      name: "Vendas B2B & Negociação",
      category: "sales",
      description: "Conversão comercial, precificação de planos de assinatura, estratégias de upsell de recursos de IA e mensagens persuasivas.",
      icon: "TrendingUp",
      enabled: true,
      samplePrompts: [
        "Como estruturar pacotes de recarga de tokens de IA para maximizar o ticket médio?",
        "Qual o melhor argumento de venda para convencer um tenant do plano Básico a migrar para o Pro?",
        "Sugira um script de abordagem para reativação de clientes inativos."
      ]
    },
    {
      id: "erp",
      name: "ERP & Gestão de Processos",
      category: "erp",
      description: "Lógica operacional de catálogos, múltiplos estoques, regras de frete e integração de pedidos omnichannel.",
      icon: "Boxes",
      enabled: true,
      samplePrompts: [
        "Como a separação de catálogo e estoques multi-tenant é estruturada na BipeSend?",
        "Quais são os gatilhos recomendados para automação de mensagens de status de pedido?",
        "Como funciona o fluxo de conciliação financeira de múltiplos canais?"
      ]
    },
    {
      id: "analytics",
      name: "Análise de Dados & Métricas",
      category: "analytics",
      description: "Leitura executiva de indicadores do dashboard, latência de serviços, faturamento MRR, churn e throughput.",
      icon: "BarChart3",
      enabled: true,
      samplePrompts: [
        "O que significa o indicador de latência P99 do PostgreSQL e quando devemos nos preocupar?",
        "Como interpretar o balanço entre novas assinaturas e taxa de cancelamento (churn)?",
        "Qual a correlação entre tempo de resposta da IA e satisfação dos usuários finais?"
      ]
    },
    {
      id: "security",
      name: "Cibersegurança & Conformidade",
      category: "security",
      description: "Políticas de privilégio mínimo, proteção contra invasões, conformidade LGPD e integridade de auditoria.",
      icon: "ShieldCheck",
      enabled: true,
      samplePrompts: [
        "Quais são as melhores práticas de auditoria para ações executadas por SuperAdmins?",
        "Como nosso sistema garante o isolamento estrito de dados entre diferentes tenants (multi-tenancy)?",
        "Quais salvaguardas evitam ataques de força bruta no login administrativo?"
      ]
    },
    {
      id: "admin",
      name: "Administração & Navegação no Painel",
      category: "admin",
      description: "Guia completo de rotas, funções e recursos do SuperAdmin. Mostra onde fica cada coisa e como operar com maestria.",
      icon: "Compass",
      enabled: true,
      samplePrompts: [
        "Onde configuro as chaves de API do Google Gemini e OpenAI?",
        "Como faço para cadastrar um novo gateway de pagamento na plataforma?",
        "Onde visualizo o Livro de Métricas completo da infraestrutura?"
      ]
    },
    {
      id: "finance",
      name: "Conciliação Financeira & Gateways",
      category: "finance",
      description: "Auditoria de liquidações instantâneas via PIX, taxas de processamento de gateways (Asaas, Mercado Pago, Stripe), chargebacks e conciliação de faturas recorrentes.",
      icon: "CircleDollarSign",
      enabled: true,
      samplePrompts: [
        "Como auditar as taxas cobradas pelos gateways de pagamento?",
        "Qual o tempo médio de liquidação bancária dos recebimentos via PIX?",
        "Identifique possíveis anomalias em faturas em aberto ou inadimplências."
      ]
    },
    {
      id: "churn_retention",
      name: "Monitoramento de Churn & Retenção",
      category: "retention",
      description: "Alerta precoce de contas e tenants em risco de cancelamento, detecção de queda no volume de mensagens e estratégias proativas de reengajamento.",
      icon: "UserMinus",
      enabled: true,
      samplePrompts: [
        "Quais contas tiveram queda superior a 25% no volume de envios nesta semana?",
        "Como abordar proativamente um tenant que reduziu a frequência de uso?",
        "Sugira uma régua de reativação para clientes com pagamentos em atraso."
      ]
    },
    {
      id: "whatsapp_audit",
      name: "Auditoria de WhatsApp & Risco de Bloqueio",
      category: "whatsapp",
      description: "Inspeção de estabilidade de instâncias conectadas (BipeSend WhatsApp Engine), aquecimento de números, cadência de disparos e prevenção contra bloqueios oficiais.",
      icon: "PhoneCall",
      enabled: true,
      samplePrompts: [
        "Qual o limite seguro de disparos por hora para números recém-conectados?",
        "Como configurar a rotação de números e evitar detecção de spam?",
        "Quais instâncias de WhatsApp demandam reconexão de QR Code ou atenção imediata?"
      ]
    },
    {
      id: "infrastructure",
      name: "SLA, Latência & Saúde dos Serviços",
      category: "infra",
      description: "Monitoramento das filas Redis/BullMQ, pool de conexões do PostgreSQL, tempo de resposta dos webhooks e mitigação de gargalos de infraestrutura.",
      icon: "Activity",
      enabled: true,
      samplePrompts: [
        "As filas de processamento assíncrono estão operando dentro do SLA previsto?",
        "Como está a latência P99 das consultas ao banco de dados PostgreSQL?",
        "Existe algum webhook parceiro apresentando falha repetida de entrega?"
      ]
    },
    {
      id: "lead_qualification",
      name: "Qualificação de Leads & Inteligência de Funil",
      category: "crm",
      description: "Diagnóstico de conversão por etapa do funil comercial, lead scoring automático no CRM e automação de follow-ups inteligentes.",
      icon: "Target",
      enabled: true,
      samplePrompts: [
        "Qual etapa do funil comercial apresenta a maior taxa de desistência?",
        "Como calibrar o scoring de leads para direcionamento ágil aos atendentes?",
        "Sugira mensagens automáticas de recuperação para contatos parados no funil."
      ]
    }
  ],
  guardrails: [
    {
      id: "gr-no-code-no-sql",
      title: "Blindagem de Código & Banco de Dados",
      description: "Germani não edita arquivos de código nem executa comandos ou consultas diretas de manipulação SQL (DROP, UPDATE, ALTER).",
      enforced: true,
      isConstitutional: true
    },
    {
      id: "gr-anti-admin-conflict",
      title: "Anti-Conflito de Interesses entre Admins",
      description: "É estritamente proibido usar a IA para apagar, bloquear, despromover ou alterar credenciais de outro SuperAdmin. Gestão de pares exige fluxo direto de governança com 2FA.",
      enforced: true,
      isConstitutional: true
    },
    {
      id: "gr-financial-integrity",
      title: "Integridade Financeira Inviolável",
      description: "A IA não altera saldos, faturas já consolidadas ou registros contábeis. Apenas fornece orientações e relatórios analíticos.",
      enforced: true,
      isConstitutional: true
    },
    {
      id: "gr-anti-jailbreak",
      title: "Proteção Ativa contra Burlas & Injeções",
      description: "Imunidade a comandos que tentem forçar bypass, modo desenvolvedor desregulamentado ou violação de políticas de segurança.",
      enforced: true,
      isConstitutional: true
    },
    {
      id: "gr-human-in-the-loop",
      title: "Ação Assistida com Confirmação Humana",
      description: "Todas as criações de Modelos Mestres ou alterações sugeridas pela Germani exigem o clique de aprovação do operador humano na interface.",
      enforced: true,
      isConstitutional: false
    }
  ]
};

export type ModelPurposeCategory = "assessoria" | "atendimento_clientes" | "auditoria_estrategia";

export interface AiModelCatalogItem {
  id: string;
  name: string;
  provider: "gemini" | "openai";
  providerLabel: string;
  description: string;
  inputCostPer1M: number; // USD per 1M tokens
  outputCostPer1M: number; // USD per 1M tokens
  contextWindow: string;
  avgLatencyMs: number;
  isHomologated: boolean;
  isRecommended: boolean;
  category: "fast" | "reasoning" | "balanced";
  tierRequired: "free_or_pro" | "pro_only";
  tierRequiredLabel: string;
  bestFor: ModelPurposeCategory;
  bestForLabel: string;
}

export interface ThinkingModePreset {
  id: "baixo" | "medio" | "alto";
  label: "Baixo" | "Médio" | "Alto";
  title: string;
  temperature: number;
  description: string;
  thinkingDepth: string;
  projectedTokens: string;
}

export const THINKING_MODE_PRESETS: ThinkingModePreset[] = [
  {
    id: "baixo",
    label: "Baixo",
    title: "Modo Direto & Preciso",
    temperature: 0.2,
    description: "Raciocínio conciso e estritamente factual com menor aleatoriedade. Ideal para comandos diretos, regras fiscais e governança.",
    thinkingDepth: "Rápido & Focado (Baixa reflexão lateral)",
    projectedTokens: "~150 a 220 tokens",
  },
  {
    id: "medio",
    label: "Médio",
    title: "Modo Equilibrado & Natural",
    temperature: 0.6,
    description: "Excelente balanço entre precisão executiva e empatia conversacional. Padrão ideal para conversas e navegação no dia a dia.",
    thinkingDepth: "Equilibrado (Reflexão colaborativa padrão)",
    projectedTokens: "~230 a 330 tokens",
  },
  {
    id: "alto",
    label: "Alto",
    title: "Modo Aprofundado & Reflexivo",
    temperature: 0.9,
    description: "Raciocínio estendido e exploração profunda de cenários e alternativas. Máxima riqueza conceitual e ideação estratégica.",
    thinkingDepth: "Aprofundado (Máxima profundidade e análise)",
    projectedTokens: "~340 a 450 tokens",
  },
];

export const AI_MODELS_CATALOG: AiModelCatalogItem[] = [
  // ── GOOGLE GEMINI (Geração 3.0 para Cima: 3.8, 3.5, 3.1 Pro e 3.0) ──
  {
    id: "gemini-3.8-flash",
    name: "Google Gemini 3.8 Flash",
    provider: "gemini",
    providerLabel: "Google Gemini AI",
    description: "Última geração topo de linha 3.8 do Google DeepMind com latência ultrabaixa (~95ms), raciocínio contínuo e janela massiva de 2 milhões de tokens. Ideal tanto para governança interna quanto atendimento e automação para clientes.",
    inputCostPer1M: 0.100,
    outputCostPer1M: 0.400,
    contextWindow: "2.000.000 tokens",
    avgLatencyMs: 95,
    isHomologated: true,
    isRecommended: true,
    category: "fast",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro / Pay-as-you-go",
    bestFor: "assessoria",
    bestForLabel: "Melhor para Assessora Executiva (SuperAdmin)",
  },
  {
    id: "gemini-3.8-pro",
    name: "Google Gemini 3.8 Pro",
    provider: "gemini",
    providerLabel: "Google Gemini AI",
    description: "Modelo flagship de máxima densidade cognitiva da série 3.8. Raciocínio profundo, auditoria executiva, análise de grandes bases contratuais e resolução analítica de alto nível.",
    inputCostPer1M: 1.250,
    outputCostPer1M: 5.000,
    contextWindow: "2.000.000 tokens",
    avgLatencyMs: 240,
    isHomologated: true,
    isRecommended: false,
    category: "reasoning",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro / Pay-as-you-go",
    bestFor: "auditoria_estrategia",
    bestForLabel: "Melhor para Auditoria & Raciocínio Profundo",
  },
  {
    id: "gemini-3.5-flash",
    name: "Google Gemini 3.5 Flash",
    provider: "gemini",
    providerLabel: "Google Gemini AI",
    description: "Geração 3.5 balanceada com alta velocidade de processamento, respostas didáticas e excelente escalabilidade para assistentes de vendas e suporte omnichannel aos clientes.",
    inputCostPer1M: 0.080,
    outputCostPer1M: 0.350,
    contextWindow: "1.500.000 tokens",
    avgLatencyMs: 105,
    isHomologated: true,
    isRecommended: false,
    category: "fast",
    tierRequired: "free_or_pro",
    tierRequiredLabel: "Disponível no Plano Base / Free",
    bestFor: "atendimento_clientes",
    bestForLabel: "Melhor para Atendimento aos Clientes (WhatsApp)",
  },
  {
    id: "gemini-3.1-pro",
    name: "Google Gemini 3.1 Pro",
    provider: "gemini",
    providerLabel: "Google Gemini AI",
    description: "Raciocínio lógico estruturado da série 3.1 para síntese de documentos, conformidade, estratégias de negócios e automação de fluxos críticos.",
    inputCostPer1M: 1.100,
    outputCostPer1M: 4.500,
    contextWindow: "2.000.000 tokens",
    avgLatencyMs: 260,
    isHomologated: true,
    isRecommended: false,
    category: "reasoning",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro / Pay-as-you-go",
    bestFor: "auditoria_estrategia",
    bestForLabel: "Melhor para Governança e Regras Fiscais",
  },
  {
    id: "gemini-3.0-flash",
    name: "Google Gemini 3.0 Flash",
    provider: "gemini",
    providerLabel: "Google Gemini AI",
    description: "Primeira geração da família 3.0, ágil e estável para assistentes executivos, chamadas de ferramentas e interações em tempo real.",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.300,
    contextWindow: "1.000.000 tokens",
    avgLatencyMs: 115,
    isHomologated: true,
    isRecommended: false,
    category: "fast",
    tierRequired: "free_or_pro",
    tierRequiredLabel: "Disponível no Plano Base / Free",
    bestFor: "atendimento_clientes",
    bestForLabel: "Melhor para Automações e Disparos Rápidos",
  },

  // ── OPENAI (Modelos Instantâneos e Últimos Lançamentos de Raciocínio) ──
  {
    id: "gpt-4.5-instant",
    name: "OpenAI GPT-4.5 Instant",
    provider: "openai",
    providerLabel: "OpenAI GPT",
    description: "Modelo conversacional instantâneo de última geração. Latência imperceptível (~105ms), alta empatia e respostas fluidas e dinâmicas tanto para o operador quanto para clientes.",
    inputCostPer1M: 1.500,
    outputCostPer1M: 6.000,
    contextWindow: "128.000 tokens",
    avgLatencyMs: 105,
    isHomologated: true,
    isRecommended: true,
    category: "fast",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro / Tier Pago",
    bestFor: "assessoria",
    bestForLabel: "Melhor para Assessora Executiva (OpenAI)",
  },
  {
    id: "gpt-4.5",
    name: "OpenAI GPT-4.5 (Flagship)",
    provider: "openai",
    providerLabel: "OpenAI GPT",
    description: "Modelo de inteligência geral máxima da OpenAI, com raciocínio executivo aprofundado, nuance emocional e vasto conhecimento de negócios.",
    inputCostPer1M: 75.000,
    outputCostPer1M: 150.000,
    contextWindow: "128.000 tokens",
    avgLatencyMs: 440,
    isHomologated: true,
    isRecommended: false,
    category: "reasoning",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro (Tier 2+) e Saldo Pago",
    bestFor: "auditoria_estrategia",
    bestForLabel: "Melhor para Inteligência Geral & Síntese",
  },
  {
    id: "o3-mini",
    name: "OpenAI o3-mini (Raciocínio)",
    provider: "openai",
    providerLabel: "OpenAI GPT",
    description: "Modelo de raciocínio veloz com chain-of-thought interno acelerado, ideal para tomada de decisões estratégicas e suporte técnico criterioso.",
    inputCostPer1M: 1.100,
    outputCostPer1M: 4.400,
    contextWindow: "200.000 tokens",
    avgLatencyMs: 270,
    isHomologated: true,
    isRecommended: false,
    category: "reasoning",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro / Tier Pago",
    bestFor: "auditoria_estrategia",
    bestForLabel: "Melhor para Raciocínio e Tomada de Decisão",
  },
  {
    id: "o1",
    name: "OpenAI o1 (Raciocínio Profundo)",
    provider: "openai",
    providerLabel: "OpenAI GPT",
    description: "Modelo flagship de raciocínio deliberativo profundo para desafios de alta complexidade, regras de negócio e governança institucional.",
    inputCostPer1M: 15.000,
    outputCostPer1M: 60.000,
    contextWindow: "200.000 tokens",
    avgLatencyMs: 650,
    isHomologated: true,
    isRecommended: false,
    category: "reasoning",
    tierRequired: "pro_only",
    tierRequiredLabel: "Requer API Pro (Tier 3+) e Saldo Pago",
    bestFor: "auditoria_estrategia",
    bestForLabel: "Melhor para Raciocínio Profundo Deliberativo",
  },
  {
    id: "gpt-4o-instant",
    name: "OpenAI GPT-4o Instant",
    provider: "openai",
    providerLabel: "OpenAI GPT",
    description: "Versão de streaming ultrarrápida do GPT-4o, altamente otimizada para respostas instantâneas em múltiplos canais de atendimento e automação.",
    inputCostPer1M: 0.200,
    outputCostPer1M: 0.800,
    contextWindow: "128.000 tokens",
    avgLatencyMs: 125,
    isHomologated: true,
    isRecommended: false,
    category: "fast",
    tierRequired: "free_or_pro",
    tierRequiredLabel: "Disponível no Plano Base / Tier 1",
    bestFor: "atendimento_clientes",
    bestForLabel: "Melhor para Atendimento aos Clientes (WhatsApp)",
  },
];

export function calculateModelMessageCost(
  modelId: string,
  temperature: number,
  basePromptTokens: number = 120
) {
  const model = AI_MODELS_CATALOG.find((m) => m.id === modelId) || AI_MODELS_CATALOG[0];

  // Projeção de tokens de saída baseada na temperatura:
  // Em temperaturas baixas (0.1 - 0.3), a resposta é densa e objetiva (~150 a 220 tokens)
  // Em temperaturas médias (0.4 - 0.7), a resposta é balanceada (~230 a 330 tokens)
  // Em temperaturas altas (0.8 - 1.0), a resposta é elaborada e criativa (~340 a 450 tokens)
  const projectedOutputTokens = Math.round(150 + temperature * 280);
  const totalTokens = basePromptTokens + projectedOutputTokens;

  const costPromptUsd = (basePromptTokens * model.inputCostPer1M) / 1000000;
  const costOutputUsd = (projectedOutputTokens * model.outputCostPer1M) / 1000000;
  const totalCostUsd = costPromptUsd + costOutputUsd;

  const costPer1kMessagesUsd = totalCostUsd * 1000;
  const USD_TO_BRL = 5.60;
  const totalCostBrl = totalCostUsd * USD_TO_BRL;
  const costPer1kMessagesBrl = costPer1kMessagesUsd * USD_TO_BRL;

  return {
    model,
    basePromptTokens,
    projectedOutputTokens,
    totalTokens,
    totalCostUsd,
    totalCostBrl,
    costPer1kMessagesUsd,
    costPer1kMessagesBrl,
  };
}
