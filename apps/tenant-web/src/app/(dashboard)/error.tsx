"use client";

import { useEffect } from "react";
import { ErrorState } from "@bipesend/ui";
import { ReportErrorButton } from "../../features/support/components/report-button";
import { PageHeader } from "../../features/design-system/components/page-header";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string; requestId?: string; errorCode?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service if applicable
    console.error(error);
  }, [error]);

  const requestId = error.requestId || error.digest;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Ocorreu um Erro"
        description="Não conseguimos concluir a solicitação."
      />

      <div className="flex justify-center py-12">
        <ErrorState
          title="Tivemos um problema técnico"
          description={error.message || "Algo deu errado na plataforma. Nossa equipe foi alertada."}
          requestId={requestId}
          errorCode={error.errorCode}
          onRetry={reset}
          action={
            requestId ? (
              <ReportErrorButton
                requestId={requestId}
                errorCode={error.errorCode || "RUNTIME_ERROR"}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
