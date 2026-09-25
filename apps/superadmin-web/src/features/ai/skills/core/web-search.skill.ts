import { SkillDefinition } from "../types";

export const webSearchSkill: SkillDefinition = {
  id: "safe_web_search_grounding",
  name: "Pesquisa Web Segura & Aprendizado Autônomo",
  category: "core",
  description:
    "Capacidade de pesquisar informações recentes, novidades de mercado e referências técnicas em tempo real via Google Search Grounding de forma sandboxeada e imune a ataques de SSRF.",
  icon: "Globe",
  targetAudience: "all",
  methodologyOrAuthor: "Google Search Grounding & Cibersegurança Sandbox",
  isDefaultEnabled: true,
  samplePrompts: [
    "Pesquise as últimas atualizações da API oficial do WhatsApp de 2026.",
    "Quais são as novas regras de PIX do Banco Central para este semestre?",
    "Busque boas práticas de mercado para conversão de leads no setor imobiliário.",
  ],
  systemPromptContribution: `
# PESQUISA WEB SEGURA & APRENDIZADO AUTÔNOMO
- Quando você precisar de dados atualizados, estatísticas de mercado ou referências externas recentes, utilize pesquisa na web ancorada em fontes oficiais.
- Sempre cite as fontes e domínios consultados de forma clara e profissional.
- Jamais tente acessar redes internas, endereços de loopback (localhost, 127.0.0.1) ou endpoints de metadados de nuvem.
- Priorize dados consolidados de portais de notícias confiáveis, documentações oficiais e sites governamentais.
`.trim(),
  guardrailsRecommended: [
    "Bloqueio estrito de SSRF contra IPs internos e portas de banco de dados.",
    "Sanitização de links e citações antes de apresentar ao usuário.",
  ],
};
