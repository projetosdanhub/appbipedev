"use client";

import { useState } from "react";
import { CrmDeal, CrmContact, CrmTag } from "@bipesend/contracts";
import { assignTagToContactAction, removeTagFromContactAction } from "../actions/tag.actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  Button 
} from "@bipesend/ui";
import { Tag as TagIcon, Check, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ApplyTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  stageName: string;
  deals: CrmDeal[];
  contacts?: CrmContact[];
  availableTags: CrmTag[];
  onOpenTagManager: () => void;
  onTagsApplied?: () => void;
}

export function ApplyTagsModal({
  isOpen,
  onClose,
  tenantId,
  stageName,
  deals,
  contacts = [],
  availableTags,
  onOpenTagManager,
  onTagsApplied,
}: ApplyTagsModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set(deals.map(d => d.id)));
  const [isApplying, setIsApplying] = useState(false);

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDeal = (id: string) => {
    setSelectedDealIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = async () => {
    if (selectedTagIds.size === 0) {
      toast.error("Selecione pelo menos uma etiqueta para aplicar.");
      return;
    }
    if (selectedDealIds.size === 0) {
      toast.error("Selecione pelo menos um card do fluxo.");
      return;
    }

    setIsApplying(true);
    try {
      const dealsToTag = deals.filter(d => selectedDealIds.has(d.id));
      let successCount = 0;

      for (const deal of dealsToTag) {
        if (!deal.contactId) continue;
        for (const tagId of selectedTagIds) {
          const res = await assignTagToContactAction(tenantId, deal.contactId, tagId);
          if (res.success) successCount++;
        }
      }

      toast.success(`Etiquetas aplicadas com sucesso a ${dealsToTag.length} cards!`);
      onTagsApplied?.();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar etiquetas.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <TagIcon className="w-5 h-5 text-[#007BFF]" />
            Adicionar Etiquetas aos Cards
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Aplique etiquetas organizacionais aos leads e oportunidades no fluxo <strong>"{stageName}"</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Seleção de Etiquetas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Selecione as etiquetas:</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTagManager();
                }}
                className="text-xs text-[#007BFF] hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                Criar nova etiqueta
              </button>
            </div>

            {availableTags.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Nenhuma etiqueta cadastrada ainda.</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { onClose(); onOpenTagManager(); }}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Configurar Etiquetas
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected 
                          ? "bg-[#007BFF] text-white border-[#007BFF] shadow-2xs ring-2 ring-blue-200" 
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span>{tag.name}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seleção de Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Cards deste fluxo ({selectedDealIds.size}/{deals.length}):
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedDealIds.size === deals.length) setSelectedDealIds(new Set());
                  else setSelectedDealIds(new Set(deals.map(d => d.id)));
                }}
                className="text-[11px] text-[#007BFF] hover:underline"
              >
                {selectedDealIds.size === deals.length ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 p-1">
              {deals.map((deal) => {
                const isSelected = selectedDealIds.has(deal.id);
                return (
                  <div
                    key={deal.id}
                    onClick={() => toggleDeal(deal.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                      isSelected 
                        ? "bg-blue-50/50 border-blue-200 text-slate-900 font-medium" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate flex-1">{deal.title}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ml-2 shrink-0 ${
                      isSelected ? "bg-[#007BFF] border-[#007BFF] text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isApplying}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleApply} 
            disabled={isApplying || selectedTagIds.size === 0 || selectedDealIds.size === 0}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Aplicando...
              </>
            ) : (
              "Aplicar Etiquetas"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
