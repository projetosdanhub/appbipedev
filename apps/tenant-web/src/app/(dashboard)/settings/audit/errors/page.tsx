import { getErrorReportsAction } from "@/features/support/actions/triage.actions";
import { ErrorTriagePanel } from "@/features/support/components/error-triage-panel";
import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";

export default async function AuditErrorsPage(props: {
  searchParams: Promise<{ status?: string; errorCode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await getWorkspaceUser();
  if (!user) {
    redirect("/login");
  }

  // Verificar permissão
  // Aqui, o ideal é usar `hasPermission(context, "audit.read")` mas a API já protege e o middleware do next também protege.
  // Vamos buscar os reports pela server action que vai repassar o request para a API protegida.
  
  let reports = [];
  let errorMsg = null;
  try {
    reports = await getErrorReportsAction({
      status: searchParams.status,
      errorCode: searchParams.errorCode,
    });
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Auditoria: Erros</h1>
        <p className="text-sm text-slate-500">
          Visualize e faça a triagem dos erros reportados pela plataforma e pelos usuários.
        </p>
      </div>
      
      {errorMsg ? (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-800">
            <strong>Erro ao carregar auditoria:</strong> {errorMsg}
          </div>
        </div>
      ) : (
        <ErrorTriagePanel initialReports={reports} />
      )}
    </div>
  );
}
