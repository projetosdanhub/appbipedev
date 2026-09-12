import { Database } from "../../00-shared/infrastructure/database.js";
import { TenantRepository } from "../infrastructure/tenant.repository.js";
import { MembershipRepository } from "../infrastructure/membership.repository.js";
import { Tenant } from "../domain/tenant.entity.js";
import { Membership } from "../domain/membership.entity.js";

export class OnboardingService {
  constructor(
    private readonly db: Database,
    private readonly tenantRepository: TenantRepository,
    private readonly membershipRepository: MembershipRepository
  ) {}

  async createTenantForUser(userId: string, tenantName: string): Promise<{ tenant: Tenant; membership: Membership }> {
    return this.db.withTransaction(async (txDb) => {
      const txTenantRepo = new TenantRepository(txDb);
      const txMembershipRepo = new MembershipRepository(txDb);

      // Create tenant
      const tenant = await txTenantRepo.create(tenantName);

      // Now we have a tenant. To create a membership under RLS, we must set the context.
      // We set the context manually since we just created it.
      await txDb.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenant.id]);

      // Create membership as admin
      const membership = await txMembershipRepo.create(tenant.id, userId, 'admin');

      return { tenant, membership };
    });
  }
}
