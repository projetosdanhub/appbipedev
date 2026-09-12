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
      
      <p className="mt-6 text-center text-[14px] text-[var(--color-ink-600)]">
        Já possui uma conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
