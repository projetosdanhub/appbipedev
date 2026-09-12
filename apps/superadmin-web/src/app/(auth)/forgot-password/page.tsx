"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Mail, ArrowRight } from "lucide-react";
import { Button, Input } from "@bipesend/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !email.includes("@")) {
      setError("Digite um endereço de e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Se o e-mail existir, um código será enviado.");
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
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
        <h1 className="text-[27px] md:text-[32px] font-bold text-[#0F172A] tracking-tight leading-[33px] md:leading-[38px]">
          Recupere sua senha
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-500 font-normal leading-relaxed">
          Informe seu e-mail profissional. Enviaremos um código de 6 dígitos para você redefinir sua senha.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-error-enter">
          <AlertCircle className="h-4 w-4 mt-0.5 text-[var(--color-danger-600)] flex-shrink-0" />
          <p className="text-[13px] font-medium text-[var(--color-danger-600)]">{error}</p>
        </div>
      )}

      <form className="space-y-4 w-full" onSubmit={handleForgot} noValidate>
        <Input 
          type="email" 
          id="forgot-email"
          label="E-mail profissional"
          placeholder="admin@bipesend.com.br" 
          leftIcon={<Mail className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Enviando código..." : (
              <>Enviar código <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
