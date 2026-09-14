"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Mail, ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@bipesend/ui";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { forgotPasswordAction } from "../_actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [emailPlaceholder, setEmailPlaceholder] = useState(
    "E-mail (ex: seuemail@empresa.com.br)",
  );
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setEmailPlaceholder(
        window.innerWidth < 768
          ? "ex: seuemail@empresa.com.br"
          : "E-mail (ex: seuemail@empresa.com.br)",
      );
    };
    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const getIconClass = (
    val: string | undefined,
    isTouched: boolean,
    invalid: boolean,
  ) => {
    const base =
      "h-5 w-5 md:h-[18px] md:w-[18px] transition-colors duration-300";
    if (invalid) return `text-red-500 ${base}`;
    if (val && isTouched) return `text-[#1478FF] ${base}`;
    return `text-[#7F90B2] ${base}`;
  };

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");

    try {
      const response = await forgotPasswordAction(data);

      if (!response.success) {
        setError(response.message || "Erro ao solicitar recuperação");
        return;
      }

      toast.success(response.message);
      router.push(
        `/forgot-password/verify?email=${encodeURIComponent(data.email)}`,
      );
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="auth-content-enter w-full space-y-4">
      <div className="space-y-2">
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px]">
          Recupere sua senha
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed">
          Informe seu e-mail profissional. Enviaremos um código de 6 dígitos
          para você redefinir sua senha.
        </p>
      </div>

      <div className="h-6 flex items-start -mt-2"></div>

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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="!space-y-0">
                <FormControl>
                  <Input
                    type="email"
                    id="forgot-email"
                    placeholder={emailPlaceholder}
                    leftIcon={
                      <Mail
                        className={getIconClass(
                          field.value,
                          fieldState.isTouched,
                          fieldState.invalid,
                        )}
                      />
                    }
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
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
                "Enviando código..."
              ) : (
                <>
                  Enviar código <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[14px] text-[var(--text-secondary)] font-medium">
              Hm, sem conta ainda é?{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--action-primary)] hover:underline transition-colors"
              >
                Criar Conta Grátis
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
