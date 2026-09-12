"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, MailCheck, AlertTriangle } from "lucide-react";
import {
  Button,
  Alert,
  AlertDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@bipesend/ui";

import { verifyCodeSchema, type VerifyCodeInput } from "@/lib/validations/auth";
import { verifyAction } from "../../_actions/auth";

function VerifyCodeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const form = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

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
      const response = await verifyAction(data);
      
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
    <div className="w-full animate-slide-up">
      <div className="mb-8">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o login
        </Link>
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
          <MailCheck className="w-6 h-6 text-[var(--color-brand-600)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] tracking-tight mb-2">
          Verifique seu e-mail
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)]">
          Enviamos um código de 6 dígitos para o e-mail{" "}
          <span className="font-semibold text-[var(--color-ink-900)]">
            {email || "seu e-mail"}
          </span>
          .
        </p>
      </div>

      <div className="p-4 bg-indigo-50 text-indigo-800 rounded-lg text-sm mb-8 flex gap-3 animate-fade-in">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <p>Se o e-mail existir no nosso sistema, um código seguro será enviado para você em instantes.</p>
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de segurança</FormLabel>
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
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-white border border-[var(--color-border-200)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 shadow-sm hover:border-gray-300"
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            disabled={code.some(d => d === "")}
            className="w-full"
            size="lg"
          >
            {form.formState.isSubmitting ? "Validando..." : "Validar código"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8 text-center text-[14px] text-[var(--color-ink-600)]">
        Não recebeu o código?{" "}
        {canResend ? (
          <button 
            onClick={handleResend}
            className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors focus:outline-none"
          >
            Clique para reenviar
          </button>
        ) : (
          <span>
            Reenviar em <span className="font-semibold text-[var(--color-ink-900)]">{countdown}s</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="animate-pulse w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
      <VerifyCodeContent />
    </Suspense>
  );
}
