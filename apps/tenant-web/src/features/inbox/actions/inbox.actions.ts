"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { AddInternalNote } from "@bipesend/contracts";

export async function getAllConversationsAction(tenantId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations`, {
      method: "GET",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar conversas." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar conversas." };
  }
}

export async function addInternalNoteAction(tenantId: string, conversationId: string, data: AddInternalNote) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao adicionar nota interna.", details: result.details };
    
    revalidatePath("/inbox");
    return { success: true, message: "Nota adicionada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao adicionar nota interna." };
  }
}

export async function sendOutboundMessageAction(
  tenantId: string, 
  conversationId: string, 
  data: { text?: string; mediaUrl?: string; mediaType?: string; mediaName?: string; clientMessageId?: string }
) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao enviar mensagem.", details: result.details };
    
    revalidatePath("/inbox");
    return { success: true, message: "Mensagem enviada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao enviar mensagem." };
  }
}

export async function getConversationsByContactAction(tenantId: string, contactId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts/${contactId}/conversations`, {
      method: "GET",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar conversas." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar conversas." };
  }
}

export async function getMessagesAction(tenantId: string, conversationId: string, options?: { afterSequence?: string; limit?: number }) {
  try {
    let url = `/api/v1/tenants/${tenantId}/conversations/${conversationId}/messages`;
    if (options) {
      const params = new URLSearchParams();
      if (options.afterSequence) params.append("afterSequence", options.afterSequence);
      if (options.limit) params.append("limit", options.limit.toString());
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetchApi(url, { method: "GET" });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar mensagens." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar mensagens." };
  }
}

export async function updateConversationAction(tenantId: string, conversationId: string, data: any) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar conversa.", details: result.details };
    
    revalidatePath("/inbox");
    return { success: true, message: "Conversa atualizada com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar conversa." };
  }
}

export async function deleteConversationAction(tenantId: string, conversationId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao deletar conversa." };
    
    revalidatePath("/inbox");
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao deletar conversa." };
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    const response = await fetchApi(`/api/v1/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao fazer upload da mídia." };
    
    // Convert internal URL to ngrok URL if running locally
    let url = result.data.url;
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    if (publicApiUrl && !url.startsWith(publicApiUrl)) {
       // Extract the path from the internal URL
       try {
         const urlObj = new URL(url);
         const base = publicApiUrl.endsWith('/') ? publicApiUrl.slice(0, -1) : publicApiUrl;
         url = `${base}${urlObj.pathname}${urlObj.search}`;
       } catch (e) {
         // fallback if invalid URL
       }
    }
    
    return { success: true, data: { ...result.data, url } };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao fazer upload." };
  }
}

export async function getConversationAction(tenantId: string, conversationId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}`, {
      method: "GET",
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao buscar conversa." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar conversa." };
  }
}

export async function createConversationAction(tenantId: string, data: any) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar conversa." };
    
    revalidatePath("/inbox");
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar conversa." };
  }
}

export async function updateConversationStatusAction(
  tenantId: string, 
  conversationId: string, 
  status: string, 
  reason?: string, 
  expectedVersion?: number
) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason, expectedVersion }),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar status." };
    
    revalidatePath("/inbox");
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar status." };
  }
}

export async function updateReadStateAction(tenantId: string, conversationId: string, lastReadSequence: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/conversations/${conversationId}/read-state`, {
      method: "PUT",
      body: JSON.stringify({ lastReadSequence }),
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao atualizar estado de leitura." };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar estado de leitura." };
  }
}
