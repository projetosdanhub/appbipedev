import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email({
    message: "Digite um endereço de e-mail válido.",
  }),
  password: z.string().max(128).min(9, {
    message: "A senha deve ter pelo menos 9 caracteres.",
  }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().max(120).min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().max(254).email({
    message: "Digite um endereço de e-mail válido.",
  }),
  password: z
    .string()
    .max(128)
    .min(9, { message: "A senha deve ter pelo menos 9 caracteres." })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "A senha deve conter pelo menos 1 caractere especial.",
    }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email({
    message: "Digite um endereço de e-mail válido.",
  }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(9, {
        message: "A senha deve ter pelo menos 9 caracteres.",
      })
      .max(128)
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "A senha deve conter pelo menos 1 caractere especial.",
      }),
    confirmPassword: z.string().max(128).min(9, {
      message: "A senha deve ter pelo menos 9 caracteres.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, {
      message: "O código deve conter exatamente 6 dígitos.",
    }),
});

export const onboardingSchema = z.object({
  companyName: z.string().trim().max(160).min(2, {
    message: "O nome do workspace deve ter pelo menos 2 caracteres.",
  }),
  slug: z.string().trim().max(100).min(2, {
    message: "O slug deve ter pelo menos 2 caracteres.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "O slug deve conter apenas letras minúsculas, números e hifens.",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
