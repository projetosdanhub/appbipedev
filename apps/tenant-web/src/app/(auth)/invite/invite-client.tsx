"use client";

import { useState } from "react";
import { Button } from "@bipesend/ui";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "./actions";
import Link from "next/link";

export function InviteClient({ 
  invitation, 
  isLoggedIn, 
  userEmail, 
  token 
}: { 
  invitation: { id: string, email: string, tenantName: string },
  isLoggedIn: boolean,
  userEmail?: string | null,
  token: string
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAccept() {
    setLoading(true);
    setError("");
    const res = await acceptInviteAction(token);
    setLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Convite para Workspace</h1>
        <p className="text-muted-foreground text-lg">
          Você foi convidado para participar de <span className="font-semibold text-foreground">{invitation.tenantName}</span>.
        </p>
      </div>

      <div className="bg-card border p-6 rounded-lg w-full max-w-md shadow-sm space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">O convite foi enviado para:</p>
          <p className="font-medium">{invitation.email}</p>
        </div>

        {isLoggedIn ? (
          userEmail === invitation.email ? (
            <div className="space-y-4">
              <Button onClick={handleAccept} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aceitar Convite
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                Você está logado como {userEmail}, mas o convite é para {invitation.email}.
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                Fazer login com outra conta
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <p className="text-sm">Para aceitar o convite, faça login ou crie uma conta usando este e-mail.</p>
            <div className="flex gap-4">
              <Button onClick={() => router.push(`/login?callbackUrl=/invite?token=${token}`)} className="flex-1">
                Fazer Login
              </Button>
              <Button onClick={() => router.push(`/register?email=${encodeURIComponent(invitation.email)}&callbackUrl=/invite?token=${token}`)} variant="outline" className="flex-1">
                Criar Conta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
