"use server";

import { fetchApi } from "@/lib/api-client";
import { getWorkspaceUser } from "@/features/workspace/server/session";

async function parseResponseSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text || `Erro HTTP ${res.status}` };
  }
}

export async function getConnectionsAction() {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi("/api/v1/messaging/connections", { 
      cache: "no-store",
      headers: { "x-tenant-id": tenantId },
    });
    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || "Failed to load connections" };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load connections";
    return { success: false, message };
  }
}

export async function createWhatsAppConnectionAction(name: string) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi("/api/v1/messaging/connections", {
      method: "POST",
      headers: { "x-tenant-id": tenantId },
      body: JSON.stringify({ name, provider: "evolution_api" }),
    });

    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || data.message || "Failed to create connection" };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create connection";
    return { success: false, message };
  }
}

export interface SocialConnectionMetadata {
  username?: string;
  accessToken?: string;
  pageId?: string;
  instagramBusinessAccountId?: string;
  clientKey?: string;
  clientSecret?: string;
  permissions?: string[];
  complianceConfirmed?: boolean;
  connectedAt?: string;
  authMode?: "oauth" | "manual" | "token";
  [key: string]: unknown;
}

export async function createSocialConnectionAction(
  provider: "instagram" | "tiktok",
  name: string,
  username?: string,
  extraMetadata?: SocialConnectionMetadata
) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const cleanUsername = username?.startsWith("@") ? username : `@${username || name}`;
    const metadata = {
      username: cleanUsername,
      connectedAt: new Date().toISOString(),
      ...extraMetadata,
    };

    const res = await fetchApi("/api/v1/messaging/connections", {
      method: "POST",
      headers: { "x-tenant-id": tenantId },
      body: JSON.stringify({
        name,
        provider,
        metadata,
      }),
    });

    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || data.message || `Falha ao conectar ${provider}` };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : `Falha ao conectar ${provider}`;
    return { success: false, message };
  }
}

export async function testConnectionAction(instanceName: string) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi(`/api/v1/messaging/connections/${instanceName}`, {
      cache: "no-store",
      headers: { "x-tenant-id": tenantId },
    });
    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || "Canal inacessível ou desconectado." };
    }
    return { 
      success: true, 
      status: data.status, 
      message: data.status === "connected" 
        ? "Canal operando normalmente e pronto para receber mensagens." 
        : "Canal em processo de sincronização ou aguardando autenticação." 
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao testar canal";
    return { success: false, message };
  }
}

export async function deleteConnectionAction(instanceName: string) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi(`/api/v1/messaging/connections/${instanceName}`, {
      method: "DELETE",
      headers: { "x-tenant-id": tenantId },
    });
    if (!res.ok) {
      const data = await parseResponseSafe(res);
      return { success: false, message: data.error || "Failed to delete connection" };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete connection";
    return { success: false, message };
  }
}

export async function refreshQrCodeAction(instanceName: string) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi(`/api/v1/messaging/connections/${instanceName}/qrcode`, {
      method: "POST",
      cache: "no-store",
      headers: { "x-tenant-id": tenantId },
    });
    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || "Não foi possível obter novo QR Code" };
    }
    return { success: true, qrcode: data.qrcode };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Erro ao atualizar QR Code" };
  }
}

export async function testTelegramBotTokenAction(botToken: string) {
  try {
    const trimmedToken = botToken.trim();
    if (!trimmedToken || !trimmedToken.includes(":")) {
      return { success: false, message: "Token inválido. O formato deve ser como '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ'." };
    }

    const response = await fetch(`https://api.telegram.org/bot${trimmedToken}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      return { 
        success: false, 
        message: data.description || "Token do bot não foi aceito pelo Telegram." 
      };
    }

    return {
      success: true,
      bot: {
        id: data.result.id,
        firstName: data.result.first_name,
        username: data.result.username,
        canJoinGroups: data.result.can_join_groups,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Erro ao validar token com o Telegram.",
    };
  }
}

export async function createTelegramConnectionAction(
  name: string,
  botToken: string,
  botUsername?: string
) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const trimmedToken = botToken.trim();
    const cleanUsername = botUsername 
      ? (botUsername.startsWith("@") ? botUsername : `@${botUsername}`) 
      : `@${name.replace(/[^a-zA-Z0-9_]/g, "")}_bot`;

    const metadata = {
      botToken: trimmedToken,
      username: cleanUsername,
      botUsername: cleanUsername,
      connectedAt: new Date().toISOString(),
      provider: "telegram",
    };

    const res = await fetchApi("/api/v1/messaging/connections", {
      method: "POST",
      headers: { "x-tenant-id": tenantId },
      body: JSON.stringify({
        name,
        provider: "telegram",
        metadata,
      }),
    });

    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || data.message || "Falha ao conectar Telegram Bot" };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Falha ao conectar Telegram Bot";
    return { success: false, message };
  }
}

export async function simulateIncomingMessageAction(
  channel: "whatsapp" | "instagram" | "tiktok" | "telegram",
  senderName: string,
  messageText: string
) {
  try {
    const user = await getWorkspaceUser();
    const tenantId = user.activeTenant.id;

    const res = await fetchApi("/api/v1/messaging/connections/simulate-message", {
      method: "POST",
      headers: { "x-tenant-id": tenantId },
      body: JSON.stringify({
        channel,
        senderName,
        messageText,
      }),
    });
    const data = await parseResponseSafe(res);
    if (!res.ok) {
      return { success: false, message: data.error || "Falha na simulação de mensagem" };
    }
    return { success: true, message: "Mensagem simulada com sucesso! Verifique a Inbox e o CRM.", data };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Erro na simulação" };
  }
}
