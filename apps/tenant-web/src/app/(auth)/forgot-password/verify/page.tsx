"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShieldCheck, MailCheck } from "lucide-react";

export default function VerifyCodePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    // API call to resend code
    setCanResend(false);
    setCountdown(60);
    // TODO: Actually resend code via API
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Handling paste of multiple characters
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        if (pastedData[i]) {
          newCode[i] = pastedData[i];
        }
      }
      setCode(newCode);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Normal typing
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only paste if all numbers

    const newCode = [...code];
    const splitData = pastedData.slice(0, 6).split("");
    
    for (let i = 0; i < 6; i++) {
      if (splitData[i]) {
        newCode[i] = splitData[i];
      }
    }
    setCode(newCode);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(splitData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      setError("Por favor, preencha todos os 6 dígitos.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to set new password, passing email and token
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&token=${fullCode}`);
    } catch (err: any) {
      setError(err.message || "Código inválido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] dark:text-gray-400 dark:hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o login
        </Link>
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6">
          <MailCheck className="w-6 h-6 text-[var(--color-brand-600)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Verifique seu e-mail
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Enviamos um código de 6 dígitos para o e-mail{" "}
          <span className="font-semibold text-[var(--color-ink-900)] dark:text-gray-200">
            {email || "seu e-mail"}
          </span>
          .
        </p>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-lg text-sm mb-8 flex gap-3 animate-fade-in">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <p>Se o e-mail existir no nosso sistema, um código seguro será enviado para você em instantes.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 text-[14px] text-[var(--color-danger-600)] bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
            Código de segurança
          </label>
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
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-white dark:bg-[var(--color-surface-900)] border border-[var(--color-border-200)] dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white shadow-sm hover:border-gray-300"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.some(d => d === "")}
          className="relative flex items-center justify-center w-full py-3.5 px-4 font-semibold text-white bg-[var(--color-brand-600)] rounded-xl hover:bg-[var(--color-brand-700)] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-600)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 overflow-hidden group"
        >
          <span className={`absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out`} />
          
          <div className="flex items-center gap-2 relative z-10">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLoading ? "Validando..." : "Validar código"}</span>
          </div>
        </button>
      </form>
      
      <div className="mt-8 text-center text-[14px] text-[var(--color-ink-600)] dark:text-gray-400">
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
            Reenviar em <span className="font-semibold text-[var(--color-ink-900)] dark:text-gray-300">{countdown}s</span>
          </span>
        )}
      </div>
    </div>
  );
}
