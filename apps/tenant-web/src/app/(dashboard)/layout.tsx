"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Visão Geral", href: "/", icon: LayoutDashboard },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-50)] text-[var(--color-ink-900)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-ink-900)]/50 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface-0)] border-r border-[var(--color-border-200)] flex flex-col transition-transform duration-150 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center h-16 px-6 border-b border-[var(--color-border-200)]">
          <span className="text-[20px] font-semibold text-[var(--color-brand-600)]">
            BipeSend
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-surface-50)] text-[var(--color-brand-600)]"
                    : "text-[var(--color-ink-600)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-ink-900)]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-200)]">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-[8px] text-[14px] font-medium text-[var(--color-danger-600)] hover:bg-[var(--color-surface-50)] transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center h-16 px-4 bg-[var(--color-surface-0)] border-b border-[var(--color-border-200)] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)]"
          >
            <Menu className="w-[20px] h-[20px]" />
          </button>
          <span className="ml-4 text-[16px] font-semibold">Painel</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
