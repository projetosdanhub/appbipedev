"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Radio, 
  ChevronDown, 
  Check, 
  MessageCircle, 
  Camera, 
  Music2, 
  Send,
  X, 
  Filter,
  Sparkles
} from "lucide-react";
import type { ConnectedAccount } from "./add-lead-modal";

export interface OmnichannelFilterProps {
  connections: ConnectedAccount[];
  selectedConnectionIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function OmnichannelFilter({
  connections,
  selectedConnectionIds,
  onChange,
  className = "",
}: OmnichannelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const isAllSelected = selectedConnectionIds.length === 0;

  const handleToggleConnection = (id: string) => {
    if (selectedConnectionIds.includes(id)) {
      onChange(selectedConnectionIds.filter((item) => item !== id));
    } else {
      onChange([...selectedConnectionIds, id]);
    }
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "evolution_api":
      case "whatsapp":
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case "instagram":
        return <Camera className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
      case "tiktok":
        return <Music2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
      case "telegram":
        return <Send className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />;
      default:
        return <Radio className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case "evolution_api":
      case "whatsapp":
        return "WhatsApp";
      case "instagram":
        return "Instagram";
      case "tiktok":
        return "TikTok";
      case "telegram":
        return "Telegram";
      default:
        return "Canal";
    }
  };

  // Label do botão principal
  const getTriggerLabel = () => {
    if (isAllSelected) return "Todas as Conexões";
    if (selectedConnectionIds.length === 1) {
      const conn = connections.find((c) => c.id === selectedConnectionIds[0]);
      return conn ? conn.name || getProviderLabel(conn.provider) : "1 Conexão";
    }
    return `${selectedConnectionIds.length} Conexões`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`crm-omnichannel-filter-btn ${!isAllSelected ? "is-active" : ""}`}
        title="Filtrar por conexões omnichannel"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${!isAllSelected ? "text-[#007BFF] animate-pulse" : "text-slate-500"}`} />
          <span className="truncate max-w-[130px] font-medium text-xs">
            {getTriggerLabel()}
          </span>
        </div>
        {!isAllSelected && (
          <span className="crm-omnichannel-badge-count">
            {selectedConnectionIds.length}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menu Dropdown de Conexões */}
      {isOpen && (
        <div className="crm-omnichannel-dropdown" role="menu">
          <div className="crm-omnichannel-dropdown-header">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#007BFF]" />
                Conexões Omnichannel
              </span>
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-[#007BFF] hover:underline font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Selecione as instâncias e perfis para filtrar o fluxo
            </p>
          </div>

          <div className="crm-omnichannel-dropdown-list">
            {/* Opção Todas as Conexões */}
            <button
              type="button"
              onClick={handleSelectAll}
              className={`crm-omnichannel-option ${isAllSelected ? "is-selected" : ""}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Radio className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  Todas as Conexões
                </span>
              </div>
              {isAllSelected && <Check className="w-3.5 h-3.5 text-[#007BFF] shrink-0" />}
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Conexões Disponíveis */}
            {connections.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                Nenhuma conexão ativa configurada.
              </div>
            ) : (
              connections.map((conn) => {
                const isSelected = selectedConnectionIds.includes(conn.id);
                return (
                  <button
                    key={conn.id}
                    type="button"
                    onClick={() => handleToggleConnection(conn.id)}
                    className={`crm-omnichannel-option ${isSelected ? "is-selected" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getProviderIcon(conn.provider)}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {conn.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {getProviderLabel(conn.provider)} {conn.instanceName ? `• ${conn.instanceName}` : ""}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#007BFF] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
