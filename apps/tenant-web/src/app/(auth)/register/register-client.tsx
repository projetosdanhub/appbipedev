"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, CheckCircle2, Circle, Loader2, Shield, ArrowRight, ArrowLeft } from "lucide-react";
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
  const hasLength = p.length >= 9;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
  
  let score = 0;
  if (p.length > 0) score = 1;
  if (hasLength || hasSpecial) score = 2;
  if (hasLength && hasSpecial) score = 3;
  
  return (
    <div className="flex flex-col gap-2 pt-1.5 px-1 w-full">
      {/* Barra de força fina */}
      <div className="flex items-center gap-1.5 w-full">
        <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 1 ? (score === 3 ? 'bg-[#10B981]' : score === 2 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]') : 'bg-[#E2E8F0]'}`} />
        <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 2 ? (score === 3 ? 'bg-[#10B981]' : 'bg-[#F59E0B]') : 'bg-[#E2E8F0]'}`} />
        <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 3 ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`} />
      </div>
      {/* Textos de requisitos */}
      <div className="relative flex items-center w-full h-[18px]">
        <div className={`absolute left-0 text-[11.5px] whitespace-nowrap transition-colors duration-300 ${hasLength ? "text-[#10B981] font-medium" : "text-[#8E9AB4]"}`}>
          Mínimo 9 caracteres
        </div>
        <div className={`ml-auto text-[11.5px] whitespace-nowrap transition-colors duration-300 ${hasSpecial ? "text-[#10B981] font-medium" : "text-[#8E9AB4]"}`}>
          1 especial (ex: !@#)
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [authStep, setAuthStep] = useState<"choice" | "email" | "success-loading" | "success-done">("choice");
  const [serverError, setServerError] = useState("");
  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail (ex: seuemail@empresa.com.br)");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setEmailPlaceholder(window.innerWidth < 768 ? "ex: seuemail@empresa.com.br" : "E-mail (ex: seuemail@empresa.com.br)");
    };
    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", companyName: "", email: "", password: "" },
    mode: "onBlur",
  });

  // Função auxiliar para classes dos ícones
  const getIconClass = (val: string | undefined, isTouched: boolean, invalid: boolean) => {
    const base = "h-5 w-5 md:h-[18px] md:w-[18px] transition-colors duration-300";
    if (invalid) return `text-red-500 ${base}`;
    if (val && isTouched) return `text-[#1478FF] ${base}`;
    return `text-[#7F90B2] ${base}`;
  };

  const passwordValue = form.watch("password");

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    try {
      const response = await registerAction(data);
      if (!response.success) { 
        setServerError("Confira os dados inseridos.");
        return; 
      }
      
      setAuthStep("success-loading");
      
      setTimeout(async () => {
        setAuthStep("success-done");
        
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false
        });

        setTimeout(() => {
          router.push("/");
        }, 1500);
      }, 800);
    } catch {
      setServerError("Erro inesperado ao conectar ao servidor.");
    }
  };

  const isSuccessView = authStep === "success-loading" || authStep === "success-done";

  return (
    <div className="auth-content-enter w-full space-y-4">
      {/* ── Heading Dinâmico ── */}
      {!isSuccessView && (
        <div className="space-y-2 text-center md:text-left mb-6">
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
            {authStep === "choice" ? "Crie sua conta" : "Cadastro"}
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#68789A] leading-[1.45] font-normal">
            Em apenas um Bipe você organiza tudo, aumenta as vendas e cresce o seu negócio.
          </p>
        </div>
      )}

      {/* ── Erro de servidor ── */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-red-600">{serverError}</p>
          </div>
        </div>
      )}

      {/* ── Passo 1: Escolha ── */}
      {authStep === "choice" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
          <Button 
            type="button"
            onClick={() => setAuthStep("email")}
            size="lg"
            className="w-full h-[54px] rounded-[14px] border-0 text-white font-semibold text-[16px] shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
            style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
          >
            <Mail className="mr-2 h-5 w-5 text-white" />
            Cadastrar com E-mail
          </Button>
          
          <div className="w-full flex items-center justify-center py-2 px-4">
            <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
            <span className="px-4 text-[13px] text-[#8E9AB4] font-medium">ou</span>
            <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
          </div>
          
          <Button 
            type="button"
            onClick={() => toast.info("Cadastro com Google em breve 🚀")}
            variant="outline"
            size="lg"
            className="w-full h-[54px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
          >
            <GoogleIcon className="h-5 w-5 mr-3" />
            <span className="text-[15px]">Continuar com Google</span>
          </Button>

          {/* Termos rodapé */}
          <div className="pt-4 text-center px-2">
            <p className="text-[12px] md:text-[13px] text-[#68789A] leading-relaxed">
              Ao criar a conta, você concorda com nossos{" "}
              <Link href="/terms" className="text-[#0A74FF] hover:underline transition-colors font-medium">Termos de Serviço</Link> e{" "}
              <Link href="/privacy" className="text-[#0A74FF] hover:underline transition-colors font-medium">Política de Privacidade</Link>.
            </p>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[14px] text-[#6E7D9E] font-medium">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-semibold text-[#0A74FF] hover:text-[#0A74FF]/80 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Passo 2: Formulário de Email ── */}
      {authStep === "email" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full" noValidate>
            
            <div className="space-y-3">
              {/* Nome */}
              <FormField control={form.control} name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-name"
                        placeholder="Nome completo"
                        autoComplete="name" error={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        leftIcon={<User className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                        className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Nome da Empresa */}
              <FormField control={form.control} name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-company"
                        placeholder="Nome da empresa (opcional)"
                        autoComplete="organization" error={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        leftIcon={<Building className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                        className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* E-mail */}
              <FormField control={form.control} name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-email" type="email"
                        placeholder={emailPlaceholder}
                        autoComplete="email" error={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        leftIcon={<Mail className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                        className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Senha */}
              <FormField control={form.control} name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="register-password"
                        placeholder="Crie uma senha forte"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password" error={!!fieldState.error}
                        leftIcon={<Lock className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                        className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
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
                    <PasswordStrength password={passwordValue} />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão principal */}
            <div className="pt-2">
              <Button type="submit" isLoading={form.formState.isSubmitting} size="lg"
                className="w-full h-[52px] rounded-[14px] border-0 text-white font-semibold text-[16px] shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
                style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
              >
                {form.formState.isSubmitting ? "Criando conta..." : (
                  <span className="flex items-center gap-2">
                    Criar conta
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </span>
                )}
              </Button>
            </div>
            
            {/* Termos rodapé simplificado na etapa 2 */}
            <div className="pt-3 pb-1 text-center">
              <p className="text-[12px] text-[#68789A]">
                Ao continuar, você aceita nossos <Link href="/terms" className="text-[#0A74FF] hover:underline">Termos</Link>.
              </p>
            </div>
            
            <div className="pt-1 text-center">
              <p className="text-[14px] text-[#6E7D9E] font-medium">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-semibold text-[#0A74FF] hover:text-[#0A74FF]/80 transition-colors">
                  Entrar
                </Link>
              </p>
            </div>
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
