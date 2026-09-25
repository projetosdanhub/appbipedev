"use server";

import {
  AiAgentTemplate,
  GeneratePipelineResponse,
  ChatWithAgentRequest,
  ChatWithAgentResponse,
} from "@bipesend/contracts";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:5005";

// Templates mestres de fallback caso o microsserviço Python esteja offline no momento da consulta
const FALLBACK_TEMPLATES: AiAgentTemplate[] = [
  {
    id: "tpl-sales-omnichannel",
    name: "Sofia",
    gender: "Feminino (Ela/Dela)",
    role: "Consultora de Vendas Omnichannel",
    personality: "Extremamente acolhedora, empática, persuasiva e dinâmica. Focada em identificar as dores do lead e conduzir com entusiasmo para o fechamento.",
    limitations: [
      "Nunca fornecer descontos sem autorização prévia de um gestor humano.",
      "Não enviar links externos não homologados na base da empresa.",
      "Direcionar para atendimento humano se o cliente solicitar ou demonstrar insatisfação.",
      "Nunca criticar ou citar marcas concorrentes de forma negativa."
    ],
    category: "Vendas"
  },
  {
    id: "tpl-sdr-qualifier",
    name: "Lucas",
    gender: "Masculino (Ele/Dele)",
    role: "Especialista em Qualificação e Triagem (SDR)",
    personality: "Prático, objetivo, cordial e consultivo. Realiza perguntas inteligentes para entender orçamento, urgência e autoridade de decisão.",
    limitations: [
      "Manter o foco exclusivamente na qualificação inicial de novos contatos.",
      "Não assinar termos de compromisso ou acordos contratuais.",
      "Se o lead for qualificado, agendar imediatamente a reunião no CRM.",
      "Bloquear qualquer tentativa de desvio de assunto para temas não profissionais."
    ],
    category: "Qualificação"
  },
  {
    id: "tpl-support-n1",
    name: "Maya",
    gender: "Feminino (Ela/Dela)",
    role: "Especialista em Suporte & Atendimento ao Cliente",
    personality: "Paciente, calma, didática e resolutiva. Explica o passo a passo com clareza e acolhe as dúvidas com agilidade.",
    limitations: [
      "Nunca solicitar senhas, códigos de segurança de dois fatores ou tokens bancários.",
      "Não alterar permissões administrativas do cliente diretamente.",
      "Transferir o chamado para Suporte N2 se a dúvida envolver erros de infraestrutura.",
      "Registrar o histórico resumido no ticket de suporte antes de finalizar."
    ],
    category: "Suporte"
  },
  {
    id: "tpl-real-estate",
    name: "Gabriel",
    gender: "Masculino (Ele/Dele)",
    role: "Consultor Imobiliário Inteligente",
    personality: "Elegante, seguro, conhecedor de localizações e tendências de mercado. Valoriza as preferências de moradia e investimento do cliente.",
    limitations: [
      "Não prometer reservas de imóveis sem o sinal aprovado pelo proprietário.",
      "Não divulgar dados sensíveis de proprietários ou contratos de terceiros.",
      "Focar em agendar visitas aos imóveis selecionados no funil imobiliário."
    ],
    category: "Imobiliário"
  }
];

export async function fetchAiTemplatesAction(): Promise<AiAgentTemplate[]> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/v1/ai/templates`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback gracioso
  }
  return FALLBACK_TEMPLATES;
}

export async function generateCrmPipelineWithBipeAiAction(
  businessDescription: string
): Promise<{ success: boolean; data?: GeneratePipelineResponse; error?: string }> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/v1/ai/generate-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessDescription }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Erro ao gerar funil com Bipe AI" }));
      return { success: false, error: err.detail || "Erro no serviço de inteligência artificial" };
    }

    const data: GeneratePipelineResponse = await res.json();
    // Limite rígido garantido: no máximo 10 fluxos
    if (data.stages.length > 10) {
      data.stages = data.stages.slice(0, 10);
    }
    return { success: true, data };
  } catch (error) {
    // Fallback heurístico em Node se o serviço Python estiver inicializando
    const desc = businessDescription.toLowerCase();
    if (desc.includes("imóve") || desc.includes("imobili")) {
      return {
        success: true,
        data: {
          name: "Funil Imobiliário de Alta Conversão",
          description: "Fluxo inteligente de atração, qualificação e visitas.",
          stages: [
            { name: "Novos Leads", colorToken: "#007BFF", category: "open", position: 0 },
            { name: "Perfil & Orçamento", colorToken: "#6366F1", category: "open", position: 1 },
            { name: "Imóveis Apresentados", colorToken: "#3B82F6", category: "open", position: 2 },
            { name: "Visita Agendada", colorToken: "#F59E0B", category: "open", position: 3 },
            { name: "Proposta Formal", colorToken: "#8B5CF6", category: "open", position: 4 },
            { name: "Contrato Assinado", colorToken: "#10B981", category: "won", position: 5 },
            { name: "Desistência", colorToken: "#EF4444", category: "lost", position: 6 },
          ],
        },
      };
    }

    return {
      success: true,
      data: {
        name: "Funil Comercial Estratégico",
        description: "Processo estruturado de qualificação, apresentação e fechamento comercial.",
        stages: [
          { name: "Novos Contatos", colorToken: "#007BFF", category: "open", position: 0 },
          { name: "Qualificação", colorToken: "#6366F1", category: "open", position: 1 },
          { name: "Apresentação de Proposta", colorToken: "#F59E0B", category: "open", position: 2 },
          { name: "Negociação", colorToken: "#8B5CF6", category: "open", position: 3 },
          { name: "Venda Concluída", colorToken: "#10B981", category: "won", position: 4 },
          { name: "Perdido", colorToken: "#EF4444", category: "lost", position: 5 },
        ],
      },
    };
  }
}

export async function chatWithAgentAction(
  request: ChatWithAgentRequest
): Promise<ChatWithAgentResponse> {
  try {
    const payload = {
      agent: {
        name: request.agentConfig?.name || "Sofia",
        gender: request.agentConfig?.gender === "masculine" ? "Masculino" : "Feminino",
        role: request.agentConfig?.role || "Consultora Omnichannel",
        personality: request.agentConfig?.personality || "Empática e profissional",
        limitations: request.agentConfig?.limitations || [],
        knowledgeContext: request.agentConfig?.knowledgeContext || "",
      },
      message: request.message,
      history: request.history,
      channel: request.channel,
    };

    const res = await fetch(`${AI_SERVICE_URL}/v1/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  return {
    reply: `Olá! Eu sou ${request.agentConfig?.name || "a assistente virtual"}. Estou pronta para lhe atender pelo canal Omnichannel unificado!`,
    blocked: false,
    provider: "fallback",
  };
}

