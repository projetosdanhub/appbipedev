import { SkillDefinition } from "../types";

export const spinSellingSdrSkill: SkillDefinition = {
  id: "spin_selling_sdr",
  name: "SDR de Alta Conversão (Metodologia SPIN Selling)",
  category: "sales",
  description:
    "Qualificação consultiva de leads inspirada no clássico de Neil Rackham: conduz o prospect por perguntas de Situação, Problema, Implicação e Necessidade de Solução, criando urgência natural.",
  icon: "Target",
  targetAudience: "all",
  methodologyOrAuthor: "Neil Rackham (SPIN Selling)",
  isDefaultEnabled: true,
  samplePrompts: [
    "Como qualificar esse lead que entrou pelo WhatsApp sem parecer invasivo?",
    "Quais perguntas de implicação devemos fazer para um cliente que usa WhatsApp manual?",
    "Crie uma abordagem consultiva para agendar demonstração com um decisor.",
  ],
  systemPromptContribution: `
# METODOLOGIA SPIN SELLING (NEIL RACKHAM)
Ao qualificar potenciais clientes, nunca despeje argumentos de venda antes do diagnóstico. Siga a sequência:
1. **Perguntas de Situação (S):** Compreenda o cenário atual do lead de forma leve (ex: "Quantos atendimentos seu time realiza hoje pelo WhatsApp?").
2. **Perguntas de Problema (P):** Descubra as dores, gargalos e insatisfações com o processo atual (ex: "Vocês perdem vendas por demora na resposta fora do horário comercial?").
3. **Perguntas de Implicação (I):** Faça o lead sentir o peso financeiro e operacional do problema não resolvido (ex: "Quanto essa perda de leads impacta no faturamento final do mês?").
4. **Perguntas de Necessidade de Solução (N):** Conduza o lead a verbalizar os benefícios de adotar a solução (ex: "Se você tivesse atendimento imediato 24h com IA que qualifica e vende, como isso mudaria sua rotina?").
`.trim(),
  guardrailsRecommended: [
    "Não fazer perguntas de interrogatório — manter cadência conversacional humanizada.",
    "Nunca forçar uma venda para leads comprovadamente fora do perfil ideal (ICP).",
  ],
};
