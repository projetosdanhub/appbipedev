"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, AlertTriangle } from "lucide-react";
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

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPasswordAction } from "../../_actions/auth";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  // const email = searchParams.get('email') || "";
  // const token = searchParams.get('token') || "";
  
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: "", color: "bg-gray-200" };
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score === 2) return { score, label: "Razoável", color: "bg-yellow-500" };
    if (score === 3) return { score, label: "Boa", color: "bg-blue-500" };
    return { score, label: "Forte", color: "bg-[var(--color-success-600)]" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");

    try {
      const response = await resetPasswordAction(data);
      
      if (!response.success) {
        setError(response.message || "Erro ao redefinir a senha");
        return;
      }
      
      setIsSuccess(true);
      toast.success(response.message);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any) {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 animate-fade-in-up text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[var(--color-success-600)] dark:text-green-400 animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Senha redefinida!
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400 mb-8 max-w-sm">
          Sua senha foi alterada com sucesso. Você será redirecionado para a tela de login em instantes.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand-600)]" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-[var(--color-brand-600)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Crie uma nova senha
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Sua nova senha deve ser diferente das senhas usadas anteriormente para maior segurança.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
                {field.value?.length > 0 && (
                  <div className="animate-fade-in space-y-1.5 pt-1">
                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                    </div>
                    <p className="text-xs text-[var(--color-ink-600)] flex justify-between">
                      <span>Força da senha:</span>
                      <span className="font-medium" style={{ color: strength.score > 0 ? `var(--color-${strength.score > 3 ? 'success' : strength.score > 1 ? 'warning' : 'danger'}-600)` : '' }}>
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
            size="lg"
          >
            {form.formState.isSubmitting ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      </Form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)] dark:text-gray-400">
        Lembrou da sua senha?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Fazer login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
