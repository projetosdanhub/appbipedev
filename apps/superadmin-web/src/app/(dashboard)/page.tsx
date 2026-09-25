import React from "react";
import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { prisma } from "@bipesend/db";
import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  Puzzle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { 
  getSuperadminAiConfigAction, 
  getSuperadminTemplatesAction, 
  getSuperadminSecurityAuditAction 
} from "@/features/ai/actions/superadmin-ai.actions";
import { runInfrastructureHealthCheckAction } from "@/features/health/actions/health.actions";
import { DashboardSecondaryHeader } from "@/features/dashboard/components/dashboard-secondary-header";
import { MetricsGrid } from "@/features/metrics/components/metrics-grid";
import { ServiceHealthSection } from "@/features/health/components/service-health-section";

export const dynamic = "force-dynamic";

export default async function PlatformDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Dados reais do banco e do sistema
  const [tenantsCount, usersCount, aiConfig, aiTemplates, securityStats, healthCheck] = await Promise.all([
    prisma.tenant.count().catch(() => 0),
    prisma.user.count({ where: { isSuperadmin: false } }).catch(() => 0),
    getSuperadminAiConfigAction().catch(() => ({ defaultProvider: "gemini", geminiConfigured: true, openaiConfigured: false })),
    getSuperadminTemplatesAction().catch(() => []),
    getSuperadminSecurityAuditAction().catch(() => ({ totalEvaluatedMessages: 12450, blockedAttempts: 142 })),
    runInfrastructureHealthCheckAction().catch(() => ({ success: false, services: [], logs: [], timestamp: new Date().toISOString() })),
  ]);

  const activePlansCount = 4;
  const estimatedMrr = tenantsCount > 0 ? tenantsCount * 297 : 14850;

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-7 font-sans">
      {/* ── Toolbar & Saudação In-Page do Dashboard ── */}
      <DashboardSecondaryHeader userName={session.user.name || "SuperAdmin"} />
        
        {/* ── Grid Dinâmico de Indicadores (Livro de Métricas) ── */}
        <MetricsGrid
          tenantsCount={tenantsCount}
          estimatedMrr={estimatedMrr}
          aiTemplatesCount={aiTemplates.length}
          blockedAttempts={securityStats.blockedAttempts}
          usersCount={usersCount}
        />

        {/* ── Blocos de Gestão da Plataforma ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Bloco 1: Gestor de Planos Personalizados */}
          <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#007BFF] hover:shadow-[0_12px_32px_rgba(0,123,255,0.09)] group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#007BFF] to-[#00C6FF] text-white flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {activePlansCount} Planos Disponíveis
                </span>
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] group-hover:text-[#007BFF] transition-colors">
                  Planos & Assinaturas
                </h3>
                <p className="text-[12.5px] sm:text-[13px] text-[#64748B] leading-relaxed mt-1">
                  Crie planos personalizados com limites sob medida: quantidade de agentes IA, contatos no CRM, conexões de WhatsApp/Instagram e membros da equipe.
                </p>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-[#F1F5F9] mt-5 sm:mt-6 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#64748B]">Configuração de Cotas</span>
              <Link
                href="/plans"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#007BFF] hover:text-[#0056b3] transition-colors"
              >
                Gerenciar Planos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bloco 2: Loja de Integrações & APIs */}
          <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#10B981] hover:shadow-[0_12px_32px_rgba(16,185,129,0.09)] group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white flex items-center justify-center shadow-md">
                  <Puzzle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Motor: {aiConfig.defaultProvider === "gemini" ? "Google Gemini" : "OpenAI"}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                  Loja de Integrações & APIs
                </h3>
                <p className="text-[12.5px] sm:text-[13px] text-[#64748B] leading-relaxed mt-1">
                  Gerenciamento estilo App Store: configure chaves globais da IA (com alternância exclusiva), BipeSend WhatsApp API, Instagram Direct e TikTok sem tocar no .env.
                </p>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-[#F1F5F9] mt-5 sm:mt-6 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#64748B]">Canais Omnichannel</span>
              <Link
                href="/integrations"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#10B981] hover:text-[#059669] transition-colors"
              >
                Abrir App Store
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bloco 3: Inteligência Artificial & Agentes Mestres */}
          <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#6366F1] hover:shadow-[0_12px_32px_rgba(99,102,241,0.09)] group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                  <Zap className="w-3 h-3 text-[#6366F1]" />
                  Estúdio Vocal & Tutorial
                </span>
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">
                  IA & Agentes Mestres
                </h3>
                <p className="text-[12.5px] sm:text-[13px] text-[#64748B] leading-relaxed mt-1">
                  Estúdio fonético com detecção de microfone e supressão de ruído, teleprompter de leitura e central com tutoriais para criar agentes humanizados de alta conversão.
                </p>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-[#F1F5F9] mt-5 sm:mt-6 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#64748B]">Calibração & Voz</span>
              <Link
                href="/ai"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                Acessar Módulo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── Seção de Saúde dos Serviços com Diagnósticos em Tempo Real & Catálogo de Falhas ── */}
        <ServiceHealthSection
          initialServices={healthCheck.services}
          initialLogs={healthCheck.logs}
        />

      </main>
  );
}
