"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import {
  Button,
  Input,
  Alert,
  AlertDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@bipesend/ui";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "../_actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");

    try {
      const response = await registerAction(data);
      
      if (!response.success) {
        setError(response.message || "Erro ao criar conta");
        return;
      }
      
      toast.success(response.message);
      router.push("/login");
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  const passwordValue = form.watch("password");
  
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: "", color: "bg-gray-200" };
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
    if (score === 2) return { score, label: "Razoável", color: "bg-yellow-500" };
    if (score === 3) return { score, label: "Boa", color: "bg-blue-500" };
    return { score, label: "Forte", color: "bg-[var(--color-success-600)]" };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <div className="w-full animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink-900)] tracking-tight mb-1.5">
          Criar nova conta
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)]">
          Comece agora mesmo a gerenciar seus negócios.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="João Silva" 
                    leftIcon={<User className="h-4 w-4" />}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail corporativo</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="voce@empresa.com.br" 
                    leftIcon={<Mail className="h-4 w-4" />}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between h-5">
                  <FormLabel className="!mt-0">Senha</FormLabel>
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
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    leftIcon={<Lock className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {field.value?.length > 0 && (
                  <div className="animate-fade-in space-y-1.5 pt-1">
                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                      <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} style={{ width: '25%' }} />
                    </div>
                    <p className="text-xs text-[var(--color-ink-600)] flex justify-between">
                      <span>Força da senha:</span>
                      <span className="font-medium" style={{ color: strength.score > 0 ? `var(--color-${strength.score > 3 ? 'success' : strength.score > 1 ? 'warning' : 'danger'}-600)` : '' }}>
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />

          <div className="pt-1">
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                required
                className="toggle-round mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-ink-600)] cursor-pointer leading-relaxed">
                Eu concordo com os{" "}
                <Link href="/terms" className="text-[var(--color-brand-600)] hover:underline">Termos de Serviço</Link>
                {" "}e a{" "}
                <Link href="/privacy" className="text-[var(--color-brand-600)] hover:underline">Política de Privacidade</Link>.
              </label>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            size="lg"
          >
            {form.formState.isSubmitting ? "Criando..." : "Criar minha conta"}
          </Button>
        </form>
      </Form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)]">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Fazer login
        </Link>
      </p>
    </div>
  );
}
