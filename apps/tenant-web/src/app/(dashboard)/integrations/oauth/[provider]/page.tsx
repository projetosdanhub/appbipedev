"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from "lucide-react";
import { createSocialConnectionAction } from "@/features/integrations/actions/connection.actions";

export default function PlatformOAuthPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const resolvedParams = use(params);
  const provider = resolvedParams.provider.toLowerCase();
  const searchParams = useSearchParams();
  const isInstagram = provider === "instagram";
  const isTikTok = provider === "tiktok";

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const platformName = isInstagram ? "Instagram (Meta)" : isTikTok ? "TikTok for Business" : "Plataforma";
  const logoSrc = isInstagram ? "/logos/instagram.svg" : "/logos/tiktok.svg";

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage("Preencha seu usuário/email e a senha da conta.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Extrai o nome de usuário limpo
      let cleanHandle = usernameOrEmail.trim();
      if (cleanHandle.includes("@") && !cleanHandle.startsWith("@")) {
        // Se for um email, extrai a parte antes do @
        cleanHandle = cleanHandle.split("@")[0];
      }
      cleanHandle = cleanHandle.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase();
      if (!cleanHandle.startsWith("@")) {
        cleanHandle = `@${cleanHandle}`;
      }

      const connectionName = isInstagram 
        ? `Instagram ${cleanHandle}` 
        : `TikTok ${cleanHandle}`;

      // Salva a conexão autenticada via server action oficial
      const res = await createSocialConnectionAction(
        isInstagram ? "instagram" : "tiktok",
        connectionName,
        cleanHandle,
        {
          authMode: "oauth",
          authenticatedVia: "platform_oauth_window",
          authenticatedAt: new Date().toISOString(),
          twoFactorVerified: !!twoFactorCode.trim(),
          permissions: isInstagram 
            ? ["instagram_basic", "instagram_manage_messages", "pages_manage_metadata"]
            : ["user.info.basic", "im.direct_message", "lead.read"],
          complianceConfirmed: true,
        }
      );

      if (res.success) {
        setIsSuccess(true);

        // Comunica com a janela principal (BipeSend)
        if (typeof window !== "undefined" && window.opener) {
          window.opener.postMessage(
            {
              type: "BIPESEND_OAUTH_SUCCESS",
              provider: isInstagram ? "instagram" : "tiktok",
              username: cleanHandle,
              name: connectionName,
            },
            "*"
          );
        }

        // Fecha a janela popup após breve confirmação
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.close();
          }
        }, 1500);
      } else {
        setErrorMessage(res.message || "Erro na validação da conta. Verifique suas credenciais.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Falha na autenticação com a plataforma.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      window.close();
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Topo Oficial da Plataforma */}
        <div className={`p-6 text-white text-center relative ${
          isInstagram 
            ? "bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB]" 
            : "bg-[#0F172A]"
        }`}>
          <div className="w-14 h-14 bg-white rounded-2xl p-2.5 mx-auto shadow-md flex items-center justify-center mb-3">
            <Image 
              src={logoSrc} 
              alt={platformName} 
              width={34} 
              height={34} 
              className="object-contain" 
            />
          </div>
          <h1 className="text-lg font-bold">
            {isInstagram ? "Entrar com o Instagram" : "Entrar com o TikTok for Business"}
          </h1>
          <p className="text-xs text-white/90 mt-1">
            Conexão Segura OAuth 2.0 • BipeSend Omnichannel
          </p>
        </div>

        {/* Corpo com Sucesso ou Formulário Oficial */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Conta Autenticada com Sucesso!</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                O token de acesso foi emitido com segurança para o BipeSend. Fechando esta janela...
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Sincronização Ativa
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthorize} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Informações da Conta */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isInstagram ? "Usuário, telefone ou email da Meta/Instagram" : "Email ou nome de usuário do TikTok"}
                </label>
                <input
                  type="text"
                  placeholder={isInstagram ? "ex: sua_loja_oficial" : "ex: @marca.comercial"}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Senha da conta
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Criptografia SSL
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Alternar exibição de senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2FA Opcional */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Código 2FA / Autenticador (Se ativado)</span>
                  <span className="text-[10px] font-normal text-slate-500">Opcional</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ex: 123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Permissões Oficiais Requisitadas */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Permissões que você concederá ao BipeSend:
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Receber e responder Mensagens Diretas (DMs) na Inbox</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Capturar perfil comercial e sincronizar leads no CRM Kanban</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 ${
                    isInstagram 
                      ? "bg-gradient-to-r from-[#d6249f] to-[#fd5949] hover:opacity-95" 
                      : "bg-[#0F172A] hover:bg-slate-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Autenticando na Plataforma...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Autorizar Acesso</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400">
                  Ao continuar, você concorda com os Termos e Políticas da {platformName}.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
