"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  // const email = searchParams.get('email') || "";
  // const token = searchParams.get('token') || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!password) return { score, label: "", color: "bg-gray-200" };
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score === 2) return { score, label: "Razoável", color: "bg-yellow-500" };
    if (score === 3) return { score, label: "Boa", color: "bg-blue-500" };
    return { score, label: "Forte", color: "bg-[var(--color-success-600)]" };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("As senhas não coincidem.");
    }

    setIsLoading(true);

    try {
      // API call to reset password
      // await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token, newPassword: password }) })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(err.message || "Erro ao redefinir a senha. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 animate-fade-in-up text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[var(--color-success-600)] animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Senha redefinida!
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400 mb-8 max-w-sm">
          Sua senha foi alterada com sucesso. Você será redirecionado para a tela de login em instantes.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand-600)]" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-[var(--color-brand-600)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-2">
          Crie uma nova senha
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Sua nova senha deve ser diferente das senhas usadas anteriormente para maior segurança.
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
          <label htmlFor="password" className="block text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
            Nova senha
          </label>
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

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="animate-fade-in space-y-1.5 pt-1">
            <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
              <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
              <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
              <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
            </div>
            <p className="text-xs text-[var(--color-ink-600)] flex justify-between">
              <span>Força da senha:</span>
              <span className="font-medium" style={{ color: passwordStrength.score > 0 ? `var(--color-${passwordStrength.score > 3 ? 'success' : passwordStrength.score > 1 ? 'warning' : 'danger'}-600)` : '' }}>
                {passwordStrength.label}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-2 group pt-2">
          <label htmlFor="confirmPassword" className="block text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
            Confirmar nova senha
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[var(--color-surface-900)] border border-[var(--color-border-200)] dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-600)] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white shadow-sm hover:border-gray-300 pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || password.length === 0 || password !== confirmPassword}
          className="relative flex items-center justify-center w-full py-3.5 px-4 font-semibold text-white bg-[var(--color-brand-600)] rounded-xl hover:bg-[var(--color-brand-700)] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-600)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 overflow-hidden group"
        >
          <span className={`absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out`} />
          
          <div className="flex items-center gap-2 relative z-10">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLoading ? "Salvando..." : "Redefinir senha"}</span>
          </div>
        </button>
      </form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)] dark:text-gray-400">
        Lembrou da sua senha?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Fazer login
        </Link>
      </p>
    </div>
  );
}
