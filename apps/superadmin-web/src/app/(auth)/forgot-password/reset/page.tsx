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

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { resetPasswordAction } from "../../_actions";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

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
      const msg = firstError.message as string;
      setTimeout(() => setGlobalValidationError(msg), 0);
      const t = setTimeout(() => setGlobalValidationError(""), 3000);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => setGlobalValidationError(""), 0);
    }
  }, [form.formState.errors]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");

    try {
      const response = await resetPasswordAction({
        ...data,
        email,
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
          <svg
            className="w-8 h-8 text-emerald-500 animate-checkmark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px] mb-2">
          Senha redefinida!
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed mb-8 max-w-sm">
          Sua senha foi alterada com sucesso. Você será redirecionado para a
          tela de login em instantes.
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
          Sua nova senha deve ser diferente das senhas usadas anteriormente para
          maior segurança.
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
          <p className="text-[13px] font-medium text-[var(--color-danger-600)]">
            {error}
          </p>
        </div>
      )}

      <Form {...form}>
        <form
          className="space-y-4 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
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
                  <PasswordStrength password={field.value} />
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
              {form.formState.isSubmitting ? (
                "Salvando..."
              ) : (
                <>
                  Redefinir senha <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <p className="mt-8 text-center text-[14px] text-slate-500">
        Lembrou da sua senha?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </div>
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
        <div
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 1 ? (score === 3 ? "bg-[#10B981]" : score === 2 ? "bg-[#F59E0B]" : "bg-[#EF4444]") : "bg-[#E2E8F0]"}`}
        />
        <div
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 2 ? (score === 3 ? "bg-[#10B981]" : "bg-[#F59E0B]") : "bg-[#E2E8F0]"}`}
        />
        <div
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${score >= 3 ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}
        />
      </div>
      {/* Textos de requisitos */}
      <div className="relative flex items-center w-full h-[18px]">
        <div
          className={`absolute left-1/2 -translate-x-1/2 text-[11.5px] whitespace-nowrap transition-colors duration-300 ${hasLength ? "text-[#10B981] font-medium" : "text-[#8E9AB4]"}`}
        >
          Mínimo 9 caracteres
        </div>
        <div
          className={`ml-auto text-[11.5px] whitespace-nowrap transition-colors duration-300 ${hasSpecial ? "text-[#10B981] font-medium" : "text-[#8E9AB4]"}`}
        >
          1 especial (ex: !@#)
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse w-full h-96 bg-gray-50 rounded-xl" />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
