"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";
import { CustomField, CreateCustomField, UpdateCustomField } from "@bipesend/contracts";

export async function getCustomFieldsAction(tenantId: string, entityType: string = "contact"): Promise<{ success: boolean; data?: CustomField[], message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/custom-fields?entityType=${entityType}`);
    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.error || "Failed to list custom fields" };
    }
    return { success: true, data: result.data };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}

export async function createCustomFieldAction(tenantId: string, payload: CreateCustomField): Promise<{ success: boolean; data?: CustomField, message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/custom-fields`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.error || "Failed to create custom field" };
    }
    revalidatePath("/crm/contacts");
    return { success: true, data: result.data };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}

export async function updateCustomFieldAction(tenantId: string, id: string, payload: UpdateCustomField): Promise<{ success: boolean; data?: CustomField, message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/custom-fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.error || "Failed to update custom field" };
    }
    revalidatePath("/crm/contacts");
    return { success: true, data: result.data };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}

export async function deleteCustomFieldAction(tenantId: string, id: string): Promise<{ success: boolean, message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/custom-fields/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      const result = await res.json();
      return { success: false, message: result.error || "Failed to delete custom field" };
    }
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}
