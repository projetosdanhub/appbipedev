"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmDeal, UpdateCrmDeal, MoveCrmDeal } from "@bipesend/contracts";

export async function createDealAction(tenantId: string, pipelineId: string, data: CreateCrmDeal) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/deals`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar negócio.", details: result.details };
    
    revalidatePath("/crm");
    return { success: true, message: "Negócio criado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar negócio." };
  }
}

export async function updateDealAction(tenantId: string, pipelineId: string, dealId: string, data: UpdateCrmDeal) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/deals/${dealId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar negócio.", details: result.details };
    
    revalidatePath("/crm");
    return { success: true, message: "Negócio atualizado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar negócio." };
  }
}

export async function moveDealAction(tenantId: string, pipelineId: string, dealId: string, data: MoveCrmDeal & { payload?: Partial<UpdateCrmDeal> }) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/deals/${dealId}/move`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        return { success: false, message: result.error || "Erro ao mover negócio.", details: result.details };
    }
    
    revalidatePath("/crm");
    return { success: true, message: "Negócio movido com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao mover negócio." };
  }
}

export async function deleteDealAction(tenantId: string, pipelineId: string, dealId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/deals/${dealId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir negócio." };
    }
    
    revalidatePath("/crm");
    return { success: true, message: "Negócio excluído com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir negócio." };
  }
}

export async function getDealsAction(tenantId: string, pipelineId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/pipelines/${pipelineId}/deals`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar negócios." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar negócios." };
  }
}
