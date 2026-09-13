"use client";

import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, Download, Upload, UserPlus } from "lucide-react";
import { Button, Input } from "@bipesend/ui";

const MOCK_USERS = [
  { id: 1, name: "João Silva", phone: "+55 11 99999-9999", email: "joao@exemplo.com", tags: ["VIP", "Urgente"], status: "Ativo", source: "WhatsApp" },
  { id: 2, name: "Maria Oliveira", phone: "+55 21 98888-8888", email: "maria@exemplo.com", tags: ["Inbound"], status: "Ativo", source: "Instagram" },
  { id: 3, name: "Carlos Santos", phone: "+55 31 97777-7777", email: "-", tags: ["B2B"], status: "Inativo", source: "Manual" },
];

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">Contatos (Aba de Clientes)</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
            Gerencie sua base de clientes, importe e exporte contatos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-[38px] text-[14px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" className="h-[38px] text-[14px] border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="h-[38px] text-[14px] font-medium bg-[#0A74FF] hover:bg-[#0A74FF]/90 text-white shadow-sm transition-all rounded-[10px]">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between px-6 py-3 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Buscar contatos..." 
            className="h-[34px] pl-9 pr-4 text-[13px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[8px] focus:outline-none focus:border-[#0A74FF] dark:focus:border-[#0A74FF] text-[#0F172A] dark:text-white w-full sm:w-[300px] transition-all"
          />
        </div>
        
        <Button variant="outline" className="h-[34px] text-[13px] border-[#E2E8F0] dark:border-[#334155]">
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#1E293B]/50 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Nome</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Telefone</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">E-mail</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Tags (Etiquetas)</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Origem</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Status</th>
                  <th className="px-5 py-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(user => (
                  <tr key={user.id} className="border-b border-[#E2E8F0] dark:border-[#334155] last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0A74FF]/10 text-[#0A74FF] flex items-center justify-center font-bold text-[12px]">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#475569] dark:text-[#CBD5E1] font-medium">{user.phone}</td>
                    <td className="px-5 py-4 text-[13px] text-[#475569] dark:text-[#CBD5E1]">{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.tags.map(t => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{user.source}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-[11px] font-medium rounded-md ${
                        user.status === "Ativo" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors rounded-md hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
