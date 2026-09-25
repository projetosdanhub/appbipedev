"use client";

import React, { useState, useId, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Zap,
} from "lucide-react";
import { LandingPlan } from "../types/site-content.types";

interface CltRoiCalculatorProps {
  initialNumAgents?: number;
  initialMonthlyLeads?: number;
  initialTicketMedio?: number;
  registerUrl?: string;
  plans?: LandingPlan[];
}

export function CltRoiCalculator({
  initialNumAgents = 3,
  initialMonthlyLeads = 3500,
  initialTicketMedio = 220,
  registerUrl = "https://app.bipesend.com.br/register",
  plans = [],
}: CltRoiCalculatorProps) {
  const [numAgents, setNumAgents] = useState(initialNumAgents);
  const [baseSalary, setBaseSalary] = useState(2100);
  const [monthlyLeads, setMonthlyLeads] = useState(initialMonthlyLeads);
  const [ticketMedio, setTicketMedio] = useState(initialTicketMedio);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Accessible unique IDs for form controls
  const agentsInputId = useId();
  const salaryInputId = useId();
  const leadsInputId = useId();
  const ticketInputId = useId();

  // Encargos CLT Reais no Brasil (Consolidação Mercado Médio)
  const fgts = baseSalary * 0.08;
  const decimoTerceiro = baseSalary * 0.0833;
  const feriasTerco = baseSalary * 0.1111;
  const multaRescisoria = baseSalary * 0.04;
  const beneficios = 740; // Vale Refeição (R$ 25/dia) + Vale Transporte médio
  const encargosPatronais = baseSalary * 0.20; // INSS Patronal + RAT / Sistema S consolidado

  const custoTotalPorAtendente =
    baseSalary +
    fgts +
    decimoTerceiro +
    feriasTerco +
    multaRescisoria +
    beneficios +
    encargosPatronais;

  const custoEquipeHumanaMensal = Math.round(numAgents * custoTotalPorAtendente);

  // Lista de planos disponíveis: utiliza os planos reais passados por prop ou os planos oficiais de fallback
  const availablePlans = useMemo(() => {
    if (plans && plans.length > 0) {
      return [...plans]
        .filter((p) => p.isActive)
        .sort((a, b) => a.priceMonthly - b.priceMonthly);
    }
    return [
      {
        id: "plan-starter",
        name: "Bipe Starter",
        priceMonthly: 147,
        limits: { monthlyAiMessages: 1500, teamMembers: 2 },
      },
      {
        id: "plan-growth",
        name: "Bipe Pro Growth",
        priceMonthly: 297,
        limits: { monthlyAiMessages: 8000, teamMembers: 6 },
      },
      {
        id: "plan-scale",
        name: "Bipe Enterprise Scale",
        priceMonthly: 597,
        limits: { monthlyAiMessages: 35000, teamMembers: 20 },
      },
      {
        id: "plan-vip-custom",
        name: "Bipe Custom VIP",
        priceMonthly: 1290,
        limits: { monthlyAiMessages: 999999, teamMembers: 999 },
      },
    ];
  }, [plans]);

  // Regra Oficial de Recomendação em Tempo Real:
  // Volume de conversas ou leads recebidos por mês:
  // Recomenda o plano com limite de mensagens próximo ao declarado (com margem de tolerância de até 200 mensagens a menos)
  // ou com mensagens igual ou superior ao declarado, além de comportar os atendentes da equipe.
  const recommendedPlan = useMemo(() => {
    const matched = availablePlans.find((plan) => {
      const planMsgs = plan.limits?.monthlyAiMessages ?? 0;
      const planTeam = plan.limits?.teamMembers ?? 1;

      // Margem de até 200 mensagens a menos:
      // Ex: se o usuário declarou 1.650 msgs, o plano de 1.500 msgs atende pois 1.500 >= 1.650 - 200 (= 1.450).
      // Se declarou 1.750, 1.500 < 1.750 - 200 (= 1.550), logo salta para o próximo plano (Bipe Pro Growth, 8.000 msgs).
      const satisfiesMessages = planMsgs >= (monthlyLeads - 200);
      const satisfiesTeam = planTeam >= numAgents;

      return satisfiesMessages && satisfiesTeam;
    });

    // Se nenhum plano intermediário suprir (ex: > 35.200 leads ou > 20 atendentes), seleciona o maior plano
    return matched || availablePlans[availablePlans.length - 1];
  }, [availablePlans, monthlyLeads, numAgents]);

  const bipePlanName = recommendedPlan.name;
  const bipePlanId = recommendedPlan.id;
  const bipePlanCost = recommendedPlan.priceMonthly;
  const maxMessagesInPlan = recommendedPlan.limits?.monthlyAiMessages ?? 8000;

  const economiaMensal = Math.max(0, custoEquipeHumanaMensal - bipePlanCost);
  const economiaAnual = economiaMensal * 12;
  const economiaPercentual = Math.round((economiaMensal / custoEquipeHumanaMensal) * 100);
  const roiMultiplier = Math.round(economiaMensal / bipePlanCost);

  // Recuperação de receita: 18% dos leads que chegam fora do horário comercial (noites e finais de semana)
  // que o atendente CLT perde por estar dormindo ou em folga, a IA converte instantaneamente em < 5 segundos.
  const conversaoRecuperadaMensal = Math.round(monthlyLeads * 0.06); // 6% a mais de conversão total sobre toda a base
  const faturamentoExtraEstimado = Math.round(conversaoRecuperadaMensal * ticketMedio);

  return (
    <div className="w-full">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-[0_12px_45px_rgba(15,23,42,0.06)] overflow-hidden">
        
        {/* Topo Informativo com Badge de Transparência CLT */}
        <div className="bg-[#0F172A] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-inter text-slate-200">
              Metodologia de Custos CLT Brasil (Legislação Trabalhista Oficial)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs font-semibold text-[#38BDF8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
            aria-expanded={showBreakdown}
            aria-label={showBreakdown ? "Ocultar Encargos CLT" : "Ver Detalhamento dos Encargos"}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showBreakdown ? "Ocultar Encargos CLT" : "Ver Detalhamento dos Encargos"}</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Detalhamento Expansível dos Custos CLT Reais */}
        {showBreakdown && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 text-xs text-slate-700 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Composição Real do Custo de 1 Atendente CLT (por mês):</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Manter um colaborador registrado no Brasil custa em média de 1,7x a 1,9x o salário base devido às provisões legais e benefícios obrigatórios de convenção:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Salário Base:</span>
                  <strong className="text-slate-800 text-xs font-mono">R$ {baseSalary.toLocaleString("pt-BR")}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">FGTS Mensal (8%):</span>
                  <strong className="text-slate-800 text-xs font-mono">R$ {Math.round(fgts).toLocaleString("pt-BR")}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">13º Proporcional:</span>
                  <strong className="text-slate-800 text-xs font-mono">R$ {Math.round(decimoTerceiro).toLocaleString("pt-BR")}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Férias + 1/3:</span>
                  <strong className="text-slate-800 text-xs font-mono">R$ {Math.round(feriasTerco).toLocaleString("pt-BR")}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">VR/VT Médio:</span>
                  <strong className="text-slate-800 text-xs font-mono">R$ {beneficios.toLocaleString("pt-BR")}</strong>
                </div>
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                  <span className="text-[11px] text-blue-700 block font-semibold">Custo Real Total:</span>
                  <strong className="text-[#007BFF] text-xs font-mono font-bold">R$ {Math.round(custoTotalPorAtendente).toLocaleString("pt-BR")}/mês</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corpo Principal: Controles Interativos + Painel de ROI */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* COLUNA ESQUERDA: Variáveis da Empresa */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              
              {/* Slider 1: Número de Atendentes */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={agentsInputId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#007BFF]" />
                    <span>Quantos atendentes ou operadores de vendas você tem hoje?</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumAgents(Math.max(1, numAgents - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Diminuir atendentes"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-[#007BFF] bg-white px-3 py-0.5 rounded-lg border border-blue-200 min-w-[75px] text-center font-mono">
                      {numAgents} {numAgents === 1 ? "pessoa" : "pessoas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumAgents(Math.min(25, numAgents + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Aumentar atendentes"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  id={agentsInputId}
                  type="range"
                  role="slider"
                  aria-label="Número de atendentes CLT atuais"
                  aria-valuemin={1}
                  aria-valuemax={25}
                  aria-valuenow={numAgents}
                  min={1}
                  max={25}
                  value={numAgents}
                  onChange={(e) => setNumAgents(Number(e.target.value))}
                  className="w-full accent-[#007BFF] cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 atendente</span>
                  <span className="font-semibold text-slate-600">
                    Custo total CLT: R$ {custoEquipeHumanaMensal.toLocaleString("pt-BR")}/mês
                  </span>
                  <span>25 atendentes</span>
                </div>
              </div>

              {/* Slider 2: Salário Base CLT */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={salaryInputId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Salário base registrado na carteira (R$):</span>
                  </label>
                  <span className="text-sm font-extrabold text-emerald-700 bg-white px-3 py-0.5 rounded-lg border border-emerald-200 font-mono">
                    R$ {baseSalary.toLocaleString("pt-BR")}
                  </span>
                </div>

                <input
                  id={salaryInputId}
                  type="range"
                  role="slider"
                  aria-label="Salário base CLT do atendente"
                  aria-valuemin={1518}
                  aria-valuemax={5000}
                  aria-valuenow={baseSalary}
                  min={1518}
                  max={5000}
                  step={10}
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Mínimo (R$ 1.518)</span>
                  <span>Média Nacional (R$ 2.100)</span>
                  <span>R$ 5.000</span>
                </div>
              </div>

              {/* Slider 3: Volume de Mensagens/Leads Mensais */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={leadsInputId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-violet-600" />
                    <span>Volume de conversas ou leads recebidos por mês:</span>
                  </label>
                  <span className="text-sm font-extrabold text-violet-700 bg-white px-3 py-0.5 rounded-lg border border-violet-200 font-mono">
                    {monthlyLeads.toLocaleString("pt-BR")} / mês
                  </span>
                </div>

                <input
                  id={leadsInputId}
                  type="range"
                  role="slider"
                  aria-label="Volume de conversas e mensagens mensais"
                  aria-valuemin={100}
                  aria-valuemax={40000}
                  aria-valuenow={monthlyLeads}
                  min={100}
                  max={40000}
                  step={100}
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between items-center text-[11px] text-slate-400 flex-wrap gap-1 pt-0.5">
                  <span>100 leads</span>
                  <span className="text-violet-700 font-semibold flex items-center gap-1.5 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                    <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                    <span>Plano Recomendado: <strong>{bipePlanName}</strong></span>
                    <span className="text-violet-500 font-normal">
                      ({maxMessagesInPlan >= 999999 ? "msgs ilimitadas" : `até ${maxMessagesInPlan.toLocaleString("pt-BR")} msgs/mês`})
                    </span>
                  </span>
                  <span>40.000 leads</span>
                </div>
              </div>

              {/* Slider 4: Ticket Médio de Venda */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={ticketInputId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Ticket médio de cada venda ou serviço fechado (R$):</span>
                  </label>
                  <span className="text-sm font-extrabold text-amber-700 bg-white px-3 py-0.5 rounded-lg border border-amber-200 font-mono">
                    R$ {ticketMedio.toLocaleString("pt-BR")}
                  </span>
                </div>

                <input
                  id={ticketInputId}
                  type="range"
                  role="slider"
                  aria-label="Ticket médio de venda"
                  aria-valuemin={10}
                  aria-valuemax={3000}
                  aria-valuenow={ticketMedio}
                  min={10}
                  max={3000}
                  step={10}
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>R$ 10</span>
                  <span>R$ 1.500</span>
                  <span>R$ 3.000</span>
                </div>
              </div>

            </div>

            {/* Comparativo de Capacidade: Humano vs BipeSend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limitação Humana CLT</span>
                </div>
                <p className="text-rose-700/90 text-[11.5px] leading-relaxed">
                  Trabalha 44h/semana (~176h/mês). Fica <strong>544 horas por mês sem atender</strong> (noites, madrugadas e fins de semana). Tempo médio de espera: <strong>18 a 35 minutos</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sua Agente BipeSend IA</span>
                </div>
                <p className="text-emerald-700/90 text-[11.5px] leading-relaxed">
                  Trabalha <strong>720h/mês ininterruptas (24/7/365)</strong>. Resposta em <strong>menos de 5 segundos</strong>, com envio de áudios reais e CRM Bipe Plus automático.
                </p>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: Painel de Retorno Financeiro & Economia */}
          <div className="lg:col-span-5 bg-gradient-to-tr from-[#0B1120] via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-[28px] shadow-2xl flex flex-col justify-between space-y-6 border border-slate-700/80 relative">
            
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#38BDF8] bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                  Economia Líquida Real
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {economiaPercentual}% de Redução
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Economia Anual Projetada:</span>
                <div className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-emerald-400 font-inter tracking-tight leading-tight mt-1">
                  R$ {economiaAnual.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-1">
                  = R$ {economiaMensal.toLocaleString("pt-BR")}/mês poupados diretamente na folha
                </div>
              </div>

              {/* Tabela Comparativa de Custos */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Custo CLT da equipe ({numAgents} {numAgents === 1 ? "atendente" : "atendentes"}):</span>
                  <span className="font-bold text-rose-400 font-mono">
                    R$ {custoEquipeHumanaMensal.toLocaleString("pt-BR")}/mês
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Plano Ideal ({bipePlanName}):</span>
                    <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                      Recomendado
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    R$ {bipePlanCost.toLocaleString("pt-BR")}/mês
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11.5px]">
                  <span className="text-slate-400">Retorno sobre o Investimento (ROI):</span>
                  <span className="font-bold text-[#38BDF8] bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800">
                    {roiMultiplier}x o valor investido
                  </span>
                </div>
              </div>

              {/* Faturamento Extra Estimado */}
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Potencial de Vendas Extras (Recuperação 24/7):</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-inter">
                  + R$ {faturamentoExtraEstimado.toLocaleString("pt-BR")}/mês
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Estimativa de <strong>+{conversaoRecuperadaMensal} vendas/mês</strong> que antes eram perdidas por demora de resposta fora do expediente comercial.
                </p>
              </div>

            </div>

            {/* Botão de Chamada para Ação com Micro-animação Figma Shimmer */}
            <div className="space-y-2 pt-2">
              <a
                href={`${registerUrl}?plan=${bipePlanId}`}
                className="figma-shimmer-btn w-full py-4 px-6 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-center"
              >
                <span>Garantir Economia de R$ {economiaMensal.toLocaleString("pt-BR")}/mês</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>7 dias de garantia incondicional • Teste gratuito sem risco</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
