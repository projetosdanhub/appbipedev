"use client";

import React from "react";

interface AnimatedBipeCheckProps {
  size?: number;
  className?: string;
}

export function AnimatedBipeCheck({ size = 22, className = "" }: AnimatedBipeCheckProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-gradient-to-tr from-[#007BFF] via-[#3B82F6] to-[#6366F1] shadow-[0_2px_10px_rgba(0,123,255,0.35)] transition-all duration-300 group-hover:scale-110 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Halo animado sutil da marca */}
      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] opacity-35 blur-[2px] animate-pulse" />
      
      {/* Ícone de checkmark geométrico ultra nítido */}
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 14 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 text-white stroke-white drop-shadow-xs"
      >
        <path
          d="M2 6.2L5.2 9.5L12 2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
