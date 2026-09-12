"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, MailCheck, AlertCircle, ArrowRight } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@bipesend/ui";

import { verifyCodeSchema, type VerifyCodeInput } from "@/lib/validations/auth";
import { verifyAction } from "../../_actions/auth";

function VerifyCodeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [globalValidationError, setGlobalValidationError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const form = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    toast.success("Código reenviado para o seu e-mail.");
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        if (pastedData[i]) {
          newCode[i] = pastedData[i];
        }
      }
      setCode(newCode);
      form.setValue("code", newCode.join(""));
      
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);
    form.setValue("code", newCode.join(""));

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    const splitData = pastedData.slice(0, 6).split("");
    
    for (let i = 0; i < 6; i++) {
      if (splitData[i]) {
        newCode[i] = splitData[i];
      }
    }
    setCode(newCode);
    form.setValue("code", newCode.join(""));
    
    const nextIndex = Math.min(splitData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = async (data: VerifyCodeInput) => {
    setError("");

    try {
      const response = await verifyAction({ ...data, email });
      
      if (!response.success) {
        setError(response.message || "Código inválido. Tente novamente.");
        return;
      }
      
      toast.success(response.message);
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&token=${data.code}`);
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="auth-content-enter w-full space-y-4">
      <div className="space-y-2">
        <Link 
          href="/login" 
          className="flex items-center text-[14px] font-medium text-slate-500 hover:text-[#0F172A] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar para o login
        </Link>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <MailCheck className="w-6 h-6 text-[#007BFF]" />
        </div>
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px]">
          Verifique seu e-mail
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed">
          Enviamos um código de 6 dígitos para o e-mail{" "}
          <span className="font-semibold text-[#0F172A]">
            {email || "seu e-mail"}
          </span>
          .
        </p>
      </div>

      <div className="p-4 bg-blue-50/50 text-[#0F172A] rounded-xl text-[14px] mb-8 flex gap-3 animate-fade-in border border-blue-100">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#007BFF]" />
        <p>Se o e-mail existir no nosso sistema, um código seguro será enviado para você em instantes.</p>
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
            name="code"
            render={({ field }) => (
              <FormItem className="!space-y-0">
                <div className="text-[14px] font-medium text-slate-700 mb-2">Código de segurança</div>
                <FormControl>
                  <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-[45px] h-[52px] sm:w-[52px] sm:h-[56px] text-center text-[20px] font-semibold bg-white/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,123,255,0.10)] focus:border-[#007BFF] transition-all duration-200 text-[#0F172A] shadow-sm hover:border-slate-300"
                      />
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              disabled={code.some(d => d === "")}
              className="w-full"
              size="lg"
            >
              {form.formState.isSubmitting ? "Validando..." : (
                <>Validar código <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="mt-8 text-center text-[14px] text-slate-500">
        Não recebeu o código?{" "}
        {canResend ? (
          <button 
            onClick={handleResend}
            className="font-semibold text-[#007BFF] hover:text-[#6366F1] transition-colors focus:outline-none"
          >
            Clique para reenviar
          </button>
        ) : (
          <span>
            Reenviar em <span className="font-semibold text-[#0F172A]">{countdown}s</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="animate-pulse w-full h-96 bg-gray-50 rounded-xl" />}>
      <VerifyCodeContent />
    </Suspense>
  );
}
