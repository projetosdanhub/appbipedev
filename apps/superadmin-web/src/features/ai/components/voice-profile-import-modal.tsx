"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Volume2,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { VoiceProfileService } from "../services/voice-profile.service";
import { VoiceProfile } from "@bipesend/contracts";
import { toast } from "sonner";

interface VoiceProfileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileImported: (profile: VoiceProfile) => void;
}

export const VoiceProfileImportModal: React.FC<VoiceProfileImportModalProps> = ({
  isOpen,
  onClose,
  onProfileImported
}) => {
  const [jsonText, setJsonText] = useState("");
  const [importedProfile, setImportedProfile] = useState<VoiceProfile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      validateContent(content);
    };
    reader.readAsText(file);
  };

  const validateContent = (content: string) => {
    setValidationError(null);
    setErrorDetails([]);

    if (!content.trim()) {
      setImportedProfile(null);
      return;
    }

    const result = VoiceProfileService.importAndValidateProfileJson(content);
    if (result.success && result.profile) {
      setImportedProfile(result.profile);
      toast.success("Perfil JSON validado com sucesso!");
    } else {
      setImportedProfile(null);
      setValidationError(result.error || "Erro de validação");
      setErrorDetails(result.details || []);
    }
  };

  const handleApply = () => {
    if (!importedProfile) return;
    onProfileImported(importedProfile);
    toast.success(`Perfil vocal "${importedProfile.profile.name}" ativado com sucesso!`);
    onClose();
  };

  const handleLoadSample = () => {
    const sample = VoiceProfileService.exportProfileAsJson();
    setJsonText(sample);
    validateContent(sample);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007BFF] flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-inter">
                Importar Perfil Vocal JSON
              </h3>
              <p className="text-xs text-slate-500 font-poppins">
                Carregue um arquivo padronizado BipeSend Voice Profile v1.0.0
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sub-Tabs: Arquivo vs Colar JSON */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "file"
                    ? "bg-[#007BFF] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Upload de Arquivo (.json)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "paste"
                    ? "bg-[#007BFF] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Colar Código JSON
              </button>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs font-semibold text-[#007BFF] hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Carregar Modelo Germani Padrão
            </button>
          </div>

          {activeTab === "file" && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/json"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#007BFF] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100/60 text-[#007BFF] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <strong className="text-sm text-slate-800 font-semibold block mb-1">
                  Clique para selecionar o arquivo .json
                </strong>
                <span className="text-xs text-slate-500">
                  Compatível com esquemas Germani Oficial v1.0.0 e XTTS v2
                </span>
              </div>
            </div>
          )}

          {activeTab === "paste" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Conteúdo JSON
              </label>
              <textarea
                rows={7}
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  validateContent(e.target.value);
                }}
                placeholder="Cole aqui o JSON do perfil de voz..."
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] outline-none text-slate-800 bg-slate-50"
              />
            </div>
          )}

          {/* Erro de Validação */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                {validationError}
              </div>
              {errorDetails.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-700 mt-2">
                  {errorDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Preview do Perfil Importado com Sucesso */}
          {importedProfile && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Perfil Válido & Pronto para Ativação
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  Schema v{importedProfile.schema_version}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Nome</span>
                  <strong className="text-xs text-slate-900 truncate block">
                    {importedProfile.profile.name}
                  </strong>
                </div>

                <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Calor (Warmth)</span>
                  <strong className="text-xs text-slate-900 block">
                    {Math.round(importedProfile.acoustic_signature.timbre.warmth * 100)}%
                  </strong>
                </div>

                <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">WPM Padrão</span>
                  <strong className="text-xs text-slate-900 block">
                    {importedProfile.speech.rate.default_wpm} palavras/min
                  </strong>
                </div>

                <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Presets</span>
                  <strong className="text-xs text-slate-900 block">
                    {Object.keys(importedProfile.agent_presets || {}).length} disponíveis
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic">
                &ldquo;{importedProfile.profile.description}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Validação Zod Ativa
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!importedProfile}
              onClick={handleApply}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                importedProfile
                  ? "bg-[#007BFF] hover:bg-blue-600 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Ativar Perfil no Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
