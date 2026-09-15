"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmTag, UpdateCrmTag, CrmTag } from "@bipesend/contracts";

export async function getTagsAction(tenantId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/tags`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar tags." };
    
    return { success: true, data: result.data as CrmTag[] };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar tags." };
  }
}

export async function createTagAction(tenantId: string, data: CreateCrmTag) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/tags`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar tag." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Tag criada com sucesso!", data: result.data as CrmTag };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar tag." };
  }
}

export async function updateTagAction(tenantId: string, tagId: string, data: UpdateCrmTag) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/tags/${tagId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar tag." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Tag atualizada com sucesso!", data: result.data as CrmTag };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar tag." };
  }
}

export async function deleteTagAction(tenantId: string, tagId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/tags/${tagId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir tag." };
    }
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Tag excluída com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir tag." };
  }
}

export async function assignTagToContactAction(tenantId: string, contactId: string, tagId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts/${contactId}/tags/${tagId}`, {
      method: "PUT",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao vincular tag ao contato." };
    }
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Tag vinculada ao contato com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao vincular tag." };
  }
}

export async function removeTagFromContactAction(tenantId: string, contactId: string, tagId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts/${contactId}/tags/${tagId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao remover tag do contato." };
    }
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Tag removida do contato com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao remover tag." };
  }
}
