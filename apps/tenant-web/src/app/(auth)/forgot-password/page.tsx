"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar recuperação");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full animate-in fade-in zoom-in-95 duration-500 fill-mode-both text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          E-mail enviado!
        </h1>
        <p className="text-[15px] text-[var(--color-ink-500)] dark:text-gray-400 mb-8">
          Enviamos as instruções para <strong>{email}</strong>. Verifique sua caixa de entrada (e a pasta de spam).
        </p>
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight">
          Recuperar senha
        </h1>
        <p className="mt-2 text-[15px] text-[var(--color-ink-500)] dark:text-gray-400">
          Insira seu e-mail e enviaremos um link para você redefinir sua senha.
        </p>
      </div>

      <form className="space-y-6">
        {error && (
          <div className="p-3 text-[14px] text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[14px] font-medium text-[var(--color-ink-700)] dark:text-gray-300">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white shadow-sm"
            placeholder="voce@empresa.com.br"
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="relative flex items-center justify-center w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin absolute" />
          ) : (
            <span>Enviar link de recuperação</span>
          )}
          <span className={`transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
            &nbsp;
          </span>
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Lembrou da senha?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
