"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";
import { ContactImportBatch, CreateImportPreview, CommitImport } from "@bipesend/contracts";

export async function createImportPreviewAction(tenantId: string, payload: CreateImportPreview): Promise<{ success: boolean; data?: ContactImportBatch, message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/imports/preview`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.error || "Failed to create import preview" };
    }
    return { success: true, data: result.data };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}

export async function commitImportAction(tenantId: string, id: string, payload: CommitImport): Promise<{ success: boolean; data?: ContactImportBatch, message?: string }> {
  try {
    const res = await fetchApi(`/api/v1/tenants/${tenantId}/imports/${id}/commit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, message: result.error || "Failed to commit import" };
    }
    revalidatePath("/crm/contacts");
    return { success: true, data: result.data };
  } catch (e: any) {
    return { success: false, message: e.message || "Internal server error" };
  }
}
