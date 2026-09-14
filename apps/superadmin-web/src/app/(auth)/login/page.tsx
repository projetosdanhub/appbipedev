"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Smartphone, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@bipesend/ui";
import { loginAction } from "../_actions";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
      fill="#4285F4"
    />
    <path
      d="M12.24 24.0008C15.4765 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z"
      fill="#34A853"
    />
    <path
      d="M5.50253 14.3003C5.00023 12.8099 5.00023 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
      fill="#FBBC04"
    />
    <path
      d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45015 6.86173 9.10947 4.74966 12.24 4.74966Z"
      fill="#EA4335"
    />
  </svg>
);

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
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
      if (!requires2FA && (!email || !password)) {
        throw new Error("E-mail e senha são obrigatórios");
      }
      if (requires2FA && !code) {
        throw new Error("O código de autenticação é obrigatório");
      }

      const res = await loginAction({
        email,
        password,
        code,
        rememberMe
      });

      if (!res.success) {
        if (res.message === "2FA_REQUIRED") {
          setRequires2FA(true);
          return;
        }
        throw new Error(res.message);
      }

      router.push("/");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao realizar login");
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

      <form onSubmit={handleLogin} className="space-y-0 w-full" noValidate>

        {!requires2FA ? (
          <>
            <div className="!space-y-2 mt-[24px]">
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
                error={!!error && !requires2FA}
                leftIcon={<Lock className="h-5 w-5 text-[#7F90B2]" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#7F90B2] hover:text-[#079CF5] transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#079CF5]"
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
                <p className="text-[12px] font-medium text-[var(--color-danger-600)] animate-in fade-in zoom-in-95 mt-1">
                  {error}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="!space-y-2 mt-[24px]">
            <Input
              id="sa-code"
              label="Código de Autenticação (2FA)"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código de 6 dígitos"
              autoComplete="one-time-code"
              error={!!error}
              leftIcon={<KeyRound className="h-5 w-5 text-[#7F90B2]" />}
              autoFocus
            />
            {error && (
              <p className="text-[12px] font-medium text-[var(--color-danger-600)] animate-in fade-in zoom-in-95 mt-1">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Botão principal */}
        <div className="mt-[22px]">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full text-[17px] font-semibold text-white h-[56px] rounded-[16px] border-0 shadow-[0_10px_26px_rgba(63,79,215,0.18)] transition-transform duration-150 hover:-translate-y-[1px]"
            style={{ background: "linear-gradient(100deg, #08A6F8 0%, #1478FF 38%, #575AF8 70%, #B132F4 100%)" }}
            size="lg"
          >
            {isLoading ? "Autenticando..." : "Entrar"}
            <svg className="ml-2 w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Button>
        </div>

        {!requires2FA && (
          <>
            {/* Lembrar + Esqueci */}
            <div className="flex items-center justify-between mt-[14px]">
              <label className="flex items-center gap-3 cursor-pointer group relative">
                <div className="relative flex items-center justify-center">
                  <input id="sa-remember" type="checkbox" checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="peer sr-only" aria-label="Lembrar de mim"
                  />
                  <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[#DCE5F2] bg-white transition-all peer-checked:border-[#087CF5] peer-checked:bg-[#087CF5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#087CF5]/30 group-hover:border-[#087CF5]" />
                  <div className={`absolute inset-0 rounded-[5px] bg-[#087CF5] opacity-0 peer-checked:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] pointer-events-none`} />
                  <svg className="absolute w-[14px] h-[14px] text-white pointer-events-none transition-transform duration-200 scale-0 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-[13px] text-[#68789A] font-medium transition-colors select-none">
                  Continuar conectado
                </span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[13px] font-medium text-[#0A74FF] hover:opacity-80 transition-opacity"
              >
                Recuperar senha
              </Link>
            </div>

            {/* Divisor OU */}
            <div className="flex items-center justify-center mt-[20px] py-2">
              <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
              <span className="px-4 text-[14px] text-[#8E9AB4] font-medium">
                ou
              </span>
              <div className="flex-1 h-[1px] bg-[#DCE5F2]"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-[10px] pb-6">
              <Button 
                type="button"
                onClick={() => toast.info("Autenticação com Google em breve 🚀")}
                variant="outline"
                size="lg"
                className="w-full h-[52px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
              >
                <GoogleIcon className="h-[22px] w-[22px] md:mr-2" />
                <span className="hidden md:inline text-[15px]">Google</span>
              </Button>
              <Button 
                type="button"
                onClick={() => setRequires2FA(true)}
                variant="outline"
                size="lg"
                className="w-full h-[52px] rounded-[14px] border border-[#DCE5F2] bg-white text-[#07113F] font-semibold hover:bg-[#F9FBFE] hover:border-[#C4D1E2] transition-colors"
              >
                <Smartphone className="h-[21px] w-[21px] md:mr-2 text-[#07113F] stroke-[1.8]" />
                <span className="hidden md:inline text-[15px]">Código</span>
              </Button>
            </div>
          </>
        )}

      </form>
    </div>
  );
}

