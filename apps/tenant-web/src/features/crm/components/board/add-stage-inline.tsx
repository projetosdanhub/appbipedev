"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, Check, Palette, Loader2 } from "lucide-react";
import { CrmPipelineStage } from "@bipesend/contracts";
import { createPipelineStageAction } from "../../actions/stage.actions";
import { toast } from "sonner";

interface AddStageInlineCardProps {
  tenantId: string;
  pipelineId: string;
  existingCount?: number;
  onStageSaved: (stage: CrmPipelineStage, isEdit: boolean) => void;
}

export const DEFAULT_SAVED_COLORS = [
  "#007BFF", // Azul Bipe
  "#6366F1", // Índigo
  "#8B5CF6", // Violeta
  "#10B981", // Esmeralda
  "#14B8A6", // Verde Água
  "#06B6D4", // Ciano
  "#F59E0B", // Âmbar
  "#F97316", // Laranja
  "#EC4899", // Rosa
  "#EF4444", // Vermelho Carmim
];

export const STORAGE_KEY = "bipesend_crm_saved_flow_colors";

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function AddStageInlineCard({
  tenantId,
  pipelineId,
  existingCount = 0,
  onStageSaved,
}: AddStageInlineCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paleta de até 10 cores salvas
  const [savedColors, setSavedColors] = useState<string[]>(DEFAULT_SAVED_COLORS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedColors(parsed.slice(0, 10));
        }
      }
    } catch {}
  }, []);

  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const nextIndex = existingCount % DEFAULT_SAVED_COLORS.length;
    return DEFAULT_SAVED_COLORS[nextIndex];
  });

  const [customHex, setCustomHex] = useState<string>(selectedColor);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input quando abre o modo de adição
  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setCustomHex(color);
  };

  const handleHexInputChange = (value: string) => {
    let formatted = value.trim();
    if (!formatted.startsWith("#") && formatted.length > 0) {
      formatted = `#${formatted}`;
    }
    setCustomHex(formatted);
    if (isValidHex(formatted)) {
      setSelectedColor(formatted);
    }
  };

  const handleSaveCustomColor = (hexToSave: string) => {
    let hex = hexToSave.trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    if (!isValidHex(hex)) {
      toast.error("Insira um código hexadecimal válido (ex: #007BFF).");
      return;
    }

    const upperHex = hex.toUpperCase();
    let updated = savedColors.filter((c) => c.toUpperCase() !== upperHex);
    // Adiciona no início e mantém até 10 cores
    updated = [upperHex, ...updated].slice(0, 10);

    setSavedColors(updated);
    setSelectedColor(upperHex);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    toast.success(`Cor ${upperHex} salva nas suas cores favoritas!`);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Informe o nome do fluxo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPipelineStageAction(tenantId, pipelineId, {
        pipelineId,
        name: trimmedName,
        colorToken: selectedColor,
        category: "open",
        position: existingCount,
        requiredFieldRules: { version: 1, rules: [] },
      });

      if (!res.success || !res.data) {
        toast.error(res.message || "Erro ao criar fluxo.");
        return;
      }

      toast.success(`Fluxo "${trimmedName}" adicionado com sucesso!`);
      onStageSaved(res.data as CrmPipelineStage, false);
      setName("");
      setIsAdding(false);
    } catch {
      toast.error("Erro inesperado ao criar fluxo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="crm-add-column-card">
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="crm-btn-add-column group"
          title="Adicionar novo fluxo ao funil"
          aria-label="Adicionar novo fluxo ao funil"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#007BFF] transition-transform group-hover:scale-110">
            <Plus className="w-5 h-5" />
          </div>
          <span>Adicionar Fluxo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="crm-add-stage-inline-card" style={{ "--stage-color": selectedColor } as any}>
      {/* Header do Card Inline */}
      <div className="crm-inline-card-header">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="font-semibold text-[13px] text-slate-800">Novo Fluxo</span>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Corpo do Formulário Inline */}
      <div className="crm-inline-card-body">
        {/* Campo Nome */}
        <div className="mb-3">
          <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Nome do Fluxo
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Ex: Proposta Enviada..."
            className="crm-inline-input"
            maxLength={50}
            disabled={isSubmitting}
          />
        </div>

        {/* Cores Salvas (Até 10 cores) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
              Cores Salvas ({savedColors.length}/10)
            </label>
            <span className="text-[10px] text-slate-400">Clique para escolher</span>
          </div>

          <div className="crm-saved-colors-grid">
            {savedColors.map((color, idx) => {
              const isSelected = selectedColor.toUpperCase() === color.toUpperCase();
              return (
                <button
                  key={`${color}-${idx}`}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  className={`crm-color-swatch ${isSelected ? "is-selected" : ""}`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Selecionar cor ${color}`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white drop-shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletor Hexadecimal e Picker Nativo */}
        <div className="mb-4">
          <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Código Hexadecimal
          </label>
          <div className="flex items-center gap-2">
            {/* Color picker bubble acoplado a input color nativo */}
            <label className="crm-color-picker-label" title="Abrir seletor de cores do sistema">
              <input
                type="color"
                value={isValidHex(customHex) ? customHex : "#007BFF"}
                onChange={(e) => {
                  const hex = e.target.value.toUpperCase();
                  setCustomHex(hex);
                  setSelectedColor(hex);
                }}
                className="crm-color-native-input"
              />
              <div
                className="crm-color-picker-bubble"
                style={{ backgroundColor: isValidHex(customHex) ? customHex : selectedColor }}
              >
                <Palette className="w-3.5 h-3.5 text-white drop-shadow-sm" />
              </div>
            </label>

            {/* Input de texto Hex */}
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleHexInputChange(e.target.value)}
              placeholder="#007BFF"
              className="crm-inline-hex-input font-mono uppercase text-xs"
              maxLength={7}
            />

            {/* Botão Salvar Cor */}
            <button
              type="button"
              onClick={() => handleSaveCustomColor(customHex)}
              className="crm-btn-save-color"
              title="Salvar nas 10 cores do funil"
            >
              Salvar cor
            </button>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="crm-btn-submit-stage"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Adicionando...
              </>
            ) : (
              "Adicionar Fluxo"
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="crm-btn-cancel-stage"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
