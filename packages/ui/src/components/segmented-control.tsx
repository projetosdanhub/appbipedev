"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  items,
  onValueChange,
  className,
}: {
  label: string;
  value: T;
  items: readonly SegmentedControlItem<T>[];
  onValueChange(value: T): void;
  className?: string;
}) {
  return (
    <div
      className={cn("ui-segmented", className)}
      role="group"
      aria-label={label}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className="ui-segmented-item"
          aria-pressed={value === item.value}
          aria-label={item.label}
          title={item.label}
          onClick={() => onValueChange(item.value)}
        >
          {item.icon}
          <span className="sr-only sm:not-sr-only">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
