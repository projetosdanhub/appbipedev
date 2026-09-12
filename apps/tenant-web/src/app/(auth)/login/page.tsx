"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
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

/* ─── Input com label flutuante ─── */
function FloatingInput({
  id, label, type = "text", autoComplete,
  leftIcon, rightSlot, error, errorMessage, ...props
}: {
  id: string; label: string; type?: string; autoComplete?: string;
  leftIcon: React.ReactNode; rightSlot?: React.ReactNode; error?: boolean;
  errorMessage?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean((props.value as string)?.length);
  const lifted = focused || hasValue;

  return (
    <div className="relative">
      <span
        className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150
          ${lifted ? "text-[#007BFF]" : "text-slate-400"}`}
      >
        {leftIcon}
      </span>

      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error ? true : undefined}
        placeholder=" "
        className={[
          "peer w-full h-[48px] md:h-[52px] rounded-xl border bg-white/80",
          "pl-10 md:pl-11 pt-4 md:pt-5 pb-1",
          rightSlot ? "pr-10 md:pr-11" : "pr-4",
          "text-[13.5px] md:text-[14px] text-[#0F172A] outline-none transition-all duration-200",
          error
            ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
            : "border-slate-200/80 focus:border-[#007BFF] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.10)]",
        ].join(" ")}
        {...props}
      />

      <label
        htmlFor={id}
        className={[
          "absolute left-10 md:left-11 pointer-events-none select-none transition-all duration-150",
          lifted
            ? "top-[6px] md:top-[8px] text-[9.5px] md:text-[10.5px] font-semibold tracking-wide"
            : "top-1/2 -translate-y-1/2 text-[13px] md:text-[13.5px]",
          error ? "text-red-400" : lifted ? "text-[#007BFF]" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </label>

      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [authStep, setAuthStep] = useState<"choice" | "email">("choice");
  const [serverError, setServerError] = useState("");
  const [globalValidationError, setGlobalValidationError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!lockoutUntil) return;

    // Função para atualizar o timer
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

    updateTimer(); // Atualiza instantaneamente ao invés de esperar 1s
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  });

  useEffect(() => {
    const firstError = Object.values(form.formState.errors)[0];
    if (firstError?.message) {
      setGlobalValidationError(firstError.message as string);
      const t = setTimeout(() => setGlobalValidationError(""), 3000);
      return () => clearTimeout(t);
    } else {
      setGlobalValidationError("");
    }
  }, [form.formState.errors]);

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    try {
      // @ts-ignore - lockoutUntil may exist in the response
      const response = await loginAction({ ...data, rememberMe });
      if (!response.success) { 
        if ((response as any).lockoutUntil) {
          setLockoutUntil((response as any).lockoutUntil);
          setServerError("Conta temporariamente bloqueada por segurança.");
        } else {
          setServerError(response.message || "Erro ao realizar login"); 
        }
        return; 
      }
      toast.success("Bem-vindo de volta! 🎉");
      router.push("/");
    } catch {
      setServerError("Erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="auth-content-enter space-y-6">
      
      {/* ── Heading Dinâmico ── */}
      <div className="space-y-1.5">
        {authStep === "email" && (
          <button 
            type="button" 
            onClick={() => setAuthStep("choice")}
            className="flex items-center text-[13px] font-medium text-slate-500 hover:text-[#0F172A] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar
          </button>
        )}
        <h1 className="text-[22px] md:text-[26px] font-bold text-[#0F172A] leading-snug">
          {authStep === "choice" ? "Então você voltou! Acesse sua conta abaixo." : "Acessar com E-mail"}
        </h1>
        <p className="text-[13px] md:text-[14px] text-slate-500 leading-relaxed">
          {authStep === "choice" 
            ? "Escolha a forma que deseja acessar sua conta na BipeSend."
            : "Preencha seus dados para entrar."}
        </p>
      </div>

      <div className="h-6 flex items-start -mt-2">
        {globalValidationError && (
          <p className="text-[13px] font-medium text-red-500 animate-in fade-in zoom-in-95 duration-200">
            {globalValidationError}
          </p>
        )}
      </div>

      {/* ── Erro de servidor / Lockout ── */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-red-600">{serverError}</p>
            {lockoutUntil && (
              <p className="text-[12.5px] text-red-500 mt-1 font-semibold">
                Tente novamente em {remainingTime}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Passo 1: Escolha ── */}
      {authStep === "choice" && (
        <div className="space-y-4 animate-auth-card-enter">
          <Button 
            type="button"
            onClick={() => setAuthStep("email")}
            variant="outline"
            className="w-full h-[48px] md:h-[52px] rounded-full text-[13.5px] md:text-[14.5px] font-semibold bg-white border-[#007BFF] text-[#007BFF] hover:bg-blue-50 justify-center shadow-sm transition-all"
          >
            <Mail className="h-[18px] w-[18px] md:h-5 md:w-5 mr-2" />
            Login com e-mail e senha
          </Button>

          <div className="flex items-center justify-center py-1">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              — ou —
            </span>
          </div>

          <Button 
            type="button"
            onClick={() => toast.info("Login com Google em breve 🚀")}
            variant="outline"
            className="w-full h-[48px] md:h-[52px] rounded-full text-[13.5px] md:text-[14.5px] font-semibold bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50 hover:border-[#4285F4]/40 hover:text-[#0F172A] justify-center shadow-sm transition-all"
          >
            <GoogleIcon className="h-[18px] w-[18px] md:h-5 md:w-5 mr-2 md:mr-3" />
            Login com Google
          </Button>

          <div className="pt-4">
            <Link href="/register" className="block w-full">
              <Button type="button" className="w-full h-[48px] md:h-[52px] rounded-xl text-[13.5px] md:text-[14.5px] font-semibold bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069e0] hover:to-[#5355e8] text-white shadow-[0_4px_20px_rgba(0,123,255,0.25)] hover:shadow-[0_6px_28px_rgba(0,123,255,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] border-0">
                Cresça com a BipeSend - Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Passo 2: Formulário de Email ── */}
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-auth-card-enter" noValidate>
            
            <div className="space-y-4">
              {/* E-mail */}
              <FormField control={form.control} name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1.5">
                    <FormControl>
                      <FloatingInput
                        id="login-email" label="E-mail" type="email"
                        autoComplete="email" error={!!fieldState.error} errorMessage={fieldState.error?.message}
                        leftIcon={<Mail className="h-[17px] w-[17px]" />}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Senha */}
              <FormField control={form.control} name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1.5">
                    <FormControl>
                      <FloatingInput
                        id="login-password" label="Senha"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password" error={!!fieldState.error} errorMessage={fieldState.error?.message}
                        leftIcon={<Lock className="h-[17px] w-[17px]" />}
                        rightSlot={
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="text-slate-400 hover:text-[#007BFF] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                          </button>
                        }
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Lembrar + Esqueci */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input id="rememberMe" type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="auth-checkbox" aria-label="Lembrar de mim"
                />
                <span className="text-[13px] text-slate-500 group-hover:text-[#0F172A] transition-colors select-none">
                  Lembrar de mim
                </span>
              </label>
              <Link href="/forgot-password"
                className="text-[13px] font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors"
              >
                Esqueci a senha
              </Link>
            </div>

            {/* Botão principal */}
            <div className="pt-2">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                disabled={!!lockoutUntil}
                className="w-full h-[48px] md:h-[52px] rounded-xl text-[13.5px] md:text-[14.5px] font-semibold
                  bg-gradient-to-r from-[#007BFF] to-[#6366F1]
                  hover:from-[#0069e0] hover:to-[#5355e8]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-white border-0
                  shadow-[0_4px_20px_rgba(0,123,255,0.30)]
                  hover:shadow-[0_6px_28px_rgba(0,123,255,0.40)]
                  transition-all duration-300 hover:scale-[1.015] active:scale-[0.985]"
              >
                {form.formState.isSubmitting ? "Entrando..." : (
                  <> Entrar no BipeSend <ArrowRight className="ml-1.5 md:ml-2 h-4 w-4 md:h-[17px] md:w-[17px]" /> </>
                )}
              </Button>
            </div>

            {/* Termos rodapé */}
            <p className="text-[12px] text-center text-slate-400 pt-2 leading-relaxed px-4">
              Ao entrar, você concorda com nossos{" "}
              <Link href="/terms" className="underline hover:text-[#0F172A] transition-colors">Termos de Serviço</Link> e{" "}
              <Link href="/privacy" className="underline hover:text-[#0F172A] transition-colors">Política de Privacidade</Link>.
            </p>
          </form>
        </Form>
      )}
    </div>
  );
}
