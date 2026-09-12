import * as nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 1025,
      ignoreTLS: true,
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = process.env.SMTP_FROM || 'noreply@bipesend.com.br';
    
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}
