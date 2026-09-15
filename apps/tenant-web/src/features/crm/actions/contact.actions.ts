"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { CreateCrmContact, UpdateCrmContact } from "@bipesend/contracts";

export async function createContactAction(tenantId: string, data: CreateCrmContact) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao criar contato." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Contato criado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao criar contato." };
  }
}

export async function updateContactAction(tenantId: string, contactId: string, data: UpdateCrmContact) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao atualizar contato." };
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Contato atualizado com sucesso!", data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao atualizar contato." };
  }
}

export async function deleteContactAction(tenantId: string, contactId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts/${contactId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao excluir contato." };
    }
    
    revalidatePath("/crm/contacts");
    return { success: true, message: "Contato excluído com sucesso." };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao excluir contato." };
  }
}

export async function getContactsAction(tenantId: string) {
  try {
    const response = await fetchApi(`/api/v1/tenants/${tenantId}/contacts`);
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.error || "Erro ao listar contatos." };
    
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao listar contatos." };
  }
}
