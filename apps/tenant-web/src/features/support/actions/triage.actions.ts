"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { auth } from "@bipesend/auth";

export async function getErrorReportsAction(params: {
  status?: string;
  errorCode?: string;
  limit?: number;
  offset?: number;
}) {
  const user = await getWorkspaceUser();
  const session = await auth();
  const sessionId = (session as any)?.sessionId;

  if (!user || !sessionId) {
    throw new Error("Sessão não encontrada ou tenant inválido.");
  }

  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.errorCode) queryParams.set("errorCode", params.errorCode);
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.offset) queryParams.set("offset", params.offset.toString());

  const response = await fetch(
    `http://127.0.0.1:3002/tenants/${user.activeTenant.id}/support/error-reports?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sessionId=${sessionId}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Falha ao buscar os relatórios de erro.");
  }

  const data = await response.json();
  return data.data;
}

export async function updateErrorReportStatusAction(id: string, status: string) {
  const user = await getWorkspaceUser();
  const session = await auth();
  const sessionId = (session as any)?.sessionId;

  if (!user || !sessionId) {
    throw new Error("Sessão não encontrada ou tenant inválido.");
  }

  const response = await fetch(
    `http://127.0.0.1:3002/tenants/${user.activeTenant.id}/support/error-reports/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sessionId=${sessionId}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Falha ao atualizar status do relatório.");
  }

  revalidatePath("/settings/audit/errors");
  return { success: true };
}
