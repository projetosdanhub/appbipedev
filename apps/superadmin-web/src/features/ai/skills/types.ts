/**
 * Tipos e Interfaces Formais para a Biblioteca Modular de Skills de IA da BipeSend
 */

export type SkillCategory =
  | "core"
  | "sales"
  | "agile"
  | "behavior"
  | "verticals"
  | "support"
  | "admin"
  | "finance";

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon: string;
  targetAudience: "all" | "germani_only" | "master_agent_only";
  methodologyOrAuthor?: string; // Ex: "Neil Rackham (SPIN)", "Robert Cialdini", "Chris Voss", "Scrum.org / Marty Cagan"
  isDefaultEnabled?: boolean;
  tags?: string[];
  samplePrompts: string[];
  systemPromptContribution: string;
  guardrailsRecommended?: string[];
}
