"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
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

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "../_actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");

    try {
      const response = await loginAction(data);
      
      if (!response.success) {
        setError(response.message || "Erro ao realizar login");
        return;
      }
      
      toast.success(response.message);
      router.push("/");
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-ink-900)] dark:text-white tracking-tight mb-1.5">
          Bem-vindo de volta
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)] dark:text-gray-400">
          Entre na sua conta para acessar o BipSend.
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="seuemail@empresa.com.br" {...field} />
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
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-600)] dark:text-gray-400 hover:text-[var(--color-brand-600)] dark:hover:text-[var(--color-brand-600)] transition-colors focus:outline-none"
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2.5 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="toggle-round"
                      aria-label="Lembrar de mim"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-[var(--color-ink-600)] dark:text-gray-400 cursor-pointer !mt-0">
                    Lembrar de mim
                  </FormLabel>
                </FormItem>
              )}
            />

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
            size="lg"
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar no BipSend"}
          </Button>
        </form>
      </Form>
      
      <p className="mt-8 text-center text-[14px] text-[var(--color-ink-600)] dark:text-gray-400">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
          Crie sua conta agora
        </Link>
      </p>
    </div>
  );
}
