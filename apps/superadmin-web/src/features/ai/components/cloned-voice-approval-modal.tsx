"use client";

import React, { useState } from "react";
import { X, CheckCircle, Volume2, Sparkles, ShieldCheck } from "lucide-react";
import { ClonedVoiceRecord } from "@bipesend/contracts";

interface ClonedVoiceApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (record: ClonedVoiceRecord) => void;
  extractedMetrics: {
    pitchHz: number;
    cadenceWpm: number;
    snrDb: number;
    prosodyScore: number;
    fileName: string;
  };
  sampleAudioUrl?: string | null;
}

export function ClonedVoiceApprovalModal({
  isOpen,
  onClose,
  onApprove,
  extractedMetrics,
  sampleAudioUrl,
}: ClonedVoiceApprovalModalProps) {
  const [voiceName, setVoiceName] = useState(
    extractedMetrics.fileName
      ? `Voz ${extractedMetrics.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}`
      : "Voz Personalizada"
  );
  const [gender, setGender] = useState<"female" | "male" | "neutral">("female");
  const [assignedAgentKey, setAssignedAgentKey] = useState<string>("general");
  const [personaDescription, setPersonaDescription] = useState(
    "Tom consultivo, acolhedor e seguro, preservando o sotaque e cadência natural da amostra."
  );
  const [warmth, setWarmth] = useState(0.85);
  const [stability, setStability] = useState(0.92);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim()) return;

    const newRecord: ClonedVoiceRecord = {
      id: `cloned-voice-${Date.now()}`,
      name: voiceName.trim(),
      gender,
      personaDescription: personaDescription.trim(),
      sourceAudioFileName: extractedMetrics.fileName,
      sourceAudioUrl: sampleAudioUrl || undefined,
      assignedAgentKey,
      status: "approved",
      acoustics: {
        pitchHz: extractedMetrics.pitchHz,
        cadenceWpm: extractedMetrics.cadenceWpm,
        snrDb: extractedMetrics.snrDb,
        prosodyScore: extractedMetrics.prosodyScore,
        warmth,
        stability,
      },
      createdAt: new Date().toISOString(),
    };

    onApprove(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-inter text-base font-bold text-slate-900">
                Aprovar & Cadastrar Nova Voz Clonada
              </h3>
              <p className="text-xs text-slate-500">
                Calibre a identidade e vincule a um Agente Mestre da plataforma
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Métricas Extraídas da Amostra */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Biometria Acústica Extraída com Sucesso
              </span>
              <span className="text-[10.5px] font-mono text-emerald-700 truncate max-w-[200px]">
                {extractedMetrics.fileName}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-100">
              <div>
                <span className="text-[10px] text-slate-500 block">Pitch Médio</span>
                <strong className="text-xs font-bold text-slate-900 font-inter">
                  {extractedMetrics.pitchHz} Hz
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Cadência</span>
                <strong className="text-xs font-bold text-slate-900 font-inter">
                  {extractedMetrics.cadenceWpm} WPM
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Pureza (SNR)</span>
                <strong className="text-xs font-bold text-slate-900 font-inter">
                  {extractedMetrics.snrDb} dB
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Estabilidade</span>
                <strong className="text-xs font-bold text-slate-900 font-inter">
                  {extractedMetrics.prosodyScore}%
                </strong>
              </div>
            </div>

            {/* Player de áudio da amostra se disponível */}
            {sampleAudioUrl && (
              <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <audio controls src={sampleAudioUrl} className="w-full h-8" />
              </div>
            )}
          </div>

          {/* Nome da Voz */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nome da Voz Clonada
            </label>
            <input
              type="text"
              required
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="Ex: Voz Daniel - Fundador"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-all"
            />
          </div>

          {/* Gênero e Agente Atribuído */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Gênero Vocal Percebido
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "female" | "male" | "neutral")}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#007BFF]"
              >
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
                <option value="neutral">Neutro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Vincular ao Agente Mestre
              </label>
              <select
                value={assignedAgentKey}
                onChange={(e) => setAssignedAgentKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#007BFF]"
              >
                <option value="general">Uso Geral (Disponível para qualquer agente)</option>
                <option value="sofia">Sofia — Consultora de Vendas</option>
                <option value="lucas">Lucas — SDR & Qualificação</option>
                <option value="maya">Maya — Suporte & Atendimento</option>
                <option value="gabriel">Gabriel — Consultor Imobiliário</option>
                <option value="germani">Germani — Assessora & Copiloto</option>
              </select>
            </div>
          </div>

          {/* Descrição da Persona */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Instruções de Persona & Estilo
            </label>
            <textarea
              rows={2}
              value={personaDescription}
              onChange={(e) => setPersonaDescription(e.target.value)}
              placeholder="Como esta voz deve soar no atendimento..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Sliders de Calibração Fina */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700">Calor Vocal</span>
                <strong className="text-[#007BFF]">{Math.round(warmth * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={warmth}
                onChange={(e) => setWarmth(parseFloat(e.target.value))}
                className="w-full accent-[#007BFF]"
              />
              <span className="text-[10px] text-slate-600 block mt-0.5">Suavidade e presença aveludada</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700">Estabilidade Acústica</span>
                <strong className="text-emerald-600">{Math.round(stability * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-600 block mt-0.5">Sem variação robótica</span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Aprovar & Ativar Voz no Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
