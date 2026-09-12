"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  Alert,
  AlertDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@bipesend/ui";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "../_actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");

    try {
      const response = await registerAction({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
      
      if (!response.success) {
        setError(response.message || "Erro ao criar conta");
        return;
      }
      
      toast.success(response.message);
      router.push("/login");
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="w-full animate-auth-content">
      {/* Segmented tabs */}
      <div className="flex bg-[var(--color-surface-50)] rounded-[12px] p-1 mb-8 border border-[var(--color-border-200)]/60">
        <Link
          href="/login"
          className="flex-1 py-2.5 text-center text-[14px] font-medium text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] rounded-[10px] transition-all duration-200"
        >
          Login
        </Link>
        <div className="flex-1 py-2.5 text-center text-[14px] font-semibold text-[var(--color-ink-900)] bg-white rounded-[10px] shadow-sm cursor-default transition-all duration-200">
          Cadastro
        </div>
      </div>

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[var(--color-ink-900)] tracking-tight leading-tight mb-1.5">
          Comece a crescer com o BipeSend
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] leading-relaxed">
          Crie sua conta para organizar seu atendimento, prospecção e operação em um só lugar.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive" className="animate-error-enter">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex.: Ana Silva" 
                    autoComplete="name"
                    leftIcon={<User className="h-[18px] w-[18px]" />}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail profissional</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Ex.: ana@seudominio.com" 
                    autoComplete="email"
                    leftIcon={<Mail className="h-[18px] w-[18px]" />}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-[18px] w-[18px]" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-[var(--color-ink-900)] transition-colors p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-600)] rounded-md"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        tabIndex={0}
                      >
                        {showPassword ? (
                          <EyeOff className="w-[18px] h-[18px]" />
                        ) : (
                          <Eye className="w-[18px] h-[18px]" />
                        )}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <p className="text-[13px] text-[var(--color-ink-600)] mt-1">
                  mínimo de 8 caracteres
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-[18px] w-[18px]" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-[var(--color-ink-900)] transition-colors p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-600)] rounded-md"
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                        tabIndex={0}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-[18px] h-[18px]" />
                        ) : (
                          <Eye className="w-[18px] h-[18px]" />
                        )}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3 pt-1">
                  <FormControl>
                    <input
                      id="terms"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="auth-checkbox mt-0.5"
                      aria-label="Aceitar os termos de serviço e política de privacidade"
                    />
                  </FormControl>
                  <label htmlFor="terms" className="text-[13px] text-[var(--color-ink-600)] cursor-pointer leading-relaxed select-none">
                    Eu concordo com os{" "}
                    <Link href="/terms" className="text-[var(--color-brand-600)] hover:underline font-medium">Termos de Serviço</Link>
                    {" "}e a{" "}
                    <Link href="/privacy" className="text-[var(--color-brand-600)] hover:underline font-medium">Política de Privacidade</Link>.
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-1">
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full"
              size="lg"
            >
              {form.formState.isSubmitting ? (
                "Criando conta..."
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="w-[18px] h-[18px] ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 flex items-center justify-center space-x-3">
        <div className="h-px bg-[var(--color-border-200)] flex-1" />
        <span className="text-[13px] text-[var(--color-ink-400)] font-medium uppercase tracking-wide">ou</span>
        <div className="h-px bg-[var(--color-border-200)] flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full mt-6 font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)] border-[var(--color-border-300)]"
        size="lg"
        onClick={() => toast.info("Login com Google ainda em desenvolvimento")}
      >
        <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Criar com Google
      </Button>
      
      <p className="mt-6 text-center text-[14px] text-[var(--color-ink-600)]">
        Já possui uma conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
