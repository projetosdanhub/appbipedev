"use server";

/**
 * Server Actions para gerenciar credenciais de integração (Evolution, Meta, TikTok)
 * no SuperAdmin. Toda comunicação é feita via API backend — NUNCA retorna secrets ao frontend.
 */

import { auth } from "@bipesend/auth/superadmin";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

/** Helper para construir headers de auth usando o cookie da sessão SuperAdmin e internal key. */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Sessão SuperAdmin não autorizada.");
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const platformCookieName = `${isProd ? "__Secure-" : ""}bipesend.platform.session-token`;
  const sessionToken = cookieStore.get(platformCookieName)?.value;
  const internalApiKey = process.env.INTERNAL_API_KEY || "";

  return {
    "Content-Type": "application/json",
    ...(internalApiKey ? { "x-internal-api-key": internalApiKey } : {}),
    ...(sessionToken ? { Cookie: `${platformCookieName}=${sessionToken}` } : {}),
  };
}

export type CredentialProvider = "evolution_api" | "meta" | "tiktok" | "cloudflare_r2";

export interface CredentialStatusResult {
  provider: string;
  status: "active" | "inactive" | "invalid" | "not_configured";
  lastValidatedAt: string | null;
}

/** Obtém o status de um provider (sem retornar secrets). */
export async function getCredentialStatusAction(
  provider: CredentialProvider,
): Promise<CredentialStatusResult> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/api/v1/admin/credentials/${provider}/status`,
      { headers, signal: AbortSignal.timeout(5000) },
    );

    if (res.ok) {
      return await res.json();
    }

    return { provider, status: "not_configured", lastValidatedAt: null };
  } catch {
    return { provider, status: "not_configured", lastValidatedAt: null };
  }
}

/** Obtém o status de TODOS os providers. */
export async function getAllCredentialStatusesAction(): Promise<
  CredentialStatusResult[]
> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/credentials`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return data.statuses ?? [];
    }

    return [];
  } catch {
    return [];
  }
}

/** Salva, cifra e valida credenciais de um provider. */
export async function saveCredentialAction(
  provider: CredentialProvider,
  credentials: Record<string, string>,
): Promise<{
  success: boolean;
  status: string;
  message: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        status: "invalid",
        message: "Sessão expirada. Faça login novamente.",
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/api/v1/admin/credentials/${provider}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ credentials }),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (res.ok) {
      return await res.json();
    }

    const error = await res.json().catch(() => ({}));
    return {
      success: false,
      status: "invalid",
      message: error.error || `Erro HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      status: "invalid",
      message: err instanceof Error ? err.message : "Erro de conexão com o servidor.",
    };
  }
}

/** Remove credenciais de um provider. */
export async function deleteCredentialAction(
  provider: CredentialProvider,
): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/api/v1/admin/credentials/${provider}`,
      { method: "DELETE", headers, signal: AbortSignal.timeout(5000) },
    );

    if (res.ok) {
      return await res.json();
    }

    return { success: false, message: `Erro HTTP ${res.status}` };
  } catch {
    return { success: false, message: "Erro de conexão." };
  }
}

/** Alterna o status de um provider entre 'active' e 'inactive'. */
export async function toggleCredentialStatusAction(
  provider: CredentialProvider,
  status: "active" | "inactive",
): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/api/v1/admin/credentials/${provider}/status`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (res.ok) {
      return await res.json();
    }

    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.error || `Erro HTTP ${res.status}` };
  } catch {
    return { success: false, message: "Erro de conexão com o servidor." };
  }
}

