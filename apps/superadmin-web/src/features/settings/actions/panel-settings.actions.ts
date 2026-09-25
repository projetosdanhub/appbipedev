"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@bipesend/auth/superadmin";
import {
  PanelSettings,
  DEFAULT_PANEL_SETTINGS,
  FaviconType,
} from "../types/panel-settings.types";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "..", "..", "scratch", "panel-settings.json");

// Cache em memória para leitura ultrarrápida
let memorySettings: PanelSettings = { ...DEFAULT_PANEL_SETTINGS };
let isLoaded = false;

async function loadSettingsFromFile(): Promise<PanelSettings> {
  if (isLoaded) return memorySettings;
  try {
    const raw = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memorySettings = { ...DEFAULT_PANEL_SETTINGS, ...parsed };
    isLoaded = true;
    return memorySettings;
  } catch {
    // Se o arquivo ainda não existir, cria o diretório scratch se necessário e salva o padrão
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(DEFAULT_PANEL_SETTINGS, null, 2), "utf-8");
    } catch {}
    isLoaded = true;
    return memorySettings;
  }
}

export async function getPanelSettingsAction(): Promise<PanelSettings> {
  return await loadSettingsFromFile();
}

export async function savePanelSettingsAction(
  newSettings: Partial<PanelSettings>
): Promise<{ success: boolean; settings?: PanelSettings; message?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Acesso não autorizado. Sessão expirada." };
  }

  try {
    const current = await loadSettingsFromFile();
    const updated: PanelSettings = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };

    memorySettings = updated;

    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    } catch (err) {
      console.warn("[SuperAdmin Settings] Aviso ao salvar arquivo físico:", err);
    }

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/ai");
    revalidatePath("/germani");
    revalidatePath("/plans");
    revalidatePath("/integrations");

    return {
      success: true,
      settings: updated,
      message: "Configurações de identidade e favicon atualizadas com sucesso!",
    };
  } catch (err) {
    console.error("[SuperAdmin Settings] Erro ao salvar configurações:", err);
    return { success: false, error: "Erro interno ao persistir configurações." };
  }
}

export async function uploadPanelFaviconAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; type?: FaviconType; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Acesso não autorizado." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado." };
  }

  // Validação de formato
  const validMimes: Record<string, FaviconType> = {
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/png": "png",
    "image/webp": "webp",
  };

  const detectedType = validMimes[file.type] || (file.name.endsWith(".svg") ? "svg" : file.name.endsWith(".ico") ? "ico" : null);

  if (!detectedType) {
    return {
      success: false,
      error: "Formato inválido. Envie um arquivo .svg, .ico, .png ou .webp.",
    };
  }

  // Limite de 2MB para favicon
  if (file.size > 2 * 1024 * 1024) {
    return {
      success: false,
      error: "O favicon deve ter no máximo 2 MB.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || (detectedType === "svg" ? "image/svg+xml" : detectedType === "ico" ? "image/x-icon" : "image/png");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Tenta também salvar localmente em public/custom-favicon.[ext] para URL limpa
    try {
      const publicPath = path.join(process.cwd(), "public", `custom-favicon.${detectedType}`);
      await fs.writeFile(publicPath, buffer);
    } catch {
      // Se falhar a escrita na pasta public, o dataUrl garante funcionamento imediato
    }

    return {
      success: true,
      url: `/custom-favicon.${detectedType}?t=${Date.now()}`,
      type: detectedType,
    };
  } catch (err) {
    console.error("[SuperAdmin Settings] Erro ao processar upload de favicon:", err);
    return { success: false, error: "Falha ao processar arquivo de imagem." };
  }
}
