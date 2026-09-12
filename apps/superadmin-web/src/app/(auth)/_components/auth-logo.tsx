"use client";

import { useState } from "react";

export function AuthLogo() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #007BFF 0%, #6366F1 100%)" }}>
          <span className="text-white font-bold text-lg leading-none">B</span>
        </div>
        <span className="text-[22px] font-bold tracking-tight text-[var(--color-ink-900)]">
          BipeSend
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/brand/bipesend-logo-horizontal.png"
      alt="BipeSend"
      className="h-9 w-auto object-contain"
      onError={() => setHasError(true)}
    />
  );
}
