import { Database } from "../../00-shared/infrastructure/database.js";

export interface NotificationEntity {
  id: string;
  tenantId: string;
  membershipId: string;
  type: string;
  title: string;
  content: any;
  read: boolean;
  dedupeKey: string | null;
  createdAt: Date;
}

export class NotificationRepository {
  constructor(private readonly db: Database) {}

  async findByMembership(tenantId: string, membershipId: string, limit = 50): Promise<NotificationEntity[]> {
    const rows = await this.db.query(
      `SELECT id, tenant_id as "tenantId", membership_id as "membershipId", type, title, content, read, dedupe_key as "dedupeKey", created_at as "createdAt"
       FROM notifications
       WHERE tenant_id = $1 AND membership_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [tenantId, membershipId, limit]
    );

    return rows.map((row: any) => ({
      ...row,
      read: !!row.read
    }));
  }

  async markAsRead(tenantId: string, membershipId: string, notificationId: string): Promise<boolean> {
    const rows = await this.db.query(
      `UPDATE notifications SET read = true WHERE id = $1 AND tenant_id = $2 AND membership_id = $3 RETURNING id`,
      [notificationId, tenantId, membershipId]
    );
    return rows.length > 0;
  }
}
