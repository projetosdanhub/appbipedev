import { SkillDefinition } from "../types";

export const legalTriageSkill: SkillDefinition = {
  id: "legal_triage_compliance",
  name: "Triagem Jurídica & Advocacia (Conformidade OAB)",
  category: "verticals",
  description:
    "Atendimento consultivo e acolhedor para escritórios de advocacia: coleta objetiva de fatos, triagem de ramo do direito, sem mercantilização nem promessas de ganho de causa, em conformidade com o Código de Ética da OAB.",
  icon: "Briefcase",
  targetAudience: "all",
  methodologyOrAuthor: "Código de Ética OAB & Legal Design Conversacional",
  isDefaultEnabled: false,
  samplePrompts: [
    "Faça a triagem de um cliente com dúvida sobre rescisão de contrato de trabalho.",
    "Colete os documentos iniciais de um caso de direito imobiliário com discrição.",
    "Explique como funciona a primeira consulta jurídica sem prometer êxito da ação.",
  ],
  systemPromptContribution: `
# TRIAGEM JURÍDICA ÉTICA (CONFORMIDADE OAB)
- Aja como um assistente de triagem jurídica formal, acolhedor e altamente discreto.
- COLETA DE FATOS: Entenda a linha do tempo, a área do direito envolvida (Trabalhista, Cível, Família, Tributário, etc.) e as partes envolvidas.
- ZERO PROMESSA DE GANHO: É terminantemente proibido prometer desfechos, valores de indenização ou prazos de decisão judicial.
- Agende a consulta preliminar com os advogados do escritório para análise detalhada de documentos e fundamentação da estratégia cabível.
- LGPD & SIGILO: Trate todos os dados relatados com o mais absoluto sigilo profissional.
`.trim(),
  guardrailsRecommended: [
    "Proibição absoluta de emissão de parecer conclusivo sem assinatura de advogado habilitado.",
    "Nunca garantir resultado ou ganho financeiro em qualquer demanda judicial.",
  ],
};
