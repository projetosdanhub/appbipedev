"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // API call to send OTP would go here
      // For now, we simulate success and move to verify step
      // In a real app we would call: await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      
      // We simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Pass the email to the next screen via query param so we know which email to verify
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(err.message || "Ocorreu um erro inesperado");
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
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Recupere sua senha
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Informe seu e-mail corporativo. Enviaremos um código de 6 dígitos para você redefinir sua senha.
        </p>
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

        <div className="space-y-2 group">
          <label htmlFor="email" className="block text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
            E-mail corporativo
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[var(--color-surface-900)] border border-[var(--color-border-200)] dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white shadow-sm hover:border-gray-300"
              placeholder="seuemail@empresa.com.br"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-600)] transition-colors" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="relative flex items-center justify-center w-full py-3.5 px-4 font-semibold text-white bg-[var(--color-brand-600)] rounded-xl hover:bg-[var(--color-brand-700)] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-600)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 overflow-hidden group"
        >
          <span className={`absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out`} />
          
          <div className="flex items-center gap-2 relative z-10">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLoading ? "Enviando..." : "Enviar código"}</span>
          </div>
        </button>
      </form>
    </div>
  );
}
