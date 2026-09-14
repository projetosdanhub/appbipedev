import Link from "next/link";
export function PrivilegedRecovery() {
  return (
    <div className="grid gap-6">
      <h1 className="ui-page-title">Recuperar acesso de operação</h1>
      <p>
        Este acesso exige o procedimento de recuperação privilegiada da
        plataforma. Procure o responsável pela infraestrutura para verificar sua
        identidade e restabelecer o acesso.
      </p>
      <p className="ui-help">
        Nenhum código foi enviado e nenhuma senha foi alterada nesta página.
      </p>
      <Link className="ui-button ui-button-outline" href="/login">
        Voltar para o login
      </Link>
    </div>
  );
}
