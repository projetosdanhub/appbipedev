import { Database } from "../../00-shared/infrastructure/database.js";
import { TeamRepository, TeamMemberRow } from "../infrastructure/team.repository.js";
import { assertPermission, canManageTargetRole } from "@bipesend/auth/policies";
import type { TenantContext } from "@bipesend/contracts";

export class TeamService {
  constructor(
    private readonly db: Database,
    private readonly teamRepository: TeamRepository
  ) {}

  async listMembers(context: TenantContext): Promise<TeamMemberRow[]> {
    assertPermission(context, "team.members.read");
    return this.teamRepository.listMembers(context.tenantId);
  }

  async updateRole(context: TenantContext, membershipId: string, newRole: string): Promise<void> {
    assertPermission(context, "team.members.manage");

    await this.db.withTransaction(async (tx) => {
      const repo = new TeamRepository(tx);
      const target = await repo.findMembership(membershipId, context.tenantId);
      if (!target) throw new Error("MEMBERSHIP_NOT_FOUND");
      if (target.id === context.membershipId) throw new Error("VALIDATION_FAILED"); // Cannot update own role this way

      if (!canManageTargetRole(context, target.role)) {
        throw new Error("TEAM_ROLE_SCOPE_MISMATCH");
      }
      if (!canManageTargetRole(context, newRole)) {
        throw new Error("TEAM_ROLE_SCOPE_MISMATCH");
      }

      // If they are downgrading the last admin
      if (target.role === "tenant_admin" && newRole !== "tenant_admin" && target.active) {
        const adminCount = await repo.countAdmins(context.tenantId);
        if (adminCount <= 1) {
          throw new Error("VALIDATION_FAILED"); // Cannot remove the last admin
        }
      }

      await repo.updateRole(membershipId, context.tenantId, newRole);
    }, context.tenantId);
  }

  async suspendMember(context: TenantContext, membershipId: string): Promise<void> {
    assertPermission(context, "team.members.manage");

    await this.db.withTransaction(async (tx) => {
      const repo = new TeamRepository(tx);
      const target = await repo.findMembership(membershipId, context.tenantId);
      if (!target) throw new Error("MEMBERSHIP_NOT_FOUND");
      if (target.id === context.membershipId) throw new Error("VALIDATION_FAILED"); // Cannot suspend yourself

      if (!canManageTargetRole(context, target.role)) {
        throw new Error("TEAM_ROLE_SCOPE_MISMATCH");
      }

      // If suspending the last admin
      if (target.role === "tenant_admin" && target.active) {
        const adminCount = await repo.countAdmins(context.tenantId);
        if (adminCount <= 1) {
          throw new Error("VALIDATION_FAILED"); // Cannot suspend the last admin
        }
      }

      await repo.updateStatus(membershipId, context.tenantId, false);
    }, context.tenantId);
  }

  async reactivateMember(context: TenantContext, membershipId: string): Promise<void> {
    assertPermission(context, "team.members.manage");

    await this.db.withTransaction(async (tx) => {
      const repo = new TeamRepository(tx);
      const target = await repo.findMembership(membershipId, context.tenantId);
      if (!target) throw new Error("MEMBERSHIP_NOT_FOUND");

      if (!canManageTargetRole(context, target.role)) {
        throw new Error("TEAM_ROLE_SCOPE_MISMATCH");
      }

      await repo.updateStatus(membershipId, context.tenantId, true);
    }, context.tenantId);
  }

  async getAssignmentCandidates(context: TenantContext, departmentId: string) {
    // The user must be authenticated. Since this is called from various resources,
    // we don't assert a specific permission here (it's checked in the controller).
    return this.teamRepository.getAssignmentCandidates(context.tenantId, departmentId);
  }
}
