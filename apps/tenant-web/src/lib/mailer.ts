import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "", // user
    pass: process.env.SMTP_PASS || "", // password
  },
});

/**
 * Envia um e-mail com código de recuperação de senha.
 * Se o SMTP_USER estiver vazio (ex: rodando com Mailpit local), ele enviará sem auth.
 */
export async function sendPasswordResetEmail(to: string, code: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Bipesend Auth" <${process.env.SMTP_FROM || "no-reply@bipesend.com"}>`,
      to,
      subject: "Seu código de recuperação de senha - Bipesend",
      text: `Seu código de recuperação de senha é: ${code}. Ele expira em 10 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007BFF;">Bipesend</h2>
          <p>Você solicitou a recuperação de senha. Use o código abaixo para redefinir sua senha.</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 4px; color: #0F172A;">${code}</h1>
          </div>
          <p style="color: #64748b; font-size: 14px;">Este código é válido por 10 minutos.</p>
          <p style="color: #64748b; font-size: 14px;">Se você não solicitou isso, pode ignorar este e-mail em segurança.</p>
        </div>
      `,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
