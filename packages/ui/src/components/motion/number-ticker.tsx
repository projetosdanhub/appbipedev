"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface NumberTickerProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 500,
  className,
  ...props
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Apple / Figma spring easing curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current =
        startValueRef.current + (value - startValueRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={cn("inline-block font-mono tracking-tight tabular-nums", className)}
      {...props}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
