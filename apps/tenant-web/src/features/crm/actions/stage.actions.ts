"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmPipelineStage, UpdateCrmPipelineStage } from "@bipesend/contracts";

export async function createPipelineStageAction(tenantId: string, pipelineId: string, data: CreateCrmPipelineStage) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/stages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar etapa." };
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Etapa criada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar etapa." };
  }
}

export async function updatePipelineStageAction(tenantId: string, pipelineId: string, stageId: string, data: UpdateCrmPipelineStage) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/stages/${stageId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar etapa." };
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Etapa atualizada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar etapa." };
  }
}

export async function deletePipelineStageAction(tenantId: string, pipelineId: string, stageId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/stages/${stageId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir etapa." };
    }
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Etapa excluída com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir etapa." };
  }
}

export async function getPipelineStagesAction(tenantId: string, pipelineId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/stages`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar etapas." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar etapas." };
  }
}
