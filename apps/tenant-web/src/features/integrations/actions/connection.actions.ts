"use server";

import { fetchApi } from "@/lib/api-client";

export async function getConnectionsAction() {
  try {
    const res = await fetchApi("/api/v1/connections", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.error || "Failed to load connections" };
    }
    const data = await res.json();
    return { success: true, data: data.connections };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load connections";
    return { success: false, message };
  }
}

export async function createWhatsAppConnectionAction(name: string) {
  try {
    const res = await fetchApi("/api/v1/connections/whatsapp", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.error || "Failed to create connection" };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create connection";
    return { success: false, message };
  }
}
