import React from "react";

export interface CloudflareLogoProps {
  className?: string;
  size?: number;
}

export function CloudflareLogo({ className = "w-6 h-6", size = 24 }: CloudflareLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48 48" 
      width={size} 
      height={size} 
      className={className}
    >
      <defs>
        <linearGradient id="cfGradComponent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6821F" />
          <stop offset="100%" stopColor="#FAAD3F" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#cfGradComponent)" />
      <path fill="#ffffff" d="M33.2 18.2c-.6-3.2-3.4-5.6-6.7-5.6-2.3 0-4.4 1.2-5.6 3-.8-.5-1.8-.8-2.9-.8-3 0-5.4 2.3-5.7 5.2-4.1.7-7.3 4.3-7.3 8.6 0 4.8 3.9 8.6 8.7 8.6h20.7c4.3 0 7.7-3.5 7.7-7.7 0-4-3-7.2-6.9-7.6l-2-.7z"/>
      <path fill="#F6821F" opacity="0.3" d="M29.5 28.5h6.5c1.9 0 3.5-1.6 3.5-3.5 0-1.8-1.4-3.3-3.2-3.5l-1-.3-.3-1c-.3-1.8-1.9-3.2-3.8-3.2-1.3 0-2.5.7-3.1 1.7l-.6 1-.9-.7c-.5-.4-1.2-.6-1.8-.6-1.5 0-2.7 1.1-2.9 2.6l-.2 1.3-1.3.3c-2.1.5-3.7 2.4-3.7 4.7 0 2.6 2.1 4.7 4.7 4.7h8.2z"/>
    </svg>
  );
}
