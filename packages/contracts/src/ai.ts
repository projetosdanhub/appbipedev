import { z } from "zod";

const idSchema = z.string().uuid();

export const aiAgentGenderSchema = z.enum([
  "feminine",
  "masculine",
  "neutral"
]);
export type AiAgentGender = z.infer<typeof aiAgentGenderSchema>;

export const aiAgentStatusSchema = z.enum([
  "active",
  "paused",
  "stopped"
]);
export type AiAgentStatus = z.infer<typeof aiAgentStatusSchema>;

export const aiAgentChannelSchema = z.enum([
  "all",
  "whatsapp",
  "instagram",
  "tiktok",
  "web"
]);
export type AiAgentChannel = z.infer<typeof aiAgentChannelSchema>;

export const aiAgentVoiceConfigSchema = z.object({
  voiceId: z.string().default("pt-BR-natural-sofia"),
  voiceName: z.string().default("Sofia Natural (Feminina e Empática)"),
  provider: z.enum(["gemini", "openai", "elevenlabs"]).default("gemini"),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(-20).max(20).default(0),
  sendAudioMode: z.enum(["text_only", "hybrid", "audio_only"]).default("hybrid"),
  sampleAudioUrl: z.string().nullable().optional(),
  cloningScript: z.string().max(1000).default(
    "Olá, que bom falar com você! Aqui é da equipe de atendimento. Estou à disposição para tirar qualquer dúvida e te ajudar a escolher a melhor solução."
  ),
  maxAudioSeconds: z.number().int().min(5).max(120).default(20),
}).strict();
export type AiAgentVoiceConfig = z.infer<typeof aiAgentVoiceConfigSchema>;

export const aiAgentSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  name: z.string().min(2).max(60),
  gender: aiAgentGenderSchema.default("feminine"),
  role: z.string().min(2).max(120),
  personality: z.string().min(10).max(1000),
  limitations: z.array(z.string().max(300)).max(20).default([]),
  knowledgeContext: z.string().max(3000).nullable().default(""),
  channel: aiAgentChannelSchema.default("all"),
  status: aiAgentStatusSchema.default("active"),
  isMasterTemplate: z.boolean().default(false),
  voiceConfig: aiAgentVoiceConfigSchema.default({
    voiceId: "pt-BR-natural-sofia",
    voiceName: "Sofia Natural (Feminina e Empática)",
    provider: "gemini",
    speed: 1.0,
    pitch: 0,
    sendAudioMode: "hybrid",
    cloningScript: "Olá, que bom falar com você! Aqui é da equipe de atendimento. Estou à disposição para tirar qualquer dúvida e te ajudar a escolher a melhor solução.",
    maxAudioSeconds: 20,
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();
export type AiAgent = z.infer<typeof aiAgentSchema>;

export const createAiAgentSchema = aiAgentSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).strict();
export type CreateAiAgent = z.infer<typeof createAiAgentSchema>;

export const updateAiAgentSchema = createAiAgentSchema.partial().strict();
export type UpdateAiAgent = z.infer<typeof updateAiAgentSchema>;

export const aiAgentTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  gender: z.string(),
  role: z.string(),
  personality: z.string(),
  limitations: z.array(z.string()),
  category: z.string(),
  model: z.string().optional(),
  voice: z.string().optional(),
  temperature: z.number().optional(),
  skills: z.array(z.string()).optional(),
}).strict();
export type AiAgentTemplate = z.infer<typeof aiAgentTemplateSchema>;

// --- Bipe AI CRM Pipeline Generation (Até 10 Fluxos) ---

export const generatedStageProposalSchema = z.object({
  name: z.string().min(1).max(100),
  colorToken: z.string().min(1).max(50).default("#007BFF"),
  category: z.enum(["open", "won", "lost"]).default("open"),
  position: z.number().int().min(0).max(9).default(0),
}).strict();
export type GeneratedStageProposal = z.infer<typeof generatedStageProposalSchema>;

export const generatePipelineRequestSchema = z.object({
  businessDescription: z.string().min(3).max(1000),
}).strict();
export type GeneratePipelineRequest = z.infer<typeof generatePipelineRequestSchema>;

export const generatePipelineResponseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  stages: z.array(generatedStageProposalSchema).min(1).max(10), // Limite rígido de 10 fluxos no CRM
}).strict();
export type GeneratePipelineResponse = z.infer<typeof generatePipelineResponseSchema>;

// --- Diálogo Conversacional com Guardrails ---

export const aiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
}).strict();
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export const chatWithAgentRequestSchema = z.object({
  agentId: idSchema.optional(),
  agentConfig: createAiAgentSchema.optional(),
  message: z.string().min(1).max(2000),
  history: z.array(aiChatMessageSchema).default([]),
  channel: aiAgentChannelSchema.default("whatsapp"),
}).strict();
export type ChatWithAgentRequest = z.infer<typeof chatWithAgentRequestSchema>;

export const chatWithAgentResponseSchema = z.object({
  reply: z.string(),
  blocked: z.boolean().default(false),
  blockReason: z.string().nullable().optional(),
  provider: z.string().default("fallback"),
}).strict();
export type ChatWithAgentResponse = z.infer<typeof chatWithAgentResponseSchema>;
