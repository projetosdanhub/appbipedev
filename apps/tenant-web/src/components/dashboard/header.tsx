"use client";

import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@bipesend/ui";

export function Header() {
  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-[var(--color-surface-0)] border-b border-[var(--color-border-200)] sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Busca opcional no desktop */}
        <div className="relative w-full max-w-md hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-400)]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full h-9 pl-9 pr-4 rounded-full bg-[var(--color-surface-50)] border-none text-[14px] text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:ring-2 focus:ring-[#1478FF]/30 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <button className="w-9 h-9 rounded-full relative flex items-center justify-center text-[var(--color-ink-600)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-ink-900)] transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
        </button>

        <div className="h-6 w-px bg-[var(--color-border-200)] mx-1" />

        {/* User Avatar */}
        <button className="flex items-center gap-2 pl-1 rounded-full hover:bg-[var(--color-surface-50)] transition-colors pr-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B132F4] to-[#575AF8] flex items-center justify-center text-white font-medium text-[13px] uppercase">
            JD
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-[13px] font-semibold text-[var(--color-ink-900)] leading-tight">John Doe</span>
            <span className="text-[11px] text-[var(--color-ink-500)] leading-tight">Administrador</span>
          </div>
        </button>
      </div>
    </header>
  );
}
