"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmPipeline, UpdateCrmPipeline } from "@bipesend/contracts";

export async function createPipelineAction(tenantId: string, data: CreateCrmPipeline) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar pipeline." };
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Pipeline criado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar pipeline." };
  }
}

export async function updatePipelineAction(tenantId: string, pipelineId: string, data: UpdateCrmPipeline) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar pipeline." };
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Pipeline atualizado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar pipeline." };
  }
}

export async function deletePipelineAction(tenantId: string, pipelineId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir pipeline." };
    }
    
    revalidatePath("/settings/crm/pipelines");
    revalidatePath("/crm");
    return { success: true, message: "Pipeline excluído com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir pipeline." };
  }
}

export async function getPipelinesAction(tenantId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar pipelines." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar pipelines." };
  }
}
