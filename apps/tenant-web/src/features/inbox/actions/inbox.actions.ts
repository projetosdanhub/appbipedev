"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { AddInternalNote } from "@bipesend/contracts";

export async function addInternalNoteAction(tenantId: string, conversationId: string, data: AddInternalNote) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/inbox/conversations/${conversationId}/messages/internal-notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao adicionar nota interna.", details: result.details };
    
    revalidatePath("/crm");
    return { success: true, message: "Nota adicionada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao adicionar nota interna." };
  }
}

export async function getConversationsByContactAction(tenantId: string, contactId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/inbox/conversations?contactId=${contactId}`, {
      method: "GET",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar conversas." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar conversas." };
  }
}

export async function getMessagesAction(tenantId: string, conversationId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/inbox/conversations/${conversationId}/messages`, {
      method: "GET",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar mensagens." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar mensagens." };
  }
}

export async function createConversationAction(tenantId: string, data: any) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/inbox/conversations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar conversa." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar conversa." };
  }
}
