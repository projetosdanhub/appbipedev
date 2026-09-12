"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2, Circle, Loader2 } from "lucide-react";
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
    <div className="flex gap-4 pt-1 px-1">
      <div className={`flex items-center gap-1.5 text-[12px] transition-colors ${hasLength ? "text-emerald-500 font-medium" : "text-slate-400"}`}>
        {hasLength ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        <span>Mínimo 8 caracteres</span>
      </div>
      <div className={`flex items-center gap-1.5 text-[12px] transition-colors ${hasSpecial ? "text-emerald-500 font-medium" : "text-slate-400"}`}>
        {hasSpecial ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        <span>1 especial (ex: !@#$)</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [authStep, setAuthStep] = useState<"choice" | "email" | "success-loading" | "success-done">("choice");
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
            {authStep === "choice" ? "Crie sua conta Grátis!" : "Crie sua conta"}
          </h1>
          <p className="text-[15px] md:text-[16px] text-slate-500 leading-relaxed font-normal">
            {authStep === "choice" 
              ? "Aqui você vende mais, automatiza, facilita e cria relacionamentos pós vendas, tudo em um só lugar."
              : "Preencha seus dados profissionais para iniciar."}
          </p>
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
            Continuar com e-mail
          </Button>

          <div className="flex items-center justify-center py-2">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              — ou —
            </span>
          </div>

          <Button 
            type="button"
            onClick={() => toast.info("Cadastro com Google em breve 🚀")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <GoogleIcon className="h-5 w-5 mr-3" />
            Continuar com Google
          </Button>

          <div className="pt-6 text-center">
            <p className="text-[14px] text-slate-500 font-medium">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Passo 2: Formulário de Email ── */}
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-auth-card-enter w-full" noValidate>
            
            <div className="space-y-3">
              {/* Nome */}
              <FormField control={form.control} name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-name" label="Nome completo"
                        placeholder="Yasmin Araújo"
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
                        id="register-company" label="Nome da empresa"
                        placeholder="Sua empresa"
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
                        id="register-email" label="E-mail profissional" type="email"
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
                        id="register-password" label="Crie uma senha"
                        placeholder="123example@"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password" error={!!fieldState.error}
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
                    {!fieldState.error && <PasswordStrength password={passwordValue} />}
                    <FormMessage className="animate-in fade-in zoom-in-95" />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão principal */}
            <div className="pt-2">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                className="w-full"
              >
                {form.formState.isSubmitting ? "Criando conta..." : (
                  <> Criar minha conta <ArrowRight className="ml-2 h-5 w-5" /> </>
                )}
              </Button>
            </div>

            {/* Termos implícitos */}
            <p className="text-[13px] text-center text-slate-400 pt-2 leading-relaxed px-4">
              Ao criar a conta, você concorda com nossos{" "}
              <Link href="/terms" className="underline hover:text-[#0F172A] transition-colors">Termos de Serviço</Link> e{" "}
              <Link href="/privacy" className="underline hover:text-[#0F172A] transition-colors">Política de Privacidade</Link>.
            </p>
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
