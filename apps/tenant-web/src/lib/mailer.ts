import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  connectionTimeout: 5000,
  socketTimeout: 10000,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER || "", // user
        pass: process.env.SMTP_PASS || "", // password
      }
    : undefined,
});

/**
 * Envia um e-mail com código de recuperação de senha.
 * Se o SMTP_USER estiver vazio (ex: rodando com Mailpit local), ele enviará sem auth.
 */
export async function sendPasswordResetEmail(to: string, code: string) {
  try {
    const fromEmail = process.env.MAIL_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
    const subject = "Seu código de recuperação de senha - Bipesend";
    const text = `Seu código de recuperação de senha é: ${code}. Ele expira em 10 minutos.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007BFF;">Bipesend</h2>
        <p>Você solicitou a recuperação de senha. Use o código abaixo para redefinir sua senha.</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 4px; color: #0F172A;">${code}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px;">Este código é válido por 10 minutos.</p>
        <p style="color: #64748b; font-size: 14px;">Se você não solicitou isso, pode ignorar este e-mail em segurança.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: `Bipesend Auth <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });
    } else {
      await transporter.sendMail({
        from: `"Bipesend Auth" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    }
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * Envia um e-mail com código de verificação de e-mail.
 */
export async function sendEmailVerificationEmail(to: string, code: string) {
  try {
    const fromEmail = process.env.MAIL_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
    const subject = "Verifique seu endereço de e-mail - Bipesend";
    const text = `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007BFF;">Bipesend</h2>
        <p>Obrigado por se registrar! Use o código abaixo para confirmar seu endereço de e-mail.</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 4px; color: #0F172A;">${code}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px;">Este código é válido por 10 minutos.</p>
        <p style="color: #64748b; font-size: 14px;">Se você não solicitou isso, ignore este e-mail.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: `Bipesend Auth <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });
    } else {
      await transporter.sendMail({
        from: `"Bipesend Auth" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    }
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * Envia um e-mail com código de acesso direto (OTP).
 */
export async function sendLoginCodeEmail(to: string, code: string) {
  try {
    const fromEmail = process.env.MAIL_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
    const subject = `Código de acesso: ${code} - BipeSend`;
    const text = `Seu código de acesso ao BipeSend é: ${code}. Ele expira em 10 minutos.`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; font-size: 24px; margin: 0; font-weight: 700;">BipeSend</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 6px;">Código de Acesso Seguro</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Você solicitou entrar na sua conta. Utilize o código de acesso abaixo:</p>
        <div style="background: #F8FAFC; border: 1px dashed #CBD5E1; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #007BFF;">${code}</span>
        </div>
        <p style="color: #64748B; font-size: 13px; line-height: 1.4;">Este código expira em 10 minutos. Caso não tenha solicitado este código, ignore este e-mail.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: `Bipesend Auth <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });
    } else {
      await transporter.sendMail({
        from: `"Bipesend Auth" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    }
    return true;
  } catch (error) {
    console.log(`[AUTH_LOGIN_CODE] Code for ${to}: ${code}`);
    return true;
  }
}

