export const OMNICHANNEL_PIPELINE_NAME = "Atendimento Omnichannel";
export const OMNICHANNEL_INITIAL_STAGE_NAME = "Novos Contatos";

export const DEFAULT_OMNICHANNEL_STAGES = [
  { name: "Novos Contatos", colorToken: "#007BFF", category: "open" as const, position: 0 },
  { name: "Em Atendimento", colorToken: "#6366F1", category: "open" as const, position: 1 },
  { name: "Aguardando Cliente", colorToken: "#F59E0B", category: "open" as const, position: 2 },
  { name: "Pendente / Transferido", colorToken: "#8B5CF6", category: "open" as const, position: 3 },
  { name: "Finalizado", colorToken: "#10B981", category: "won" as const, position: 4 },
];

/**
 * Identifica se um funil é o Funil Fixo Omnichannel do sistema.
 */
export function isOmnichannelPipeline(pipeline?: { name: string; nameNormalized?: string | null } | null): boolean {
  if (!pipeline) return false;
  const norm = (pipeline.nameNormalized || pipeline.name).toLowerCase().trim();
  return (
    norm === "atendimento omnichannel" ||
    norm === "atendimento & canais" ||
    norm === "omnichannel"
  );
}

/**
 * Identifica se um fluxo/etapa é protegido contra exclusão e arquivamento
 * (ex: a etapa primária 'Novos Contatos' do Funil Omnichannel).
 */
export function isProtectedStage(
  stage: { name: string; position?: number },
  pipeline?: { name: string; nameNormalized?: string | null } | null
): boolean {
  if (!isOmnichannelPipeline(pipeline)) return false;
  const stageName = stage.name.toLowerCase().trim();
  return stageName === "novos contatos" || stage.position === 0;
}
