"use server";

import { fetchApi } from "@/lib/api-client";

export async function getConnectionsAction() {
  try {
    const res = await fetchApi("/api/v1/messaging/connections", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.error || "Failed to load connections" };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load connections";
    return { success: false, message };
  }
}

export async function createWhatsAppConnectionAction(name: string) {
  try {
    const res = await fetchApi("/api/v1/messaging/connections", {
      method: "POST",
      body: JSON.stringify({ name, provider: "evolution_api" }),
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

export async function createSocialConnectionAction(provider: "instagram" | "tiktok", name: string, username?: string) {
  try {
    const cleanUsername = username?.startsWith("@") ? username : `@${username || name}`;
    const res = await fetchApi("/api/v1/messaging/connections", {
      method: "POST",
      body: JSON.stringify({
        name,
        provider,
        metadata: {
          username: cleanUsername,
          connectedAt: new Date().toISOString(),
        },
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data.error || `Falha ao conectar ${provider}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : `Falha ao conectar ${provider}`;
    return { success: false, message };
  }
}

export async function deleteConnectionAction(instanceName: string) {
  try {
    const res = await fetchApi(`/api/v1/messaging/connections/${instanceName}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        return { success: false, message: data.error || "Failed to delete connection" };
      }
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete connection";
    return { success: false, message };
  }
}
