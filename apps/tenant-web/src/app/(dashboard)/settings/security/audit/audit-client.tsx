"use client";

import { useEffect, useState } from "react";
import { getAuditLogsAction } from "@/features/workspace/actions/audit.actions";
import { AuditLog } from "@bipesend/contracts";
import { DataTable, type DataColumn } from "@bipesend/ui";
import { Button } from "@bipesend/ui";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input, Label } from "@bipesend/ui";

export function AuditClient({ tenantId }: { tenantId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  
  // Pagination & Filters
  const [actionFilter, setActionFilter] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchLogs = async (cursor?: string | null) => {
    setLoading(true);
    setError(undefined);
    const result = await getAuditLogsAction(tenantId, {
      limit: 20,
      cursor: cursor || undefined,
      action: actionFilter || undefined,
    });
    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.message);
      return;
    }

    setLogs(result.data.data);
    setNextCursor(result.data.nextCursor);
  };

  useEffect(() => {
    setHistory([]);
    setCurrentCursor(null);
    fetchLogs(null);
  }, [actionFilter, tenantId]);

  const handleNext = () => {
    if (!nextCursor) return;
    setHistory([...history, currentCursor || ""]);
    setCurrentCursor(nextCursor);
    fetchLogs(nextCursor);
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    const prevHistory = [...history];
    const prevCursor = prevHistory.pop() || null;
    setHistory(prevHistory);
    setCurrentCursor(prevCursor);
    fetchLogs(prevCursor);
  };

  const columns: DataColumn<AuditLog>[] = [
    {
      id: "action",
      header: "Ação",
      cell: (row: AuditLog) => (
        <span className="font-medium text-[var(--color-ink-900)]">
          {row.action}
        </span>
      ),
    },
    {
      id: "actor",
      header: "Ator",
      cell: (row: AuditLog) => (
        <span className="text-[var(--color-ink-600)]">
          {row.actorId || "Sistema"}
        </span>
      ),
    },
    {
      id: "target",
      header: "Alvo",
      cell: (row: AuditLog) => (
        <span className="text-[var(--color-ink-600)]">
          {row.targetId || "-"}
        </span>
      ),
    },
    {
      id: "date",
      header: "Data",
      cell: (row: AuditLog) => (
        <span className="text-[var(--color-ink-600)] text-sm">
          {new Date(row.createdAt).toLocaleString("pt-BR")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Filtrar por ação"
            placeholder="Ex: reset_password"
            value={actionFilter}
            onChange={(e: any) => setActionFilter(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        caption="Logs de Auditoria"
        columns={columns}
        rows={logs}
        rowKey={(row) => row.id}
        loading={loading}
        error={error}
        onRetry={() => fetchLogs(currentCursor)}
        renderMobileCard={(row: AuditLog) => (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{row.action}</span>
            <span className="text-[var(--color-ink-600)]">
              Por: {row.actorId || "Sistema"}
            </span>
            <span className="text-[var(--color-ink-400)]">
              {new Date(row.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>
        )}
      />

      {(!loading && !error) && (
        <nav className="ui-pagination" aria-label="Paginação">
          <div className="ui-filter-bar ml-auto">
            <Button
              variant="outline"
              size="md"
              disabled={history.length === 0}
              onClick={handlePrev}
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={!nextCursor}
              onClick={handleNext}
            >
              Próxima
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
