export type FaviconType = "svg" | "ico" | "png" | "webp";

export interface FaviconPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  type: FaviconType;
  badge: string;
  previewBg: string;
}

export interface PanelSettings {
  panelTitle: string;
  tabTitleFormat: string;
  faviconUrl: string;
  faviconType: FaviconType;
  panelLogoUrl: string;
  allowSearchEngineIndexing: boolean; // Sempre false por padrão para painel administrativo
  securityHeadersEnabled: boolean;
  highContrastMode: boolean;
  updatedAt?: string;
}

export const OFFICIAL_FAVICON_PRESETS: FaviconPreset[] = [
  {
    id: "degrade-oficial",
    name: "BipeSend Degradê Oficial",
    description: "Identidade padrão com o gradiente #007BFF (Azul) para #6366F1 (Violeta).",
    url: "/favicon.svg",
    type: "svg",
    badge: "Oficial Padrão",
    previewBg: "bg-slate-100",
  },
  {
    id: "azul-soberano",
    name: "Azul Soberano Bipe (#007BFF)",
    description: "Cor primária da marca com alto contraste e clareza em abas escuras e claras.",
    url: "/logos/favicon-blue.svg",
    type: "svg",
    badge: "Alto Contraste",
    previewBg: "bg-slate-900",
  },
  {
    id: "violeta-neon",
    name: "Violeta Tech (#6366F1)",
    description: "Tonalidade violeta moderna para destacar o painel administrativo entre várias abas.",
    url: "/logos/favicon-violet.svg",
    type: "svg",
    badge: "Destaque Visual",
    previewBg: "bg-slate-800",
  },
  {
    id: "dark-carbon",
    name: "Dark Carbon Escuro",
    description: "Ícone monocromático com fundo chumbo profundo #0F172A para discrição.",
    url: "/logos/favicon-dark.svg",
    type: "svg",
    badge: "Minimalista",
    previewBg: "bg-slate-200",
  },
  {
    id: "ico-classico",
    name: "Favicon ICO Clássico",
    description: "Formato ICO tradicional de 32x32px para compatibilidade universal com navegadores legados.",
    url: "/favicon.ico",
    type: "ico",
    badge: "Universal",
    previewBg: "bg-white",
  },
];

export const DEFAULT_PANEL_SETTINGS: PanelSettings = {
  panelTitle: "BipeSend SuperAdmin | Painel Master & Gestão da Plataforma",
  tabTitleFormat: "%s | SuperAdmin BipeSend",
  faviconUrl: "/favicon.svg",
  faviconType: "svg",
  panelLogoUrl: "/assets/brand/icon-logomarca-degradê-webp.webp",
  allowSearchEngineIndexing: false,
  securityHeadersEnabled: true,
  highContrastMode: false,
  updatedAt: new Date().toISOString(),
};
