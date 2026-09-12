import crypto from "crypto";
import { InvitationRepository } from "../infrastructure/invitation.repository.js";
import { MembershipRepository } from "../infrastructure/membership.repository.js";
import { MailService } from "../../00-shared/infrastructure/mail.service.js";

export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly mailService: MailService
  ) {}

  async invite(tenantId: string, email: string, role: string): Promise<void> {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    // Expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.invitationRepository.create(tenantId, email, role, tokenHash, expiresAt);

    await this.mailService.sendMail(
      email,
      "Convite para equipe",
      `Você foi convidado. Use este token para aceitar: ${token}`
    );
  }

  async accept(token: string, userId: string, userEmail: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invitation = await this.invitationRepository.findByTokenHash(tokenHash);

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    if (invitation.email !== userEmail) {
      throw new Error("This invitation was not sent to your email");
    }

    // Set tenant context internally within repository or ensure it's set outside.
    // Assuming the controller wraps this in a transaction and sets the context.
    await this.membershipRepository.create(invitation.tenant_id, userId, invitation.role);
    await this.invitationRepository.delete(invitation.id);
  }
}
