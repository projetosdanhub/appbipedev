"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, Check, X } from "lucide-react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o consentimento já foi registrado anteriormente no navegador
    const consent = localStorage.getItem("bipesend_cookie_consent");
    if (!consent) {
      // Pequeno delay para entrada suave após o carregamento da página
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("bipesend_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("bipesend_cookie_consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de Cookies e Privacidade LGPD"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-400"
    >
      <div className="bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-white space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 font-inter block">
                Privacidade &amp; Conformidade LGPD
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                Lei Geral de Proteção de Dados (Lei 13.709/18)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Fechar e manter apenas essenciais"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Utilizamos cookies essenciais para autenticação e métricas de navegação segura. Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="text-blue-400 hover:underline font-medium">
            Termos de Uso
          </Link>{" "}
          e nossa{" "}
          <Link href="/privacy" className="text-blue-400 hover:underline font-medium">
            Política de Privacidade
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Aceitar e Continuar</span>
          </button>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium py-2.5 px-3 rounded-xl transition-all border border-slate-700 hover:text-white cursor-pointer"
          >
            Apenas Essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
