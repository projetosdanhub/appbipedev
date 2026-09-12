"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Fake API call for now (Will connect to API backend later)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
      }

      // Simulate successful login
      router.push("/");
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(err.message || "Erro ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 bg-[var(--color-surface-0)] rounded-[12px] border border-[var(--color-border-200)] shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-[28px] font-bold text-[var(--color-ink-900)]">BipeSend Superpainel</h1>
        <p className="mt-2 text-[16px] text-[var(--color-ink-600)]">
          Acesso restrito
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 text-[14px] text-[var(--color-danger-600)] bg-[var(--color-danger-600)]/10 rounded-[8px]">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-[14px] font-semibold text-[var(--color-ink-900)]">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-200)] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink-900)]/50 focus:border-[var(--color-ink-900)] transition-colors"
            placeholder="admin@bipesend.com.br"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-[14px] font-semibold text-[var(--color-ink-900)]">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-200)] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink-900)]/50 focus:border-[var(--color-ink-900)] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full h-[40px] px-4 font-semibold text-white bg-[var(--color-ink-900)] rounded-[8px] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-ink-900)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Autenticar"
          )}
        </button>
      </form>
    </div>
  );
}
