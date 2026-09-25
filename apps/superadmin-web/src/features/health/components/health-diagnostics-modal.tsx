"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Server,
  Activity,
  RefreshCw,
  BookOpen,
  Terminal,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Lock
} from "lucide-react";
import {
  MonitoredService,
  HealthLogEntry,
  KNOWN_ERRORS_CATALOG,
  KnownErrorCatalogItem
} from "../types/health.types";

interface HealthDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: MonitoredService[];
  logs: HealthLogEntry[];
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export function HealthDiagnosticsModal({
  isOpen,
  onClose,
  services,
  logs,
  onRefresh,
  isRefreshing = false,
}: HealthDiagnosticsModalProps) {
  const [activeTab, setActiveTab] = useState<"connections" | "catalog" | "logs">("connections");
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCatalog = KNOWN_ERRORS_CATALOG.filter((item) => {
    if (filterSeverity === "ALL") return true;
    return item.severity === filterSeverity;
  });

  const getServiceIcon = (category: MonitoredService["category"]) => {
    switch (category) {
      case "database":
        return Database;
      case "cache":
        return Cpu;
      case "gateway":
        return Layers;
      case "ai":
        return Sparkles;
      case "auth":
        return Lock;
      default:
        return Server;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-[28px] border border-[#CBD5E1] shadow-[0_28px_70px_rgba(0,123,255,0.18)] w-full max-w-[860px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-modal-title"
      >
        {/* ── Topo do Modal ── */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="health-modal-title" className="text-[16px] font-extrabold text-[#0F172A] leading-tight">
                Diagnóstico & Saúde dos Serviços
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Monitoramento de conexões em tempo real e catálogo de resolução de falhas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#0F172A] text-[12px] font-bold shadow-sm transition-all disabled:opacity-50"
              title="Testar Conexões Novamente"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#007BFF] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Testar Agora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Abas de Navegação ── */}
        <div className="flex border-b border-[#E2E8F0] px-6 bg-white overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            type="button"
            onClick={() => setActiveTab("connections")}
            className={`flex items-center gap-2 py-3 px-3 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "connections"
                ? "border-[#007BFF] text-[#007BFF]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Server className="w-4 h-4" />
            Conexões Ativas ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 py-3 px-3 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "catalog"
                ? "border-[#007BFF] text-[#007BFF]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Catálogo de Erros Conhecidos ({KNOWN_ERRORS_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 py-3 px-3 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "logs"
                ? "border-[#007BFF] text-[#007BFF]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Logs Recentes de Diagnóstico ({logs.length})
          </button>
        </div>

        {/* ── Conteúdo das Abas ── */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4 custom-brand-scrollbar pr-3">
          
          {/* ABA 1: CONEXÕES ATIVAS */}
          {activeTab === "connections" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {services.map((srv) => {
                  const Icon = getServiceIcon(srv.category);
                  const isHealthy = srv.status === "healthy";
                  const isDegraded = srv.status === "degraded";

                  return (
                    <div
                      key={srv.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isHealthy
                          ? "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                          : isDegraded
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-red-50/50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                          isHealthy
                            ? "bg-emerald-500"
                            : isDegraded
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-[#0F172A]">{srv.name}</span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isHealthy
                                ? "bg-emerald-100 text-emerald-700"
                                : isDegraded
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {isHealthy ? "Operacional" : isDegraded ? "Degradado" : "Falha"}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#64748B] mt-0.5 leading-relaxed">{srv.description}</p>
                          <div className="text-[11px] text-[#94A3B8] font-mono mt-1">
                            Endpoint: {srv.endpoint}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 text-right flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#0F172A]">
                          <span className={`w-2 h-2 rounded-full ${
                            srv.latencyMs < 50
                              ? "bg-emerald-500"
                              : srv.latencyMs < 300
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`} />
                          <span>{srv.latencyMs} ms</span>
                        </div>
                        <span className="text-[11px] text-[#64748B]">Uptime: {srv.uptime}</span>
                        <span className="text-[10px] text-[#94A3B8]">Conexões: {srv.activeConnections}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 2: CATÁLOGO DE ERROS CONHECIDOS */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[13px] text-[#64748B]">
                  Erros mapeados preventivamente com causas raízes e procedimentos de correção rápida.
                </p>
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
                  {(["ALL", "CRITICAL", "WARNING", "INFO"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        filterSeverity === sev
                          ? "bg-white text-[#0F172A] shadow-sm"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      {sev === "ALL" ? "Todos" : sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.code}
                    className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all space-y-2.5"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-extrabold text-[#007BFF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {item.code}
                        </span>
                        <span className="text-[14px] font-bold text-[#0F172A]">{item.name}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : item.severity === "WARNING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    <div className="text-[12px] text-[#475569] space-y-1.5 pt-1">
                      <div>
                        <span className="font-bold text-[#0F172A]">Causa Provável: </span>
                        <span>{item.probableCause}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A]">Procedimento de Remediação: </span>
                        <span className="text-[#007BFF] font-medium">{item.remediation}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Módulo: {item.service}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.suggestedAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: LOGS RECENTES */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11.5px] max-h-[380px] overflow-y-auto space-y-2 select-text">
                {logs.length === 0 ? (
                  <div className="text-slate-500 py-4 text-center">Nenhum evento registrado no momento.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-2 rounded hover:bg-slate-900 border-b border-slate-800/60 pb-2">
                      <div className="flex items-center justify-between text-slate-400 text-[10.5px]">
                        <span>[{new Date(log.timestamp).toLocaleTimeString("pt-BR")}] • {log.serviceName}</span>
                        <span className={
                          log.status === "healthy"
                            ? "text-emerald-400 font-bold"
                            : log.status === "degraded"
                            ? "text-amber-400 font-bold"
                            : "text-red-400 font-bold"
                        }>
                          {log.status.toUpperCase()} ({log.latencyMs}ms)
                        </span>
                      </div>
                      <div className="text-slate-200 mt-1 font-sans text-[12px]">{log.message}</div>
                      {log.errorCode && (
                        <div className="mt-1 text-amber-300 text-[11px]">
                          Código de Erro: {log.errorCode} {log.details && `— ${log.details}`}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── Rodapé ── */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <div className="text-[12px] text-[#64748B]">
            Todas as conexões são auditadas a cada 30 segundos.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] text-[13px] font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
