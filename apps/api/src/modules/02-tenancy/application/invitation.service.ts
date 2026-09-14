import { assertPermission, canGrantRole } from "@bipesend/auth/policies";
import type { TenantContext, TenantRole } from "@bipesend/contracts";
import { Database } from "../../00-shared/infrastructure/database.js";
import crypto from "crypto";
import { InvitationRepository } from "../infrastructure/invitation.repository.js";
import { MembershipRepository } from "../infrastructure/membership.repository.js";
import { MailService } from "../../00-shared/infrastructure/mail.service.js";

export class InvitationService {
  constructor(
    private readonly db: Database,
    private readonly invitationRepository: InvitationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly mailService: MailService,
  ) {}

  async invite(
    context: TenantContext,
    email: string,
    role: TenantRole,
  ): Promise<void> {
    assertPermission(context, "team.members.manage");
    if (!canGrantRole(context, role)) throw new Error("PERMISSION_DENIED");
    const tenantId = context.tenantId;
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.db.withTransaction(async (tx) => {
      const members = await tx.query<{ role: string }>(
        "SELECT role FROM memberships WHERE id = $1 AND tenant_id = $2 AND user_id = $3 FOR SHARE",
        [context.membershipId, tenantId, context.userId],
      );
      if (
        !members[0] ||
        !["admin", "tenant_admin", "manager"].includes(members[0].role)
      )
        throw new Error("PERMISSION_DENIED");
      await new InvitationRepository(tx).create(
        tenantId,
        email,
        role,
        tokenHash,
        expiresAt,
      );
    }, tenantId);

    await this.mailService.sendMail(
      email,
      "Convite para equipe",
      `Você foi convidado. Use este token para aceitar: ${token}`,
    );
  }

  async accept(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invitation =
      await this.invitationRepository.findByTokenHash(tokenHash);

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    if (invitation.email !== userEmail) {
      throw new Error("This invitation was not sent to your email");
    }

    // Set tenant context internally within repository or ensure it's set outside.
    // Assuming the controller wraps this in a transaction and sets the context.
    await this.db.withTransaction(async (tx) => {
      const rows = await tx.query<{ id: string }>(
        "SELECT id FROM invitations WHERE id = $1 AND token_hash = $2 AND expires_at > NOW() FOR UPDATE",
        [invitation.id, tokenHash],
      );
      if (!rows[0]) throw new Error("Invalid or expired invitation");
      if (!["viewer", "agent", "member", "manager"].includes(invitation.role))
        throw new Error("Invalid role");
      await new MembershipRepository(tx).create(
        invitation.tenant_id,
        userId,
        invitation.role,
      );
      await new InvitationRepository(tx).delete(invitation.id);
    }, invitation.tenant_id);
  }
}
