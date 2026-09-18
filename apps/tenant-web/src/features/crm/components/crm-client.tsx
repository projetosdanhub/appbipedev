"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, List as ListIcon, Funnel, Search, X, Maximize2 } from "lucide-react";
import {
  Button,
  EmptyState,
  SegmentedControl,
} from "@bipesend/ui";
import { CrmPipeline, CrmPipelineStage, CrmDeal, CrmContact } from "@bipesend/contracts";
import { PipelineBoard } from "./board/pipeline-board";
import type { CrmMembershipOption } from "../types";
import "./crm.css";

interface CRMClientProps {
  tenantId: string;
  initialPipelines: CrmPipeline[];
  initialStages: Record<string, CrmPipelineStage[]>;
  initialDeals: Record<string, CrmDeal[]>;
  initialContacts: CrmContact[];
  memberships?: CrmMembershipOption[];
  sessionToken?: string;
}

export function CRMClient({ tenantId, initialPipelines, initialStages, initialDeals, initialContacts, memberships = [], sessionToken }: CRMClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    initialPipelines.length > 0 ? initialPipelines[0].id : null
  );

  const contactsMap = useMemo(() => {
    return new Map(initialContacts.map(c => [c.id, c]));
  }, [initialContacts]);

  const selectedPipeline = initialPipelines.find(p => p.id === selectedPipelineId);
  const stages = selectedPipelineId ? (initialStages[selectedPipelineId] || []) : [];
  const baseDeals = selectedPipelineId ? (initialDeals[selectedPipelineId] || []) : [];

  // Busca em tempo real por: Nome do cliente, Título, E-mail, CPF ou Telefone
  const filteredDeals = useMemo(() => {
    if (!searchTerm.trim()) return baseDeals;

    const term = searchTerm.toLowerCase().trim();
    const digitsOnly = term.replace(/\D/g, "");

    return baseDeals.filter((deal) => {
      // 1. Título da oportunidade
      if (deal.title.toLowerCase().includes(term)) return true;

      // 2. Contato vinculado (nome, email, telefone, cpf em customFields)
      const contact = deal.contactId ? contactsMap.get(deal.contactId) : null;
      if (contact) {
        if (contact.name.toLowerCase().includes(term)) return true;
        if (contact.email && contact.email.toLowerCase().includes(term)) return true;

        if (digitsOnly && digitsOnly.length >= 3) {
          const phoneClean = (contact.phone || contact.phoneE164 || "").replace(/\D/g, "");
          if (phoneClean.includes(digitsOnly)) return true;
        }

        if (contact.customFields) {
          const customStr = JSON.stringify(contact.customFields).toLowerCase();
          if (customStr.includes(term)) return true;
          if (digitsOnly && digitsOnly.length >= 3) {
            const customDigits = customStr.replace(/\D/g, "");
            if (customDigits.includes(digitsOnly)) return true;
          }
        }
      }

      return false;
    });
  }, [baseDeals, searchTerm, contactsMap]);

  const handleOpenFocusMode = () => {
    if (typeof window !== "undefined") {
      window.open(`${window.location.pathname}?focus=true`, "_blank");
    }
  };

  return (
    <div className="crm-shell">
      {/* ── Compact Header & Toolbar ── */}
      <div className="crm-top-bar">
        {/* Left: Funnel control & animated Create Funnel button */}
        <div className="crm-top-start">
          <div className="crm-funnel-selector-wrap group">
            <div className="crm-funnel-icon-box" title="Funil comercial">
              <Funnel className="w-4 h-4 text-[#007BFF] transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
            </div>
            <label htmlFor="crm-pipeline-select" className="crm-funnel-label">
              Funil:
            </label>
            {initialPipelines.length > 0 ? (
              <select
                id="crm-pipeline-select"
                value={selectedPipelineId || ""}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                className="crm-funnel-select"
                aria-label="Selecionar funil"
              >
                {initialPipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <span className="crm-pipeline-empty">Nenhum funil</span>
            )}
          </div>

          <button 
            type="button"
            className="crm-btn-create-funnel group"
            onClick={() => router.push("/settings/crm/pipelines")}
            title="Criar novo funil"
          >
            <Plus className="crm-plus-icon w-4 h-4 text-[#007BFF]" aria-hidden="true" />
            <span>Criar funil</span>
          </button>
        </div>

        {/* Right: Expandable Search, View Switcher & Focus Mode */}
        <div className="crm-top-end">
          {/* Animated Expandable Search */}
          <div className={`crm-search-box ${isSearchExpanded || searchTerm ? "is-expanded" : ""}`}>
            <button
              type="button"
              className="crm-search-trigger"
              onClick={() => {
                setIsSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              title="Pesquisar por cliente, e-mail, CPF ou telefone"
              aria-label="Pesquisar por cliente, e-mail, CPF ou telefone"
            >
              <Search className="w-4 h-4 text-slate-500 transition-colors group-hover:text-[#007BFF]" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => {
                if (!searchTerm) setIsSearchExpanded(false);
              }}
              placeholder="Buscar cliente, e-mail, CPF, tel..."
              className="crm-search-input"
              aria-label="Buscar lead por cliente, e-mail, CPF ou telefone"
            />
            {searchTerm && (
              <button
                type="button"
                className="crm-search-clear"
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <SegmentedControl
            label="Formato de visualização"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "kanban" | "list")}
            items={[
              { value: "kanban", label: "Quadro", icon: <LayoutGrid aria-hidden="true" /> },
              { value: "list", label: "Lista", icon: <ListIcon aria-hidden="true" /> },
            ]}
          />

          {/* Expand to focus mode in new tab */}
          <button
            type="button"
            className="crm-focus-btn"
            onClick={handleOpenFocusMode}
            title="Modo Foco em nova guia (tela cheia sem cabeçalhos)"
            aria-label="Modo Foco em nova guia"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* ── CRM Main Content ── */}
      <div className="crm-content">
        {selectedPipeline ? (
          <PipelineBoard 
            key={selectedPipeline.id}
            tenantId={tenantId} 
            pipeline={selectedPipeline} 
            stages={stages} 
            deals={filteredDeals} 
            contacts={initialContacts}
            memberships={memberships}
            viewMode={viewMode}
            sessionToken={sessionToken}
          />
        ) : (
          <EmptyState
            title="Crie seu primeiro funil"
            description="Organize as etapas comerciais antes de adicionar oportunidades ao CRM."
            action={
              <Button size="md" onClick={() => router.push("/settings/crm/pipelines")}>
                <Plus aria-hidden="true" /> Criar funil
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
