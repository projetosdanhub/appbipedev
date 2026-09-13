"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
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
    <div className="auth-content-enter w-full space-y-[28px]">
      
      {/* ── Heading Dinâmico ── */}
      <div className="space-y-2.5 text-center">
        <h1 className="text-[30px] md:text-[34px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
          Entre na sua conta
        </h1>
        <p className="text-[16px] md:text-[18px] text-[#68789A] leading-[1.45] font-normal">
          Acesse seu CRM e continue suas conversas com agilidade.
        </p>
      </div>

      {/* ── Erro de servidor / Lockout ── */}
      {serverError && lockoutUntil && (
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

      {/* ── Formulário Principal ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-auth-card-enter w-full" noValidate>
          
          <div className="space-y-4">
            {/* E-mail */}
            <FormField control={form.control} name="email"
              render={({ field, fieldState }) => (
                <FormItem className="!space-y-2">
                  <FormControl>
                    <Input
                      id="login-email" label="E-mail" type="email"
                      placeholder="seuemail@empresa.com.br"
                      autoComplete="username" error={!!fieldState.error}
                      leftIcon={<Mail className="h-5 w-5 text-[#7F90B2]" />}
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
                <FormItem className="!space-y-2 mt-[18px]">
                  <FormControl>
                    <Input
                      id="login-password" label="Senha"
                      placeholder="Ex.: MinhaSenha@123"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password" error={!!fieldState.error}
                      leftIcon={<Lock className="h-5 w-5 text-[#7F90B2]" />}
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
                  <FormMessage className="animate-in fade-in zoom-in-95" />
                </FormItem>
              )}
            />
          </div>

          {/* Lembrar + Esqueci */}
          <div className="flex items-center justify-between pt-4 mt-[16px]">
            <label className="flex items-center gap-2.5 cursor-pointer group relative">
              <div className="relative flex items-center justify-center">
                <input id="rememberMe" type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="peer sr-only" aria-label="Lembrar de mim"
                />
                <div className="w-[22px] h-[22px] rounded-md border-2 border-[#DCE5F2] bg-white transition-all peer-checked:border-[#087CF5] peer-checked:bg-[#087CF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#087CF5]/30 group-hover:border-[#087CF5]" />
                <div className={`absolute inset-0 rounded-md bg-[#087CF5] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                <svg className="absolute w-4 h-4 text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[15px] text-[#07113F] font-medium transition-colors select-none">
                Continuar conectado
              </span>
            </label>
            <Link href="/forgot-password"
              className="text-[15px] font-medium text-[#0A74FF] hover:opacity-80 transition-opacity"
            >
              Recuperar senha
            </Link>
          </div>

          {/* Botão principal */}
          <div className="mt-[20px]">
            <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
              disabled={!!lockoutUntil}
              className="w-full text-[16px] md:text-[18px] font-semibold text-white h-[56px] rounded-[16px] border-0 shadow-[0_10px_24px_rgba(50,80,220,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
              style={{ background: "linear-gradient(100deg, #079CF5 0%, #1478FF 38%, #5759F5 70%, #A827F5 100%)" }}
            >
              {form.formState.isSubmitting ? "Entrando..." : "Entrar com e-mail e senha"}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Button>
          </div>

          <div className="text-center mt-[20px]">
            <p className="text-[15px] md:text-[16px] text-[#68789A] font-medium">
              Ainda não tem uma conta?{" "}
              <Link href="/register" className="font-semibold text-[#0A74FF] hover:opacity-80 transition-opacity">
                Criar conta
              </Link>
            </p>
          </div>

          {/* Divisor OU */}
          <div className="flex items-center justify-center mt-[20px] py-2">
            <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
            <span className="px-4 text-[14px] text-[#8E9AB4] font-medium">
              ou
            </span>
            <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
          </div>

          <div className="mt-[10px] pb-6">
            <Button 
              type="button"
              onClick={() => toast.info("Login com Google em breve 🚀")}
              variant="outline"
              size="lg"
              className="w-full h-[52px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-slate-50 transition-colors"
            >
              <GoogleIcon className="h-5 w-5 mr-3" />
              Google
            </Button>
          </div>

          {/* Termos rodapé */}
          <p className="text-[13px] text-center text-[#8E9AB4] pt-2 leading-relaxed px-4">
            Ao entrar, você concorda com nossos{" "}
            <Link href="/terms" className="text-[#0A74FF] hover:underline font-medium transition-colors">Termos de Serviço</Link> e{" "}
            <Link href="/privacy" className="text-[#0A74FF] hover:underline font-medium transition-colors">Política de Privacidade</Link>.
          </p>
        </form>
      </Form>
    </div>
  );
}