// ─── TTS & Voice Cloning Actions (XTTSv2) ───────────────────────────────────

export interface TtsVoice {
  id: string;
  name: string;
  gender: string;
  category: "female" | "male" | "child" | "custom";
  language: string;
  description: string;
  type: "builtin" | "cloned";
  sample_url?: string;
  r2_url?: string | null;
}

export interface TtsVoicesResponse {
  voices: TtsVoice[];
  total: number;
}

export interface SynthesizeSpeechResponse {
  audio_base64: string;
  format: string;
  sample_rate: number;
  latency_ms: number;
  text_length: number;
  voice_id: string;
}

export interface VoiceCloneResult {
  success: boolean;
  voice_id?: string;
  name?: string;
  duration_seconds?: number;
  message?: string;
  category?: string;
  sample_url?: string;
  r2_url?: string | null;
  error?: string;
}

const FALLBACK_VOICES: TtsVoice[] = [
  {
    id: "germani",
    name: "Germani (Voz Oficial)",
    gender: "female",
    category: "female",
    language: "pt",
    description: "Voz feminina oficial da BipeSend — calorosa, consultiva, natural e acolhedora.",
    type: "builtin",
    sample_url: "/assets/germani.wav",
  },
];

import { cookies } from "next/headers";

async function getActiveTenantId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("bipesend.tenant.active")?.value;
  } catch {
    return undefined;
  }
}

export async function fetchTtsVoicesAction(): Promise<TtsVoicesResponse> {
  try {
    const tenantId = await getActiveTenantId();
    const url = tenantId
      ? `${AI_SERVICE_URL}/v1/tts/voices?tenant_id=${encodeURIComponent(tenantId)}`
      : `${AI_SERVICE_URL}/v1/tts/voices`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback gracioso
  }
  return { voices: FALLBACK_VOICES, total: FALLBACK_VOICES.length };
}

export async function synthesizeSpeechAction(
  text: string,
  voiceId: string,
  language: string = "pt",
  maxAudioSeconds: number = 20
): Promise<{ success: boolean; data?: SynthesizeSpeechResponse; error?: string }> {
  try {
    const tenantId = await getActiveTenantId();
    const res = await fetch(`${AI_SERVICE_URL}/v1/tts/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        language,
        max_audio_seconds: maxAudioSeconds,
        tenant_id: tenantId,
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Falha na síntese de voz" }));
      return { success: false, error: err.detail || "Erro no serviço XTTS" };
    }
    const data: SynthesizeSpeechResponse = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Serviço de voz indisponível no momento" };
  }
}

export async function cloneVoiceAction(formData: FormData): Promise<VoiceCloneResult> {
  try {
    const tenantId = await getActiveTenantId();
    if (tenantId && !formData.has("tenant_id")) {
      formData.append("tenant_id", tenantId);
    }

    const res = await fetch(`${AI_SERVICE_URL}/v1/tts/clone`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Falha ao clonar voz" }));
      return { success: false, error: err.detail || "Erro ao clonar voz" };
    }
    const data = await res.json();
    return { success: true, ...data };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro de conexão ao enviar áudio" };
  }
}

export async function deleteVoiceAction(voiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await getActiveTenantId();
    const url = tenantId
      ? `${AI_SERVICE_URL}/v1/tts/voices/${voiceId}?tenant_id=${encodeURIComponent(tenantId)}`
      : `${AI_SERVICE_URL}/v1/tts/voices/${voiceId}`;

    const res = await fetch(url, {
      method: "DELETE",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Falha ao excluir voz" }));
      return { success: false, error: err.detail };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

