import { Database } from "../../00-shared/infrastructure/database.js";
import { AuditRepository } from "../infrastructure/audit.repository.js";
import { assertPermission } from "@bipesend/auth/policies";
import type { TenantContext, AuditLogListParams, AuditLogListResponse } from "@bipesend/contracts";

export class AuditService {
  constructor(
    private readonly db: Database,
    private readonly auditRepository: AuditRepository
  ) {}

  async listLogs(context: TenantContext, params: AuditLogListParams): Promise<AuditLogListResponse> {
    // Ação protegida por RBAC global do workspace
    assertPermission(context, "audit.read");
    
    return this.auditRepository.list(context.tenantId, params);
  }
}
