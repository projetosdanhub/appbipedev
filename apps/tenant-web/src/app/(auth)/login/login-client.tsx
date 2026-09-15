"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight, Smartphone, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
} from "@bipesend/ui";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "../_actions/auth";

/* ─── Google icon ─── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginContent() {
  const [authStep, setAuthStep] = useState<"choice" | "email">("choice");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail (ex: seuemail@empresa.com.br)");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleResize = () => {
      setEmailPlaceholder(window.innerWidth < 768 ? "ex: seuemail@empresa.com.br" : "E-mail (ex: seuemail@empresa.com.br)");
    };
    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam === "OAuthAccountNotLinked") {
      toast.error("Este e-mail já está associado a outra conta.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!lockoutUntil) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = lockoutUntil - now;
      if (diff <= 0) {
        setLockoutUntil(null);
        setRemainingTime("");
        setServerError("");
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemainingTime(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onBlur",
  });

  // Função auxiliar para classes dos ícones
  const getIconClass = (val: string | undefined, isTouched: boolean, invalid: boolean) => {
    const base = "h-5 w-5 md:h-[18px] md:w-[18px] transition-colors duration-300";
    if (invalid) return `text-red-500 ${base}`;
    if (val && isTouched) return `text-[#1478FF] ${base}`;
    return `text-[#7F90B2] ${base}`;
  };

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    // Simulate delay for smooth UI feedback
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const response = await loginAction({ ...data, rememberMe, code: requires2FA ? twoFactorCode : undefined });
      console.log("loginAction response:", response);
      if (!response.success) { 
        if (response.message === "2FA_REQUIRED") {
          setRequires2FA(true);
          toast.info("Código de autenticação necessário.");
          return;
        }

        if ((response as any).lockoutUntil) {
          setLockoutUntil((response as any).lockoutUntil);
          setServerError("Conta temporariamente bloqueada por segurança.");
        } else {
          const msg = response.message || "Erro ao realizar login";
          if (requires2FA) {
            setServerError(msg); // Exibe erro do 2FA
          } else {
            setServerError("Confira os dados inseridos.");
          }
        }
        return; 
      }
      toast.success("Bem-vindo de volta! 🎉");
      // Hard redirect to clear any Next.js router cache and ensure the new session is picked up
      const cb = searchParams?.get("callbackUrl") || "/";
      window.location.href = cb;
    } catch {
      setServerError("Erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="auth-content-enter w-full space-y-[24px]">
      
      {/* ── Heading Dinâmico ── */}
      <div className="space-y-2 text-center md:text-left mb-6">
        <h1 className="text-[26px] md:text-[30px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
          {authStep === "choice" ? "Entre na sua conta" : "Entrar com E-mail"}
        </h1>
        <p className="text-[15px] md:text-[16px] text-[#475569] leading-[1.45] font-normal">
          Acesse seu CRM e continue suas conversas com agilidade.
        </p>
      </div>

      {/* ── Erro de servidor / Lockout ── */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-red-600">{serverError}</p>
            {lockoutUntil && (
              <p className="text-[12.5px] text-red-600 mt-1 font-semibold">
                Tente novamente em {remainingTime}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Passo 1: Escolha ── */}
      {authStep === "choice" && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 w-full">
          <Button 
            type="button"
            onClick={() => setAuthStep("email")}
            size="lg"
            className="w-full h-[54px] rounded-[14px] border-0 text-white font-semibold text-[16px] shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
            style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
          >
            <Mail className="mr-2 h-5 w-5" />
            Logar com E-mail e Senha
          </Button>

          <Button 
            type="button"
            onClick={() => {
              toast.info("A autenticação por código é integrada. Use seu e-mail e senha, e pediremos o código caso o 2FA esteja ativado.");
              setAuthStep("email");
            }}
            variant="outline"
            size="lg"
            className="w-full h-[54px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
          >
            <Smartphone className="h-5 w-5 mr-3 text-[#07113F]" />
            <span className="text-[15px]">Login por código</span>
          </Button>
          
          <Button 
            type="button"
            onClick={() => toast.info("Login com Google em breve 🚀")}
            variant="outline"
            size="lg"
            className="w-full h-[54px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
          >
            <GoogleIcon className="h-5 w-5 mr-3" />
            <span className="text-[15px]">Continuar com Google</span>
          </Button>

          {/* Lembrar me (apenas no passo 1) */}
          <div className="pt-2 flex justify-center">
            <label className="flex items-center gap-3 cursor-pointer group relative">
              <div className="relative flex items-center justify-center">
                <input id="rememberMe" type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="peer sr-only" aria-label="Lembrar de mim"
                />
                <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[#DCE5F2] bg-white transition-all peer-checked:border-[#087CF5] peer-checked:bg-[#087CF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#087CF5]/30 group-hover:border-[#087CF5]" />
                <div className={`absolute inset-0 rounded-[5px] bg-[#087CF5] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                <svg className="absolute w-[14px] h-[14px] text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[13px] text-[#475569] font-medium transition-colors select-none">
                Continuar conectado
              </span>
            </label>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[14px] text-[#475569] font-medium">
              Ainda não tem uma conta?{" "}
              <Link href="/register" className="font-semibold text-[#0056D2] hover:text-[#0056D2]/80 transition-colors">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Passo 2: Formulário de Email ── */}
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full" noValidate>
            
            <div className="space-y-3">
              {requires2FA ? (
                <div className="!space-y-2 animate-in fade-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F0F5FF] mb-4">
                      <Smartphone className="w-6 h-6 text-[#0A74FF]" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-[#07113F]">Verificação em Duas Etapas</h3>
                    <p className="text-[14px] text-[#475569] mt-1">
                      Digite o código gerado pelo seu aplicativo autenticador.
                    </p>
                  </div>
                  <Input
                    id="login-code" type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    autoComplete="one-time-code"
                    className="text-center tracking-[0.2em] font-medium text-[18px] h-[50px]"
                  />
                  {serverError && <p className="text-red-500 text-[12px] text-center">{serverError}</p>}
                </div>
              ) : (
                <>
                  {/* E-mail */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                  <FormField control={form.control} name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="!space-y-1">
                        <FormControl>
                          <Input
                            id="login-email" type="email"
                            placeholder={emailPlaceholder}
                            autoComplete="username" error={!!fieldState.error}
                            leftIcon={<Mail className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                            className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  </div>

                  {/* Senha */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                  <FormField control={form.control} name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="!space-y-1">
                        <FormControl>
                          <Input
                            id="login-password"
                            placeholder="Sua senha"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password" error={!!fieldState.error}
                            leftIcon={<Lock className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                            className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                            rightIcon={
                              <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="text-[#7F90B2] hover:text-[#079CF5] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#079CF5]"
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            }
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  </div>
                  
                  <div className="flex justify-end pt-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                    <Link href="/forgot-password"
                      className="text-[13px] font-medium text-[#0056D2] hover:opacity-80 transition-opacity"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Botão principal */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                disabled={!!lockoutUntil || (requires2FA && twoFactorCode.length < 6)}
                className="w-full text-[17px] font-semibold text-white h-[52px] rounded-[14px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
                style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
              >
                {form.formState.isSubmitting ? "Entrando..." : (requires2FA ? "Verificar código" : "Entrar")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {requires2FA && (
                <Button type="button" variant="ghost" onClick={() => { setRequires2FA(false); setServerError(""); }} className="w-full mt-2 text-[#475569]">
                  Voltar
                </Button>
              )}
            </div>
            
            {/* Termos rodapé */}
            <div className="pt-3 pb-1 text-center">
              <p className="text-[12px] text-[#475569] leading-relaxed">
                Ao entrar, você concorda com nossos{" "}
                <Link href="/terms" className="text-[#0056D2] hover:underline font-medium transition-colors">Termos de Serviço</Link> e{" "}
                <Link href="/privacy" className="text-[#0056D2] hover:underline font-medium transition-colors">Política de Privacidade</Link>.
              </p>
            </div>

            <div className="pt-1 text-center">
              <p className="text-[14px] text-[#475569] font-medium">
                Crie sua conta agora!{" "}
                <Link href="/register" className="font-semibold text-[#0056D2] hover:text-[#0056D2]/80 transition-colors">
                  Criar Conta
                </Link>
              </p>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#007BFF]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
