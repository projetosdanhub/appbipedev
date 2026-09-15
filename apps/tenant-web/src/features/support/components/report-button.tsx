"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@bipesend/ui";
import { CircleAlert, CheckCircle2 } from "lucide-react";
import { reportErrorAction } from "../actions/report.actions";
import { toast } from "sonner";

export function ReportErrorButton({
  requestId,
  errorCode,
}: {
  requestId: string;
  errorCode: string;
}) {
  const [state, formAction, isPending] = useActionState(
    reportErrorAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Erro reportado com sucesso. Nossa equipe já foi notificada.");
    } else if (state?.success === false) {
      toast.error("Falha ao reportar o erro. Tente novamente.");
    }
  }, [state]);

  if (state?.success) {
    return (
      <Button size="md" variant="outline" disabled>
        <CheckCircle2 aria-hidden="true" className="text-green-600" />
        Reportado
      </Button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="errorCode" value={errorCode} />
      <Button size="md" variant="outline" type="submit" disabled={isPending}>
        <CircleAlert aria-hidden="true" />
        {isPending ? "Reportando..." : "Reportar ao suporte"}
      </Button>
    </form>
  );
}
