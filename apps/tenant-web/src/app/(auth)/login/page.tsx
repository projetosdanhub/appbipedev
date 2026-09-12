"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar login");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Entre na sua conta para acessar o BipSend.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
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
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-[var(--color-surface-900)] border border-[var(--color-border-200)] dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white shadow-sm hover:border-gray-300"
            placeholder="seuemail@empresa.com.br"
          />
        </div>

        <div className="space-y-2 group">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
              Senha
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[var(--color-surface-900)] border border-[var(--color-border-200)] dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white shadow-sm hover:border-gray-300 pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-600)] transition-colors cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-ink-600)] dark:text-gray-400 cursor-pointer">
              Lembrar de mim
            </label>
          </div>

          <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
            Esqueci minha senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="relative flex items-center justify-center w-full py-3.5 px-4 font-semibold text-white bg-[var(--color-brand-600)] rounded-xl hover:bg-[var(--color-brand-700)] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-600)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 overflow-hidden group"
        >
          <span className={`absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out`} />
          
          <div className="flex items-center gap-2 relative z-10">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLoading ? "Enviando..." : "Entrar no BipSend"}</span>
          </div>
        </button>
      </form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)] dark:text-gray-400">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Crie sua conta agora
        </Link>
      </p>
    </div>
  );
}

