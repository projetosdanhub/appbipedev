"use server";

import { requireTenantWebSession } from "../../auth/actions/session.actions";
import { fetchApi } from "../../../lib/api-client";

export async function reportErrorAction(formData: FormData) {
  const session = await requireTenantWebSession();
  const requestId = formData.get("requestId")?.toString();
  const errorCode = formData.get("errorCode")?.toString() || "UNKNOWN";

  if (!requestId) return { success: false };

  try {
    await fetchApi(
      `/tenants/${session.tenantId}/support/error-reports`,
      {
        method: "POST",
        body: JSON.stringify({
          requestId,
          errorCode,
        }),
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to report error:", error);
    return { success: false };
  }
}
