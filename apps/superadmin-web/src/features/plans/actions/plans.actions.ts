"use server";

import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";

export type PlanColorScheme = "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "indigo";

export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  isPopular?: boolean;
  showOnLandingPage?: boolean;
  badge?: string;
  colorScheme: PlanColorScheme;
  limits: {
    contacts: number; // -1 = ilimitado (Contatos)
    crmPipelines?: number; // -1 = ilimitado (Funil CRM)
    aiAgents: number; // -1 = ilimitado
    whatsappConnections: number; // -1 = ilimitado
    instagramConnections: number; // -1 = ilimitado
    tiktokConnections?: number; // -1 = ilimitado (TikTok)
    automations?: number; // -1 = ilimitado (Automações)
    transparentCheckout?: boolean; // Checkout Transparente Incluso
    teamMembers: number; // -1 = ilimitado (Membros de Equipe)
    monthlyAiMessages: number; // -1 = ilimitado
  };
  features: string[];
}

const DEFAULT_PLATFORM_PLANS: CustomPlan[] = [
  {
    id: "plan-starter",
    name: "Bipe Starter",
    description: "Ideal para autônomos e pequenos negócios iniciando no atendimento omnichannel.",
    priceMonthly: 147,
    priceYearly: 1470,
    isActive: true,
    showOnLandingPage: true,
    colorScheme: "blue",
    limits: {
      contacts: 2000,
      crmPipelines: 1,
      aiAgents: 1,
      whatsappConnections: 1,
      instagramConnections: 1,
      tiktokConnections: 1,
      automations: 5,
      transparentCheckout: true,
      teamMembers: 2,
      monthlyAiMessages: 1500,
    },
    features: [
      "1 Agente Personalizada (Envio de Áudio, Voz e Arquivos)",
      "1 Conexão BipeSend WhatsApp API Oficial",
      "1 Perfil Instagram Direct integrado",
      "1 Conexão TikTok Direct integrada",
      "1 Funil CRM adicional (+1 Principal Gratuito = 2 funis)",
      "Checkout Transparente incluso",
      "Simulação de digitação em tempo real",
      "Até 2.000 contatos gerenciados",
      "2 Membros de equipe incluídos",
    ],
  },
  {
    id: "plan-growth",
    name: "Bipe Pro Growth",
    description: "Perfeito para empresas em aceleração de vendas e atendimento comercial dinâmico.",
    priceMonthly: 297,
    priceYearly: 2970,
    isActive: true,
    isPopular: true,
    showOnLandingPage: true,
    badge: "Mais Vendido",
    colorScheme: "emerald",
    limits: {
      contacts: 10000,
      crmPipelines: 3,
      aiAgents: 3,
      whatsappConnections: 2,
      instagramConnections: 2,
      tiktokConnections: 2,
      automations: 15,
      transparentCheckout: true,
      teamMembers: 6,
      monthlyAiMessages: 8000,
    },
    features: [
      "3 Agentes Personalizadas simultâneas (Vendas, Suporte e SDR)",
      "2 Conexões BipeSend WhatsApp API independentes",
      "2 Conexões Instagram Direct",
      "2 Conexões TikTok Direct",
      "3 Funis CRM adicionais (+1 Principal Gratuito = 4 funis)",
      "15 Automações de fluxo ativas",
      "Checkout Transparente com Pix e Cartão",
      "Envio de áudios com voz natural e arquivos",
      "Até 10.000 contatos gerenciados",
      "6 Membros de equipe com filas de atendimento",
      "Transbordo automático para humanos",
    ],
  },
  {
    id: "plan-scale",
    name: "Bipe Enterprise Scale",
    description: "Para operações consolidadas com alto volume de tráfego, múltiplos números e times.",
    priceMonthly: 597,
    priceYearly: 5970,
    isActive: true,
    showOnLandingPage: true,
    colorScheme: "violet",
    limits: {
      contacts: 50000,
      crmPipelines: 10,
      aiAgents: 10,
      whatsappConnections: 5,
      instagramConnections: 5,
      tiktokConnections: 5,
      automations: 50,
      transparentCheckout: true,
      teamMembers: 20,
      monthlyAiMessages: 35000,
    },
    features: [
      "10 Agentes Personalizadas para diferentes setores",
      "5 Conexões BipeSend WhatsApp API de alta vazão",
      "5 Conexões Instagram Direct + TikTok",
      "10 Funis CRM adicionais (+1 Principal Gratuito = 11 funis)",
      "50 Automações inteligentes integradas",
      "Checkout Transparente completo",
      "Envio de áudios com a sua voz e arquivos ilimitados",
      "Até 50.000 contatos gerenciados",
      "20 Membros de equipe com papéis RBAC avançados",
      "Painel de auditoria e segurança contra jailbreak",
      "Suporte VIP prioritário via WhatsApp",
    ],
  },
  {
    id: "plan-vip-custom",
    name: "Bipe Custom VIP",
    description: "Plano sob medida para grandes franquias, agências ou operações ilimitadas.",
    priceMonthly: 1290,
    priceYearly: 12900,
    isActive: true,
    showOnLandingPage: true,
    badge: "Exclusivo",
    colorScheme: "amber",
    limits: {
      contacts: -1,
      crmPipelines: -1,
      aiAgents: -1,
      whatsappConnections: 10,
      instagramConnections: 10,
      tiktokConnections: 10,
      automations: -1,
      transparentCheckout: true,
      teamMembers: -1,
      monthlyAiMessages: -1,
    },
    features: [
      "Agentes de IA e Mensagens ilimitadas",
      "Funis CRM Ilimitados (+1 Principal Gratuito)",
      "Contatos e Membros de equipe ilimitados",
      "Funis CRM e Automações ilimitadas",
      "Checkout Transparente sem limites",
      "10 Conexões BipeSend WhatsApp API dedicadas",
      "10 Conexões Instagram Direct + TikTok",
      "Sua Própria Agente Personalizada com envio de áudio e arquivos",
      "Roteamento por múltiplos setores com RBAC avançado",
      "Suporte VIP prioritário com gerente de conta dedicado",
    ],
  },
];

function getPlansFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "../../packages/contracts/src/fixtures/platform-plans.json"),
    path.resolve(process.cwd(), "packages/contracts/src/fixtures/platform-plans.json"),
    path.resolve(process.cwd(), "../contracts/src/fixtures/platform-plans.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function readStoredPlans(): CustomPlan[] {
  try {
    const filePath = getPlansFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Erro ao ler platform-plans.json:", err);
  }
  return DEFAULT_PLATFORM_PLANS;
}

function writeStoredPlans(plans: CustomPlan[]): void {
  try {
    const filePath = getPlansFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(plans, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar platform-plans.json:", err);
  }
}

export async function getPlatformPlansAction(): Promise<CustomPlan[]> {
  return readStoredPlans();
}

export async function savePlanAction(planData: Omit<CustomPlan, "id"> & { id?: string }): Promise<{ success: boolean; message: string; plan?: CustomPlan }> {
  try {
    const plans = readStoredPlans();
    const id = planData.id || `plan-${Date.now()}`;
    const planIndex = plans.findIndex((p) => p.id === id);

    const fullPlan: CustomPlan = {
      ...planData,
      id,
      showOnLandingPage: planData.showOnLandingPage !== undefined ? planData.showOnLandingPage : true,
      isActive: planData.isActive !== undefined ? planData.isActive : true,
      limits: {
        contacts: planData.limits?.contacts ?? 5000,
        crmPipelines: planData.limits?.crmPipelines ?? 1,
        aiAgents: planData.limits?.aiAgents ?? 1,
        whatsappConnections: planData.limits?.whatsappConnections ?? 1,
        instagramConnections: planData.limits?.instagramConnections ?? 1,
        tiktokConnections: planData.limits?.tiktokConnections ?? 1,
        automations: planData.limits?.automations ?? 5,
        transparentCheckout: planData.limits?.transparentCheckout ?? true,
        teamMembers: planData.limits?.teamMembers ?? 2,
        monthlyAiMessages: planData.limits?.monthlyAiMessages ?? 5000,
      },
      features: Array.isArray(planData.features) && planData.features.length > 0 ? [...planData.features] : [
        "1 Agente de IA com Voz Humanizada",
        "Conexão Oficial WhatsApp API",
        "Checkout Transparente incluso",
        "Suporte Prioritário",
      ],
    };

    if (planIndex >= 0) {
      plans[planIndex] = fullPlan;
    } else {
      plans.push(fullPlan);
    }

    writeStoredPlans(plans);

    revalidatePath("/plans");
    revalidatePath("/");
    revalidatePath("/site-editor");
    return {
      success: true,
      message: `Plano "${fullPlan.name}" salvo com sucesso!`,
      plan: fullPlan,
    };
  } catch {
    return {
      success: false,
      message: "Erro ao salvar plano personalizado.",
    };
  }
}

export async function togglePlanStatusAction(planId: string): Promise<{ success: boolean; isActive: boolean; message: string }> {
  const plans = readStoredPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, isActive: false, message: "Plano não encontrado." };
  }

  plan.isActive = !plan.isActive;
  writeStoredPlans(plans);

  revalidatePath("/plans");
  revalidatePath("/");
  revalidatePath("/site-editor");

  return {
    success: true,
    isActive: plan.isActive,
    message: `Plano "${plan.name}" agora está ${plan.isActive ? "ATIVO" : "PAUSADO"}.`,
  };
}

export async function togglePlanLandingVisibilityAction(planId: string): Promise<{ success: boolean; showOnLandingPage: boolean; message: string }> {
  const plans = readStoredPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, showOnLandingPage: false, message: "Plano não encontrado." };
  }

  plan.showOnLandingPage = !plan.showOnLandingPage;
  writeStoredPlans(plans);

  revalidatePath("/plans");
  revalidatePath("/");
  revalidatePath("/site-editor");

  return {
    success: true,
    showOnLandingPage: plan.showOnLandingPage,
    message: `Plano "${plan.name}" ${plan.showOnLandingPage ? "visível na Landing Page" : "ocultado da Landing Page"}.`,
  };
}

export async function deletePlanAction(planId: string): Promise<{ success: boolean; message: string }> {
  const plans = readStoredPlans();
  const initialLength = plans.length;
  const filteredPlans = plans.filter((p) => p.id !== planId);

  if (filteredPlans.length === initialLength) {
    return { success: false, message: "Plano não encontrado para exclusão." };
  }

  writeStoredPlans(filteredPlans);

  revalidatePath("/plans");
  revalidatePath("/");
  revalidatePath("/site-editor");
  return { success: true, message: "Plano removido com sucesso!" };
}
