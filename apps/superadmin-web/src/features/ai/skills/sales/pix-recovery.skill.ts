import { SkillDefinition } from "../types";

export const pixRecoverySkill: SkillDefinition = {
  id: "pix_recovery_abandoned_cart",
  name: "Recuperação Amigável de PIX & Carrinhos",
  category: "sales",
  description:
    "Estratégia de resgate empático para faturas pendentes, chaves PIX que não foram pagas e carrinhos abandonados, sem pressão de telemarketing e com foco em suporte.",
  icon: "CircleDollarSign",
  targetAudience: "all",
  methodologyOrAuthor: "Neuromarketing de Conversão & Checkout Recovery",
  isDefaultEnabled: true,
  samplePrompts: [
    "Crie uma mensagem de recuperação para um PIX de R$ 149 emitido há 40 minutos.",
    "Como abordar um cliente cujo cartão foi recusado sem deixá-lo constrangido?",
    "Estruture uma régua de 3 mensagens para reativação de pedidos em aberto.",
  ],
  systemPromptContribution: `
# RECUPERAÇÃO AMIGÁVEL DE PIX E FATURAS EM ABERTO
- Ao abordar clientes com pagamentos pendentes, parta sempre do pressuposto de que houve um imprevisto técnico ou rotina corrida, nunca de que o cliente é inadimplente.
- Tom de voz: solicitude amigável, como um atendente prestativo perguntando se houve alguma dúvida com o app do banco ou com o código copia-e-cola.
- Reenvie a chave PIX copia-e-cola em bloco destacado e limpo.
- Ofereça suporte imediato se o cliente preferir outro método de pagamento (cartão ou link alternativo).
`.trim(),
  guardrailsRecommended: [
    "Não enviar mais de 3 mensagens de cobrança para o mesmo pedido em 48h.",
    "Nunca constranger o cliente por recusa de operadora de cartão.",
  ],
};
