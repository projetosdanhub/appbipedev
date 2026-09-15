"use client";

import { useState } from "react";
import { Button, Input } from "@bipesend/ui";
import { inviteMemberAction } from "@/features/workspace/actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { disconnectMemberAction, approveDisconnectionAction } from "@/features/workspace/actions";

export function TeamClient({ tenantId, members, invitations, disconnectionRequests }: {
  tenantId: string,
  members: any[],
  invitations: any[],
  disconnectionRequests: any[]
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const [disconnectLoading, setDisconnectLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleDisconnect(userId: string) {
    if (!confirm("Tem certeza que deseja desvincular este membro?")) return;
    setDisconnectLoading(userId);
    const res = await disconnectMemberAction(tenantId, userId, "Removido via painel");
    alert(res.message);
    setDisconnectLoading(null);
    if (res.success) router.refresh();
  }

  async function handleApproveDisconnection(reqId: string, approve: boolean) {
    setDisconnectLoading(reqId);
    const res = await approveDisconnectionAction(reqId, approve);
    alert(res.message);
    setDisconnectLoading(null);
    if (res.success) router.refresh();
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await inviteMemberAction({ email, role: role as any, tenantId });
    setMessage(res.message);
    setLoading(false);
    if (res.success) {
      setEmail("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-4">Convidar Membro</h3>
        <form onSubmit={handleInvite} className="flex gap-4 items-start">
          <div className="flex-1">
            <Input 
              type="email" 
              placeholder="E-mail" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="w-48">
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="admin">Administrador</option>
              <option value="member">Membro</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Convite
          </Button>
        </form>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Membros Atuais</h3>
        <div className="border rounded-lg divide-y">
          {members.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{m.name || 'Sem nome'}</p>
                <p className="text-sm text-muted-foreground">{m.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm bg-secondary px-2 py-1 rounded capitalize">{m.role}</span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDisconnect(m.userId)}
                  disabled={disconnectLoading === m.userId}
                >
                  {disconnectLoading === m.userId ? "..." : "Desvincular"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Convites Pendentes</h3>
          <div className="border rounded-lg divide-y">
            {invitations.map(i => (
              <div key={i.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{i.email}</p>
                  <p className="text-sm text-muted-foreground">Expira em: {new Date(i.expiresAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm bg-secondary px-2 py-1 rounded capitalize">{i.role}</span>
                  <span className={`text-sm px-2 py-1 rounded ${i.status === 'expired' ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                    {i.status === 'expired' ? 'Expirado' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {disconnectionRequests.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium text-destructive">Solicitações de Desligamento</h3>
          <div className="border rounded-lg divide-y">
            {disconnectionRequests.map(r => {
              const member = members.find(m => m.id === r.membershipId);
              return (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Remover: {member?.email || r.membershipId}</p>
                    <p className="text-sm text-muted-foreground">Motivo: {r.reason || "Não informado"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApproveDisconnection(r.id, false)}
                      disabled={disconnectLoading === r.id}
                    >
                      Rejeitar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleApproveDisconnection(r.id, true)}
                      disabled={disconnectLoading === r.id}
                    >
                      Aprovar Remoção
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
