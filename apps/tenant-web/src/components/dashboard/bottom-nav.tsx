"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  navigation: NavItem[];
}

export function BottomNav({ navigation }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-0)] border-t border-[var(--color-border-200)] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? "text-[var(--color-brand-600)]"
                  : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]"
              }`}
            >
              <item.icon className={`w-[20px] h-[20px] ${isActive ? "fill-[var(--color-brand-100)]" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
