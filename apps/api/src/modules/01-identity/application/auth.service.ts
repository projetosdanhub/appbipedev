import * as argon2 from "argon2";
import crypto from "crypto";
import { UserRepository } from "../infrastructure/user.repository.js";
import { SessionRepository } from "../infrastructure/session.repository.js";
import { VerificationRepository, PasswordResetRepository } from "../infrastructure/verification.repository.js";
import { MailService } from "../../00-shared/infrastructure/mail.service.js";
import { User } from "../domain/user.entity.js";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly mailService: MailService
  ) {}

  async register(email: string, passwordPlain: string, name: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already in use");
    }

    const passwordHash = await argon2.hash(passwordPlain);
    const user = await this.userRepository.create(email, passwordHash, name);

    // Send verification email
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.verificationRepository.create(user.id, tokenHash, expiresAt);

    await this.mailService.sendMail(
      user.email,
      "Verifique seu e-mail",
      `Seu token de verificação é: ${token}` // In real world this would be a link
    );

    return user;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const verification = await this.verificationRepository.findByTokenHash(tokenHash);
    
    if (!verification) {
      throw new Error("Invalid or expired verification token");
    }

    // Usually you'd set a 'verified_at' flag on the user here, but it's omitted in initial schema.
    // For now we just consume the token.
    await this.verificationRepository.delete(verification.id);
    return true;
  }

  async login(email: string, passwordPlain: string): Promise<{ sessionToken: string; user: User }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const valid = await argon2.verify(user.passwordHash, passwordPlain);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const sessionToken = crypto.randomBytes(64).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
    
    // Session expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepository.create(user.id, tokenHash, expiresAt);

    return { sessionToken, user };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
    await this.sessionRepository.revoke(tokenHash);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't leak whether user exists
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.passwordResetRepository.create(user.id, tokenHash, expiresAt);

    await this.mailService.sendMail(
      user.email,
      "Recuperação de Senha",
      `Seu token de recuperação é: ${token}`
    );
  }

  async resetPassword(token: string, newPasswordPlain: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRequest = await this.passwordResetRepository.findByTokenHash(tokenHash);
    
    if (!resetRequest) {
      throw new Error("Invalid or expired password reset token");
    }

    const passwordHash = await argon2.hash(newPasswordPlain);
    await this.userRepository.updatePassword(resetRequest.user_id, passwordHash);

    // Invalidate all active sessions for security
    await this.sessionRepository.revokeAllForUser(resetRequest.user_id);
    
    await this.passwordResetRepository.delete(resetRequest.id);
  }
}
