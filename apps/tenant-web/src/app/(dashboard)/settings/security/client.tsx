"use client";

import { useState } from "react";
import { Button, Input } from "@bipesend/ui";
import { toast } from "sonner";
import { generate2FASecret, enable2FA, disable2FA } from "./_actions";
import { Smartphone, Lock, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function SecurityClient({ isTwoFactorEnabled }: { isTwoFactorEnabled: boolean }) {
  const router = useRouter();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const handleStartSetup = async () => {
    try {
      setIsLoading(true);
      const data = await generate2FASecret();
      setSetupData(data);
      setIsSettingUp(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar configuração do 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData || !code) return;

    try {
      setIsLoading(true);
      const res = await enable2FA(setupData.secret, code);
      if (res?.success) {
        toast.success("Autenticação em duas etapas ativada com sucesso!");
        setBackupCodes(res.backupCodes || null);
        setIsSettingUp(false);
        setSetupData(null);
        setCode("");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    try {
      setIsLoading(true);
      await disable2FA(password);
      toast.success("Autenticação em duas etapas desativada");
      setIsDisabling(false);
      setPassword("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao desativar 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isTwoFactorEnabled ? (
              <ShieldCheck className="w-5 h-5 text-[var(--color-success-600)]" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[var(--color-warning-600)]" />
            )}
            <h3 className="text-[16px] font-semibold text-[var(--color-ink-900)]">
              Autenticação em Duas Etapas (2FA)
            </h3>
          </div>
          <p className="text-[14px] text-[var(--color-ink-500)] max-w-lg">
            {isTwoFactorEnabled
              ? "A autenticação em duas etapas está ativada. Sua conta está protegida com uma camada adicional de segurança."
              : "Proteja sua conta adicionando uma camada extra de segurança usando um aplicativo autenticador."}
          </p>
        </div>

        <div>
          {!isTwoFactorEnabled && !isSettingUp && (
            <Button onClick={handleStartSetup} isLoading={isLoading}>
              Configurar 2FA
            </Button>
          )}

          {isTwoFactorEnabled && !isDisabling && (
            <Button variant="outline" onClick={() => setIsDisabling(true)}>
              Desativar 2FA
            </Button>
          )}
        </div>
      </div>

      {backupCodes && (
        <div className="mt-8 pt-8 border-t border-[var(--color-border-200)]">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-[16px] font-bold text-yellow-800 mb-2">
              Códigos de Recuperação
            </h4>
            <p className="text-[14px] text-yellow-700 mb-4">
              Guarde estes códigos em um local seguro. Eles são a única forma de recuperar sua conta se você perder o acesso ao seu aplicativo autenticador. Cada código só pode ser usado uma vez.
            </p>
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border border-yellow-200 font-mono text-sm">
              {backupCodes.map((c) => (
                <div key={c} className="text-slate-700 font-medium">
                  {c}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setBackupCodes(null)} variant="outline">
                Já guardei em local seguro
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSettingUp && setupData && (
        <div className="mt-8 pt-8 border-t border-[var(--color-border-200)]">
          <h4 className="text-[15px] font-semibold text-[var(--color-ink-900)] mb-4">
            Passo a Passo para Ativação
          </h4>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-ink-900)]">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-[13px]">1</span>
                  Baixe um aplicativo autenticador
                </span>
                <p className="text-[13px] text-[var(--color-ink-500)] ml-8">
                  Baixe e instale um aplicativo como Google Authenticator, Authy ou Microsoft Authenticator em seu celular.
                </p>
              </div>

              <div className="space-y-2">
                <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-ink-900)]">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-[13px]">2</span>
                  Escaneie o QR Code
                </span>
                <p className="text-[13px] text-[var(--color-ink-500)] ml-8">
                  Abra o aplicativo autenticador e escaneie o código QR ao lado, ou insira a chave manualmente:
                </p>
                <div className="ml-8 p-2 bg-[var(--color-surface-100)] border border-[var(--color-border-200)] rounded-[8px] font-mono text-[13px] text-center mt-2 select-all">
                  {setupData.secret}
                </div>
              </div>

              <div className="space-y-2">
                <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-ink-900)]">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-[13px]">3</span>
                  Insira o código gerado
                </span>
                <p className="text-[13px] text-[var(--color-ink-500)] ml-8 mb-4">
                  Digite o código de 6 dígitos gerado pelo aplicativo para confirmar a configuração.
                </p>
                <form onSubmit={handleEnable2FA} className="ml-8 space-y-3">
                  <Input
                    label="Código de Autenticação"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    required
                    leftIcon={<KeyRound className="w-4 h-4 text-[var(--color-ink-400)]" />}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" isLoading={isLoading}>
                      Ativar 2FA
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsSettingUp(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
              <Image 
                src={setupData.qrCodeUrl} 
                alt="QR Code de Autenticação em Duas Etapas" 
                width={200} 
                height={200} 
                className="rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {isDisabling && (
        <div className="mt-8 pt-8 border-t border-[var(--color-border-200)]">
          <h4 className="text-[15px] font-semibold text-[var(--color-ink-900)] mb-4">
            Desativar Autenticação em Duas Etapas
          </h4>
          <p className="text-[14px] text-[var(--color-ink-500)] mb-4">
            Para desativar o 2FA, por favor confirme sua senha atual.
          </p>
          <form onSubmit={handleDisable2FA} className="max-w-sm space-y-4">
            <Input
              label="Sua Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4 text-[var(--color-ink-400)]" />}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" isLoading={isLoading}>
                Confirmar Desativação
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsDisabling(false)} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
