"use client";

import { useState } from "react";
import { Button, Input } from "@bipesend/ui";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "./actions";
import { motion } from "framer-motion";

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
  const [alias, setAlias] = useState("");
  const router = useRouter();

  async function handleAccept() {
    setLoading(true);
    setError("");

    // Simulate delay for smooth UI feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const res = await acceptInviteAction(token, alias.trim() || undefined);
    setLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.message);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-gradient-to-br from-background to-muted/20">
      <motion.div 
        className="space-y-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 shadow-inner">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
          Você recebeu um convite!
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          Venha fazer parte do workspace <span className="font-semibold text-foreground">{invitation.tenantName}</span> no Bipesend.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-2xl w-full max-w-md shadow-2xl space-y-6"
      >
        <motion.div variants={itemVariants} className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Enviado para</p>
          <p className="font-semibold text-lg">{invitation.email}</p>
        </motion.div>

        {isLoggedIn ? (
          userEmail === invitation.email ? (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">Como deseja chamar este Workspace? (Opcional)</label>
                <Input 
                  placeholder="Ex: Workspace da Empresa" 
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="bg-background/50 focus:bg-background transition-colors"
                />
                <p className="text-xs text-muted-foreground">Este apelido só será visível para você.</p>
              </div>

              <div className="space-y-3 pt-2">
                <Button onClick={handleAccept} disabled={loading} className="w-full h-12 text-md transition-all hover:scale-[1.02] hover:shadow-lg">
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {loading ? "Processando..." : "Aceitar Convite"}
                </Button>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-medium bg-destructive/10 py-2 px-3 rounded-md">
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 text-left">
                <p className="font-semibold mb-1">Conflito de Conta</p>
                Você está conectado como <span className="font-bold">{userEmail}</span>, mas o convite é para <span className="font-bold">{invitation.email}</span>.
              </div>
              <Button variant="outline" className="w-full h-11 transition-all hover:bg-muted" onClick={() => router.push("/login")}>
                Trocar de Conta
              </Button>
            </motion.div>
          )
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para acessar o workspace, você precisa estar autenticado com o e-mail do convite.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => router.push(`/login?callbackUrl=/invite?token=${token}`)} className="flex-1 h-11 shadow-md transition-transform hover:scale-105">
                Entrar
              </Button>
              <Button onClick={() => router.push(`/register?email=${encodeURIComponent(invitation.email)}&callbackUrl=/invite?token=${token}`)} variant="outline" className="flex-1 h-11 transition-all hover:bg-muted">
                Criar Conta
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
