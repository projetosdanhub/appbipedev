"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Smartphone, KeyRound, ArrowRight, ArrowLeft, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@bipesend/ui";
import { loginAction, sendLoginCodeAction, loginWithCodeAction, getSuperadminSetupQrAction } from "../_actions";

type AuthStep = "choice" | "password" | "code_email" | "code_verify" | "2fa_prompt" | "2fa_setup";

export default function SuperadminLoginPage() {
  const [authStep, setAuthStep] = useState<AuthStep>("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setupQrUrl, setSetupQrUrl] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Auto-dismiss do erro após alguns segundos (notificação temporária)
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError("");
    }, 4200);
    return () => clearTimeout(timer);
  }, [error]);

  // Timer para reenvio de código
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Submissão de login com E-mail e Senha
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios.");
      }

      const res = await loginAction({
        email,
        password,
        code: (authStep === "2fa_prompt" || authStep === "2fa_setup") ? (code.trim() || undefined) : undefined,
        rememberMe,
      });

      if (!res.success) {
        if (res.message === "2FA_SETUP_REQUIRED") {
          if (res.qrCodeUrl) setSetupQrUrl(res.qrCodeUrl);
          if (res.secret) setSetupSecret(res.secret);
          setAuthStep("2fa_setup");
          toast.info("Escaneie o QR Code no seu aplicativo autenticador para ativar o 2FA.");
          return;
        }
        if (res.message === "2FA_REQUIRED") {
          setAuthStep("2fa_prompt");
          toast.info("Insira o código do seu autenticador 2FA ou código de recuperação.");
          return;
        }
        throw new Error(res.message);
      }

      toast.success("Acesso autorizado!");
      router.push("/");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar envio do código de acesso
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Digite um e-mail válido.");
      }

      const res = await sendLoginCodeAction({ email });
      if (!res.success) {
        throw new Error(res.message);
      }

      toast.success("Código de acesso enviado para seu e-mail!");
      setAuthStep("code_verify");
      setCountdown(45);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao solicitar código.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (countdown > 0 || isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await sendLoginCodeAction({ email });
      if (!res.success) {
        throw new Error(res.message);
      }
      toast.success("Novo código enviado com sucesso!");
      setCountdown(45);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao reenviar código.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão de login com Código
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!code) {
        throw new Error("Digite o código de acesso.");
      }

      const res = await loginWithCodeAction({
        email,
        code,
        rememberMe,
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      toast.success("Acesso autorizado!");
      router.push("/");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Código inválido.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-auth-content space-y-3 sm:space-y-4 max-h-[calc(100dvh-48px)] overflow-y-auto px-1 py-1">
      {/* ── Cabeçalho Dinâmico ── */}
      <div className="space-y-1.5 sm:space-y-2 text-center">
        <h1 className={`font-bold text-[#07113F] tracking-tight leading-[1.15] ${authStep === "2fa_setup" ? "text-[21px] sm:text-[24px]" : "text-[26px] md:text-[30px]"}`}>
          {authStep === "choice" && "BipeSend Superpainel"}
          {authStep === "password" && "Entrar com Senha"}
          {authStep === "code_email" && "Entrar com Código"}
          {authStep === "code_verify" && "Código de Acesso"}
          {authStep === "2fa_prompt" && "Verificação em Duas Etapas"}
          {authStep === "2fa_setup" && "Ativar Autenticador 2FA"}
        </h1>
        <p className={`text-[#68789A] leading-[1.4] font-normal ${authStep === "2fa_setup" ? "text-[12px] sm:text-[13px]" : "text-[14px] md:text-[15px]"}`}>
          {authStep === "choice" && "Acesso restrito ao painel administrativo da plataforma."}
          {authStep === "password" && "Insira seu e-mail e senha de superadministrador."}
          {authStep === "code_email" && "Informe seu e-mail para receber o código ou usar seu autenticador."}
          {authStep === "code_verify" && `Digite o código enviado para ${email} ou seu app 2FA.`}
          {authStep === "2fa_prompt" && "Digite o código gerado pelo aplicativo autenticador ou código de recuperação."}
          {authStep === "2fa_setup" && "Escaneie o QR Code abaixo com seu app autenticador."}
        </p>
      </div>

      {/* ── Mensagem de Notificação de Erro (Auto-dismiss temporário) ── */}
      {error && (
        <div className="rounded-[12px] border border-red-200 bg-red-50/95 backdrop-blur-sm px-3.5 py-2.5 text-[13px] font-medium text-red-600 animate-in fade-in slide-in-from-top-1 duration-200 flex items-center justify-between gap-2 shadow-sm">
          <span className="leading-snug">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded flex-shrink-0"
            aria-label="Fechar notificação"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── PASSO 1: Escolha de Autenticação ── */}
      {authStep === "choice" && (
        <div className="space-y-3.5 pt-2 animate-in fade-in zoom-in-95 duration-200">
          <Button
            type="button"
            onClick={() => {
              setError("");
              setAuthStep("password");
            }}
            size="lg"
            className="w-full h-[54px] rounded-[14px] border-0 text-white font-semibold text-[16px] shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
            style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
          >
            <Mail className="mr-2.5 h-5 w-5" />
            Logar com E-mail e Senha
          </Button>

          <Button
            type="button"
            onClick={() => {
              setError("");
              setAuthStep("code_email");
            }}
            variant="outline"
            size="lg"
            className="w-full h-[54px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
          >
            <KeyRound className="mr-2.5 h-5 w-5 text-[#0A74FF]" />
            <span className="text-[15px]">Continuar com Código</span>
          </Button>

          {/* Lembrar conectado */}
          <div className="pt-2 flex justify-center">
            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center">
                <input
                  id="sa-remember-choice"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                  aria-label="Lembrar de mim"
                />
                <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[#DCE5F2] bg-white transition-all peer-checked:border-[#087CF5] peer-checked:bg-[#087CF5]" />
                <svg className="absolute w-[14px] h-[14px] text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[13px] text-[#68789A] font-medium">Continuar conectado</span>
            </label>
          </div>
        </div>
      )}

      {/* ── PASSO 2A: Login com E-mail e Senha ── */}
      {authStep === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1 animate-in fade-in" noValidate>
          <div className="space-y-3">
            <Input
              id="sa-email-pass"
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com.br"
              autoComplete="username"
              leftIcon={<Mail className="h-5 w-5 text-[#7F90B2]" />}
            />

            <Input
              id="sa-password"
              label="Senha"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              leftIcon={<Lock className="h-5 w-5 text-[#7F90B2]" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#7F90B2] hover:text-[#079CF5] transition-colors p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <div className="flex justify-end pt-0.5">
              <Link
                href="/forgot-password"
                className="text-[13px] font-medium text-[#0A74FF] hover:opacity-80 transition-opacity"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full text-[16px] font-semibold text-white h-[52px] rounded-[14px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)]"
              style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            >
              {isLoading ? "Entrando..." : "Entrar"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError("");
                setAuthStep("choice");
              }}
              className="w-full text-[#68789A] hover:text-[#07113F]"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar para opções
            </Button>
          </div>
        </form>
      )}

      {/* ── PASSO 2B: Solicitar Código (Inserir E-mail) ── */}
      {authStep === "code_email" && (
        <form onSubmit={handleRequestCode} className="space-y-4 pt-1 animate-in fade-in" noValidate>
          <div className="space-y-3">
            <Input
              id="sa-code-email"
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com.br"
              autoComplete="username"
              leftIcon={<Mail className="h-5 w-5 text-[#7F90B2]" />}
              autoFocus
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full text-[16px] font-semibold text-white h-[52px] rounded-[14px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)]"
              style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            >
              {isLoading ? "Verificando..." : "Continuar"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError("");
                setAuthStep("choice");
              }}
              className="w-full text-[#68789A] hover:text-[#07113F]"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar para opções
            </Button>
          </div>
        </form>
      )}

      {/* ── PASSO 2C: Digitar Código de Acesso ── */}
      {authStep === "code_verify" && (
        <form onSubmit={handleCodeLogin} className="space-y-4 pt-1 animate-in fade-in" noValidate>
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EFF6FF] mb-3">
              <KeyRound className="w-6 h-6 text-[#007BFF]" />
            </div>
            <p className="text-[13px] text-[#68789A]">
              Insira o código de 6 dígitos recebido por e-mail ou seu autenticador 2FA.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              id="sa-code-input"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
              placeholder="000000"
              autoComplete="one-time-code"
              maxLength={10}
              className="text-center tracking-[0.25em] font-semibold text-[20px] h-[52px]"
              autoFocus
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={code.length < 6}
              className="w-full text-[16px] font-semibold text-white h-[52px] rounded-[14px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)]"
              style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            >
              {isLoading ? "Verificando..." : "Verificar e Entrar"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
                className={`text-[13px] font-medium transition-opacity ${
                  countdown > 0 ? "text-[#94A3B8] cursor-not-allowed" : "text-[#0A74FF] hover:underline"
                }`}
              >
                {countdown > 0 ? `Reenviar código em ${countdown}s` : "Reenviar código por e-mail"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setCode("");
                  setAuthStep("code_email");
                }}
                className="text-[13px] font-medium text-[#68789A] hover:text-[#07113F]"
              >
                Trocar e-mail
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── PASSO 2D: Prompt 2FA após E-mail + Senha ── */}
      {authStep === "2fa_prompt" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1 animate-in fade-in" noValidate>
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EFF6FF] mb-3">
              <Smartphone className="w-6 h-6 text-[#007BFF]" />
            </div>
            <p className="text-[13px] text-[#68789A]">
              Insira o código do seu aplicativo autenticador ou um código de recuperação.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              id="sa-2fa-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
              placeholder="000000"
              autoComplete="one-time-code"
              maxLength={10}
              className="text-center tracking-[0.25em] font-semibold text-[20px] h-[52px]"
              autoFocus
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={code.length < 6}
              className="w-full text-[16px] font-semibold text-white h-[52px] rounded-[14px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)]"
              style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            >
              {isLoading ? "Verificando..." : "Verificar e Entrar"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError("");
                  setCode("");
                  setAuthStep("password");
                }}
                className="w-full text-[#68789A] hover:text-[#07113F]"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Voltar
              </Button>

              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setIsLoading(true);
                  try {
                    const res = await getSuperadminSetupQrAction(email);
                    if (res.success && res.qrCodeUrl) {
                      setSetupQrUrl(res.qrCodeUrl);
                      if (res.secret) setSetupSecret(res.secret);
                      setAuthStep("2fa_setup");
                    } else {
                      toast.error(res.message || "Não foi possível carregar o QR Code.");
                    }
                  } catch {
                    toast.error("Erro ao carregar o QR Code.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-[13px] font-medium text-[#0A74FF] hover:underline pt-1"
              >
                Precisa ver o QR Code do autenticador?
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── PASSO 2E: Configuração Obrigatória do 2FA (QR Code Compacto) ── */}
      {authStep === "2fa_setup" && (
        <form onSubmit={handlePasswordLogin} className="space-y-3 pt-0.5 animate-in fade-in" noValidate>
          {/* Card do QR Code Branco e Quadrado Otimizado (Aumentado com responsividade) */}
          {setupQrUrl && (
            <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm max-w-[230px] sm:max-w-[245px] mx-auto">
              <div className="bg-white p-1.5 rounded-[12px] border border-[#F1F5F9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setupQrUrl}
                  alt="QR Code Autenticador 2FA"
                  className="w-[145px] h-[145px] sm:w-[155px] sm:h-[155px] object-contain block mx-auto select-none"
                />
              </div>

              {setupSecret && (
                <div className="mt-2 w-full text-center">
                  <div className="flex items-center justify-between gap-1.5 bg-[#F8FAFC] px-2.5 py-1 rounded-[8px] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Chave:</span>
                    <code className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider truncate max-w-[130px] sm:max-w-[145px]">
                      {setupSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupSecret);
                        setCopiedSecret(true);
                        toast.success("Chave copiada!");
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="text-[#64748B] hover:text-[#007BFF] transition-colors p-0.5 rounded hover:bg-white"
                      title="Copiar chave secreta"
                      aria-label="Copiar chave"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="sa-setup-code" className="block text-center text-[12px] font-medium text-[#475569]">
              Digite o código gerado no app:
            </label>
            <Input
              id="sa-setup-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
              placeholder="000000"
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center tracking-[0.25em] font-bold text-[18px] h-[44px]"
              autoFocus
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={code.length < 6}
              className="w-full text-[15px] font-semibold text-white h-[44px] rounded-[12px] border-0 shadow-[0_8px_20px_rgba(63,79,215,0.18)]"
              style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            >
              {isLoading ? "Validando..." : "Validar e Ativar 2FA"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError("");
                setCode("");
                setAuthStep("password");
              }}
              className="w-full h-[34px] text-[13px] text-[#68789A] hover:text-[#07113F]"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Voltar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
