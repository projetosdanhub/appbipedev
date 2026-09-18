import { NotificationRepository } from "../infrastructure/notification.repository.js";
import { TenantContext } from "@bipesend/contracts";

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async getMyNotifications(context: TenantContext, limit = 50) {
    return this.notificationRepo.findByMembership(context.tenantId, context.membershipId, limit);
  }

  async markAsRead(context: TenantContext, notificationId: string) {
    return this.notificationRepo.markAsRead(context.tenantId, context.membershipId, notificationId);
  }
}
