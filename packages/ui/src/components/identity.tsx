import type { ReactNode } from "react";
import { Bell, Inbox } from "lucide-react";
import { Avatar } from "./feedback";

export interface NotificationItemData {
  id: string;
  title: string;
  description: string;
  occurredAt?: string;
  unread?: boolean;
  icon?: ReactNode;
}

export function NotificationIndicator({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ui-notification-indicator" aria-label={`${count} notificações não lidas`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function NotificationPanel({
  items,
  onSelect,
  footer,
}: {
  items: readonly NotificationItemData[];
  onSelect?(item: NotificationItemData): void;
  footer?: ReactNode;
}) {
  return (
    <section className="ui-notification-panel" aria-label="Central de notificações">
      <header>
        <div>
          <span className="ui-section-label">Atualizações</span>
          <h2>Notificações</h2>
        </div>
        <Bell aria-hidden="true" />
      </header>
      {items.length === 0 ? (
        <div className="ui-notification-empty">
          <span aria-hidden="true"><Inbox /></span>
          <strong>Tudo em dia</strong>
          <p>Novas atividades importantes aparecerão aqui.</p>
        </div>
      ) : (
        <div className="ui-notification-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ui-notification-item"
              data-unread={item.unread || undefined}
              onClick={() => onSelect?.(item)}
            >
              <span className="ui-notification-item-icon" aria-hidden="true">
                {item.icon ?? <Bell />}
              </span>
              <span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
                {item.occurredAt && <time dateTime={item.occurredAt}>{item.occurredAt}</time>}
              </span>
            </button>
          ))}
        </div>
      )}
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

export function UserMenuSummary({
  name,
  subtitle,
  avatarSrc,
}: {
  name: string;
  subtitle?: string;
  avatarSrc?: string;
}) {
  return (
    <div className="ui-user-summary">
      <Avatar name={name} src={avatarSrc} size="md" status="online" />
      <span>
        <strong>{name}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
    </div>
  );
}
