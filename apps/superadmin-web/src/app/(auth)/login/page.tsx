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
      <div className="space-y-2.5 text-center">
        <h1 className="text-[30px] md:text-[34px] font-bold text-[#07113F] tracking-tight leading-[1.15]">
          BipeSend Superpainel
        </h1>
        <p className="text-[16px] md:text-[18px] text-[#68789A] leading-[1.45] font-normal">
          Acesso restrito ao painel administrativo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 w-full" noValidate>

        <div className="!space-y-2">
          <Input
            id="sa-email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@empresa.com.br"
            autoComplete="username"
            error={!!error}
            leftIcon={<Mail className="h-5 w-5 text-[#7F90B2]" />}
          />
        </div>

        <div className="!space-y-2 mt-[18px]">
          <Input
            id="sa-password"
            label="Senha"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ex.: MinhaSenha@123"
            autoComplete="current-password"
            error={!!error}
            leftIcon={<Lock className="h-5 w-5 text-[#7F90B2]" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#7F90B2] hover:text-[#079CF5] transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#079CF5] rounded-md"
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

        <div className="flex items-center justify-between pt-4 mt-[16px]">
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-2.5 cursor-pointer group relative">
              <div className="relative flex items-center justify-center">
                <input id="sa-remember" type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="peer sr-only" aria-label="Lembrar de mim"
                />
                <div className="w-[22px] h-[22px] rounded-[6px] border-[1.5px] border-[#DCE5F2] bg-white transition-all peer-checked:border-[#087CF5] peer-checked:bg-[#087CF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#087CF5]/30 group-hover:border-[#087CF5]" />
                <div className={`absolute inset-0 rounded-[6px] bg-[#087CF5] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                <svg className="absolute w-4 h-4 text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[15px] text-[#07113F] font-medium transition-colors select-none">
                Lembrar de mim
              </span>
            </label>
          </div>
          
          <Link 
            href="/forgot-password" 
            className="text-[15px] font-medium text-[#0A74FF] hover:opacity-80 transition-opacity"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <div className="mt-[20px]">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full text-[16px] md:text-[18px] font-semibold text-white h-[56px] rounded-[16px] border-0 shadow-[0_10px_24px_rgba(50,80,220,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
            style={{ background: "linear-gradient(100deg, #079CF5 0%, #1478FF 38%, #5759F5 70%, #A827F5 100%)" }}
            size="lg"
          >
            {isLoading ? "Autenticando..." : "Autenticar"}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Button>
        </div>
      </form>
    </div>
  );
}
