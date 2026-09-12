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

export default function LoginPage() {
  const [authStep, setAuthStep] = useState<"choice" | "email">("choice");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const router = useRouter();

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
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    try {
      const response = await loginAction({ ...data, rememberMe });
      if (!response.success) { 
        if ((response as any).lockoutUntil) {
          setLockoutUntil((response as any).lockoutUntil);
          setServerError("Conta temporariamente bloqueada por segurança.");
        } else {
          // Set form error so it appears inside the field
          const msg = response.message || "Erro ao realizar login";
          form.setError("email", { message: msg });
          form.setError("password", { message: msg });
        }
        return; 
      }
      toast.success("Bem-vindo de volta! 🎉");
      router.push("/");
    } catch {
      form.setError("email", { message: "Erro inesperado ao conectar ao servidor." });
    }
  };

  return (
    <div className="auth-content-enter w-full space-y-6">
      
      {/* ── Heading Dinâmico ── */}
      <div className="space-y-2">
        {authStep === "email" && (
          <button 
            type="button" 
            onClick={() => setAuthStep("choice")}
            className="flex items-center text-[14px] font-medium text-slate-500 hover:text-[#0F172A] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar
          </button>
        )}
        <h1 className="text-[20px] md:text-[24px] font-bold text-[#0F172A] tracking-tight leading-[28px] md:leading-[30px]">
          {authStep === "choice" ? "Então você voltou! Acesse sua conta abaixo." : "Acessar com E-mail"}
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 leading-relaxed font-normal">
          {authStep === "choice" 
            ? "Escolha a forma que deseja acessar sua conta na BipeSend."
            : "Preencha seus dados para entrar."}
        </p>
      </div>

      {/* ── Erro de servidor / Lockout ── */}
      {serverError && lockoutUntil && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-[var(--color-danger-600)] flex-shrink-0" />
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-[var(--color-danger-600)]">{serverError}</p>
            {lockoutUntil && (
              <p className="text-[12.5px] text-[var(--color-danger-600)] mt-1 font-semibold">
                Tente novamente em {remainingTime}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Passo 1: Escolha ── */}
      {authStep === "choice" && (
        <div className="space-y-4 animate-auth-card-enter w-full">
          <Button 
            type="button"
            onClick={() => setAuthStep("email")}
            variant="outline"
            size="lg"
            className="w-full text-[#007BFF] border-[#007BFF] hover:bg-blue-50"
          >
            <Mail className="h-5 w-5 mr-2" />
            Login com e-mail e senha
          </Button>

          <div className="flex items-center justify-center py-2">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              — ou —
            </span>
          </div>

          <Button 
            type="button"
            onClick={() => toast.info("Login com Google em breve 🚀")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <GoogleIcon className="h-5 w-5 mr-3" />
            Login com Google
          </Button>

          <div className="pt-5">
            <Link href="/register" className="block w-full">
              <Button type="button" size="lg" className="w-full">
                <span className="hidden sm:inline">Cresça com a BipeSend - </span>Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Passo 2: Formulário de Email ── */}
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-auth-card-enter w-full" noValidate>
            
            <div className="space-y-4">
              {/* E-mail */}
              <FormField control={form.control} name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="login-email" label="E-mail" type="email"
                        placeholder="seuemail@provedor.com.br"
                        autoComplete="email" error={!!fieldState.error}
                        leftIcon={<Mail className="h-5 w-5" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />

              {/* Senha */}
              <FormField control={form.control} name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="login-password" label="Senha"
                        placeholder="123example@"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password" error={!!fieldState.error}
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="text-slate-400 hover:text-[#007BFF] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />
            </div>

            {/* Lembrar + Esqueci */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group relative">
                <div className="relative flex items-center justify-center">
                  <input id="rememberMe" type="checkbox" checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="peer sr-only" aria-label="Lembrar de mim"
                  />
                  <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-300 bg-white transition-all peer-checked:border-[#007BFF] peer-checked:bg-[#007BFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#007BFF]/30 group-hover:border-[#007BFF]" />
                  <div className={`absolute inset-0 rounded-full bg-[#007BFF] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-[14px] text-slate-500 group-hover:text-[#0F172A] transition-colors select-none font-medium">
                  Lembrar de mim
                </span>
              </label>
              <Link href="/forgot-password"
                className="text-[14px] font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors"
              >
                Esqueci a senha
              </Link>
            </div>

            {/* Botão principal */}
            <div className="pt-4">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                disabled={!!lockoutUntil}
                className="w-full"
              >
                {form.formState.isSubmitting ? "Entrando..." : (
                  <> Entrar no BipeSend <ArrowRight className="ml-2 h-5 w-5" /> </>
                )}
              </Button>
            </div>

            {/* Termos rodapé */}
            <p className="text-[13px] text-center text-slate-400 pt-2 leading-relaxed px-4">
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
