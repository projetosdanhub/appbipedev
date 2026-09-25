import { z } from "zod";

// --- Metadados e Perfil ---

export const voiceProfileMetaSchema = z.object({
  id: z.string().default("germani-official-ptbr-v1"),
  name: z.string().default("Germani (Oficial Soberana)"),
  display_name: z.string().default("Germani"),
  version: z.string().default("1.0.0"),
  status: z.enum(["draft", "testing", "production"]).default("production"),
  language: z.string().default("pt-BR"),
  locale: z.string().default("pt-BR"),
  timezone: z.string().default("America/Sao_Paulo"),
  description: z.string().default(
    "Identidade vocal oficial soberana da Germani para os agentes de IA da BipeSend. Voz natural, acolhedora, inteligente, calma, clara e confiante, com pitch mediano medido em 176.1 Hz e integridade acústica de referência."
  ),
  tags: z.array(z.string()).default([
    "pt-BR",
    "female",
    "conversational",
    "premium",
    "warm",
    "support",
    "sales",
    "crm",
    "realtime",
    "germani"
  ]),
});
export type VoiceProfileMeta = z.infer<typeof voiceProfileMetaSchema>;

// --- Provedor e Fallback ---

export const voiceProviderSchema = z.object({
  type: z.enum(["dynamic", "openai_realtime", "elevenlabs", "cartesia", "local_tts"]).default("dynamic"),
  primary: z.string().default("provider_default"),
  fallback_enabled: z.boolean().default(true),
  voice: z.object({
    voice_id: z.string().default("germani"),
    model_id: z.string().default("tts_models/multilingual/multi-dataset/xtts_v2"),
    provider_voice_name: z.string().default("Germani PT-BR"),
    custom_voice: z.boolean().default(false),
  }),
  credentials: z.object({
    use_environment_variables: z.boolean().default(true),
    api_key_env: z.string().default("VOICE_PROVIDER_API_KEY"),
  }),
  fallback_chain: z.array(
    z.object({
      priority: z.number().int(),
      provider: z.string(),
      enabled: z.boolean(),
    })
  ).default([
    { priority: 1, provider: "primary", enabled: true },
    { priority: 2, provider: "secondary", enabled: true },
    { priority: 3, provider: "local_tts", enabled: false }
  ]),
});
export type VoiceProvider = z.infer<typeof voiceProviderSchema>;

// --- Identidade Vocal e Persona ---

export const voiceIdentitySchema = z.object({
  gender_presentation: z.enum(["female", "male", "neutral"]).default("female"),
  age_impression: z.string().default("30-38"),
  personality: z.object({
    warm: z.number().min(0).max(1).default(0.84),
    intelligent: z.number().min(0).max(1).default(0.9),
    confident: z.number().min(0).max(1).default(0.81),
    calm: z.number().min(0).max(1).default(0.84),
    friendly: z.number().min(0).max(1).default(0.86),
    professional: z.number().min(0).max(1).default(0.82),
    empathetic: z.number().min(0).max(1).default(0.8),
    approachable: z.number().min(0).max(1).default(0.88),
    premium: z.number().min(0).max(1).default(0.86),
    playful: z.number().min(0).max(1).default(0.18),
    authoritative: z.number().min(0).max(1).default(0.54),
    salesy: z.number().min(0).max(1).default(0.07),
  }),
  persona_description: z.string().default(
    "Uma especialista atenciosa e segura que conversa individualmente com o cliente. Deve parecer humana, presente e espontânea, sem soar como locutora, URA ou telemarketing."
  ),
  avoid: z.array(z.string()).default([
    "voz de telemarketing",
    "voz de locutora comercial",
    "voz infantilizada",
    "voz sensual",
    "voz caricata",
    "voz excessivamente animada",
    "voz monótona",
    "voz robótica",
    "tom professoral",
    "tom passivo-agressivo",
    "entonação teatral"
  ]),
});
export type VoiceIdentity = z.infer<typeof voiceIdentitySchema>;

// --- Assinatura Acústica ---

