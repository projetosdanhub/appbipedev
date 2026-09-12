"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, Mail } from "lucide-react";
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

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { forgotPasswordAction } from "../_actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");

    try {
      const response = await forgotPasswordAction(data);
      
      if (!response.success) {
        setError(response.message || "Erro ao solicitar recuperação");
        return;
      }
      
      toast.success(response.message);
      router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`);
    } catch {
      setError("Ocorreu um erro inesperado ao conectar ao servidor.");
    }
  };

  return (
    <div className="w-full animate-slide-up">
      <div className="mb-8">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o login
        </Link>
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] tracking-tight mb-2">
          Recupere sua senha
        </h1>
        <p className="text-[15px] text-[var(--color-ink-600)]">
          Informe seu e-mail corporativo. Enviaremos um código de 6 dígitos para você redefinir sua senha.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                <FormLabel>E-mail corporativo</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seuemail@empresa.com.br" 
                    leftIcon={<Mail className="h-4 w-4" />}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
            size="lg"
          >
            {form.formState.isSubmitting ? "Enviando..." : "Enviar código"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
