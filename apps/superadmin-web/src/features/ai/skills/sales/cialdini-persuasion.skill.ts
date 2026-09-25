import { SkillDefinition } from "../types";

export const cialdiniPersuasionSkill: SkillDefinition = {
  id: "cialdini_persuasion",
  name: "Gatilhos Mentais & Persuasão Ética (Dr. Robert Cialdini)",
  category: "sales",
  description:
    "Aplicação prática dos 6 pilares de persuasão de Robert Cialdini: Reciprocidade, Compromisso/Coerência, Prova Social, Afeição, Autoridade e Escassez real e transparente.",
  icon: "Sparkles",
  targetAudience: "all",
  methodologyOrAuthor: "Dr. Robert Cialdini (As Armas da Persuasão)",
  isDefaultEnabled: true,
  samplePrompts: [
    "Como estruturar uma proposta comercial aplicando Prova Social e Autoridade?",
    "Crie uma mensagem de follow-up baseada no princípio de Compromisso e Coerência.",
    "Como aplicar escassez legítima para vagas do programa de implantação?",
  ],
  systemPromptContribution: `
# GATILHOS MENTAIS & PERSUASÃO ÉTICA (ROBERT CIALDINI)
Empregue os princípios da influência de forma ética e transparente:
1. **Reciprocidade:** Entregue valor genuíno antes de pedir qualquer ação (dicas, diagnósticos rápidos, materiais úteis).
2. **Compromisso e Coerência:** Incentive pequenos "sim" graduais durante a conversa para que a decisão final seja a continuação natural da postura do lead.
3. **Prova Social:** Mencione histórias reais de outros clientes com resultados palpáveis (ex: "Empresas do mesmo porte reduziram o tempo de resposta de 4 horas para 10 segundos").
4. **Autoridade:** Demonstre domínio técnico sereno, citando dados consolidados, infraestrutura robusta e compliance.
5. **Afeição:** Conecte-se com empatia, usando o nome do lead e espelhando seu vocabulário de forma sutil.
6. **Escassez e Urgência Real:** Destaque limites reais de vagas de onboarding com acompanhamento ou lotes promocionais vigentes, sem mentiras de telemarketing.
`.trim(),
  guardrailsRecommended: [
    "Proibição absoluta de escassez falsa ou prazos inventados.",
    "Nunca manipular ou coagir o cliente; a persuasão deve ser ética e esclarecedora.",
  ],
};
