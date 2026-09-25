"use client";

import React, { useState } from "react";
import {
  Server,
  FileText,
  ArrowUpRight
} from "lucide-react";
import { MonitoredService, HealthLogEntry } from "../types/health.types";
import { runInfrastructureHealthCheckAction } from "../actions/health.actions";
import { HealthDiagnosticsModal } from "./health-diagnostics-modal";

interface ServiceHealthSectionProps {
  initialServices?: MonitoredService[];
  initialLogs?: HealthLogEntry[];
}

export function ServiceHealthSection({
  initialServices = [],
  initialLogs = [],
}: ServiceHealthSectionProps) {
  const [services, setServices] = useState<MonitoredService[]>(initialServices);
  const [logs, setLogs] = useState<HealthLogEntry[]>(initialLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await runInfrastructureHealthCheckAction();
      if (res.success) {
        setServices(res.services);
        setLogs(res.logs);
      }
    } catch (err) {
      console.error("Erro ao verificar saúde dos serviços:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <section className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#007BFF] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A]">
                Saúde dos Serviços & Infraestrutura da Plataforma
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Monitoramento contínuo das conexões com telemetria ativa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-[12px] font-bold shadow-sm transition-all hover:border-[#007BFF]"
          >
            <FileText className="w-4 h-4 text-[#007BFF]" />
            <span>Ver Diagnóstico & Logs de Falhas</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {services.map((srv) => {
            const isHealthy = srv.status === "healthy";
            const isDegraded = srv.status === "degraded";

            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#007BFF] hover:bg-white hover:shadow-md transition-all text-left group"
              >
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                  isHealthy
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : isDegraded
                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#007BFF] transition-colors truncate">
                      {srv.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {srv.latencyMs}ms
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {srv.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <HealthDiagnosticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        logs={logs}
        onRefresh={fetchHealth}
        isRefreshing={isRefreshing}
      />
    </>
  );
}
