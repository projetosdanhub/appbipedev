"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  Button,
  Input,
  Alert,
  AlertDescription,
} from "@bipesend/ui";

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Fake API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
      }

      router.push("/");
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(err.message || "Erro ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink-900)] tracking-tight mb-1.5">
          BipeSend Superpainel
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)]">
          Acesso restrito ao painel administrativo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bipesend.com.br"
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between h-5">
            <label htmlFor="password" className="text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300">
              Senha
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-600)] hover:text-[var(--color-brand-600)] transition-colors focus:outline-none"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <><EyeOff className="w-3.5 h-3.5" /> Ocultar</>
              ) : (
                <><Eye className="w-3.5 h-3.5" /> Mostrar</>
              )}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          size="lg"
        >
          {isLoading ? "Autenticando..." : "Autenticar"}
        </Button>
      </form>
    </div>
  );
}
