"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Users,
  Bot,
  Smartphone,
  MessageSquare,
  Sparkles,
  Zap,
  Layers,
  CreditCard,
} from "lucide-react";
import { BipeCheckBadge } from "./landing-page-view";
import type { LandingPlan, SiteContent } from "../types/site-content.types";

function InstagramIcon({ className = "w-3.5 h-3.5 text-pink-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-3.5 h-3.5 text-cyan-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

interface PricingSectionProps {
  plans: LandingPlan[];
  pricingContent: SiteContent["pricing"];
  registerUrl?: string;
}

export function PricingSection({
  plans,
  pricingContent,
  registerUrl = "https://app.bipesend.com.br/register",
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const visiblePlans = plans.filter((p) => p.isActive && p.showOnLandingPage);

  return (
    <section
      id="planos"
      className="py-16 sm:py-24 bg-[#0B1120] text-white border-b border-slate-800 relative overflow-hidden"
    >
      {/* Glow de Fundo Inspirado em Design Figma Moderno */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Cabeçalho da Seção de Preços */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold text-[#38BDF8] bg-blue-500/15 px-4 py-1.5 rounded-full uppercase tracking-wider border border-blue-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{pricingContent.badge || "Planos & Preços Transparentes"}</span>
          </span>
          
          <h2 className="text-[28px] sm:text-[38px] md:text-[46px] font-extrabold text-white font-inter tracking-tight leading-tight">
            {pricingContent.title}
          </h2>
          
          <p className="text-[14px] sm:text-[16px] text-slate-400 max-w-2xl mx-auto">
            {pricingContent.subtitle}
          </p>
        </div>

        {/* Toggle Mensal / Anual com Cálculo de 2 Meses Grátis */}
        <div className="flex flex-col items-center justify-center gap-3 mb-12 sm:mb-14">
          <div className="bg-[#131C31] p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-lg">
            
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#007BFF] text-white shadow-md shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Faturamento Mensal
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Faturamento Anual</span>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                Economia Anual
              </span>
            </button>

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {billingCycle === "yearly"
                ? "No plano anual você conta com desconto exclusivo e previsibilidade para sua operação."
                : "Sem taxa de adesão, sem multas contratuais e cancele quando quiser."}
            </span>
          </div>
        </div>

        {/* Lista de Planos Dinâmicos */}
        {visiblePlans.length === 0 ? (
          <div className="p-8 text-center bg-[#131C31] rounded-2xl border border-slate-800 max-w-md mx-auto">
            <p className="text-sm text-slate-400 font-medium">
              Nenhum plano configurado no momento.
            </p>
          </div>
        ) : (
          <div
            className={`grid items-stretch ${
              visiblePlans.length === 1
                ? "grid-cols-1 max-w-md mx-auto gap-6"
                : visiblePlans.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8"
                : visiblePlans.length === 3
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-6 sm:gap-8"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 max-w-[1440px] mx-auto gap-5 xl:gap-6"
            }`}
          >
            {visiblePlans.map((plan) => {
              const isFourPlans = visiblePlans.length >= 4;

              // Cores semânticas consistentes
              const colorThemeMap: Record<
                string,
                { bar: string; btn: string; badge: string; border: string }
              > = {
                blue: {
                  bar: "bg-[#007BFF]",
                  btn: "bg-[#007BFF] hover:bg-[#0069D9] text-white shadow-blue-500/20",
                  badge: "bg-blue-500/20 text-[#38BDF8] border-blue-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#007BFF]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                emerald: {
                  bar: "bg-[#10B981]",
                  btn: "bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/20",
                  badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#10B981]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                violet: {
                  bar: "bg-[#6366F1]",
                  btn: "bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-indigo-500/20",
                  badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#6366F1]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                amber: {
                  bar: "bg-[#F59E0B]",
                  btn: "bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-amber-500/20",
                  badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#F59E0B]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                rose: {
                  bar: "bg-[#F43F5E]",
                  btn: "bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-rose-500/20",
                  badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#F43F5E]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                cyan: {
                  bar: "bg-[#06B6D4]",
                  btn: "bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-cyan-500/20",
                  badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#06B6D4]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
                indigo: {
                  bar: "bg-[#4F46E5]",
                  btn: "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/20",
                  badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                  border: plan.isPopular
                    ? "border-2 border-[#4F46E5]"
                    : "border border-slate-700/80 hover:border-slate-500",
                },
              };

              const colorTheme = colorThemeMap[plan.colorScheme as string] || colorThemeMap.blue;

              // Preço mensal equivalente e economia anual
              const currentMonthlyEquivalent =
                billingCycle === "yearly" ? plan.priceYearly / 12 : plan.priceMonthly;

              const totalAnoCheio = plan.priceMonthly * 12;
              const economiaAnual = Math.max(0, totalAnoCheio - plan.priceYearly);

              const checkoutHref = `${registerUrl}?plan=${plan.id}&billing=${billingCycle}`;

              return (
                <div
                  key={plan.id}
                  className={`bg-[#131C31] rounded-[24px] overflow-hidden flex flex-col justify-between figma-hover-card shadow-[0_10px_35px_rgba(0,0,0,0.35)] relative ${colorTheme.border} ${
                    plan.isPopular ? "figma-popular-glow" : ""
                  }`}
                >
                  {/* Barra de destaque superior */}
                  <div className={`h-2.5 w-full ${colorTheme.bar}`} />

                  <div
                    className={`flex-1 flex flex-col justify-between ${
                      isFourPlans ? "p-5 sm:p-5 lg:p-6 space-y-5" : "p-6 sm:p-7 space-y-6"
                    }`}
                  >
                    
                    {/* Topo do Card com Altura Padronizada Compacta */}
                    <div className="min-h-[85px] flex flex-col justify-start text-left">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Plano Comercial
                        </span>
                        {plan.badge && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colorTheme.badge}`}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`${
                          isFourPlans ? "text-xl sm:text-2xl" : "text-2xl"
                        } font-extrabold text-white font-inter tracking-tight`}
                      >
                        {plan.name}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Bloco de Preço Padronizado */}
                    <div className="pt-4 border-t border-slate-700/60 min-h-[90px] flex flex-col justify-end text-left">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-400 shrink-0">
                          R$
                        </span>
                        <span
                          className={`${
                            isFourPlans ? "text-3xl sm:text-4xl" : "text-4xl"
                          } font-extrabold text-white font-inter tracking-tight`}
                        >
                          {Math.round(currentMonthlyEquivalent).toLocaleString("pt-BR")}
                        </span>
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                          /mês
                        </span>
                      </div>

                      {billingCycle === "yearly" ? (
                        <div className="space-y-0.5 mt-1">
                          <div className="text-[10.5px] sm:text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1">
                            <span>Faturado R$ {plan.priceYearly.toLocaleString("pt-BR")}/ano</span>
                          </div>
                          {economiaAnual > 0 && (
                            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80 inline-block">
                              Economize R$ {economiaAnual.toLocaleString("pt-BR")} no plano anual
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10.5px] sm:text-[11px] text-slate-400 mt-1">
                          Cobrança mensal recorrente sem fidelidade
                        </div>
                      )}
                    </div>

                    {/* Limites Oficiais com Divisórias Suaves e Elegantes */}
                    <div className="p-3.5 sm:p-4 bg-[#0B1120]/85 rounded-xl border border-slate-800/90 divide-y divide-slate-800/80 text-xs text-left">
                      {/* WhatsApp */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 pb-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">WhatsApp:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.whatsappConnections === -1 ? "Ilimitado" : `${plan.limits.whatsappConnections}x`}
                        </strong>
                      </div>

                      {/* Instagram */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span className="truncate">Instagram:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.instagramConnections === -1 ? "Ilimitado" : `${plan.limits.instagramConnections}x`}
                        </strong>
                      </div>

                      {/* TikTok */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <TikTokIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">TikTok:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {(plan.limits.tiktokConnections ?? 1) === -1 ? "Ilimitado" : `${plan.limits.tiktokConnections ?? 1}x`}
                        </strong>
                      </div>

                      {/* Funil CRM */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">Funil CRM:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {(plan.limits.crmPipelines ?? 1) === -1
                            ? "Ilimitados (+1 Principal)"
                            : `${plan.limits.crmPipelines ?? 1} ${(plan.limits.crmPipelines ?? 1) === 1 ? "adicional (+1 Principal)" : "adicionais (+1 Principal)"}`}
                        </strong>
                      </div>

                      {/* Contatos */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">Contatos:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.contacts === -1
                            ? "Ilimitados"
                            : plan.limits.contacts.toLocaleString("pt-BR")}
                        </strong>
                      </div>

                      {/* Automações */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">Automações:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {(plan.limits.automations ?? 5) === -1
                            ? "Ilimitadas"
                            : `${plan.limits.automations ?? 5} ativas`}
                        </strong>
                      </div>

                      {/* Checkout Transparente */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">Checkout Transparente:</span>
                        </span>
                        <strong className="text-emerald-400 shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.transparentCheckout !== false ? "Incluso" : "Opcional"}
                        </strong>
                      </div>

                      {/* Membros de Equipe */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Membros de Equipe:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.teamMembers === -1
                            ? "Ilimitados"
                            : `${plan.limits.teamMembers} ${plan.limits.teamMembers === 1 ? "membro" : "membros"}`}
                        </strong>
                      </div>

                      {/* Agentes de IA */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 py-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <Bot className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="truncate">Agentes de IA:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.aiAgents === -1
                            ? "Ilimitados"
                            : `${plan.limits.aiAgents} ${plan.limits.aiAgents === 1 ? "agente" : "agentes"}`}
                        </strong>
                      </div>

                      {/* Mensagens IA/mês */}
                      <div className="flex items-center justify-between text-slate-300 gap-2 min-w-0 pt-2">
                        <span className="flex items-center gap-1.5 truncate text-[11.5px] sm:text-xs min-w-0">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">Mensagens IA/mês:</span>
                        </span>
                        <strong className="text-white shrink-0 text-right text-[11.5px] sm:text-xs ml-1 font-bold">
                          {plan.limits.monthlyAiMessages === -1
                            ? "Ilimitadas"
                            : plan.limits.monthlyAiMessages.toLocaleString("pt-BR")}
                        </strong>
                      </div>
                    </div>

                    {/* Lista de Recursos Inclusos com BipeVerifiedBadge Azul BipeSend */}
                    <div className="pt-4 border-t border-slate-700/60 space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                          Recursos Inclusos:
                        </span>
                        <div className="flex-1 h-px bg-slate-700/60" />
                      </div>
                      <ul className="space-y-2.5 divide-y divide-slate-800/80 min-h-[190px] flex flex-col justify-start">
                        {plan.features.map((feat: string, idx: number) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2.5 text-xs text-slate-300 leading-snug ${
                              idx > 0 ? "pt-2.5" : ""
                            }`}
                          >
                            <BipeCheckBadge size={15} className="shrink-0 mt-0.5" />
                            <span className="break-words">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botão de Ação CTA com prefetch={false} para prevenir CORS */}
                    <div className="pt-4 mt-auto">
                      <a
                        href={checkoutHref}
                        className={`w-full py-3.5 px-3.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-center ${colorTheme.btn}`}
                      >
                        <span className="truncate">Começar com Plano {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Garantia Incondicional de 7 Dias */}
        <div className="mt-14 max-w-2xl mx-auto p-5 rounded-2xl bg-[#131C31]/90 border border-slate-800 flex items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-left text-xs">
            <strong className="text-white block font-inter text-sm">
              7 Dias de Garantia Incondicional
            </strong>
            <span className="text-slate-400">
              Teste todas as funcionalidades no seu negócio. Se não ficar 100% satisfeito, devolvemos seu dinheiro imediatamente.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
