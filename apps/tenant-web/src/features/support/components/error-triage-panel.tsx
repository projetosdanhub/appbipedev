"use client";

import { useState } from "react";
import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@bipesend/ui";
import { updateErrorReportStatusAction } from "../actions/triage.actions";
import { useRouter } from "next/navigation";

interface ErrorReport {
  id: string;
  requestId: string;
  errorCode: string;
  status: string;
  context: any;
  createdAt: string;
}

export function ErrorTriagePanel({ initialReports }: { initialReports: ErrorReport[] }) {
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateErrorReportStatusAction(id, newStatus);
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Falha ao atualizar o status do erro.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {initialReports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Nenhum reporte de erro encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Request ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {initialReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{report.errorCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{report.requestId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${report.status === 'open' ? 'bg-red-100 text-red-800' :
                        report.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                        report.status === 'ignored' ? 'bg-slate-100 text-slate-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={(open: boolean) => !open && setSelectedReport(null)}>
          <DialogContent className="sm:max-w-xl">
            <div className="mb-4">
              <DialogTitle>Detalhes do Erro</DialogTitle>
              <DialogDescription>
                Código: {selectedReport.errorCode}
              </DialogDescription>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-slate-500 font-medium">Request ID</span>
                  <span className="font-mono">{selectedReport.requestId}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Data</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="block text-slate-500 font-medium mb-1">Contexto</span>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                  {JSON.stringify(selectedReport.context, null, 2)}
                </pre>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange(selectedReport.id, "open")}
                disabled={isUpdating || selectedReport.status === "open"}
              >
                Abrir
              </Button>
              <Button 
                variant="outline" 
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => handleStatusChange(selectedReport.id, "investigating")}
                disabled={isUpdating || selectedReport.status === "investigating"}
              >
                Investigar
              </Button>
              <Button 
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatusChange(selectedReport.id, "resolved")}
                disabled={isUpdating || selectedReport.status === "resolved"}
              >
                Resolver
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleStatusChange(selectedReport.id, "ignored")}
                disabled={isUpdating || selectedReport.status === "ignored"}
              >
                Ignorar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
