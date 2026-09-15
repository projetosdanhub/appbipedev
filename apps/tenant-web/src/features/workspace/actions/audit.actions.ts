"use server";

import { fetchApi } from "@/lib/api-client";
import type { AuditLogListParams, AuditLogListResponse } from "@bipesend/contracts";

export async function getAuditLogsAction(
  tenantId: string,
  params: AuditLogListParams
): Promise<{ success: boolean; data?: AuditLogListResponse; message?: string }> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append("limit", params.limit.toString());
    if (params.cursor) searchParams.append("cursor", params.cursor);
    if (params.action) searchParams.append("action", params.action);
    if (params.actorId) searchParams.append("actorId", params.actorId);

    const response = await fetchApi(`/tenants/${tenantId}/audit?${searchParams.toString()}`);
    
    if (!response.ok) {
      const result = await response.json();
      return { success: false, message: result.error || "Erro ao buscar logs de auditoria." };
    }

    const data: AuditLogListResponse = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: "Erro inesperado ao buscar logs." };
  }
}
