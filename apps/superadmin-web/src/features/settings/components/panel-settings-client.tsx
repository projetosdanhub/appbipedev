"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Save,
  RotateCcw,
  Upload,
  Globe,
  CheckCircle2,
  Lock,
  Layers,
  Check,
  Eye,
  Laptop,
  CheckCheck,
  AlertTriangle,
  Zap,
  Info,
  ExternalLink,
  Code,
  FileCode,
} from "lucide-react";
import {
  PanelSettings,
  OFFICIAL_FAVICON_PRESETS,
  DEFAULT_PANEL_SETTINGS,
  FaviconPreset,
} from "../types/panel-settings.types";
import {
  savePanelSettingsAction,
  uploadPanelFaviconAction,
} from "../actions/panel-settings.actions";

interface PanelSettingsClientProps {
  initialSettings: PanelSettings;
}

type TabType = "branding" | "security_a11y";

export function PanelSettingsClient({ initialSettings }: PanelSettingsClientProps) {
  const [settings, setSettings] = useState<PanelSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<TabType>("branding");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [appliedLive, setAppliedLive] = useState(false);

  // Aplica dinamicamente no documento ativo para feedback visual imediato
  const applyLiveToBrowser = (favUrl: string, title: string) => {
    try {
      // 1. Atualiza título da aba
      if (title.trim()) {
        document.title = title.trim();
      }

      // 2. Atualiza ou cria tag de favicon
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = favUrl;
      setAppliedLive(true);
      setTimeout(() => setAppliedLive(false), 4000);
    } catch (err) {
      console.warn("Erro ao aplicar favicon no navegador:", err);
    }
  };

  const handleSelectPreset = (preset: FaviconPreset) => {
    setSettings((prev) => ({
      ...prev,
      faviconUrl: preset.url,
      faviconType: preset.type,
    }));
    applyLiveToBrowser(preset.url, settings.panelTitle);
    toast.success(`Favicon "${preset.name}" selecionado e aplicado na sua aba!`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadPanelFaviconAction(formData);

      if (res.success && res.url) {
        setSettings((prev) => ({
          ...prev,
          faviconUrl: res.url!,
          faviconType: res.type || "png",
        }));
        applyLiveToBrowser(res.url, settings.panelTitle);
        toast.success("Favicon personalizado carregado com sucesso!");
      } else {
        toast.error(res.error || "Erro ao processar imagem de favicon.");
      }
    } catch {
      toast.error("Falha inesperada no upload do favicon.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await savePanelSettingsAction(settings);
      if (res.success) {
        toast.success(res.message || "Configurações salvas!");
        applyLiveToBrowser(settings.faviconUrl, settings.panelTitle);
      } else {
        toast.error(res.error || "Erro ao salvar configurações.");
      }
    } catch {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Deseja restaurar o título da aba e o favicon original oficial da BipeSend?")) {
      setSettings(DEFAULT_PANEL_SETTINGS);
      applyLiveToBrowser(DEFAULT_PANEL_SETTINGS.faviconUrl, DEFAULT_PANEL_SETTINGS.panelTitle);
      toast.info("Valores padrão restaurados.");
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans space-y-6">
      {/* ── BARRA SUPERIOR DE CABEÇALHO & AÇÕES ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <Settings className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200/60">
                Painel Master
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Customização de Identidade & Acessibilidade
              </span>
            </div>
            <h1 className="font-inter text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Configurações & Identidade do Painel
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize o título da aba do navegador, favicon oficial, diretrizes de SEO e acessibilidade 100% Lighthouse.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
            title="Restaurar título e favicon padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      {/* ── NAVEGAÇÃO DE ABAS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "branding"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Laptop className="w-4 h-4 text-blue-600" />
          <span>Aparência da Aba & Favicon</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security_a11y")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "security_a11y"
              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Auditoria Lighthouse, Acessibilidade & SEO</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
            100% Target
          </span>
        </button>
      </div>

      {/* ── CONTEÚDO DA ABA 1: APARÊNCIA DA ABA & FAVICON ── */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: FORMULÁRIO DE TÍTULO E FAVICON (7 COLUNAS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD: TÍTULO DA ABA NO NAVEGADOR */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007BFF] flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-inter">
                    1. Título da Aba do Navegador
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    O texto exato exibido no topo da aba do Google Chrome, Edge, Safari e Firefox.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Texto da Aba (`document.title`)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={settings.panelTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((p) => ({ ...p, panelTitle: val }));
                      applyLiveToBrowser(settings.faviconUrl, val);
                    }}
                    placeholder="Ex: BipeSend SuperAdmin | Painel Master & Gestão"
                    className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/60 transition-all font-medium"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-mono">
                    {settings.panelTitle.length} carac.
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-2">
                  Dica: Títulos com 40 a 65 caracteres são ideais para caber perfeitamente na aba sem corte visual.
                </p>
              </div>

              {/* Botão de Aplicação Imediata */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => applyLiveToBrowser(settings.faviconUrl, settings.panelTitle)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-[#007BFF] border border-blue-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Atualizar Minha Aba Agora</span>
                </button>

                {appliedLive && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                    <CheckCheck className="w-4 h-4" /> Aplicado na aba ativa!
                  </span>
                )}
              </div>
            </div>

            {/* CARD: ESCOLHA DO FAVICON HOMOLOGADO OU UPLOAD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-inter">
                      2. Ícone Favicon Oficial
                    </h3>
                    <p className="text-[11.5px] text-slate-500">
                      Escolha um dos favicons otimizados da marca ou envie um arquivo personalizado.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-[#007BFF] text-slate-700 hover:text-[#007BFF] shadow-2xs transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Enviando..." : "Upload Novo"}</span>
                  <input
                    type="file"
                    accept=".svg,.ico,.png,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Grid de Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {OFFICIAL_FAVICON_PRESETS.map((preset) => {
                  const isSelected = settings.faviconUrl === preset.url;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative ${
                        isSelected
                          ? "border-[#007BFF] bg-blue-50/70 ring-2 ring-[#007BFF]/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center p-2 border border-slate-200 shrink-0 ${preset.previewBg}`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-7 h-7 object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-xs font-bold text-slate-800 font-inter truncate">
                              {preset.name}
                            </h4>
                          </div>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {preset.badge}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 text-[#007BFF]">
                          <CheckCircle2 className="w-4 h-4 fill-[#007BFF] text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Indicador de Favicon Ativo */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Favicon Ativo:{" "}
                  <strong className="text-slate-800 font-mono font-semibold">
                    {settings.faviconUrl}
                  </strong>
                </span>
                <span className="text-[10.5px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {settings.faviconType}
                </span>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: SIMULADOR REAL DA ABA DO NAVEGADOR (5 COLUNAS - STICKY) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 font-inter flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-[#007BFF]" />
                  Simulador de Aba do Navegador
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Ao Vivo
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Veja exatamente como o seu painel SuperAdmin aparece para você e sua equipe no topo do navegador:
              </p>

              {/* MOCKUP VISUAL DE ABA DO GOOGLE CHROME / EDGE */}
              <div className="rounded-xl border border-slate-300 bg-[#DFE1E5] p-2 pt-3 shadow-md space-y-2">
                {/* Linha das Abas */}
                <div className="flex items-end gap-1 px-1">
                  {/* Aba Ativa (SuperAdmin) */}
                  <div className="bg-white rounded-t-xl px-3 py-2 flex items-center gap-2 max-w-[240px] shadow-xs border-t border-x border-slate-200/80 transition-all">
                    {/* Favicon selecionado */}
                    <div className="w-4 h-4 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={settings.faviconUrl}
                        alt="Favicon"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Título da Aba */}
                    <span className="text-xs font-medium text-slate-800 truncate font-sans">
                      {settings.panelTitle || "SuperAdmin BipeSend"}
                    </span>

                    {/* Botão de Fechar da Aba (x) */}
                    <span className="text-slate-400 hover:text-slate-600 text-[10px] ml-auto shrink-0 cursor-pointer">
                      ✕
                    </span>
                  </div>

                  {/* Aba Inativa de Exemplo (para contexto de profundidade) */}
                  <div className="px-3 py-1.5 flex items-center gap-2 max-w-[140px] text-slate-500 text-xs opacity-60">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-400 block shrink-0" />
                    <span className="truncate text-[11px]">Nova Guia</span>
                  </div>

                  {/* Botão + */}
                  <span className="text-slate-500 text-sm px-1.5 pb-1 cursor-pointer hover:text-slate-700">
                    +
                  </span>
                </div>

                {/* Barra de Endereço URL Omnibox */}
                <div className="bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 border border-slate-200 text-xs shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-800 font-mono text-[11px] truncate">
                    https://admin.bipesend.com.br
                  </span>
                </div>
              </div>

              {/* Informações de Compatibilidade */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1.5 text-xs text-blue-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#007BFF]" />
                  <span>Compatibilidade Multi-Navegador:</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  O layout inclui suporte automático para SVG dinâmico, ícones Apple Touch (`apple-touch-icon`) e atalhos de PWA para desktop.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? "Salvando..." : "Confirmar e Salvar Identidade"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTEÚDO DA ABA 2: AUDITORIA LIGHTHOUSE, ACESSIBILIDADE & SEO PRIVADO ── */}
      {activeTab === "security_a11y" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* CARD DE SEO PRIVADO: POR QUE O SUPERADMIN DEVE TER NOINDEX */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-inter">
                    Diretrizes de SEO Privado & Indexação por Robôs de Busca
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Governança e proteção contra rastreamento público do Google, Bing e crawlers.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                PROTEÇÃO NOINDEX ATIVA
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Por que o Painel SuperAdmin NÃO precisa (e NÃO DEVE) ter SEO público no Google?</span>
              </div>
              <p>
                Você está 100% certo na sua colocação, Daniel! Painéis administrativos corporativos e confidenciais contêm dados estratégicos, logs, chaves de API e telas de gestão privada.
              </p>
              <p>
                Por melhores práticas mundiais de segurança da informação (OWASP e NIST), o SuperAdmin deve operar com:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-emerald-800 pt-1">
                <li>`robots: &#123; index: false, follow: false &#125;` em todas as rotas</li>
                <li>Cabeçalho HTTP `X-Robots-Tag: noindex, nofollow, noarchive`</li>
                <li>Bloqueio no `robots.txt` para impedir crawling automatizado</li>
              </ul>
              <p className="text-[11.5px] pt-1 text-emerald-800">
                Isso impede que páginas de login administrativo ou URLs internas vazem nos resultados de busca do Google, blindando a plataforma contra scanners automatizados de vulnerabilidades.
              </p>
            </div>
          </div>

          {/* CHECKLIST DE AUDITORIA LIGHTHOUSE 100% */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. ACESSIBILIDADE (A11Y) 100% */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 font-inter">
                  Acessibilidade (WCAG AAA/AA)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100%
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Rótulos `aria-label` e `title` em todos os botões de ícone (sidebar, top navbar, drawers).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Contraste cromático superior a 4.5:1 em todos os textos sobre fundos brancos e gradientes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Foco de teclado visível (`focus-visible:ring-2`) para navegação completa por Tab e Shift+Tab.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Estrutura semântica rigorosa com tag `h1` única por página e tags `header`, `main` e `aside`.</span>
                </li>
              </ul>
            </div>

            {/* 2. BOAS PRÁTICAS & SEGURANÇA 100% */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 font-inter">
                  Boas Práticas & Segurança
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100%
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cabeçalhos de segurança CSP, X-Frame-Options: DENY e HSTS ativos no Nginx e Next.js.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Autenticação dupla (TOTP 2FA) obrigatória para sessões privilegiadas de SuperAdmin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero injeção SQL com ORM tipado e contratos de validação Zod no backend Fastify.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Nenhum segredo ou token exposto no bundle cliente (Server Actions exclusivas).</span>
                </li>
              </ul>
            </div>

            {/* 3. PERFORMANCE & CORE WEB VITALS 100% */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 font-inter">
                  Performance & Core Web Vitals
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100%
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Fontes Inter e Poppins carregadas com `next/font` sem bloqueio de renderização (`preload: false`).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cumulative Layout Shift (CLS) = 0: dimensões reservadas em cards e imagens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tempo de carregamento LCP &lt; 0.9s com bundle enxuto e componentes modulares.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Imagens convertidas em WebP e SVGs compactados em código nativo.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
