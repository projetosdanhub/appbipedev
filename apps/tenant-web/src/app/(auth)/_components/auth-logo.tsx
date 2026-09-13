"use client";

import { useState } from "react";
import Image from "next/image";

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
    <Image
      src="/logo-bip-bgt-white-vertical.webp"
      alt="BipeSend"
      width={150}
      height={52}
      priority
      style={{ width: "auto", height: "52px" }}
      className="object-contain"
      onError={() => setHasError(true)}
    />
  );
}
