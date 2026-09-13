"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@bipesend/ui";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "../_actions/auth";

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

/* ─── Password Strength Indicator ─── */
function PasswordStrength({ password }: { password?: string }) {
  const p = password || "";
  const hasLength = p.length >= 8;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
  
  return (
    <div className="flex items-center gap-6 pt-1 px-1">
      <div className={`flex items-center gap-2 text-[14px] transition-colors ${hasLength ? "text-[#1478FF] font-medium" : "text-[#8E9AB4]"}`}>
        {hasLength ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        <span>Mínimo 8 caracteres</span>
      </div>
      <div className={`flex items-center gap-2 text-[14px] transition-colors ${hasSpecial ? "text-[#1478FF] font-medium" : "text-[#8E9AB4]"}`}>
        {hasSpecial ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        <span>1 especial</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [authStep, setAuthStep] = useState<"form" | "success-loading" | "success-done">("form");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", companyName: "", email: "", password: "" },
    mode: "onTouched",
  });

  const passwordValue = form.watch("password");

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await registerAction(data);
      if (!response.success) { 
        form.setError("email", { message: response.message || "Erro ao realizar cadastro" });
        return; 
      }
      
      setAuthStep("success-loading");
      
      setTimeout(() => {
        setAuthStep("success-done");
        
        setTimeout(() => {
          router.push("/login"); // in a real app this might go directly to dashboard or login
        }, 1500);
      }, 800);
    } catch {
      form.setError("email", { message: "Erro inesperado ao conectar ao servidor." });
    }
  };

  const isSuccessView = authStep === "success-loading" || authStep === "success-done";

  return (
    <div className="auth-content-enter w-full space-y-4">

      {/* ── Heading Dinâmico ── */}
      {!isSuccessView && (
        <div className="space-y-2 text-center md:text-left mb-6">
          <h1 className="text-[30px] md:text-[34px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
            Crie sua conta
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#68789A] leading-[1.45] font-normal">
            Comece com a BipeSend e centralize seu atendimento em um só lugar.
          </p>
        </div>
      )}

      {/* ── Formulário de Email ── */}
      {authStep === "form" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-auth-card-enter w-full" noValidate>
            
            <div className="space-y-4">
              {/* Nome */}
              <FormField control={form.control} name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-name" label="Nome completo"
                        placeholder="Ex.: Yasmin Araújo"
                        autoComplete="name" error={!!fieldState.error}
                        leftIcon={<User className="h-5 w-5" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />

              {/* Nome da Empresa */}
              <FormField control={form.control} name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-company" label="Nome da empresa (opcional)"
                        placeholder="Ex.: Sua empresa"
                        autoComplete="organization" error={!!fieldState.error}
                        leftIcon={<Building className="h-5 w-5" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />

              {/* E-mail */}
              <FormField control={form.control} name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-email" label="E-mail" type="email"
                        placeholder="seuemail@empresa.com.br"
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
                        id="register-password" label="Senha"
                        placeholder="Ex.: MinhaSenha@123"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password" error={!!fieldState.error}
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="text-[#8E9AB4] hover:text-[#07113F] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1478FF]/30"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        }
                        {...field}
                      />
                    </FormControl>
                    {!fieldState.error && <PasswordStrength password={passwordValue} />}
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão principal */}
            <div className="pt-3">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                className="w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#079CF5] via-[#1478FF] to-[#A827F5] border-0 text-white font-semibold text-[16px] shadow-[0_10px_24px_rgba(50,80,220,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
              >
                {form.formState.isSubmitting ? "Criando conta..." : (
                  <span className="flex items-center gap-2">
                    Criar conta
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </Button>
            </div>

            {/* Termos implícitos */}
            <div className="pt-4 text-center px-2">
              <p className="text-[13px] text-[#8E9AB4] leading-relaxed">
                Ao criar a conta, você concorda com nossos <br className="hidden md:block" />
                <Link href="/terms" className="text-[#0A74FF] hover:underline font-medium transition-colors">Termos de Serviço</Link> e <Link href="/privacy" className="text-[#0A74FF] hover:underline font-medium transition-colors">Política de Privacidade</Link>.
              </p>
            </div>

            {/* Login Link */}
            <div className="pt-1 pb-2 text-center">
              <p className="text-[14px] text-[#6E7D9E] font-medium">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-semibold text-[#0A74FF] hover:text-[#0A74FF]/80 transition-colors">
                  Entrar
                </Link>
              </p>
            </div>

            {/* Divisor OU */}
            <div className="flex items-center justify-center py-2">
              <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
              <span className="px-4 text-[14px] text-[#8E9AB4] font-medium">
                ou
              </span>
              <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
            </div>

            <Button 
              type="button"
              onClick={() => toast.info("Cadastro com Google em breve 🚀")}
              variant="outline"
              size="lg"
              className="w-full h-[52px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-slate-50 transition-colors"
            >
              <GoogleIcon className="h-5 w-5 mr-3" />
              Google
            </Button>
          </form>
        </Form>
      )}

      {/* ── Passo 3: Sucesso Animado ── */}
      {isSuccessView && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 duration-500 fade-in slide-in-from-bottom-4">
          <div className="relative flex items-center justify-center w-24 h-24">
            {authStep === "success-loading" ? (
              <Loader2 className="w-12 h-12 text-[#007BFF] animate-spin" />
            ) : (
              <>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative flex items-center justify-center w-full h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in duration-300 delay-150" />
                </div>
              </>
            )}
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-[24px] font-bold text-[#0F172A] animate-in slide-in-from-bottom-2 fade-in">
              {authStep === "success-loading" ? "Criando ambiente..." : "Bem-vindo!"}
            </h2>
            <p className="text-[14px] text-slate-500 animate-in slide-in-from-bottom-2 fade-in delay-75">
              {authStep === "success-loading" ? "Preparando tudo para você." : "Conta criada com sucesso."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
