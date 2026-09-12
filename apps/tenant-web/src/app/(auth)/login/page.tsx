"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "../_actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");

    try {
      const response = await loginAction(data);
      
      if (!response.success) {
        setError(response.message || "Erro ao realizar login");
        return;
      }
      
      toast.success(response.message);
      router.push("/");
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="w-full animate-auth-content">
      {/* Segmented tabs */}
      <div className="flex bg-[var(--color-surface-50)] rounded-[12px] p-1 mb-8 border border-[var(--color-border-200)]/60">
        <div className="flex-1 py-2.5 text-center text-[14px] font-semibold text-[var(--color-ink-900)] bg-white rounded-[10px] shadow-sm cursor-default transition-all duration-200">
          Login
        </div>
        <Link
          href="/register"
          className="flex-1 py-2.5 text-center text-[14px] font-medium text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] rounded-[10px] transition-all duration-200"
        >
          Cadastro
        </Link>
      </div>

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[30px] font-bold text-[var(--color-ink-900)] tracking-tight leading-tight mb-1.5">
          Bem-vindo de volta
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] leading-relaxed">
          Entre na sua conta para continuar no BipeSend.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive" className="animate-error-enter">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="seuemail@empresa.com.br" 
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
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
            size="lg"
          >
            {form.formState.isSubmitting ? (
              "Entrando..."
            ) : (
              <>
                Entrar no BipeSend
                <ArrowRight className="w-[18px] h-[18px] ml-1 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)]">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Criar minha conta
        </Link>
      </p>
    </div>
  );
}
