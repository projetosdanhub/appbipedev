"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Filter,
  Bot,
  Sparkles,
  Mic,
  FileText,
  Kanban,
  Smartphone,
  ArrowRight,
  Clock,
  ShoppingBag,
  Users,
  CheckCheck,
  MessageCircle,
  Layers,
  Settings,
  DollarSign,
  Share2,
  Send,
  Volume2,
  Pause,
  Video,
  Music2,
  Smile,
  ShieldCheck,
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export type FlowTemplateId = "whatsapp_odonto" | "instagram_skincare" | "tiktok_smartwatch";

interface AutomationBuilderShowcaseProps {
  compact?: boolean;
}

export function AutomationBuilderShowcase({ compact = false }: AutomationBuilderShowcaseProps) {
  const [activeTemplate, setActiveTemplate] = useState<FlowTemplateId>("whatsapp_odonto");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Simulação sequencial passo a passo do fluxo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      if (simulationStep < 4) {
        timer = setTimeout(() => {
          setSimulationStep((prev) => prev + 1);
        }, 900);
      } else {
        timer = setTimeout(() => {
          setIsSimulating(false);
        }, 2200);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulating, simulationStep]);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(1);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setIsPlayingAudio(false);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Se não estiver em modo compacto, mostra cabeçalho da seção */}
      {!compact && (
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#007BFF] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MUITO ALÉM DE UM CHATBOT BÁSICO</span>
          </div>
          <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
            Construtor Visual de Automações em Tempo Real
          </h2>
          <p className="text-[14px] sm:text-[16px] text-slate-600 leading-relaxed">
            Esqueça robôs travados e fluxos engessados. Na BipeSend você cria pipelines visuais completas e intuitivas: conecte gatilhos de vendas, regras lógicas e integre <strong>Sua Própria Agente Personalizada</strong> com envio de áudios, voz real, arquivos e movimentação automática no <strong>CRM Bipe Plus</strong>.
          </p>
        </div>
      )}

      {/* ── SELETOR GEOMÉTRICO DE CANAIS & PIPELINES MULTICANAL ── */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card Canal 1: WhatsApp Oficial (Odontologia / Serviço Alto Padrão) */}
          <button
            type="button"
            onClick={() => {
              setActiveTemplate("whatsapp_odonto");
              handleResetSimulation();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
              activeTemplate === "whatsapp_odonto"
                ? "bg-white border-emerald-500 shadow-[0_8px_25px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20"
                : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <span className="text-[11px] font-extrabold font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  WhatsApp Oficial
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${activeTemplate === "whatsapp_odonto" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            </div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-inter">
              Odontologia: Lentes de Contato
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Qualificação em &lt; 2s com envio de áudio, fotos de antes/depois em PDF e agendamento.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SLA: Imediato</span>
              <span className="text-emerald-600 font-bold">Serviço Premium</span>
            </div>
          </button>

          {/* Card Canal 2: Instagram Direct (Skincare / Produto Físico) */}
          <button
            type="button"
            onClick={() => {
              setActiveTemplate("instagram_skincare");
              handleResetSimulation();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
              activeTemplate === "instagram_skincare"
                ? "bg-white border-pink-500 shadow-[0_8px_25px_rgba(236,72,153,0.15)] ring-2 ring-pink-500/20"
                : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] font-extrabold font-mono uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  Instagram Direct
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${activeTemplate === "instagram_skincare" ? "bg-pink-500 animate-pulse" : "bg-slate-300"}`} />
            </div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-pink-600 transition-colors font-inter">
              Skincare: Kit Glow Facial
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Resposta aos Stories com miniaturas, cupom VIP 10% e link Pix direto no chat.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SLA: &lt; 3 seg</span>
              <span className="text-pink-600 font-bold">Produto de Beleza</span>
            </div>
          </button>

          {/* Card Canal 3: TikTok Direct (Gadget / Smartwatch Viral) */}
          <button
            type="button"
            onClick={() => {
              setActiveTemplate("tiktok_smartwatch");
              handleResetSimulation();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden cursor-pointer group ${
              activeTemplate === "tiktok_smartwatch"
                ? "bg-white border-cyan-500 shadow-[0_8px_25px_rgba(6,182,212,0.15)] ring-2 ring-cyan-500/20"
                : "bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Music2 className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[11px] font-extrabold font-mono uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                  TikTok Direct / Ads
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${activeTemplate === "tiktok_smartwatch" ? "bg-cyan-500 animate-pulse" : "bg-slate-300"}`} />
            </div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-cyan-700 transition-colors font-inter">
              Smartwatch Ultra Titanium
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Captura imediata de Lead Ads, vídeo curto de unboxing e oferta relâmpago Pix.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SLA: Instantâneo</span>
              <span className="text-cyan-600 font-bold">Tech / E-commerce</span>
            </div>
          </button>

        </div>
      </div>

      {/* ── CANVAS DO CONSTRUTOR PROPRIETÁRIO BIPESEND ── */}
      <div className="relative bg-[#0F172A] rounded-[28px] border border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.25)] overflow-hidden">
        
        {/* Barra de Ferramentas Superior do Canvas */}
        <div className="h-14 bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-700/80 px-4 sm:px-6 flex items-center justify-between gap-3 z-20 relative">
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                {activeTemplate === "whatsapp_odonto" && "pipeline_odonto_lentes_whatsapp.flow"}
                {activeTemplate === "instagram_skincare" && "pipeline_skincare_glow_instagram.flow"}
                {activeTemplate === "tiktok_smartwatch" && "pipeline_smartwatch_tiktok_ads.flow"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ATIVO • 24H
              </span>
            </div>
          </div>

          {/* Botões de Ação do Canvas */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSimulating ? (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartSimulation}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Testar Pipeline</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-slate-700">
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 font-mono">Zoom: 100%</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 font-mono">BipeEngine v2.4</span>
            </div>
          </div>

        </div>

        {/* Área Principal de Trabalho (Grid com Dots BipeSend) */}
        <div className="relative p-6 sm:p-10 min-h-[580px] bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:22px_22px] overflow-x-auto flex flex-col items-center justify-center">

          {/* Banner de Feedback da Simulação */}
          {isSimulating && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-emerald-400/50 animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {simulationStep === 1 && "Passo 1: Gatilho disparado no canal oficial! Identificando lead..."}
                {simulationStep === 2 && "Passo 2: Condição lógica avaliada -> SIM (Qualificado)!"}
                {simulationStep === 3 && "Passo 3: Agente BipeSend gerando áudio humanizado e mídia..."}
                {simulationStep >= 4 && "Passo 4: Mídia enviada e oportunidade sincronizada no CRM Bipe Plus!"}
              </span>
            </div>
          )}

          {/* ESTRUTURA VISUAL DO FLUXO (PIPELINE) */}
          <div className="w-full max-w-[960px] mx-auto flex flex-col items-center space-y-6 relative py-4">

            {/* ── NÓ 1: GATILHO (TRIGGER NODE) ── */}
            <div className="flex flex-col items-center relative z-20">
              <div
                className={`w-[320px] sm:w-[380px] rounded-[22px] bg-[#1E293B]/95 backdrop-blur-xl border transition-all duration-300 p-4 sm:p-5 shadow-xl ${
                  simulationStep === 1
                    ? "border-emerald-400 ring-4 ring-emerald-500/25 -translate-y-1 shadow-emerald-500/20"
                    : "border-emerald-500/40 hover:border-emerald-500/70"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                      {activeTemplate === "whatsapp_odonto" && <MessageCircle className="w-5 h-5 text-emerald-400" />}
                      {activeTemplate === "instagram_skincare" && <InstagramIcon className="w-5 h-5 text-pink-400" />}
                      {activeTemplate === "tiktok_smartwatch" && <Music2 className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 block">
                        Gatilho do Canal Oficial
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {activeTemplate === "whatsapp_odonto" && "WhatsApp: 'Quero Lentes de Contato'"}
                        {activeTemplate === "instagram_skincare" && "Direct Instagram: Menção nos Stories"}
                        {activeTemplate === "tiktok_smartwatch" && "TikTok Lead Ads: Formulário Enviado"}
                      </h4>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {activeTemplate === "whatsapp_odonto" && "Dispara quando o paciente envia mensagem buscando valores ou horários para facetas e lentes nos dentes."}
                  {activeTemplate === "instagram_skincare" && "Dispara quando a seguidora marca o perfil nos Stories ou manda mensagem direta sobre o Kit Glow."}
                  {activeTemplate === "tiktok_smartwatch" && "Dispara no exato segundo em que o visitante envia seus dados no anúncio de Smartwatch no TikTok."}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Origem: BipeSend Omnichannel</span>
                  <span className="text-emerald-400 font-bold">Tempo Resposta &lt; 2s</span>
                </div>
              </div>

              {/* Handle inferior do Gatilho */}
              <div className="w-4 h-4 rounded-full bg-[#0F172A] border-2 border-emerald-400 flex items-center justify-center -mt-2 shadow-sm z-30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Linha de Conexão Vertical 1 */}
            <div className="h-10 w-0.5 bg-gradient-to-b from-emerald-400 to-slate-400 relative">
              {simulationStep >= 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              )}
            </div>

            {/* ── NÓ 2: CONDIÇÃO LÓGICA (CONDITION NODE) ── */}
            <div className="flex flex-col items-center relative z-20">
              <div className="w-4 h-4 rounded-full bg-[#0F172A] border-2 border-slate-400 flex items-center justify-center -mb-2 shadow-sm z-30">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>

              <div
                className={`w-[320px] sm:w-[380px] rounded-[22px] bg-[#1E293B]/95 backdrop-blur-xl border transition-all duration-300 p-4 sm:p-5 shadow-xl ${
                  simulationStep === 2
                    ? "border-amber-400 ring-4 ring-amber-500/25 -translate-y-1 shadow-amber-500/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
                      <Filter className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 block">
                        Qualificação Semântica com IA
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {activeTemplate === "whatsapp_odonto" && "Lead busca Lentes Dentais ou Harmonização?"}
                        {activeTemplate === "instagram_skincare" && "Interesse específico no Kit Skincare Floral?"}
                        {activeTemplate === "tiktok_smartwatch" && "Lead tem intenção de compra imediata?"}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300">
                  <span className="text-amber-400">SE</span> (
                  {activeTemplate === "whatsapp_odonto" && "procedimento in ['lentes', 'facetas', 'clareamento']"}
                  {activeTemplate === "instagram_skincare" && "intencao == 'Comprar' && produto == 'Kit_Duo_Floral'"}
                  {activeTemplate === "tiktok_smartwatch" && "lead.origem == 'TikTok_Ads' && lead.telefone != null"}
                  )
                </div>

                {/* Handles de Saída SIM e NÃO com Badges */}
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>SIM (Ativar Agente IA & Mídia)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>NÃO (Menu Automático)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RAMIFICAÇÃO DUPLA (BRANCHES SIM / NÃO) ── */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 relative">

              {/* RAMIFICAÇÃO 1 (SIM): INTEGRAÇÃO COM SUA PRÓPRIA AGENTE IA + VOZ */}
              <div className="flex flex-col items-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Branch SIM: Agente com Voz & Arquivos</span>
                </div>

                {/* Card da Agente Personalizada */}
                <div
                  className={`w-full rounded-[22px] bg-gradient-to-b from-[#1E293B] to-[#0F172A] border transition-all duration-300 p-5 shadow-xl relative overflow-hidden ${
                    simulationStep === 3
                      ? "border-violet-400 ring-4 ring-violet-500/30 -translate-y-1 shadow-violet-500/20"
                      : "border-violet-500/40 hover:border-violet-500/70"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-violet-500/30">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-violet-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          Sua Agente BipeSend
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          Voz Natural, Áudio & Catálogo
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Voz Humana
                    </span>
                  </div>

                  {/* Mensagem e Áudio da Agente */}
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                      {activeTemplate === "whatsapp_odonto" && (
                        <span>
                          &quot;Olá Carlos! Sou a Germani, assistente do Dr. Marcelo. Temos sim avaliação para lentes de contato dentais! Gravei este áudio de 18s explicando o escaneamento 3D:&quot;
                        </span>
                      )}
                      {activeTemplate === "instagram_skincare" && (
                        <span>
                          &quot;Oi Mariana! Que lindo você nos Stories! Temos o Kit Duo Floral a pronta entrega com frete grátis e cupom de 10% exclusivo para você hoje:&quot;
                        </span>
                      )}
                      {activeTemplate === "tiktok_smartwatch" && (
                        <span>
                          &quot;Fala Gabriel! Recebi seu contato no TikTok! O Ultra Titanium tem sensor de oxigênio, bateria para 5 dias e resistência 50m. Veja o vídeo rápido de demonstração:&quot;
                        </span>
                      )}
                    </div>

                    {/* Player de Áudio Simulado da Agente */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-500/30 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-8 h-8 rounded-full bg-white text-violet-700 flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 shadow-sm cursor-pointer"
                        title="Ouvir Áudio da Agente"
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-violet-700" />
                        ) : (
                          <Play className="w-4 h-4 fill-violet-700 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-1 h-5">
                        {[35, 70, 95, 60, 100, 50, 85, 40, 75, 90, 55, 80, 65, 45, 85, 60].map((h, idx) => (
                          <span
                            key={idx}
                            style={{ height: `${isPlayingAudio ? Math.max(25, (h + (idx % 4) * 15) % 100) : h}%` }}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              isPlayingAudio ? "bg-violet-400 animate-pulse" : "bg-violet-400/60"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono text-violet-300 font-semibold">0:18</span>
                    </div>

                    {/* Mídia Anexa: PDF de Odonto, Miniatura de Produto ou Vídeo */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2.5 text-xs text-slate-300">
                      {activeTemplate === "whatsapp_odonto" && <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      {activeTemplate === "instagram_skincare" && <ShoppingBag className="w-4 h-4 text-pink-400 flex-shrink-0" />}
                      {activeTemplate === "tiktok_smartwatch" && <Video className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      
                      <span className="truncate font-medium">
                        {activeTemplate === "whatsapp_odonto" && "Guia_Lentes_Sorriso_AntesDepois.pdf"}
                        {activeTemplate === "instagram_skincare" && "Fotos_Kit_Duo_Floral_Cupom10.jpg"}
                        {activeTemplate === "tiktok_smartwatch" && "Unboxing_UltraTitanium_15s.mp4"}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-auto flex-shrink-0">
                        {activeTemplate === "whatsapp_odonto" && "PDF • 3.2 MB"}
                        {activeTemplate === "instagram_skincare" && "2 Imagens • Pix 1-Click"}
                        {activeTemplate === "tiktok_smartwatch" && "Vídeo HD • Frete Grátis"}
                      </span>
                    </div>
                  </div>

                  {/* Próxima Ação: Mover para o CRM Bipe Plus */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Kanban className="w-3.5 h-3.5 text-[#007BFF]" />
                      Próxima Ação:
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {activeTemplate === "whatsapp_odonto" && "Mover para 'Avaliação Agendada'"}
                      {activeTemplate === "instagram_skincare" && "Mover para 'Carrinho Criado'"}
                      {activeTemplate === "tiktok_smartwatch" && "Mover para 'Proposta Enviada'"}
                    </span>
                  </div>
                </div>

                {/* Sub-Nó Conectado: CRM Bipe Plus */}
                <div
                  className={`w-full rounded-2xl bg-[#1E293B]/80 border p-3.5 flex items-center justify-between transition-all ${
                    simulationStep >= 4
                      ? "border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-950/20"
                      : "border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[#007BFF]">
                      <Kanban className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">CRM Bipe Plus Sincronizado</span>
                      <span className="text-[11px] text-slate-400">
                        {activeTemplate === "whatsapp_odonto" && "Oportunidade de R$ 14.800 salva no funil"}
                        {activeTemplate === "instagram_skincare" && "Oportunidade de R$ 189,90 com Pix ativo"}
                        {activeTemplate === "tiktok_smartwatch" && "Lead TikTok marcado como 'Quente'"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    Notificação Push Mobile
                  </span>
                </div>
              </div>

              {/* RAMIFICAÇÃO 2 (NÃO): CHATBOT PADRÃO COM RESPOSTA AUTOMÁTICA */}
              <div className="flex flex-col items-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                  <MessageCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Branch NÃO: Chat Automatizado Padrão</span>
                </div>

                <div className="w-full rounded-[22px] bg-[#1E293B]/90 border border-slate-700 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400 block">
                          Chatbot de Triagem
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          Menu de Opções Básico
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Sem Áudio
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeTemplate === "whatsapp_odonto" && "Envia opções para limpeza básica, restauração simples ou localização da clínica odontológica."}
                    {activeTemplate === "instagram_skincare" && "Apresenta catálogo genérico com todas as categorias da loja e política de troca."}
                    {activeTemplate === "tiktok_smartwatch" && "Envia link institucional da loja virtual para o visitante navegar no site sem atendimento personalizado."}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 italic">
                    &quot;Olá! Escolha 1 para Horários de Funcionamento, 2 para Localização ou 3 para Falar com Atendente.&quot;
                  </div>

                  <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Ação: Aguardar Seleção</span>
                    <span className="text-slate-500">Delay: Sem fila prioritária</span>
                  </div>
                </div>

                {/* Sub-Nó de Transbordo Humano */}
                <div className="w-full rounded-2xl bg-[#1E293B]/70 border border-slate-700 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Fila Geral de Espera</span>
                      <span className="text-[11px] text-slate-400">Transfere para atendente humano comercial</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Horário Comercial</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Rodapé do Construtor */}
        <div className="bg-[#1E293B] border-t border-slate-700/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Construtor visual 100% no-code com integração nativa: <strong>Sua Própria Agente + WhatsApp + Instagram + TikTok + CRM Bipe Plus</strong>.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#planos"
              className="figma-shimmer-btn inline-flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-105"
            >
              <span>Criar Automações Gratuitamente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      {/* ── 4 CARDS DE DESTAQUE TÉCNICO COM ANIMAÇÕES SUAVES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        
        {/* Card 1 */}
        <div className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(0,123,255,0.12)] hover:border-blue-400/80 hover:-translate-y-2 transition-all duration-300 ease-out space-y-2.5 relative overflow-hidden cursor-default">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007BFF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007BFF] flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-[#007BFF] group-hover:text-white transition-all duration-300 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#007BFF] transition-colors font-inter">
            100% No-Code Proprietário BipeSend
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Arraste e solte blocos de gatilhos, condições lógicas e ações. Qualquer pessoa da sua equipe cria fluxos avançados em minutos.
          </p>
        </div>

        {/* Card 2 */}
        <div className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(99,102,241,0.12)] hover:border-indigo-400/80 hover:-translate-y-2 transition-all duration-300 ease-out space-y-2.5 relative overflow-hidden cursor-default">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors font-inter">
            Agente Integrada ao Fluxo
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A IA não fica isolada. Ela é acionada dentro da pipeline exatamente no momento certo para responder com o contexto exato do cliente.
          </p>
        </div>

        {/* Card 3 */}
        <div className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.12)] hover:border-emerald-400/80 hover:-translate-y-2 transition-all duration-300 ease-out space-y-2.5 relative overflow-hidden cursor-default">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
            <Mic className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-inter">
            Envio de Áudio & Arquivos
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A sua automação envia áudios reais com voz natural, contratos em PDF, tabelas e catálogos diretamente no WhatsApp e Direct.
          </p>
        </div>

        {/* Card 4 */}
        <div className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)] hover:border-amber-400/80 hover:-translate-y-2 transition-all duration-300 ease-out space-y-2.5 relative overflow-hidden cursor-default">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-2xs">
            <Kanban className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors font-inter">
            Sincronia com CRM & Mobile
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cada decisão da automação atualiza etapas no CRM Bipe Plus e envia notificações push imediatas para o aplicativo mobile da sua equipe.
          </p>
        </div>

      </div>

    </div>
  );
}
