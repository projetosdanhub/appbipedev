"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmSegment, UpdateCrmSegment, CrmSegment } from "@bipesend/contracts";

export async function getSegmentsAction(tenantId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/segments`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar segmentos." };
    
    return { success: true, data: result.data as CrmSegment[] };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar segmentos." };
  }
}

export async function createSegmentAction(tenantId: string, data: CreateCrmSegment) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/segments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar segmento." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Segmento criado com sucesso!", data: result.data as CrmSegment };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar segmento." };
  }
}

export async function updateSegmentAction(tenantId: string, segmentId: string, data: UpdateCrmSegment) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/segments/${segmentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar segmento." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Segmento atualizado com sucesso!", data: result.data as CrmSegment };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar segmento." };
  }
}

export async function deleteSegmentAction(tenantId: string, segmentId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/segments/${segmentId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir segmento." };
    }
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Segmento excluído com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir segmento." };
  }
}

export async function previewSegmentAction(tenantId: string, filterAst: unknown) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/segments/preview`, {
      method: "POST",
      body: JSON.stringify(filterAst),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao carregar prévia do segmento." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao avaliar segmento." };
  }
}
