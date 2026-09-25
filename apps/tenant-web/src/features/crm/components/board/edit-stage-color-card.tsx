"use client";

import { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import { X, Check, Palette, Loader2 } from "lucide-react";
import { CrmPipelineStage } from "@bipesend/contracts";
import { updatePipelineStageAction } from "../../actions/stage.actions";
import { toast } from "sonner";
import { DEFAULT_SAVED_COLORS, STORAGE_KEY, isValidHex } from "./add-stage-inline";
import { stageColor } from "./stage-colors";

export interface EditStageColorCardProps {
  tenantId: string;
  pipelineId: string;
  stage: CrmPipelineStage;
  onClose: () => void;
  onStageSaved: (stage: CrmPipelineStage, isEdit: boolean) => void;
  onColorChangePreview?: (color: string) => void;
}

export function EditStageColorCard({
  tenantId,
  pipelineId,
  stage,
  onClose,
  onStageSaved,
  onColorChangePreview,
}: EditStageColorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const initialHex = stageColor(stage.colorToken);

  const [selectedColor, setSelectedColor] = useState<string>(initialHex);
  const [customHex, setCustomHex] = useState<string>(initialHex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paleta de até 10 cores salvas / favoritas compartilhadas
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

  // Fechar ao pressionar Escape ou clicar fora do card
  const handleCancel = useCallback(() => {
    onColorChangePreview?.(initialHex);
    onClose();
  }, [initialHex, onColorChangePreview, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [handleCancel]);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setCustomHex(color);
    onColorChangePreview?.(color);
  };

  const handleHexInputChange = (value: string) => {
    let formatted = value.trim();
    if (!formatted.startsWith("#") && formatted.length > 0) {
      formatted = `#${formatted}`;
    }
    setCustomHex(formatted);
    if (isValidHex(formatted)) {
      setSelectedColor(formatted);
      onColorChangePreview?.(formatted);
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
    onColorChangePreview?.(upperHex);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    toast.success(`Cor ${upperHex} salva nas suas cores favoritas!`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await updatePipelineStageAction(tenantId, pipelineId, stage.id, {
        colorToken: selectedColor,
      });

      if (!res.success || !res.data) {
        toast.error(res.message || "Erro ao atualizar cor do fluxo.");
        return;
      }

      toast.success(`Cor do fluxo "${stage.name}" atualizada com sucesso!`);
      onStageSaved(res.data as CrmPipelineStage, true);
      onClose();
    } catch {
      toast.error("Erro inesperado ao salvar nova cor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="crm-edit-stage-color-card"
      style={{ "--stage-color": selectedColor } as CSSProperties}
    >
      {/* Header do Card de Cor */}
      <div className="crm-inline-card-header">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs transition-colors duration-200"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="font-semibold text-[13px] text-slate-800 font-title truncate">
            Alterar Cor do Fluxo
          </span>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
          aria-label="Fechar"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Corpo com apenas Cores Salvas, Seletor Hexadecimal e Salvar Cor */}
      <div className="crm-inline-card-body">
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
                  {isSelected && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
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
            {/* Color picker bubble acoplado ao input color nativo */}
            <label className="crm-color-picker-label" title="Abrir seletor de cores do sistema">
              <input
                type="color"
                value={isValidHex(customHex) ? customHex : "#007BFF"}
                onChange={(e) => {
                  const hex = e.target.value.toUpperCase();
                  setCustomHex(hex);
                  setSelectedColor(hex);
                  onColorChangePreview?.(hex);
                }}
                className="crm-color-native-input"
              />
              <div
                className="crm-color-picker-bubble"
                style={{ backgroundColor: isValidHex(customHex) ? customHex : selectedColor }}
              >
                <Palette className="w-3.5 h-3.5 text-white drop-shadow-xs" />
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

            {/* Botão Salvar Cor (nas favoritas) */}
            <button
              type="button"
              onClick={() => handleSaveCustomColor(customHex)}
              className="crm-btn-save-color"
              title="Salvar nas 10 cores favoritas"
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
            disabled={isSubmitting}
            className="crm-btn-submit-stage"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Salvando...
              </>
            ) : (
              "Salvar Cor"
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
