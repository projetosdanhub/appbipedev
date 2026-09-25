"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Sparkles, X, Settings, Minus, Bot } from "lucide-react";
import { GermaniConfig, GERMANI_DEFAULT_PRESET, GermaniChatMessage } from "../types/germani.types";
import { GermaniChatPlayground } from "./germani-chat-playground";
import { getGermaniConfigAction } from "../actions/superadmin-ai.actions";

export function GermaniCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [config, setConfig] = useState<GermaniConfig>(GERMANI_DEFAULT_PRESET);

  useEffect(() => {
    // Carrega a configuração mais recente da Germani
    getGermaniConfigAction()
      .then((cfg) => {
        if (cfg) setConfig(cfg);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    // Restaura estado aberto salvo no sessionStorage
    try {
      const saved = sessionStorage.getItem("bipesend_superadmin_germani_chat_open");
      if (saved === "true") {
        setIsOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggleOpen = () => {
    const next = !isOpen;
    if (next) {
      setUnreadCount(0);
    }
    setIsOpen(next);
    try {
      sessionStorage.setItem("bipesend_superadmin_germani_chat_open", next ? "true" : "false");
    } catch {}
  };

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("bipesend_superadmin_germani_chat_open", "false");
    } catch {}
  };

  const handleAssistantMessageDelivered = (message: GermaniChatMessage) => {
    // Se o chat estiver fechado ou minimizado, incrementa contador e dispara aviso toast
    if (!isOpen && message.role === "assistant") {
      setUnreadCount((prev) => prev + 1);
      toast.info("Germani enviou uma mensagem", {
        description:
          message.content.length > 70
            ? `${message.content.slice(0, 70)}...`
            : message.content,
        action: {
          label: "Ver no Chat",
          onClick: () => {
            setUnreadCount(0);
            setIsOpen(true);
            try {
              sessionStorage.setItem("bipesend_superadmin_germani_chat_open", "true");
            } catch {}
          },
        },
        duration: 7000,
      });
    }
  };

  return (
    <>
      {/* ── GERMANI INTEGRADA AO CABEÇALHO (PRESENÇA NATIVA, SEM BOTÃO ISOLADO) ── */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer ${
          isOpen
            ? "bg-blue-50/90 text-blue-700"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        aria-label="Falar com a Germani"
        title="Germani — Assessora & Copilot de IA Integrada"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <img
            src="/assets/brand/germani-avatar.jpg"
            alt="Germani"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
          />
          {/* Fallback de ícone caso a imagem demore */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white -z-10">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Badge de Mensagens Não Visualizadas */}
          {unreadCount > 0 && !isOpen && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-bounce z-20"
              title={`${unreadCount} nova${unreadCount > 1 ? "s" : ""} mensagem${unreadCount > 1 ? "s" : ""}`}
            >
              {unreadCount}
            </span>
          )}

          {/* Indicador de Status Online Integrado no Avatar */}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
        </div>

        <div className="hidden sm:flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 leading-none group-hover:text-[#007BFF] transition-colors">
              {config.name || "Germani"}
            </span>
            <span className="text-[9.5px] font-bold text-[#007BFF] bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
              IA
            </span>
          </div>
          <span className="text-[10.5px] text-slate-400 font-medium leading-tight mt-0.5">
            {unreadCount > 0 && !isOpen ? "Nova mensagem" : "Copilot Ativa"}
          </span>
        </div>
      </button>

      {/* ── JANELA FLUTUANTE EXPANSÍVEL (PRESERVADA EM MEMÓRIA AO MINIMIZAR) ── */}
      <div
        className={`fixed top-[72px] right-3 sm:right-6 z-50 w-[430px] max-w-[calc(100vw-1.5rem)] h-[620px] max-h-[calc(100vh-5.5rem)] rounded-2xl shadow-xl border border-slate-200/90 bg-white flex flex-col overflow-hidden font-sans ring-1 ring-black/5 transition-all duration-200 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none -translate-y-2"
        }`}
      >
        {/* Cabeçalho da Janela de Chat */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                <img
                  src="/assets/brand/germani-avatar.jpg"
                  alt="Germani"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm font-inter leading-tight">
                  {config.name}
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-medium px-2 py-0.2 rounded-full">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Sua Assessora & Amiga Pessoal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/germani"
              className="w-8 h-8 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
              title="Configurações, Habilidades e Parâmetros da Germani"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              title="Minimizar janela de chat"
              aria-label="Minimizar"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
              title="Fechar janela de chat"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Área de Conversa Integrada (Histórico Persistente e Notificação Ativa) */}
        <div className="flex-1 overflow-hidden">
          <GermaniChatPlayground
            config={config}
            hideHeader
            isOpen={isOpen}
            onNewMessageDelivered={handleAssistantMessageDelivered}
          />
        </div>
      </div>
    </>
  );
}
