import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ui-page-header">
      <div>
        <h1 className="ui-page-title">{title}</h1>
        {description && <p className="ui-page-description">{description}</p>}
      </div>
      {actions && <div className="ui-filter-bar">{actions}</div>}
    </div>
  );
}
export const FilterBar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-filter-bar", className)} />
);
export const Toolbar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-toolbar", className)} />
);
export const PageContainer = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-page", className)} />
);
export const SkipLink = ({ target = "main-content" }: { target?: string }) => (
  <a className="ui-skip-link" href={`#${target}`}>
    Ir para o conteúdo
  </a>
);
export function Breadcrumb({
  items,
}: {
  items: readonly { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Caminho da página">
      <ol className="ui-filter-bar">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="ui-help">
            {i > 0 && <span aria-hidden="true">/ </span>}
            {item.href && i < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
