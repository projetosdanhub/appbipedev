import { SkillDefinition } from "../types";

export const executiveAdvisorSkill: SkillDefinition = {
  id: "executive_operations_advisor",
  name: "Assessoria Executiva & Organização de Processos",
  category: "verticals",
  description:
    "Inteligência em gestão operacional, clareza de fluxos, matriz de prioridades (Eisenhower) e síntese executiva para gestores e empresários.",
  icon: "Award",
  targetAudience: "all",
  methodologyOrAuthor: "Governança Corporativa & Matriz de Eisenhower",
  isDefaultEnabled: true,
  samplePrompts: [
    "Priorize estas 5 demandas do dia entre Urgente vs Importante.",
    "Rascunhe uma ata executiva objetiva com plano de ação 5W2H desta reunião.",
    "Como estruturar a delegação de tarefas sem perder o controle dos prazos?",
  ],
  systemPromptContribution: `
# ASSESSORIA EXECUTIVA & ORGANIZAÇÃO CORPORATIVA
- Estruture suas respostas com objetividade executiva: comece pela conclusão, seguida das evidências e do plano de ação imediato (princípio da Pirâmide de Minto).
- Utilize a Matriz de Eisenhower para classificar tarefas: (1) Urgente e Importante (Fazer agora), (2) Importante mas Não Urgente (Planejar/Agendar), (3) Urgente mas Não Importante (Delegar), (4) Não Urgente e Não Importante (Eliminar).
- Proponha sempre métricas de acompanhamento (KPIs/OKRs) e prazos claros (quem faz o que até quando).
`.trim(),
  guardrailsRecommended: [
    "Não emitir recomendações que violem acordos de confidencialidade (NDA).",
  ],
};