export const acousticSignatureSchema = z.object({
  timbre: z.object({
    warmth: z.number().min(0).max(1).default(0.8),
    brightness: z.number().min(0).max(1).default(0.52),
    softness: z.number().min(0).max(1).default(0.74),
    clarity: z.number().min(0).max(1).default(0.91),
    resonance: z.number().min(0).max(1).default(0.68),
    depth: z.number().min(0).max(1).default(0.55),
    breathiness: z.number().min(0).max(1).default(0.14),
    nasality: z.number().min(0).max(1).default(0.07),
    metallic: z.number().min(0).max(1).default(0.03),
  }),
  pitch: z.object({
    baseline: z.enum(["low", "medium_low", "medium", "medium_high", "high"]).default("medium_low"),
    normalized: z.number().min(0).max(1).default(0.46),
    variation: z.number().min(0).max(1).default(0.55),
    typical_range_semitones: z.number().default(7),
    maximum_range_semitones: z.number().default(10),
    question_rise_strength: z.number().default(0.32),
    statement_fall_strength: z.number().default(0.47),
  }),
  energy: z.object({
    baseline: z.number().min(0).max(1).default(0.55),
    minimum: z.number().min(0).max(1).default(0.32),
    maximum: z.number().min(0).max(1).default(0.75),
    dynamic_range: z.number().min(0).max(1).default(0.43),
  }),
});
export type AcousticSignature = z.infer<typeof acousticSignatureSchema>;

// --- Fala & Articulação ---

export const speechRateMultipliersSchema = z.object({
  default: z.number().default(1.0),
  explanation: z.number().default(0.92),
  technical: z.number().default(0.88),
  sales: z.number().default(1.01),
  support: z.number().default(0.94),
  empathy: z.number().default(0.87),
  confirmation: z.number().default(1.03),
  numbers: z.number().default(0.84),
  codes: z.number().default(0.72),
});
export type SpeechRateMultipliers = z.infer<typeof speechRateMultipliersSchema>;

export const speechConfigSchema = z.object({
  rate: z.object({
    default_wpm: z.number().int().default(154),
    minimum_wpm: z.number().int().default(118),
    maximum_wpm: z.number().int().default(182),
    multipliers: speechRateMultipliersSchema,
  }),
  articulation: z.object({
    clarity: z.number().min(0).max(1).default(0.92),
    precision: z.number().min(0).max(1).default(0.86),
    natural_reduction: z.number().min(0).max(1).default(0.44),
    consonant_strength: z.number().min(0).max(1).default(0.61),
    vowel_openness: z.number().min(0).max(1).default(0.57),
    word_separation: z.number().min(0).max(1).default(0.61),
  }),
  rhythm: z.object({
    naturalness: z.number().min(0).max(1).default(0.93),
    regularity: z.number().min(0).max(1).default(0.62),
    variability: z.number().min(0).max(1).default(0.58),
    avoid_staccato: z.boolean().default(true),
    avoid_constant_cadence: z.boolean().default(true),
  }),
});
export type SpeechConfig = z.infer<typeof speechConfigSchema>;

// --- Prosódia e Pausas ---

export const prosodyConfigSchema = z.object({
  expressiveness: z.number().min(0).max(1).default(0.54),
  emotional_subtlety: z.number().min(0).max(1).default(0.86),
  sentence_variation: z.number().min(0).max(1).default(0.58),
  semantic_emphasis: z.number().min(0).max(1).default(0.48),
  pauses: z.object({
    micro_ms: z.object({ min: z.number().default(60), max: z.number().default(130) }),
    comma_ms: z.object({ min: z.number().default(110), max: z.number().default(220) }),
    colon_ms: z.object({ min: z.number().default(180), max: z.number().default(320) }),
    sentence_ms: z.object({ min: z.number().default(260), max: z.number().default(470) }),
    paragraph_ms: z.object({ min: z.number().default(480), max: z.number().default(820) }),
    thinking_ms: z.object({ min: z.number().default(180), max: z.number().default(380) }),
  }),
  emphasis: z.object({
    enabled: z.boolean().default(true),
    strength: z.number().default(0.48),
    pitch_delta_semitones: z.number().default(0.35),
    speed_delta: z.number().default(-0.04),
    energy_delta: z.number().default(0.08),
    pause_before_ms: z.number().default(45),
    prioritize: z.array(z.string()).default([
      "nome do cliente",
      "ação solicitada",
      "datas",
      "horários",
      "preços",
      "descontos",
      "prazos",
      "resultado",
      "alertas",
      "confirmações",
      "nomes de produtos"
    ]),
  }),
});
export type ProsodyConfig = z.infer<typeof prosodyConfigSchema>;

