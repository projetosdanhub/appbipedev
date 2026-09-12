"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
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
    <div className="w-full animate-auth-content">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[30px] font-bold text-[var(--color-ink-900)] tracking-tight leading-tight mb-1.5">
          BipeSend Superpainel
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] leading-relaxed">
          Acesso restrito ao painel administrativo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="animate-error-enter">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <label htmlFor="sa-email" className="text-[14px] font-medium text-[var(--color-ink-900)]">
            E-mail
          </label>
          <Input
            id="sa-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bipesend.com.br"
            autoComplete="email"
            leftIcon={<Mail className="h-[18px] w-[18px]" />}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sa-password" className="text-[14px] font-medium text-[var(--color-ink-900)]">
            Senha
          </label>
          <Input
            id="sa-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            leftIcon={<Lock className="h-[18px] w-[18px]" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-[var(--color-ink-900)] transition-colors p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-600)] rounded-md"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            "Autenticando..."
          ) : (
            <>
              Autenticar
              <ArrowRight className="w-[18px] h-[18px] ml-1 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
