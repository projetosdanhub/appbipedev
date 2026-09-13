"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
} from "@bipesend/ui";

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="w-full animate-auth-content space-y-4">
      {/* Header */}
      <div className="space-y-2 mb-2 text-center md:text-left">
        <h1 className="text-[24px] md:text-[30px] font-bold text-[#0F172A] tracking-tight leading-[1.2]">
          BipeSend Superpainel
        </h1>
        <p className="text-[15px] md:text-[16px] text-[#A1A8B6] font-normal leading-relaxed">
          Acesso restrito ao painel administrativo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 w-full" noValidate>

        <div className="space-y-1">
          <Input
            id="sa-email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@provedor.com.br"
            autoComplete="email"
            error={!!error}
            leftIcon={<Mail className="h-5 w-5" />}
          />
        </div>

        <div className="space-y-1">
          <Input
            id="sa-password"
            label="Senha"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            error={!!error}
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#A1A8B6] hover:text-[#007BFF] transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF] rounded-md"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />
          {error && (
            <p className="text-[12px] font-medium text-[var(--color-danger-600)] animate-in fade-in zoom-in-95">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-2.5 cursor-pointer group relative">
              <div className="relative flex items-center justify-center">
                <input id="sa-remember" type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="peer sr-only" aria-label="Lembrar de mim"
                />
                <div className="w-[18px] h-[18px] rounded-[6px] border-[1.5px] border-[#DCE5F2] bg-white transition-all peer-checked:border-[#007BFF] peer-checked:bg-[#007BFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#007BFF]/30 group-hover:border-[#007BFF]" />
                <div className={`absolute inset-0 rounded-[6px] bg-[#007BFF] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                <svg className="absolute w-3 h-3 text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[14px] text-slate-500 group-hover:text-[#0F172A] transition-colors select-none font-medium">
                Lembrar de mim
              </span>
            </label>
          </div>
          
          <Link 
            href="/forgot-password" 
            className="text-[14px] font-medium text-[#007BFF] hover:text-[#6366F1] transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full text-[16px]"
            size="lg"
          >
            {isLoading ? "Autenticando..." : "Autenticar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