// --- Motor de Emoções ---

export const emotionPresetConfigSchema = z.object({
  warmth: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  expressiveness: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  smile: z.number().min(0).max(1),
  rate: z.number().min(0.5).max(2.0),
  pitch_offset: z.number(),
});
export type EmotionPresetConfig = z.infer<typeof emotionPresetConfigSchema>;

export const emotionEngineSchema = z.object({
  enabled: z.boolean().default(true),
  auto_detect_context: z.boolean().default(true),
  transition_smoothing_ms: z.number().default(350),
  limits: z.object({
    max_emotion_intensity: z.number().default(0.72),
    max_pitch_shift_semitones: z.number().default(1.2),
    max_rate_multiplier: z.number().default(1.12),
    min_rate_multiplier: z.number().default(0.82),
  }),
  presets: z.record(z.string(), emotionPresetConfigSchema).default({
    neutral: { warmth: 0.78, energy: 0.52, expressiveness: 0.47, confidence: 0.73, smile: 0.16, rate: 1.0, pitch_offset: 0.0 },
    welcoming: { warmth: 0.9, energy: 0.61, expressiveness: 0.6, confidence: 0.72, smile: 0.4, rate: 1.01, pitch_offset: 0.3 },
    empathetic: { warmth: 0.94, energy: 0.4, expressiveness: 0.43, confidence: 0.62, smile: 0.05, rate: 0.88, pitch_offset: -0.25 },
    explaining: { warmth: 0.76, energy: 0.49, expressiveness: 0.4, confidence: 0.82, smile: 0.1, rate: 0.92, pitch_offset: -0.1 },
    confident: { warmth: 0.7, energy: 0.61, expressiveness: 0.43, confidence: 0.9, smile: 0.12, rate: 0.98, pitch_offset: -0.25 },
    positive: { warmth: 0.86, energy: 0.67, expressiveness: 0.62, confidence: 0.81, smile: 0.45, rate: 1.04, pitch_offset: 0.4 },
    apologetic: { warmth: 0.93, energy: 0.37, expressiveness: 0.38, confidence: 0.57, smile: 0.0, rate: 0.86, pitch_offset: -0.3 },
    urgent: { warmth: 0.66, energy: 0.69, expressiveness: 0.54, confidence: 0.9, smile: 0.0, rate: 1.06, pitch_offset: 0.1 },
  }),
});
export type EmotionEngine = z.infer<typeof emotionEngineSchema>;

// --- Presets Oficiais de Agentes BipeSend (Germani) ---

export const agentPresetSchema = z.object({
  name: z.string(),
  voice: z.object({
    warmth: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    expressiveness: z.number().min(0).max(1),
    speed_multiplier: z.number().min(0.5).max(2.0),
  }),
  behavior: z.record(z.string(), z.any()),
});
export type AgentPreset = z.infer<typeof agentPresetSchema>;

export const defaultAgentPresetsSchema = z.object({
  bipesend_assistant: agentPresetSchema,
  bipesend_support: agentPresetSchema,
  bipesend_sales: agentPresetSchema,
  bipesend_onboarding: agentPresetSchema,
  bipesend_collection: agentPresetSchema,
});
export type DefaultAgentPresets = z.infer<typeof defaultAgentPresetsSchema>;

// --- Pronúncia e Dicionário da Marca ---

export const brandLexiconItemSchema = z.object({
  spoken: z.string(),
  ipa: z.string().nullable().optional(),
  priority: z.number().default(100),
});
export type BrandLexiconItem = z.infer<typeof brandLexiconItemSchema>;

