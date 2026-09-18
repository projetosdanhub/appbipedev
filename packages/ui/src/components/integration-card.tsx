import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";
import { IntegrationStatusBadge } from "./feedback";

type IntegrationState =
  | "connected"
  | "degraded"
  | "disconnected"
  | "misconfigured"
  | "not_entitled"
  | "disabled"
  | "unknown";

export function IntegrationCard({
  name,
  provider,
  description,
  icon,
  state,
  badge,
  tags = [],
  features = [],
  action,
  className,
}: {
  name: string;
  provider: string;
  description: string;
  icon: ReactNode;
  state?: IntegrationState;
  badge?: ReactNode;
  tags?: readonly string[];
  features?: readonly string[];
  action?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("ui-integration-card ui-card", className)}>
      <div className="ui-integration-card-top">
        <span className="ui-integration-icon" aria-hidden="true">
          {icon}
        </span>
        {badge ?? (state && <IntegrationStatusBadge state={state} />)}
      </div>
      <div className="ui-integration-copy">
        <span className="ui-section-label">{provider}</span>
        <h2>{name}</h2>
        <p>{description}</p>
      </div>
      {tags.length > 0 && (
        <div className="ui-integration-tags" aria-label="Recursos da integração">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {features.length > 0 && (
        <ul className="ui-integration-features">
          {features.map((feature) => (
            <li key={feature}>
              <Check aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      {action && <div className="ui-integration-action">{action}</div>}
    </article>
  );
}
