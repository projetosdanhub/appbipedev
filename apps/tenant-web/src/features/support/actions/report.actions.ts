"use server";

import { getWorkspaceUser } from "../../workspace/server/session";
import { auth } from "@bipesend/auth";

export async function reportErrorAction(state: any, formData: FormData) {
  const user = await getWorkspaceUser();
  const session = await auth();
  const sessionId = (session as any)?.sessionId;

  if (!user || !sessionId) return { success: false };

  const requestId = formData.get("requestId")?.toString();
  const errorCode = formData.get("errorCode")?.toString() || "UNKNOWN";

  if (!requestId) return { success: false };

  try {
    const response = await fetch(
      `http://127.0.0.1:3002/tenants/${user.activeTenant.id}/support/error-reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          requestId,
          errorCode,
        }),
      }
    );

    if (!response.ok) {
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to report error:", error);
    return { success: false };
  }
}