export const pronunciationSchema = z.object({
  locale: z.string().default("pt-BR"),
  abbreviations: z.record(z.string(), z.string()).default({
    IA: "i á",
    API: "a pê i",
    CRM: "cê érre eme",
    ERP: "ê érre pê",
    JSON: "jêi son",
    URL: "u érre éle",
    SaaS: "sás",
    SQL: "ésse quê éle",
    HTTP: "agá tê tê pê",
    HTTPS: "agá tê tê pê ésse",
    PIX: "píquis",
    WhatsApp: "uóts app",
    BipeSend: "báipi send"
  }),
  brand_lexicon: z.record(z.string(), brandLexiconItemSchema).default({
    BipeSend: { spoken: "Báipi Send", priority: 100 },
    BipeWPro: { spoken: "Báipi Uê Pró", priority: 100 },
    "Evolution API": { spoken: "Evolution API", priority: 80 },
    Metricool: { spoken: "Métri-cool", priority: 60 }
  }),
});
export type PronunciationConfig = z.infer<typeof pronunciationSchema>;

// --- VAD, WebRTC, Latência & Canais ---

export const vadConfigSchema = z.object({
  enabled: z.boolean().default(true),
  mode: z.enum(["acoustic_only", "semantic_plus_acoustic"]).default("semantic_plus_acoustic"),
  thresholds: z.object({
    speech_probability: z.number().default(0.54),
    activation: z.number().default(0.52),
    deactivation: z.number().default(0.38),
  }),
  timing: z.object({
    prefix_padding_ms: z.number().default(260),
    silence_duration_ms: z.number().default(520),
    minimum_speech_duration_ms: z.number().default(160),
    maximum_utterance_duration_ms: z.number().default(45000),
  }),
});
export type VadConfig = z.infer<typeof vadConfigSchema>;

export const latencyConfigSchema = z.object({
  mode: z.enum(["batch", "realtime"]).default("realtime"),
  targets_ms: z.object({
    speech_to_text_partial: z.number().default(180),
    end_of_turn_detection: z.number().default(350),
    llm_first_token: z.number().default(300),
    tts_first_audio: z.number().default(280),
    end_to_end_target: z.number().default(850),
    end_to_end_max_acceptable: z.number().default(1400),
  }),
  streaming: z.object({
    stt: z.boolean().default(true),
    llm: z.boolean().default(true),
    tts: z.boolean().default(true),
  }),
});
export type LatencyConfig = z.infer<typeof latencyConfigSchema>;

// --- Perfil Vocal Completo BipeSend (Germani Oficial v1.0.0) ---

export const voiceProfileSchema = z.object({
  $schema: z.string().optional().default("https://bipesend.local/schemas/voice-profile/v1.json"),
  schema_version: z.string().default("1.0.0"),
  profile: voiceProfileMetaSchema,
  provider: voiceProviderSchema,
  voice_identity: voiceIdentitySchema,
  acoustic_signature: acousticSignatureSchema,
  speech: speechConfigSchema,
  prosody: prosodyConfigSchema,
  emotion_engine: emotionEngineSchema,
  vad: vadConfigSchema,
  latency: latencyConfigSchema,
  pronunciation: pronunciationSchema,
  agent_presets: z.record(z.string(), agentPresetSchema),
});
export type VoiceProfile = z.infer<typeof voiceProfileSchema>;

// --- Registro de Voz Clonada Aprovada ---

export const clonedVoiceRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantId: z.string().optional(),
  gender: z.enum(["female", "male", "neutral"]).default("female"),
  personaDescription: z.string().optional(),
  sourceAudioFileName: z.string().optional(),
  sourceAudioUrl: z.string().optional(),
  assignedAgentKey: z.string().default("general"),
  status: z.enum(["draft", "approved", "production"]).default("approved"),
  acoustics: z.object({
    pitchHz: z.number().default(190),
    cadenceWpm: z.number().default(150),
    snrDb: z.number().default(45),
    prosodyScore: z.number().default(88),
    warmth: z.number().min(0).max(1).default(0.85),
    stability: z.number().min(0).max(1).default(0.9),
  }),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type ClonedVoiceRecord = z.infer<typeof clonedVoiceRecordSchema>;

