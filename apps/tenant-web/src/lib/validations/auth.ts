import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Digite um endereço de e-mail válido.",
  }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, {
      message: "O nome deve ter pelo menos 3 caracteres.",
    }),
    companyName: z.string().min(2, {
      message: "O nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Digite um endereço de e-mail válido.",
    }),
    password: z.string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "A senha deve conter pelo menos 1 caractere especial." }),
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Digite um endereço de e-mail válido.",
  }),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: "A senha deve ter pelo menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "A senha deve ter pelo menos 8 caracteres.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const verifyCodeSchema = z.object({
  code: z.string().min(6, {
    message: "O código deve ter pelo menos 6 caracteres.",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
