"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export function FilterChip({
  selected = false,
  count,
  icon,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  count?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      className={cn("ui-filter-chip", className)}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {typeof count === "number" && (
        <span className="ui-filter-chip-count" aria-label={`${count} resultados`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function ActiveFilter({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove(): void;
}) {
  return (
    <span className="ui-active-filter">
      <span>
        <span className="sr-only">{label}: </span>
        {value}
      </span>
      <button type="button" onClick={onRemove} aria-label={`Remover filtro ${label}: ${value}`}>
        <X aria-hidden="true" />
      </button>
    </span>
  );
}
