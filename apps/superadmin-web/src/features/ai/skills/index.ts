/**
 * Catálogo Unificado de Skills de IA da BipeSend
 * Centraliza todas as habilidades e expõe utilitários para injeção em prompts
 * e seleção modular na criação de IAs Mestre.
 */

import { SkillDefinition } from "./types";
import { christianEthicsSkill } from "./core/christian-ethics.skill";
import { webSearchSkill } from "./core/web-search.skill";
import { scrumProductManagementSkill } from "./agile/scrum-product-management.skill";
import { humanizedServiceSkill } from "./behavior/humanized-service.skill";
import { spinSellingSdrSkill } from "./sales/spin-selling-sdr.skill";
import { cialdiniPersuasionSkill } from "./sales/cialdini-persuasion.skill";
import { vossNegotiationSkill } from "./sales/voss-negotiation.skill";
import { pixRecoverySkill } from "./sales/pix-recovery.skill";
import { realEstateAdvisorSkill } from "./verticals/real-estate-advisor.skill";
import { legalTriageSkill } from "./verticals/legal-triage.skill";
import { dentalHealthSkill } from "./verticals/dental-health.skill";
import { executiveAdvisorSkill } from "./verticals/executive-advisor.skill";

import { COGNITIVE_HARMONY_PROTOCOL, buildHarmoniousSkillsPrompt } from "./cognitive-orchestrator";

export * from "./types";
export * from "./cognitive-orchestrator";
export {
  christianEthicsSkill,
  webSearchSkill,
  scrumProductManagementSkill,
  humanizedServiceSkill,
  spinSellingSdrSkill,
  cialdiniPersuasionSkill,
  vossNegotiationSkill,
  pixRecoverySkill,
  realEstateAdvisorSkill,
  legalTriageSkill,
  dentalHealthSkill,
  executiveAdvisorSkill,
};

/** Todas as skills disponíveis no ecossistema BipeSend */
export const ALL_MODULAR_SKILLS: SkillDefinition[] = [
  christianEthicsSkill,
  webSearchSkill,
  humanizedServiceSkill,
  scrumProductManagementSkill,
  spinSellingSdrSkill,
  cialdiniPersuasionSkill,
  vossNegotiationSkill,
  pixRecoverySkill,
  realEstateAdvisorSkill,
  legalTriageSkill,
  dentalHealthSkill,
  executiveAdvisorSkill,
];

/** Skills elegíveis para IAs Mestre (reutilizáveis pelos templates dos tenants) */
export const MASTER_AGENT_ELIGIBLE_SKILLS: SkillDefinition[] = ALL_MODULAR_SKILLS.filter(
  (s) => s.targetAudience === "all" || s.targetAudience === "master_agent_only"
);

/**
 * Constrói o bloco de prompt especializado com base nas skills ativadas,
 * aplicando obrigatoriamente o Protocolo de Harmonia e Arbitragem Cognitiva (Anti-Conflito).
 */
export function buildSkillsPromptContribution(activeSkillIds: string[]): string {
  const activeSkills = ALL_MODULAR_SKILLS.filter((s) => activeSkillIds.includes(s.id));
  if (activeSkills.length === 0) return "";

  return buildHarmoniousSkillsPrompt(
    activeSkills.map((s) => ({
      id: s.id,
      name: s.name,
      authorOrCategory: s.methodologyOrAuthor || s.category,
      content: s.systemPromptContribution,
    }))
  );
}
