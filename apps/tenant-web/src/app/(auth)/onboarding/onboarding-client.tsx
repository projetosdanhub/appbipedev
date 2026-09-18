"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Globe, AlertCircle, CheckCircle2, Loader2, ArrowRight, Lock } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
} from "@bipesend/ui";

import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth";
import { onboardingAction } from "../_actions/onboarding";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface OnboardingClientProps {
  initialWorkspaceName?: string;
}

export default function OnboardingPage({ initialWorkspaceName = "" }: OnboardingClientProps) {
  const [authStep, setAuthStep] = useState<"form" | "success-loading" | "success-done">("form");
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const initialName = initialWorkspaceName || "";
  const initialSlug = generateSlug(initialName);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { companyName: initialName, slug: initialSlug },
    mode: "onBlur",
  });

  // Helper function for icon classes
  const getIconClass = (val: string | undefined, isTouched: boolean, invalid: boolean) => {
    const base = "h-5 w-5 md:h-[18px] md:w-[18px] transition-colors duration-300";
    if (invalid) return `text-red-500 ${base}`;
    if (val && isTouched) return `text-[#1478FF] ${base}`;
    return `text-[#7F90B2] ${base}`;
  };

  const onSubmit = async (data: OnboardingInput) => {
    setServerError("");
    try {
      const response = await onboardingAction(data);
      if (!response.success) { 
        setServerError(response.message || "Confira os dados inseridos.");
        return; 
      }
      
      setAuthStep("success-loading");
      
      setTimeout(() => {
        setAuthStep("success-done");
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
      {/* ── Heading ── */}
      {!isSuccessView && (
        <div className="space-y-2 text-center md:text-left mb-6">
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
            Configure seu Workspace
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#475569] leading-[1.45] font-normal">
            Como devemos chamar o seu workspace?
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-red-600">{serverError}</p>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {authStep === "form" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full" noValidate>
            
            <div className="space-y-3">
              {/* Nome do Workspace */}
              <FormField control={form.control} name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <Input
                        id="onboarding-workspace"
                        placeholder="Nome do Workspace"
                        autoComplete="organization" error={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        leftIcon={<Building className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                        className="h-[50px] text-[15px] md:h-[46px] md:text-[14px]"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          const generated = generateSlug(value);
                          form.setValue("slug", generated, {
                            shouldValidate: form.formState.isSubmitted,
                            shouldDirty: true,
                          });
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          const currentName = form.getValues("companyName");
                          const generated = generateSlug(currentName);
                          form.setValue("slug", generated, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Slug (Bloqueado / Gerado Automaticamente) */}
              <FormField control={form.control} name="slug"
                render={({ field, fieldState }) => (
                  <FormItem className="!space-y-1">
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="onboarding-slug"
                          placeholder="meu-slug"
                          readOnly
                          tabIndex={-1}
                          autoComplete="off" error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          leftIcon={<Globe className={getIconClass(field.value, fieldState.isTouched, fieldState.invalid)} />}
                          className="h-[50px] text-[15px] md:h-[46px] md:text-[14px] pr-36 bg-slate-50/80 text-slate-600 cursor-not-allowed select-none border-slate-200/80 focus-visible:ring-0 focus-visible:border-slate-300"
                          {...field}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[12px] md:text-[13px] text-slate-400 font-medium pointer-events-none">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>.bipesend.com.br</span>
                        </div>
                      </div>
                    </FormControl>
                    <p className="text-[12px] text-slate-400 pl-1 font-normal">
                      O endereço do workspace é gerado automaticamente.
                    </p>
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
                {form.formState.isSubmitting ? "Configurando..." : (
                  <span className="flex items-center gap-2">
                    Concluir
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* ── Success ── */}
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
              {authStep === "success-loading" ? "Criando ambiente..." : "Tudo pronto!"}
            </h2>
            <p className="text-[14px] text-slate-500 animate-in slide-in-from-bottom-2 fade-in delay-75">
              {authStep === "success-loading" ? "Preparando seu workspace." : "Redirecionando para o painel."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
