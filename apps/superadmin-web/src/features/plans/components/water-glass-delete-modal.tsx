"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trash2, 
  CheckCircle2, 
  Droplets, 
  X, 
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface WaterGlassDeleteModalProps {
  isOpen: boolean;
  planId: string;
  planName: string;
  onClose: () => void;
  onConfirmDelete: (planId: string) => Promise<void>;
}

export function WaterGlassDeleteModal({
  isOpen,
  planId,
  planName,
  onClose,
  onConfirmDelete,
}: WaterGlassDeleteModalProps) {
  const [isFilling, setIsFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLeaping, setIsLeaping] = useState(false);
  const fillIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reseta os estados toda vez que o modal for aberto ou fechado
  useEffect(() => {
    if (!isOpen) {
      if (fillIntervalRef.current) clearInterval(fillIntervalRef.current);
      setIsFilling(false);
      setFillProgress(0);
      setIsCompleted(false);
      setIsLeaping(false);
    }
  }, [isOpen]);

  // Tecla Escape para fechar se não estiver no meio do preenchimento
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isFilling) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFilling, onClose]);

  const handleStartWaterFill = () => {
    if (isFilling || isCompleted) return;
    setIsFilling(true);
    setFillProgress(0);

    const startTime = Date.now();
    const duration = 1400; // 1.4 segundos para encher o copo de água

    fillIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setFillProgress(progress);

      if (progress >= 100) {
        if (fillIntervalRef.current) clearInterval(fillIntervalRef.current);
        setIsCompleted(true);
        setIsLeaping(true);

        try {
          // Executa a exclusão e atualização da tabela/grid
          await onConfirmDelete(planId);
        } catch {
          // Se falhar o erro já é tratado
        }

        // Aguarda 850ms para o usuário assistir o salto e o chacoalho do ícone
        setTimeout(() => {
          onClose();
        }, 900);
      }
    }, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop suave */}
      <div 
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isFilling) onClose();
        }}
      />

      {/* Card do Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Barra superior de acento */}
        <div className={`h-1.5 w-full transition-colors duration-500 ${
          isCompleted 
            ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
            : "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
        }`} />

        {/* Botão de Fechar */}
        {!isFilling && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 sm:p-7 flex flex-col items-center text-center">
          
          {/* Título & Descrição */}
          <div className="flex items-center gap-2 mb-1 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-inter">
              Confirmação de Exclusão
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-inter">
            Excluir Plano &quot;{planName}&quot;?
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 max-w-xs leading-relaxed">
            Ao confirmar, o plano será arquivado e removido do catálogo público e do painel comercial.
          </p>

          {/* ── COPO DE ÁGUA ENCHENDO (REPRESENTAÇÃO VISUAL INTERATIVA) ── */}
          <div className="my-6 relative flex flex-col items-center">
            
            {/* O Copo Físico de Vidro */}
            <div className="relative w-[130px] h-[175px] rounded-b-[36px] rounded-t-[12px] border-[3.5px] border-sky-400/40 bg-gradient-to-b from-sky-50/30 to-sky-100/20 backdrop-blur-xs shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),0_12px_24px_rgba(0,123,255,0.08)] overflow-hidden flex flex-col justify-end">
              
              {/* Borda / Aro de Vidro no Topo */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-200/50 via-white/90 to-sky-200/50 border-b border-sky-300/40 z-20" />

              {/* Reflexo de Vidro (Linha Vertical Esquerda) */}
              <div className="absolute top-2 bottom-3 left-2 w-1.5 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full z-20 pointer-events-none" />
              
              {/* Reflexo de Vidro (Linha Vertical Direita) */}
              <div className="absolute top-4 bottom-5 right-2 w-1 bg-gradient-to-b from-white/40 to-transparent rounded-full z-20 pointer-events-none" />

              {/* Linhas de Marcação / Graduação do Copo */}
              <div className="absolute inset-y-3 left-3 flex flex-col justify-between text-[8px] font-mono text-sky-400/70 select-none pointer-events-none z-20">
                <span className="flex items-center gap-1 leading-none">- 100%</span>
                <span className="flex items-center gap-1 leading-none">- 75%</span>
                <span className="flex items-center gap-1 leading-none">- 50%</span>
                <span className="flex items-center gap-1 leading-none">- 25%</span>
              </div>

              {/* ── LÍQUIDO / ÁGUA EM ASCENSÃO ── */}
              <div
                className="w-full bg-gradient-to-t from-blue-600 via-sky-500 to-cyan-300 relative transition-all duration-75 ease-linear overflow-visible"
                style={{ height: `${fillProgress}%` }}
              >
                {/* Superfície Ondulada da Água (Onda Giratória) */}
                {fillProgress > 0 && fillProgress < 100 && (
                  <div className="absolute -top-3 -left-6 -right-6 h-6 overflow-hidden pointer-events-none">
                    <div className="w-[180px] h-[180px] -mt-[170px] -ml-[15px] rounded-[42%] bg-cyan-200/80 animate-liquid-wave opacity-75" />
                  </div>
                )}

                {/* Bolhas Subindo dentro da Água */}
                {fillProgress > 15 && (
                  <>
                    <span className="absolute bottom-1 left-7 w-2 h-2 rounded-full bg-white/70 animate-bubble-1" />
                    <span className="absolute bottom-2 right-8 w-1.5 h-1.5 rounded-full bg-white/60 animate-bubble-2" />
                    <span className="absolute bottom-0.5 left-12 w-2.5 h-2.5 rounded-full bg-white/50 animate-bubble-3" />
                  </>
                )}
              </div>

              {/* ── ÍCONE CENTRAL: DÁ UM SALTO E UM CHACOALHO QUANDO COMPLETA ── */}
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-md transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white animate-icon-leap-shake shadow-emerald-500/40"
                      : isFilling
                      ? "bg-white/95 text-blue-600 scale-105 shadow-blue-500/20"
                      : "bg-white/90 text-rose-500 shadow-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 drop-shadow-sm" />
                  ) : (
                    <Trash2 className="w-6 h-6 drop-shadow-xs" />
                  )}
                </div>

                {/* Onda de Splash quando o copo enche até o topo */}
                {isCompleted && (
                  <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-400 animate-splash-ring pointer-events-none" />
                )}
              </div>
            </div>

            {/* Indicador de Status / Porcentagem */}
            <div className="mt-3 flex items-center gap-1.5">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in zoom-in">
                  <Sparkles className="w-3.5 h-3.5" />
                  Copo Cheio! Concluído com Sucesso
                </span>
              ) : isFilling ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  <Droplets className="w-3.5 h-3.5 animate-pulse text-sky-500" />
                  Enchendo copo de água... {Math.round(fillProgress)}%
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  Clique abaixo para iniciar o preenchimento e confirmar
                </span>
              )}
            </div>
          </div>

          {/* ── BOTÕES DE AÇÃO ── */}
          <div className="w-full flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isFilling}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleStartWaterFill}
              disabled={isFilling || isCompleted}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isCompleted
                  ? "bg-emerald-600 shadow-emerald-500/20"
                  : isFilling
                  ? "bg-sky-600 opacity-90 cursor-wait"
                  : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Excluído!</span>
                </>
              ) : isFilling ? (
                <>
                  <Droplets className="w-4 h-4 animate-bounce" />
                  <span>Enchendo ({Math.round(fillProgress)}%)...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirmar Exclusão</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
