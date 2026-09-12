"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, AlertCircle, ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@bipesend/ui";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPasswordAction } from "../../_actions/auth";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || "";
  const token = searchParams.get('token') || "";
  
  const [error, setError] = useState("");
  const [globalValidationError, setGlobalValidationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
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

  const passwordValue = form.watch("password");

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: "", color: "bg-slate-200" };
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score === 2) return { score, label: "Razoável", color: "bg-yellow-500" };
    if (score === 3) return { score, label: "Boa", color: "bg-blue-500" };
    return { score, label: "Forte", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");

    try {
      const response = await resetPasswordAction({
        ...data,
        email,
        code: token,
      });
      
      if (!response.success) {
        setError(response.message || "Erro ao redefinir a senha");
        return;
      }
      
      setIsSuccess(true);
      toast.success(response.message);
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 animate-slide-up text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-500 animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px] mb-2">
          Senha redefinida!
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed mb-8 max-w-sm">
          Sua senha foi alterada com sucesso. Você será redirecionado para a tela de login em instantes.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-[#007BFF]" />
      </div>
    );
  }

  return (
    <div className="auth-content-enter w-full space-y-4">
      <div className="space-y-2">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-[#007BFF]" />
        </div>
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px]">
          Crie uma nova senha
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed">
          Sua nova senha deve ser diferente das senhas usadas anteriormente para maior segurança.
        </p>
      </div>

      <div className="h-6 flex items-start -mt-2">
        {globalValidationError && (
          <p className="text-[13px] font-medium text-[var(--color-danger-600)] animate-in fade-in zoom-in-95 duration-200">
            {globalValidationError}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-[var(--color-danger-600)] flex-shrink-0" />
          <p className="text-[13px] font-medium text-[var(--color-danger-600)]">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form className="space-y-4 w-full" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="!space-y-0">
                <FormControl>
                  <Input 
                    label="Nova senha"
                    type="password" 
                    placeholder="••••••••" 
                    leftIcon={<Lock className="h-5 w-5" />}
                    {...field} 
                  />
                </FormControl>
                {field.value?.length > 0 && (
                  <div className="animate-fade-in space-y-1.5 pt-2">
                    <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                    </div>
                    <p className="text-xs text-slate-500 flex justify-between">
                      <span>Força da senha:</span>
                      <span className="font-medium" style={{ color: strength.score > 0 ? (strength.score > 3 ? '#10B981' : strength.score > 1 ? '#F59E0B' : '#EF4444') : '' }}>
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
              <FormItem className="!space-y-0">
                <FormControl>
                  <Input 
                    label="Confirmar nova senha"
                    type="password" 
                    placeholder="••••••••" 
                    leftIcon={<Lock className="h-5 w-5" />}
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full"
              size="lg"
            >
              {form.formState.isSubmitting ? "Salvando..." : (
                <>Redefinir senha <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      <p className="mt-8 text-center text-[14px] text-slate-500">
        Lembrou da sua senha?{" "}
        <Link href="/login" className="font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors">
          Fazer login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse w-full h-96 bg-gray-50 rounded-xl" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
