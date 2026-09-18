import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleCheck,
  CircleAlert,
  CircleHelp,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/utils";

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "",
      success: "ui-badge-success",
      warning: "ui-badge-warning",
      danger: "ui-badge-danger",
      info: "ui-badge-info",
    },
  },
  defaultVariants: { variant: "default" },
});
export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span {...props} className={cn(badgeVariants({ variant }), className)} />
  );
}
export function StatusBadge({
  status,
  children,
}: {
  status: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
}) {
  const Icon =
    status === "success"
      ? CircleCheck
      : status === "default"
        ? CircleHelp
        : CircleAlert;
  return (
    <Badge variant={status}>
      <Icon className="ui-icon" aria-hidden="true" />
      {children}
    </Badge>
  );
}
const integrationStates = {
  connected: ["success", "Conectado"],
  degraded: ["warning", "Instável"],
  disconnected: ["danger", "Desconectado"],
  misconfigured: ["warning", "Revisar configuração"],
  not_entitled: ["default", "Indisponível no plano"],
  disabled: ["default", "Desativado"],
  unknown: ["default", "Não verificado"],
} as const;
export function IntegrationStatusBadge({
  state,
}: {
  state: keyof typeof integrationStates;
}) {
  const [status, text] = integrationStates[state];
  return <StatusBadge status={status}>{text}</StatusBadge>;
}
export function LastCheckedLabel({
  checkedAt,
  timeZone = "America/Sao_Paulo",
}: {
  checkedAt: string | null;
  timeZone?: string;
}) {
  if (!checkedAt || !Number.isFinite(Date.parse(checkedAt)))
    return <span className="ui-help">Ainda não verificado</span>;
  return (
    <span className="ui-help">
      Verificado em{" "}
      <time dateTime={checkedAt}>
        {new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone,
        }).format(new Date(checkedAt))}
      </time>
    </span>
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="ui-state">
      <span className="ui-state-icon" aria-hidden="true">
        {icon ?? <Inbox />}
      </span>
      <h2 className="ui-card-title">{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({
  title = "Não foi possível carregar",
  description = "Tente novamente em alguns instantes.",
  requestId,
  errorCode,
  onRetry,
  action,
}: {
  title?: string;
  description?: string;
  requestId?: string;
  errorCode?: string;
  onRetry?(): void;
  action?: React.ReactNode;
}) {
  return (
    <div role="alert">
      <EmptyState
        title={title}
        description={description}
        icon={<CircleAlert />}
        action={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            {onRetry && (
              <Button size="md" variant="outline" onClick={onRetry}>
                <RefreshCw aria-hidden="true" />
                Tentar novamente
              </Button>
            )}
            {action}
          </div>
        }
      />
      {requestId && (
        <p className="ui-help">
          Protocolo: {requestId}
          {errorCode && ` • Código: ${errorCode}`}
        </p>
      )}
    </div>
  );
}
export function MetricCard({
  label,
  value,
  description,
  icon,
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <article className="ui-card ui-metric" aria-busy={loading}>
      <div className="ui-metric-top">
        <h2 className="ui-metric-label">{label}</h2>
        <span className="ui-metric-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="ui-metric-value">
        {loading ? <span className="ui-help">Carregando…</span> : value}
      </div>
      {description && <p className="ui-metric-description">{description}</p>}
    </article>
  );
}
export function Progress({
  label,
  value,
  max = 100,
}: {
  label: string;
  value?: number;
  max?: number;
}) {
  return (
    <progress
      className="ui-progress"
      aria-label={label}
      value={
        value === undefined ? undefined : Math.max(0, Math.min(value, max))
      }
      max={max}
    />
  );
}
export function Avatar({
  name,
  src,
  size = "md",
  status,
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "away" | "offline";
}) {
  return (
    <span
      className="ui-avatar"
      data-size={size}
      data-status={status}
      role="img"
      aria-label={status ? `${name}, ${status === "online" ? "online" : status === "away" ? "ausente" : "offline"}` : name}
    >
      {src ? (
        <img src={src} alt="" width={40} height={40} />
      ) : (
        name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      )}
      {status && <span className="ui-avatar-status" aria-hidden="true" />}
    </span>
  );
}
export function BrandLogo({
  src = "/logo-bip-bgt-white-vertical.webp",
  width = 142,
}: {
  src?: string;
  width?: number;
}) {
  return (
    <span className="ui-logo">
      <img
        src={src}
        alt="BipeSend"
        width={width}
        height={Math.round((width * 328) / 1080)}
      />
    </span>
  );
}
