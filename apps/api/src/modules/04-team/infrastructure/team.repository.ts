import { Database } from "../../00-shared/infrastructure/database.js";

export interface TeamMemberRow {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  active: boolean;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export class TeamRepository {
  constructor(private readonly db: Database) {}

  async listMembers(tenantId: string): Promise<TeamMemberRow[]> {
    const res = await this.db.query(
      `SELECT m.id, m.tenant_id as "tenantId", m.user_id as "userId", m.role, m.active,
              u.id as "u_id", u.email as "u_email", u.first_name as "u_firstName", u.last_name as "u_lastName"
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.tenant_id = $1
       ORDER BY m.created_at DESC`,
      [tenantId]
    );

    return res.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      role: row.role,
      active: row.active,
      user: {
        id: row.u_id,
        email: row.u_email,
        firstName: row.u_firstName,
        lastName: row.u_lastName,
      },
    }));
  }

  async findMembership(id: string, tenantId: string) {
    const res = await this.db.query(
      `SELECT id, tenant_id as "tenantId", user_id as "userId", role, active 
       FROM memberships 
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return res[0] || null;
  }

  async countAdmins(tenantId: string): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM memberships 
       WHERE tenant_id = $1 AND role = 'tenant_admin' AND active = true`,
      [tenantId]
    );
    return parseInt(res[0].count, 10);
  }

  async updateRole(id: string, tenantId: string, role: string): Promise<void> {
    await this.db.query(
      `UPDATE memberships SET role = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
      [role, id, tenantId]
    );
  }

  async updateStatus(id: string, tenantId: string, active: boolean): Promise<void> {
    await this.db.query(
      `UPDATE memberships SET active = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
      [active, id, tenantId]
    );
  }

  async getAssignmentCandidates(tenantId: string, departmentId: string) {
    const membershipsQuery = await this.db.query(
      `SELECT m.id, m.user_id as "userId", u.first_name as "firstName", u.last_name as "lastName"
       FROM department_memberships dm
       JOIN memberships m ON dm.membership_id = m.id
       JOIN users u ON m.user_id = u.id
       WHERE dm.tenant_id = $1 AND dm.department_id = $2 
         AND dm.status = 'active' AND m.active = true
       ORDER BY u.first_name ASC`,
      [tenantId, departmentId]
    );

    const rolesQuery = await this.db.query(
      `SELECT r.id, r.name, r.department_id as "departmentId"
       FROM roles r
       WHERE r.tenant_id = $1 AND r.status = 'active'
         AND (r.department_id = $2 OR r.department_id IS NULL)
       ORDER BY r.name ASC`,
      [tenantId, departmentId]
    );

    return {
      memberships: membershipsQuery,
      roles: rolesQuery,
    };
  }

  async createInvitation(
    tenantId: string,
    email: string,
    role: string,
    tokenHash: string,
    createdByMembershipId: string,
    expiresAt: Date
  ): Promise<{ id: string }> {
    const res = await this.db.query(
      `INSERT INTO invitations (
        tenant_id, email, role, token_hash, created_by_membership_id, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [tenantId, email, role, tokenHash, createdByMembershipId, expiresAt]
    );
    return res[0];
  }

  async findMembershipByUserId(userId: string, tenantId: string) {
    const res = await this.db.query(
      `SELECT id, tenant_id as "tenantId", user_id as "userId", role, active 
       FROM memberships 
       WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );
    return res[0] || null;
  }
}
